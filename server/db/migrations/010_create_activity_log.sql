-- Migration: Create activity_log table for unified business activity logging

CREATE TABLE IF NOT EXISTS activity_log (
  id SERIAL PRIMARY KEY,
  activity_type VARCHAR(30) NOT NULL, -- e.g., 'sale', 'expense', 'debt_repayment', 'stock_addition', 'new_item'
  reference_id INTEGER, -- id from the relevant table (sale, expense, etc.)
  description TEXT,
  amount DECIMAL(10,2),
  status VARCHAR(30),
  activity_date TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
  details JSONB,
  created_by INTEGER REFERENCES users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);
