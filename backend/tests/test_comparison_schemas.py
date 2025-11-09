"""
Unit tests for comparison schemas.

Tests validation logic for ComparisonRequest, GlobalMetrics, FieldChange,
and ComparisonResult schemas.
"""
from datetime import datetime

import pytest
from pydantic import ValidationError

from app.schemas.comparison import (
    ComparisonRequest,
    ComparisonResult,
    DiffStatus,
    FieldChange,
    FieldChangeStatus,
    GlobalMetrics,
)


class TestComparisonRequest:
    """Tests for ComparisonRequest schema."""

    def test_valid_comparison_request(self):
        """Test creating valid comparison request."""
        request = ComparisonRequest(
            source_version_id=1,
            target_version_id=2
        )

        assert request.source_version_id == 1
        assert request.target_version_id == 2

    def test_same_version_ids_raises_error(self):
        """Test that same version IDs raise validation error."""
        with pytest.raises(ValidationError) as exc_info:
            ComparisonRequest(
                source_version_id=1,
                target_version_id=1
            )

        assert "Source and target versions must be different" in str(
            exc_info.value
        )

    def test_negative_source_version_id_raises_error(self):
        """Test that negative source version ID raises error."""
        with pytest.raises(ValidationError):
            ComparisonRequest(
                source_version_id=-1,
                target_version_id=2
            )

    def test_zero_target_version_id_raises_error(self):
        """Test that zero target version ID raises error."""
        with pytest.raises(ValidationError):
            ComparisonRequest(
                source_version_id=1,
                target_version_id=0
            )

    def test_missing_source_version_id_raises_error(self):
        """Test that missing source_version_id raises error."""
        with pytest.raises(ValidationError):
            ComparisonRequest(target_version_id=2)  # type: ignore

    def test_invalid_type_raises_error(self):
        """Test that invalid type raises error."""
        with pytest.raises(ValidationError):
            ComparisonRequest(
                source_version_id="invalid",  # type: ignore
                target_version_id=2
            )


class TestFieldChangeStatus:
    """Tests for FieldChangeStatus enum."""

    def test_all_status_values(self):
        """Test all enum values are defined."""
        assert FieldChangeStatus.ADDED == "ADDED"
        assert FieldChangeStatus.REMOVED == "REMOVED"
        assert FieldChangeStatus.MODIFIED == "MODIFIED"
        assert FieldChangeStatus.UNCHANGED == "UNCHANGED"

    def test_enum_membership(self):
        """Test enum membership checks."""
        assert "ADDED" in [s.value for s in FieldChangeStatus]
        assert "INVALID" not in [s.value for s in FieldChangeStatus]


class TestDiffStatus:
    """Tests for DiffStatus enum."""

    def test_all_diff_values(self):
        """Test all enum values are defined."""
        assert DiffStatus.EQUAL == "EQUAL"
        assert DiffStatus.DIFFERENT == "DIFFERENT"
        assert DiffStatus.NOT_APPLICABLE == "NOT_APPLICABLE"


class TestGlobalMetrics:
    """Tests for GlobalMetrics schema."""

    def test_valid_global_metrics(self):
        """Test creating valid global metrics."""
        metrics = GlobalMetrics(
            source_version_number="2024-Q1",
            target_version_number="2024-Q2",
            source_page_count=5,
            target_page_count=6,
            page_count_changed=True,
            source_field_count=48,
            target_field_count=52,
            field_count_changed=True,
            fields_added=4,
            fields_removed=0,
            fields_modified=3,
            fields_unchanged=45,
            modification_percentage=14.58,
            source_created_at=datetime(2024, 1, 15, 10, 30, 0),
            target_created_at=datetime(2024, 4, 20, 14, 25, 0)
        )

        assert metrics.source_version_number == "2024-Q1"
        assert metrics.target_version_number == "2024-Q2"
        assert metrics.fields_added == 4
        assert metrics.modification_percentage == 14.58

    def test_negative_field_count_raises_error(self):
        """Test that negative field count raises error."""
        with pytest.raises(ValidationError):
            GlobalMetrics(
                source_version_number="2024-Q1",
                target_version_number="2024-Q2",
                source_page_count=5,
                target_page_count=6,
                page_count_changed=False,
                source_field_count=-1,  # Invalid
                target_field_count=52,
                field_count_changed=True,
                fields_added=4,
                fields_removed=0,
                fields_modified=3,
                fields_unchanged=45,
                modification_percentage=14.58,
                source_created_at=datetime(2024, 1, 15),
                target_created_at=datetime(2024, 4, 20)
            )

    def test_modification_percentage_out_of_range_raises_error(self):
        """Test that modification percentage > 100 raises error."""
        with pytest.raises(ValidationError):
            GlobalMetrics(
                source_version_number="2024-Q1",
                target_version_number="2024-Q2",
                source_page_count=5,
                target_page_count=6,
                page_count_changed=False,
                source_field_count=48,
                target_field_count=52,
                field_count_changed=True,
                fields_added=4,
                fields_removed=0,
                fields_modified=3,
                fields_unchanged=45,
                modification_percentage=150.0,  # Invalid
                source_created_at=datetime(2024, 1, 15),
                target_created_at=datetime(2024, 4, 20)
            )


class TestFieldChange:
    """Tests for FieldChange schema."""

    def test_valid_unchanged_field(self):
        """Test creating valid unchanged field."""
        field = FieldChange(
            field_id="NOMBRE",
            status=FieldChangeStatus.UNCHANGED,
            field_type="text",
            source_page_number=1,
            target_page_number=1,
            page_number_changed=False,
            near_text_diff=DiffStatus.EQUAL,
            source_near_text="Nombre",
            target_near_text="Nombre",
            value_options_diff=DiffStatus.NOT_APPLICABLE,
            position_change=DiffStatus.EQUAL,
            source_position={"x0": 100, "y0": 200, "x1": 300, "y1": 220},
            target_position={"x0": 100, "y0": 200, "x1": 300, "y1": 220}
        )

        assert field.field_id == "NOMBRE"
        assert field.status == FieldChangeStatus.UNCHANGED
        assert field.near_text_diff == DiffStatus.EQUAL

    def test_valid_added_field(self):
        """Test creating valid added field."""
        field = FieldChange(
            field_id="NEW_FIELD",
            status=FieldChangeStatus.ADDED,
            field_type="checkbox",
            source_page_number=None,
            target_page_number=6,
            page_number_changed=False,
            near_text_diff=DiffStatus.NOT_APPLICABLE,
            target_near_text="New field label",
            value_options_diff=DiffStatus.NOT_APPLICABLE,
            position_change=DiffStatus.NOT_APPLICABLE,
            target_position={"x0": 50, "y0": 700, "x1": 70, "y1": 720}
        )

        assert field.status == FieldChangeStatus.ADDED
        assert field.source_page_number is None
        assert field.target_page_number == 6

    def test_valid_removed_field(self):
        """Test creating valid removed field."""
        field = FieldChange(
            field_id="OLD_FIELD",
            status=FieldChangeStatus.REMOVED,
            field_type="text",
            source_page_number=4,
            target_page_number=None,
            page_number_changed=False,
            near_text_diff=DiffStatus.NOT_APPLICABLE,
            source_near_text="Old field",
            value_options_diff=DiffStatus.NOT_APPLICABLE,
            position_change=DiffStatus.NOT_APPLICABLE,
            source_position={"x0": 100, "y0": 500, "x1": 250, "y1": 520}
        )

        assert field.status == FieldChangeStatus.REMOVED
        assert field.source_page_number == 4
        assert field.target_page_number is None

    def test_valid_modified_field_with_value_options(self):
        """Test creating modified field with value options change."""
        field = FieldChange(
            field_id="SELECT_FIELD",
            status=FieldChangeStatus.MODIFIED,
            field_type="select",
            source_page_number=2,
            target_page_number=2,
            page_number_changed=False,
            near_text_diff=DiffStatus.EQUAL,
            source_near_text="Select option",
            target_near_text="Select option",
            value_options_diff=DiffStatus.DIFFERENT,
            source_value_options=["Option A", "Option B"],
            target_value_options=["Option A", "Option B", "Option C"],
            position_change=DiffStatus.EQUAL,
            source_position={"x0": 150, "y0": 300, "x1": 350, "y1": 320},
            target_position={"x0": 150, "y0": 300, "x1": 350, "y1": 320}
        )

        assert field.value_options_diff == DiffStatus.DIFFERENT
        assert len(field.source_value_options) == 2  # type: ignore
        assert len(field.target_value_options) == 3  # type: ignore

    def test_invalid_position_missing_keys_raises_error(self):
        """Test that position missing required keys raises error."""
        with pytest.raises(ValidationError) as exc_info:
            FieldChange(
                field_id="FIELD",
                status=FieldChangeStatus.UNCHANGED,
                source_page_number=1,
                target_page_number=1,
                page_number_changed=False,
                near_text_diff=DiffStatus.EQUAL,
                value_options_diff=DiffStatus.NOT_APPLICABLE,
                position_change=DiffStatus.EQUAL,
                source_position={"x0": 100, "y0": 200}  # Missing x1, y1
            )

        assert "Position must contain keys" in str(exc_info.value)

    def test_invalid_position_non_numeric_raises_error(self):
        """Test that non-numeric position values raise error."""
        with pytest.raises(ValidationError) as exc_info:
            FieldChange(
                field_id="FIELD",
                status=FieldChangeStatus.UNCHANGED,
                source_page_number=1,
                target_page_number=1,
                page_number_changed=False,
                near_text_diff=DiffStatus.EQUAL,
                value_options_diff=DiffStatus.NOT_APPLICABLE,
                position_change=DiffStatus.EQUAL,
                source_position={
                    "x0": "invalid",  # type: ignore
                    "y0": 200,
                    "x1": 300,
                    "y1": 220
                }
            )

        assert "must be numeric" in str(exc_info.value)

    def test_zero_page_number_raises_error(self):
        """Test that page number 0 raises error."""
        with pytest.raises(ValidationError):
            FieldChange(
                field_id="FIELD",
                status=FieldChangeStatus.UNCHANGED,
                source_page_number=0,  # Invalid (must be >= 1)
                target_page_number=1,
                page_number_changed=False,
                near_text_diff=DiffStatus.EQUAL,
                value_options_diff=DiffStatus.NOT_APPLICABLE,
                position_change=DiffStatus.EQUAL
            )


class TestComparisonResult:
    """Tests for ComparisonResult schema."""

    def test_valid_comparison_result(self):
        """Test creating valid comparison result."""
        metrics = GlobalMetrics(
            source_version_number="2024-Q1",
            target_version_number="2024-Q2",
            source_page_count=5,
            target_page_count=6,
            page_count_changed=True,
            source_field_count=48,
            target_field_count=52,
            field_count_changed=True,
            fields_added=4,
            fields_removed=0,
            fields_modified=3,
            fields_unchanged=45,
            modification_percentage=14.58,
            source_created_at=datetime(2024, 1, 15),
            target_created_at=datetime(2024, 4, 20)
        )

        field = FieldChange(
            field_id="TEST_FIELD",
            status=FieldChangeStatus.UNCHANGED,
            source_page_number=1,
            target_page_number=1,
            page_number_changed=False,
            near_text_diff=DiffStatus.EQUAL,
            value_options_diff=DiffStatus.NOT_APPLICABLE,
            position_change=DiffStatus.EQUAL
        )

        result = ComparisonResult(
            source_version_id=1,
            target_version_id=2,
            global_metrics=metrics,
            field_changes=[field]
        )

        assert result.source_version_id == 1
        assert result.target_version_id == 2
        assert len(result.field_changes) == 1
        assert result.analyzed_at is not None

    def test_empty_field_changes_list(self):
        """Test comparison result with empty field changes."""
        metrics = GlobalMetrics(
            source_version_number="2024-Q1",
            target_version_number="2024-Q1",
            source_page_count=5,
            target_page_count=5,
            page_count_changed=False,
            source_field_count=0,
            target_field_count=0,
            field_count_changed=False,
            fields_added=0,
            fields_removed=0,
            fields_modified=0,
            fields_unchanged=0,
            modification_percentage=0.0,
            source_created_at=datetime(2024, 1, 15),
            target_created_at=datetime(2024, 1, 15)
        )

        result = ComparisonResult(
            source_version_id=1,
            target_version_id=2,
            global_metrics=metrics,
            field_changes=[]
        )

        assert len(result.field_changes) == 0

    def test_analyzed_at_auto_populated(self):
        """Test that analyzed_at is automatically populated."""
        metrics = GlobalMetrics(
            source_version_number="2024-Q1",
            target_version_number="2024-Q2",
            source_page_count=5,
            target_page_count=5,
            page_count_changed=False,
            source_field_count=10,
            target_field_count=10,
            field_count_changed=False,
            fields_added=0,
            fields_removed=0,
            fields_modified=0,
            fields_unchanged=10,
            modification_percentage=0.0,
            source_created_at=datetime(2024, 1, 15),
            target_created_at=datetime(2024, 4, 20)
        )

        result = ComparisonResult(
            source_version_id=1,
            target_version_id=2,
            global_metrics=metrics,
            field_changes=[]
        )

        assert isinstance(result.analyzed_at, datetime)
        # Should be close to current time
        time_diff = datetime.utcnow() - result.analyzed_at
        assert time_diff.total_seconds() < 5  # Within 5 seconds

