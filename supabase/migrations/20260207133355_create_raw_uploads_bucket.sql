-- Create Supabase Storage bucket 'raw-uploads' and set RLS policies
-- Migrated from infra/setup_storage.sql
--
-- NOTE: This migration only runs on Supabase (where storage schema exists).
-- On vanilla PostgreSQL (Docker dev/CI), it safely skips all operations.

DO $$
BEGIN
    -- Only execute on Supabase where storage schema exists
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.schemata WHERE schema_name = 'storage'
    ) THEN
        RAISE NOTICE 'Skipping storage migration: storage schema not found (not Supabase)';
        RETURN;
    END IF;

    -- 1) Create the bucket row
    INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
    VALUES ('raw-uploads', 'raw-uploads', false, now(), now())
    ON CONFLICT (id) DO NOTHING;

    -- 2) Ensure RLS is enabled on storage.objects
    ALTER TABLE IF EXISTS storage.objects ENABLE ROW LEVEL SECURITY;

    -- 3) Policy: allow INSERT by authenticated users or service_role
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'allow_insert_authenticated_or_service'
    ) THEN
        CREATE POLICY allow_insert_authenticated_or_service
        ON storage.objects
        FOR INSERT
        WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
    END IF;

    -- 4) Policy: allow SELECT to service_role and authenticated
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'allow_select_service_and_authenticated'
    ) THEN
        CREATE POLICY allow_select_service_and_authenticated
        ON storage.objects
        FOR SELECT
        USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
    END IF;

    RAISE NOTICE 'Storage migration successful: raw-uploads bucket configured';
END$$;
