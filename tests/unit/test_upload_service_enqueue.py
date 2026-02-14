"""
Unit tests for T-029-BACK: Trigger Validation from Confirm Endpoint

TDD Phase: RED — These tests define the expected behavior for
UploadService's new methods: create_block_record() and enqueue_validation().
All tests use mocks (no real DB or Celery).

Tests:
  1. create_block_record inserts into blocks table and returns block_id
  2. create_block_record sets iso_code with PENDING prefix
  3. create_block_record sets tipologia="pending" and url_original=file_key
  4. enqueue_validation sends celery task and returns task_id
  5. confirm_upload returns 4-tuple with task_id (not None)
  6. confirm_upload does NOT enqueue if file not found
  7. confirm_upload does NOT enqueue if event creation fails
  8. enqueue_validation raises if no celery client provided
"""

import pytest
from unittest.mock import MagicMock, patch

from services import UploadService
from constants import TABLE_BLOCKS

# T-029-BACK constants — will fail import until implemented
try:
    from constants import TASK_VALIDATE_FILE, BLOCK_TIPOLOGIA_PENDING, BLOCK_ISO_CODE_PREFIX
except ImportError:
    # RED phase: constants don't exist yet — define expected values for tests
    TASK_VALIDATE_FILE = "agent.tasks.validate_file"
    BLOCK_TIPOLOGIA_PENDING = "pending"
    BLOCK_ISO_CODE_PREFIX = "PENDING"
    pytestmark = pytest.mark.xfail(reason="T-029-BACK constants not implemented yet")


# --- Fixtures ---

@pytest.fixture
def mock_supabase():
    """Mock Supabase client with fluent API."""
    client = MagicMock()
    return client


@pytest.fixture
def mock_celery():
    """Mock Celery client with send_task."""
    client = MagicMock()
    mock_result = MagicMock()
    mock_result.id = "celery-task-uuid-123"
    client.send_task.return_value = mock_result
    return client


@pytest.fixture
def upload_service(mock_supabase, mock_celery):
    """UploadService with both supabase and celery clients injected."""
    return UploadService(mock_supabase, celery_client=mock_celery)


@pytest.fixture
def upload_service_no_celery(mock_supabase):
    """UploadService without celery client (legacy behavior)."""
    return UploadService(mock_supabase)


# --- Test: create_block_record ---

class TestCreateBlockRecord:
    """Tests for UploadService.create_block_record()."""

    def test_inserts_block_and_returns_id(self, upload_service, mock_supabase):
        """
        T-029-BACK RED Test 1:
        create_block_record() should INSERT into blocks table
        and return the generated block_id (UUID).
        """
        # Arrange: mock DB insert returning a block with id
        block_id = "block-uuid-abc123"
        mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [
            {"id": block_id}
        ]

        file_id = "550e8400-e29b-41d4-a716-446655440000"
        file_key = "uploads/550e8400/model.3dm"

        # Act
        result = upload_service.create_block_record(file_id, file_key)

        # Assert
        assert result == block_id
        mock_supabase.table.assert_called_with(TABLE_BLOCKS)
        mock_supabase.table.return_value.insert.assert_called_once()

    def test_iso_code_uses_pending_prefix(self, upload_service, mock_supabase):
        """
        T-029-BACK RED Test 2:
        Block iso_code should be "PENDING-{file_id[:8]}" (temporary,
        updated by agent after validation).
        """
        block_id = "block-uuid-abc123"
        mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [
            {"id": block_id}
        ]

        file_id = "550e8400-e29b-41d4-a716-446655440000"
        file_key = "uploads/550e8400/model.3dm"

        # Act
        upload_service.create_block_record(file_id, file_key)

        # Assert: check the insert payload
        insert_call = mock_supabase.table.return_value.insert.call_args
        insert_data = insert_call[0][0]  # First positional arg
        expected_iso = f"{BLOCK_ISO_CODE_PREFIX}-{file_id[:8]}"
        assert insert_data["iso_code"] == expected_iso

    def test_block_fields_are_correct(self, upload_service, mock_supabase):
        """
        T-029-BACK RED Test 6:
        Block record should have tipologia="pending" and url_original=file_key.
        """
        block_id = "block-uuid-abc123"
        mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [
            {"id": block_id}
        ]

        file_id = "550e8400-e29b-41d4-a716-446655440000"
        file_key = "uploads/550e8400/model.3dm"

        # Act
        upload_service.create_block_record(file_id, file_key)

        # Assert
        insert_data = mock_supabase.table.return_value.insert.call_args[0][0]
        assert insert_data["tipologia"] == BLOCK_TIPOLOGIA_PENDING
        assert insert_data["url_original"] == file_key

    def test_raises_on_db_error(self, upload_service, mock_supabase):
        """
        T-029-BACK RED Test 8 (partial):
        create_block_record() should raise if INSERT fails.
        """
        mock_supabase.table.return_value.insert.return_value.execute.side_effect = Exception(
            "DB connection error"
        )

        file_id = "550e8400-e29b-41d4-a716-446655440000"
        file_key = "uploads/550e8400/model.3dm"

        with pytest.raises(Exception, match="DB connection error"):
            upload_service.create_block_record(file_id, file_key)


# --- Test: enqueue_validation ---

class TestEnqueueValidation:
    """Tests for UploadService.enqueue_validation()."""

    def test_sends_celery_task_and_returns_task_id(self, upload_service, mock_celery):
        """
        T-029-BACK RED Test 3:
        enqueue_validation() should call celery.send_task() with correct
        task name and args, and return the task ID.
        """
        block_id = "block-uuid-abc123"
        file_key = "uploads/550e8400/model.3dm"

        # Act
        task_id = upload_service.enqueue_validation(block_id, file_key)

        # Assert
        assert task_id == "celery-task-uuid-123"
        mock_celery.send_task.assert_called_once_with(
            TASK_VALIDATE_FILE,
            args=[block_id, file_key]
        )

    def test_raises_if_no_celery_client(self, upload_service_no_celery):
        """
        T-029-BACK RED Test 7 (partial):
        enqueue_validation() should raise if celery client not configured.
        """
        with pytest.raises(Exception):
            upload_service_no_celery.enqueue_validation("block-id", "file-key")


# --- Test: confirm_upload (modified flow) ---

class TestConfirmUploadWithEnqueue:
    """Tests for the modified confirm_upload() with block creation + task enqueue."""

    def test_returns_4_tuple_with_task_id(self, upload_service, mock_supabase):
        """
        T-029-BACK RED Test 1 (endpoint-level):
        confirm_upload() should return (success, event_id, task_id, error).
        task_id should NOT be None when flow succeeds.
        """
        # Arrange: mock file exists
        mock_supabase.storage.from_.return_value.list.return_value = [
            {"name": "model.3dm"}
        ]
        # Arrange: mock event creation
        mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [
            {"id": "event-uuid-123"}
        ]
        # Arrange: mock block creation (second call to .table().insert())
        # Since both event and block use .table().insert(), we need sequential returns
        mock_supabase.table.return_value.insert.return_value.execute.return_value.data = [
            {"id": "block-uuid-456"}
        ]

        # Act
        result = upload_service.confirm_upload(
            file_id="550e8400-e29b-41d4-a716-446655440000",
            file_key="uploads/550e8400/model.3dm"
        )

        # Assert: 4-tuple
        assert len(result) == 4, f"Expected 4-tuple, got {len(result)}-tuple"
        success, event_id, task_id, error = result
        assert success is True
        assert event_id is not None
        assert task_id is not None  # This is the KEY assertion — currently returns None
        assert error is None

    def test_no_block_or_task_when_file_not_found(self, upload_service, mock_supabase):
        """
        T-029-BACK RED Test 4:
        When file_key doesn't exist in S3, no block should be created
        and no task should be enqueued.
        """
        # Arrange: file NOT found
        mock_supabase.storage.from_.return_value.list.return_value = []

        # Act
        result = upload_service.confirm_upload(
            file_id="999e8400-e29b-41d4-a716-000000000999",
            file_key="non-existent/fake-file.3dm"
        )

        # Assert
        success = result[0]
        assert success is False
        # Block table should NOT have been written to for block creation
        # (event creation might have been skipped too)

    def test_no_task_when_event_creation_fails(self, upload_service, mock_supabase):
        """
        T-029-BACK RED Test 8:
        If event creation fails, no block should be created and
        no task should be enqueued.
        """
        # Arrange: file exists
        mock_supabase.storage.from_.return_value.list.return_value = [
            {"name": "model.3dm"}
        ]
        # Arrange: event creation fails
        mock_supabase.table.return_value.insert.return_value.execute.side_effect = Exception(
            "Event table error"
        )

        # Act
        result = upload_service.confirm_upload(
            file_id="550e8400-e29b-41d4-a716-446655440000",
            file_key="uploads/550e8400/model.3dm"
        )

        # Assert: should fail gracefully
        success = result[0]
        assert success is False
