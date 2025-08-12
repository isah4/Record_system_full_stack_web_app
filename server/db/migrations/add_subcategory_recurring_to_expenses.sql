-- Add subcategory and recurring fields to expenses table if they don't exist
DO $$
BEGIN
    -- Check if subcategory column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='expenses' AND column_name='subcategory') THEN
        ALTER TABLE expenses ADD COLUMN subcategory VARCHAR(50);
    END IF;
    
    -- Check if recurring column exists
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns 
                  WHERE table_name='expenses' AND column_name='recurring') THEN
        ALTER TABLE expenses ADD COLUMN recurring BOOLEAN DEFAULT FALSE;
    END IF;
END
$$;