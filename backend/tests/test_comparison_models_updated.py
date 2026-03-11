"""
Tests for updated Comparison and ComparisonField models with persistence support.

These tests verify the new schema changes including:
- Version-based foreign keys
- Global metrics columns
- Complete field change data columns
- JSONB position and value options
"""

import pytest
from datetime import datetime
from sqlalchemy.exc import IntegrityError
from sqlalchemy import CheckViolation

from app.models.user import User
from app.models.template import PDFTemplate, TemplateVersion
from app.models.comparison import Comparison, ComparisonField


class TestUpdatedComparisonModel:
    """Test cases for updated Comparison model with persistence columns."""

    def test_comparison_creation_with_versions(self, db_session):
        """Test creating a comparison with version-based foreign keys."""
        # Create user
        user = User(email="version_comp@example.com", hashed_password="password")
        db_session.add(user)
        db_session.commit()

        # Create template and versions
        template = PDFTemplate(name="Test Template", current_version="1.0")
        db_session.add(template)
        db_session.commit()

        version1 = TemplateVersion(
            template_id=template.id,
            version_number="1.0",
            file_path="/test_v1.pdf",
            file_size_bytes=1000,
            field_count=10,
            page_count=2,
        )
        version2 = TemplateVersion(
            template_id=template.id,
            version_number="2.0",
            file_path="/test_v2.pdf",
            file_size_bytes=1200,
            field_count=12,
            page_count=2,
        )
        db_session.add_all([version1, version2])
        db_session.commit()

        # Create comparison with version FKs
        comparison = Comparison(
            source_version_id=version1.id,
            target_version_id=version2.id,
            created_by=user.id,
            modification_percentage=16.67,
            fields_added=2,
            fields_removed=0,
            fields_modified=0,
            fields_unchanged=10,
        )
        db_session.add(comparison)
        db_session.commit()

        assert comparison.id is not None
        assert comparison.source_version_id == version1.id
        assert comparison.target_version_id == version2.id
        assert comparison.modification_percentage == 16.67
        assert comparison.fields_added == 2
        assert comparison.fields_removed == 0
        assert comparison.fields_modified == 0
        assert comparison.fields_unchanged == 10
        assert comparison.created_at is not None

    def test_comparison_with_global_metrics(self, db_session):
        """Test comparison with all global metrics columns."""
        user = User(email="metrics@example.com", hashed_password="password")
        template = PDFTemplate(name="Metrics Template", current_version="1.0")
        db_session.add_all([user, template])
        db_session.commit()

        version1 = TemplateVersion(
            template_id=template.id,
            version_number="1.0",
            file_path="/v1.pdf",
            file_size_bytes=1000,
            field_count=50,
            page_count=3,
        )
        version2 = TemplateVersion(
            template_id=template.id,
            version_number="2.0",
            file_path="/v2.pdf",
            file_size_bytes=1100,
            field_count=55,
            page_count=3,
        )
        db_session.add_all([version1, version2])
        db_session.commit()

        comparison = Comparison(
            source_version_id=version1.id,
            target_version_id=version2.id,
            created_by=user.id,
            status="completed",
            modification_percentage=20.0,
            fields_added=5,
            fields_removed=2,
            fields_modified=3,
            fields_unchanged=45,
        )
        db_session.add(comparison)
        db_session.commit()

        # Verify all metrics
        assert comparison.modification_percentage == 20.0
        assert comparison.fields_added == 5
        assert comparison.fields_removed == 2
        assert comparison.fields_modified == 3
        assert comparison.fields_unchanged == 45
        
        # Verify total: 5 + 2 + 3 + 45 = 55 (or 50 base + 5 added)
        total_changes = (
            comparison.fields_added + 
            comparison.fields_removed + 
            comparison.fields_modified + 
            comparison.fields_unchanged
        )
        assert total_changes >= 50  # At least source count

    def test_comparison_different_versions_constraint(self, db_session):
        """Test that source and target versions must be different."""
        user = User(email="constraint@example.com", hashed_password="password")
        template = PDFTemplate(name="Constraint Template", current_version="1.0")
        db_session.add_all([user, template])
        db_session.commit()

        version = TemplateVersion(
            template_id=template.id,
            version_number="1.0",
            file_path="/v1.pdf",
            file_size_bytes=1000,
            field_count=10,
            page_count=1,
        )
        db_session.add(version)
        db_session.commit()

        # Try to create comparison with same source and target
        comparison = Comparison(
            source_version_id=version.id,
            target_version_id=version.id,  # Same as source
            created_by=user.id,
        )
        db_session.add(comparison)
        
        with pytest.raises((IntegrityError, CheckViolation)):
            db_session.commit()

    def test_comparison_modification_percentage_range(self, db_session):
        """Test that modification percentage must be between 0 and 100."""
        user = User(email="range@example.com", hashed_password="password")
        template = PDFTemplate(name="Range Template", current_version="1.0")
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

        # Try to create comparison with invalid percentage
        comparison = Comparison(
            source_version_id=version1.id,
            target_version_id=version2.id,
            modification_percentage=150.0,  # Invalid: > 100
        )
        db_session.add(comparison)
        
        with pytest.raises((IntegrityError, CheckViolation)):
            db_session.commit()

    def test_comparison_cascade_delete_on_version(self, db_session):
        """Test that deleting a version cascades to comparisons."""
        user = User(email="cascade@example.com", hashed_password="password")
        template = PDFTemplate(name="Cascade Template", current_version="1.0")
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
        )
        db_session.add(comparison)
        db_session.commit()

        comparison_id = comparison.id

        # Delete version1 - should cascade delete comparison
        db_session.delete(version1)
        db_session.commit()

        # Comparison should be deleted
        deleted_comparison = db_session.query(Comparison).filter_by(id=comparison_id).first()
        assert deleted_comparison is None

    def test_comparison_version_relationships(self, db_session):
        """Test relationships to TemplateVersion models."""
        user = User(email="relationships@example.com", hashed_password="password")
        template = PDFTemplate(name="Relationship Template", current_version="1.0")
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
            field_count=12,
            page_count=1,
        )
        db_session.add_all([version1, version2])
        db_session.commit()

        comparison = Comparison(
            source_version_id=version1.id,
            target_version_id=version2.id,
        )
        db_session.add(comparison)
        db_session.commit()

        # Test relationships
        db_session.refresh(comparison)
        assert comparison.source_version is not None
        assert comparison.source_version.version_number == "1.0"
        assert comparison.target_version is not None
        assert comparison.target_version.version_number == "2.0"


class TestUpdatedComparisonFieldModel:
    """Test cases for updated ComparisonField model with complete data columns."""

    def test_comparison_field_with_new_columns(self, db_session):
        """Test creating comparison field with all new columns."""
        # Setup
        user = User(email="field_new@example.com", hashed_password="password")
        template = PDFTemplate(name="Field Template", current_version="1.0")
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
        )
        db_session.add(comparison)
        db_session.commit()

        # Create field with new columns
        field = ComparisonField(
            comparison_id=comparison.id,
            field_id="APPLICANT_NAME",
            status="MODIFIED",
            field_type="text",
            source_page_number=1,
            target_page_number=1,
            page_number_changed=False,
            near_text_diff="DIFFERENT",
            source_near_text="Name of applicant",
            target_near_text="Applicant full name",
            value_options_diff="NOT_APPLICABLE",
            position_change="EQUAL",
            source_position={"x0": 100.0, "y0": 200.0, "x1": 300.0, "y1": 220.0},
            target_position={"x0": 100.0, "y0": 200.0, "x1": 300.0, "y1": 220.0},
        )
        db_session.add(field)
        db_session.commit()

        # Verify all new columns
        assert field.field_id == "APPLICANT_NAME"
        assert field.status == "MODIFIED"
        assert field.source_page_number == 1
        assert field.target_page_number == 1
        assert field.page_number_changed is False
        assert field.near_text_diff == "DIFFERENT"
        assert field.source_near_text == "Name of applicant"
        assert field.target_near_text == "Applicant full name"
        assert field.value_options_diff == "NOT_APPLICABLE"
        assert field.position_change == "EQUAL"
        assert field.source_position == {"x0": 100.0, "y0": 200.0, "x1": 300.0, "y1": 220.0}
        assert field.target_position == {"x0": 100.0, "y0": 200.0, "x1": 300.0, "y1": 220.0}

    def test_comparison_field_added_status(self, db_session):
        """Test field with ADDED status."""
        # Setup comparison
        user = User(email="field_added@example.com", hashed_password="password")
        template = PDFTemplate(name="Added Field Template", current_version="1.0")
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

        comparison = Comparison(
            source_version_id=version1.id,
            target_version_id=version2.id,
        )
        db_session.add(comparison)
        db_session.commit()

        # Create ADDED field (source data should be NULL)
        field = ComparisonField(
            comparison_id=comparison.id,
            field_id="NEW_FIELD",
            status="ADDED",
            field_type="checkbox",
            source_page_number=None,  # NULL for added fields
            target_page_number=1,
            page_number_changed=False,
            near_text_diff="NOT_APPLICABLE",
            target_near_text="Accept terms and conditions",
            value_options_diff="NOT_APPLICABLE",
            position_change="NOT_APPLICABLE",
            target_position={"x0": 50.0, "y0": 700.0, "x1": 70.0, "y1": 720.0},
        )
        db_session.add(field)
        db_session.commit()

        assert field.status == "ADDED"
        assert field.source_page_number is None
        assert field.target_page_number == 1
        assert field.source_near_text is None
        assert field.target_near_text == "Accept terms and conditions"

    def test_comparison_field_with_value_options(self, db_session):
        """Test field with JSONB value options."""
        # Setup
        user = User(email="field_options@example.com", hashed_password="password")
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

        comparison = Comparison(
            source_version_id=version1.id,
            target_version_id=version2.id,
        )
        db_session.add(comparison)
        db_session.commit()

        # Create field with value options
        field = ComparisonField(
            comparison_id=comparison.id,
            field_id="BENEFIT_TYPE",
            status="MODIFIED",
            field_type="select",
            source_page_number=2,
            target_page_number=2,
            page_number_changed=False,
            near_text_diff="EQUAL",
            source_near_text="Type of benefit",
            target_near_text="Type of benefit",
            value_options_diff="DIFFERENT",
            source_value_options=["Contributory", "Assistance"],
            target_value_options=["Contributory", "Assistance", "Agricultural subsidy"],
            position_change="EQUAL",
        )
        db_session.add(field)
        db_session.commit()

        # Verify JSONB columns
        assert field.source_value_options == ["Contributory", "Assistance"]
        assert field.target_value_options == ["Contributory", "Assistance", "Agricultural subsidy"]
        assert field.value_options_diff == "DIFFERENT"

    def test_comparison_field_status_constraint(self, db_session):
        """Test that status must be a valid enum value."""
        # Setup
        user = User(email="field_status@example.com", hashed_password="password")
        template = PDFTemplate(name="Status Template", current_version="1.0")
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
        )
        db_session.add(comparison)
        db_session.commit()

        # Try invalid status
        field = ComparisonField(
            comparison_id=comparison.id,
            field_id="TEST_FIELD",
            status="INVALID_STATUS",  # Not in (ADDED, REMOVED, MODIFIED, UNCHANGED)
            field_type="text",
        )
        db_session.add(field)
        
        with pytest.raises((IntegrityError, CheckViolation)):
            db_session.commit()

    def test_comparison_field_cascade_delete(self, db_session):
        """Test that deleting comparison cascades to fields."""
        # Setup
        user = User(email="field_cascade@example.com", hashed_password="password")
        template = PDFTemplate(name="Cascade Field Template", current_version="1.0")
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
        )
        db_session.add(comparison)
        db_session.commit()

        field = ComparisonField(
            comparison_id=comparison.id,
            field_id="TEST_FIELD",
            status="UNCHANGED",
            field_type="text",
        )
        db_session.add(field)
        db_session.commit()

        field_id = field.id

        # Delete comparison - should cascade to field
        db_session.delete(comparison)
        db_session.commit()

        # Field should be deleted
        deleted_field = db_session.query(ComparisonField).filter_by(id=field_id).first()
        assert deleted_field is None

