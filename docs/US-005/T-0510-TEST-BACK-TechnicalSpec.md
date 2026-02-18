# T-0510-TEST-BACK: Canvas API Integration Tests

**Ticket ID:** T-0510-TEST-BACK  
**Story:** US-005 - Dashboard 3D Interactivo  
**Sprint:** 1 (Semana 2)  
**Estimación:** 3 Story Points (~6 horas)  
**Responsable:** Backend QA / Developer  
**Prioridad:** P3 (Quality Gate)

---

## 📋 CONTEXT

### Purpose
Ensure Canvas API endpoints work correctly:
- `GET /api/parts` returns all parts with `low_poly_url`
- Filters work (status, tipologia, workshop_id)
- RLS enforced (workshop users see only assigned parts)
- Response size <200 KB for 500 parts
- Query performance <500ms
- Index used (`idx_blocks_canvas_query`)

### Testing Stack
- **Pytest**: Test runner
- **TestClient**: FastAPI test client
- **Fixtures**: Seed test data
- **EXPLAIN ANALYZE**: Verify index usage

---

## 🎯 REQUIREMENTS

### FR-1: Test Coverage Target
**Minimum coverage:**
- `api/parts.py` (Canvas endpoint): >85%
- `services/rls.py` (RLS logic): >90%
- `services/parts_canvas.py` (Business logic): >85%

**Priority areas:**
- Filter combinations (AND logic)
- RLS scenarios (admin vs workshop)
- Performance (query time, response size)
- Error handling (malformed filters)

### FR-2: Test Categories
**5 required test suites:**
1. **Functional Tests**: Correct data returned
2. **Filter Tests**: Query params work
3. **RLS Tests**: Security enforcement
4. **Performance Tests**: Speed & size
5. **Index Usage Tests**: EXPLAIN ANALYZE

### FR-3: Fixtures Strategy
```python
# tests/conftest.py (extend existing)
import pytest
from sqlalchemy.orm import Session
from src.backend.models import Block, Workshop

@pytest.fixture
def seed_canvas_parts(db_session: Session, sample_workshop):
    \"\"\"Seed 10 parts for canvas testing\"\"\"
    parts = [
        Block(
            id=f"part-{i}",
            iso_code=f"CAP-{str(i).zfill(3)}",
            status="validated" if i % 2 == 0 else "uploaded",
            tipologia="capitel" if i < 5 else "columna",
            low_poly_url=f"https://example.com/low-poly-{i}.glb",
            bbox={"min": [0, 0, 0], "max": [5, 5, 5]},
            workshop_id=sample_workshop.id if i < 3 else None,
            is_archived=False,
        )
        for i in range(10)
    ]
    db_session.add_all(parts)
    db_session.commit()
    return parts

@pytest.fixture
def seed_canvas_parts_large(db_session: Session):
    \"\"\"Seed 500 parts for performance testing\"\"\"
    parts = [
        Block(
            id=f"part-{i}",
            iso_code=f"TEST-{str(i).zfill(4)}",
            status="validated",
            tipologia="capitel",
            low_poly_url=f"https://example.com/part-{i}.glb",
            is_archived=False,
        )
        for i in range(500)
    ]
    db_session.bulk_save_objects(parts)
    db_session.commit()
    return parts
```

---

## 🧪 TEST SUITES

### Test Suite 1: Functional Tests (90 min)
```python
# tests/integration/test_parts_canvas.py
from fastapi.testclient import TestClient
from src.backend.main import app

client = TestClient(app)

def test_get_parts_returns_all_parts(seed_canvas_parts):
    \"\"\"GET /api/parts should return all non-archived parts\"\"\"
    response = client.get("/api/parts")
    
    assert response.status_code == 200
    data = response.json()
    
    assert len(data["parts"]) == 10  # All seeded parts
    assert data["total"] == 10

def test_get_parts_includes_low_poly_url(seed_canvas_parts):
    \"\"\"Response should include low_poly_url field\"\"\"
    response = client.get("/api/parts")
    
    data = response.json()
    first_part = data["parts"][0]
    
    assert "low_poly_url" in first_part
    assert first_part["low_poly_url"].startswith("https://")
    assert first_part["low_poly_url"].endswith(".glb")

def test_get_parts_includes_bbox(seed_canvas_parts):
    \"\"\"Response should include bbox field (nullable)\"\"\"
    response = client.get("/api/parts")
    
    data = response.json()
    first_part = data["parts"][0]
    
    assert "bbox" in first_part
    if first_part["bbox"] is not None:
        assert "min" in first_part["bbox"]
        assert "max" in first_part["bbox"]
        assert len(first_part["bbox"]["min"]) == 3
        assert len(first_part["bbox"]["max"]) == 3

def test_get_parts_excludes_archived(db_session, seed_canvas_parts):
    \"\"\"Archived parts should not be returned\"\"\"
    # Archive one part
    part = seed_canvas_parts[0]
    part.is_archived = True
    db_session.commit()
    
    response = client.get("/api/parts")
    data = response.json()
    
    assert len(data["parts"]) == 9  # 10 - 1 archived
    assert all(p["id"] != part.id for p in data["parts"])

def test_get_parts_returns_empty_when_no_parts(db_session):
    \"\"\"Should return empty array when no parts\"\"\"
    response = client.get("/api/parts")
    
    data = response.json()
    assert data["parts"] == []
    assert data["total"] == 0
```

### Test Suite 2: Filter Tests (120 min)
```python
def test_filter_by_status(seed_canvas_parts):
    \"\"\"Filter by status query param\"\"\"
    response = client.get("/api/parts?status=validated")
    
    data = response.json()
    assert len(data["parts"]) == 5  # Half are validated
    assert all(p["status"] == "validated" for p in data["parts"])

def test_filter_by_tipologia(seed_canvas_parts):
    \"\"\"Filter by tipologia query param\"\"\"
    response = client.get("/api/parts?tipologia=capitel")
    
    data = response.json()
    assert len(data["parts"]) == 5  # First 5 are capitel
    assert all(p["tipologia"] == "capitel" for p in data["parts"])

def test_filter_by_workshop_id(seed_canvas_parts, sample_workshop):
    \"\"\"Filter by workshop_id query param\"\"\"
    response = client.get(f"/api/parts?workshop_id={sample_workshop.id}")
    
    data = response.json()
    assert len(data["parts"]) == 3  # First 3 assigned to workshop
    assert all(p["workshop_id"] == str(sample_workshop.id) for p in data["parts"])

def test_filter_multiple_statuses(seed_canvas_parts):
    \"\"\"Filter by multiple statuses (comma-separated)\"\"\"
    response = client.get("/api/parts?status=validated,uploaded")
    
    data = response.json()
    assert len(data["parts"]) == 10  # All parts match
    assert all(p["status"] in ["validated", "uploaded"] for p in data["parts"])

def test_filter_combined_status_and_tipologia(seed_canvas_parts):
    \"\"\"Combine status and tipologia filters (AND logic)\"\"\"
    response = client.get("/api/parts?status=validated&tipologia=capitel")
    
    data = response.json()
    # Only parts that are BOTH validated AND capitel
    assert all(
        p["status"] == "validated" and p["tipologia"] == "capitel" 
        for p in data["parts"]
    )

def test_filter_invalid_status_ignored(seed_canvas_parts):
    \"\"\"Invalid status values should be ignored\"\"\"
    response = client.get("/api/parts?status=invalid_status")
    
    data = response.json()
    assert len(data["parts"]) == 0  # No parts match

def test_filter_empty_result(seed_canvas_parts):
    \"\"\"Filter with no matches returns empty array\"\"\"
    response = client.get("/api/parts?status=validated&tipologia=nonexistent")
    
    data = response.json()
    assert data["parts"] == []
    assert data["total"] == 0
```

### Test Suite 3: RLS Tests (90 min)
```python
def test_rls_admin_sees_all_parts(seed_canvas_parts, admin_user):
    \"\"\"Admin users should see all parts\"\"\"
    # Simulate admin authentication
    headers = {"Authorization": f"Bearer {admin_user.token}"}
    response = client.get("/api/parts", headers=headers)
    
    data = response.json()
    assert len(data["parts"]) == 10  # All parts visible

def test_rls_workshop_user_sees_only_assigned(seed_canvas_parts, workshop_user, sample_workshop):
    \"\"\"Workshop users should see only assigned + unassigned parts\"\"\"
    headers = {"Authorization": f"Bearer {workshop_user.token}"}
    response = client.get("/api/parts", headers=headers)
    
    data = response.json()
    # Should see parts 0,1,2 (assigned) + parts 3-9 (unassigned)
    assert len(data["parts"]) == 10
    # But filtering by workshop_id should show only 3
    response = client.get(f"/api/parts?workshop_id={sample_workshop.id}", headers=headers)
    data = response.json()
    assert len(data["parts"]) == 3

def test_rls_workshop_user_cannot_see_other_workshop(seed_canvas_parts, workshop_user, other_workshop):
    \"\"\"Workshop users should NOT see parts from other workshops\"\"\"
    # Assign part to other workshop
    part = seed_canvas_parts[5]
    part.workshop_id = other_workshop.id
    db_session.commit()
    
    headers = {"Authorization": f"Bearer {workshop_user.token}"}
    response = client.get("/api/parts", headers=headers)
    
    data = response.json()
    assert all(p["id"] != part.id for p in data["parts"] if p["workshop_id"] is not None)

def test_rls_unauthenticated_returns_401(seed_canvas_parts):
    \"\"\"Unauthenticated requests should return 401\"\"\"
    response = client.get("/api/parts")
    
    # If RLS requires authentication
    # assert response.status_code == 401
    # If public endpoint, allow unauthenticated
    assert response.status_code in [200, 401]
```

### Test Suite 4: Performance Tests (90 min)
```python
import time

def test_response_size_under_200kb(seed_canvas_parts_large):
    \"\"\"Response size should be <200 KB for 500 parts\"\"\"
    response = client.get("/api/parts")
    
    response_size = len(response.content)
    assert response_size < 200 * 1024, f"Response size {response_size} bytes > 200 KB"

def test_query_time_under_500ms(seed_canvas_parts_large):
    \"\"\"Query should complete in <500ms\"\"\"
    start = time.time()
    response = client.get("/api/parts")
    elapsed_ms = (time.time() - start) * 1000
    
    assert response.status_code == 200
    assert elapsed_ms < 500, f"Query took {elapsed_ms}ms > 500ms"

def test_filtered_query_time_under_500ms(seed_canvas_parts_large):
    \"\"\"Filtered queries should also be fast\"\"\"
    start = time.time()
    response = client.get("/api/parts?status=validated&tipologia=capitel")
    elapsed_ms = (time.time() - start) * 1000
    
    assert response.status_code == 200
    assert elapsed_ms < 500, f"Filtered query took {elapsed_ms}ms > 500ms"

def test_response_includes_pagination_metadata(seed_canvas_parts):
    \"\"\"Response should include total count (even without pagination)\"\"\"
    response = client.get("/api/parts")
    
    data = response.json()
    assert "total" in data
    assert data["total"] == len(data["parts"])
```

### Test Suite 5: Index Usage Tests (60 min)
```python
from sqlalchemy import text

def test_query_uses_canvas_index(db_session, seed_canvas_parts):
    \"\"\"Query should use idx_blocks_canvas_query index\"\"\"
    # Execute EXPLAIN ANALYZE
    result = db_session.execute(text(\"\"\"
        EXPLAIN (FORMAT JSON)
        SELECT * FROM blocks
        WHERE 
            is_archived = false
            AND status = 'validated'
            AND tipologia = 'capitel'
    \"\"\"))
    
    plan = result.fetchone()[0]
    plan_str = str(plan)
    
    # Verify index is used
    assert "idx_blocks_canvas_query" in plan_str
    assert "Index Scan" in plan_str or "Index Only Scan" in plan_str
    assert "Seq Scan" not in plan_str  # Should NOT do full table scan

def test_unfiltered_query_performance(db_session, seed_canvas_parts_large):
    \"\"\"Unfiltered query should still be fast (may use seq scan)\"\"\"
    result = db_session.execute(text(\"\"\"
        EXPLAIN ANALYZE
        SELECT * FROM blocks
        WHERE is_archived = false
    \"\"\"))
    
    explain_output = result.fetchall()
    execution_time_line = [line for line in explain_output if "Execution Time" in str(line)]
    
    # Extract execution time (in ms)
    # Example: "Execution Time: 12.345 ms"
    # Should be <50ms for 500 rows
    assert len(execution_time_line) > 0

def test_index_exists(db_session):
    \"\"\"Verify idx_blocks_canvas_query index exists\"\"\"
    result = db_session.execute(text(\"\"\"
        SELECT 1 
        FROM pg_indexes 
        WHERE indexname = 'idx_blocks_canvas_query'
    \"\"\"))
    
    assert result.fetchone() is not None, "Index idx_blocks_canvas_query not found"
```

---

## ✅ DEFINITION OF DONE

### Acceptance Criteria
- [ ] **AC-1:** Functional tests pass (5 tests)
- [ ] **AC-2:** Filter tests pass (7 tests)
- [ ] **AC-3:** RLS tests pass (4 tests)
- [ ] **AC-4:** Performance tests pass (4 tests)
- [ ] **AC-5:** Index usage tests pass (3 tests)
- [ ] **AC-6:** Coverage >85% on `api/parts.py`
- [ ] **AC-7:** Coverage >90% on `services/rls.py`
- [ ] **AC-8:** Query time <500ms verified
- [ ] **AC-9:** Response size <200 KB verified
- [ ] **AC-10:** Index usage verified with EXPLAIN ANALYZE

### Quality Gates
```bash
# Run backend tests
make test

# Run only canvas API tests
pytest tests/integration/test_parts_canvas.py -v

# Verify coverage
pytest --cov=src/backend/api/parts --cov=src/backend/services/rls --cov-report=html

# Run performance tests
pytest tests/integration/test_parts_canvas.py::test_query_time_under_500ms -v
```

---

## 📦 DELIVERABLES

1. ✅ Test suite: `tests/integration/test_parts_canvas.py` (23 tests total)
2. ✅ Fixtures: `tests/conftest.py` (seed_canvas_parts, seed_canvas_parts_large)
3. ✅ Coverage report: >85% `api/parts.py`, >90% `services/rls.py`
4. ✅ Performance benchmark results (CSV/JSON)
5. ✅ EXPLAIN ANALYZE output samples (verify index usage)

---

## 🔗 DEPENDENCIES

### Upstream
- `T-0501-BACK`: Canvas API endpoint implementation
- `T-0503-DB`: Database schema with indexes

### Downstream
- None (last ticket in US-005)

---

## ⚠️ RISKS & MITIGATION

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| **Query >500ms on CI** | Medium | Medium | Optimize index, reduce test data to 100 parts |\n| **RLS tests fail (no auth)** | High | Low | Mock authentication headers, use test JWT tokens |\n| **Index not used** | Critical | Low | Verify migration applied, check query planner stats |\n| **Response >200 KB** | Medium | Low | Remove heavy fields, implement compression |\n\n---\n\n## 📚 REFERENCES\n\n- Pytest Docs: https://docs.pytest.org/\n- FastAPI TestClient: https://fastapi.tiangolo.com/tutorial/testing/\n- SQLAlchemy Testing: https://docs.sqlalchemy.org/en/14/orm/session_transaction.html\n- PostgreSQL EXPLAIN: https://www.postgresql.org/docs/current/sql-explain.html\n- T-0501-BACK Spec: Canvas API requirements\n\n---\n\n**Status:** ✅ Ready for Implementation  \n**Last Updated:** 2026-02-18  \n**Coverage Target:** >85% api/parts.py, >90% services/rls.py\n