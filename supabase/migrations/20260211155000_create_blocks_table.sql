-- Migration: Create blocks table
-- Prerequisites for T-020-DB
-- Author: AI Assistant
-- Date: 2026-02-11
-- Purpose: Create base blocks table structure before adding validation_report column
--
-- This migration creates the core blocks table as documented in docs/05-data-model.md
-- and is required before running 20260211160000_add_validation_report.sql

BEGIN;

-- 1. Create block_status ENUM if it doesn't exist
DO $$ BEGIN
    CREATE TYPE block_status AS ENUM (
        'uploaded',
        'validated',
        'in_fabrication',
        'completed',
        'archived'
    );
EXCEPTION
    WHEN duplicate_object THEN NULL;
END $$;

COMMENT ON TYPE block_status IS 'Lifecycle states for blocks (pieces)';

-- 2. Create blocks table
CREATE TABLE IF NOT EXISTS blocks (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    iso_code text NOT NULL UNIQUE,
    status block_status NOT NULL DEFAULT 'uploaded',
    tipologia text NOT NULL,
    zone_id uuid,  -- Will be FK when zones table is created
    workshop_id uuid,  -- Will be FK when workshops table is created
    created_by uuid,  -- Will be FK when profiles table is created
    updated_by uuid,  -- Will be FK when profiles table is created
    url_original text,
    url_glb text,
    rhino_metadata jsonb NOT NULL DEFAULT '{}',
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now(),
    is_archived boolean NOT NULL DEFAULT false
);

COMMENT ON TABLE blocks IS 
'Central entity representing individual building blocks/pieces in the Sagrada Familia project. Contains metadata, status tracking, and references to 3D models.';

COMMENT ON COLUMN blocks.iso_code IS 'Unique ISO-19650 identifier (e.g., SF-C12-M-001)';
COMMENT ON COLUMN blocks.status IS 'Current lifecycle stage of the block';
COMMENT ON COLUMN blocks.tipologia IS 'Material type classification (stone/concrete/metal)';
COMMENT ON COLUMN blocks.rhino_metadata IS 'User strings and metadata extracted from .3dm file';
COMMENT ON COLUMN blocks.url_original IS 'S3 URL of original .3dm file';
COMMENT ON COLUMN blocks.url_glb IS 'S3 URL of converted .glb file for web visualization';

-- 3. Create indexes
CREATE INDEX IF NOT EXISTS idx_blocks_status ON blocks(status);
CREATE INDEX IF NOT EXISTS idx_blocks_zone_id ON blocks(zone_id);
CREATE INDEX IF NOT EXISTS idx_blocks_workshop_id ON blocks(workshop_id);
CREATE INDEX IF NOT EXISTS idx_blocks_rhino_metadata_gin 
ON blocks USING GIN (rhino_metadata);

COMMENT ON INDEX idx_blocks_rhino_metadata_gin IS
'GIN index for efficient queries on rhino_metadata JSONB column';

-- 4. Create updated_at trigger function if it doesn't exist
CREATE OR REPLACE FUNCTION set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 5. Create updated_at trigger
DROP TRIGGER IF EXISTS trigger_blocks_updated_at ON blocks;
CREATE TRIGGER trigger_blocks_updated_at
BEFORE UPDATE ON blocks
FOR EACH ROW
EXECUTE FUNCTION set_updated_at();

-- 6. Enable RLS (will be configured with policies later)
ALTER TABLE blocks ENABLE ROW LEVEL SECURITY;

-- 7. Verify migration
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_schema = 'public'
          AND table_name = 'blocks'
    ) THEN
        RAISE EXCEPTION 'Migration failed: blocks table not created';
    END IF;

    RAISE NOTICE 'Migration successful: blocks table created';
END$$;

COMMIT;
