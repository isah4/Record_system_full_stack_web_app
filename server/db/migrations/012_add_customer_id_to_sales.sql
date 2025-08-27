-- Add customer_id to sales
ALTER TABLE sales ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS idx_sales_customer_id ON sales(customer_id);
