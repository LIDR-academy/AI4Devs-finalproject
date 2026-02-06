-- infra/setup_storage.sql
-- SQL script to create Supabase Storage bucket 'raw-uploads' and set RLS policies
-- Safe to re-run: uses IF NOT EXISTS / ON CONFLICT clauses

BEGIN;

-- 1) Create the bucket row (id is primary key in storage.buckets)
INSERT INTO storage.buckets (id, name, public, created_at, updated_at)
VALUES ('raw-uploads', 'raw-uploads', false, now(), now())
ON CONFLICT (id) DO NOTHING;

-- 2) Ensure RLS is enabled on storage.objects
ALTER TABLE IF EXISTS storage.objects ENABLE ROW LEVEL SECURITY;

-- 3) Policy: allow INSERT into storage.objects by authenticated users or service_role
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'allow_insert_authenticated_or_service'
    ) THEN
        CREATE POLICY allow_insert_authenticated_or_service
        ON storage.objects
        FOR INSERT
        WITH CHECK (auth.role() = 'authenticated' OR auth.role() = 'service_role');
    END IF;
END$$;

-- 4) Policy: allow SELECT to service_role and authenticated
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_policies
        WHERE schemaname = 'storage' AND tablename = 'objects' AND policyname = 'allow_select_service_and_authenticated'
    ) THEN
        CREATE POLICY allow_select_service_and_authenticated
        ON storage.objects
        FOR SELECT
        USING (auth.role() = 'service_role' OR auth.role() = 'authenticated');
    END IF;
END$$;

COMMIT;

-- Notes:
-- * Execute this script in the Supabase SQL Editor (Database -> SQL) while connected
-- * The `service_role` key bypasses RLS; policies above allow both backend service and authenticated users
-- * Adjust policy expressions if you need stricter checks (e.g., check bucket_id or owner)
