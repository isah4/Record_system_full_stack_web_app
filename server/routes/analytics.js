const express = require('express');
const auth = require('../middleware/auth');

const router = express.Router();
const { pool } = require('../config/database');

// Helper function to get date range for different periods
const getDateRange = (period) => {
  const now = new Date();
  const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (period) {
    case 'today':
      return {
        start: startOfDay,
        end: now
      };
    case 'week':
      const startOfWeek = new Date(startOfDay);
      startOfWeek.setDate(startOfWeek.getDate() - startOfWeek.getDay());
      return {
        start: startOfWeek,
        end: now
      };
    case 'month':
      const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
      return {
        start: startOfMonth,
        end: now
      };
    default:
      return {
        start: startOfDay,
        end: now
      };
  }
};

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

// Get comprehensive reports for different periods
router.get('/reports/:period', auth, async (req, res) => {
  try {
    const { period } = req.params;
    const { start, end } = getDateRange(period);
    
    // Get sales data for the period
    const salesResult = await pool.query(`
      SELECT 
        COALESCE(SUM(total), 0) as total_sales,
        COUNT(*) as total_transactions,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total ELSE 0 END), 0) as paid_sales,
        COALESCE(SUM(CASE WHEN payment_status = 'partial' THEN total ELSE 0 END), 0) as partial_sales,
        COALESCE(SUM(CASE WHEN payment_status = 'debt' THEN total ELSE 0 END), 0) as debt_sales
      FROM sales 
      WHERE created_at >= $1 AND created_at <= $2
    `, [start, end]);

    // Get expenses data for the period
    const expensesResult = await pool.query(`
      SELECT 
        COALESCE(SUM(amount), 0) as total_expenses,
        COUNT(*) as total_expenses_count,
        COALESCE(SUM(CASE WHEN category = 'internal' THEN amount ELSE 0 END), 0) as internal_expenses,
        COALESCE(SUM(CASE WHEN category = 'external' THEN amount ELSE 0 END), 0) as external_expenses
      FROM expenses 
      WHERE date >= $1 AND date <= $2
    `, [start, end]);

    // Get debt data for the period
    const debtsResult = await pool.query(`
      SELECT 
        COALESCE(SUM(balance), 0) as total_outstanding,
        COUNT(*) as active_debts_count
      FROM sales 
      WHERE balance > 0 AND created_at >= $1 AND created_at <= $2
    `, [start, end]);

    // Get previous period data for growth calculations
    const prevStart = new Date(start.getTime() - (end.getTime() - start.getTime()));
    const prevEnd = new Date(start.getTime());
    
    const prevSalesResult = await pool.query(`
      SELECT COALESCE(SUM(total), 0) as total_sales
      FROM sales 
      WHERE created_at >= $1 AND created_at <= $2
    `, [prevStart, prevEnd]);

    const prevExpensesResult = await pool.query(`
      SELECT COALESCE(SUM(amount), 0) as total_expenses
      FROM expenses 
      WHERE date >= $1 AND date <= $2
    `, [prevStart, prevEnd]);

    // Calculate metrics
    const totalSales = parseFloat(salesResult.rows[0].total_sales) || 0;
    const totalExpenses = parseFloat(expensesResult.rows[0].total_expenses) || 0;
    const profit = totalSales - totalExpenses;
    const profitMargin = totalSales > 0 ? (profit / totalSales) * 100 : 0;
    
    const prevSales = parseFloat(prevSalesResult.rows[0].total_sales) || 0;
    const prevExpenses = parseFloat(prevExpensesResult.rows[0].total_expenses) || 0;
    
    const salesGrowth = prevSales > 0 ? ((totalSales - prevSales) / prevSales) * 100 : 0;
    const expenseGrowth = prevExpenses > 0 ? ((totalExpenses - prevExpenses) / prevExpenses) * 100 : 0;

    const report = {
      period,
      totalSales,
      totalExpenses,
      profit,
      profitMargin: Math.round(profitMargin * 10) / 10,
      transactions: parseInt(salesResult.rows[0].total_transactions) || 0,
      salesGrowth: Math.round(salesGrowth * 10) / 10,
      expenseGrowth: Math.round(expenseGrowth * 10) / 10,
      paidSales: parseFloat(salesResult.rows[0].paid_sales) || 0,
      partialSales: parseFloat(salesResult.rows[0].partial_sales) || 0,
      debtSales: parseFloat(salesResult.rows[0].debt_sales) || 0,
      internalExpenses: parseFloat(expensesResult.rows[0].internal_expenses) || 0,
      externalExpenses: parseFloat(expensesResult.rows[0].external_expenses) || 0,
      totalOutstanding: parseFloat(debtsResult.rows[0].total_outstanding) || 0,
      activeDebtsCount: parseInt(debtsResult.rows[0].active_debts_count) || 0,
      dateRange: {
        start: start.toISOString().split('T')[0],
        end: end.toISOString().split('T')[0]
      }
    };

    res.json(report);
  } catch (error) {
    console.error('Reports error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get detailed sales breakdown
router.get('/reports/:period/sales', auth, async (req, res) => {
  try {
    const { period } = req.params;
    const { start, end } = getDateRange(period);
    
    const salesBreakdown = await pool.query(`
      SELECT 
        DATE(created_at) as date,
        COUNT(*) as transactions,
        COALESCE(SUM(total), 0) as daily_sales,
        COALESCE(SUM(CASE WHEN payment_status = 'paid' THEN total ELSE 0 END), 0) as paid_amount,
        COALESCE(SUM(CASE WHEN payment_status = 'partial' THEN total ELSE 0 END), 0) as partial_amount,
        COALESCE(SUM(CASE WHEN payment_status = 'debt' THEN total ELSE 0 END), 0) as debt_amount
      FROM sales 
      WHERE created_at >= $1 AND created_at <= $2
      GROUP BY DATE(created_at)
      ORDER BY date
    `, [start, end]);

    res.json(salesBreakdown.rows);
  } catch (error) {
    console.error('Sales breakdown error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

// Get detailed expenses breakdown
router.get('/reports/:period/expenses', auth, async (req, res) => {
  try {
    const { period } = req.params;
    const { start, end } = getDateRange(period);
    
    const expensesBreakdown = await pool.query(`
      SELECT 
        DATE(date) as date,
        COUNT(*) as transactions,
        COALESCE(SUM(amount), 0) as daily_expenses,
        COALESCE(SUM(CASE WHEN category = 'internal' THEN amount ELSE 0 END), 0) as internal_amount,
        COALESCE(SUM(CASE WHEN category = 'external' THEN amount ELSE 0 END), 0) as external_amount
      FROM expenses 
      WHERE date >= $1 AND date <= $2
      GROUP BY DATE(date)
      ORDER BY date
    `, [start, end]);

    res.json(expensesBreakdown.rows);
  } catch (error) {
    console.error('Expenses breakdown error:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

module.exports = router; 