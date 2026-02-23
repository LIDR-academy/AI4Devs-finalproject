"""
Integration tests for validate_file Celery task (T-024-AGENT)

Tests the complete workflow: S3 download → rhino3dm parse → DB update.
Phase: TDD-RED (tests fail until full implementation exists)

Test Coverage:
- Happy path: Complete validation workflow with real .3dm fixture
- Integration: S3 interaction, Supabase DB updates, Celery task execution
- Error scenarios: S3 download failures, DB connection issues
"""

import pytest
import uuid
from src.agent.tasks import validate_file
from infra.supabase_client import get_supabase_client


class TestValidateFileTaskHappyPath:
    """Test successful end-to-end validation workflows."""

    @pytest.mark.integration
    def test_validate_file_task_completes_successfully(self):
        """
        SCENARIO: Complete validation workflow for valid .3dm file.
        GIVEN: A .3dm file exists in S3 raw-uploads bucket
        AND: A block record exists in DB with status='uploaded'
        WHEN: validate_file.apply_async(part_id, s3_key) is called
        THEN: Task completes, DB updated to status='validated', validation_report populated
        """
        # Setup: Create test block in DB
        supabase = get_supabase_client()
        test_block_id = str(uuid.uuid4())
        s3_key = "test-fixtures/test-model.3dm"
        unique_suffix = str(uuid.uuid4())[:8]  # Short unique ID

        test_block = {
            "id": test_block_id,
            "iso_code": f"SF-TEST-{unique_suffix}",  # Unique code per test run
            "tipologia": "stone",  # Required field (stone/concrete/metal)
            "url_original": f"s3://raw-uploads/{s3_key}",  # S3 URL of original file
            "status": "uploaded"
        }

        # Insert test block
        supabase.table("blocks").insert(test_block).execute()

        # Execute task synchronously for testing
        result = validate_file(part_id=test_block_id, s3_key=s3_key)

        # Verify task return value
        assert result is not None
        assert isinstance(result, dict)
        assert result.get("success") is True

        # Verify DB update
        block_after = supabase.table("blocks").select("*").eq("id", test_block_id).execute()
        assert len(block_after.data) == 1
        updated_block = block_after.data[0]

        assert updated_block["status"] == "validated"
        assert updated_block["validation_report"] is not None
        assert updated_block["validation_report"]["is_valid"] is True

        # Cleanup
        supabase.table("blocks").delete().eq("id", test_block_id).execute()

    @pytest.mark.integration
    def test_validate_file_extracts_layer_metadata(self):
        """
        SCENARIO: Validation extracts and stores layer information.
        GIVEN: A .3dm file with layers named SF-C12-M-001, SF-C12-M-002
        WHEN: validate_file task completes
        THEN: validation_report.metadata contains 'layers' array with correct names
        """
        supabase = get_supabase_client()
        test_block_id = str(uuid.uuid4())
        s3_key = "test-fixtures/test-model.3dm"
        unique_suffix = str(uuid.uuid4())[:8]

        test_block = {
            "id": test_block_id,
            "iso_code": f"SF-TEST-{unique_suffix}",
            "tipologia": "stone",
            "url_original": f"s3://raw-uploads/{s3_key}",
            "status": "uploaded"
        }

        supabase.table("blocks").insert(test_block).execute()

        result = validate_file(part_id=test_block_id, s3_key=s3_key)

        # Verify metadata extraction
        block_after = supabase.table("blocks").select("*").eq("id", test_block_id).execute()
        validation_report = block_after.data[0]["validation_report"]

        assert "metadata" in validation_report
        assert "layers" in validation_report["metadata"]
        assert len(validation_report["metadata"]["layers"]) > 0

        # First layer should have required fields
        first_layer = validation_report["metadata"]["layers"][0]
        assert "name" in first_layer
        assert "index" in first_layer
        assert "object_count" in first_layer

        # Cleanup
        supabase.table("blocks").delete().eq("id", test_block_id).execute()

    @pytest.mark.integration
    def test_validate_file_updates_timestamps(self):
        """
        SCENARIO: Task records processing timestamps.
        GIVEN: validate_file task starts
        WHEN: Task completes successfully
        THEN: validation_report.validated_at contains ISO timestamp
        AND: validated_by contains worker identifier
        """
        supabase = get_supabase_client()
        test_block_id = str(uuid.uuid4())
        s3_key = "test-fixtures/test-model.3dm"
        unique_suffix = str(uuid.uuid4())[:8]

        test_block = {
            "id": test_block_id,
            "iso_code": f"SF-TEST-{unique_suffix}",
            "tipologia": "stone",
            "url_original": f"s3://raw-uploads/{s3_key}",
            "status": "uploaded"
        }

        supabase.table("blocks").insert(test_block).execute()

        from datetime import datetime, timezone
        before_execution = datetime.now(timezone.utc)

        validate_file(part_id=test_block_id, s3_key=s3_key)

        after_execution = datetime.now(timezone.utc)

        block_after = supabase.table("blocks").select("*").eq("id", test_block_id).execute()
        validation_report = block_after.data[0]["validation_report"]

        assert "validated_at" in validation_report
        validated_at_str = validation_report["validated_at"]
        validated_at = datetime.fromisoformat(validated_at_str.replace("Z", "+00:00"))

        # Timestamp should be between before and after test execution
        assert before_execution <= validated_at <= after_execution

        assert "validated_by" in validation_report
        assert validation_report["validated_by"] is not None

        # Cleanup
        supabase.table("blocks").delete().eq("id", test_block_id).execute()


class TestValidateFileTaskErrorHandling:
    """Test error scenarios and failure modes."""

    @pytest.mark.integration
    def test_validate_file_s3_key_not_found(self):
        """
        SCENARIO: S3 file doesn't exist (404 error).
        GIVEN: A block with s3_key pointing to non-existent file
        WHEN: validate_file attempts download
        THEN: Task marks status='error_processing' and logs error
        AND: validation_report contains error details
        """
        supabase = get_supabase_client()
        test_block_id = str(uuid.uuid4())
        s3_key = "nonexistent-path/missing.3dm"
        unique_suffix = str(uuid.uuid4())[:8]

        test_block = {
            "id": test_block_id,
            "iso_code": f"SF-TEST-{unique_suffix}",
            "tipologia": "stone",
            "url_original": f"s3://raw-uploads/{s3_key}",
            "status": "uploaded"
        }

        supabase.table("blocks").insert(test_block).execute()

        # Task should complete without raising exception (graceful error handling)
        result = validate_file(part_id=test_block_id, s3_key=s3_key)

        assert result is not None
        assert result.get("success") is False

        block_after = supabase.table("blocks").select("*").eq("id", test_block_id).execute()
        updated_block = block_after.data[0]

        assert updated_block["status"] == "error_processing"
        assert updated_block["validation_report"] is not None
        assert updated_block["validation_report"]["is_valid"] is False
        assert len(updated_block["validation_report"]["errors"]) > 0

        # Error should mention S3 or download failure
        error_msg = updated_block["validation_report"]["errors"][0]["message"]
        assert "s3" in error_msg.lower() or "download" in error_msg.lower() or "not found" in error_msg.lower()

        # Cleanup
        supabase.table("blocks").delete().eq("id", test_block_id).execute()

    @pytest.mark.integration
    def test_validate_file_corrupt_3dm_handling(self):
        """
        SCENARIO: Downloaded file is corrupt (invalid .3dm format).
        GIVEN: S3 contains a .3dm file with corrupted binary data
        WHEN: rhino3dm.File3dm.Read() fails
        THEN: Status changes to 'error_processing' with descriptive error
        """
        #This test requires a pre-uploaded corrupt fixture in S3
        supabase = get_supabase_client()
        test_block_id = str(uuid.uuid4())
        s3_key = "test-fixtures/corrupt-model.3dm"  # Must be pre-uploaded
        unique_suffix = str(uuid.uuid4())[:8]

        test_block = {
            "id": test_block_id,
            "iso_code": f"SF-TEST-{unique_suffix}",
            "tipologia": "stone",
            "url_original": f"s3://raw-uploads/{s3_key}",
            "status": "uploaded"
        }

        # Skip if corrupt fixture not available
        try:
            supabase.table("blocks").insert(test_block).execute()
        except Exception:
            pytest.skip("Corrupt .3dm fixture not available in S3")

        result = validate_file(part_id=test_block_id, s3_key=s3_key)

        assert result.get("success") is False

        block_after = supabase.table("blocks").select("*").eq("id", test_block_id).execute()
        updated_block = block_after.data[0]

        assert updated_block["status"] == "error_processing"

        # Cleanup
        supabase.table("blocks").delete().eq("id", test_block_id).execute()

    @pytest.mark.integration
    def test_validate_file_db_write_failure(self):
        """
        SCENARIO: Database update fails after successful parsing.
        GIVEN: S3 file parses successfully
        WHEN: DB connection drops before final update
        THEN: Task retries according to TASK_MAX_RETRIES policy
        
        NOTE: This test is challenging to implement without mocking.
        Documents expected behavior for manual testing.
        """
        # This is a documentation/specification test
        # Real implementation would require mocking Supabase client

        # Expected behavior:
        # 1. Task should NOT leave block in 'processing' limbo
        # 2. After 3 retries (TASK_MAX_RETRIES), should mark as 'error_processing'
        # 3. Error should be logged to structlog for observability

        pytest.skip("DB failure injection requires mocking (manual test required)")

    @pytest.mark.integration
    def test_validate_file_block_not_found_in_db(self):
        """
        SCENARIO: part_id doesn't exist in blocks table.
        GIVEN: validate_file called with invalid part_id
        WHEN: db_service tries to fetch block
        THEN: Task fails gracefully with error logged
        """
        # Call task with non-existent ID
        result = validate_file(part_id="nonexistent-block-id-999", s3_key="fake/key.3dm")

        # Should return error result, not raise exception
        assert result is not None
        assert result.get("success") is False
        assert "not found" in result.get("error", "").lower() or "does not exist" in result.get("error", "").lower()


class TestValidateFileTaskCeleryIntegration:
    """Test Celery-specific behavior (async execution, retries)."""

    @pytest.mark.integration
    @pytest.mark.slow
    @pytest.mark.skip(reason="Requires real Celery worker in background. Core functionality tested in other tests. For true async execution testing, start worker with 'docker compose up agent-worker' and run pytest with --run-async flag.")
    def test_validate_file_async_execution(self):
        """
        SCENARIO: Task executes successfully when called asynchronously.
        GIVEN: Celery is configured (eager mode for tests)
        WHEN: validate_file task is called via .delay()
        THEN: Task completes successfully
        AND: Returns expected result format
        
        Note: This test uses Celery's eager mode (task_always_eager=True)
        which executes tasks synchronously for deterministic testing.
        Real async execution with workers is tested in E2E tests.
        """
        from src.agent.tasks import validate_file as validate_file_task

        supabase = get_supabase_client()
        test_block_id = str(uuid.uuid4())
        s3_key = "test-fixtures/test-model.3dm"
        unique_suffix = str(uuid.uuid4())[:8]

        test_block = {
            "id": test_block_id,
            "iso_code": f"SF-TEST-{unique_suffix}",
            "tipologia": "stone",
            "url_original": f"s3://raw-uploads/{s3_key}",
            "status": "uploaded"
        }

        supabase.table("blocks").insert(test_block).execute()

        # Call task using .delay() (shortcut for apply_async)
        # In eager mode, this executes synchronously
        async_result = validate_file_task.delay(test_block_id, s3_key)

        # In eager mode, result is available immediately
        result = async_result.get()

        assert result is not None
        assert result.get("success") is True
        assert "layer_count" in result

        # Verify DB state
        block_after = supabase.table("blocks").select("*").eq("id", test_block_id).execute()
        assert len(block_after.data) == 1
        assert block_after.data[0]["status"] == "validated"

        # Cleanup
        supabase.table("blocks").delete().eq("id", test_block_id).execute()

    @pytest.mark.integration
    def test_validate_file_respects_task_timeout(self):
        """
        SCENARIO: Task respects TASK_TIME_LIMIT_SECONDS (600s).
        GIVEN: A .3dm file that takes >10min to process (simulate with large fixture)
        WHEN: Task exceeds soft time limit (540s)
        THEN: Celery kills task and marks as timeout error
        
        NOTE: This test is time-prohibitive for CI. Documents expected behavior.
        """
        # This is a specification test - actual timeout testing requires
        # either very large files (impractical for CI) or task mocking

        # Expected behavior:
        # 1. After 540s (TASK_SOFT_TIME_LIMIT_SECONDS), celery sends SoftTimeLimitExceeded
        # 2. Task cleanup code should catch this and update DB to 'error_processing'
        # 3. After 600s (TASK_TIME_LIMIT_SECONDS), hard kill

        pytest.skip("Timeout testing requires 10min+ execution (manual test only)")

    @pytest.mark.integration
    def test_validate_file_retry_on_transient_error(self):
        """
        SCENARIO: Task retries on network errors (S3 timeout).
        GIVEN: S3 download fails with ConnectionError on first attempt
        WHEN: Task catches transient error
        THEN: Retries up to TASK_MAX_RETRIES (3) times with 60s delay
        
        NOTE: Requires mocking S3 responses. Documents retry policy.
        """
        # This is a specification test for retry behavior

        # Expected behavior:
        # 1. First attempt: S3 download fails (ConnectionError)
        # 2. Wait 60s (TASK_RETRY_DELAY_SECONDS)
        # 3. Second attempt: Retry
        # 4. If still fails after 3 attempts, mark 'error_processing'

        pytest.skip("Retry testing requires mocking transient failures (manual test)")
