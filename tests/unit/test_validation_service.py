"""
Unit Tests for ValidationService (T-030-BACK)

Tests service methods for querying validation status of blocks.

Test Coverage:
- Happy Path: Get validation status for validated/unvalidated/rejected/processing blocks
- Edge Cases: Block not found, invalid UUID format
- Errors: DB connection errors, missing columns
"""

import pytest
from uuid import UUID, uuid4
from unittest.mock import Mock, MagicMock
from services.validation_service import ValidationService


# ===== HAPPY PATH TESTS =====

def test_get_validation_status_success_validated_block():
    """
    GIVEN block exists in DB with validation_report filled, status=validated
    WHEN get_validation_status(block_id) is called
    THEN return (True, block_data, None, None)
    AND block_data contains validation_report JSONB
    """
    # Arrange
    mock_supabase = Mock()
    mock_table = Mock()
    mock_select = Mock()
    mock_eq = Mock()
    
    test_block_id = uuid4()
    test_validation_report = {
        "is_valid": True,
        "errors": [],
        "metadata": {"total_objects": 42, "valid_objects": 42},
        "validated_at": "2026-02-14T23:15:00Z",
        "validated_by": "librarian-v1.0.0"
    }
    
    # Mock Supabase chain: table().select().eq().execute()
    mock_supabase.table.return_value = mock_table
    mock_table.select.return_value = mock_select
    mock_select.eq.return_value = mock_eq
    mock_eq.execute.return_value = MagicMock(data=[{
        "id": str(test_block_id),
        "iso_code": "PENDING-a1b2c3d4",
        "status": "validated",
        "validation_report": test_validation_report,
        "event_id": "evt-123"
    }])
    
    service = ValidationService(mock_supabase)
    
    # Act
    success, block_data, error_msg, extra = service.get_validation_status(test_block_id)
    
    # Assert
    assert success is True, "Should return success=True"
    assert block_data is not None, "block_data should not be None"
    assert block_data["status"] == "validated", "Status should be 'validated'"
    assert block_data["validation_report"] == test_validation_report, "validation_report should match DB data"
    assert error_msg is None, "error_msg should be None on success"


def test_get_validation_status_success_unvalidated_block():
    """
    GIVEN block exists in DB with validation_report=NULL, status=uploaded
    WHEN get_validation_status(block_id) is called
    THEN return (True, block_data, None, None)
    AND block_data["validation_report"] is None
    """
    # Arrange
    mock_supabase = Mock()
    mock_table = Mock()
    mock_select = Mock()
    mock_eq = Mock()
    
    test_block_id = uuid4()
    
    # Mock Supabase chain
    mock_supabase.table.return_value = mock_table
    mock_table.select.return_value = mock_select
    mock_select.eq.return_value = mock_eq
    mock_eq.execute.return_value = MagicMock(data=[{
        "id": str(test_block_id),
        "iso_code": "PENDING-c3d4e5f6",
        "status": "uploaded",
        "validation_report": None,
        "event_id": "evt-456"
    }])
    
    service = ValidationService(mock_supabase)
    
    # Act
    success, block_data, error_msg, extra = service.get_validation_status(test_block_id)
    
    # Assert
    assert success is True, "Should return success=True"
    assert block_data["status"] == "uploaded", "Status should be 'uploaded'"
    assert block_data["validation_report"] is None, "validation_report should be None"
    assert error_msg is None, "error_msg should be None on success"


def test_get_validation_status_success_rejected_block():
    """
    GIVEN block exists with validation_report containing errors, status=rejected
    WHEN get_validation_status(block_id) is called
    THEN return (True, block_data, None, None)
    AND block_data["validation_report"]["is_valid"] is False
    AND validation_report["errors"] list is not empty
    """
    # Arrange
    mock_supabase = Mock()
    mock_table = Mock()
    mock_select = Mock()
    mock_eq = Mock()
    
    test_block_id = uuid4()
    test_validation_report = {
        "is_valid": False,
        "errors": [
            {
                "category": "nomenclature",
                "target": "layer:SAGR-INVALID",
                "message": "Layer name does not follow BIM standard"
            }
        ],
        "metadata": {"total_objects": 38, "invalid_objects": 2},
        "validated_at": "2026-02-14T23:18:00Z",
        "validated_by": "librarian-v1.0.0"
    }
    
    # Mock Supabase chain
    mock_supabase.table.return_value = mock_table
    mock_table.select.return_value = mock_select
    mock_select.eq.return_value = mock_eq
    mock_eq.execute.return_value = MagicMock(data=[{
        "id": str(test_block_id),
        "iso_code": "PENDING-b2c3d4e5",
        "status": "rejected",
        "validation_report": test_validation_report,
        "event_id": "evt-789"
    }])
    
    service = ValidationService(mock_supabase)
    
    # Act
    success, block_data, error_msg, extra = service.get_validation_status(test_block_id)
    
    # Assert
    assert success is True, "Should return success=True"
    assert block_data["status"] == "rejected", "Status should be 'rejected'"
    assert block_data["validation_report"]["is_valid"] is False, "is_valid should be False"
    assert len(block_data["validation_report"]["errors"]) > 0, "errors list should not be empty"


def test_get_validation_status_success_processing_block_with_job_id():
    """
    GIVEN block exists with status=processing, event_id present
    WHEN get_validation_status(block_id) is called
    THEN return (True, block_data, None, extra)
    AND extra["job_id"] is not None (event_id used as placeholder)
    """
    # Arrange
    mock_supabase = Mock()
    mock_table = Mock()
    mock_select = Mock()
    mock_eq = Mock()
    
    test_block_id = uuid4()
    test_event_id = "evt-processing-123"
    
    # Mock Supabase chain
    mock_supabase.table.return_value = mock_table
    mock_table.select.return_value = mock_select
    mock_select.eq.return_value = mock_eq
    mock_eq.execute.return_value = MagicMock(data=[{
        "id": str(test_block_id),
        "iso_code": "PENDING-d4e5f6a7",
        "status": "processing",
        "validation_report": None,
        "event_id": test_event_id
    }])
    
    service = ValidationService(mock_supabase)
    
    # Act
    success, block_data, error_msg, extra = service.get_validation_status(test_block_id)
    
    # Assert
    assert success is True, "Should return success=True"
    assert block_data["status"] == "processing", "Status should be 'processing'"
    assert extra is not None, "extra should not be None for processing blocks"
    assert extra.get("job_id") == test_event_id, f"job_id should be {test_event_id}"


# ===== EDGE CASES =====

def test_get_validation_status_not_found():
    """
    GIVEN block_id does not exist in database
    WHEN get_validation_status(random_uuid) is called
    THEN return (False, None, "Block not found", None)
    """
    # Arrange
    mock_supabase = Mock()
    mock_table = Mock()
    mock_select = Mock()
    mock_eq = Mock()
    
    random_block_id = uuid4()
    
    # Mock Supabase chain - empty data array
    mock_supabase.table.return_value = mock_table
    mock_table.select.return_value = mock_select
    mock_select.eq.return_value = mock_eq
    mock_eq.execute.return_value = MagicMock(data=[])
    
    service = ValidationService(mock_supabase)
    
    # Act
    success, block_data, error_msg, extra = service.get_validation_status(random_block_id)
    
    # Assert
    assert success is False, "Should return success=False"
    assert block_data is None, "block_data should be None"
    assert "not found" in error_msg.lower(), f"error_msg should contain 'not found', got: {error_msg}"
    assert extra is None, "extra should be None"


def test_get_validation_status_invalid_uuid_format():
    """
    GIVEN malformed UUID string passed
    WHEN get_validation_status("invalid-uuid") is called
    THEN raise ValueError or UUID parsing error
    """
    # Arrange
    mock_supabase = Mock()
    service = ValidationService(mock_supabase)
    
    # Act & Assert
    with pytest.raises((ValueError, TypeError)):
        # Note: This test expects the service to validate UUID format
        # OR for Python's UUID() constructor to raise an error
        service.get_validation_status("invalid-uuid")


# ===== ERROR HANDLING =====

def test_get_validation_status_db_connection_error():
    """
    GIVEN Supabase client raises Exception (connection timeout)
    WHEN get_validation_status(block_id) is called
    THEN return (False, None, "Database connection failed", extra)
    AND extra contains exception details
    """
    # Arrange
    mock_supabase = Mock()
    mock_table = Mock()
    
    test_block_id = uuid4()
    
    # Mock Supabase to raise exception
    mock_supabase.table.return_value = mock_table
    mock_table.select.side_effect = Exception("Connection timeout")
    
    service = ValidationService(mock_supabase)
    
    # Act
    success, block_data, error_msg, extra = service.get_validation_status(test_block_id)
    
    # Assert
    assert success is False, "Should return success=False on exception"
    assert block_data is None, "block_data should be None"
    assert "database connection failed" in error_msg.lower(), f"error_msg should contain 'database connection failed', got: {error_msg}"
    assert extra is not None, "extra should contain exception details"
    assert "exception" in extra, "extra should have 'exception' key"


def test_get_validation_status_missing_validation_report_column():
    """
    GIVEN blocks table missing validation_report column (migration not run)
    WHEN get_validation_status(block_id) is called
    THEN should handle gracefully (return None for validation_report)
    OR return error if column access fails
    """
    # Arrange
    mock_supabase = Mock()
    mock_table = Mock()
    mock_select = Mock()
    mock_eq = Mock()
    
    test_block_id = uuid4()
    
    # Mock Supabase chain - data missing validation_report key
    mock_supabase.table.return_value = mock_table
    mock_table.select.return_value = mock_select
    mock_select.eq.return_value = mock_eq
    mock_eq.execute.return_value = MagicMock(data=[{
        "id": str(test_block_id),
        "iso_code": "PENDING-test",
        "status": "uploaded",
        "event_id": "evt-test"
        # Note: validation_report key is missing (simulates migration not run)
    }])
    
    service = ValidationService(mock_supabase)
    
    # Act
    success, block_data, error_msg, extra = service.get_validation_status(test_block_id)
    
    # Assert
    # Service should handle missing column gracefully (default to None)
    assert success is True, "Should return success=True even if column missing"
    assert block_data.get("validation_report") is None, "validation_report should default to None if missing"
