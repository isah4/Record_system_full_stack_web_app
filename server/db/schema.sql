/* ===========================================================
   COMPREHENSIVE MASTER SCHEMA - ALL TABLES AND FEATURES
   This schema includes all migrations merged into one file
   =========================================================== */

-- Enable UUID extension for future use
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create custom types
DO $$ BEGIN
    CREATE TYPE expense_category AS ENUM ('internal', 'external');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

/* ===========================================================
   CORE TABLES
   =========================================================== */

-- Users table (from migration 005)
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(100) UNIQUE NOT NULL,
  password VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Items table (with wholesale_price from migration 009)
CREATE TABLE IF NOT EXISTS items (
  id SERIAL PRIMARY KEY,
  name VARCHAR(100) NOT NULL,
  price DECIMAL(10,2) NOT NULL,
  wholesale_price DECIMAL(10,2) DEFAULT 0,
  stock INTEGER NOT NULL
);

-- Sales table
CREATE TABLE IF NOT EXISTS sales (
  id SERIAL PRIMARY KEY,
  buyer_name VARCHAR(100),
  total DECIMAL(10,2),
  payment_status VARCHAR(20),
  balance DECIMAL(10,2),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Sale items table
CREATE TABLE IF NOT EXISTS sale_items (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER REFERENCES sales(id),
  item_id INTEGER REFERENCES items(id),
  quantity INTEGER NOT NULL,
  price_at_sale DECIMAL(10,2) NOT NULL,
  subtotal DECIMAL(10,2) NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* ===========================================================
   EXPENSE TABLES (with all features from migrations)
   =========================================================== */

-- Expenses table (with all columns from migrations 004, 006, and add_subcategory_recurring)
CREATE TABLE IF NOT EXISTS expenses (
  id SERIAL PRIMARY KEY,
  amount DECIMAL(10,2) NOT NULL,
  description TEXT NOT NULL,
  category expense_category NOT NULL,
  subcategory VARCHAR(100) DEFAULT 'other',
  recurring BOOLEAN DEFAULT FALSE,
  date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  time TIME DEFAULT CURRENT_TIME,
  created_by INTEGER REFERENCES users(id) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

/* ===========================================================
   DEBT TABLES (with unique constraint from migrations 006, 007)
   =========================================================== */

-- Debts table (with unique constraint on sale_id)
CREATE TABLE IF NOT EXISTS debts (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER REFERENCES sales(id) UNIQUE,
  amount DECIMAL(10,2) NOT NULL,
  repaid_amount DECIMAL(10,2) DEFAULT 0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

/* ===========================================================
   PAYMENT HISTORY TABLE (from migration 008)
   =========================================================== */

-- Payment History Table
CREATE TABLE IF NOT EXISTS payment_history (
  id SERIAL PRIMARY KEY,
  sale_id INTEGER REFERENCES sales(id) NOT NULL,
  payment_type VARCHAR(20) NOT NULL CHECK (payment_type IN ('initial', 'partial', 'debt_repayment', 'full_settlement')),
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  payment_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

/* ===========================================================
   ACTIVITY LOG TABLE (from migration 010)
   =========================================================== */

-- Activity Log Table
CREATE TABLE IF NOT EXISTS activity_log (
  id SERIAL PRIMARY KEY,
  activity_type VARCHAR(30) NOT NULL,
  reference_id INTEGER,
  description TEXT,
  amount DECIMAL(10,2),
  status VARCHAR(30),
  activity_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  details JSONB,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

/* ===========================================================
   INDEXES FOR PERFORMANCE
   =========================================================== */

-- Payment history indexes
CREATE INDEX IF NOT EXISTS idx_payment_history_sale_id ON payment_history(sale_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_payment_date ON payment_history(payment_date);
CREATE INDEX IF NOT EXISTS idx_payment_history_payment_type ON payment_history(payment_type);

-- Sales indexes
CREATE INDEX IF NOT EXISTS idx_sales_created_at ON sales(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_buyer_name ON sales(buyer_name);

-- Items indexes
CREATE INDEX IF NOT EXISTS idx_items_name ON items(name);
CREATE INDEX IF NOT EXISTS idx_items_stock ON items(stock);

-- Expenses indexes
CREATE INDEX IF NOT EXISTS idx_expenses_date ON expenses(date);
CREATE INDEX IF NOT EXISTS idx_expenses_category ON expenses(category);
CREATE INDEX IF NOT EXISTS idx_expenses_created_by ON expenses(created_by);

-- Debts indexes
CREATE INDEX IF NOT EXISTS idx_debts_sale_id ON debts(sale_id);
CREATE INDEX IF NOT EXISTS idx_debts_amount ON debts(amount);

-- Activity log indexes
CREATE INDEX IF NOT EXISTS idx_activity_log_activity_type ON activity_log(activity_type);
CREATE INDEX IF NOT EXISTS idx_activity_log_activity_date ON activity_log(activity_date);
CREATE INDEX IF NOT EXISTS idx_activity_log_created_by ON activity_log(created_by);

/* ===========================================================
   COMMENTS FOR DOCUMENTATION
   =========================================================== */

COMMENT ON TABLE users IS 'User accounts for authentication and tracking who created records';
COMMENT ON TABLE items IS 'Inventory items with retail and wholesale pricing for profit calculations';
COMMENT ON TABLE sales IS 'Sales transactions with buyer information and payment status';
COMMENT ON TABLE sale_items IS 'Individual items sold in each sale transaction';
COMMENT ON TABLE expenses IS 'Business expenses categorized by type with recurring and subcategory support';
COMMENT ON TABLE debts IS 'Outstanding balances from sales that haven''t been fully paid';
COMMENT ON TABLE payment_history IS 'Tracks all payment activities for sales including initial payments, partial payments, and debt repayments';
COMMENT ON TABLE activity_log IS 'Unified logging system for all business activities and system events';

COMMENT ON COLUMN items.wholesale_price IS 'Cost/wholesale price of the item for profit calculation';
COMMENT ON COLUMN expenses.category IS 'Main expense category: internal (operational) or external (business costs)';
COMMENT ON COLUMN expenses.subcategory IS 'Specific subcategory within the main expense category';
COMMENT ON COLUMN expenses.recurring IS 'Whether this expense repeats regularly (monthly, yearly, etc.)';
COMMENT ON COLUMN payment_history.payment_type IS 'Type of payment: initial (first payment), partial (additional payment), debt_repayment (paying off debt), full_settlement (final payment that completes the sale)';
COMMENT ON COLUMN activity_log.activity_type IS 'Type of activity: sale, expense, debt_repayment, stock_addition, new_item, etc.';
COMMENT ON COLUMN activity_log.details IS 'JSON object containing additional activity-specific information';
