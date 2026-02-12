-- Create the interactions table
CREATE TABLE IF NOT EXISTS interactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    lead_id UUID REFERENCES leads(id) ON DELETE CASCADE,
    type TEXT NOT NULL, -- 'note', 'call', 'email', 'whatsapp', 'meeting'
    content TEXT,
    user_id UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE interactions ENABLE ROW LEVEL SECURITY;

-- Create policies
-- Allow authenticated users to view interactions
CREATE POLICY "Enable read access for authenticated users" ON interactions
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to insert interactions
CREATE POLICY "Enable insert access for authenticated users" ON interactions
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update interactions (optional, primarily for editing notes)
CREATE POLICY "Enable update access for authenticated users" ON interactions
    FOR UPDATE
    TO authenticated
    USING (true);
