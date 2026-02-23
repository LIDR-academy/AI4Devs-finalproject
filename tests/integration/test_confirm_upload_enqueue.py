"""
Integration tests for T-029-BACK: Trigger Validation from Confirm Endpoint

TDD Phase: GREEN — These tests verify the full endpoint flow:
  POST /api/upload/confirm → block created → task enqueued → task_id returned

Requires:
  - PostgreSQL (db service) for blocks table
  - Redis (via Celery eager mode from conftest.py) for task execution
  - Supabase (for file storage and blocks table)

Tests:
  1. Endpoint returns task_id (not null) on happy path
  2. Block record created in DB with PENDING iso_code
  3. Payload validation still returns 422 (no-regression)
  4. File not found returns 404, no block created
"""

from fastapi.testclient import TestClient
from main import app

client = TestClient(app)


def _cleanup_pending_blocks(supabase_client, iso_prefix: str):
    """Helper to remove PENDING blocks from Supabase."""
    try:
        supabase_client.table("blocks").delete().like(
            "iso_code", f"PENDING-{iso_prefix}%"
        ).execute()
    except Exception:
        pass


def test_confirm_upload_returns_task_id(supabase_client):
    """
    T-029-BACK Integration Test 1:
    When confirming a valid upload, the response should include
    a non-null task_id indicating the validation task was enqueued.

    Given: A file exists in Supabase Storage
    When: POST /api/upload/confirm with valid file_id and file_key
    Then:
        - Response 200 with success=True
        - task_id is NOT null (Celery task was enqueued)
        - event_id is NOT null (event was created)
    """
    # Arrange: Upload test file to storage
    bucket_name = "raw-uploads"
    test_file_key = "test/t029_enqueue_test.3dm"
    test_content = b"Mock .3dm content for T-029 enqueue test"

    file_id = "029e8400-e29b-41d4-a716-446655440029"

    # Cleanup stale data from previous runs
    try:
        supabase_client.storage.from_(bucket_name).remove([test_file_key])
    except Exception:
        pass
    _cleanup_pending_blocks(supabase_client, file_id[:8])

    supabase_client.storage.from_(bucket_name).upload(
        path=test_file_key,
        file=test_content,
        file_options={"content-type": "application/x-rhino"}
    )

    payload = {
        "file_id": file_id,
        "file_key": test_file_key
    }

    # Act
    response = client.post("/api/upload/confirm", json=payload)

    # Assert
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.json()}"

    data = response.json()
    assert data["success"] is True
    assert data["event_id"] is not None, "event_id should not be null"
    assert data["task_id"] is not None, (
        "task_id should NOT be null — T-029-BACK requires Celery task enqueue"
    )

    # Cleanup
    supabase_client.storage.from_(bucket_name).remove([test_file_key])
    _cleanup_pending_blocks(supabase_client, file_id[:8])


def test_confirm_upload_creates_block_record(supabase_client):
    """
    T-029-BACK Integration Test 2:
    When confirming a valid upload, a block record should be created
    in the blocks table with temporary PENDING iso_code.

    Given: A file exists in Supabase Storage
    When: POST /api/upload/confirm
    Then:
        - A row exists in blocks table with iso_code starting with "PENDING-"
        - Block tipologia is "pending"
        - Block url_original matches the file_key
    """
    # Arrange
    bucket_name = "raw-uploads"
    test_file_key = "test/t029_block_test.3dm"
    test_content = b"Mock .3dm content for T-029 block test"

    file_id = "029eaaaa-bbbb-41d4-a716-446655440029"

    # Cleanup stale data
    try:
        supabase_client.storage.from_(bucket_name).remove([test_file_key])
    except Exception:
        pass
    _cleanup_pending_blocks(supabase_client, file_id[:8])

    supabase_client.storage.from_(bucket_name).upload(
        path=test_file_key,
        file=test_content,
        file_options={"content-type": "application/x-rhino"}
    )

    payload = {
        "file_id": file_id,
        "file_key": test_file_key
    }

    # Act
    response = client.post("/api/upload/confirm", json=payload)
    assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.json()}"

    # Assert: Query blocks table via Supabase
    expected_iso = f"PENDING-{file_id[:8]}"
    result = supabase_client.table("blocks").select(
        "id, iso_code, status, tipologia, url_original"
    ).eq("iso_code", expected_iso).execute()

    assert len(result.data) > 0, (
        f"Block with iso_code '{expected_iso}' not found in blocks table. "
        "T-029-BACK should create a block record during confirm upload."
    )

    block = result.data[0]
    assert block["iso_code"] == expected_iso
    assert block["tipologia"] == "pending", f"Expected tipologia 'pending', got '{block['tipologia']}'"
    assert block["url_original"] == test_file_key

    # Cleanup
    _cleanup_pending_blocks(supabase_client, file_id[:8])
    supabase_client.storage.from_(bucket_name).remove([test_file_key])


def test_confirm_upload_invalid_payload_still_returns_422():
    """
    T-029-BACK No-Regression Test 9:
    Invalid payload (missing required fields) should still return 422.
    This ensures T-029-BACK changes don't break existing validation.
    """
    # Missing file_key
    payload = {
        "file_id": "550e8400-e29b-41d4-a716-446655440000"
    }

    response = client.post("/api/upload/confirm", json=payload)
    assert response.status_code == 422, f"Expected 422, got {response.status_code}"


def test_confirm_upload_file_not_found_returns_404_no_block(supabase_client):
    """
    T-029-BACK Integration Test 4:
    When file doesn't exist in S3, no block should be created.

    Given: A file_key that doesn't exist in storage
    When: POST /api/upload/confirm
    Then:
        - Response 404
        - NO block record created in blocks table
    """
    file_id = "029edead-beef-4444-a716-000000000000"
    payload = {
        "file_id": file_id,
        "file_key": "non-existent/t029-phantom.3dm"
    }

    # Count blocks before
    result_before = supabase_client.table("blocks").select(
        "id", count="exact"
    ).like("iso_code", f"PENDING-{file_id[:8]}%").execute()
    count_before = result_before.count or 0

    # Act
    response = client.post("/api/upload/confirm", json=payload)

    # Assert: 404 and no new block
    assert response.status_code == 404

    result_after = supabase_client.table("blocks").select(
        "id", count="exact"
    ).like("iso_code", f"PENDING-{file_id[:8]}%").execute()
    count_after = result_after.count or 0

    assert count_after == count_before, (
        "No block should be created when file is not found in storage"
    )
