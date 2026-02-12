-- Create the leads table
CREATE TABLE IF NOT EXISTS leads (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    name TEXT NOT NULL,
    email TEXT,
    phone TEXT,
    source TEXT DEFAULT 'Manual',
    status TEXT DEFAULT 'Nuevo',
    notes TEXT,
    active BOOLEAN DEFAULT TRUE,
    user_id UUID REFERENCES auth.users(id)
);

-- Enable Row Level Security
ALTER TABLE leads ENABLE ROW LEVEL SECURITY;

-- Create policies (Adjust as needed for your auth model)
-- Allow authenticated users to view all leads
CREATE POLICY "Enable read access for authenticated users" ON leads
    FOR SELECT
    TO authenticated
    USING (true);

-- Allow authenticated users to insert leads
CREATE POLICY "Enable insert access for authenticated users" ON leads
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- Allow authenticated users to update leads
CREATE POLICY "Enable update access for authenticated users" ON leads
    FOR UPDATE
    TO authenticated
    USING (true);
