-- Migration 007: Fix debts table constraint issue
-- Drop existing constraint if it exists and recreate it properly

-- First, check if the constraint exists and drop it
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'debts_sale_id_unique'
    ) THEN
        ALTER TABLE debts DROP CONSTRAINT debts_sale_id_unique;
    END IF;
END $$;

-- Remove any duplicate debt records for the same sale (keep the one with highest id)
DELETE FROM debts WHERE id NOT IN (
  SELECT MAX(id) FROM debts GROUP BY sale_id
);

-- Add the unique constraint back
ALTER TABLE debts ADD CONSTRAINT debts_sale_id_unique UNIQUE (sale_id);

-- Verify the constraint was added
SELECT constraint_name, constraint_type 
FROM information_schema.table_constraints 
WHERE table_name = 'debts' AND constraint_type = 'UNIQUE';
