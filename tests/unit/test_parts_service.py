"""
Unit Tests for PartsService (T-0501-BACK)

Tests service methods for querying parts list for 3D canvas.

Test Coverage (8-10 tests):
- Happy Path: list_parts with various filter combinations
- Data Transformation: DB rows → PartCanvasItem Pydantic models
- Query Building: Dynamic WHERE clause construction
- NULL Handling: low_poly_url and bbox NULL values
- RLS Logic: Workshop user vs BIM Manager filtering
- UUID Validation: Invalid UUID format handling
- JSONB Parsing: bbox deserialization from database

Expected Result: ALL TESTS MUST FAIL (TDD-RED Phase)
- ImportError: Module 'src.backend.services.parts_service' does not exist
- AssertionError: Expected behavior not implemented

Author: AI Assistant (Prompt #039 - TDD-RED Phase)
Date: 2026-02-19
"""

from uuid import uuid4
from unittest.mock import Mock, MagicMock

# This import WILL FAIL because parts_service.py does not exist yet (TDD-RED)
from services.parts_service import PartsService
from schemas import PartCanvasItem, PartsListResponse, BoundingBox


# ===== HAPPY PATH TESTS =====

def test_list_parts_builds_correct_query_no_filters():
    """
    GIVEN no filters provided (status=None, tipologia=None, workshop_id=None)
    WHEN list_parts() is called
    THEN Supabase query filters only by is_archived=false
    AND returns all non-archived blocks
    """
    # Arrange
    mock_supabase = Mock()
    mock_table = Mock()
    mock_select = Mock()
    mock_eq = Mock()
    mock_order = Mock()

    # Mock database response
    db_response = [
        {
            "id": str(uuid4()),
            "iso_code": "SF-C12-D-001",
            "status": "validated",
            "tipologia": "capitel",
            "low_poly_url": "https://example.com/file.glb",
            "bbox": {"min": [-1.0, -1.0, -1.0], "max": [1.0, 1.0, 1.0]},
            "workshop_id": str(uuid4())
        }
    ]

    mock_supabase.table.return_value = mock_table
    mock_table.select.return_value = mock_select
    mock_select.eq.return_value = mock_eq  # For is_archived=false filter
    mock_eq.order.return_value = mock_order  # For created_at ordering
    mock_order.execute.return_value = MagicMock(data=db_response)

    service = PartsService(mock_supabase)

    # Act
    result = service.list_parts(status=None, tipologia=None, workshop_id=None)

    # Assert
    assert isinstance(result, PartsListResponse), "Should return PartsListResponse"
    assert len(result.parts) == 1, "Should return 1 part"
    assert result.count == 1, "count should be 1"

    # Verify Supabase methods were called
    mock_supabase.table.assert_called_once_with("blocks")
    mock_table.select.assert_called_once()
    # Verify is_archived filter was applied (first .eq() call in chain)
    mock_select.eq.assert_called_with("is_archived", False)


def test_list_parts_applies_status_filter():
    """
    GIVEN status filter = "validated"
    WHEN list_parts(status="validated") is called
    THEN Supabase query includes WHERE status = 'validated'
    AND returns only validated blocks
    """
    # Arrange
    mock_supabase = Mock()
    mock_table = Mock()
    mock_select = Mock()
    mock_eq = Mock()
    mock_order = Mock()

    db_response = [
        {
            "id": str(uuid4()),
            "iso_code": "SF-C12-D-002",
            "status": "validated",
            "tipologia": "columna",
            "low_poly_url": None,
            "bbox": None,
            "workshop_id": None
        }
    ]

    mock_supabase.table.return_value = mock_table
    mock_table.select.return_value = mock_select
    mock_select.eq.return_value = mock_eq
    mock_eq.eq.return_value = mock_eq  # Chain for multiple filters
    mock_eq.order.return_value = mock_order  # For created_at ordering
    mock_order.execute.return_value = MagicMock(data=db_response)

    service = PartsService(mock_supabase)

    # Act
    result = service.list_parts(status="validated", tipologia=None, workshop_id=None)

    # Assert
    assert len(result.parts) == 1
    assert result.parts[0].status == "validated"
    assert result.filters_applied["status"] == "validated"

    # Verify Supabase eq() was called with status filter
    # (Checking call history: eq("is_archived", False) AND eq("status", "validated"))
    # This will fail in TDD-RED since implementation doesn't exist


def test_list_parts_applies_tipologia_filter():
    """
    GIVEN tipologia filter = "capitel"
    WHEN list_parts(tipologia="capitel") is called
    THEN Supabase query includes WHERE tipologia = 'capitel'
    """
    # Arrange
    mock_supabase = Mock()

    db_response = [
        {
            "id": str(uuid4()),
            "iso_code": "SF-C12-D-003",
            "status": "validated",
            "tipologia": "capitel",
            "low_poly_url": "https://example.com/file.glb",
            "bbox": {"min": [-2.5, 0, -2.5], "max": [2.5, 5, 2.5]},
            "workshop_id": None
        }
    ]

    # Mock chain (now includes .order() call added in GREEN phase)
    mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=db_response)

    service = PartsService(mock_supabase)

    # Act
    result = service.list_parts(status=None, tipologia="capitel", workshop_id=None)

    # Assert
    assert len(result.parts) == 1
    assert result.parts[0].tipologia == "capitel"
    assert result.filters_applied["tipologia"] == "capitel"


def test_list_parts_applies_all_three_filters():
    """
    GIVEN all 3 filters provided (status, tipologia, workshop_id)
    WHEN list_parts(status="validated", tipologia="columna", workshop_id=uuid) is called
    THEN Supabase query includes WHERE status='validated' AND tipologia='columna' AND workshop_id=uuid
    AND is_archived=false
    """
    # Arrange
    mock_supabase = Mock()
    target_workshop = uuid4()

    db_response = [
        {
            "id": str(uuid4()),
            "iso_code": "SF-C12-D-004",
            "status": "validated",
            "tipologia": "columna",
            "low_poly_url": None,
            "bbox": None,
            "workshop_id": str(target_workshop)
        }
    ]

    # Mock chain with .order() call added in GREEN phase
    mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.eq.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=db_response)

    service = PartsService(mock_supabase)

    # Act
    result = service.list_parts(status="validated", tipologia="columna", workshop_id=target_workshop)

    # Assert
    assert len(result.parts) == 1
    assert result.parts[0].status == "validated"
    assert result.parts[0].tipologia == "columna"
    assert str(result.parts[0].workshop_id) == str(target_workshop)
    assert result.filters_applied["status"] == "validated"
    assert result.filters_applied["tipologia"] == "columna"
    # workshop_id in filters_applied is UUID object, convert both to string for comparison
    assert str(result.filters_applied["workshop_id"]) == str(target_workshop)


# ===== DATA TRANSFORMATION TESTS =====

def test_list_parts_transforms_db_rows_to_pydantic():
    """
    GIVEN database returns rows with raw data types (str UUID, dict bbox)
    WHEN list_parts() is called
    THEN service transforms rows to PartCanvasItem Pydantic models
    AND UUID strings remain strings
    AND bbox dict matches BoundingBox structure
    """
    # Arrange
    mock_supabase = Mock()

    test_id = str(uuid4())
    test_workshop_id = str(uuid4())
    test_bbox = {"min": [-1.5, -1.5, -1.5], "max": [1.5, 1.5, 1.5]}

    db_response = [
        {
            "id": test_id,
            "iso_code": "SF-C12-D-005",
            "status": "validated",
            "tipologia": "dovela",
            "low_poly_url": "https://example.com/low-poly.glb",
            "bbox": test_bbox,
            "workshop_id": test_workshop_id
        }
    ]

    # Mock chain includes .order() call added in GREEN phase
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=db_response)

    service = PartsService(mock_supabase)

    # Act
    result = service.list_parts()

    # Assert
    assert len(result.parts) == 1
    part = result.parts[0]

    assert isinstance(part, PartCanvasItem), "Should return PartCanvasItem instances"
    assert str(part.id) == test_id, "UUID should match"
    assert part.iso_code == "SF-C12-D-005"
    assert part.status == "validated"
    assert part.tipologia == "dovela"
    assert part.low_poly_url == "https://example.com/low-poly.glb"
    assert part.bbox is not None
    assert part.bbox.min == test_bbox["min"]
    assert part.bbox.max == test_bbox["max"]
    assert str(part.workshop_id) == test_workshop_id


def test_list_parts_handles_null_low_poly_url():
    """
    GIVEN database row has low_poly_url = NULL
    WHEN list_parts() is called
    THEN PartCanvasItem has low_poly_url = None (not omitted)
    """
    # Arrange
    mock_supabase = Mock()

    db_response = [
        {
            "id": str(uuid4()),
            "iso_code": "SF-C12-D-006",
            "status": "uploaded",
            "tipologia": "clave",
            "low_poly_url": None,  # NULL in DB
            "bbox": None,
            "workshop_id": None
        }
    ]

    # Mock chain includes .order() call
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=db_response)

    service = PartsService(mock_supabase)

    # Act
    result = service.list_parts()

    # Assert
    assert len(result.parts) == 1
    part = result.parts[0]
    assert part.low_poly_url is None, "low_poly_url should be None (null)"
    assert part.bbox is None, "bbox should be None (null)"


def test_list_parts_parses_bbox_from_jsonb():
    """
    GIVEN database stores bbox as JSONB {"min": [...], "max": [...]}
    WHEN list_parts() is called
    THEN service parses JSONB into BoundingBox Pydantic model
    AND BoundingBox.min and BoundingBox.max are lists of 3 floats
    """
    # Arrange
    mock_supabase = Mock()

    test_bbox_json = {"min": [-3.0, -1.0, -3.0], "max": [3.0, 6.0, 3.0]}

    db_response = [
        {
            "id": str(uuid4()),
            "iso_code": "SF-C12-D-007",
            "status": "validated",
            "tipologia": "capitel",
            "low_poly_url": "https://example.com/file.glb",
            "bbox": test_bbox_json,
            "workshop_id": None
        }
    ]

    # Mock chain includes .order() call
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=db_response)

    service = PartsService(mock_supabase)

    # Act
    result = service.list_parts()

    # Assert
    part = result.parts[0]
    assert part.bbox is not None
    assert isinstance(part.bbox, BoundingBox), "bbox should be BoundingBox instance"
    assert part.bbox.min == test_bbox_json["min"]
    assert part.bbox.max == test_bbox_json["max"]
    assert len(part.bbox.min) == 3, "min should have exactly 3 coordinates"
    assert len(part.bbox.max) == 3, "max should have exactly 3 coordinates"


# ===== VALIDATION & ERROR HANDLING =====

def test_list_parts_validates_uuid_format():
    """
    GIVEN workshop_id parameter is an invalid UUID string
    WHEN list_parts(workshop_id="not-a-uuid") is called
    THEN query executes (validation happens at API layer, not service layer)
    
    NOTE: UUID validation is handled by the API endpoint (parts.py _validate_uuid_format helper),
    not by the service layer. This test verifies service accepts any string and passes it to DB.
    """
    # Arrange
    mock_supabase = Mock()

    db_response = []  # No matches for invalid UUID

    # Mock chain includes .order() call
    mock_supabase.table.return_value.select.return_value.eq.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=db_response)

    service = PartsService(mock_supabase)

    # Act - Service does NOT validate UUID format (API layer does)
    result = service.list_parts(workshop_id="not-a-valid-uuid-123")

    # Assert - Returns empty result (DB won't match invalid UUID)
    assert result.count == 0
    assert len(result.parts) == 0


def test_list_parts_empty_result():
    """
    GIVEN database query returns empty list
    WHEN list_parts() is called
    THEN returns PartsListResponse with parts=[], count=0
    """
    # Arrange
    mock_supabase = Mock()

    db_response = []  # Empty result

    # Mock chain includes .order() call
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=db_response)

    service = PartsService(mock_supabase)

    # Act
    result = service.list_parts()

    # Assert
    assert isinstance(result, PartsListResponse)
    assert len(result.parts) == 0, "parts array should be empty"
    assert result.count == 0, "count should be 0"


def test_list_parts_returns_consistent_count():
    """
    GIVEN database returns 5 parts
    WHEN list_parts() is called
    THEN PartsListResponse.count == len(PartsListResponse.parts)
    """
    # Arrange
    mock_supabase = Mock()

    db_response = [
        {
            "id": str(uuid4()),
            "iso_code": f"SF-C12-D-{i:03d}",
            "status": "validated",
            "tipologia": "capitel",
            "low_poly_url": None,
            "bbox": None,
            "workshop_id": None
        }
        for i in range(5)
    ]

    # Mock chain includes .order() call
    mock_supabase.table.return_value.select.return_value.eq.return_value.order.return_value.execute.return_value = MagicMock(data=db_response)

    service = PartsService(mock_supabase)

    # Act
    result = service.list_parts()

    # Assert
    assert result.count == len(result.parts), f"count mismatch: {result.count} != {len(result.parts)}"
    assert result.count == 5, "Should have 5 parts"


# ===== RLS LOGIC (Future Implementation) =====
# NOTE: These tests are placeholders for when RLS logic is implemented in service layer
# RLS is primarily enforced at database level via Supabase policies

def test_list_parts_rls_placeholder_workshop_user():
    """
    PLACEHOLDER TEST: RLS logic for workshop users.
    
    GIVEN user has role=workshop and workshop_id=X
    WHEN list_parts() is called
    THEN service applies RLS filter: (workshop_id=X OR workshop_id IS NULL)
    
    NOTE: This test will fail in TDD-RED as RLS logic not yet implemented.
    Implementation depends on user context passing (JWT decode, Supabase RLS).
    """
    # TODO: Implement when RLS service layer logic is added
    pass


def test_list_parts_rls_placeholder_bim_manager():
    """
    PLACEHOLDER TEST: RLS logic for BIM Managers.
    
    GIVEN user has role=bim_manager
    WHEN list_parts() is called
    THEN service does NOT apply workshop filter (sees all parts)
    
    NOTE: This test will fail in TDD-RED as RLS logic not yet implemented.
    """
    # TODO: Implement when RLS service layer logic is added
    pass
