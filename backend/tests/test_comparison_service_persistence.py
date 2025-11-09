"""
Tests for comparison service persistence methods.

These tests verify the new service methods for saving, retrieving, listing,
and checking comparison results in the database.
"""

import pytest
from datetime import datetime
from sqlalchemy.exc import IntegrityError

from app.models.user import User
from app.models.template import PDFTemplate, TemplateVersion
from app.models.comparison import Comparison, ComparisonField
from app.services.comparison_service import ComparisonService
from app.schemas.comparison import (
    ComparisonResult,
    GlobalMetrics,
    FieldChange,
    FieldChangeStatus,
    DiffStatus,
    ComparisonSummary,
)


class TestSaveComparison:
    """Test cases for save_comparison method."""

    def test_save_comparison_success(self, db_session):
        """Test successfully saving a comparison with all data."""
        # Setup
        user = User(email="saver@example.com", hashed_password="password")
        db_session.add(user)
        db_session.commit()

        template = PDFTemplate(name="Test Template", current_version="1.0")
        db_session.add(template)
        db_session.commit()

        version1 = TemplateVersion(
            template_id=template.id,
            version_number="1.0",
            file_path="/v1.pdf",
            file_size_bytes=1000,
            field_count=50,
            page_count=5,
        )
        version2 = TemplateVersion(
            template_id=template.id,
            version_number="2.0",
            file_path="/v2.pdf",
            file_size_bytes=1100,
            field_count=52,
            page_count=5,
        )
        db_session.add_all([version1, version2])
        db_session.commit()

        # Create comparison result
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
            source_created_at=version1.created_at,
            target_created_at=version2.created_at,
        )

        field_changes = [
            FieldChange(
                field_id="FIELD_ADDED",
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
            ),
            FieldChange(
                field_id="FIELD_MODIFIED",
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
                source_position={"x0": 50, "y0": 100, "x1": 150, "y1": 120},
                target_position={"x0": 50, "y0": 100, "x1": 150, "y1": 120},
            ),
        ]

        comparison_result = ComparisonResult(
            source_version_id=version1.id,
            target_version_id=version2.id,
            global_metrics=global_metrics,
            field_changes=field_changes,
        )

        # Execute
        service = ComparisonService(db_session)
        comparison_id = service.save_comparison(
            user_id=user.id,
            comparison_result=comparison_result
        )

        # Verify
        assert comparison_id is not None
        assert comparison_id > 0

        # Check comparison record
        comparison = db_session.query(Comparison).filter_by(
            id=comparison_id
        ).first()
        assert comparison is not None
        assert comparison.source_version_id == version1.id
        assert comparison.target_version_id == version2.id
        assert comparison.modification_percentage == 6.0
        assert comparison.fields_added == 2
        assert comparison.fields_removed == 0
        assert comparison.fields_modified == 1
        assert comparison.fields_unchanged == 49
        assert comparison.created_by == user.id
        assert comparison.status == "completed"

        # Check field records
        fields = db_session.query(ComparisonField).filter_by(
            comparison_id=comparison_id
        ).all()
        assert len(fields) == 2

        # Verify ADDED field
        added_field = next(f for f in fields if f.field_id == "FIELD_ADDED")
        assert added_field.status == "ADDED"
        assert added_field.source_page_number is None
        assert added_field.target_page_number == 1
        assert added_field.target_near_text == "New field"
        assert added_field.target_position == {
            "x0": 100, "y0": 200, "x1": 300, "y1": 220
        }

        # Verify MODIFIED field
        modified_field = next(
            f for f in fields if f.field_id == "FIELD_MODIFIED"
        )
        assert modified_field.status == "MODIFIED"
        assert modified_field.source_page_number == 1
        assert modified_field.target_page_number == 1
        assert modified_field.near_text_diff == "DIFFERENT"
        assert modified_field.source_near_text == "Old label"
        assert modified_field.target_near_text == "New label"

    def test_save_comparison_with_value_options(self, db_session):
        """Test saving comparison with JSONB value_options."""
        # Setup
        user = User(email="options@example.com", hashed_password="password")
        template = PDFTemplate(name="Options Template", current_version="1.0")
        db_session.add_all([user, template])
        db_session.commit()

        version1 = TemplateVersion(
            template_id=template.id,
            version_number="1.0",
            file_path="/v1.pdf",
            file_size_bytes=1000,
            field_count=10,
            page_count=1,
        )
        version2 = TemplateVersion(
            template_id=template.id,
            version_number="2.0",
            file_path="/v2.pdf",
            file_size_bytes=1000,
            field_count=10,
            page_count=1,
        )
        db_session.add_all([version1, version2])
        db_session.commit()

        global_metrics = GlobalMetrics(
            source_version_number="1.0",
            target_version_number="2.0",
            source_page_count=1,
            target_page_count=1,
            page_count_changed=False,
            source_field_count=10,
            target_field_count=10,
            field_count_changed=False,
            fields_added=0,
            fields_removed=0,
            fields_modified=1,
            fields_unchanged=9,
            modification_percentage=10.0,
            source_created_at=version1.created_at,
            target_created_at=version2.created_at,
        )

        field_changes = [
            FieldChange(
                field_id="SELECT_FIELD",
                status=FieldChangeStatus.MODIFIED,
                field_type="select",
                source_page_number=1,
                target_page_number=1,
                page_number_changed=False,
                near_text_diff=DiffStatus.EQUAL,
                source_near_text="Select option",
                target_near_text="Select option",
                value_options_diff=DiffStatus.DIFFERENT,
                source_value_options=["Option A", "Option B"],
                target_value_options=["Option A", "Option B", "Option C"],
                position_change=DiffStatus.EQUAL,
                source_position={"x0": 100, "y0": 200, "x1": 300, "y1": 220},
                target_position={"x0": 100, "y0": 200, "x1": 300, "y1": 220},
            ),
        ]

        comparison_result = ComparisonResult(
            source_version_id=version1.id,
            target_version_id=version2.id,
            global_metrics=global_metrics,
            field_changes=field_changes,
        )

        # Execute
        service = ComparisonService(db_session)
        comparison_id = service.save_comparison(
            user_id=user.id,
            comparison_result=comparison_result
        )

        # Verify JSONB storage
        field = db_session.query(ComparisonField).filter_by(
            comparison_id=comparison_id,
            field_id="SELECT_FIELD"
        ).first()
        assert field.source_value_options == ["Option A", "Option B"]
        assert field.target_value_options == [
            "Option A", "Option B", "Option C"
        ]
        assert field.value_options_diff == "DIFFERENT"

    def test_save_comparison_invalid_version(self, db_session):
        """Test save_comparison with non-existent version."""
        user = User(email="invalid@example.com", hashed_password="password")
        db_session.add(user)
        db_session.commit()

        global_metrics = GlobalMetrics(
            source_version_number="1.0",
            target_version_number="2.0",
            source_page_count=1,
            target_page_count=1,
            page_count_changed=False,
            source_field_count=10,
            target_field_count=10,
            field_count_changed=False,
            fields_added=0,
            fields_removed=0,
            fields_modified=0,
            fields_unchanged=10,
            modification_percentage=0.0,
            source_created_at=datetime.utcnow(),
            target_created_at=datetime.utcnow(),
        )

        comparison_result = ComparisonResult(
            source_version_id=9999,  # Non-existent
            target_version_id=9998,  # Non-existent
            global_metrics=global_metrics,
            field_changes=[],
        )

        service = ComparisonService(db_session)

        with pytest.raises((ValueError, IntegrityError)):
            service.save_comparison(
                user_id=user.id,
                comparison_result=comparison_result
            )

    def test_save_comparison_transaction_rollback(self, db_session):
        """Test that transaction rolls back on error."""
        # This test would verify that if field insertion fails,
        # the comparison record is also rolled back
        # Implementation depends on service error handling
        pass


class TestGetComparison:
    """Test cases for get_comparison method."""

    def test_get_comparison_success(self, db_session):
        """Test retrieving a saved comparison."""
        # Setup - Create complete comparison in DB
        user = User(email="getter@example.com", hashed_password="password")
        template = PDFTemplate(name="Get Template", current_version="1.0")
        db_session.add_all([user, template])
        db_session.commit()

        version1 = TemplateVersion(
            template_id=template.id,
            version_number="1.0",
            file_path="/v1.pdf",
            file_size_bytes=1000,
            field_count=10,
            page_count=2,
        )
        version2 = TemplateVersion(
            template_id=template.id,
            version_number="2.0",
            file_path="/v2.pdf",
            file_size_bytes=1100,
            field_count=11,
            page_count=2,
        )
        db_session.add_all([version1, version2])
        db_session.commit()

        comparison = Comparison(
            source_version_id=version1.id,
            target_version_id=version2.id,
            created_by=user.id,
            modification_percentage=10.0,
            fields_added=1,
            fields_removed=0,
            fields_modified=0,
            fields_unchanged=10,
        )
        db_session.add(comparison)
        db_session.commit()

        field = ComparisonField(
            comparison_id=comparison.id,
            field_id="TEST_FIELD",
            status="ADDED",
            field_type="text",
            target_page_number=1,
            page_number_changed=False,
            near_text_diff="NOT_APPLICABLE",
            target_near_text="Test field",
            value_options_diff="NOT_APPLICABLE",
            position_change="NOT_APPLICABLE",
            target_position={"x0": 100, "y0": 200, "x1": 300, "y1": 220},
        )
        db_session.add(field)
        db_session.commit()

        # Execute
        service = ComparisonService(db_session)
        result = service.get_comparison(comparison.id)

        # Verify
        assert result is not None
        assert result.source_version_id == version1.id
        assert result.target_version_id == version2.id
        assert result.global_metrics.modification_percentage == 10.0
        assert result.global_metrics.fields_added == 1
        assert result.global_metrics.source_version_number == "1.0"
        assert result.global_metrics.target_version_number == "2.0"
        assert len(result.field_changes) == 1
        assert result.field_changes[0].field_id == "TEST_FIELD"
        assert result.field_changes[0].status == FieldChangeStatus.ADDED

    def test_get_comparison_not_found(self, db_session):
        """Test get_comparison with non-existent ID."""
        service = ComparisonService(db_session)

        with pytest.raises(ValueError, match="Comparison.*not found"):
            service.get_comparison(99999)

    def test_get_comparison_with_multiple_fields(self, db_session):
        """Test retrieving comparison with multiple field changes."""
        # Setup
        user = User(email="multi@example.com", hashed_password="password")
        template = PDFTemplate(name="Multi Template", current_version="1.0")
        db_session.add_all([user, template])
        db_session.commit()

        version1 = TemplateVersion(
            template_id=template.id,
            version_number="1.0",
            file_path="/v1.pdf",
            file_size_bytes=1000,
            field_count=10,
            page_count=1,
        )
        version2 = TemplateVersion(
            template_id=template.id,
            version_number="2.0",
            file_path="/v2.pdf",
            file_size_bytes=1000,
            field_count=10,
            page_count=1,
        )
        db_session.add_all([version1, version2])
        db_session.commit()

        comparison = Comparison(
            source_version_id=version1.id,
            target_version_id=version2.id,
            modification_percentage=30.0,
            fields_added=1,
            fields_removed=1,
            fields_modified=1,
            fields_unchanged=7,
        )
        db_session.add(comparison)
        db_session.commit()

        fields = [
            ComparisonField(
                comparison_id=comparison.id,
                field_id="ADDED_FIELD",
                status="ADDED",
                field_type="text",
                target_page_number=1,
                page_number_changed=False,
                near_text_diff="NOT_APPLICABLE",
                value_options_diff="NOT_APPLICABLE",
                position_change="NOT_APPLICABLE",
            ),
            ComparisonField(
                comparison_id=comparison.id,
                field_id="REMOVED_FIELD",
                status="REMOVED",
                field_type="checkbox",
                source_page_number=1,
                page_number_changed=False,
                near_text_diff="NOT_APPLICABLE",
                value_options_diff="NOT_APPLICABLE",
                position_change="NOT_APPLICABLE",
            ),
            ComparisonField(
                comparison_id=comparison.id,
                field_id="MODIFIED_FIELD",
                status="MODIFIED",
                field_type="text",
                source_page_number=1,
                target_page_number=1,
                page_number_changed=False,
                near_text_diff="DIFFERENT",
                source_near_text="Old",
                target_near_text="New",
                value_options_diff="NOT_APPLICABLE",
                position_change="EQUAL",
            ),
        ]
        db_session.add_all(fields)
        db_session.commit()

        # Execute
        service = ComparisonService(db_session)
        result = service.get_comparison(comparison.id)

        # Verify
        assert len(result.field_changes) == 3
        field_ids = {fc.field_id for fc in result.field_changes}
        assert field_ids == {"ADDED_FIELD", "REMOVED_FIELD", "MODIFIED_FIELD"}


class TestListComparisons:
    """Test cases for list_comparisons method."""

    def test_list_comparisons_basic(self, db_session):
        """Test listing comparisons with default pagination."""
        # Setup - Create multiple comparisons
        user = User(email="lister@example.com", hashed_password="password")
        template = PDFTemplate(name="List Template", current_version="1.0")
        db_session.add_all([user, template])
        db_session.commit()

        version1 = TemplateVersion(
            template_id=template.id,
            version_number="1.0",
            file_path="/v1.pdf",
            file_size_bytes=1000,
            field_count=10,
            page_count=1,
        )
        version2 = TemplateVersion(
            template_id=template.id,
            version_number="2.0",
            file_path="/v2.pdf",
            file_size_bytes=1000,
            field_count=11,
            page_count=1,
        )
        db_session.add_all([version1, version2])
        db_session.commit()

        # Create 3 comparisons
        for i in range(3):
            comparison = Comparison(
                source_version_id=version1.id,
                target_version_id=version2.id,
                modification_percentage=10.0 * (i + 1),
                fields_added=i,
                fields_removed=0,
                fields_modified=1,
                fields_unchanged=10 - i,
            )
            db_session.add(comparison)
        db_session.commit()

        # Execute
        service = ComparisonService(db_session)
        summaries, total = service.list_comparisons(page=1, page_size=10)

        # Verify
        assert total == 3
        assert len(summaries) == 3
        assert all(isinstance(s, ComparisonSummary) for s in summaries)
        assert summaries[0].source_version_number == "1.0"
        assert summaries[0].target_version_number == "2.0"
        assert summaries[0].source_template_name == "List Template"

    def test_list_comparisons_pagination(self, db_session):
        """Test pagination of comparison list."""
        # Setup - Create 25 comparisons
        user = User(email="pager@example.com", hashed_password="password")
        template = PDFTemplate(name="Page Template", current_version="1.0")
        db_session.add_all([user, template])
        db_session.commit()

        version1 = TemplateVersion(
            template_id=template.id,
            version_number="1.0",
            file_path="/v1.pdf",
            file_size_bytes=1000,
            field_count=10,
            page_count=1,
        )
        version2 = TemplateVersion(
            template_id=template.id,
            version_number="2.0",
            file_path="/v2.pdf",
            file_size_bytes=1000,
            field_count=10,
            page_count=1,
        )
        db_session.add_all([version1, version2])
        db_session.commit()

        for i in range(25):
            comparison = Comparison(
                source_version_id=version1.id,
                target_version_id=version2.id,
                modification_percentage=5.0,
                fields_added=0,
                fields_removed=0,
                fields_modified=1,
                fields_unchanged=9,
            )
            db_session.add(comparison)
        db_session.commit()

        # Execute - Get page 1
        service = ComparisonService(db_session)
        page1, total = service.list_comparisons(page=1, page_size=10)

        # Verify page 1
        assert total == 25
        assert len(page1) == 10

        # Execute - Get page 3
        page3, total = service.list_comparisons(page=3, page_size=10)

        # Verify page 3
        assert total == 25
        assert len(page3) == 5  # Last page has 5 items

    def test_list_comparisons_sorting(self, db_session):
        """Test sorting of comparison list."""
        # Setup
        user = User(email="sorter@example.com", hashed_password="password")
        template = PDFTemplate(name="Sort Template", current_version="1.0")
        db_session.add_all([user, template])
        db_session.commit()

        version1 = TemplateVersion(
            template_id=template.id,
            version_number="1.0",
            file_path="/v1.pdf",
            file_size_bytes=1000,
            field_count=10,
            page_count=1,
        )
        version2 = TemplateVersion(
            template_id=template.id,
            version_number="2.0",
            file_path="/v2.pdf",
            file_size_bytes=1000,
            field_count=10,
            page_count=1,
        )
        db_session.add_all([version1, version2])
        db_session.commit()

        # Create comparisons with different percentages
        for pct in [50.0, 10.0, 30.0]:
            comparison = Comparison(
                source_version_id=version1.id,
                target_version_id=version2.id,
                modification_percentage=pct,
                fields_added=0,
                fields_removed=0,
                fields_modified=1,
                fields_unchanged=9,
            )
            db_session.add(comparison)
        db_session.commit()

        # Execute - Sort by modification_percentage descending
        service = ComparisonService(db_session)
        summaries, _ = service.list_comparisons(
            sort_by="modification_percentage",
            sort_order="desc"
        )

        # Verify
        percentages = [s.modification_percentage for s in summaries]
        assert percentages == [50.0, 30.0, 10.0]

    def test_list_comparisons_empty(self, db_session):
        """Test listing when no comparisons exist."""
        service = ComparisonService(db_session)
        summaries, total = service.list_comparisons()

        assert total == 0
        assert len(summaries) == 0


class TestComparisonExists:
    """Test cases for comparison_exists method."""

    def test_comparison_exists_true(self, db_session):
        """Test checking for existing comparison."""
        # Setup
        template = PDFTemplate(name="Exists Template", current_version="1.0")
        db_session.add(template)
        db_session.commit()

        version1 = TemplateVersion(
            template_id=template.id,
            version_number="1.0",
            file_path="/v1.pdf",
            file_size_bytes=1000,
            field_count=10,
            page_count=1,
        )
        version2 = TemplateVersion(
            template_id=template.id,
            version_number="2.0",
            file_path="/v2.pdf",
            file_size_bytes=1000,
            field_count=10,
            page_count=1,
        )
        db_session.add_all([version1, version2])
        db_session.commit()

        comparison = Comparison(
            source_version_id=version1.id,
            target_version_id=version2.id,
            modification_percentage=5.0,
            fields_added=0,
            fields_removed=0,
            fields_modified=1,
            fields_unchanged=9,
        )
        db_session.add(comparison)
        db_session.commit()

        # Execute
        service = ComparisonService(db_session)
        existing_id = service.comparison_exists(version1.id, version2.id)

        # Verify
        assert existing_id is not None
        assert existing_id == comparison.id

    def test_comparison_exists_false(self, db_session):
        """Test checking for non-existent comparison."""
        # Setup
        template = PDFTemplate(
            name="NonExists Template", current_version="1.0"
        )
        db_session.add(template)
        db_session.commit()

        version1 = TemplateVersion(
            template_id=template.id,
            version_number="1.0",
            file_path="/v1.pdf",
            file_size_bytes=1000,
            field_count=10,
            page_count=1,
        )
        version2 = TemplateVersion(
            template_id=template.id,
            version_number="2.0",
            file_path="/v2.pdf",
            file_size_bytes=1000,
            field_count=10,
            page_count=1,
        )
        db_session.add_all([version1, version2])
        db_session.commit()

        # Execute - No comparison created
        service = ComparisonService(db_session)
        existing_id = service.comparison_exists(version1.id, version2.id)

        # Verify
        assert existing_id is None

    def test_comparison_exists_bidirectional(self, db_session):
        """Test that comparison is found regardless of order."""
        # Setup
        template = PDFTemplate(name="Bidir Template", current_version="1.0")
        db_session.add(template)
        db_session.commit()

        version1 = TemplateVersion(
            template_id=template.id,
            version_number="1.0",
            file_path="/v1.pdf",
            file_size_bytes=1000,
            field_count=10,
            page_count=1,
        )
        version2 = TemplateVersion(
            template_id=template.id,
            version_number="2.0",
            file_path="/v2.pdf",
            file_size_bytes=1000,
            field_count=10,
            page_count=1,
        )
        db_session.add_all([version1, version2])
        db_session.commit()

        # Create comparison in one direction
        comparison = Comparison(
            source_version_id=version1.id,
            target_version_id=version2.id,
            modification_percentage=5.0,
            fields_added=0,
            fields_removed=0,
            fields_modified=0,
            fields_unchanged=10,
        )
        db_session.add(comparison)
        db_session.commit()

        # Execute - Check in reverse order
        service = ComparisonService(db_session)
        
        # Should find when querying in same order
        exists_same = service.comparison_exists(version1.id, version2.id)
        assert exists_same == comparison.id
        
        # Should also find when querying in reverse order
        exists_reverse = service.comparison_exists(version2.id, version1.id)
        assert exists_reverse == comparison.id

