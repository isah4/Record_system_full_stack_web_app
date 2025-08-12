const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { pool } = require("../config/database");

// Get all debts with customer and sale details
router.get("/", auth, async (req, res) => {
  try {
    const debts = await pool.query(`
      SELECT 
        d.id,
        d.sale_id,
        d.amount,
        d.repaid_amount,
        d.created_at,
        s.buyer_name,
        s.total as original_amount,
        s.balance,
        s.payment_status,
        s.created_at as sale_date,
        array_agg(
          json_build_object(
            'item_name', i.name,
            'quantity', si.quantity,
            'subtotal', si.subtotal
          )
        ) as items
      FROM debts d
      JOIN sales s ON d.sale_id = s.id
      JOIN sale_items si ON s.id = si.sale_id
      JOIN items i ON si.item_id = i.id
      WHERE d.amount > d.repaid_amount
      GROUP BY d.id, s.id
      ORDER BY d.created_at DESC
    `);

    // Format the response
    const formattedDebts = debts.rows.map(debt => {
      const outstandingBalance = parseFloat(debt.amount) - parseFloat(debt.repaid_amount);
      return {
        id: debt.id,
        customer: debt.buyer_name,
        originalAmount: parseFloat(debt.original_amount),
        paidAmount: parseFloat(debt.repaid_amount),
        balance: outstandingBalance,
        dueDate: new Date(debt.sale_date).toISOString().split('T')[0], // Use sale date as due date
        status: outstandingBalance > 0 ? (new Date(debt.sale_date) < new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) ? 'overdue' : 'current') : 'paid',
        lastPayment: debt.repaid_amount > 0 ? new Date(debt.created_at).toISOString().split('T')[0] : null,
        saleDate: new Date(debt.sale_date).toISOString().split('T')[0],
        items: debt.items.map(item => `${item.item_name} (${item.quantity})`).join(', '),
        phone: '+234 XXX XXX XXXX', // Placeholder - could be added to sales table later
        debtId: debt.id
      };
    });

    // Debug logging
    console.log('Raw debts from DB:', debts.rows);
    console.log('Formatted debts:', formattedDebts);

    res.json(formattedDebts);
  } catch (error) {
    console.error("Get debts error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Record debt repayment
router.post("/:id/repayment", auth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { id } = req.params;
    const { amount, description } = req.body;

    if (!amount || amount <= 0) {
      return res.status(400).json({ error: "Valid repayment amount is required" });
    }

    await client.query("BEGIN");

    // Get current debt details
    const debtResult = await client.query(
      "SELECT * FROM debts WHERE id = $1",
      [id]
    );

    if (debtResult.rows.length === 0) {
      await client.query("ROLLBACK");
      return res.status(404).json({ error: "Debt not found" });
    }

    const debt = debtResult.rows[0];
    const newRepaidAmount = parseFloat(debt.repaid_amount) + parseFloat(amount);

    // Calculate new balance first
    const newBalance = Math.max(0, parseFloat(debt.amount) - newRepaidAmount);
    
    // Record this repayment in payment history
    const paymentType = newBalance === 0 ? 'full_settlement' : 'debt_repayment';
    const paymentDescription = newBalance === 0 ? 'Final payment - debt fully settled' : `Debt repayment - remaining balance: ₦${newBalance}`;
    
    await client.query(
      `INSERT INTO payment_history (sale_id, payment_type, amount, description, created_by)
       VALUES ($1, $2, $3, $4, $5)`,
      [debt.sale_id, paymentType, amount, paymentDescription, req.user.userId]
    );

    // Update debt record
    await client.query(
      "UPDATE debts SET repaid_amount = $1 WHERE id = $2",
      [newRepaidAmount, id]
    );

    // Update sale balance
    await client.query(
      "UPDATE sales SET balance = $1, payment_status = $2 WHERE id = $3",
      [newBalance, newBalance === 0 ? 'paid' : 'partial', debt.sale_id]
    );

    // If fully paid, update payment status
    if (newBalance === 0) {
      await client.query(
        "UPDATE sales SET payment_status = 'paid' WHERE id = $1",
        [debt.sale_id]
      );
    }

    await client.query("COMMIT");

    res.json({ 
      message: "Repayment recorded successfully",
      newBalance,
      totalRepaid: newRepaidAmount,
      isFullyPaid: newBalance === 0
    });

  } catch (error) {
    await client.query("ROLLBACK");
    console.error("Record repayment error:", error);
    res.status(500).json({ error: "Internal server error" });
  } finally {
    client.release();
  }
});

// Get debt by ID with full details
router.get("/:id", auth, async (req, res) => {
  try {
    const { id } = req.params;

    const debt = await pool.query(`
      SELECT 
        d.*,
        s.buyer_name,
        s.total as original_amount,
        s.balance,
        s.payment_status,
        s.created_at as sale_date
      FROM debts d
      JOIN sales s ON d.sale_id = s.id
      WHERE d.id = $1
    `, [id]);

    if (debt.rows.length === 0) {
      return res.status(404).json({ error: "Debt not found" });
    }

    res.json(debt.rows[0]);
  } catch (error) {
    console.error("Get debt error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
