-- Migration: Add wholesale price to items table for profit calculations
-- This allows tracking cost vs selling price for profit analysis

-- Add wholesale_price column to items table
ALTER TABLE items ADD COLUMN IF NOT EXISTS wholesale_price DECIMAL(10,2) DEFAULT 0;

-- Add comment for documentation
COMMENT ON COLUMN items.wholesale_price IS 'Cost/wholesale price of the item for profit calculation';

-- Update existing items to have a default wholesale price (can be updated manually)
UPDATE items SET wholesale_price = price * 0.7 WHERE wholesale_price = 0;
