#!/usr/bin/env python3
"""
Apply T-0503-DB Migration Script
Adds low_poly_url and bbox columns + indexes to blocks table.
"""
import os
import sys
import psycopg2
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

MIGRATION_SQL = """
-- Migration: Add columns for 3D Dashboard (US-005)
-- Ticket: T-0503-DB

BEGIN;

-- Add low_poly_url column
ALTER TABLE blocks 
ADD COLUMN IF NOT EXISTS low_poly_url TEXT NULL;

COMMENT ON COLUMN blocks.low_poly_url IS 
'URL pública del archivo GLB simplificado (~1000 triángulos). 
Generado por Celery task tras validación. 
Format: https://xyz.supabase.co/storage/v1/object/public/processed-geometry/low-poly/{id}.glb';

-- Add bbox column
ALTER TABLE blocks 
ADD COLUMN IF NOT EXISTS bbox JSONB NULL;

COMMENT ON COLUMN blocks.bbox IS 
'3D Bounding box from Rhino model. 
Schema: {"min": [x,y,z], "max": [x,y,z]} 
Example: {"min": [-2.5, 0, -2.5], "max": [2.5, 5, 2.5]}';

-- Create canvas query index
CREATE INDEX IF NOT EXISTS idx_blocks_canvas_query 
ON blocks(status, tipologia, workshop_id) 
WHERE is_archived = false;

-- Create processing queue index
CREATE INDEX IF NOT EXISTS idx_blocks_low_poly_processing
ON blocks(status)
WHERE low_poly_url IS NULL AND is_archived = false;

-- Verify migration success
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
"""

def main():
    database_url = os.getenv(
        "DATABASE_URL",
        "postgresql://user:password@db:5432/sfpm_db"
    )
    
    print(f"🔌 Connecting to database...")
    
    try:
        conn = psycopg2.connect(database_url)
        conn.autocommit = True
        cursor = conn.cursor()
        
        print(f"📝 Applying T-0503-DB migration...")
        cursor.execute(MIGRATION_SQL)
        
        print(f"✅ Migration applied successfully!")
        print(f"   - Added columns: low_poly_url, bbox")
        print(f"   - Created indexes: idx_blocks_canvas_query, idx_blocks_low_poly_processing")
        
        cursor.close()
        conn.close()
        
        return 0
        
    except Exception as e:
        print(f"❌ Migration failed: {e}")
        return 1

if __name__ == "__main__":
    sys.exit(main())
