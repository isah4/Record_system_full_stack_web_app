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
        d.customer_id,
        d.created_at,
        s.buyer_name,
        s.customer_id AS sale_customer_id,
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
      WHERE (d.amount - d.repaid_amount) > 0
      GROUP BY d.id, s.id
      ORDER BY d.created_at DESC
    `);

    // Format the response
    const formattedDebts = debts.rows.map(debt => {
      const outstandingBalance = parseFloat(debt.amount) - parseFloat(debt.repaid_amount);
      return {
        id: debt.id,
        customer: debt.buyer_name,
        customer_id: debt.customer_id || debt.sale_customer_id || null,
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

// Aggregated debts by customer
router.get('/customers/summary', auth, async (req, res) => {
  try {
    const result = await pool.query(`
      SELECT 
        COALESCE(d.customer_id, s.customer_id) AS customer_id,
        COALESCE(MAX(c.name), MAX(s.buyer_name)) AS customer_name,
        SUM(d.amount) AS total_debt,
        SUM(d.repaid_amount) AS total_repaid,
        SUM(d.amount - d.repaid_amount) AS outstanding,
        MAX(s.created_at) AS last_activity
      FROM debts d
      JOIN sales s ON d.sale_id = s.id
      LEFT JOIN customers c ON c.id = d.customer_id
      GROUP BY COALESCE(d.customer_id, s.customer_id)
      HAVING SUM(d.amount - d.repaid_amount) > 0
      ORDER BY outstanding DESC
    `);
    res.json(result.rows);
  } catch (error) {
    console.error('Customer summary error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// FIFO allocate a payment across a customer's open debts
router.post('/customers/:customerId/payments', auth, async (req, res) => {
  const client = await pool.connect();
  try {
    const { customerId } = req.params;
    const { amount, description } = req.body;
    if (!amount || amount <= 0) return res.status(400).json({ error: 'Valid amount is required' });

    // Validate customer
    const customer = await client.query('SELECT id FROM customers WHERE id = $1 AND is_deleted = FALSE', [customerId]);
    if (customer.rows.length === 0) return res.status(404).json({ error: 'Customer not found' });

    await client.query('BEGIN');

    // Fetch open debts for this customer ordered by oldest sale date
    const debts = await client.query(`
      SELECT d.id, d.sale_id, d.amount, d.repaid_amount, s.created_at
      FROM debts d
      JOIN sales s ON s.id = d.sale_id
      WHERE COALESCE(d.customer_id, s.customer_id) = $1 AND (d.amount - d.repaid_amount) > 0
      ORDER BY s.created_at ASC, d.id ASC
    `, [customerId]);

    let remaining = parseFloat(amount);
    const allocations = [];

    for (const row of debts.rows) {
      if (remaining <= 0) break;
      const open = parseFloat(row.amount) - parseFloat(row.repaid_amount);
      const pay = Math.min(open, remaining);

      // Update debt
      await client.query('UPDATE debts SET repaid_amount = repaid_amount + $1 WHERE id = $2', [pay, row.id]);

      // Update sale balance and status
      const newBalance = open - pay;
      await client.query(
        'UPDATE sales SET balance = $1, payment_status = $2 WHERE id = $3',
        [newBalance, newBalance === 0 ? 'paid' : 'partial', row.sale_id]
      );

      // Log payment history
      await client.query(
        `INSERT INTO payment_history (sale_id, payment_type, amount, description, created_by, customer_id)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [row.sale_id, newBalance === 0 ? 'full_settlement' : 'debt_repayment', pay, description || 'Customer payment allocation', req.user.userId, customerId]
      );

      allocations.push({ debt_id: row.id, sale_id: row.sale_id, allocated: pay, remaining_after: remaining - pay });
      remaining -= pay;
    }

    await client.query('COMMIT');

    res.json({
      customer_id: Number(customerId),
      paid: parseFloat(amount) - remaining,
      unallocated: remaining,
      allocations
    });
  } catch (error) {
    await client.query('ROLLBACK');
    console.error('Customer payment allocation error:', error);
    res.status(500).json({ error: 'Internal server error' });
  } finally {
    client.release();
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

    // Ensure debt has customer_id; if missing, try to backfill from sale
    let customerIdForPayment = debt.customer_id;
    if (!customerIdForPayment) {
      const saleRow = await client.query('SELECT customer_id FROM sales WHERE id = $1', [debt.sale_id]);
      const saleCustomerId = saleRow.rows[0]?.customer_id || null;
      if (saleCustomerId) {
        await client.query('UPDATE debts SET customer_id = $1 WHERE id = $2', [saleCustomerId, id]);
        customerIdForPayment = saleCustomerId;
      }
    }

    const newRepaidAmount = parseFloat(debt.repaid_amount) + parseFloat(amount);

    // Calculate new balance: remaining amount = original debt - total repaid
    const newBalance = Math.max(0, parseFloat(debt.amount) - newRepaidAmount);
    
    // Record this repayment in payment history
    const paymentType = newBalance === 0 ? 'full_settlement' : 'debt_repayment';
    const paymentDescription = description || (newBalance === 0 ? 'Final payment - debt fully settled' : `Debt repayment - remaining balance: ₦${newBalance}`);
    
    await client.query(
      `INSERT INTO payment_history (sale_id, payment_type, amount, description, created_by, customer_id)
       VALUES ($1, $2, $3, $4, $5, $6)`,
      [debt.sale_id, paymentType, amount, paymentDescription, req.user.userId, customerIdForPayment]
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

    // Get buyer_name from sales
    const saleResult = await client.query(
      "SELECT buyer_name FROM sales WHERE id = $1",
      [debt.sale_id]
    );
    const buyerName = saleResult.rows.length > 0 ? saleResult.rows[0].buyer_name : null;

    // Log debt repayment activity in activity_log
    await client.query(
      `INSERT INTO activity_log (activity_type, reference_id, description, amount, status, activity_date, details, created_by)
       VALUES ($1, $2, $3, $4, $5, NOW(), $6, $7)`,
      [
        'debt_repayment',
        id,
        paymentDescription,
        amount,
        paymentType,
        JSON.stringify({ sale_id: debt.sale_id, newBalance, totalRepaid: newRepaidAmount, buyer_name: buyerName, customer_id: customerIdForPayment }),
        req.user.userId
      ]
    );

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
        s.customer_id AS sale_customer_id,
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

    const row = debt.rows[0];
    res.json({
      id: row.id,
      sale_id: row.sale_id,
      amount: row.amount,
      repaid_amount: row.repaid_amount,
      customer_id: row.customer_id || row.sale_customer_id || null,
      buyer_name: row.buyer_name,
      original_amount: row.original_amount,
      balance: row.balance,
      payment_status: row.payment_status,
      sale_date: row.sale_date
    });
  } catch (error) {
    console.error("Get debt error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
