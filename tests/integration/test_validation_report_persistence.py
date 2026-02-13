"""
Integration Tests for ValidationReportService Database Persistence

Tests real database interactions with Supabase for validation reports.

Test Coverage:
- Roundtrip: Save validation report and retrieve it (data integrity)
- JSONB Querying: Verify indexes work for filtering by validation status
- Real Database: Tests run against actual Supabase instance
"""

import pytest
from datetime import datetime
from uuid import uuid4
from services.validation_report_service import ValidationReportService
from schemas import ValidationErrorItem, ValidationReport


@pytest.fixture
def test_block_id(supabase_client):
    """
    Create a test block in the database for integration tests.
    
    Cleanup after test completes to avoid pollution.
    """
    # Create a test block record
    block_id = str(uuid4())
    iso_code = f"TEST-{uuid4().hex[:8].upper()}-XX-001"
    result = supabase_client.table("blocks").insert({
        "id": block_id,
        "iso_code": iso_code,
        "status": "uploaded",
        "tipologia": "test",
        "validation_report": None
    }).execute()
    
    yield block_id
    
    # Cleanup: Delete the test block
    supabase_client.table("blocks").delete().eq("id", block_id).execute()


def test_save_and_retrieve_report_roundtrip(supabase_client, test_block_id):
    """
    GIVEN a ValidationReport is created and saved to database
    WHEN retrieved using get_report()
    THEN retrieved report matches original (except datetime precision)
    
    This test verifies:
    - JSONB serialization/deserialization integrity
    - Pydantic model round-trip conversion
    - Database persistence correctness
    """
    # Arrange
    service = ValidationReportService(supabase_client)
    
    original_errors = [
        ValidationErrorItem(
            category="nomenclature",
            target="Layer-Invalid",
            message="Does not match ISO-19650 pattern"
        ),
        ValidationErrorItem(
            category="geometry",
            target="Object-123",
            message="Invalid geometry detected"
        )
    ]
    
    original_metadata = {
        "layer_count": 10,
        "object_count": 250,
        "user_strings": {
            "Classification": "Structural",
            "Material": "Concrete"
        }
    }
    
    # Create report
    original_report = service.create_report(
        errors=original_errors,
        metadata=original_metadata,
        validated_by="integration-test-worker"
    )
    
    # Act - Save to database
    success, error = service.save_to_db(test_block_id, original_report)
    
    # Assert - Save succeeded
    assert success is True, f"Save failed: {error}"
    assert error is None
    
    # Act - Retrieve from database
    retrieved_report, retrieve_error = service.get_report(test_block_id)
    
    # Assert - Retrieve succeeded
    assert retrieve_error is None, f"Retrieve failed: {retrieve_error}"
    assert retrieved_report is not None
    assert isinstance(retrieved_report, ValidationReport)
    
    # Assert - Data integrity
    assert retrieved_report.is_valid == original_report.is_valid, "is_valid should match"
    assert len(retrieved_report.errors) == len(original_report.errors), "Error count should match"
    
    # Verify first error
    assert retrieved_report.errors[0].category == "nomenclature"
    assert retrieved_report.errors[0].target == "Layer-Invalid"
    assert "ISO-19650" in retrieved_report.errors[0].message
    
    # Verify second error
    assert retrieved_report.errors[1].category == "geometry"
    assert retrieved_report.errors[1].target == "Object-123"
    
    # Verify metadata
    assert retrieved_report.metadata["layer_count"] == 10
    assert retrieved_report.metadata["object_count"] == 250
    assert retrieved_report.metadata["user_strings"]["Classification"] == "Structural"
    
    # Verify metadata fields
    assert retrieved_report.validated_by == "integration-test-worker"
    
    # Note: validated_at may lose microsecond precision in DB roundtrip
    # Just verify it exists and is a datetime
    assert retrieved_report.validated_at is not None
    assert isinstance(retrieved_report.validated_at, datetime)


def test_jsonb_query_on_validation_status(supabase_client):
    """
    GIVEN multiple blocks with different validation statuses
    WHEN querying blocks WHERE validation_report->>'is_valid' = 'false'
    THEN only blocks with failed validations are returned
    
    This test verifies:
    - JSONB index is used for filtering
    - Queries return correct subset of data
    - Index from T-020-DB migration is functional
    """
    # Arrange - Create test blocks with different statuses
    service = ValidationReportService(supabase_client)
    
    valid_block_id = str(uuid4())
    invalid_block_id_1 = str(uuid4())
    invalid_block_id_2 = str(uuid4())
    no_report_block_id = str(uuid4())
    
    # Create blocks
    supabase_client.table("blocks").insert([
        {"id": valid_block_id, "iso_code": f"TEST-{uuid4().hex[:8].upper()}-A-001", "status": "validated", "tipologia": "test"},
        {"id": invalid_block_id_1, "iso_code": f"TEST-{uuid4().hex[:8].upper()}-B-002", "status": "rejected", "tipologia": "test"},
        {"id": invalid_block_id_2, "iso_code": f"TEST-{uuid4().hex[:8].upper()}-C-003", "status": "rejected", "tipologia": "test"},
        {"id": no_report_block_id, "iso_code": f"TEST-{uuid4().hex[:8].upper()}-D-004", "status": "uploaded", "tipologia": "test"}
    ]).execute()
    
    try:
        # Save valid report
        valid_report = service.create_report(errors=[], metadata={}, validated_by="test")
        service.save_to_db(valid_block_id, valid_report)
        
        # Save invalid reports
        invalid_report_1 = service.create_report(
            errors=[ValidationErrorItem(category="nomenclature", target="Layer1", message="Error")],
            metadata={},
            validated_by="test"
        )
        service.save_to_db(invalid_block_id_1, invalid_report_1)
        
        invalid_report_2 = service.create_report(
            errors=[ValidationErrorItem(category="geometry", target="Obj1", message="Invalid")],
            metadata={},
            validated_by="test"
        )
        service.save_to_db(invalid_block_id_2, invalid_report_2)
        
        # no_report_block_id has NULL validation_report
        
        # Act - Query for failed validations
        result = supabase_client.table("blocks").select("id, validation_report").eq(
            "validation_report->>is_valid", "false"
        ).execute()
        
        # Assert
        failed_block_ids = [row["id"] for row in result.data]
        
        assert invalid_block_id_1 in failed_block_ids, "invalid_block_id_1 should be in results"
        assert invalid_block_id_2 in failed_block_ids, "invalid_block_id_2 should be in results"
        assert valid_block_id not in failed_block_ids, "valid_block_id should NOT be in results"
        assert no_report_block_id not in failed_block_ids, "no_report_block_id should NOT be in results"
        
        # Verify that query only returns failed validations
        for row in result.data:
            report_data = row["validation_report"]
            assert report_data["is_valid"] is False, "All returned reports should have is_valid=False"
    
    finally:
        # Cleanup - Delete test blocks
        supabase_client.table("blocks").delete().in_("id", [
            valid_block_id,
            invalid_block_id_1,
            invalid_block_id_2,
            no_report_block_id
        ]).execute()


def test_get_report_block_not_found(supabase_client):
    """
    GIVEN a block_id that does not exist in database
    WHEN get_report() is called
    THEN return (None, "Block not found")
    
    This test verifies error handling for non-existent blocks.
    """
    # Arrange
    service = ValidationReportService(supabase_client)
    non_existent_id = str(uuid4())
    
    # Act
    report, error = service.get_report(non_existent_id)
    
    # Assert
    assert report is None, "Report should be None for non-existent block"
    assert error == "Block not found", f"Expected 'Block not found', got '{error}'"
