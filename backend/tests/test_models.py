"""
Tests for SQLAlchemy database models.
"""

import pytest
from datetime import datetime
from sqlalchemy.exc import IntegrityError

from app.models.user import User
from app.models.template import PDFTemplate, TemplateVersion
from app.models.comparison import Comparison, ComparisonField


class TestUserModel:
    """Test cases for User model."""

    def test_user_creation(self, db_session):
        """Test creating a new user."""
        user = User(
            email="test@example.com",
            hashed_password="hashed_password_123",
            full_name="Test User",
        )
        db_session.add(user)
        db_session.commit()

        assert user.id is not None
        assert user.email == "test@example.com"
        assert user.full_name == "Test User"
        assert user.is_active is True
        assert user.is_superuser is False
        assert user.created_at is not None
        assert isinstance(user.created_at, datetime)

    def test_user_email_uniqueness(self, db_session):
        """Test that user email must be unique."""
        user1 = User(email="duplicate@example.com", hashed_password="password1")
        user2 = User(email="duplicate@example.com", hashed_password="password2")

        db_session.add(user1)
        db_session.commit()

        db_session.add(user2)
        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_user_string_representation(self, db_session):
        """Test user string representation."""
        user = User(
            email="repr@example.com", hashed_password="password", full_name="Repr User"
        )
        db_session.add(user)
        db_session.commit()

        assert "repr@example.com" in str(user)


class TestPDFTemplateModel:
    """Test cases for PDFTemplate model."""

    def test_template_creation(self, db_session):
        """Test creating a new PDF template with refactored schema."""
        # Create a user first (foreign key requirement)
        user = User(email="uploader@example.com", hashed_password="password")
        db_session.add(user)
        db_session.commit()

        # Note: file_path, file_size_bytes, field_count, sepe_url now in TemplateVersion
        template = PDFTemplate(
            name="Test Template",
            current_version="1.0.0",
            comment="Initial upload for testing",
            uploaded_by=user.id,
        )
        db_session.add(template)
        db_session.commit()

        assert template.id is not None
        assert template.name == "Test Template"
        assert template.current_version == "1.0.0"
        assert template.comment == "Initial upload for testing"
        assert template.uploaded_by == user.id
        assert template.created_at is not None

    def test_template_string_representation(self, db_session):
        """Test template string representation."""
        template = PDFTemplate(name="Repr Template", current_version="2.0.0")
        db_session.add(template)
        db_session.commit()

        repr_str = str(template)
        assert "Repr Template" in repr_str
        assert "2.0.0" in repr_str
        assert "current_version" in repr_str

    def test_template_current_version_property(self, db_session):
        """Test current_version_record property."""
        template = PDFTemplate(name="Version Test Template", current_version="1.0.0")
        db_session.add(template)
        db_session.commit()

        # Create versions
        version1 = TemplateVersion(
            template_id=template.id,
            version_number="1.0.0",
            file_path="/test_v1.pdf",
            file_size_bytes=1000,
            field_count=10,
            is_current=True,
            page_count=5,
        )
        version2 = TemplateVersion(
            template_id=template.id,
            version_number="0.9.0",
            file_path="/test_v0.9.pdf",
            file_size_bytes=900,
            field_count=8,
            is_current=False,
            page_count=4,
        )
        db_session.add_all([version1, version2])
        db_session.commit()

        # Refresh to load relationships
        db_session.refresh(template)

        # Test current_version_record property
        current = template.current_version_record
        assert current is not None
        assert current.version_number == "1.0.0"
        assert current.is_current is True

    def test_template_without_comment(self, db_session):
        """Test template creation without optional comment field."""
        template = PDFTemplate(name="No Comment Template", current_version="1.0.0")
        db_session.add(template)
        db_session.commit()

        assert template.id is not None
        assert template.comment is None


class TestTemplateVersionModel:
    """Test cases for TemplateVersion model with refactored schema."""

    def test_template_version_creation(self, db_session):
        """Test creating a template version with new file fields."""
        template = PDFTemplate(name="Versioned Template", current_version="1.0.0")
        db_session.add(template)
        db_session.commit()

        version = TemplateVersion(
            template_id=template.id,
            version_number="1.0.0",
            file_path="/uploads/test_v1.pdf",
            file_size_bytes=2621440,  # 2.5 MB
            field_count=45,
            sepe_url="https://www.sepe.es/template1",
            change_summary="Initial version",
            is_current=True,
            page_count=5,
            title="Test Template",
            author="SEPE",
            subject="Employment Form",
        )
        db_session.add(version)
        db_session.commit()

        assert version.id is not None
        assert version.template_id == template.id
        assert version.version_number == "1.0.0"
        assert version.file_path == "/uploads/test_v1.pdf"
        assert version.file_size_bytes == 2621440
        assert version.field_count == 45
        assert version.sepe_url == "https://www.sepe.es/template1"
        assert version.change_summary == "Initial version"
        assert version.is_current is True
        assert version.created_at is not None
        assert version.page_count == 5

    def test_template_version_file_size_mb_property(self, db_session):
        """Test file_size_mb property calculation."""
        template = PDFTemplate(name="Size Test Template", current_version="1.0.0")
        db_session.add(template)
        db_session.commit()

        version = TemplateVersion(
            template_id=template.id,
            version_number="1.0.0",
            file_path="/test.pdf",
            file_size_bytes=2621440,  # Exactly 2.5 MB
            field_count=10,
            page_count=3,
        )
        db_session.add(version)
        db_session.commit()

        assert version.file_size_mb == 2.5

    def test_template_version_without_optional_fields(self, db_session):
        """Test version creation without optional fields."""
        template = PDFTemplate(name="Minimal Version Template", current_version="1.0.0")
        db_session.add(template)
        db_session.commit()

        version = TemplateVersion(
            template_id=template.id,
            version_number="1.0.0",
            file_path="/minimal.pdf",
            file_size_bytes=1000,
            field_count=5,
            page_count=1
            # sepe_url, change_summary, title, etc. are optional
        )
        db_session.add(version)
        db_session.commit()

        assert version.id is not None
        assert version.sepe_url is None
        assert version.change_summary is None
        assert version.title is None

    def test_template_version_string_representation(self, db_session):
        """Test version string representation."""
        template = PDFTemplate(name="Repr Version Template", current_version="2.1.0")
        db_session.add(template)
        db_session.commit()

        version = TemplateVersion(
            template_id=template.id,
            version_number="2.1.0",
            file_path="/repr.pdf",
            file_size_bytes=1000,
            field_count=20,
            is_current=True,
            page_count=3,
        )
        db_session.add(version)
        db_session.commit()

        repr_str = str(version)
        assert "2.1.0" in repr_str
        assert "is_current=True" in repr_str

    def test_template_version_cascade_delete(self, db_session):
        """Test that deleting template cascades to versions."""
        template = PDFTemplate(name="Cascade Test", current_version="1.0.0")
        db_session.add(template)
        db_session.commit()

        version = TemplateVersion(
            template_id=template.id,
            version_number="1.0.0",
            file_path="/cascade.pdf",
            file_size_bytes=1000,
            field_count=5,
            page_count=2,
        )
        db_session.add(version)
        db_session.commit()

        version_id = version.id

        # Delete template
        db_session.delete(template)
        db_session.commit()

        # Version should be deleted due to cascade
        deleted_version = (
            db_session.query(TemplateVersion).filter_by(id=version_id).first()
        )
        assert deleted_version is None


class TestComparisonModel:
    """Test cases for Comparison model."""

    def test_comparison_creation(self, db_session):
        """Test creating a comparison."""
        # Create user and templates
        user = User(email="comparator@example.com", hashed_password="password")
        db_session.add(user)
        db_session.commit()

        template1 = PDFTemplate(name="Template A", current_version="1.0.0")
        template2 = PDFTemplate(name="Template B", current_version="2.0.0")
        db_session.add_all([template1, template2])
        db_session.commit()

        comparison = Comparison(
            source_template_id=template1.id,
            target_template_id=template2.id,
            comparison_type="structure",
            status="pending",
            created_by=user.id,
        )
        db_session.add(comparison)
        db_session.commit()

        assert comparison.id is not None
        assert comparison.source_template_id == template1.id
        assert comparison.target_template_id == template2.id
        assert comparison.comparison_type == "structure"
        assert comparison.status == "pending"
        assert comparison.differences_count == 0
        assert comparison.created_by == user.id
        assert comparison.created_at is not None


class TestComparisonFieldModel:
    """Test cases for ComparisonField model."""

    def test_comparison_field_creation(self, db_session):
        """Test creating a comparison field."""
        # Create necessary parent records
        user = User(email="field_test@example.com", hashed_password="password")
        template1 = PDFTemplate(name="Template 1", current_version="1.0.0")
        template2 = PDFTemplate(name="Template 2", current_version="1.0.0")
        db_session.add_all([user, template1, template2])
        db_session.commit()

        comparison = Comparison(
            source_template_id=template1.id,
            target_template_id=template2.id,
            created_by=user.id,
        )
        db_session.add(comparison)
        db_session.commit()

        field = ComparisonField(
            comparison_id=comparison.id,
            field_name="applicant_name",
            field_type="text",
            change_type="modified",
            old_value="text_field",
            new_value="text_field_required",
            position_x=100.5,
            position_y=200.5,
        )
        db_session.add(field)
        db_session.commit()

        assert field.id is not None
        assert field.comparison_id == comparison.id
        assert field.field_name == "applicant_name"
        assert field.change_type == "modified"
        assert field.old_value == "text_field"
        assert field.new_value == "text_field_required"
        assert field.position_x == 100.5
        assert field.position_y == 200.5
        assert field.created_at is not None
