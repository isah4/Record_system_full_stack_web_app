const express = require('express');
const { Pool } = require('pg');
const auth = require('../middleware/auth');

const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Get all sales for a user
router.get('/', auth, async (req, res) => {
  try {
    const sales = await pool.query(`
      SELECT s.*, i.name as item_name, i.price as item_price
      FROM sales s
      LEFT JOIN items i ON s.item_id = i.id
      ORDER BY s.created_at DESC
    `);

    res.json(sales.rows);
  } catch (error) {
    console.error('Get sales error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Create a new sale
router.post('/', auth, async (req, res) => {
  try {
    const { buyer_name, item_id, quantity, payment_status, balance } = req.body;

    // Validate input
    if (!buyer_name || !item_id || !quantity || !payment_status) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    // Get item details
    const item = await pool.query('SELECT * FROM items WHERE id = $1', [item_id]);
    if (item.rows.length === 0) {
      return res.status(404).json({ error: 'Item not found' });
    }

    // Check stock availability
    if (item.rows[0].stock < quantity) {
      return res.status(400).json({ error: 'Insufficient stock' });
    }

    // Calculate total
    const total = item.rows[0].price * quantity;

    // Create sale
    const newSale = await pool.query(`
      INSERT INTO sales (buyer_name, item_id, quantity, total, payment_status, balance)
      VALUES ($1, $2, $3, $4, $5, $6)
      RETURNING *
    `, [buyer_name, item_id, quantity, total, payment_status, balance || 0]);

    // Update stock
    await pool.query(
      'UPDATE items SET stock = stock - $1 WHERE id = $2',
      [quantity, item_id]
    );

    // If there's a balance (partial payment or debt), create debt record
    if (balance && balance > 0) {
      await pool.query(`
        INSERT INTO debts (sale_id, amount, repaid_amount)
        VALUES ($1, $2, $3)
      `, [newSale.rows[0].id, balance, total - balance]);
    }

    res.status(201).json(newSale.rows[0]);
  } catch (error) {
    console.error('Create sale error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get sale by ID
router.get('/:id', auth, async (req, res) => {
  try {
    const { id } = req.params;
    
    const sale = await pool.query(`
      SELECT s.*, i.name as item_name, i.price as item_price
      FROM sales s
      LEFT JOIN items i ON s.item_id = i.id
      WHERE s.id = $1
    `, [id]);

    if (sale.rows.length === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.json(sale.rows[0]);
  } catch (error) {
    console.error('Get sale error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Update sale payment status
router.patch('/:id/payment', auth, async (req, res) => {
  try {
    const { id } = req.params;
    const { payment_status, balance } = req.body;

    if (!payment_status) {
      return res.status(400).json({ error: 'Payment status is required' });
    }

    const updatedSale = await pool.query(`
      UPDATE sales 
      SET payment_status = $1, balance = $2
      WHERE id = $3
      RETURNING *
    `, [payment_status, balance || 0, id]);

    if (updatedSale.rows.length === 0) {
      return res.status(404).json({ error: 'Sale not found' });
    }

    res.json(updatedSale.rows[0]);
  } catch (error) {
    console.error('Update sale payment error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 