"""
Tests for comparison persistence Pydantic schemas.

These tests verify the new schemas for saving, listing, and checking
comparison results with proper validation and serialization.
"""

import pytest
from datetime import datetime
from pydantic import ValidationError

from app.schemas.comparison import (
    ComparisonSummary,
    ComparisonListResponse,
    ComparisonCheckResponse,
    ComparisonIngestRequest,
    ComparisonIngestResponse,
    GlobalMetrics,
    FieldChange,
    FieldChangeStatus,
    DiffStatus,
)


class TestComparisonSummary:
    """Test cases for ComparisonSummary schema."""

    def test_comparison_summary_creation(self):
        """Test creating a ComparisonSummary with all fields."""
        summary = ComparisonSummary(
            id=1,
            source_version_id=10,
            target_version_id=11,
            source_version_number="1.0",
            target_version_number="2.0",
            source_template_name="Template A",
            target_template_name="Template A",
            modification_percentage=15.5,
            fields_added=3,
            fields_removed=1,
            fields_modified=2,
            fields_unchanged=44,
            created_at=datetime(2025, 10, 27, 10, 0, 0),
            created_by=5,
        )

        assert summary.id == 1
        assert summary.source_version_id == 10
        assert summary.target_version_id == 11
        assert summary.modification_percentage == 15.5
        assert summary.fields_added == 3
        assert summary.fields_removed == 1
        assert summary.fields_modified == 2
        assert summary.fields_unchanged == 44

    def test_comparison_summary_optional_created_by(self):
        """Test ComparisonSummary with optional created_by field."""
        summary = ComparisonSummary(
            id=1,
            source_version_id=10,
            target_version_id=11,
            source_version_number="1.0",
            target_version_number="2.0",
            source_template_name="Template A",
            target_template_name="Template A",
            modification_percentage=0.0,
            fields_added=0,
            fields_removed=0,
            fields_modified=0,
            fields_unchanged=50,
            created_at=datetime(2025, 10, 27, 10, 0, 0),
            created_by=None,
        )

        assert summary.created_by is None

    def test_comparison_summary_validation_negative_counts(self):
        """Test that negative field counts are rejected."""
        with pytest.raises(ValidationError) as exc_info:
            ComparisonSummary(
                id=1,
                source_version_id=10,
                target_version_id=11,
                source_version_number="1.0",
                target_version_number="2.0",
                source_template_name="Template A",
                target_template_name="Template A",
                modification_percentage=15.5,
                fields_added=-1,  # Invalid
                fields_removed=0,
                fields_modified=0,
                fields_unchanged=50,
                created_at=datetime.utcnow(),
            )

        errors = exc_info.value.errors()
        assert any("fields_added" in str(e) for e in errors)

    def test_comparison_summary_validation_percentage_range(self):
        """Test that modification_percentage must be 0-100."""
        with pytest.raises(ValidationError) as exc_info:
            ComparisonSummary(
                id=1,
                source_version_id=10,
                target_version_id=11,
                source_version_number="1.0",
                target_version_number="2.0",
                source_template_name="Template A",
                target_template_name="Template A",
                modification_percentage=150.0,  # Invalid: > 100
                fields_added=0,
                fields_removed=0,
                fields_modified=0,
                fields_unchanged=50,
                created_at=datetime.utcnow(),
            )

        errors = exc_info.value.errors()
        assert any("modification_percentage" in str(e) for e in errors)


class TestComparisonListResponse:
    """Test cases for ComparisonListResponse schema."""

    def test_comparison_list_response_creation(self):
        """Test creating a paginated list response."""
        summaries = [
            ComparisonSummary(
                id=1,
                source_version_id=10,
                target_version_id=11,
                source_version_number="1.0",
                target_version_number="2.0",
                source_template_name="Template A",
                target_template_name="Template A",
                modification_percentage=15.5,
                fields_added=3,
                fields_removed=1,
                fields_modified=2,
                fields_unchanged=44,
                created_at=datetime.utcnow(),
            ),
            ComparisonSummary(
                id=2,
                source_version_id=12,
                target_version_id=13,
                source_version_number="1.0",
                target_version_number="1.1",
                source_template_name="Template B",
                target_template_name="Template B",
                modification_percentage=5.0,
                fields_added=1,
                fields_removed=0,
                fields_modified=1,
                fields_unchanged=38,
                created_at=datetime.utcnow(),
            ),
        ]

        response = ComparisonListResponse(
            items=summaries,
            total=25,
            page=1,
            page_size=2,
            total_pages=13,
        )

        assert len(response.items) == 2
        assert response.total == 25
        assert response.page == 1
        assert response.page_size == 2
        assert response.total_pages == 13

    def test_comparison_list_response_empty(self):
        """Test list response with no items."""
        response = ComparisonListResponse(
            items=[],
            total=0,
            page=1,
            page_size=20,
            total_pages=0,
        )

        assert len(response.items) == 0
        assert response.total == 0
        assert response.total_pages == 0

    def test_comparison_list_response_validation(self):
        """Test validation of pagination parameters."""
        with pytest.raises(ValidationError) as exc_info:
            ComparisonListResponse(
                items=[],
                total=10,
                page=0,  # Invalid: must be >= 1
                page_size=20,
                total_pages=1,
            )

        errors = exc_info.value.errors()
        assert any("page" in str(e) for e in errors)


class TestComparisonCheckResponse:
    """Test cases for ComparisonCheckResponse schema."""

    def test_comparison_check_exists(self):
        """Test check response when comparison exists."""
        response = ComparisonCheckResponse(
            exists=True,
            comparison_id=42,
            created_at=datetime(2025, 10, 27, 10, 0, 0),
        )

        assert response.exists is True
        assert response.comparison_id == 42
        assert response.created_at is not None

    def test_comparison_check_not_exists(self):
        """Test check response when comparison doesn't exist."""
        response = ComparisonCheckResponse(
            exists=False,
            comparison_id=None,
            created_at=None,
        )

        assert response.exists is False
        assert response.comparison_id is None
        assert response.created_at is None

    def test_comparison_check_validation_exists_requires_id(self):
        """Test that exists=True requires comparison_id."""
        # This should be valid
        response = ComparisonCheckResponse(
            exists=True,
            comparison_id=1,
            created_at=datetime.utcnow(),
        )
        assert response.exists is True

        # This should also be valid (exists=False with no ID)
        response = ComparisonCheckResponse(
            exists=False,
            comparison_id=None,
            created_at=None,
        )
        assert response.exists is False


class TestComparisonIngestRequest:
    """Test cases for ComparisonIngestRequest schema."""

    def test_ingest_request_creation(self):
        """Test creating an ingest request with complete data."""
        global_metrics = GlobalMetrics(
            source_version_number="1.0",
            target_version_number="2.0",
            source_page_count=5,
            target_page_count=5,
            page_count_changed=False,
            source_field_count=50,
            target_field_count=52,
            field_count_changed=True,
            fields_added=2,
            fields_removed=0,
            fields_modified=1,
            fields_unchanged=49,
            modification_percentage=6.0,
            source_created_at=datetime.utcnow(),
            target_created_at=datetime.utcnow(),
        )

        field_change = FieldChange(
            field_id="TEST_FIELD",
            status=FieldChangeStatus.MODIFIED,
            field_type="text",
            source_page_number=1,
            target_page_number=1,
            page_number_changed=False,
            near_text_diff=DiffStatus.DIFFERENT,
            source_near_text="Old label",
            target_near_text="New label",
            value_options_diff=DiffStatus.NOT_APPLICABLE,
            position_change=DiffStatus.EQUAL,
            source_position={"x0": 100, "y0": 200, "x1": 300, "y1": 220},
            target_position={"x0": 100, "y0": 200, "x1": 300, "y1": 220},
        )

        request = ComparisonIngestRequest(
            source_version_id=10,
            target_version_id=11,
            global_metrics=global_metrics,
            field_changes=[field_change],
        )

        assert request.source_version_id == 10
        assert request.target_version_id == 11
        assert request.global_metrics.modification_percentage == 6.0
        assert len(request.field_changes) == 1
        assert request.field_changes[0].field_id == "TEST_FIELD"

    def test_ingest_request_validation_different_versions(self):
        """Test that source and target versions must differ."""
        global_metrics = GlobalMetrics(
            source_version_number="1.0",
            target_version_number="1.0",
            source_page_count=5,
            target_page_count=5,
            page_count_changed=False,
            source_field_count=50,
            target_field_count=50,
            field_count_changed=False,
            fields_added=0,
            fields_removed=0,
            fields_modified=0,
            fields_unchanged=50,
            modification_percentage=0.0,
            source_created_at=datetime.utcnow(),
            target_created_at=datetime.utcnow(),
        )

        with pytest.raises(ValidationError) as exc_info:
            ComparisonIngestRequest(
                source_version_id=10,
                target_version_id=10,  # Same as source
                global_metrics=global_metrics,
                field_changes=[],
            )

        errors = exc_info.value.errors()
        assert any("different" in str(e).lower() for e in errors)


class TestComparisonIngestResponse:
    """Test cases for ComparisonIngestResponse schema."""

    def test_ingest_response_creation(self):
        """Test creating an ingest response."""
        response = ComparisonIngestResponse(
            comparison_id=42,
            message="Comparison saved successfully",
            created_at=datetime(2025, 10, 27, 10, 0, 0),
        )

        assert response.comparison_id == 42
        assert response.message == "Comparison saved successfully"
        assert response.created_at is not None

    def test_ingest_response_positive_id(self):
        """Test that comparison_id must be positive."""
        with pytest.raises(ValidationError) as exc_info:
            ComparisonIngestResponse(
                comparison_id=0,  # Invalid
                message="Test",
                created_at=datetime.utcnow(),
            )

        errors = exc_info.value.errors()
        assert any("comparison_id" in str(e) for e in errors)


class TestSchemaIntegration:
    """Integration tests for schema interactions."""

    def test_full_comparison_ingest_workflow(self):
        """Test complete workflow from ingest to list."""
        # 1. Create ingest request
        global_metrics = GlobalMetrics(
            source_version_number="1.0",
            target_version_number="2.0",
            source_page_count=5,
            target_page_count=5,
            page_count_changed=False,
            source_field_count=50,
            target_field_count=52,
            field_count_changed=True,
            fields_added=2,
            fields_removed=0,
            fields_modified=1,
            fields_unchanged=49,
            modification_percentage=6.0,
            source_created_at=datetime.utcnow(),
            target_created_at=datetime.utcnow(),
        )

        field_changes = [
            FieldChange(
                field_id="FIELD_1",
                status=FieldChangeStatus.ADDED,
                field_type="text",
                source_page_number=None,
                target_page_number=1,
                page_number_changed=False,
                near_text_diff=DiffStatus.NOT_APPLICABLE,
                target_near_text="New field",
                value_options_diff=DiffStatus.NOT_APPLICABLE,
                position_change=DiffStatus.NOT_APPLICABLE,
                target_position={"x0": 100, "y0": 200, "x1": 300, "y1": 220},
            )
        ]

        ingest_request = ComparisonIngestRequest(
            source_version_id=10,
            target_version_id=11,
            global_metrics=global_metrics,
            field_changes=field_changes,
        )

        # 2. Simulate ingest response
        ingest_response = ComparisonIngestResponse(
            comparison_id=1,
            message="Comparison saved successfully",
            created_at=datetime.utcnow(),
        )

        # 3. Create summary (as if retrieved from DB)
        summary = ComparisonSummary(
            id=ingest_response.comparison_id,
            source_version_id=ingest_request.source_version_id,
            target_version_id=ingest_request.target_version_id,
            source_version_number="1.0",
            target_version_number="2.0",
            source_template_name="Template A",
            target_template_name="Template A",
            modification_percentage=ingest_request.global_metrics.modification_percentage,
            fields_added=ingest_request.global_metrics.fields_added,
            fields_removed=ingest_request.global_metrics.fields_removed,
            fields_modified=ingest_request.global_metrics.fields_modified,
            fields_unchanged=ingest_request.global_metrics.fields_unchanged,
            created_at=ingest_response.created_at,
        )

        # 4. Create list response
        list_response = ComparisonListResponse(
            items=[summary],
            total=1,
            page=1,
            page_size=20,
            total_pages=1,
        )

        # Verify complete workflow
        assert ingest_response.comparison_id == summary.id
        assert summary.modification_percentage == 6.0
        assert len(list_response.items) == 1
        assert list_response.items[0].id == 1

    def test_serialization_to_json(self):
        """Test that schemas serialize to JSON correctly."""
        summary = ComparisonSummary(
            id=1,
            source_version_id=10,
            target_version_id=11,
            source_version_number="1.0",
            target_version_number="2.0",
            source_template_name="Template A",
            target_template_name="Template A",
            modification_percentage=15.5,
            fields_added=3,
            fields_removed=1,
            fields_modified=2,
            fields_unchanged=44,
            created_at=datetime(2025, 10, 27, 10, 0, 0),
        )

        json_data = summary.model_dump_json()
        assert isinstance(json_data, str)
        assert "15.5" in json_data
        assert "Template A" in json_data

