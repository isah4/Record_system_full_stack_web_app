const express = require("express");
const { Pool } = require("pg");
const auth = require("../middleware/auth");

const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl:
    process.env.NODE_ENV === "production"
      ? { rejectUnauthorized: false }
      : false,
});

// Get all sales for a user
router.get("/", auth, async (req, res) => {
  try {
    const sales = await pool.query(`
      SELECT s.*, 
        array_agg(json_build_object(
          'item_id', si.item_id,
          'quantity', si.quantity,
          'price_at_sale', si.price_at_sale,
          'subtotal', si.subtotal,
          'item_name', i.name
        )) as items
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      JOIN items i ON si.item_id = i.id
      GROUP BY s.id
      ORDER BY s.created_at DESC
    `);

    res.json(sales.rows);
  } catch (error) {
    console.error("Get sales error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Create a new sale
router.post("/", auth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { buyer_name, items, payment_status, total, balance } = req.body;

    // Validate input
    if (
      !buyer_name ||
      !items ||
      !Array.isArray(items) ||
      items.length === 0 ||
      !payment_status
    ) {
      return res.status(400).json({ error: "Missing required fields" });
    }

    await client.query("BEGIN");

    // Create the main sale record
    const newSale = await client.query(
      `
      INSERT INTO sales (buyer_name, total, payment_status, balance)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [buyer_name, total, payment_status, balance || 0]
    );

    // Process each item
    for (const item of items) {
      // Get item details
      const itemDetails = await client.query(
        "SELECT * FROM items WHERE id = $1",
        [item.item_id]
      );
      if (itemDetails.rows.length === 0) {
        throw new Error(`Item with ID ${item.item_id} not found`);
      }

      // Check stock availability
      if (itemDetails.rows[0].stock < item.quantity) {
        throw new Error(
          `Insufficient stock for item ${itemDetails.rows[0].name}`
        );
      }

      // Calculate subtotal
      const subtotal = itemDetails.rows[0].price * item.quantity;

      // Create sale item record
      await client.query(
        `
        INSERT INTO sale_items (sale_id, item_id, quantity, price_at_sale, subtotal)
        VALUES ($1, $2, $3, $4, $5)
      `,
        [
          newSale.rows[0].id,
          item.item_id,
          item.quantity,
          itemDetails.rows[0].price,
          subtotal,
        ]
      );

      // Update stock
      await client.query("UPDATE items SET stock = stock - $1 WHERE id = $2", [
        item.quantity,
        item.item_id,
      ]);
    }

    // If there's a balance (partial payment or debt), create debt record
    if (balance && balance > 0) {
      await client.query(
        `
        INSERT INTO debts (sale_id, amount, repaid_amount)
        VALUES ($1, $2, $3)
      `,
        [newSale.rows[0].id, balance, total - balance]
      );
    }

    await client.query("COMMIT");

    // Fetch the complete sale with items
    const completeSale = await client.query(
      `
      SELECT s.*, array_agg(json_build_object(
        'item_id', si.item_id,
        'quantity', si.quantity,
        'price_at_sale', si.price_at_sale,
        'subtotal', si.subtotal,
        'item_name', i.name
      )) as items
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      JOIN items i ON si.item_id = i.id
      WHERE s.id = $1
      GROUP BY s.id
    `,
      [newSale.rows[0].id]
    );

    res.status(201).json(completeSale.rows[0]);
  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Create sale error:", error);
    res.status(500).json({ error: error.message || "Internal server error" });
  } finally {
    client.release();
  }
});

// Get sale by ID
router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const sale = await pool.query(
      `
      SELECT s.*, i.name as item_name, i.price as item_price
      FROM sales s
      LEFT JOIN items i ON s.item_id = i.id
      WHERE s.id = $1
    `,
      [id]
    );

    if (sale.rows.length === 0) {
      return res.status(404).json({ error: "Sale not found" });
    }

    res.json(sale.rows[0]);
  } catch (error) {
    console.error("Get sale error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Update sale payment status
router.patch("/:id/payment", auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, balance } = req.body;

    if (!payment_status) {
      return res.status(400).json({ error: "Payment status is required" });
    }

    const updatedSale = await pool.query(
      `
      UPDATE sales 
      SET payment_status = $1, balance = $2
      WHERE id = $3
      RETURNING *
    `,
      [payment_status, balance || 0, id]
    );

    if (updatedSale.rows.length === 0) {
      return res.status(404).json({ error: "Sale not found" });
    }

    res.json(updatedSale.rows[0]);
  } catch (error) {
    console.error("Update sale payment error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
