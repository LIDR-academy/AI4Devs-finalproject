"""
Integration Tests: Functional Core (GET /api/parts)

Test Suite 1/5: Basic CRUD & Happy Paths
Validates core functionality of Canvas API endpoint.

Tests (6):
- F-01: Fetch all parts without filters
- F-02: Parts include low_poly_url field
- F-03: Parts include bbox JSONB field
- F-04: Empty database returns 200 + empty array
- F-05: Archived parts excluded from results
- F-06: Consistent ordering (created_at DESC)

Status: ✅ Tests reorganized from test_parts_api.py (should PASS)
Author: AI Assistant (T-0510-TEST-BACK TDD-RED Phase)
Date: 2026-02-23
"""
from uuid import uuid4
from fastapi.testclient import TestClient
from datetime import datetime, timedelta

from main import app
from supabase import Client

client = TestClient(app)


def test_f01_fetch_all_parts_no_filters(supabase_client: Client):
    """
    F-01: Fetch all parts without filters.

    Given: Database contains 5 blocks with varied status/tipologia
    When: GET /api/parts (no query params)
    Then:
        - Returns HTTP 200
        - All 5 non-archived blocks included
        - Response matches PartsListResponse schema
        - count === parts.length
    """
    # ARRANGE: Create 5 test blocks with different attributes
    test_blocks = [
        {"id": str(uuid4()), "iso_code": f"TEST-F01-{i:03d}", "status": "validated", "tipologia": "capitel"}
        for i in range(5)
    ]

    # Clean up first
    for block in test_blocks:
        try:
            supabase_client.table("blocks").delete().eq("id", block["id"]).execute()
        except Exception:
            pass

    # Insert test blocks
    for block in test_blocks:
        supabase_client.table("blocks").insert(block).execute()

    # ACT: Call GET /api/parts without filters
    response = client.get("/api/parts")

    # ASSERT: Status code
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"

    # ASSERT: Response structure
    data = response.json()
    assert "parts" in data, "Response missing 'parts' field"
    assert "count" in data, "Response missing 'count' field"
    assert "filters_applied" in data, "Response missing 'filters_applied' field"

    # ASSERT: Count matches array length
    assert data["count"] == len(data["parts"]), f"count mismatch: {data['count']} != {len(data['parts'])}"

    # ASSERT: At least our 5 test blocks are present
    returned_ids = [part["id"] for part in data["parts"]]
    for block in test_blocks:
        assert block["id"] in returned_ids, f"Block {block['id']} not in response"

    # CLEANUP
    for block in test_blocks:
        supabase_client.table("blocks").delete().eq("id", block["id"]).execute()


def test_f02_parts_include_low_poly_url(supabase_client: Client):
    """
    F-02: Response includes low_poly_url field (nullable).

    Given: Block with low_poly_url populated
    When: GET /api/parts
    Then:
        - Response includes low_poly_url field with correct URL
        - Field is nullable (can be None for unprocessed blocks)
    """
    # ARRANGE
    test_id = str(uuid4())
    test_low_poly_url = f"https://example.supabase.co/storage/v1/object/public/processed-geometry/low-poly/{test_id}.glb"

    block = {
        "id": test_id,
        "iso_code": "TEST-F02-001",
        "status": "validated",
        "tipologia": "capitel",
        "low_poly_url": test_low_poly_url,
    }

    try:
        supabase_client.table("blocks").delete().eq("id", test_id).execute()
    except Exception:
        pass

    supabase_client.table("blocks").insert(block).execute()

    # ACT
    response = client.get("/api/parts")

    # ASSERT
    assert response.status_code == 200
    data = response.json()

    test_part = next((p for p in data["parts"] if p["id"] == test_id), None)
    assert test_part is not None, f"Test block {test_id} not found in response"

    # Verify low_poly_url
    assert test_part["low_poly_url"] == test_low_poly_url, "low_poly_url mismatch"

    # CLEANUP
    supabase_client.table("blocks").delete().eq("id", test_id).execute()


def test_f03_parts_include_bbox_jsonb(supabase_client: Client):
    """
    F-03: Response includes bbox JSONB field with {min, max} structure.

    Given: Block with bbox field populated as JSONB
    When: GET /api/parts
    Then:
        - Response includes bbox field
        - bbox has structure {"min": [x,y,z], "max": [x,y,z]}
        - Field is nullable (can be None for blocks without geometry)
    """
    # ARRANGE
    test_id = str(uuid4())
    test_bbox = {"min": [-2.5, 0.0, -2.5], "max": [2.5, 5.0, 2.5]}

    block = {
        "id": test_id,
        "iso_code": "TEST-F03-001",
        "status": "validated",
        "tipologia": "capitel",
        "bbox": test_bbox
    }

    try:
        supabase_client.table("blocks").delete().eq("id", test_id).execute()
    except Exception:
        pass

    supabase_client.table("blocks").insert(block).execute()

    # ACT
    response = client.get("/api/parts")

    # ASSERT
    assert response.status_code == 200
    data = response.json()

    test_part = next((p for p in data["parts"] if p["id"] == test_id), None)
    assert test_part is not None, f"Test block {test_id} not found in response"

    # Verify bbox structure
    assert test_part["bbox"] is not None, "bbox should not be null"
    assert "min" in test_part["bbox"], "bbox missing 'min' field"
    assert "max" in test_part["bbox"], "bbox missing 'max' field"
    assert test_part["bbox"]["min"] == test_bbox["min"], "bbox.min mismatch"
    assert test_part["bbox"]["max"] == test_bbox["max"], "bbox.max mismatch"

    # CLEANUP
    supabase_client.table("blocks").delete().eq("id", test_id).execute()


def test_f04_empty_database_returns_200(supabase_client: Client):
    """
    F-04: Empty database returns 200 + {parts: [], count: 0}.

    Given: Clean database, no blocks match filter
    When: GET /api/parts with filter that returns no results
    Then:
        - Returns HTTP 200 (not 404)
        - Response: {"parts": [], "count": 0, "filters_applied": {...}}
    """
    # ACT: Query for tipologia that doesn't exist
    response = client.get("/api/parts?tipologia=__nonexistent_tipologia__")

    # ASSERT
    assert response.status_code == 200
    data = response.json()

    assert data["count"] == 0
    assert len(data["parts"]) == 0


def test_f05_archived_parts_excluded(supabase_client: Client):
    """
    F-05: Archived parts (is_archived=true) excluded from results.

    Given: Block A (is_archived = false), Block B (is_archived = true)
    When: GET /api/parts
    Then:
        - Only Block A in response
        - Block B NOT in response (filtered by WHERE is_archived = false)
    """
    # ARRANGE
    block_a = {"id": str(uuid4()), "iso_code": "TEST-F05-A-001", "status": "completed", "tipologia": "capitel", "is_archived": False}
    block_b = {"id": str(uuid4()), "iso_code": "TEST-F05-B-001", "status": "completed", "tipologia": "columna", "is_archived": True}

    for block in [block_a, block_b]:
        try:
            supabase_client.table("blocks").delete().eq("id", block["id"]).execute()
        except Exception:
            pass
        supabase_client.table("blocks").insert(block).execute()

    # ACT
    response = client.get("/api/parts")

    # ASSERT
    assert response.status_code == 200
    data = response.json()

    returned_ids = [p["id"] for p in data["parts"]]

    assert block_a["id"] in returned_ids, "Non-archived block should be present"
    assert block_b["id"] not in returned_ids, "Archived block should NOT be present"

    # CLEANUP
    for block in [block_a, block_b]:
        supabase_client.table("blocks").delete().eq("id", block["id"]).execute()


def test_f06_consistent_ordering_created_at_desc(supabase_client: Client):
    """
    F-06: Parts ordered by created_at DESC (newest first).

    Given: 5 blocks inserted at different timestamps
    When: GET /api/parts
    Then:
        - Parts returned in descending order by created_at
        - Order is stable across multiple requests
    """
    # ARRANGE: Insert blocks with staggered timestamps
    blocks = []
    for i in range(5):
        block_id = str(uuid4())
        block = {
            "id": block_id,
            "iso_code": f"TEST-F06-{i:03d}",
            "status": "validated",
            "tipologia": "capitel",
            "created_at": (datetime.utcnow() + timedelta(seconds=i)).isoformat() + "Z"
        }
        blocks.append(block)

        try:
            supabase_client.table("blocks").delete().eq("id", block_id).execute()
        except Exception:
            pass

        supabase_client.table("blocks").insert(block).execute()

    # ACT: Request multiple times
    response1 = client.get("/api/parts")
    response2 = client.get("/api/parts")

    # ASSERT
    assert response1.status_code == 200
    assert response2.status_code == 200

    data1 = response1.json()
    data2 = response2.json()

    # Extract our test blocks
    test_ids = [b["id"] for b in blocks]
    parts1 = [p for p in data1["parts"] if p["id"] in test_ids]
    parts2 = [p for p in data2["parts"] if p["id"] in test_ids]

    # Verify ordering is DESC (newest first) - block 4 should come before block 0
    if len(parts1) >= 2:
        ids1 = [p["id"] for p in parts1]
        # Should be ordered by created_at DESC, so later blocks come first
        assert ids1[0] == blocks[-1]["id"], "Newest block should be first"

    # Verify consistency across requests
    assert [p["id"] for p in parts1] == [p["id"] for p in parts2], "Order not consistent across requests"

    # CLEANUP
    for block in blocks:
        supabase_client.table("blocks").delete().eq("id", block["id"]).execute()
