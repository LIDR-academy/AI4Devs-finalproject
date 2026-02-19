# Technical Specification: T-0503-DB

**Generated:** 2026-02-19  
**Workflow Phase:** STEP 1/5 - Enrichment (Pre-TDD)  
**Status:** ✅ Ready for TDD-Red Phase

---

## 1. Ticket Summary

- **Tipo:** DATABASE (DB)
- **Alcance:** Add two columns (`low_poly_url`, `bbox`) and two indexes to `blocks` table for 3D Dashboard optimization
- **Sprint:** 1 (Semana 1)
- **Story Points:** 1 SP (~2 hours)
- **Prioridad:** 🔵 P2 (Blocker - blocks T-0501-BACK and T-0502-AGENT)
- **Dependencias:** 
  - ✅ T-0500-INFRA (must complete first)
  - Blocks: T-0501-BACK, T-0502-AGENT

---

## 2. Data Structures & Contracts

### Database Schema Changes

#### 2.1 New Columns

**Column: `low_poly_url`**
```sql
-- TYPE: TEXT (nullable, URLs can be ~200 chars)
-- PURPOSE: Store S3 URL of simplified GLB file for 3D visualization
-- POPULATED BY: Celery task T-0502-AGENT after .3dm processing
-- FORMAT: https://{project}.supabase.co/storage/v1/object/public/processed-geometry/low-poly/{block_id}.glb
-- VALIDATION: Application-level (Pydantic), not DB CHECK constraint

ALTER TABLE blocks 
ADD COLUMN low_poly_url TEXT NULL;

COMMENT ON COLUMN blocks.low_poly_url IS 
'URL pública del archivo GLB simplificado (~1000 triángulos). 
Generado por Celery task tras validación. 
Format: https://xyz.supabase.co/storage/v1/object/public/processed-geometry/low-poly/{id}.glb';
```

**Characteristics:**
- **Type:** `TEXT` (not VARCHAR - URLs can exceed 255 chars)
- **Nullable:** `YES` (NULL until agent processing completes)
- **Default:** `NULL`
- **Immutable:** `NO` (updated by agent worker)
- **Index:** Part of `idx_blocks_low_poly_processing` (partial index on NULL values)

**Example Values:**
```
NULL                                                          -- Initial state
https://ebqapsoyjmdkhdxnkikz.supabase.co/storage/v1/object/public/processed-geometry/low-poly/550e8400-e29b-41d4-a716-446655440000.glb  -- After processing
```

---

**Column: `bbox`**
```sql
-- TYPE: JSONB (structured 3D bounding box)
-- PURPOSE: Store min/max coordinates for spatial layout in Canvas
-- POPULATED BY: Agent T-0502-AGENT from Rhino geometry analysis
-- SCHEMA: {"min": [x,y,z], "max": [x,y,z]}
-- VALIDATION: Pydantic BoundingBox model (application-level)

ALTER TABLE blocks 
ADD COLUMN bbox JSONB NULL;

COMMENT ON COLUMN blocks.bbox IS 
'3D Bounding box from Rhino model. 
Schema: {"min": [x,y,z], "max": [x,y,z]} 
Example: {"min": [-2.5, 0, -2.5], "max": [2.5, 5, 2.5]}';
```

**Characteristics:**
- **Type:** `JSONB` (binary JSON, faster than JSON type)
- **Nullable:** `YES` (NULL initially, MVP uses default grid positioning)
- **Default:** `NULL`
- **Immutable:** `NO` (updated by agent worker)
- **Index:** Not indexed in MVP (no bbox queries yet, add in Sprint 2 if needed)

**Schema Contract (Enforced in Pydantic):**
```python
class BoundingBox(BaseModel):
    min: List[float]  # exactly 3 elements [x, y, z]
    max: List[float]  # exactly 3 elements [x, y, z]
    
    @validator('min', 'max')
    def validate_length(cls, v):
        if len(v) != 3:
            raise ValueError('Must be [x, y, z]')
        return v
```

**Example Values:**
```json
null                                                          // Initial state
{"min": [-2.5, 0, -2.5], "max": [2.5, 5, 2.5]}              // Capitel
{"min": [-1.2, -1.2, 0], "max": [1.2, 1.2, 8.5]}            // Columna
{"min": [-5.8, -3.2, -0.5], "max": [5.8, 3.2, 0.5]}         // Dovela
```

---

#### 2.2 New Indexes

**Index: `idx_blocks_canvas_query` (Composite, Partial)**
```sql
-- PURPOSE: Optimize Dashboard 3D filter queries
-- TYPE: B-tree composite index
-- COLUMNS: status, tipologia, workshop_id
-- CONDITION: WHERE is_archived = false
-- CARDINALITY: ~500 rows (MVP dataset)
-- SELECTIVITY: ~0.4% (status 20% × tipologia 20% × workshop_id 10%)
-- SIZE ESTIMATE: ~20 KB (fits in shared_buffers)

CREATE INDEX idx_blocks_canvas_query 
ON blocks(status, tipologia, workshop_id) 
WHERE is_archived = false;
```

**Query Pattern Optimized:**
```sql
-- T-0501-BACK: GET /api/parts?status=validated&tipologia=capitel&workshop_id=123
SELECT 
    id, 
    iso_code, 
    status, 
    tipologia, 
    low_poly_url,  -- NEW COLUMN
    bbox,          -- NEW COLUMN
    workshop_id
FROM blocks
WHERE 
    is_archived = false
    AND status = 'validated'           -- First column in index
    AND tipologia = 'capitel'          -- Second column in index
    AND workshop_id = '123-abc-uuid';  -- Third column in index
```

**Performance Target:**
- Query time: **<500ms** (even with 500 rows)
- Index scan cost: **<100** (vs seq scan cost ~200)
- Response size: **<200KB** (gzipped)

---

**Index: `idx_blocks_low_poly_processing` (Partial, Queue Optimization)**
```sql
-- PURPOSE: Find next block needing GLB generation (processing queue)
-- TYPE: B-tree partial index
-- COLUMNS: status
-- CONDITION: WHERE low_poly_url IS NULL AND is_archived = false
-- CARDINALITY: ~50 rows initially (blocks without GLB)
-- SIZE: ~5 KB (very small, only non-processed blocks)

CREATE INDEX idx_blocks_low_poly_processing
ON blocks(status)
WHERE low_poly_url IS NULL AND is_archived = false;
```

**Query Pattern Optimized:**
```sql
-- T-0502-AGENT: Celery periodic task finding next block to process
SELECT 
    id, 
    original_file_url,
    iso_code
FROM blocks
WHERE 
    status = 'validated'
    AND low_poly_url IS NULL
    AND is_archived = false
ORDER BY created_at ASC
LIMIT 1;
```

**Performance Target:**
- Query time: **<10ms** (partial index scan)
- Index size: **<10 KB** (only NULL values indexed)
- Self-cleaning: As blocks get processed, they exit the index (efficient)

---

### Backend Schema (Pydantic)

**File:** `src/backend/schemas.py` (NO changes required - uses existing models)

**Relevant Existing Schemas:**
```python
# Already defined in schemas.py (lines 166-177)
class ValidationStatusResponse(BaseModel):
    block_id: UUID
    iso_code: str
    status: BlockStatus
    validation_report: Optional[ValidationReport]
    job_id: Optional[str]
```

**NEW Schema for Canvas API (T-0501-BACK - Next Ticket):**
```python
# TO BE ADDED in T-0501-BACK (not this ticket)
class PartCanvasItem(BaseModel):
    """
    Minimal part info for 3D canvas rendering.
    
    Contract: Must match TypeScript interface PartCanvasItem exactly.
    """
    id: UUID = Field(..., description="Block UUID")
    iso_code: str = Field(..., description="Part identifier")
    status: BlockStatus = Field(..., description="Lifecycle state")
    tipologia: str = Field(..., description="Part typology")
    low_poly_url: Optional[str] = Field(None, description="GLB file URL")  # NEW FIELD
    bbox: Optional[BoundingBox] = Field(None, description="3D bounding box")  # NEW FIELD
    workshop_id: Optional[UUID] = Field(None, description="Assigned workshop")

class BoundingBox(BaseModel):
    """3D bounding box for spatial layout."""
    min: List[float] = Field(..., min_items=3, max_items=3)
    max: List[float] = Field(..., min_items=3, max_items=3)
```

**⚠️ CRITICAL:** This ticket (T-0503-DB) ONLY adds DB columns. Schema changes happen in T-0501-BACK.

---

### Frontend Types (TypeScript)

**File:** `src/frontend/src/types/parts.ts` (NO changes in this ticket)

**To be added in T-0501-BACK:**
```typescript
// FUTURE - T-0501-BACK will create this interface
interface BoundingBox {
  min: [number, number, number];  // [x, y, z]
  max: [number, number, number];  // [x, y, z]
}

interface PartCanvasItem {
  id: string;                      // UUID
  iso_code: string;
  status: BlockStatus;
  tipologia: string;
  low_poly_url: string | null;     // NEW FIELD - matches backend
  bbox: BoundingBox | null;        // NEW FIELD - matches backend
  workshop_id: string | null;
}
```

**⚠️ NOTE:** TypeScript types are NOT modified in this ticket. Frontend changes happen in T-0504-FRONT.

---

### Database Changes (SQL)

**Migration File:** `supabase/migrations/20260219000001_add_low_poly_url_bbox.sql`

```sql
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
ALTER TABLE blocks 
ADD COLUMN IF NOT EXISTS low_poly_url TEXT NULL;

COMMENT ON COLUMN blocks.low_poly_url IS 
'URL pública del archivo GLB simplificado (~1000 triángulos). 
Generado por Celery task tras validación. 
Format: https://xyz.supabase.co/storage/v1/object/public/processed-geometry/low-poly/{id}.glb';

-- ============================================
-- STEP 2: Add bbox column (3D Bounding Box)
-- ============================================
ALTER TABLE blocks 
ADD COLUMN IF NOT EXISTS bbox JSONB NULL;

COMMENT ON COLUMN blocks.bbox IS 
'3D Bounding box from Rhino model. 
Schema: {"min": [x,y,z], "max": [x,y,z]} 
Example: {"min": [-2.5, 0, -2.5], "max": [2.5, 5, 2.5]}';

-- ============================================
-- STEP 3: Create canvas query index (composite)
-- ============================================
-- Purpose: Optimize GET /api/parts?status=X&tipologia=Y&workshop_id=Z
-- Target query time: <500ms for 500 rows
CREATE INDEX IF NOT EXISTS idx_blocks_canvas_query 
ON blocks(status, tipologia, workshop_id) 
WHERE is_archived = false;

-- ============================================
-- STEP 4: Create processing queue index (partial)
-- ============================================
-- Purpose: Find next block needing GLB generation
-- Target query time: <10ms
CREATE INDEX IF NOT EXISTS idx_blocks_low_poly_processing
ON blocks(status)
WHERE low_poly_url IS NULL AND is_archived = false;

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
```

**Migration Characteristics:**
- **Duration:** <30s (ALTERs with NULL are instant, indexes take ~5s each on 500 rows)
- **Locking:** No table lock (ADD COLUMN with NULL is non-blocking in PostgreSQL 11+)
- **Idempotent:** Uses `IF NOT EXISTS` - safe to re-run
- **Rollback-safe:** Single transaction with verification checks

---

## 3. API Interface

**⚠️ NOT APPLICABLE:** This ticket only modifies database schema. No API endpoints are created.

**Downstream API (T-0501-BACK):**
```
GET /api/parts?status=validated&tipologia=capitel
→ Will return low_poly_url and bbox in response
→ Depends on this migration completing first
```

---

## 4. Component Contract

**⚠️ NOT APPLICABLE:** This ticket does not create frontend components. Frontend changes happen in T-0504-FRONT.

---

## 5. Test Cases Checklist

### Happy Path (Database Operations)

- [ ] **Test 1: Column low_poly_url exists**
  - Query `information_schema.columns` for `blocks.low_poly_url`
  - Assert: column exists with type `TEXT`, nullable `YES`

- [ ] **Test 2: Column bbox exists**
  - Query `information_schema.columns` for `blocks.bbox`
  - Assert: column exists with type `JSONB`, nullable `YES`

- [ ] **Test 3: Update low_poly_url successfully**
  - Insert test block with `low_poly_url = NULL`
  - Update to valid URL: `https://example.com/low-poly.glb`
  - Assert: value persisted correctly

- [ ] **Test 4: Update bbox successfully**
  - Insert test block with `bbox = NULL`
  - Update to valid JSON: `{"min": [-1, -1, -1], "max": [1, 1, 1]}`
  - Assert: JSONB stored correctly, query `bbox->'min'` returns array

### Edge Cases (Data Validation)

- [ ] **Test 5: NULL values allowed initially**
  - Insert block without `low_poly_url` and `bbox`
  - Assert: both columns default to `NULL`

- [ ] **Test 6: Very long URL accepted**
  - Insert block with 300-character URL in `low_poly_url`
  - Assert: TEXT type handles long URLs (no truncation)

- [ ] **Test 7: Invalid JSON rejected by client**
  - Attempt to insert `bbox` with invalid JSON (application-level validation)
  - Assert: Pydantic raises validation error (not DB constraint)

- [ ] **Test 8: Empty JSONB object allowed**
  - Insert block with `bbox = {}`
  - Assert: Stored successfully (validation is application-level)

### Security/Performance (Indexes)

- [ ] **Test 9: Index idx_blocks_canvas_query exists**
  - Query `pg_indexes` for `idx_blocks_canvas_query`
  - Assert: index exists, definition matches composite (status, tipologia, workshop_id)

- [ ] **Test 10: Index idx_blocks_low_poly_processing exists**
  - Query `pg_indexes` for `idx_blocks_low_poly_processing`
  - Assert: index exists, partial index on `low_poly_url IS NULL`

- [ ] **Test 11: Canvas query uses index (EXPLAIN ANALYZE)**
  - Run query: `SELECT * FROM blocks WHERE status='validated' AND tipologia='capitel' AND workshop_id='123'`
  - Run `EXPLAIN ANALYZE` on query
  - Assert: execution plan includes `Index Scan using idx_blocks_canvas_query`

- [ ] **Test 12: Processing query uses partial index**
  - Run query: `SELECT * FROM blocks WHERE status='validated' AND low_poly_url IS NULL AND is_archived=false`
  - Run `EXPLAIN ANALYZE`
  - Assert: execution plan includes `Index Scan using idx_blocks_low_poly_processing`

- [ ] **Test 13: Index size is reasonable**
  - Query: `SELECT pg_size_pretty(pg_relation_size('idx_blocks_canvas_query'))`
  - Assert: size <100 KB (should be ~20 KB for 500 rows)

### Integration (Migration Workflow)

- [ ] **Test 14: Migration applies cleanly**
  - Run: `supabase migration up` in clean database
  - Assert: No errors, migration completes in <30s

- [ ] **Test 15: Migration is idempotent**
  - Run migration twice in same database
  - Assert: Second run succeeds with "already exists" notices, no errors

- [ ] **Test 16: Rollback works correctly**
  - Apply migration
  - Run rollback script (DROP columns + indexes)
  - Assert: Table returns to pre-migration state

- [ ] **Test 17: Existing data unaffected**
  - Insert 100 blocks before migration
  - Run migration
  - Assert: All 100 blocks still exist, new columns are NULL

### Performance Benchmarks

- [ ] **Test 18: Canvas query performance <500ms**
  - Seed 500 blocks with filters
  - Run canvas query 10 times, measure avg execution time
  - Assert: avg <500ms, stddev <50ms

- [ ] **Test 19: Processing queue query <10ms**
  - Seed 500 blocks, 50 with `low_poly_url = NULL`
  - Run processing queue query 10 times
  - Assert: avg <10ms (partial index should make this instant)

- [ ] **Test 20: No blocking during migration**
  - Run migration in staging with 1000 rows
  - Simultaneously run SELECT queries from another session
  - Assert: SELECTs not blocked (ADD COLUMN with NULL is non-blocking)

---

## 6. Files to Create/Modify

### Create (1 file):
- `supabase/migrations/20260219000001_add_low_poly_url_bbox.sql` (SQL migration)

### Modify (0 files in this ticket):
- ⚠️ **NO backend or frontend code changes in T-0503-DB**
- Backend schemas modified in T-0501-BACK
- Frontend types modified in T-0504-FRONT

### Dependencies (Read-Only):
- `supabase/migrations/20260211155000_create_blocks_table.sql` (table must exist)
- `docs/05-data-model.md` (reference for schema design)

---

## 7. Reusable Components/Patterns

### From Existing Codebase:

**1. Migration Pattern (from 20260211160000_add_validation_report.sql):**
```sql
-- Pattern: Idempotent column addition with verification
ALTER TABLE blocks ADD COLUMN IF NOT EXISTS {column_name} {type} NULL;
COMMENT ON COLUMN blocks.{column_name} IS '{description}';

DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE ...) THEN
        RAISE EXCEPTION 'Migration failed';
    END IF;
END$$;
```
→ **Reuse this pattern** for `low_poly_url` and `bbox` columns

**2. Partial Index Pattern (PostgreSQL best practice):**
```sql
-- Pattern: Index only relevant rows (reduces size, improves performance)
CREATE INDEX IF NOT EXISTS {index_name}
ON {table}({columns})
WHERE {condition};  -- Only index 10% of rows
```
→ **Reuse this pattern** for `idx_blocks_low_poly_processing` (only NULL low_poly_url)

**3. Composite Index Pattern (from docs/05-data-model.md):**
```sql
-- Pattern: Left-to-right index for multi-column queries
CREATE INDEX idx_{table}_{col1}_{col2}_{col3}
ON {table}({col1}, {col2}, {col3});
-- Supports queries filtering:
--   - col1
--   - col1, col2
--   - col1, col2, col3
```
→ **Reuse this pattern** for `idx_blocks_canvas_query` (status, tipologia, workshop_id)

### Patterns NOT to Reuse:

**❌ Don't use CHECK constraints on JSONB:**
```sql
-- BAD: Complex CHECK constraint hard to maintain
ALTER TABLE blocks 
ADD CONSTRAINT chk_bbox_schema 
CHECK (jsonb_typeof(bbox->'min') = 'array' AND ...);
```
→ **Instead:** Validate in Pydantic (application-level validation more flexible)

---

## 8. Next Steps

### This spec is ready for **TDD-Red Phase**. 

Use workflow step `:tdd-red` with the following data:

```
=============================================
READY FOR TDD-RED PHASE - Copy these values:
=============================================
Ticket ID:       T-0503-DB
Feature name:    Add low_poly_url and bbox columns + Canvas indexes
Test framework:  pytest (backend integration tests)
Key test cases:  
  1. Columns exist and accept NULL values
  2. low_poly_url stores TEXT URLs correctly
  3. bbox stores JSONB with min/max arrays
  4. idx_blocks_canvas_query exists and is used
  5. idx_blocks_low_poly_processing exists and is used
  6. Migration completes in <30s
  7. Index size <100 KB
  8. Query performance: Canvas <500ms, Processing <10ms

Files to create:
  - supabase/migrations/20260219000001_add_low_poly_url_bbox.sql

Test file to create:
  - src/backend/tests/integration/test_blocks_schema_t0503.py
  
Dependencies:
  - Upstream: T-0500-INFRA (completed ✅)
  - Blocks: T-0501-BACK, T-0502-AGENT

Acceptance Criteria (from backlog):
  - Columns exist
  - Indexes created
  - Query uses canvas index (EXPLAIN ANALYZE verified)
  - Migration <30s

Performance Targets:
  - Canvas query: <500ms for 500 rows
  - Processing query: <10ms
  - Index size: <100 KB
=============================================
```

---

## 9. Memory Bank Updates

### Update `memory-bank/activeContext.md`:
```markdown
## Active Ticket
**T-0503-DB** (In Progress - Enrichment Phase)
- Phase: STEP 1/5 - Contract Definition ✅
- Migration file spec created
- Test cases defined (20 tests)
- Next: TDD-Red (write failing tests)
```

### Update `memory-bank/systemPatterns.md` (after completion):
```markdown
## Database Migration Patterns

### Composite Indexes for Multi-Filter Queries
**Pattern Used in:** T-0503-DB (idx_blocks_canvas_query)
**Purpose:** Optimize queries with multiple WHERE conditions

```sql
CREATE INDEX idx_{table}_{purpose}
ON {table}({col1}, {col2}, {col3})
WHERE {global_filter};
```

**Benefits:**
- Supports left-prefix queries (col1, col1+col2, col1+col2+col3)
- Partial index reduces size by 90% (WHERE active rows only)
- Fits in shared_buffers (<100 KB for 500 rows)

### Partial Indexes for Queue Optimization
**Pattern Used in:** T-0503-DB (idx_blocks_low_poly_processing)
**Purpose:** Index only unprocessed items in a queue

```sql
CREATE INDEX idx_{table}_{queue_name}
ON {table}({status_column})
WHERE {unprocessed_condition};
```

**Benefits:**
- Self-cleaning: items exit index when processed
- Tiny size: <10 KB for 50 pending items
- Query time: <10ms vs 200ms full table scan
```

---

## 10. Rollback Plan

### If migration fails or needs rollback:

```sql
-- File: supabase/migrations/ROLLBACK_20260219000001.sql
BEGIN;

-- Drop indexes first (no dependencies)
DROP INDEX IF EXISTS idx_blocks_canvas_query;
DROP INDEX IF EXISTS idx_blocks_low_poly_processing;

-- Drop columns (cascade not needed, no foreign keys)
ALTER TABLE blocks DROP COLUMN IF EXISTS low_poly_url;
ALTER TABLE blocks DROP COLUMN IF EXISTS bbox;

-- Verify rollback
DO $$
BEGIN
    IF EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_name='blocks' AND column_name IN ('low_poly_url', 'bbox')
    ) THEN
        RAISE EXCEPTION 'Rollback failed: columns still exist';
    END IF;
    
    RAISE NOTICE 'Rollback successful';
END$$;

COMMIT;
```

**When to rollback:**
- Migration takes >60s (unexpected lock detected)
- Index creation fails (out of disk space)
- Downstream ticket T-0501-BACK changes API contract (columns need rename)

---

## 11. References & Documentation

### Internal Docs:
- [09-mvp-backlog.md](../09-mvp-backlog.md#L249) - Ticket definition
- [05-data-model.md](../05-data-model.md#L197) - blocks table schema
- [T-0503-DB-TechnicalSpec.md (original)](./T-0503-DB-TechnicalSpec.md) - Extended spec with POC details

### PostgreSQL Documentation:
- [Partial Indexes](https://www.postgresql.org/docs/15/indexes-partial.html)
- [Multicolumn Indexes](https://www.postgresql.org/docs/15/indexes-multicolumn.html)
- [JSONB Type](https://www.postgresql.org/docs/15/datatype-json.html)
- [ALTER TABLE Performance](https://www.postgresql.org/docs/15/sql-altertable.html)

### Related Tickets:
- **T-0501-BACK:** Will consume `low_poly_url` and `bbox` in GET /api/parts
- **T-0502-AGENT:** Will populate `low_poly_url` after GLB generation
- **T-0504-FRONT:** Will render 3D parts using `low_poly_url`

---

**Status:** ✅ **READY FOR TDD-RED**  
**Last Updated:** 2026-02-19 05:00 UTC  
**Next Phase:** Write failing tests for migration (pytest integration tests)  
**Estimated Implementation Time:** 2 hours (1 SP)
