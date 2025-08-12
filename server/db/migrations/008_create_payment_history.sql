-- Migration: Create payment history table
-- This table will track all payment activities for sales

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

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_payment_history_sale_id ON payment_history(sale_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_payment_date ON payment_history(payment_date);
CREATE INDEX IF NOT EXISTS idx_payment_history_payment_type ON payment_history(payment_type);

-- Add comment for documentation
COMMENT ON TABLE payment_history IS 'Tracks all payment activities for sales including initial payments, partial payments, and debt repayments';
COMMENT ON COLUMN payment_history.payment_type IS 'Type of payment: initial (first payment), partial (additional payment), debt_repayment (paying off debt), full_settlement (final payment that completes the sale)';
COMMENT ON COLUMN payment_history.amount IS 'Amount of this specific payment';
COMMENT ON COLUMN payment_history.description IS 'Optional description or notes about the payment';
COMMENT ON COLUMN payment_history.payment_date IS 'When this payment was made';
