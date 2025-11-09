"""
Comparison schemas for template version comparison feature.

This module defines Pydantic schemas for comparing two template versions
and analyzing field-by-field differences.
"""
from datetime import datetime
from enum import Enum
from typing import List, Optional

from pydantic import BaseModel, Field, field_validator, model_validator


class FieldChangeStatus(str, Enum):
    """
    Status of a field change in the comparison.

    - ADDED: Field exists only in target version
    - REMOVED: Field exists only in source version
    - MODIFIED: Field exists in both but has differences
    - UNCHANGED: Field exists in both with no differences
    """
    ADDED = "ADDED"
    REMOVED = "REMOVED"
    MODIFIED = "MODIFIED"
    UNCHANGED = "UNCHANGED"


class DiffStatus(str, Enum):
    """
    Status of a specific attribute comparison.

    - EQUAL: Attribute values are the same
    - DIFFERENT: Attribute values differ
    - NOT_APPLICABLE: Attribute doesn't apply (e.g., position for ADDED field)
    """
    EQUAL = "EQUAL"
    DIFFERENT = "DIFFERENT"
    NOT_APPLICABLE = "NOT_APPLICABLE"


class ComparisonRequest(BaseModel):
    """
    Request schema for template version comparison.

    Validates that source and target version IDs are different
    positive integers.
    """
    source_version_id: int = Field(
        ...,
        gt=0,
        description="Source version ID to compare from"
    )
    target_version_id: int = Field(
        ...,
        gt=0,
        description="Target version ID to compare to"
    )

    @model_validator(mode='after')
    def validate_different_versions(self) -> 'ComparisonRequest':
        """
        Validate that source and target versions are different.

        Raises:
            ValueError: If source_version_id equals target_version_id
        """
        if self.source_version_id == self.target_version_id:
            raise ValueError("Source and target versions must be different")
        return self


class GlobalMetrics(BaseModel):
    """
    Global metrics for template version comparison.

    Provides high-level statistics about the differences between
    two template versions.
    """
    source_version_number: str = Field(
        ...,
        description="Version identifier of source template"
    )
    target_version_number: str = Field(
        ...,
        description="Version identifier of target template"
    )
    source_page_count: int = Field(
        ...,
        ge=0,
        description="Number of pages in source PDF"
    )
    target_page_count: int = Field(
        ...,
        ge=0,
        description="Number of pages in target PDF"
    )
    page_count_changed: bool = Field(
        ...,
        description="Whether page count differs between versions"
    )
    source_field_count: int = Field(
        ...,
        ge=0,
        description="Total fields in source version"
    )
    target_field_count: int = Field(
        ...,
        ge=0,
        description="Total fields in target version"
    )
    field_count_changed: bool = Field(
        ...,
        description="Whether field count differs between versions"
    )
    fields_added: int = Field(
        ...,
        ge=0,
        description="Number of fields added in target"
    )
    fields_removed: int = Field(
        ...,
        ge=0,
        description="Number of fields removed from source"
    )
    fields_modified: int = Field(
        ...,
        ge=0,
        description="Number of fields with changes"
    )
    fields_unchanged: int = Field(
        ...,
        ge=0,
        description="Number of fields without changes"
    )
    modification_percentage: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Percentage of fields that changed (0-100)"
    )
    source_created_at: datetime = Field(
        ...,
        description="When source version was created"
    )
    target_created_at: datetime = Field(
        ...,
        description="When target version was created"
    )


class FieldChange(BaseModel):
    """
    Detailed field-level comparison data.

    Represents the comparison result for a single field between
    source and target versions.
    """
    field_id: str = Field(
        ...,
        description="Unique field identifier"
    )
    status: FieldChangeStatus = Field(
        ...,
        description="Change status (ADDED/REMOVED/MODIFIED/UNCHANGED)"
    )
    field_type: Optional[str] = Field(
        None,
        description="Type of form field (text, checkbox, select, etc.)"
    )
    source_page_number: Optional[int] = Field(
        None,
        ge=1,
        description="Page number in source (null if ADDED)"
    )
    target_page_number: Optional[int] = Field(
        None,
        ge=1,
        description="Page number in target (null if REMOVED)"
    )
    page_number_changed: bool = Field(
        ...,
        description="Whether page number differs between versions"
    )
    near_text_diff: DiffStatus = Field(
        ...,
        description="Comparison status of field label/near text"
    )
    source_near_text: Optional[str] = Field(
        None,
        description="Label text in source version"
    )
    target_near_text: Optional[str] = Field(
        None,
        description="Label text in target version"
    )
    value_options_diff: DiffStatus = Field(
        ...,
        description="Comparison status of field value options"
    )
    source_value_options: Optional[List[str]] = Field(
        None,
        description="Value options in source (for select/radio fields)"
    )
    target_value_options: Optional[List[str]] = Field(
        None,
        description="Value options in target (for select/radio fields)"
    )
    position_change: DiffStatus = Field(
        ...,
        description="Comparison status of field position coordinates"
    )
    source_position: Optional[dict] = Field(
        None,
        description="Field coordinates in source {x0, y0, x1, y1}"
    )
    target_position: Optional[dict] = Field(
        None,
        description="Field coordinates in target {x0, y0, x1, y1}"
    )

    @field_validator('source_position', 'target_position')
    @classmethod
    def validate_position(cls, v: Optional[dict]) -> Optional[dict]:
        """
        Validate position dictionary has required keys.

        Args:
            v: Position dictionary or None

        Returns:
            Validated position dictionary or None

        Raises:
            ValueError: If position dict is missing required keys
        """
        if v is None:
            return None

        required_keys = {'x0', 'y0', 'x1', 'y1'}
        if not all(key in v for key in required_keys):
            raise ValueError(
                f"Position must contain keys: {required_keys}"
            )

        # Validate all values are numeric
        for key, value in v.items():
            if key in required_keys and not isinstance(
                value, (int, float)
            ):
                raise ValueError(
                    f"Position coordinate '{key}' must be numeric"
                )

        return v


class ComparisonResult(BaseModel):
    """
    Complete comparison result schema.

    Contains global metrics and detailed field-by-field comparison data
    for two template versions.
    """
    source_version_id: int = Field(
        ...,
        gt=0,
        description="Source version ID that was compared"
    )
    target_version_id: int = Field(
        ...,
        gt=0,
        description="Target version ID that was compared"
    )
    global_metrics: GlobalMetrics = Field(
        ...,
        description="High-level comparison statistics"
    )
    field_changes: List[FieldChange] = Field(
        ...,
        description="Detailed field-by-field comparison data"
    )
    analyzed_at: datetime = Field(
        default_factory=datetime.utcnow,
        description="Timestamp when comparison was performed"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "source_version_id": 1,
                "target_version_id": 2,
                "global_metrics": {
                    "source_version_number": "2024-Q1",
                    "target_version_number": "2024-Q2",
                    "source_page_count": 5,
                    "target_page_count": 6,
                    "page_count_changed": True,
                    "source_field_count": 48,
                    "target_field_count": 52,
                    "field_count_changed": True,
                    "fields_added": 4,
                    "fields_removed": 0,
                    "fields_modified": 3,
                    "fields_unchanged": 45,
                    "modification_percentage": 14.58,
                    "source_created_at": "2024-01-15T10:30:00Z",
                    "target_created_at": "2024-04-20T14:25:00Z"
                },
                "field_changes": [
                    {
                        "field_id": "NOMBRE_SOLICITANTE",
                        "status": "UNCHANGED",
                        "field_type": "text",
                        "source_page_number": 1,
                        "target_page_number": 1,
                        "page_number_changed": False,
                        "near_text_diff": "EQUAL",
                        "source_near_text": "Nombre del solicitante",
                        "target_near_text": "Nombre del solicitante",
                        "value_options_diff": "NOT_APPLICABLE",
                        "position_change": "EQUAL",
                        "source_position": {
                            "x0": 100,
                            "y0": 200,
                            "x1": 300,
                            "y1": 220
                        },
                        "target_position": {
                            "x0": 100,
                            "y0": 200,
                            "x1": 300,
                            "y1": 220
                        }
                    }
                ],
                "analyzed_at": "2025-10-26T15:45:30Z"
            }
        }


# ============================================================================
# Persistence Schemas (for saving and retrieving comparisons)
# ============================================================================


class ComparisonIngestRequest(BaseModel):
    """
    Request schema for persisting a comparison result.

    Used by POST /api/v1/comparisons/ingest to save the output from
    the /analyze endpoint.
    """
    source_version_id: int = Field(
        ...,
        gt=0,
        description="Source version ID"
    )
    target_version_id: int = Field(
        ...,
        gt=0,
        description="Target version ID"
    )
    global_metrics: GlobalMetrics = Field(
        ...,
        description="Global comparison metrics"
    )
    field_changes: List[FieldChange] = Field(
        ...,
        description="Detailed field-by-field changes"
    )
    analyzed_at: Optional[datetime] = Field(
        None,
        description="Timestamp of analysis (optional, will be ignored)"
    )

    @model_validator(mode='after')
    def validate_different_versions(self) -> 'ComparisonIngestRequest':
        """
        Validate that source and target versions are different.

        Raises:
            ValueError: If source_version_id equals target_version_id
        """
        if self.source_version_id == self.target_version_id:
            raise ValueError("Source and target versions must be different")
        return self

    class Config:
        json_schema_extra = {
            "example": {
                "source_version_id": 1,
                "target_version_id": 2,
                "global_metrics": {
                    "source_version_number": "1.0",
                    "target_version_number": "2.0",
                    "source_page_count": 5,
                    "target_page_count": 5,
                    "page_count_changed": False,
                    "source_field_count": 50,
                    "target_field_count": 52,
                    "field_count_changed": True,
                    "fields_added": 2,
                    "fields_removed": 0,
                    "fields_modified": 1,
                    "fields_unchanged": 49,
                    "modification_percentage": 6.0,
                    "source_created_at": "2024-01-15T10:30:00Z",
                    "target_created_at": "2024-04-20T14:25:00Z"
                },
                "field_changes": []
            }
        }


class ComparisonIngestResponse(BaseModel):
    """
    Response schema after successfully saving a comparison.

    Returned by POST /api/v1/comparisons/ingest.
    """
    comparison_id: int = Field(
        ...,
        gt=0,
        description="ID of the saved comparison"
    )
    message: str = Field(
        ...,
        description="Success message"
    )
    created_at: datetime = Field(
        ...,
        description="Timestamp when comparison was saved"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "comparison_id": 42,
                "message": "Comparison saved successfully",
                "created_at": "2025-10-27T10:30:00Z"
            }
        }


class ComparisonSummary(BaseModel):
    """
    Summary of a saved comparison for list views.

    Used by GET /api/v1/comparisons to provide lightweight
    comparison metadata without full field details.
    """
    id: int = Field(
        ...,
        gt=0,
        description="Comparison record ID"
    )
    source_version_id: int = Field(
        ...,
        gt=0,
        description="Source version ID"
    )
    target_version_id: int = Field(
        ...,
        gt=0,
        description="Target version ID"
    )
    source_version_number: str = Field(
        ...,
        description="Source version number"
    )
    target_version_number: str = Field(
        ...,
        description="Target version number"
    )
    source_template_name: str = Field(
        ...,
        description="Source template name"
    )
    target_template_name: str = Field(
        ...,
        description="Target template name"
    )
    modification_percentage: float = Field(
        ...,
        ge=0.0,
        le=100.0,
        description="Percentage of fields modified (0-100)"
    )
    fields_added: int = Field(
        ...,
        ge=0,
        description="Number of fields added"
    )
    fields_removed: int = Field(
        ...,
        ge=0,
        description="Number of fields removed"
    )
    fields_modified: int = Field(
        ...,
        ge=0,
        description="Number of fields modified"
    )
    fields_unchanged: int = Field(
        ...,
        ge=0,
        description="Number of fields unchanged"
    )
    created_at: datetime = Field(
        ...,
        description="When comparison was saved"
    )
    created_by: Optional[int] = Field(
        None,
        description="User ID who saved the comparison"
    )

    class Config:
        from_attributes = True
        json_schema_extra = {
            "example": {
                "id": 1,
                "source_version_id": 10,
                "target_version_id": 11,
                "source_version_number": "1.0",
                "target_version_number": "2.0",
                "source_template_name": "Template A",
                "target_template_name": "Template A",
                "modification_percentage": 15.5,
                "fields_added": 3,
                "fields_removed": 1,
                "fields_modified": 2,
                "fields_unchanged": 44,
                "created_at": "2025-10-27T10:00:00Z",
                "created_by": 5
            }
        }


class ComparisonListResponse(BaseModel):
    """
    Paginated list of saved comparisons.

    Returned by GET /api/v1/comparisons with pagination metadata.
    """
    items: List[ComparisonSummary] = Field(
        ...,
        description="List of comparison summaries"
    )
    total: int = Field(
        ...,
        ge=0,
        description="Total number of comparisons matching filters"
    )
    page: int = Field(
        ...,
        ge=1,
        description="Current page number (1-indexed)"
    )
    page_size: int = Field(
        ...,
        ge=1,
        le=100,
        description="Number of items per page"
    )
    total_pages: int = Field(
        ...,
        ge=0,
        description="Total number of pages"
    )

    class Config:
        json_schema_extra = {
            "example": {
                "items": [
                    {
                        "id": 1,
                        "source_version_id": 10,
                        "target_version_id": 11,
                        "source_version_number": "1.0",
                        "target_version_number": "2.0",
                        "source_template_name": "Template A",
                        "target_template_name": "Template A",
                        "modification_percentage": 15.5,
                        "fields_added": 3,
                        "fields_removed": 1,
                        "fields_modified": 2,
                        "fields_unchanged": 44,
                        "created_at": "2025-10-27T10:00:00Z",
                        "created_by": 5
                    }
                ],
                "total": 25,
                "page": 1,
                "page_size": 20,
                "total_pages": 2
            }
        }


class ComparisonCheckResponse(BaseModel):
    """
    Response schema for checking if a comparison exists.

    Returned by GET /api/v1/comparisons/check to avoid duplicate saves.
    """
    exists: bool = Field(
        ...,
        description="Whether comparison exists between the versions"
    )
    comparison_id: Optional[int] = Field(
        None,
        gt=0,
        description="ID of existing comparison if found"
    )
    created_at: Optional[datetime] = Field(
        None,
        description="When existing comparison was created"
    )

    class Config:
        json_schema_extra = {
            "examples": [
                {
                    "exists": True,
                    "comparison_id": 42,
                    "created_at": "2025-10-27T10:00:00Z"
                },
                {
                    "exists": False,
                    "comparison_id": None,
                    "created_at": None
                }
            ]
        }
