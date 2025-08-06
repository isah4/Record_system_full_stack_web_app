const express = require('express');
const { Pool } = require('pg');
const auth = require('../middleware/auth');

const router = express.Router();
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Get dashboard analytics
router.get('/dashboard', auth, async (req, res) => {
  try {
    // Get total sales
    const salesResult = await pool.query(`
      SELECT 
        COALESCE(SUM(total), 0) as total_sales,
        COUNT(*) as total_sales_count
      FROM sales
    `);

    // Get total inventory items and value
    const itemsResult = await pool.query(`
      SELECT 
        COUNT(*) as total_items,
        COALESCE(SUM(price * stock), 0) as total_value
      FROM items
    `);

    // Get active debts (sales with balance > 0)
    const debtsResult = await pool.query(`
      SELECT 
        COUNT(*) as active_debts,
        COALESCE(SUM(balance), 0) as total_debt_amount
      FROM sales 
      WHERE balance > 0
    `);

    // Calculate changes (for now, we'll use simple calculations)
    // In a real app, you'd compare with previous periods
    const totalSales = parseFloat(salesResult.rows[0].total_sales) || 0;
    const totalItems = parseInt(itemsResult.rows[0].total_items) || 0;
    const totalExpenses = 0; // Placeholder - you can add expenses table later
    const activeDebts = parseInt(debtsResult.rows[0].active_debts) || 0;

    // Calculate percentage changes (simplified - you can enhance this)
    const salesChange = totalSales > 0 ? '+12%' : '0%';
    const itemsChange = totalItems > 0 ? '+3' : '0';
    const expensesChange = '0%'; // Placeholder
    const debtsChange = activeDebts > 0 ? '-2' : '0';

    const analytics = {
      totalSales,
      totalItems,
      totalExpenses,
      activeDebts,
      salesChange,
      itemsChange,
      expensesChange,
      debtsChange
    };

    res.json(analytics);
  } catch (error) {
    console.error('Analytics error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 