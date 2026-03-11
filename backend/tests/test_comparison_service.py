"""
Unit tests for ComparisonService.

Tests the comparison service logic for analyzing differences between
two template versions.
"""
from datetime import datetime
from unittest.mock import MagicMock, Mock

import pytest

from app.models.template import TemplateField, TemplateVersion
from app.schemas.comparison import DiffStatus, FieldChangeStatus
from app.services.comparison_service import ComparisonService


@pytest.fixture
def mock_db():
    """Create a mock database session."""
    return MagicMock()


@pytest.fixture
def comparison_service(mock_db):
    """Create ComparisonService instance with mock DB."""
    return ComparisonService(mock_db)


@pytest.fixture
def source_version():
    """Create a mock source version."""
    version = Mock(spec=TemplateVersion)
    version.id = 1
    version.template_id = 1
    version.version_number = "2024-Q1"
    version.page_count = 5
    version.field_count = 48
    version.created_at = datetime(2024, 1, 15, 10, 30, 0)
    return version


@pytest.fixture
def target_version():
    """Create a mock target version."""
    version = Mock(spec=TemplateVersion)
    version.id = 2
    version.template_id = 1
    version.version_number = "2024-Q2"
    version.page_count = 6
    version.field_count = 52
    version.created_at = datetime(2024, 4, 20, 14, 25, 0)
    return version


@pytest.fixture
def source_fields():
    """Create mock source fields."""
    fields = []

    # Unchanged field
    field1 = Mock(spec=TemplateField)
    field1.field_id = "NOMBRE"
    field1.field_type = "text"
    field1.page_number = 1
    field1.near_text = "Nombre del solicitante"
    field1.value_options = None
    field1.position_data = {"x0": 100, "y0": 200, "x1": 300, "y1": 220}
    fields.append(field1)

    # Field to be removed
    field2 = Mock(spec=TemplateField)
    field2.field_id = "CAMPO_OBSOLETO"
    field2.field_type = "text"
    field2.page_number = 4
    field2.near_text = "Campo obsoleto"
    field2.value_options = None
    field2.position_data = {"x0": 100, "y0": 500, "x1": 250, "y1": 520}
    fields.append(field2)

    # Field to be modified (near text)
    field3 = Mock(spec=TemplateField)
    field3.field_id = "ACEPTA_CONDICIONES"
    field3.field_type = "checkbox"
    field3.page_number = 5
    field3.near_text = "Acepto las condiciones"
    field3.value_options = None
    field3.position_data = {"x0": 50, "y0": 700, "x1": 70, "y1": 720}
    fields.append(field3)

    # Field to be modified (value options)
    field4 = Mock(spec=TemplateField)
    field4.field_id = "TIPO_PRESTACION"
    field4.field_type = "select"
    field4.page_number = 2
    field4.near_text = "Tipo de prestación"
    field4.value_options = ["Contributiva", "Asistencial"]
    field4.position_data = {"x0": 150, "y0": 300, "x1": 350, "y1": 320}
    fields.append(field4)

    return fields


@pytest.fixture
def target_fields():
    """Create mock target fields."""
    fields = []

    # Unchanged field
    field1 = Mock(spec=TemplateField)
    field1.field_id = "NOMBRE"
    field1.field_type = "text"
    field1.page_number = 1
    field1.near_text = "Nombre del solicitante"
    field1.value_options = None
    field1.position_data = {"x0": 100, "y0": 200, "x1": 300, "y1": 220}
    fields.append(field1)

    # New field (added)
    field2 = Mock(spec=TemplateField)
    field2.field_id = "CONSENTIMIENTO_RGPD"
    field2.field_type = "checkbox"
    field2.page_number = 6
    field2.near_text = "Autorizo el tratamiento de datos según RGPD"
    field2.value_options = None
    field2.position_data = {"x0": 50, "y0": 780, "x1": 70, "y1": 800}
    fields.append(field2)

    # Modified field (near text and page changed)
    field3 = Mock(spec=TemplateField)
    field3.field_id = "ACEPTA_CONDICIONES"
    field3.field_type = "checkbox"
    field3.page_number = 6
    field3.near_text = "Acepto las condiciones y política de privacidad"
    field3.value_options = None
    field3.position_data = {"x0": 50, "y0": 750, "x1": 70, "y1": 770}
    fields.append(field3)

    # Modified field (value options)
    field4 = Mock(spec=TemplateField)
    field4.field_id = "TIPO_PRESTACION"
    field4.field_type = "select"
    field4.page_number = 2
    field4.near_text = "Tipo de prestación"
    field4.value_options = ["Contributiva", "Asistencial", "Subsidio agrario"]
    field4.position_data = {"x0": 150, "y0": 300, "x1": 350, "y1": 320}
    fields.append(field4)

    return fields


class TestGetVersion:
    """Tests for _get_version method."""

    def test_get_existing_version(self, comparison_service, source_version):
        """Test fetching an existing version."""
        comparison_service.db.query.return_value.filter.return_value.first.return_value = source_version

        result = comparison_service._get_version(1)

        assert result == source_version
        comparison_service.db.query.assert_called_once()

    def test_get_nonexistent_version_raises_error(self, comparison_service):
        """Test that fetching non-existent version raises ValueError."""
        comparison_service.db.query.return_value.filter.return_value.first.return_value = None

        with pytest.raises(ValueError) as exc_info:
            comparison_service._get_version(999)

        assert "Version with ID 999 not found" in str(exc_info.value)


class TestGetVersionFields:
    """Tests for _get_version_fields method."""

    def test_get_fields_for_version(self, comparison_service, source_fields):
        """Test fetching fields for a version."""
        comparison_service.db.query.return_value.filter.return_value.order_by.return_value.all.return_value = source_fields

        result = comparison_service._get_version_fields(1)

        assert result == source_fields
        assert len(result) == 4

    def test_get_fields_returns_empty_list_for_version_with_no_fields(
        self, comparison_service
    ):
        """Test fetching fields returns empty list for version with no fields."""
        comparison_service.db.query.return_value.filter.return_value.order_by.return_value.all.return_value = []

        result = comparison_service._get_version_fields(1)

        assert result == []


class TestCalculateGlobalMetrics:
    """Tests for _calculate_global_metrics method."""

    def test_calculate_metrics_with_changes(
        self,
        comparison_service,
        source_version,
        target_version,
        source_fields,
        target_fields
    ):
        """Test calculating metrics with field changes."""
        metrics = comparison_service._calculate_global_metrics(
            source_version,
            target_version,
            source_fields,
            target_fields
        )

        assert metrics.source_version_number == "2024-Q1"
        assert metrics.target_version_number == "2024-Q2"
        assert metrics.source_page_count == 5
        assert metrics.target_page_count == 6
        assert metrics.page_count_changed is True
        assert metrics.source_field_count == 4
        assert metrics.target_field_count == 4
        assert metrics.fields_added == 1  # CONSENTIMIENTO_RGPD
        assert metrics.fields_removed == 1  # CAMPO_OBSOLETO
        assert metrics.fields_modified == 2  # ACEPTA_CONDICIONES, TIPO_PRESTACION
        assert metrics.fields_unchanged == 1  # NOMBRE
        # (1 added + 1 removed + 2 modified) / 5 total unique = 80%
        assert metrics.modification_percentage == 80.0

    def test_calculate_metrics_with_no_changes(
        self,
        comparison_service,
        source_version,
        target_version
    ):
        """Test calculating metrics with no field changes."""
        # Create identical fields
        identical_fields = []
        field = Mock(spec=TemplateField)
        field.field_id = "FIELD1"
        field.field_type = "text"
        field.page_number = 1
        field.near_text = "Field 1"
        field.value_options = None
        field.position_data = {"x0": 100, "y0": 200, "x1": 300, "y1": 220}
        identical_fields.append(field)

        metrics = comparison_service._calculate_global_metrics(
            source_version,
            target_version,
            identical_fields,
            identical_fields
        )

        assert metrics.fields_added == 0
        assert metrics.fields_removed == 0
        assert metrics.fields_modified == 0
        assert metrics.fields_unchanged == 1
        assert metrics.modification_percentage == 0.0

    def test_calculate_metrics_with_empty_versions(
        self,
        comparison_service,
        source_version,
        target_version
    ):
        """Test calculating metrics with empty field lists."""
        metrics = comparison_service._calculate_global_metrics(
            source_version,
            target_version,
            [],
            []
        )

        assert metrics.fields_added == 0
        assert metrics.fields_removed == 0
        assert metrics.fields_modified == 0
        assert metrics.fields_unchanged == 0
        assert metrics.modification_percentage == 0.0


class TestCompareFields:
    """Tests for _compare_fields method."""

    def test_compare_fields_identifies_all_change_types(
        self,
        comparison_service,
        source_fields,
        target_fields
    ):
        """Test that _compare_fields identifies all change types."""
        field_changes = comparison_service._compare_fields(
            source_fields,
            target_fields
        )

        # Should have 5 changes: 1 added, 1 removed, 2 modified, 1 unchanged
        assert len(field_changes) == 5

        # Find each type
        statuses = {fc.field_id: fc.status for fc in field_changes}

        assert statuses["NOMBRE"] == FieldChangeStatus.UNCHANGED
        assert statuses["CAMPO_OBSOLETO"] == FieldChangeStatus.REMOVED
        assert statuses["CONSENTIMIENTO_RGPD"] == FieldChangeStatus.ADDED
        assert statuses["ACEPTA_CONDICIONES"] == FieldChangeStatus.MODIFIED
        assert statuses["TIPO_PRESTACION"] == FieldChangeStatus.MODIFIED

    def test_compare_fields_sorted_by_field_id(
        self,
        comparison_service,
        source_fields,
        target_fields
    ):
        """Test that field changes are sorted by field_id."""
        field_changes = comparison_service._compare_fields(
            source_fields,
            target_fields
        )

        field_ids = [fc.field_id for fc in field_changes]
        assert field_ids == sorted(field_ids)


class TestCompareFieldAttributes:
    """Tests for _compare_field_attributes method."""

    def test_compare_unchanged_field(self, comparison_service):
        """Test comparing an unchanged field."""
        source = Mock(spec=TemplateField)
        source.field_id = "FIELD1"
        source.field_type = "text"
        source.page_number = 1
        source.near_text = "Label"
        source.value_options = None
        source.position_data = {"x0": 100, "y0": 200, "x1": 300, "y1": 220}

        target = Mock(spec=TemplateField)
        target.field_id = "FIELD1"
        target.field_type = "text"
        target.page_number = 1
        target.near_text = "Label"
        target.value_options = None
        target.position_data = {"x0": 100, "y0": 200, "x1": 300, "y1": 220}

        change = comparison_service._compare_field_attributes(source, target)

        assert change.status == FieldChangeStatus.UNCHANGED
        assert change.page_number_changed is False
        assert change.near_text_diff == DiffStatus.EQUAL
        assert change.value_options_diff == DiffStatus.NOT_APPLICABLE
        assert change.position_change == DiffStatus.EQUAL

    def test_compare_field_with_page_change(self, comparison_service):
        """Test comparing field with page number change."""
        source = Mock(spec=TemplateField)
        source.field_id = "FIELD1"
        source.field_type = "text"
        source.page_number = 1
        source.near_text = "Label"
        source.value_options = None
        source.position_data = None

        target = Mock(spec=TemplateField)
        target.field_id = "FIELD1"
        target.field_type = "text"
        target.page_number = 2
        target.near_text = "Label"
        target.value_options = None
        target.position_data = None

        change = comparison_service._compare_field_attributes(source, target)

        assert change.status == FieldChangeStatus.MODIFIED
        assert change.page_number_changed is True

    def test_compare_field_with_near_text_change(self, comparison_service):
        """Test comparing field with near text change."""
        source = Mock(spec=TemplateField)
        source.field_id = "FIELD1"
        source.field_type = "text"
        source.page_number = 1
        source.near_text = "Old Label"
        source.value_options = None
        source.position_data = None

        target = Mock(spec=TemplateField)
        target.field_id = "FIELD1"
        target.field_type = "text"
        target.page_number = 1
        target.near_text = "New Label"
        target.value_options = None
        target.position_data = None

        change = comparison_service._compare_field_attributes(source, target)

        assert change.status == FieldChangeStatus.MODIFIED
        assert change.near_text_diff == DiffStatus.DIFFERENT


class TestComparePositions:
    """Tests for _compare_positions method."""

    def test_compare_identical_positions(self, comparison_service):
        """Test comparing identical positions."""
        pos1 = {"x0": 100, "y0": 200, "x1": 300, "y1": 220}
        pos2 = {"x0": 100, "y0": 200, "x1": 300, "y1": 220}

        result = comparison_service._compare_positions(pos1, pos2)

        assert result == DiffStatus.EQUAL

    def test_compare_positions_within_tolerance(self, comparison_service):
        """Test comparing positions within tolerance."""
        pos1 = {"x0": 100, "y0": 200, "x1": 300, "y1": 220}
        pos2 = {"x0": 102, "y0": 203, "x1": 299, "y1": 221}

        result = comparison_service._compare_positions(pos1, pos2, tolerance=5.0)

        assert result == DiffStatus.EQUAL

    def test_compare_positions_outside_tolerance(self, comparison_service):
        """Test comparing positions outside tolerance."""
        pos1 = {"x0": 100, "y0": 200, "x1": 300, "y1": 220}
        pos2 = {"x0": 110, "y0": 200, "x1": 300, "y1": 220}

        result = comparison_service._compare_positions(pos1, pos2, tolerance=5.0)

        assert result == DiffStatus.DIFFERENT

    def test_compare_both_positions_none(self, comparison_service):
        """Test comparing when both positions are None."""
        result = comparison_service._compare_positions(None, None)

        assert result == DiffStatus.NOT_APPLICABLE

    def test_compare_one_position_none(self, comparison_service):
        """Test comparing when one position is None."""
        pos1 = {"x0": 100, "y0": 200, "x1": 300, "y1": 220}

        result = comparison_service._compare_positions(pos1, None)

        assert result == DiffStatus.DIFFERENT


class TestCompareValueOptions:
    """Tests for _compare_value_options method."""

    def test_compare_identical_options(self, comparison_service):
        """Test comparing identical value options."""
        options1 = ["Option A", "Option B", "Option C"]
        options2 = ["Option A", "Option B", "Option C"]

        result = comparison_service._compare_value_options(options1, options2)

        assert result == DiffStatus.EQUAL

    def test_compare_different_order_same_content(self, comparison_service):
        """Test comparing options with different order but same content."""
        options1 = ["Option A", "Option B", "Option C"]
        options2 = ["Option C", "Option A", "Option B"]

        result = comparison_service._compare_value_options(options1, options2)

        assert result == DiffStatus.EQUAL

    def test_compare_different_options(self, comparison_service):
        """Test comparing different value options."""
        options1 = ["Option A", "Option B"]
        options2 = ["Option A", "Option B", "Option C"]

        result = comparison_service._compare_value_options(options1, options2)

        assert result == DiffStatus.DIFFERENT

    def test_compare_both_options_none(self, comparison_service):
        """Test comparing when both options are None."""
        result = comparison_service._compare_value_options(None, None)

        assert result == DiffStatus.NOT_APPLICABLE

    def test_compare_both_options_empty(self, comparison_service):
        """Test comparing when both options are empty lists."""
        result = comparison_service._compare_value_options([], [])

        assert result == DiffStatus.NOT_APPLICABLE

    def test_compare_one_option_none_other_has_values(self, comparison_service):
        """Test comparing when one is None and other has values."""
        options = ["Option A", "Option B"]

        result = comparison_service._compare_value_options(None, options)

        assert result == DiffStatus.DIFFERENT


class TestCompareVersionsIntegration:
    """Integration tests for compare_versions method."""

    def test_compare_versions_complete_workflow(
        self,
        comparison_service,
        source_version,
        target_version,
        source_fields,
        target_fields
    ):
        """Test complete comparison workflow."""
        # Mock database queries
        comparison_service.db.query.return_value.filter.return_value.first.side_effect = [
            source_version,
            target_version
        ]
        comparison_service.db.query.return_value.filter.return_value.order_by.return_value.all.side_effect = [
            source_fields,
            target_fields
        ]

        result = comparison_service.compare_versions(1, 2)

        assert result.source_version_id == 1
        assert result.target_version_id == 2
        assert result.global_metrics.fields_added == 1
        assert result.global_metrics.fields_removed == 1
        assert result.global_metrics.fields_modified == 2
        assert result.global_metrics.fields_unchanged == 1
        assert len(result.field_changes) == 5

    def test_compare_versions_with_nonexistent_source(
        self,
        comparison_service,
        target_version
    ):
        """Test comparing with non-existent source version."""
        comparison_service.db.query.return_value.filter.return_value.first.return_value = None

        with pytest.raises(ValueError) as exc_info:
            comparison_service.compare_versions(999, 2)

        assert "Version with ID 999 not found" in str(exc_info.value)

    def test_compare_versions_with_nonexistent_target(
        self,
        comparison_service,
        source_version
    ):
        """Test comparing with non-existent target version."""
        comparison_service.db.query.return_value.filter.return_value.first.side_effect = [
            source_version,
            None
        ]

        with pytest.raises(ValueError) as exc_info:
            comparison_service.compare_versions(1, 999)

        assert "Version with ID 999 not found" in str(exc_info.value)

