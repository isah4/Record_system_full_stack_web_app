const express = require("express");
const auth = require("../middleware/auth");

const router = express.Router();
const { pool } = require("../config/database");

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
    
    console.log('Sale creation request:', {
      buyer_name,
      payment_status,
      total,
      balance,
      items_count: items?.length
    });

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
    // Calculate the correct balance based on payment status
    let finalBalance = 0;
    if (payment_status === 'debt') {
      finalBalance = total; // For debt sales, balance should be the full amount
    } else if (payment_status === 'partial') {
      finalBalance = balance || 0; // For partial payments, use the provided balance (amount remaining)
    } else if (payment_status === 'paid') {
      finalBalance = 0; // For paid sales, no balance
    }
    
    console.log('Balance calculation:', {
      payment_status,
      total,
      balance_received: balance,
      finalBalance_calculated: finalBalance
    });

    const newSale = await client.query(
      `
      INSERT INTO sales (buyer_name, total, payment_status, balance)
      VALUES ($1, $2, $3, $4)
      RETURNING *
    `,
      [buyer_name, total, payment_status, finalBalance]
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

    // Record payment history based on payment status
    if (payment_status === 'paid') {
      // Record full payment
      await client.query(
        `INSERT INTO payment_history (sale_id, payment_type, amount, description, created_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [newSale.rows[0].id, 'full_settlement', total, 'Full payment on sale creation', req.user.userId]
      );
      console.log('Full payment recorded in payment history');
    } else if (payment_status === 'partial') {
      // Record initial partial payment
      const initialPayment = total - finalBalance;
      await client.query(
        `INSERT INTO payment_history (sale_id, payment_type, amount, description, created_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [newSale.rows[0].id, 'initial', initialPayment, 'Initial partial payment', req.user.userId]
      );
      console.log('Initial partial payment recorded in payment history');
    } else if (payment_status === 'debt') {
      // Record debt sale (no initial payment)
      await client.query(
        `INSERT INTO payment_history (sale_id, payment_type, amount, description, created_by)
         VALUES ($1, $2, $3, $4, $5)`,
        [newSale.rows[0].id, 'initial', 0, 'Debt sale - no initial payment', req.user.userId]
      );
      console.log('Debt sale recorded in payment history');
    }

    // Create debt record for any sale with outstanding balance
    if (finalBalance > 0) {
      const repaidAmount = total - finalBalance;
      
      console.log('Creating debt record:', {
        sale_id: newSale.rows[0].id,
        total: total,
        finalBalance: finalBalance,
        repaidAmount: repaidAmount,
        payment_status: payment_status
      });
      
      // Check if debt already exists for this sale
      const existingDebt = await client.query(
        "SELECT id FROM debts WHERE sale_id = $1",
        [newSale.rows[0].id]
      );
      
      if (existingDebt.rows.length === 0) {
        // Only insert if no debt exists
        // amount = total original debt amount, repaid_amount = total amount paid so far
      await client.query(
        `
        INSERT INTO debts (sale_id, amount, repaid_amount)
        VALUES ($1, $2, $3)
      `,
          [newSale.rows[0].id, total, repaidAmount]
        );
        console.log('Debt record created successfully');
      } else {
        // Update existing debt record
        await client.query(
          `
          UPDATE debts 
          SET amount = $1, repaid_amount = $2 
          WHERE sale_id = $3
        `,
          [total, repaidAmount, newSale.rows[0].id]
        );
        console.log('Debt record updated successfully');
      }
    } else {
      console.log('No debt record needed - sale is fully paid');
    }

    await client.query("COMMIT");

    // Log sale activity in activity_log
    await client.query(
      `INSERT INTO activity_log (activity_type, reference_id, description, amount, status, activity_date, details, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)`,
      [
        'sale',
        newSale.rows[0].id,
        buyer_name,
        total,
        payment_status,
        newSale.rows[0].created_at,
        JSON.stringify({ items, balance: finalBalance }),
        req.user.userId
      ]
    );

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

// Get payment history for a sale
router.get("/:id/payment-history", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const paymentHistory = await pool.query(
      `
      SELECT 
        ph.id,
        ph.payment_type,
        ph.amount,
        ph.description,
        ph.payment_date,
        ph.created_at
      FROM payment_history ph
      WHERE ph.sale_id = $1
      ORDER BY ph.payment_date ASC
      `,
      [id]
    );

    res.json(paymentHistory.rows);
  } catch (error) {
    console.error("Get payment history error:", error);
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
