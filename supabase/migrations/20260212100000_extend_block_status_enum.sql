-- Migration: Extend block_status ENUM with validation lifecycle states
-- Ticket: T-021-DB
-- Author: AI Assistant (Prompt #071 - TDD-RED Phase)
-- Date: 2026-02-12
-- 
-- CRITICAL: This migration does NOT use BEGIN...COMMIT wrapper
-- ALTER TYPE ADD VALUE cannot run inside a transaction in PostgreSQL
-- Each ADD VALUE is executed separately in autocommit mode
--
-- This migration extends the block_status ENUM to support "The Librarian"
-- validation agent workflow with intermediate processing states.

-- Add new status: processing (agent actively validating file)
ALTER TYPE block_status ADD VALUE IF NOT EXISTS 'processing';

-- Add new status: rejected (validation failed - fixable errors detected)
ALTER TYPE block_status ADD VALUE IF NOT EXISTS 'rejected';

-- Add new status: error_processing (validation failed - system error)
ALTER TYPE block_status ADD VALUE IF NOT EXISTS 'error_processing';

-- Update type comment to document valid transitions
COMMENT ON TYPE block_status IS 
'Lifecycle states for blocks (pieces). 
Valid transitions:
  uploaded -> processing -> validated | rejected | error_processing
  validated -> in_fabrication -> completed -> archived
  rejected -> uploaded (after fixes)
  error_processing -> uploaded (after manual review)';

-- Verification query to confirm all 8 values exist
-- This block runs in a separate transaction and can use DO $$
DO $$
DECLARE
  enum_values text[];
  required_values text[] := ARRAY[
    'uploaded', 'validated', 'in_fabrication', 'completed', 'archived',
    'processing', 'rejected', 'error_processing'
  ];
  missing_value text;
BEGIN
  -- Get all current enum values
  SELECT array_agg(enumlabel::text ORDER BY enumlabel) 
  INTO enum_values
  FROM pg_enum 
  WHERE enumtypid = 'block_status'::regtype;

  -- Check each required value exists
  FOREACH missing_value IN ARRAY required_values
  LOOP
    IF NOT (missing_value = ANY(enum_values)) THEN
      RAISE EXCEPTION 'Missing ENUM value: %', missing_value;
    END IF;
  END LOOP;

  RAISE NOTICE 'Migration successful: All required block_status values present: %', enum_values;
END $$;
