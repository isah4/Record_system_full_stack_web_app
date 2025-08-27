-- Optional: Add customer_id to payment_history and backfill from debts
ALTER TABLE payment_history ADD COLUMN IF NOT EXISTS customer_id INTEGER REFERENCES customers(id) ON DELETE RESTRICT;
CREATE INDEX IF NOT EXISTS idx_payment_history_customer_id ON payment_history(customer_id);

-- Backfill
UPDATE payment_history p
SET customer_id = d.customer_id
FROM debts d
WHERE p.sale_id = d.sale_id AND p.customer_id IS NULL;
