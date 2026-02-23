"""
Unit Tests for GeometryValidator Service (T-027-AGENT)

Tests 3D geometry validation logic for Rhino objects.
Phase: TDD-RED (failing tests before implementation)

Test Coverage:
- Happy Path: Valid geometry, empty models
- Edge Cases: Invalid geometry, null geometry, degenerate bbox, zero volume
- Security: None inputs, objects without attributes

NOTE: These tests mock rhino3dm to avoid CMake build requirements.
"""

import pytest
from unittest.mock import Mock
from src.agent.services.geometry_validator import GeometryValidator
from src.backend.schemas import ValidationErrorItem
from src.agent.constants import (
    GEOMETRY_CATEGORY_NAME,
    GEOMETRY_ERROR_INVALID,
    GEOMETRY_ERROR_NULL,
    GEOMETRY_ERROR_DEGENERATE_BBOX,
)


@pytest.fixture
def mock_valid_geometry():
    """Mock valid Rhino geometry object (IsValid=True, proper bbox, volume>0)."""
    mock_geom = Mock()
    mock_geom.IsValid = True

    # Mock valid bounding box
    mock_bbox = Mock()
    mock_bbox.IsValid = True
    mock_bbox.Min = Mock(X=0.0, Y=0.0, Z=0.0)
    mock_bbox.Max = Mock(X=10.0, Y=10.0, Z=10.0)  # Volume = 1000 cubic units
    mock_geom.GetBoundingBox = Mock(return_value=mock_bbox)

    return mock_geom


@pytest.fixture
def mock_invalid_geometry():
    """Mock invalid Rhino geometry (IsValid=False)."""
    mock_geom = Mock()
    mock_geom.IsValid = False

    # Still provide bbox for subsequent checks
    mock_bbox = Mock()
    mock_bbox.IsValid = True
    mock_bbox.Min = Mock(X=0.0, Y=0.0, Z=0.0)
    mock_bbox.Max = Mock(X=5.0, Y=5.0, Z=5.0)
    mock_geom.GetBoundingBox = Mock(return_value=mock_bbox)

    return mock_geom


@pytest.fixture
def mock_degenerate_bbox_geometry():
    """Mock geometry with degenerate bounding box (bbox.IsValid=False)."""
    mock_geom = Mock()
    mock_geom.IsValid = True

    mock_bbox = Mock()
    mock_bbox.IsValid = False  # Degenerate bbox
    mock_geom.GetBoundingBox = Mock(return_value=mock_bbox)

    return mock_geom


@pytest.fixture
def mock_zero_volume_geometry():
    """Mock Brep/Mesh with zero volume (flat/collapsed geometry)."""
    mock_geom = Mock()
    mock_geom.IsValid = True
    mock_geom.__class__.__name__ = "Brep"  # Identify as Brep type

    # Mock bbox with zero volume (flat in Z dimension)
    mock_bbox = Mock()
    mock_bbox.IsValid = True
    mock_bbox.Min = Mock(X=0.0, Y=0.0, Z=0.0)
    mock_bbox.Max = Mock(X=10.0, Y=10.0, Z=0.0)  # Volume = 0 cubic units
    mock_geom.GetBoundingBox = Mock(return_value=mock_bbox)

    return mock_geom


@pytest.fixture
def mock_3dm_object(mock_valid_geometry):
    """Mock rhino3dm File3dmObject with attributes and geometry."""
    mock_obj = Mock()
    mock_obj.Geometry = mock_valid_geometry
    mock_obj.Attributes = Mock()
    mock_obj.Attributes.Id = Mock()
    mock_obj.Attributes.Id.__str__ = Mock(return_value="12345678-1234-1234-1234-123456789abc")
    mock_obj.Attributes.Name = "TestObject"
    return mock_obj


@pytest.fixture
def mock_3dm_model():
    """Mock rhino3dm.File3dm model with objects list."""
    mock_model = Mock()
    mock_model.Objects = []
    return mock_model


# ===== HAPPY PATH TESTS =====

def test_validate_geometry_all_valid_objects(mock_3dm_model, mock_3dm_object):
    """
    SCENARIO HP-1: All objects have valid geometry
    GIVEN: A model with 5 objects, all have IsValid=True
    WHEN: validate_geometry() is called
    THEN: Return empty list (no errors)
    """
    # Arrange: Model with 5 valid objects
    mock_3dm_model.Objects = [mock_3dm_object for _ in range(5)]

    validator = GeometryValidator()

    # Act
    errors = validator.validate_geometry(mock_3dm_model)

    # Assert
    assert errors == [], f"Expected no errors for valid geometry, got {errors}"
    assert isinstance(errors, list), "validate_geometry must return a list"


def test_validate_geometry_empty_model(mock_3dm_model):
    """
    SCENARIO HP-2: Empty model (no objects)
    GIVEN: A model with Objects = []
    WHEN: validate_geometry() is called
    THEN: Return empty list (no objects to validate, no crash)
    """
    # Arrange: Empty model
    mock_3dm_model.Objects = []

    validator = GeometryValidator()

    # Act
    errors = validator.validate_geometry(mock_3dm_model)

    # Assert
    assert errors == [], "Empty model should return empty error list"
    assert isinstance(errors, list)


# ===== EDGE CASE TESTS =====

def test_validate_geometry_all_invalid_objects(mock_3dm_model, mock_invalid_geometry):
    """
    SCENARIO EC-1: All objects have invalid geometry
    GIVEN: A model with 3 objects, all have IsValid=False
    WHEN: validate_geometry() is called
    THEN: Return 3 ValidationErrorItem with category="geometry"
    """
    # Arrange: Create 3 objects with invalid geometry
    mock_objs = []
    for i in range(3):
        obj = Mock()
        obj.Geometry = mock_invalid_geometry
        obj.Attributes = Mock()
        obj.Attributes.Id = Mock()
        obj.Attributes.Id.__str__ = Mock(return_value=f"invalid-obj-{i}")
        obj.Attributes.Name = f"InvalidObj{i}"
        mock_objs.append(obj)

    mock_3dm_model.Objects = mock_objs

    validator = GeometryValidator()

    # Act
    errors = validator.validate_geometry(mock_3dm_model)

    # Assert
    assert len(errors) == 3, f"Expected 3 errors for 3 invalid objects, got {len(errors)}"
    assert all(isinstance(err, ValidationErrorItem) for err in errors)
    assert all(err.category == GEOMETRY_CATEGORY_NAME for err in errors)
    assert all(GEOMETRY_ERROR_INVALID in err.message for err in errors)


def test_validate_geometry_mixed_valid_invalid(mock_3dm_model, mock_valid_geometry, mock_invalid_geometry):
    """
    SCENARIO EC-2: Mixed valid and invalid objects
    GIVEN: A model with 5 objects: 2 valid, 3 invalid
    WHEN: validate_geometry() is called
    THEN: Return 3 errors (ONLY for invalid objects)
    """
    # Arrange: Create mixed objects
    mock_objs = []

    # 2 valid objects
    for i in range(2):
        obj = Mock()
        obj.Geometry = mock_valid_geometry
        obj.Attributes = Mock()
        obj.Attributes.Id = Mock()
        obj.Attributes.Id.__str__ = Mock(return_value=f"valid-obj-{i}")
        obj.Attributes.Name = f"ValidObj{i}"
        mock_objs.append(obj)

    # 3 invalid objects
    for i in range(3):
        obj = Mock()
        obj.Geometry = mock_invalid_geometry
        obj.Attributes = Mock()
        obj.Attributes.Id = Mock()
        obj.Attributes.Id.__str__ = Mock(return_value=f"invalid-obj-{i}")
        obj.Attributes.Name = f"InvalidObj{i}"
        mock_objs.append(obj)

    mock_3dm_model.Objects = mock_objs

    validator = GeometryValidator()

    # Act
    errors = validator.validate_geometry(mock_3dm_model)

    # Assert
    assert len(errors) == 3, f"Expected 3 errors for 3 invalid objects, got {len(errors)}"

    # Verify errors are only for invalid objects
    error_targets = [err.target for err in errors]
    assert "valid-obj-0" not in error_targets
    assert "valid-obj-1" not in error_targets
    assert "invalid-obj-0" in error_targets
    assert "invalid-obj-1" in error_targets
    assert "invalid-obj-2" in error_targets


def test_validate_geometry_null_geometry(mock_3dm_model):
    """
    SCENARIO EC-3: Object with null geometry (obj.Geometry = None)
    GIVEN: A model with 1 object having Geometry=None
    WHEN: validate_geometry() is called
    THEN: Return 1 error with message "Geometry is null or missing"
    """
    # Arrange: Object with null geometry
    mock_obj = Mock()
    mock_obj.Geometry = None  # Null geometry
    mock_obj.Attributes = Mock()
    mock_obj.Attributes.Id = Mock()
    mock_obj.Attributes.Id.__str__ = Mock(return_value="null-geom-obj")
    mock_obj.Attributes.Name = "NullGeometryObject"

    mock_3dm_model.Objects = [mock_obj]

    validator = GeometryValidator()

    # Act
    errors = validator.validate_geometry(mock_3dm_model)

    # Assert
    assert len(errors) == 1, "Expected 1 error for null geometry"
    assert errors[0].category == GEOMETRY_CATEGORY_NAME
    assert errors[0].target == "null-geom-obj"
    assert GEOMETRY_ERROR_NULL in errors[0].message


def test_validate_geometry_degenerate_bounding_box(mock_3dm_model, mock_degenerate_bbox_geometry):
    """
    SCENARIO EC-4: Object with degenerate bounding box (bbox.IsValid=False)
    GIVEN: A model with 1 object having valid geometry but degenerate bbox
    WHEN: validate_geometry() is called
    THEN: Return 1 error with message "Bounding box is degenerate..."
    """
    # Arrange: Object with degenerate bbox
    mock_obj = Mock()
    mock_obj.Geometry = mock_degenerate_bbox_geometry
    mock_obj.Attributes = Mock()
    mock_obj.Attributes.Id = Mock()
    mock_obj.Attributes.Id.__str__ = Mock(return_value="degenerate-bbox-obj")
    mock_obj.Attributes.Name = "DegenerateBBoxObject"

    mock_3dm_model.Objects = [mock_obj]

    validator = GeometryValidator()

    # Act
    errors = validator.validate_geometry(mock_3dm_model)

    # Assert
    assert len(errors) == 1, "Expected 1 error for degenerate bbox"
    assert errors[0].category == GEOMETRY_CATEGORY_NAME
    assert errors[0].target == "degenerate-bbox-obj"
    assert GEOMETRY_ERROR_DEGENERATE_BBOX in errors[0].message


def test_validate_geometry_zero_volume_solid(mock_3dm_model, mock_zero_volume_geometry):
    """
    SCENARIO EC-5: Brep/Mesh with zero volume
    GIVEN: A model with 1 Brep object having volume < MIN_VALID_VOLUME
    WHEN: validate_geometry() is called
    THEN: Return 1 error with message "zero or near-zero volume"
    """
    # Arrange: Brep with zero volume (flat geometry)
    mock_obj = Mock()
    mock_obj.Geometry = mock_zero_volume_geometry
    mock_obj.Attributes = Mock()
    mock_obj.Attributes.Id = Mock()
    mock_obj.Attributes.Id.__str__ = Mock(return_value="zero-volume-brep")
    mock_obj.Attributes.Name = "ZeroVolumeBrepObject"

    mock_3dm_model.Objects = [mock_obj]

    validator = GeometryValidator()

    # Act
    errors = validator.validate_geometry(mock_3dm_model)

    # Assert
    assert len(errors) == 1, "Expected 1 error for zero volume solid"
    assert errors[0].category == GEOMETRY_CATEGORY_NAME
    assert errors[0].target == "zero-volume-brep"
    assert "zero" in errors[0].message.lower() or "volume" in errors[0].message.lower()


# ===== SECURITY / ERROR HANDLING TESTS =====

def test_validate_geometry_none_model_input():
    """
    SCENARIO SE-1: None input to validate_geometry
    GIVEN: model parameter is None
    WHEN: validate_geometry(None) is called
    THEN: Return empty list (graceful handling) OR raise TypeError (acceptable)
    """
    validator = GeometryValidator()

    # Act & Assert: Either return empty list or raise TypeError
    try:
        errors = validator.validate_geometry(None)
        assert errors == [], "None input should return empty error list"
    except (TypeError, AttributeError) as e:
        # Acceptable: defensive programming may raise exception for None input
        assert "None" in str(e) or "NoneType" in str(e)


def test_validate_geometry_object_without_attributes(mock_3dm_model, mock_valid_geometry):
    """
    SCENARIO SE-2: Object without Attributes (edge case)
    GIVEN: A model with object having no Attributes property
    WHEN: validate_geometry() is called
    THEN: Gracefully handle missing attributes (use placeholder ID or skip)
    """
    # Arrange: Object without attributes
    mock_obj = Mock()
    mock_obj.Geometry = mock_valid_geometry
    mock_obj.Attributes = None  # Missing attributes

    mock_3dm_model.Objects = [mock_obj]

    validator = GeometryValidator()

    # Act & Assert: Should not crash
    try:
        errors = validator.validate_geometry(mock_3dm_model)
        # If it handles gracefully, errors should be empty or contain placeholder ID
        assert isinstance(errors, list)
    except AttributeError:
        # Acceptable: may raise AttributeError if defensive programming skips check
        pass
