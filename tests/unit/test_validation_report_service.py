"""
Unit Tests for ValidationReportService

Tests service methods for creating and persisting validation reports.

Test Coverage:
- Happy Path: Create reports with/without errors, save/retrieve from DB
- Edge Cases: Empty metadata, block not found, no report yet
- Security/Errors: Invalid UUID, None metadata, serialization
"""

import pytest
from datetime import datetime
from unittest.mock import Mock, MagicMock
from src.backend.services.validation_report_service import ValidationReportService
from src.backend.schemas import ValidationErrorItem, ValidationReport


# ===== HAPPY PATH TESTS =====

def test_create_report_with_no_errors():
    """
    GIVEN empty errors list, valid metadata, validated_by="test-worker"
    WHEN create_report() is called
    THEN return ValidationReport with is_valid=True, errors=[], metadata populated
    """
    # Arrange
    mock_supabase = Mock()
    service = ValidationReportService(mock_supabase)
    
    errors = []
    metadata = {"layer_count": 5, "object_count": 100}
    validated_by = "test-worker"
    
    # Act
    report = service.create_report(errors, metadata, validated_by)
    
    # Assert
    assert isinstance(report, ValidationReport), "Should return ValidationReport instance"
    assert report.is_valid is True, "Report with no errors should be valid"
    assert report.errors == [], "Errors list should be empty"
    assert report.metadata == metadata, "Metadata should match input"
    assert report.validated_by == validated_by, "validated_by should match input"
    assert isinstance(report.validated_at, datetime), "validated_at should be datetime"


def test_create_report_with_errors():
    """
    GIVEN list with 3 ValidationErrorItems, valid metadata
    WHEN create_report() is called
    THEN return ValidationReport with is_valid=False, errors list contains 3 items
    """
    # Arrange
    mock_supabase = Mock()
    service = ValidationReportService(mock_supabase)
    
    errors = [
        ValidationErrorItem(category="nomenclature", target="Layer1", message="Invalid format"),
        ValidationErrorItem(category="nomenclature", target="Layer2", message="Missing prefix"),
        ValidationErrorItem(category="geometry", target="Object-123", message="Invalid geometry"),
    ]
    metadata = {"layer_count": 2}
    
    # Act
    report = service.create_report(errors, metadata)
    
    # Assert
    assert report.is_valid is False, "Report with errors should be invalid"
    assert len(report.errors) == 3, f"Expected 3 errors, got {len(report.errors)}"
    assert report.errors[0].category == "nomenclature"
    assert report.errors[2].category == "geometry"
    assert report.metadata == metadata


def test_save_report_to_db_success():
    """
    GIVEN valid block_id exists in DB, ValidationReport created
    WHEN save_to_db(block_id, report) is called
    THEN return (True, None) and database record updated
    """
    # Arrange
    mock_supabase = Mock()
    mock_table = Mock()
    mock_update = Mock()
    mock_eq = Mock()
    
    # Mock Supabase chain: table().update().eq().execute()
    mock_supabase.table.return_value = mock_table
    mock_table.update.return_value = mock_update
    mock_update.eq.return_value = mock_eq
    mock_eq.execute.return_value = MagicMock(data=[{"id": "test-block-id"}])
    
    service = ValidationReportService(mock_supabase)
    
    report = ValidationReport(
        is_valid=True,
        errors=[],
        metadata={},
        validated_at=datetime.utcnow(),
        validated_by="test-worker"
    )
    block_id = "test-block-id"
    
    # Act
    success, error = service.save_to_db(block_id, report)
    
    # Assert
    assert success is True, "Save should succeed"
    assert error is None, "Error should be None on success"
    mock_supabase.table.assert_called_once_with("blocks")
    mock_table.update.assert_called_once()


def test_get_report_success():
    """
    GIVEN block exists with validation_report populated
    WHEN get_report(block_id) is called
    THEN return (ValidationReport, None) with all fields matching
    """
    # Arrange
    mock_supabase = Mock()
    mock_table = Mock()
    mock_select = Mock()
    mock_eq = Mock()
    
    # Mock Supabase chain: table().select().eq().execute()
    mock_supabase.table.return_value = mock_table
    mock_table.select.return_value = mock_select
    mock_select.eq.return_value = mock_eq
    
    # Mock report data in DB
    report_data = {
        "is_valid": True,
        "errors": [],
        "metadata": {"layer_count": 5},
        "validated_at": "2026-02-14T10:00:00",
        "validated_by": "test-worker"
    }
    mock_eq.execute.return_value = MagicMock(data=[{"validation_report": report_data}])
    
    service = ValidationReportService(mock_supabase)
    block_id = "test-block-id"
    
    # Act
    report, error = service.get_report(block_id)
    
    # Assert
    assert report is not None, "Report should be returned"
    assert error is None, "Error should be None"
    assert isinstance(report, ValidationReport), "Should return ValidationReport instance"
    assert report.is_valid is True
    assert report.metadata["layer_count"] == 5


# ===== EDGE CASE TESTS =====

def test_create_report_with_empty_metadata():
    """
    GIVEN empty metadata dict {}
    WHEN create_report() is called
    THEN return valid report with metadata={}
    """
    # Arrange
    mock_supabase = Mock()
    service = ValidationReportService(mock_supabase)
    
    # Act
    report = service.create_report(errors=[], metadata={})
    
    # Assert
    assert report.metadata == {}, "Empty metadata should be accepted"
    assert report.is_valid is True


def test_save_report_block_not_found():
    """
    GIVEN block_id does not exist in database
    WHEN save_to_db(non_existent_id, report) is called
    THEN return (False, "Block not found")
    """
    # Arrange
    mock_supabase = Mock()
    mock_table = Mock()
    mock_update = Mock()
    mock_eq = Mock()
    
    # Mock empty result (block not found)
    mock_supabase.table.return_value = mock_table
    mock_table.update.return_value = mock_update
    mock_update.eq.return_value = mock_eq
    mock_eq.execute.return_value = MagicMock(data=[])  # No rows updated
    
    service = ValidationReportService(mock_supabase)
    
    report = ValidationReport(
        is_valid=True,
        errors=[],
        metadata={},
        validated_at=datetime.utcnow(),
        validated_by="test"
    )
    
    # Act
    success, error = service.save_to_db("non-existent-id", report)
    
    # Assert
    assert success is False, "Save should fail for non-existent block"
    assert error == "Block not found", f"Expected 'Block not found', got '{error}'"


def test_get_report_no_report_yet():
    """
    GIVEN block exists but validation_report column is NULL
    WHEN get_report(block_id) is called
    THEN return (None, "No validation report")
    """
    # Arrange
    mock_supabase = Mock()
    mock_table = Mock()
    mock_select = Mock()
    mock_eq = Mock()
    
    # Mock result with NULL validation_report
    mock_supabase.table.return_value = mock_table
    mock_table.select.return_value = mock_select
    mock_select.eq.return_value = mock_eq
    mock_eq.execute.return_value = MagicMock(data=[{"validation_report": None}])
    
    service = ValidationReportService(mock_supabase)
    
    # Act
    report, error = service.get_report("existing-block-id")
    
    # Assert
    assert report is None, "Report should be None when not found"
    assert error == "No validation report", f"Expected 'No validation report', got '{error}'"


def test_update_existing_report():
    """
    GIVEN block already has a validation_report
    WHEN save_to_db() is called with new report
    THEN old report is replaced, (True, None) returned
    """
    # Arrange
    mock_supabase = Mock()
    mock_table = Mock()
    mock_update = Mock()
    mock_eq = Mock()
    
    mock_supabase.table.return_value = mock_table
    mock_table.update.return_value = mock_update
    mock_update.eq.return_value = mock_eq
    mock_eq.execute.return_value = MagicMock(data=[{"id": "block-id"}])
    
    service = ValidationReportService(mock_supabase)
    
    new_report = ValidationReport(
        is_valid=False,
        errors=[ValidationErrorItem(category="geometry", target="Obj1", message="Invalid")],
        metadata={"updated": True},
        validated_at=datetime.utcnow(),
        validated_by="test"
    )
    
    # Act
    success, error = service.save_to_db("block-id", new_report)
    
    # Assert
    assert success is True, "Update should succeed"
    assert error is None


# ===== SECURITY/ERROR TESTS =====

def test_save_report_with_invalid_block_id_format():
    """
    GIVEN block_id is not a valid UUID (e.g., "invalid-id")
    WHEN save_to_db() is called
    THEN return (False, error_message) without crashing
    """
    # Arrange
    mock_supabase = Mock()
    mock_table = Mock()
    mock_update = Mock()
    mock_eq = Mock()
    
    # Mock exception from Supabase
    mock_supabase.table.return_value = mock_table
    mock_table.update.return_value = mock_update
    mock_update.eq.return_value = mock_eq
    mock_eq.execute.side_effect = Exception("Invalid UUID format")
    
    service = ValidationReportService(mock_supabase)
    
    report = ValidationReport(
        is_valid=True,
        errors=[],
        metadata={},
        validated_at=datetime.utcnow(),
        validated_by="test"
    )
    
    # Act
    success, error = service.save_to_db("invalid-id", report)
    
    # Assert
    assert success is False, "Should fail gracefully"
    assert error is not None, "Should return error message"
    assert "Invalid UUID" in error or "format" in error.lower()


def test_serialization_to_json():
    """
    GIVEN ValidationReport with datetime objects
    WHEN serialized using .model_dump(mode='json')
    THEN datetime converted to ISO string, no serialization errors
    """
    # Arrange
    mock_supabase = Mock()
    service = ValidationReportService(mock_supabase)
    
    errors = [
        ValidationErrorItem(category="nomenclature", target="Layer1", message="Error")
    ]
    metadata = {"key": "value"}
    
    report = service.create_report(errors, metadata, "test-worker")
    
    # Act
    try:
        serialized = report.model_dump(mode='json')
    except Exception as e:
        pytest.fail(f"Serialization failed: {e}")
    
    # Assert
    assert "validated_at" in serialized, "validated_at should be in serialized output"
    assert isinstance(serialized["validated_at"], str), "validated_at should be ISO string"
    assert serialized["is_valid"] is False, "is_valid should be False with errors"
    assert len(serialized["errors"]) == 1
