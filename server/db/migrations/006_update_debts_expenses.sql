-- Migration 006: Update debts and expenses tables
-- Add unique constraint to debts.sale_id
-- Add missing fields to expenses table

-- First, remove any duplicate debt records for the same sale
DELETE FROM debts WHERE id NOT IN (
  SELECT MIN(id) FROM debts GROUP BY sale_id
);

-- Add unique constraint to debts.sale_id
ALTER TABLE debts ADD CONSTRAINT debts_sale_id_unique UNIQUE (sale_id);

-- Add missing fields to expenses table
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS subcategory VARCHAR(100);
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS recurring BOOLEAN DEFAULT FALSE;
ALTER TABLE expenses ADD COLUMN IF NOT EXISTS time TIME DEFAULT CURRENT_TIME;

-- Update existing expenses to have default values
UPDATE expenses SET 
  subcategory = 'other' WHERE subcategory IS NULL,
  recurring = FALSE WHERE recurring IS NULL,
  time = CURRENT_TIME WHERE time IS NULL;
