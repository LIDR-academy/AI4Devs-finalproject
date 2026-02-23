-- Migration: Add columns for 3D Dashboard (US-005)
-- Ticket: T-0503-DB
-- Author: AI Assistant
-- Date: 2026-02-19
-- Purpose: Add low_poly_url and bbox columns + create optimization indexes
--
-- Prerequisites:
--   - 20260211155000_create_blocks_table.sql (blocks table exists)
--
-- Downstream dependencies:
--   - T-0501-BACK: GET /api/parts endpoint will consume these columns
--   - T-0502-AGENT: generate_low_poly_glb task will populate these columns

BEGIN;

-- ============================================
-- STEP 1: Add low_poly_url column
-- ============================================
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS low_poly_url TEXT NULL;

COMMENT ON COLUMN blocks.low_poly_url IS 
'URL pública del archivo GLB simplificado (~1000 triángulos). 
Generado por Celery task tras validación. 
Format: https://xyz.supabase.co/storage/v1/object/public/processed-geometry/low-poly/{id}.glb';

-- ============================================
-- STEP 2: Add bbox column (3D Bounding Box)
-- ============================================
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS bbox JSONB NULL;

COMMENT ON COLUMN blocks.bbox IS 
'3D Bounding box from Rhino model. 
Schema: {"min": [x,y,z], "max": [x,y,z]} 
Example: {"min": [-2.5, 0, -2.5], "max": [2.5, 5, 2.5]}';

-- ============================================
-- STEP 3: Create canvas query index (composite)
-- ============================================
-- Purpose: Optimize GET /api/parts?status=X&tipologia=Y&workshop_id=Z
-- Target query time: <500ms for 500 rows
CREATE INDEX IF NOT EXISTS idx_blocks_canvas_query ON blocks(status, tipologia, workshop_id) WHERE is_archived = false;

-- ============================================
-- STEP 4: Create processing queue index (partial)
-- ============================================
-- Purpose: Find next block needing GLB generation
-- Target query time: <10ms
CREATE INDEX IF NOT EXISTS idx_blocks_low_poly_processing ON blocks(status) WHERE low_poly_url IS NULL AND is_archived = false;

-- ============================================
-- STEP 5: Verify migration success
-- ============================================
DO $$
DECLARE
    col_count INT;
    idx_count INT;
BEGIN
    -- Check columns exist
    SELECT COUNT(*) INTO col_count
    FROM information_schema.columns 
    WHERE 
        table_name = 'blocks' 
        AND column_name IN ('low_poly_url', 'bbox');
    
    IF col_count <> 2 THEN
        RAISE EXCEPTION 'Migration failed: columns not created (expected 2, got %)', col_count;
    END IF;
    
    -- Check indexes exist
    SELECT COUNT(*) INTO idx_count
    FROM pg_indexes 
    WHERE 
        tablename = 'blocks'
        AND indexname IN ('idx_blocks_canvas_query', 'idx_blocks_low_poly_processing');
    
    IF idx_count <> 2 THEN
        RAISE EXCEPTION 'Migration failed: indexes not created (expected 2, got %)', idx_count;
    END IF;
    
    RAISE NOTICE 'Migration successful: low_poly_url & bbox columns + 2 indexes created';
END$$;

COMMIT;
