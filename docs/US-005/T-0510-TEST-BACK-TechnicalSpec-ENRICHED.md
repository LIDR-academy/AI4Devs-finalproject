# Technical Specification: T-0510-TEST-BACK (ENRICHED)

**Ticket ID:** T-0510-TEST-BACK  
**Story:** US-005 - Dashboard 3D Interactivo  
**Sprint:** Sprint 1 (Semana 2)  
**Estimación:** 3 Story Points (~6 horas)  
**Status:** ENRICHED (Ready for TDD-RED)  
**Author:** AI Assistant (Claude Sonnet 4.5 via GitHub Copilot)  
**Date:** 2026-02-23

---

## 1. Ticket Summary

- **Tipo:** BACK (Backend Integration Tests)
- **Alcance:** Comprehensive integration test suite for GET /api/parts endpoint with 5 specialized test suites focusing on different quality attributes (Functional, Filter, RLS, Performance, Index Usage)
- **Dependencias:** 
  - T-0501-BACK (List Parts API - DONE 2026-02-20) 
  - T-0503-DB (Database columns & indexes - DONE 2026-02-19)
  - T-0502-AGENT (Low-poly GLB generation - DONE 2026-02-19)

---

## 2. Context & Current State

### Existing Test Coverage (T-0501-BACK)
The endpoint `GET /api/parts` has been implemented and validated with **32/32 tests PASS (100%)**:
- **Integration tests:** 20 tests in `tests/integration/test_parts_api.py`
- **Unit tests:** 12 tests in `tests/unit/test_parts_service.py`

**Current test structure** (single file, mixed concerns):
- Happy Path: Tests 1-6 (basic fetching, filters, new columns)
- Edge Cases: Tests 7-11 (empty results, NULL values, archived exclusion)
- Security/Errors: Tests 12-15 (auth, validation, SQL injection)
- Integration: Tests 16-20 (performance, RLS, index usage - **incomplete placeholders**)

### Gap Analysis
**Problem:** Current tests are monolithic (single 800-line file) and lack specialized scenarios for:
1. **Performance validation** (response time <500ms, size <200KB)
2. **Index usage verification** (EXPLAIN ANALYZE queries)
3. **RLS enforcement testing** (with real user contexts)
4. **Large dataset stress testing** (500+ parts realistic scenario)

**Solution:** T-0510-TEST-BACK will:
1. **Reorganize** existing tests into 5 specialized suites
2. **Complete** placeholder tests (performance, RLS, index usage)
3. **Add** missing coverage (3 new tests)
4. **Total:** 23 comprehensive integration tests (original 20 reorganized + 3 new)

---

## 3. Test Suite Architecture

### Suite Organization Strategy
Tests will be split into **5 files** by quality attribute:

```
tests/integration/parts_api/
├── test_functional_core.py        # 6 tests - Basic CRUD & Happy Paths
├── test_filters_validation.py     # 5 tests - Dynamic filtering logic
├── test_rls_policies.py           # 4 tests - Row Level Security enforcement
├── test_performance_scalability.py # 4 tests - Response time, payload size, stress
└── test_index_usage.py            # 4 tests - Query plans, optimization validation
```

### Test Case Mapping (20 existing → 23 organized)

#### **Suite 1: Functional Core (6 tests)** ✅ Already Implemented
| Test ID | Description | Current Location | Status |
|---------|-------------|------------------|--------|
| F-01 | Fetch all parts without filters | test_parts_api.py L36 | ✅ PASS |
| F-02 | Parts include low_poly_url field | test_parts_api.py L224 | ✅ PASS |
| F-03 | Parts include bbox JSONB field | test_parts_api.py L224 | ✅ PASS |
| F-04 | Empty database returns 200 + empty array | test_parts_api.py L346 | ✅ PASS |
| F-05 | Archived parts excluded from results | test_parts_api.py L365 | ✅ PASS |
| F-06 | Consistent ordering (created_at DESC) | test_parts_api.py L800 | ✅ PASS |

#### **Suite 2: Filters Validation (5 tests)** ✅ Already Implemented
| Test ID | Description | Current Location | Status |
|---------|-------------|------------------|--------|
| FI-01 | Filter by status only | test_parts_api.py L85 | ✅ PASS |
| FI-02 | Filter by tipologia only | test_parts_api.py L131 | ✅ PASS |
| FI-03 | Filter by workshop_id only | test_parts_api.py L165 | ✅ PASS |
| FI-04 | Multiple filters combined (AND logic) | test_parts_api.py L207 | ✅ PASS |
| FI-05 | No parts match filters (empty result) | test_parts_api.py L252 | ✅ PASS |

#### **Suite 3: RLS Policies (4 tests)** ⚠️ 2 Existing + 2 New
| Test ID | Description | Current Location | Status |
|---------|-------------|------------------|--------|
| RLS-01 | Workshop user sees assigned + unassigned parts | test_parts_api.py L684 | ⚠️ PLACEHOLDER |
| RLS-02 | Workshop user does NOT see other workshop parts | test_parts_api.py L684 | ⚠️ PLACEHOLDER |
| RLS-03 | BIM Manager sees ALL parts (no RLS filter) | test_parts_api.py L722 | ⚠️ PLACEHOLDER |
| RLS-04 | Service role key bypasses RLS (admin context) | **NEW TEST** | 🆕 TO IMPLEMENT |

#### **Suite 4: Performance & Scalability (4 tests)** ⚠️ 2 Existing + 2 New
| Test ID | Description | Current Location | Status |
|---------|-------------|------------------|--------|
| PERF-01 | Response time <500ms with 500 parts | test_parts_api.py L616 | ⚠️ PLACEHOLDER |
| PERF-02 | Response size <200KB gzipped (realistic dataset) | test_parts_api.py L643 | ⚠️ PLACEHOLDER |
| PERF-03 | Stress test: 1000 parts + 3 filters simultaneously | **NEW TEST** | 🆕 TO IMPLEMENT |
| PERF-04 | Memory stability: No leaks after 10 sequential requests | **NEW TEST** | 🆕 TO IMPLEMENT |

#### **Suite 5: Index Usage & Query Optimization (4 tests)** ⚠️ 1 Existing + 3 New
| Test ID | Description | Current Location | Status |
|---------|-------------|------------------|--------|
| IDX-01 | Query uses idx_blocks_canvas_query (EXPLAIN ANALYZE) | test_parts_api.py L588 | ⚠️ PLACEHOLDER |
| IDX-02 | Partial index triggers for low_poly_url IS NULL | **NEW TEST** | 🆕 TO IMPLEMENT |
| IDX-03 | No seq scan with filters (always index scan) | **NEW TEST** | 🆕 TO IMPLEMENT |
| IDX-04 | Index size remains <100KB after 1000 inserts | **NEW TEST** | 🆕 TO IMPLEMENT |

---

## 4. Data Structures & Contracts

### No New Schemas Required
This ticket **DOES NOT create new endpoints or schemas**. It validates the existing contract:

#### Existing Backend Schema (T-0501-BACK)
```python
# src/backend/schemas.py (Already implemented)
class PartCanvasItem(BaseModel):
    id: str
    iso_code: str
    status: BlockStatus
    tipologia: Tipologia
    low_poly_url: Optional[HttpUrl] = None
    bbox: Optional[BoundingBox] = None
    workshop_id: Optional[str] = None

class PartsListResponse(BaseModel):
    parts: List[PartCanvasItem]
    count: int
    filters_applied: Dict[str, str]
```

#### Existing API Interface (T-0501-BACK)
```
Endpoint: GET /api/parts
Query Params:
  - status: Optional[BlockStatus]
  - tipologia: Optional[Tipologia]
  - workshop_id: Optional[UUID]

Response 200:
{
  "parts": [PartCanvasItem],
  "count": int,
  "filters_applied": {status?: str, tipologia?: str, workshop_id?: str}
}

Response 400: {detail: "Invalid status value. Must be one of: ..."}
Response 500: {detail: "Failed to fetch parts: ..."}
```

### Database Schema (T-0503-DB - Already Applied)
```sql
-- Columns validated in tests
blocks.low_poly_url TEXT NULL
blocks.bbox JSONB NULL
blocks.is_archived BOOLEAN DEFAULT false

-- Indexes to verify
CREATE INDEX idx_blocks_canvas_query 
  ON blocks(status, tipologia, workshop_id) WHERE is_archived = false;

CREATE INDEX idx_blocks_low_poly_processing
  ON blocks(status) WHERE low_poly_url IS NULL AND is_archived = false;
```

---

## 5. Test Cases Checklist

### Suite 1: Functional Core (test_functional_core.py)
- [x] **F-01:** Fetch all parts without filters returns 200 + all non-archived
- [x] **F-02:** Response includes low_poly_url field (nullable)
- [x] **F-03:** Response includes bbox JSONB field with {min, max} structure
- [x] **F-04:** Empty database returns 200 + {parts: [], count: 0}
- [x] **F-05:** Archived parts (is_archived=true) excluded from results
- [x] **F-06:** Parts ordered by created_at DESC (newest first)

### Suite 2: Filters Validation (test_filters_validation.py)
- [x] **FI-01:** Filter by status only (e.g., ?status=validated)
- [x] **FI-02:** Filter by tipologia only (e.g., ?tipologia=capitel)
- [x] **FI-03:** Filter by workshop_id only (UUID validation)
- [x] **FI-04:** Multiple filters combined (AND logic: status + tipologia + workshop_id)
- [x] **FI-05:** No parts match filters → 200 + empty array (not 404)

### Suite 3: RLS Policies (test_rls_policies.py)
- [ ] **RLS-01:** Workshop user context: sees assigned parts (workshop_id=X) + unassigned (workshop_id=NULL)
- [ ] **RLS-02:** Workshop user context: does NOT see other workshop parts (workshop_id=Y where Y≠X)
- [ ] **RLS-03:** BIM Manager context: sees ALL parts regardless of workshop_id
- [ ] **RLS-04:** Service role key: bypasses RLS completely (admin full access)

### Suite 4: Performance & Scalability (test_performance_scalability.py)
- [ ] **PERF-01:** Response time <500ms with 500 parts + 3 filters (measured with time.perf_counter)
- [ ] **PERF-02:** Response size <200KB gzipped (realistic dataset with low_poly_url + bbox)
- [ ] **PERF-03:** Stress test: 1000 parts queried with all filters simultaneously (no timeout)
- [ ] **PERF-04:** Memory stability: 10 sequential requests with no memory leaks (psutil monitoring)

### Suite 5: Index Usage & Query Optimization (test_index_usage.py)
- [ ] **IDX-01:** EXPLAIN ANALYZE shows "Index Scan using idx_blocks_canvas_query" with filters
- [ ] **IDX-02:** Query for low_poly_url IS NULL uses idx_blocks_low_poly_processing (partial index)
- [ ] **IDX-03:** No sequential scans (Seq Scan) when filters present (always Index Scan)
- [ ] **IDX-04:** Index size remains <100KB after 1000 block inserts (pg_indexes check)

### Security & Error Handling (Already covered in test_parts_api.py - move to appropriate suites)
- [x] **SEC-01:** Invalid status enum → 400 + error message listing valid values
- [x] **SEC-02:** Invalid workshop_id UUID format → 400 + "Invalid UUID format"
- [x] **SEC-03:** SQL injection prevention (parameterized queries)

---

## 6. Files to Create/Modify

### Create (5 new test suite files)
```
tests/integration/parts_api/
├── __init__.py                     # Package marker
├── test_functional_core.py         # 6 tests (F-01 to F-06)
├── test_filters_validation.py      # 5 tests (FI-01 to FI-05)
├── test_rls_policies.py            # 4 tests (RLS-01 to RLS-04) - 3 NEW implementations
├── test_performance_scalability.py # 4 tests (PERF-01 to PERF-04) - 3 NEW implementations
└── test_index_usage.py             # 4 tests (IDX-01 to IDX-04) - 4 NEW implementations
```

### Modify (Existing files)
- **`tests/integration/test_parts_api.py`** → **ARCHIVE** (rename to `test_parts_api_v1_archived.py` for reference)
- **`tests/conftest.py`** → Add fixtures for:
  - `create_test_workshop_user()` - Mock Supabase auth context with workshop role
  - `create_test_bim_manager()` - Mock Supabase auth context with bim_manager role
  - `bulk_insert_blocks(count=500)` - Performance test data generator
  - `measure_query_time()` - Timing decorator for performance assertions

### Keep Unchanged
- **`tests/unit/test_parts_service.py`** → NO CHANGES (unit tests remain as-is, 12 tests)
- **`src/backend/api/parts.py`** → NO CHANGES (implementation already complete)
- **`src/backend/services/parts_service.py`** → NO CHANGES (implementation already complete)

---

## 7. Reusable Components/Patterns

### Existing Test Fixtures (from conftest.py)
- `supabase_client` → Already provides authenticated Supabase client with service role key
- `app` / `client` → TestClient for FastAPI endpoint testing

### Patterns to Extract for Reuse
From existing `test_parts_api.py`:

```python
# Pattern 1: Block cleanup helper
def cleanup_test_blocks(supabase: Client, block_ids: List[str]):
    """Idempotent cleanup for test blocks."""
    for block_id in block_ids:
        try:
            supabase.table("blocks").delete().eq("id", block_id).execute()
        except Exception:
            pass

# Pattern 2: Realistic block factory
def create_realistic_block(
    status: str = "validated",
    tipologia: str = "capitel",
    workshop_id: Optional[str] = None,
    include_geometry: bool = True
) -> Dict[str, Any]:
    """Generate realistic test block with optional geometry data."""
    block = {
        "id": str(uuid4()),
        "iso_code": f"SF-C12-D-{random.randint(1, 999):03d}",
        "status": status,
        "tipologia": tipologia,
        "workshop_id": workshop_id,
        "is_archived": False
    }
    if include_geometry:
        block["low_poly_url"] = f"https://supabase.co/storage/v1/object/processed-geometry/low-poly/{block['id']}.glb"
        block["bbox"] = {"min": [-2.5, 0.0, -2.5], "max": [2.5, 5.0, 2.5]}
    return block

# Pattern 3: Performance measurement context manager
import time
from contextlib import contextmanager

@contextmanager
def assert_execution_time(max_seconds: float, operation_name: str):
    """Assert operation completes within time budget."""
    start = time.perf_counter()
    yield
    elapsed = time.perf_counter() - start
    assert elapsed < max_seconds, f"{operation_name} took {elapsed:.2f}s (limit: {max_seconds}s)"
```

### New Patterns Needed

#### RLS Context Switching (test_rls_policies.py)
```python
@pytest.fixture
def workshop_user_client(supabase_url: str, workshop_a_jwt: str) -> Client:
    """Supabase client authenticated as workshop user (RLS active)."""
    from supabase import create_client
    return create_client(supabase_url, workshop_a_jwt)

# Usage in test:
def test_rls_workshop_scope(workshop_user_client: Client):
    result = workshop_user_client.table("blocks").select("*").execute()
    # RLS policy enforces: only see assigned + unassigned parts
```

#### EXPLAIN ANALYZE Query Plan Extraction (test_index_usage.py)
```python
import psycopg2

def get_query_plan(database_url: str, query: str, params: tuple) -> str:
    """Execute EXPLAIN ANALYZE and return query plan text."""
    conn = psycopg2.connect(database_url)
    cursor = conn.cursor()
    cursor.execute(f"EXPLAIN ANALYZE {query}", params)
    plan = "\n".join([row[0] for row in cursor.fetchall()])
    conn.close()
    return plan

# Usage in test:
def test_index_scan_used(database_url: str):
    query = "SELECT * FROM blocks WHERE status = %s AND is_archived = false"
    plan = get_query_plan(database_url, query, ("validated",))
    assert "Index Scan using idx_blocks_canvas_query" in plan
    assert "Seq Scan" not in plan  # No sequential scan
```

---

## 8. Implementation Strategy

### Phase 1: Test Suite Reorganization (No New Tests)
**Goal:** Extract existing 20 tests into 5 organized files

**Steps:**
1. Create `tests/integration/parts_api/` directory structure
2. Copy-paste tests from `test_parts_api.py` into new files:
   - **F-01 to F-06** → `test_functional_core.py`
   - **FI-01 to FI-05** → `test_filters_validation.py`
   - **SEC-01 to SEC-03** → Move to `test_filters_validation.py` (validation is filter-related)
3. Rename original file to `test_parts_api_v1_archived.py`
4. Run pytest: `pytest tests/integration/parts_api/ -v`
5. **Expected:** All 20 tests still PASS (zero regression)

### Phase 2: Complete Placeholder Tests (RLS, Performance)
**Goal:** Implement 6 incomplete placeholder tests

**RLS Tests (3 tests):**
- Create JWT fixtures for workshop user / BIM Manager
- Implement auth context switching in Supabase client
- Validate RLS policy behavior with real DB queries

**Performance Tests (3 tests):**
- Bulk insert 500-1000 test blocks (fixture with cleanup)
- Measure response time with `time.perf_counter()`
- Measure gzipped payload size with `gzip.compress()`
- Add memory profiling with `psutil.Process().memory_info()`

### Phase 3: Add Missing Tests (Index Verification)
**Goal:** Add 3 new index usage tests

**Index Tests (3 new):**
- Connect directly to PostgreSQL with psycopg2
- Execute EXPLAIN ANALYZE for query plans
- Parse plan text for index names and scan types
- Verify index sizes with `pg_indexes` system catalog

### Phase 4: Extract Shared Test Utilities
**Goal:** DRY principle - eliminate code duplication

**Create:** `tests/integration/parts_api/helpers.py`
- `cleanup_test_blocks()`
- `create_realistic_block()`
- `assert_execution_time()`
- `get_query_plan()`

**Update:** All 5 test files to import from helpers

---

## 9. Expected Test Execution Times

| Suite | Tests | Est. Duration | Reason |
|-------|-------|---------------|--------|
| Functional Core | 6 | ~8s | Simple queries, small datasets |
| Filters Validation | 5 | ~10s | Multiple filter combinations |
| RLS Policies | 4 | ~15s | Auth context switching overhead |
| Performance & Scalability | 4 | ~45s | Bulk inserts (500-1000 blocks) + cleanup |
| Index Usage | 4 | ~12s | EXPLAIN ANALYZE queries + pg_indexes checks |
| **TOTAL** | **23** | **~90s** | Full suite execution |

**Optimization strategy if >90s:**
- Use `pytest-xdist` for parallel execution: `pytest -n auto`
- Mark slow tests with `@pytest.mark.slow` for optional skip
- Use database transactions with rollback for faster cleanup

---

## 10. Success Criteria (Definition of Done)

### Code Quality
- [ ] All 23 tests pass individually: `pytest tests/integration/parts_api/test_*.py::test_name`
- [ ] All 23 tests pass in suite: `pytest tests/integration/parts_api/ -v`
- [ ] Zero regression: Unit tests still pass (12/12): `pytest tests/unit/test_parts_service.py`
- [ ] Test isolation verified: Random execution order passes (`pytest --random-order`)
- [ ] Code coverage >85% for `api/parts.py` (validated with pytest-cov)
- [ ] Code coverage >90% for `services/parts_service.py` (validated with pytest-cov)

### Documentation
- [ ] Each test has clear docstring with Given/When/Then structure
- [ ] README.md in `tests/integration/parts_api/` explains suite organization
- [ ] This Technical Spec updated with actual test results (execution time, coverage %)
- [ ] `memory-bank/systemPatterns.md` updated with test organization pattern
- [ ] `memory-bank/activeContext.md` reflects T-0510-TEST-BACK completion

### Integration
- [ ] CI/CD pipeline runs all 23 tests (update `.github/workflows/` if needed)
- [ ] Pre-commit hooks enforce test execution before push (optional)
- [ ] Test fixtures documented in `tests/conftest.py` with usage examples

### Performance Validation
- [ ] Performance tests confirm: response time <500ms (with 500 parts)
- [ ] Performance tests confirm: response size <200KB gzipped
- [ ] Index usage tests confirm: idx_blocks_canvas_query used (no Seq Scan)
- [ ] Index size tests confirm: indexes remain <100KB (actual: 24KB from T-0503-DB)

### Security Validation
- [ ] RLS tests confirm: Workshop users cannot see other workshop parts
- [ ] RLS tests confirm: BIM Managers see all parts (no RLS filter)
- [ ] RLS tests confirm: Service role key bypasses RLS (admin access)

---

## 11. Risk Assessment & Mitigation

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **RLS tests require Supabase Auth tier** | High (tests fail without proper JWT) | Medium | Use service role for RLS bypass tests; mock JWT for user context tests |
| **Performance tests flaky on slow CI runners** | Medium (false negatives) | High | Set conservative time limits (500ms → 1000ms on CI); use `@pytest.mark.slow` |
| **Database cleanup incomplete → test pollution** | High (cascading failures) | Medium | Use transactions with rollback; add `cleanup_all_test_blocks()` in conftest teardown |
| **EXPLAIN ANALYZE requires psycopg2 → new dependency** | Low (easy fix) | Low | Already in requirements.txt (psycopg2-binary==2.9.9) |
| **Index usage tests break with Supabase managed DB** | Medium (can't access pg_indexes) | Low | Use Supabase SQL Editor for manual verification; skip tests if direct DB access unavailable |

---

## 12. Next Steps (Handoff for TDD-RED Phase)

This Technical Specification is **COMPLETE** and ready for TDD implementation.

### Ready for TDD-RED Phase
Use this spec to initiate the TDD-RED workflow with the `:tdd-red` prompt template.

**Copy these values for TDD-RED handoff:**

```
=============================================
READY FOR TDD-RED PHASE - Copy these values:
=============================================
Ticket ID:       T-0510-TEST-BACK
Feature name:    Canvas API Integration Test Suite (5 specialized suites)
Key test cases:  
  - RLS-01: Workshop user context sees assigned + unassigned parts
  - RLS-04: Service role key bypasses RLS completely
  - PERF-01: Response time <500ms with 500 parts + 3 filters
  - PERF-03: Stress test 1000 parts with all filters simultaneously
  - IDX-01: EXPLAIN ANALYZE shows Index Scan (no Seq Scan)
  - IDX-03: Partial index triggers for low_poly_url IS NULL queries
  - IDX-04: Index size <100KB after 1000 inserts

Files to create:
  - tests/integration/parts_api/__init__.py
  - tests/integration/parts_api/test_functional_core.py
  - tests/integration/parts_api/test_filters_validation.py
  - tests/integration/parts_api/test_rls_policies.py
  - tests/integration/parts_api/test_performance_scalability.py
  - tests/integration/parts_api/test_index_usage.py
  - tests/integration/parts_api/helpers.py
  - tests/integration/parts_api/README.md

Files to modify:
  - tests/conftest.py (add RLS fixtures + bulk insert helpers)
  - tests/integration/test_parts_api.py (archive to _v1_archived.py)

Expected outcome:
  - 23 integration tests organized in 5 suites
  - 3 new RLS tests (workshop scope enforcement)
  - 3 new performance tests (response time, payload size, stress)
  - 4 new index usage tests (EXPLAIN ANALYZE verification)
  - Zero regression: existing 20 tests still pass after reorganization
  - Total execution time: ~90 seconds
=============================================
```

**Implementation approach:**
1. **Phase 1 (TDD-RED):** Create test files with failing tests (imports exist but assertions fail)
2. **Phase 2 (TDD-GREEN):** All tests already pass (implementation done in T-0501-BACK) - verify reorganization works
3. **Phase 3 (TDD-REFACTOR):** Extract shared helpers, add missing tests, verify performance targets

**IMPORTANT:** This is a **test-only ticket**. No production code changes needed (implementation complete in T-0501-BACK). Focus on test organization, completion of placeholders, and validation of non-functional requirements (performance, security, scalability).

---

## 13. Acceptance Criteria Validation

### From Backlog (docs/09-mvp-backlog.md)
**Original DoD for T-0510-TEST-BACK:**
> "23 tests passing, RLS verified, response size <200KB, query time <500ms, index usage verified with EXPLAIN ANALYZE"

### Expanded Criteria (This Spec)
- [x] **Test Count:** 23 integration tests (20 reorganized + 3 new)
- [x] **Test Organization:** 5 suites (Functional, Filter, RLS, Performance, Index Usage)
- [x] **RLS Verification:** 4 tests covering workshop scope + BIM Manager bypass
- [x] **Performance Validation:** 4 tests covering response time, size, stress, memory
- [x] **Index Usage:** 4 tests verifying EXPLAIN ANALYZE query plans
- [x] **Coverage:** >85% api/parts.py, >90% services/parts_service.py
- [x] **Zero Regression:** All existing 20 tests + 12 unit tests still pass
- [x] **Documentation:** README.md in test suite explaining organization

**Status:** ✅ Specification complete, ready for TDD-RED implementation

---

**Enriched By:** AI Assistant (Claude Sonnet 4.5 via GitHub Copilot)  
**Prompt:** ENRIQUECIMIENTO TÉCNICO - Ticket T-0510-TEST-BACK  
**Workflow Phase:** STEP 1/5 (Enrichment) — Pre-TDD planning complete  
**Next Phase:** TDD-RED (create test files, verify failures/passes based on existing implementation)
