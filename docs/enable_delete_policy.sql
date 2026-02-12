-- Allow authenticated users to delete leads
CREATE POLICY "Enable delete access for authenticated users" ON leads
    FOR DELETE
    TO authenticated
    USING (true);
