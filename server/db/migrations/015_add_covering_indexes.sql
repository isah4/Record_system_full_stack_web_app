-- Covering indexes for performance
CREATE INDEX IF NOT EXISTS idx_customers_created_at ON customers(created_at);
CREATE INDEX IF NOT EXISTS idx_sales_created_at_customer ON sales(created_at, customer_id);
CREATE INDEX IF NOT EXISTS idx_debts_created_at_customer ON debts(created_at, customer_id);
CREATE INDEX IF NOT EXISTS idx_payment_history_date_customer ON payment_history(payment_date, customer_id);
