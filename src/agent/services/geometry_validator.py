"""
Geometry Validation Service

Validates geometric integrity of Rhino objects to detect:
- Invalid geometry (Rhino's internal validity checks)
- Null/missing geometry
- Degenerate bounding boxes
- Zero-volume solids (Brep/Mesh)

This ensures that all geometry can be safely processed in downstream
fabrication workflows without encountering geometric defects.
"""

import structlog
from typing import List

try:
    import rhino3dm
except ImportError:
    rhino3dm = None  # For test environment without rhino3dm installed

# Conditional imports for agent vs backend context
try:
    from constants import (
        GEOMETRY_CATEGORY_NAME,
        MIN_VALID_VOLUME,
        GEOMETRY_ERROR_INVALID,
        GEOMETRY_ERROR_NULL,
        GEOMETRY_ERROR_DEGENERATE_BBOX,
        GEOMETRY_ERROR_ZERO_VOLUME,
    )
except ModuleNotFoundError:
    from src.agent.constants import (
        GEOMETRY_CATEGORY_NAME,
        MIN_VALID_VOLUME,
        GEOMETRY_ERROR_INVALID,
        GEOMETRY_ERROR_NULL,
        GEOMETRY_ERROR_DEGENERATE_BBOX,
        GEOMETRY_ERROR_ZERO_VOLUME,
    )

# Import backend schema for validation errors
try:
    from schemas import ValidationErrorItem
except ModuleNotFoundError:
    from src.backend.schemas import ValidationErrorItem

logger = structlog.get_logger()


class GeometryValidator:
    """
    Service for validating geometric integrity of Rhino objects.

    Performs 3D geometry validation to detect:
    - Invalid geometry (Rhino's internal validity checks)
    - Null/missing geometry
    - Degenerate bounding boxes
    - Zero-volume solids (Brep/Mesh)
    """

    def __init__(self):
        """Initialize geometry validator with logging."""
        logger.info("geometry_validator.initialized")

    def _get_object_id(self, obj) -> str:
        """
        Extract object ID from Rhino object attributes.

        Args:
            obj: Rhino File3dmObject

        Returns:
            String representation of object UUID
        """
        return str(obj.Attributes.Id)

    def validate_geometry(
        self,
        model  # rhino3dm.File3dm (type hint omitted for test compatibility)
    ) -> List[ValidationErrorItem]:
        """
        Validate all geometric objects in a .3dm file.

        Args:
            model: Parsed rhino3dm File3dm object

        Returns:
            List of ValidationErrorItem for objects with invalid geometry.
            Empty list if all geometry is valid.

        Examples:
            >>> validator = GeometryValidator()
            >>> model = rhino3dm.File3dm.Read("valid_model.3dm")
            >>> errors = validator.validate_geometry(model)
            >>> len(errors)
            0
        """
        errors = []

        # Defensive programming
        if model is None:
            logger.warning("geometry_validator.validate_geometry.none_input")
            return errors

        logger.info("geometry_validator.validate_geometry.started", object_count=len(model.Objects))

        for obj in model.Objects:
            object_id = self._get_object_id(obj)

            # Check 1: Null geometry
            if obj.Geometry is None:
                errors.append(ValidationErrorItem(
                    category=GEOMETRY_CATEGORY_NAME,
                    target=object_id,
                    message=GEOMETRY_ERROR_NULL
                ))
                continue  # Skip further checks

            # Check 2: Invalid geometry
            if not obj.Geometry.IsValid:
                errors.append(ValidationErrorItem(
                    category=GEOMETRY_CATEGORY_NAME,
                    target=object_id,
                    message=GEOMETRY_ERROR_INVALID
                ))
                logger.debug("geometry_validator.validation_failed",
                            object_id=object_id,
                            failure_reason="invalid_geometry")

            # Check 3: Degenerate bounding box
            bbox = obj.Geometry.GetBoundingBox(False)
            if not bbox.IsValid:
                errors.append(ValidationErrorItem(
                    category=GEOMETRY_CATEGORY_NAME,
                    target=object_id,
                    message=GEOMETRY_ERROR_DEGENERATE_BBOX
                ))
                logger.debug("geometry_validator.validation_failed",
                            object_id=object_id,
                            failure_reason="degenerate_bbox")

            # Check 4: Zero volume (solo Brep/Mesh)
            # Check if geometry is Brep or Mesh (supports both real rhino3dm and mocks)
            geom_type_name = obj.Geometry.__class__.__name__
            is_brep_or_mesh = geom_type_name in ('Brep', 'Mesh')

            if is_brep_or_mesh:
                volume = (bbox.Max.X - bbox.Min.X) * (bbox.Max.Y - bbox.Min.Y) * (bbox.Max.Z - bbox.Min.Z)
                if volume < MIN_VALID_VOLUME:
                    errors.append(ValidationErrorItem(
                        category=GEOMETRY_CATEGORY_NAME,
                        target=object_id,
                        message=GEOMETRY_ERROR_ZERO_VOLUME.format(min_volume=MIN_VALID_VOLUME)
                    ))
                    logger.debug("geometry_validator.validation_failed",
                                object_id=object_id,
                                failure_reason="zero_volume",
                                volume=volume)

        logger.info("geometry_validator.validate_geometry.completed",
                    objects_checked=len(model.Objects),
                    errors_found=len(errors))

        return errors
