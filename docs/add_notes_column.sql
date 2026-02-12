-- Add notes column to leads table if it doesn't exist
ALTER TABLE leads ADD COLUMN IF NOT EXISTS notes TEXT;
