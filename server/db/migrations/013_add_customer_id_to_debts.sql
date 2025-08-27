-- Add customer_id to debts and backfill from sales
ALTER TABLE debts ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS idx_debts_customer_id ON debts(customer_id);

-- Backfill customer_id on debts from related sales
UPDATE debts d
SET customer_id = s.customer_id
FROM sales s
WHERE d.sale_id = s.id AND d.customer_id IS NULL;
