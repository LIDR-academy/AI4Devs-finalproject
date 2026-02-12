-- Migration: Add validation_report column to blocks table
-- Ticket: T-020-DB
-- Author: AI Assistant
-- Date: 2026-02-11
-- Purpose: Enable storing structured validation results from "The Librarian" agent
--
-- This migration adds:
-- 1. validation_report JSONB column to store validation errors, warnings, and metadata
-- 2. GIN index on errors array for efficient filtering by error type
-- 3. Partial index on is_valid=false for optimized dashboard queries
--
-- Expected JSON structure:
-- {
--   "is_valid": boolean,
--   "validated_at": "ISO timestamp",
--   "validated_by": "validator version string",
--   "errors": [
--     {
--       "type": "nomenclature" | "geometry" | "metadata",
--       "severity": "error" | "warning",
--       "location": "layer:name or object:uuid",
--       "message": "human-readable error description"
--     }
--   ],
--   "metadata": {
--     "total_objects": number,
--     "valid_objects": number,
--     "invalid_objects": number,
--     "user_strings_extracted": number (optional),
--     "processing_duration_ms": number (optional)
--   },
--   "warnings": [ ... ] (optional)
-- }

BEGIN;

-- 1. Add JSONB column for validation reports
ALTER TABLE blocks
ADD COLUMN validation_report JSONB DEFAULT NULL;

-- 2. Add comment for documentation
COMMENT ON COLUMN blocks.validation_report IS 
'Structured validation report from The Librarian agent. Contains errors, warnings, and metadata from .3dm file validation. NULL if file has not been validated yet.';

-- 3. Create GIN index on errors array for efficient filtering
-- This index optimizes queries like:
-- SELECT * FROM blocks WHERE validation_report @> '{"errors": [{"type": "nomenclature"}]}'::jsonb;
CREATE INDEX idx_blocks_validation_errors
ON blocks USING GIN ((validation_report->'errors'));

COMMENT ON INDEX idx_blocks_validation_errors IS
'GIN index for efficient queries on validation errors. Optimizes filters like "all blocks with nomenclature errors".';

-- 4. Create partial index for failed validations only (performance optimization)
-- This index only includes rows where validation failed (is_valid=false)
-- Optimizes dashboard queries showing rejected/problematic blocks
CREATE INDEX idx_blocks_validation_failed
ON blocks ((validation_report->>'is_valid'))
WHERE validation_report->>'is_valid' = 'false';

COMMENT ON INDEX idx_blocks_validation_failed IS
'Partial index for rejected blocks. Optimizes dashboard queries showing only failed validations.';

-- 5. Verify migration success
DO $$
BEGIN
    -- Check if column exists
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.columns
        WHERE table_schema = 'public'
          AND table_name = 'blocks'
          AND column_name = 'validation_report'
    ) THEN
        RAISE EXCEPTION 'Migration failed: validation_report column not created';
    END IF;

    -- Check if GIN index exists
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename = 'blocks'
          AND indexname = 'idx_blocks_validation_errors'
    ) THEN
        RAISE EXCEPTION 'Migration failed: idx_blocks_validation_errors index not created';
    END IF;

    -- Check if partial index exists
    IF NOT EXISTS (
        SELECT 1
        FROM pg_indexes
        WHERE schemaname = 'public'
          AND tablename = 'blocks'
          AND indexname = 'idx_blocks_validation_failed'
    ) THEN
        RAISE EXCEPTION 'Migration failed: idx_blocks_validation_failed index not created';
    END IF;

    RAISE NOTICE 'Migration successful: validation_report column and indexes added to blocks table';
END$$;

COMMIT;
