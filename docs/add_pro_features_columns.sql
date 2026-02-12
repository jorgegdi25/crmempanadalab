-- Add new columns for CRM Pro features
ALTER TABLE leads 
ADD COLUMN IF NOT EXISTS tags text[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS product_interest text,
ADD COLUMN IF NOT EXISTS next_follow_up timestamp with time zone;

-- Update existing records with default values for tags if needed (though DEFAULT handles it for new ones)
UPDATE leads SET tags = '{}' WHERE tags IS NULL;
