"""
Tests for Pydantic schema compatibility with SQLAlchemy models after refactoring.

These tests verify that the updated schemas can correctly serialize/deserialize
data from the refactored database models.
"""

import pytest
from datetime import datetime

from app.models.template import PDFTemplate, TemplateVersion
from app.schemas.template import (
    TemplateBase,
    TemplateCreate,
    TemplateUpdate,
    TemplateResponse,
    TemplateVersionResponse,
    TemplateUploadResponse,
    TemplateIngestRequest,
    TemplateIngestResponse,
)


class TestTemplateSchemaCompatibility:
    """Test compatibility between Template schemas and models."""

    def test_template_base_schema(self):
        """Test TemplateBase schema with new structure."""
        data = {
            "name": "Test Template",
            "current_version": "1.0.0",
            "comment": "Test comment",
        }
        schema = TemplateBase(**data)
        assert schema.name == "Test Template"
        assert schema.current_version == "1.0.0"
        assert schema.comment == "Test comment"

    def test_template_base_schema_without_comment(self):
        """Test TemplateBase schema without optional comment."""
        data = {"name": "Test Template", "current_version": "1.0.0"}
        schema = TemplateBase(**data)
        assert schema.name == "Test Template"
        assert schema.current_version == "1.0.0"
        assert schema.comment is None

    def test_template_create_schema(self):
        """Test TemplateCreate schema."""
        data = {
            "name": "New Template",
            "current_version": "1.0.0",
            "comment": "Initial version",
        }
        schema = TemplateCreate(**data)
        assert schema.name == "New Template"
        assert schema.current_version == "1.0.0"
        assert schema.comment == "Initial version"

    def test_template_update_schema(self):
        """Test TemplateUpdate schema with optional fields."""
        # All fields optional
        data = {"name": "Updated Name"}
        schema = TemplateUpdate(**data)
        assert schema.name == "Updated Name"
        assert schema.current_version is None
        assert schema.comment is None

        # Update version and comment
        data = {"current_version": "2.0.0", "comment": "Updated"}
        schema = TemplateUpdate(**data)
        assert schema.name is None
        assert schema.current_version == "2.0.0"
        assert schema.comment == "Updated"

    def test_template_response_from_model(self, db_session):
        """Test TemplateResponse serialization from PDFTemplate model."""
        # Create template with current version
        template = PDFTemplate(
            name="Response Test Template",
            current_version="1.0.0",
            comment="Test response",
        )
        db_session.add(template)
        db_session.commit()

        # Create current version
        version = TemplateVersion(
            template_id=template.id,
            version_number="1.0.0",
            file_path="/test/response.pdf",
            file_size_bytes=1024,
            field_count=10,
            sepe_url="https://www.sepe.es/test",
            is_current=True,
            page_count=5,
        )
        db_session.add(version)
        db_session.commit()

        # Refresh to load relationships
        db_session.refresh(template)

        # Create manual data dict combining template and current version
        template_data = {
            "id": template.id,
            "name": template.name,
            "current_version": template.current_version,
            "comment": template.comment,
            "uploaded_by": template.uploaded_by,
            "created_at": template.created_at,
            "updated_at": template.updated_at,
            "file_path": version.file_path,
            "file_size_bytes": version.file_size_bytes,
            "field_count": version.field_count,
            "sepe_url": version.sepe_url,
        }

        # Serialize to TemplateResponse
        schema = TemplateResponse(**template_data)

        assert schema.id == template.id
        assert schema.name == "Response Test Template"
        assert schema.current_version == "1.0.0"
        assert schema.comment == "Test response"
        assert schema.file_path == "/test/response.pdf"
        assert schema.file_size_bytes == 1024
        assert schema.field_count == 10
        assert schema.sepe_url == "https://www.sepe.es/test"


class TestTemplateVersionSchemaCompatibility:
    """Test compatibility between TemplateVersion schemas and models."""

    def test_template_version_response_from_model(self, db_session):
        """Test TemplateVersionResponse serialization from TemplateVersion model."""
        # Create template
        template = PDFTemplate(name="Version Test Template", current_version="1.0.0")
        db_session.add(template)
        db_session.commit()

        # Create version with all fields
        version = TemplateVersion(
            template_id=template.id,
            version_number="1.0.0",
            change_summary="Initial release",
            is_current=True,
            file_path="/versions/test_v1.pdf",
            file_size_bytes=2048,
            field_count=25,
            sepe_url="https://www.sepe.es/v1",
            title="Test PDF",
            author="SEPE",
            subject="Employment",
            page_count=10,
        )
        db_session.add(version)
        db_session.commit()

        # Serialize using from_attributes
        schema = TemplateVersionResponse.model_validate(version)

        assert schema.id == version.id
        assert schema.template_id == template.id
        assert schema.version_number == "1.0.0"
        assert schema.change_summary == "Initial release"
        assert schema.is_current is True
        assert schema.file_path == "/versions/test_v1.pdf"
        assert schema.file_size_bytes == 2048
        assert schema.field_count == 25
        assert schema.sepe_url == "https://www.sepe.es/v1"
        assert schema.title == "Test PDF"
        assert schema.author == "SEPE"
        assert schema.subject == "Employment"
        assert schema.page_count == 10

    def test_template_version_response_without_optional_fields(self, db_session):
        """Test TemplateVersionResponse with minimal required fields."""
        template = PDFTemplate(name="Minimal Template", current_version="1.0.0")
        db_session.add(template)
        db_session.commit()

        version = TemplateVersion(
            template_id=template.id,
            version_number="1.0.0",
            file_path="/minimal.pdf",
            file_size_bytes=500,
            field_count=5,
            is_current=True,
            page_count=1,
        )
        db_session.add(version)
        db_session.commit()

        schema = TemplateVersionResponse.model_validate(version)

        assert schema.version_number == "1.0.0"
        assert schema.file_path == "/minimal.pdf"
        assert schema.file_size_bytes == 500
        assert schema.field_count == 5
        assert schema.sepe_url is None
        assert schema.title is None
        assert schema.change_summary is None


class TestIngestionSchemaCompatibility:
    """Test compatibility of ingestion schemas."""

    def test_template_ingest_request_validation(self):
        """Test TemplateIngestRequest validation."""
        # Valid request
        data = {
            "name": "Ingestion Test",
            "version": "1.0.0",
            "sepe_url": "https://www.sepe.es/test",
            "comment": "Test ingestion",
        }
        schema = TemplateIngestRequest(**data)
        assert schema.name == "Ingestion Test"
        assert schema.version == "1.0.0"
        assert str(schema.sepe_url) == "https://www.sepe.es/test/"
        assert schema.comment == "Test ingestion"

    def test_template_ingest_request_without_optional_fields(self):
        """Test TemplateIngestRequest without optional fields."""
        data = {"name": "Simple Ingest", "version": "1.0.0"}
        schema = TemplateIngestRequest(**data)
        assert schema.name == "Simple Ingest"
        assert schema.version == "1.0.0"
        assert schema.sepe_url is None
        assert schema.comment is None

    def test_template_ingest_request_strips_whitespace(self):
        """Test that validators strip whitespace."""
        data = {"name": "  Test Name  ", "version": "  1.0.0  "}
        schema = TemplateIngestRequest(**data)
        assert schema.name == "Test Name"
        assert schema.version == "1.0.0"

    def test_template_ingest_request_validation_errors(self):
        """Test TemplateIngestRequest validation errors."""
        # Empty name
        with pytest.raises(ValueError, match="Template name cannot be empty"):
            TemplateIngestRequest(name="   ", version="1.0.0")

        # Empty version
        with pytest.raises(ValueError, match="Template version cannot be empty"):
            TemplateIngestRequest(name="Test", version="   ")

    def test_template_ingest_response_structure(self):
        """Test TemplateIngestResponse structure."""
        data = {
            "id": 1,
            "name": "Ingested Template",
            "current_version": "1.0.0",
            "comment": "Ingested successfully",
            "file_path": "/ingested/test.pdf",
            "file_size_bytes": 3072,
            "field_count": 30,
            "sepe_url": "https://www.sepe.es/ingested",
            "checksum": "abc123def456",
            "message": "Template ingested successfully",
        }
        schema = TemplateIngestResponse(**data)

        assert schema.id == 1
        assert schema.name == "Ingested Template"
        assert schema.current_version == "1.0.0"
        assert schema.comment == "Ingested successfully"
        assert schema.file_path == "/ingested/test.pdf"
        assert schema.file_size_bytes == 3072
        assert schema.field_count == 30
        assert schema.sepe_url == "https://www.sepe.es/ingested"
        assert schema.checksum == "abc123def456"


class TestTemplateUploadResponseCompatibility:
    """Test TemplateUploadResponse schema."""

    def test_template_upload_response_structure(self):
        """Test TemplateUploadResponse with all fields."""
        data = {
            "id": 1,
            "name": "Uploaded Template",
            "current_version": "1.0.0",
            "comment": "Upload test",
            "file_path": "/uploads/test.pdf",
            "file_size_bytes": 2048,
            "field_count": 20,
            "sepe_url": "https://www.sepe.es/upload",
            "message": "Upload complete",
        }
        schema = TemplateUploadResponse(**data)

        assert schema.id == 1
        assert schema.name == "Uploaded Template"
        assert schema.current_version == "1.0.0"
        assert schema.comment == "Upload test"
        assert schema.file_path == "/uploads/test.pdf"
        assert schema.file_size_bytes == 2048
        assert schema.field_count == 20
        assert schema.sepe_url == "https://www.sepe.es/upload"
        assert schema.message == "Upload complete"

    def test_template_upload_response_without_optional(self):
        """Test TemplateUploadResponse without optional fields."""
        data = {
            "id": 2,
            "name": "Simple Upload",
            "current_version": "1.0.0",
            "file_path": "/simple.pdf",
            "file_size_bytes": 1024,
            "field_count": 10,
        }
        schema = TemplateUploadResponse(**data)

        assert schema.comment is None
        assert schema.sepe_url is None
        assert schema.message == "Template uploaded successfully"
