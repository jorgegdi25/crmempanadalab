-- 1. Ensure DELETE Policy exists and is correct
DROP POLICY IF EXISTS "Enable delete access for authenticated users" ON leads;

CREATE POLICY "Enable delete access for authenticated users" ON leads
    FOR DELETE
    TO authenticated
    USING (true);

-- 2. Ensure Update Policy (just in case)
DROP POLICY IF EXISTS "Enable update access for authenticated users" ON leads;

CREATE POLICY "Enable update access for authenticated users" ON leads
    FOR UPDATE
    TO authenticated
    USING (true)
    WITH CHECK (true);

-- 3. Ensure INSERT Policy
DROP POLICY IF EXISTS "Enable insert access for authenticated users" ON leads;

CREATE POLICY "Enable insert access for authenticated users" ON leads
    FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 4. FIX Foreign Key to allow Cascade Delete (User might have old schema)
-- We try to drop the constraint if we know the name, but often names are auto-generated.
-- This block tries to identify and fix it, but standard SQL needs specific names.
-- Instead, we will force a re-creation of the interactions link if needed.

-- Option A: If you created table with the script I gave you, the FK allows cascade.
-- But if it failed, let's try to patch it.

DO $$
BEGIN
    -- Check if constraint exists and try to drop it (replace 'interactions_lead_id_fkey' with likely name)
    IF EXISTS (SELECT 1 FROM information_schema.table_constraints WHERE constraint_name = 'interactions_lead_id_fkey') THEN
        ALTER TABLE interactions DROP CONSTRAINT interactions_lead_id_fkey;
    END IF;
END $$;

-- Re-add the Foreign Key with ON DELETE CASCADE
ALTER TABLE interactions
    ADD CONSTRAINT interactions_lead_id_fkey
    FOREIGN KEY (lead_id)
    REFERENCES leads(id)
    ON DELETE CASCADE;
