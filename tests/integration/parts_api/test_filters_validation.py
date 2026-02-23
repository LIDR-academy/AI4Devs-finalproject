"""
Integration Tests: Filters Validation (GET /api/parts)

Test Suite 2/5: Dynamic Filter Logic
Validates query parameter filtering and edge cases.

Tests (5):
- FI-01: Filter by status (single value)
- FI-02: Filter by tipologia (single value)
- FI-03: Filter by workshop_id (UUID validation)
- FI-04: Multiple filters applied with AND logic
- FI-05: Invalid UUID returns 400 Bad Request

Status: ✅ Tests reorganized from test_parts_api.py (should PASS)
Author: AI Assistant (T-0510-TEST-BACK TDD-RED Phase)
Date: 2026-02-23
"""
from uuid import uuid4
from fastapi.testclient import TestClient

from main import app
from supabase import Client

client = TestClient(app)


def test_fi01_filter_by_status(supabase_client: Client):
    """
    FI-01: Filter by status returns only matching blocks.

    Given: Block A (status='validated'), Block B (status='completed')
    When: GET /api/parts?status=validated
    Then:
        - Only Block A in response
        - filters_applied.status === 'validated'
        - count reflects filtered count
    """
    # ARRANGE
    block_a = {"id": str(uuid4()), "iso_code": "TEST-FI01-A", "status": "validated", "tipologia": "capitel"}
    block_b = {"id": str(uuid4()), "iso_code": "TEST-FI01-B", "status": "completed", "tipologia": "capitel"}

    for block in [block_a, block_b]:
        try:
            supabase_client.table("blocks").delete().eq("id", block["id"]).execute()
        except Exception:
            pass
        supabase_client.table("blocks").insert(block).execute()

    # ACT
    response = client.get("/api/parts?status=validated")

    # ASSERT
    assert response.status_code == 200
    data = response.json()

    # Verify filters_applied
    assert data["filters_applied"]["status"] == "validated"

    # Verify correct blocks returned
    returned_ids = [p["id"] for p in data["parts"]]
    assert block_a["id"] in returned_ids, "Block A should be present"
    assert block_b["id"] not in returned_ids, "Block B should NOT be present"

    # CLEANUP
    for block in [block_a, block_b]:
        supabase_client.table("blocks").delete().eq("id", block["id"]).execute()


def test_fi02_filter_by_tipologia(supabase_client: Client):
    """
    FI-02: Filter by tipologia returns only matching blocks.

    Given: Block A (tipologia='capitel'), Block B (tipologia='columna')
    When: GET /api/parts?tipologia=capitel
    Then:
        - Only Block A in response
        - filters_applied.tipologia === 'capitel'
    """
    # ARRANGE
    block_a = {"id": str(uuid4()), "iso_code": "TEST-FI02-A", "status": "validated", "tipologia": "capitel"}
    block_b = {"id": str(uuid4()), "iso_code": "TEST-FI02-B", "status": "validated", "tipologia": "columna"}

    for block in [block_a, block_b]:
        try:
            supabase_client.table("blocks").delete().eq("id", block["id"]).execute()
        except Exception:
            pass
        supabase_client.table("blocks").insert(block).execute()

    # ACT
    response = client.get("/api/parts?tipologia=capitel")

    # ASSERT
    assert response.status_code == 200
    data = response.json()

    assert data["filters_applied"]["tipologia"] == "capitel"

    returned_ids = [p["id"] for p in data["parts"]]
    assert block_a["id"] in returned_ids, "Block A (capitel) should be present"
    assert block_b["id"] not in returned_ids, "Block B (columna) should NOT be present"

    # CLEANUP
    for block in [block_a, block_b]:
        supabase_client.table("blocks").delete().eq("id", block["id"]).execute()


def test_fi03_filter_by_workshop_id(supabase_client: Client):
    """
    FI-03: Filter by workshop_id (UUID validation enforced).

    Given: Block A (workshop_id = W1), Block B (workshop_id = W2)
    When: GET /api/parts?workshop_id=W1
    Then:
        - Only Block A in response
        - filters_applied.workshop_id === W1
    """
    # ARRANGE
    workshop_1 = str(uuid4())
    workshop_2 = str(uuid4())

    block_a = {"id": str(uuid4()), "iso_code": "TEST-FI03-A", "status": "validated", "tipologia": "capitel", "workshop_id": workshop_1}
    block_b = {"id": str(uuid4()), "iso_code": "TEST-FI03-B", "status": "validated", "tipologia": "capitel", "workshop_id": workshop_2}

    for block in [block_a, block_b]:
        try:
            supabase_client.table("blocks").delete().eq("id", block["id"]).execute()
        except Exception:
            pass
        supabase_client.table("blocks").insert(block).execute()

    # ACT
    response = client.get(f"/api/parts?workshop_id={workshop_1}")

    # ASSERT
    assert response.status_code == 200
    data = response.json()

    assert data["filters_applied"]["workshop_id"] == workshop_1

    returned_ids = [p["id"] for p in data["parts"]]
    assert block_a["id"] in returned_ids, "Block A (workshop_1) should be present"
    assert block_b["id"] not in returned_ids, "Block B (workshop_2) should NOT be present"

    # CLEANUP
    for block in [block_a, block_b]:
        supabase_client.table("blocks").delete().eq("id", block["id"]).execute()


def test_fi04_multiple_filters_with_and_logic(supabase_client: Client):
    """
    FI-04: Multiple filters applied with AND logic (all must match).

    Given:
        - Block A: status='validated', tipologia='capitel'
        - Block B: status='completed', tipologia='capitel'
        - Block C: status='validated', tipologia='columna'

    When: GET /api/parts?status=validated&tipologia=capitel
    Then:
        - Only Block A in response (both conditions match)
        - filters_applied shows both status AND tipologia
    """
    # ARRANGE
    block_a = {"id": str(uuid4()), "iso_code": "TEST-FI04-A", "status": "validated", "tipologia": "capitel"}
    block_b = {"id": str(uuid4()), "iso_code": "TEST-FI04-B", "status": "completed", "tipologia": "capitel"}
    block_c = {"id": str(uuid4()), "iso_code": "TEST-FI04-C", "status": "validated", "tipologia": "columna"}

    for block in [block_a, block_b, block_c]:
        try:
            supabase_client.table("blocks").delete().eq("id", block["id"]).execute()
        except Exception:
            pass
        supabase_client.table("blocks").insert(block).execute()

    # ACT
    response = client.get("/api/parts?status=validated&tipologia=capitel")

    # ASSERT
    assert response.status_code == 200
    data = response.json()

    # Verify both filters applied
    assert data["filters_applied"]["status"] == "validated"
    assert data["filters_applied"]["tipologia"] == "capitel"

    # Verify only Block A present
    returned_ids = [p["id"] for p in data["parts"]]
    assert block_a["id"] in returned_ids, "Block A (validated + capitel) should be present"
    assert block_b["id"] not in returned_ids, "Block B (completed) should NOT be present"
    assert block_c["id"] not in returned_ids, "Block C (columna) should NOT be present"

    # CLEANUP
    for block in [block_a, block_b, block_c]:
        supabase_client.table("blocks").delete().eq("id", block["id"]).execute()


def test_fi05_invalid_uuid_returns_400(supabase_client: Client):
    """
    FI-05: Invalid UUID format in workshop_id returns 400 Bad Request.

    Given: Valid endpoint with filter accepting UUID
    When: GET /api/parts?workshop_id=not-a-uuid
    Then:
        - Returns HTTP 400 (validation error)
        - Error message indicates invalid UUID format
    """
    # ACT
    response = client.get("/api/parts?workshop_id=not-a-uuid")

    # ASSERT
    assert response.status_code == 400, f"Expected 400, got {response.status_code}: {response.text}"
    data = response.json()

    # Verify error message indicates UUID validation failure
    assert "detail" in data, "Error response missing 'detail' field"
    assert "uuid" in data["detail"].lower(), "Error message should mention UUID validation"
