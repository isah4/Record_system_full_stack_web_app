const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { pool } = require("../config/database");

// Get comprehensive activity log with all business activities
router.get("/", auth, async (req, res) => {
  try {
    const { date, limit = 50 } = req.query;
    
    let query;
    let queryParams;
    
    if (date) {
      // When date is specified, filter each table separately
      query = `
        SELECT * FROM (
          -- Sales activities
          SELECT 
            'sale' as activity_type,
            s.id as reference_id,
            s.buyer_name as description,
            s.total as amount,
            s.payment_status as status,
            s.created_at as activity_date,
            json_build_object(
              'customer', s.buyer_name,
              'total', s.total,
              'payment_status', s.payment_status,
              'balance', s.balance
            ) as details
          FROM sales s
          WHERE DATE(s.created_at) = $1
          
          UNION ALL
          
          -- Payment history activities  
          SELECT 
            'payment' as activity_type,
            ph.id as reference_id,
            CASE 
              WHEN ph.payment_type = 'initial' THEN 'Initial payment received'
              WHEN ph.payment_type = 'debt_repayment' THEN 'Debt payment received'
              WHEN ph.payment_type = 'full_settlement' THEN 'Debt fully settled'
              ELSE 'Payment received'
            END as description,
            ph.amount,
            ph.payment_type as status,
            ph.payment_date as activity_date,
            json_build_object(
              'sale_id', ph.sale_id,
              'payment_type', ph.payment_type,
              'amount', ph.amount,
              'description', ph.description
            ) as details
          FROM payment_history ph
          WHERE DATE(ph.payment_date) = $1
          
          UNION ALL
          
          -- Expense activities
          SELECT 
            'expense' as activity_type,
            e.id as reference_id,
            e.description,
            e.amount,
            CAST(e.category as VARCHAR) as status,
            e.date as activity_date,
            json_build_object(
              'category', e.category,
              'amount', e.amount,
              'description', e.description,
              'subcategory', e.subcategory
            ) as details
          FROM expenses e
          WHERE DATE(e.date) = $1
        ) combined_activities
        ORDER BY activity_date DESC
        LIMIT $2
      `;
      queryParams = [date, limit];
    } else {
      // When no date filter, get all recent activities
      query = `
        SELECT * FROM (
          -- Sales activities
          SELECT 
            'sale' as activity_type,
            s.id as reference_id,
            s.buyer_name as description,
            s.total as amount,
            s.payment_status as status,
            s.created_at as activity_date,
            json_build_object(
              'customer', s.buyer_name,
              'total', s.total,
              'payment_status', s.payment_status,
              'balance', s.balance
            ) as details
          FROM sales s
          
          UNION ALL
          
          -- Payment history activities  
          SELECT 
            'payment' as activity_type,
            ph.id as reference_id,
            CASE 
              WHEN ph.payment_type = 'initial' THEN 'Initial payment received'
              WHEN ph.payment_type = 'debt_repayment' THEN 'Debt payment received'
              WHEN ph.payment_type = 'full_settlement' THEN 'Debt fully settled'
              ELSE 'Payment received'
            END as description,
            ph.amount,
            ph.payment_type as status,
            ph.payment_date as activity_date,
            json_build_object(
              'sale_id', ph.sale_id,
              'payment_type', ph.payment_type,
              'amount', ph.amount,
              'description', ph.description
            ) as details
          FROM payment_history ph
          
          UNION ALL
          
          -- Expense activities
          SELECT 
            'expense' as activity_type,
            e.id as reference_id,
            e.description,
            e.amount,
            CAST(e.category as VARCHAR) as status,
            e.date as activity_date,
            json_build_object(
              'category', e.category,
              'amount', e.amount,
              'description', e.description,
              'subcategory', e.subcategory
            ) as details
          FROM expenses e
        ) combined_activities
        ORDER BY activity_date DESC
        LIMIT $1
      `;
      queryParams = [limit];
    }
    
    const activities = await pool.query(query, queryParams);

    res.json(activities.rows);
  } catch (error) {
    console.error("Get activities error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get profit analysis for a date range
router.get("/profit-analysis", auth, async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    let dateFilter = "";
    let queryParams = [];
    
    if (startDate && endDate) {
      dateFilter = "WHERE DATE(s.created_at) BETWEEN $1 AND $2";
      queryParams.push(startDate, endDate);
    } else if (startDate) {
      dateFilter = "WHERE DATE(s.created_at) >= $1";
      queryParams.push(startDate);
    }
    
    // Calculate profit from sales using wholesale prices
    const profitAnalysis = await pool.query(`
      SELECT 
        DATE(s.created_at) as sale_date,
        COUNT(s.id) as total_sales,
        SUM(s.total) as total_revenue,
        SUM(
          CASE 
            WHEN i.wholesale_price > 0 THEN (i.price - i.wholesale_price) * si.quantity
            ELSE 0
          END
        ) as total_profit,
        SUM(
          CASE 
            WHEN i.wholesale_price > 0 THEN i.wholesale_price * si.quantity
            ELSE 0
          END
        ) as total_cost,
        AVG(
          CASE 
            WHEN i.wholesale_price > 0 AND i.price > 0 THEN 
              ((i.price - i.wholesale_price) / i.price) * 100
            ELSE 0
          END
        ) as avg_profit_margin
      FROM sales s
      JOIN sale_items si ON s.id = si.sale_id
      JOIN items i ON si.item_id = i.id
      ${dateFilter}
      GROUP BY DATE(s.created_at)
      ORDER BY sale_date DESC
    `, queryParams);
    
    res.json(profitAnalysis.rows);
  } catch (error) {
    console.error("Get profit analysis error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

// Get daily summary for dashboard
router.get("/daily-summary", auth, async (req, res) => {
  try {
    const { date = new Date().toISOString().split('T')[0] } = req.query;
    
    // Get comprehensive daily summary
    const summary = await pool.query(`
      SELECT 
        -- Sales metrics
        (SELECT COALESCE(SUM(total), 0) FROM sales WHERE DATE(created_at) = $1) as daily_revenue,
        (SELECT COUNT(*) FROM sales WHERE DATE(created_at) = $1) as daily_sales_count,
        
        -- Payment metrics
        (SELECT COALESCE(SUM(amount), 0) FROM payment_history WHERE DATE(payment_date) = $1) as daily_payments,
        
        -- Expense metrics
        (SELECT COALESCE(SUM(amount), 0) FROM expenses WHERE DATE(date) = $1) as daily_expenses,
        
        -- Profit calculation
        (SELECT 
          COALESCE(SUM(
            CASE 
              WHEN i.wholesale_price > 0 THEN (i.price - i.wholesale_price) * si.quantity
              ELSE 0
            END
          ), 0)
         FROM sales s
         JOIN sale_items si ON s.id = si.sale_id
         JOIN items i ON si.item_id = i.id
         WHERE DATE(s.created_at) = $1
        ) as daily_profit,
        
        -- Outstanding debts
        (SELECT COALESCE(SUM(balance), 0) FROM sales WHERE balance > 0) as total_outstanding,
        
        -- Low stock count
        (SELECT COUNT(*) FROM items WHERE stock < 5) as low_stock_count
    `, [date]);
    
    const result = summary.rows[0];
    
    // Calculate net profit (profit - expenses)
    result.net_profit = parseFloat(result.daily_profit || 0) - parseFloat(result.daily_expenses || 0);
    
    res.json(result);
  } catch (error) {
    console.error("Get daily summary error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
