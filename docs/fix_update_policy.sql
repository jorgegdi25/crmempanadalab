-- Drop existing policy if it exists (to be safe or just create a new one with a different name)
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON leads;

-- Re-create the update policy
CREATE POLICY "Enable update access for authenticated users" ON leads
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);
