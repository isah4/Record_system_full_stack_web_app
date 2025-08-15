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
      query = `
        SELECT * FROM activity_log
        WHERE DATE(activity_date) = $1
        ORDER BY activity_date DESC
        LIMIT $2
      `;
      queryParams = [date, limit];
    } else {
      query = `
        SELECT * FROM activity_log
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

// Get summary report for a given date or period
router.get("/summary", auth, async (req, res) => {
  try {
    const { date, start, end } = req.query;
    let dateFilter = '';
    let params = [];
    if (date) {
      dateFilter = 'WHERE DATE(activity_date) = $1';
      params = [date];
    } else if (start && end) {
      dateFilter = 'WHERE activity_date >= $1 AND activity_date <= $2';
      params = [start, end];
    }
    // Aggregate totals by activity type
    const summary = await pool.query(
      `SELECT activity_type, SUM(amount) as total_amount, COUNT(*) as count
       FROM activity_log
       ${dateFilter}
       GROUP BY activity_type`
      , params
    );
    // Calculate total sales and expenses for profit
    const sales = summary.rows.find(r => r.activity_type === 'sale')?.total_amount || 0;
    const expenses = summary.rows.find(r => r.activity_type === 'expense')?.total_amount || 0;
    // Outstanding debts: sum of sales with payment_status not 'paid'
    let outstandingDebts = 0;
    if (date || (start && end)) {
      const debtsResult = await pool.query(
        `SELECT SUM((details->>'balance')::numeric) as total_outstanding
         FROM activity_log
         WHERE activity_type = 'sale' AND (details->>'balance')::numeric > 0
         ${dateFilter ? 'AND ' + dateFilter.replace('WHERE', '') : ''}`,
        params
      );
      outstandingDebts = debtsResult.rows[0]?.total_outstanding || 0;
    } else {
      const debtsResult = await pool.query(
        `SELECT SUM((details->>'balance')::numeric) as total_outstanding
         FROM activity_log
         WHERE activity_type = 'sale' AND (details->>'balance')::numeric > 0`
      );
      outstandingDebts = debtsResult.rows[0]?.total_outstanding || 0;
    }
    res.json({
      summary: summary.rows,
      total_sales: sales,
      total_expenses: expenses,
      profit: sales - expenses,
      outstanding_debts: outstandingDebts
    });
  } catch (error) {
    console.error("Get summary error:", error);
    res.status(500).json({ error: "Internal server error" });
  }
});

module.exports = router;
