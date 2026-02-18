# T-0503-DB: Add low_poly_url Column & Indexes

**Ticket ID:** T-0503-DB  
**Story:** US-005 - Dashboard 3D Interactivo  
**Sprint:** 1 (Semana 1)  
**Estimación:** 2 Story Points (~4 horas)  
**Responsable:** Backend Lead / DBA  
**Prioridad:** P0 (Blocking T-0501, T-0502)

---

## 📋 CONTEXT

### Problem Statement
La tabla `blocks` no tiene:
1. Column `low_poly_url` para almacenar URL del GLB simplificado
2. Column `bbox` para bounding box 3D
3. Índices optimizados para queries del Dashboard 3D

### Current Schema
```sql
-- Table: blocks
CREATE TABLE blocks (
    id UUID PRIMARY KEY,
    iso_code VARCHAR(255) NOT NULL,
    status VARCHAR(50),
    tipologia VARCHAR(50),
    original_file_url TEXT,
    rhino_metadata JSONB,
    workshop_id UUID REFERENCES workshops(id),
    created_at TIMESTAMPTZ,
    updated_at TIMESTAMPTZ,
    is_archived BOOLEAN DEFAULT FALSE
);

-- No indexes for canvas queries
```

### Target Schema
```sql
ALTER TABLE blocks 
ADD COLUMN low_poly_url TEXT NULL,
ADD COLUMN bbox JSONB NULL;

-- Indexes for Dashboard canvas queries
CREATE INDEX idx_blocks_canvas_query 
    ON blocks(status, tipologia, workshop_id) 
    WHERE is_archived = false;

CREATE INDEX idx_blocks_low_poly_processing
    ON blocks(status)
    WHERE low_poly_url IS NULL AND is_archived = false;
```

---

## 🎯 REQUIREMENTS

### FR-1: Add low_poly_url Column
```sql
ALTER TABLE blocks 
ADD COLUMN low_poly_url TEXT NULL;

COMMENT ON COLUMN blocks.low_poly_url IS 
'URL pública del archivo GLB simplificado (~1000 triángulos). 
Generado por Celery task tras validación. 
Format: https://xyz.supabase.co/storage/v1/object/public/processed-geometry/low-poly/{id}.glb';
```

**Characteristics:**
- Type: `TEXT` (URLs can be long, ~200 chars)
- Nullable: `NULL` (parts without processing yet)
- Default: `NULL`
- Immutable: NO (se actualiza cuando task completa)

**Validation:**
- URL must start with `https://`
- URL must end with `.glb`
- No CHECK constraint (validar en backend)

### FR-2: Add bbox Column (Bounding Box)
```sql
ALTER TABLE blocks 
ADD COLUMN bbox JSONB NULL;

COMMENT ON COLUMN blocks.bbox IS 
'3D Bounding box from Rhino model. 
Schema: {"min": [x,y,z], "max": [x,y,z]} 
Example: {"min": [-2.5, 0, -2.5], "max": [2.5, 5, 2.5]}';
```

**Schema Validation (Application Level):**
```python
# Pydantic model
class BoundingBox(BaseModel):
    min: List[float]  # Length must be 3
    max: List[float]  # Length must be 3
    
    @validator('min', 'max')
    def validate_length(cls, v):
        if len(v) != 3:
            raise ValueError('Must be [x, y, z]')
        return v
```

**MVP Decision:** Initially `NULL` (frontend uses default grid positioning). Populate in Sprint 2 when Rhino metadata extraction complete.

### FR-3: Canvas Query Index
```sql
CREATE INDEX idx_blocks_canvas_query 
ON blocks(status, tipologia, workshop_id) 
WHERE is_archived = false;
```

**Purpose:** Optimize `GET /api/parts?status=X&tipologia=Y&workshop_id=Z`

**Query Pattern:**
```sql
SELECT id, iso_code, status, tipologia, low_poly_url, bbox, workshop_id
FROM blocks
WHERE 
    is_archived = false
    AND status = 'validated'
    AND tipologia = 'capitel'
    AND workshop_id = '123-abc';
```

**Index Selectivity:**
- `status`: 5 values (20% selectivity)
- `tipologia`: 5 values (20% selectivity)
- `workshop_id`: ~10 workshops (10% selectivity)
- Combined: ~0.4% selectivity (highly selective)

**Index Size Estimation:**
- 500 rows × 40 bytes/entry = ~20 KB (tiny, fits in memory)

### FR-4: Processing Queue Index
```sql
CREATE INDEX idx_blocks_low_poly_processing
ON blocks(status)
WHERE low_poly_url IS NULL AND is_archived = false;
```

**Purpose:** Find parts pending GLB generation

**Query Pattern:**
```sql
-- Celery task finds next part to process
SELECT id, original_file_url
FROM blocks
WHERE 
    status = 'validated'
    AND low_poly_url IS NULL
    AND is_archived = false
ORDER BY created_at ASC
LIMIT 1;
```

**Why Partial Index:** Only indexes rows needing processing (~10% of data initially), saves space.

### FR-5: GIN Index on rhino_metadata (Optional, Fase 2)
```sql
CREATE INDEX idx_blocks_rhino_metadata_gin
ON blocks USING GIN (rhino_metadata);
```

**Purpose:** Fast searches on metadata fields

**Query Example:**
```sql
SELECT * 
FROM blocks 
WHERE rhino_metadata->'dimensions'->>'height' > '5.0';
```

**Decision:** Skip in MVP (no advanced metadata queries yet), add in Sprint 3.

---

## 🔨 IMPLEMENTATION

### Step 1: Create Migration File (10 min)
**File:** `supabase/migrations/20260218000001_add_low_poly_url_bbox.sql`

```sql
-- Migration: Add columns for 3D Dashboard
-- Ticket: T-0503-DB
-- Date: 2026-02-18

BEGIN;

-- 1. Add low_poly_url column
ALTER TABLE blocks 
ADD COLUMN IF NOT EXISTS low_poly_url TEXT NULL;

COMMENT ON COLUMN blocks.low_poly_url IS 
'URL pública del archivo GLB simplificado (~1000 triángulos). 
Generado por Celery task tras validación. 
Format: https://xyz.supabase.co/storage/v1/object/public/processed-geometry/low-poly/{id}.glb';

-- 2. Add bbox column
ALTER TABLE blocks 
ADD COLUMN IF NOT EXISTS bbox JSONB NULL;

COMMENT ON COLUMN blocks.bbox IS 
'3D Bounding box from Rhino model. 
Schema: {"min": [x,y,z], "max": [x,y,z]}';

-- 3. Create canvas query index (composite)
CREATE INDEX IF NOT EXISTS idx_blocks_canvas_query 
ON blocks(status, tipologia, workshop_id) 
WHERE is_archived = false;

-- 4. Create processing queue index (partial)
CREATE INDEX IF NOT EXISTS idx_blocks_low_poly_processing
ON blocks(status)
WHERE low_poly_url IS NULL AND is_archived = false;

-- 5. Verify indexes created
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_blocks_canvas_query'
    ) THEN
        RAISE EXCEPTION 'Index idx_blocks_canvas_query not created';
    END IF;
    
    IF NOT EXISTS (
        SELECT 1 FROM pg_indexes 
        WHERE indexname = 'idx_blocks_low_poly_processing'
    ) THEN
        RAISE EXCEPTION 'Index idx_blocks_low_poly_processing not created';
    END IF;
END;
$$;

COMMIT;
```

### Step 2: Apply Migration (5 min)
```bash
# Local development
cd supabase
supabase migration up

# Production
supabase db push
```

### Step 3: Verify Column Existence (5 min)
```sql
-- Check columns
SELECT 
    column_name, 
    data_type, 
    is_nullable, 
    column_default
FROM information_schema.columns 
WHERE 
    table_name = 'blocks' 
    AND column_name IN ('low_poly_url', 'bbox');

-- Expected result:
-- low_poly_url | text | YES | NULL
-- bbox         | jsonb | YES | NULL
```

### Step 4: Verify Indexes (5 min)
```sql
-- List all indexes on blocks table
SELECT 
    indexname, 
    indexdef,
    pg_size_pretty(pg_relation_size(indexname::regclass)) as size
FROM pg_indexes
WHERE tablename = 'blocks';

-- Expected to include:
-- idx_blocks_canvas_query | CREATE INDEX ... ON blocks(status, tipologia, workshop_id) WHERE ...
-- idx_blocks_low_poly_processing | CREATE INDEX ... ON blocks(status) WHERE low_poly_url IS NULL ...
```

### Step 5: Analyze Query Performance (10 min)
```sql
-- Query 1: Canvas load (all parts)
EXPLAIN ANALYZE
SELECT id, iso_code, status, tipologia, low_poly_url, bbox, workshop_id
FROM blocks
WHERE is_archived = false;

-- Should use: Seq Scan (no filters yet, OK)

-- Query 2: Canvas with filters
EXPLAIN ANALYZE
SELECT id, iso_code, status, tipologia, low_poly_url, bbox, workshop_id
FROM blocks
WHERE 
    is_archived = false
    AND status = 'validated'
    AND tipologia = 'capitel';

-- Should use: Index Scan using idx_blocks_canvas_query

-- Query 3: Processing queue
EXPLAIN ANALYZE
SELECT id, original_file_url
FROM blocks
WHERE 
    status = 'validated'
    AND low_poly_url IS NULL
    AND is_archived = false
ORDER BY created_at ASC
LIMIT 1;

-- Should use: Index Scan using idx_blocks_low_poly_processing
```

### Step 6: Update SQLAlchemy Model (15 min)
**File:** `src/backend/models.py`

```python
from sqlalchemy import Column, String, Text, Boolean, TIMESTAMP, JSON
from sqlalchemy.dialects.postgresql import UUID, JSONB

class Block(Base):
    __tablename__ = "blocks"
    
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    iso_code = Column(String(255), nullable=False, unique=True)
    status = Column(String(50), nullable=False, default="uploaded")
    tipologia = Column(String(50), nullable=False)
    
    # URLs
    original_file_url = Column(Text, nullable=True)
    low_poly_url = Column(Text, nullable=True)  # NEW
    
    # Metadata
    rhino_metadata = Column(JSONB, nullable=True)
    bbox = Column(JSONB, nullable=True)  # NEW
    
    # Relations
    workshop_id = Column(UUID(as_uuid=True), ForeignKey("workshops.id"), nullable=True)
    
    # Audit
    created_at = Column(TIMESTAMP(timezone=True), server_default=func.now())
    updated_at = Column(TIMESTAMP(timezone=True), onupdate=func.now())
    is_archived = Column(Boolean, default=False)
    
    # Indexes (declarative, corresponds to SQL migrations)
    __table_args__ = (
        Index(
            'idx_blocks_canvas_query',
            'status', 'tipologia', 'workshop_id',
            postgresql_where=(is_archived == False)
        ),
        Index(
            'idx_blocks_low_poly_processing',
            'status',
            postgresql_where=(
                (low_poly_url.is_(None)) & (is_archived == False)
            )
        ),
    )
```

---

## ✅ DEFINITION OF DONE

### Acceptance Criteria
- [ ] **AC-1:** Column `low_poly_url` exists with type `TEXT NULL`
- [ ] **AC-2:** Column `bbox` exists with type `JSONB NULL`
- [ ] **AC-3:** Index `idx_blocks_canvas_query` created successfully
- [ ] **AC-4:** Index `idx_blocks_low_poly_processing` created successfully
- [ ] **AC-5:** Query `SELECT ... WHERE status='validated'` uses canvas index
- [ ] **AC-6:** SQLAlchemy model updated with new columns
- [ ] **AC-7:** Migration file committed in `supabase/migrations/`
- [ ] **AC-8:** Migration applied successfully in dev + staging
- [ ] **AC-9:** Index sizes <50 KB (verify with `pg_relation_size`)
- [ ] **AC-10:** No existing data broken (all NULLs initially)

### Quality Gates
```sql
-- 1. Columns exist
SELECT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name='blocks' AND column_name='low_poly_url'
);  -- Should return: true

-- 2. Indexes exist
SELECT EXISTS (
    SELECT 1 FROM pg_indexes 
    WHERE indexname='idx_blocks_canvas_query'
);  -- Should return: true

-- 3. Index is used
EXPLAIN (FORMAT JSON) 
SELECT * FROM blocks WHERE status='validated' AND tipologia='capitel';
-- Should include: "Index Name": "idx_blocks_canvas_query"

-- 4. No broken data
SELECT COUNT(*) FROM blocks WHERE low_poly_url IS NOT NULL;
-- Should return: 0 (initially all NULL)
```

---

## 🧪 TESTING

### Integration Test
**File:** `src/backend/tests/integration/test_blocks_schema.py`

```python
from sqlalchemy import inspect
from src.backend.models import Block
from src.backend.database import engine

def test_low_poly_url_column_exists():
    """Column low_poly_url should exist in blocks table"""
    inspector = inspect(engine)
    columns = [c['name'] for c in inspector.get_columns('blocks')]
    
    assert 'low_poly_url' in columns

def test_bbox_column_exists():
    """Column bbox should exist in blocks table"""
    inspector = inspect(engine)
    columns = [c['name'] for c in inspector.get_columns('blocks')]
    
    assert 'bbox' in columns

def test_canvas_index_exists(db_session):
    """Index idx_blocks_canvas_query should exist"""
    result = db_session.execute(text(
        "SELECT 1 FROM pg_indexes WHERE indexname='idx_blocks_canvas_query'"
    ))
    
    assert result.fetchone() is not None

def test_processing_index_exists(db_session):
    """Index idx_blocks_low_poly_processing should exist"""
    result = db_session.execute(text(
        "SELECT 1 FROM pg_indexes WHERE indexname='idx_blocks_low_poly_processing'"
    ))
    
    assert result.fetchone() is not None

def test_update_low_poly_url(db_session, sample_block):
    """Should be able to update low_poly_url"""
    sample_block.low_poly_url = "https://example.com/low-poly.glb"
    db_session.commit()
    db_session.refresh(sample_block)
    
    assert sample_block.low_poly_url == "https://example.com/low-poly.glb"

def test_update_bbox(db_session, sample_block):
    """Should be able to store bbox as JSONB"""
    bbox_data = {"min": [-2.5, 0, -2.5], "max": [2.5, 5, 2.5]}
    sample_block.bbox = bbox_data
    db_session.commit()
    db_session.refresh(sample_block)
    
    assert sample_block.bbox == bbox_data
    assert sample_block.bbox['min'] == [-2.5, 0, -2.5]
```

### Performance Test
```python
def test_canvas_query_uses_index(db_session, seed_500_blocks):
    """Query with filters should use idx_blocks_canvas_query"""
    from sqlalchemy import text
    
    explain = db_session.execute(text(
        """
        EXPLAIN (FORMAT JSON)
        SELECT * FROM blocks 
        WHERE 
            is_archived = false
            AND status = 'validated'
            AND tipologia = 'capitel'
        """
    ))
    
    plan = explain.fetchone()[0]
    plan_str = str(plan)
    
    # Verify index is used
    assert 'idx_blocks_canvas_query' in plan_str
    assert 'Seq Scan' not in plan_str  # Should NOT do full table scan

def test_processing_query_performance(db_session, seed_500_blocks):
    """Processing queue query should complete <10ms"""
    import time
    
    start = time.time()
    result = db_session.execute(text(
        """
        SELECT id FROM blocks 
        WHERE 
            status = 'validated'
            AND low_poly_url IS NULL
            AND is_archived = false
        LIMIT 1
        """
    ))
    elapsed_ms = (time.time() - start) * 1000
    
    assert elapsed_ms < 10, f"Query too slow: {elapsed_ms}ms"
```

---

## 📦 DELIVERABLES

1. ✅ Migration file: `supabase/migrations/20260218000001_add_low_poly_url_bbox.sql`
2. ✅ Updated model: `src/backend/models.py` (Block class)
3. ✅ Integration tests: `tests/integration/test_blocks_schema.py` (8 tests)
4. ✅ EXPLAIN ANALYZE results showing index usage
5. ✅ Documentation: Comments on columns in database
6. ✅ Index size report: `pg_relation_size` output

---

## 🔗 DEPENDENCIES

### Upstream (Must Complete First)
- None (foundational database change)

### Downstream (Blocked by This)
- `T-0501-BACK`: Endpoint needs these columns
- `T-0502-AGENT`: Task writes to `low_poly_url`

### External
- Supabase CLI installed (`supabase` command)
- Database superuser access (for index creation)

---

## ⚠️ RISKS & MITIGATION

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Migration fails on production** | Critical | Low | Test in staging first, use IF NOT EXISTS |
| **Index too large** | Medium | Low | Monitor size with `pg_relation_size`, partial indexes used |
| **Slow migration (table lock)** | Medium | Low | Add columns with NULL (fast), create indexes CONCURRENTLY (no lock) |
| **JSONB bbox validation** | Low | Medium | Validate in application (Pydantic), not database CHECK constraint |

### Rollback Plan
```sql
-- If migration needs rollback
BEGIN;

DROP INDEX IF EXISTS idx_blocks_canvas_query;
DROP INDEX IF EXISTS idx_blocks_low_poly_processing;

ALTER TABLE blocks DROP COLUMN IF EXISTS low_poly_url;
ALTER TABLE blocks DROP COLUMN IF EXISTS bbox;

COMMIT;
```

---

## 📚 REFERENCES

- PostgreSQL Indexes: https://www.postgresql.org/docs/current/indexes.html
- Partial Indexes: https://www.postgresql.org/docs/current/indexes-partial.html
- JSONB Type: https://www.postgresql.org/docs/current/datatype-json.html
- Index Size Monitoring: `pg_relation_size()`, `pg_indexes_size()`
- Supabase Migrations: https://supabase.com/docs/guides/database/migrations

---

**Status:** ✅ Ready for Implementation  
**Last Updated:** 2026-02-18  
**Migration File:** `supabase/migrations/20260218000001_add_low_poly_url_bbox.sql`
