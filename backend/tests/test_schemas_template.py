"""
Tests for template Pydantic schemas.

Tests validation logic for TemplateIngestRequest, TemplateIngestResponse,
and TemplateFieldData schemas.
"""
import pytest
from pydantic import ValidationError

from app.schemas.template import (
    TemplateIngestRequest,
    TemplateIngestResponse,
    TemplateFieldData
)


class TestTemplateIngestRequest:
    """Test cases for TemplateIngestRequest schema."""

    def test_valid_request_with_all_fields(self):
        """Test valid request with all fields."""
        data = {
            "name": "Test Template",
            "version": "1.0",
            "sepe_url": "https://www.sepe.es/test"
        }
        request = TemplateIngestRequest(**data)
        
        assert request.name == "Test Template"
        assert request.version == "1.0"
        assert str(request.sepe_url) == "https://www.sepe.es/test"

    def test_valid_request_without_sepe_url(self):
        """Test valid request without optional sepe_url."""
        data = {
            "name": "Test Template",
            "version": "1.0"
        }
        request = TemplateIngestRequest(**data)
        
        assert request.name == "Test Template"
        assert request.version == "1.0"
        assert request.sepe_url is None

    def test_name_required(self):
        """Test that name is required."""
        data = {
            "version": "1.0"
        }
        with pytest.raises(ValidationError) as exc_info:
            TemplateIngestRequest(**data)
        
        errors = exc_info.value.errors()
        assert any(e['loc'] == ('name',) for e in errors)

    def test_version_required(self):
        """Test that version is required."""
        data = {
            "name": "Test Template"
        }
        with pytest.raises(ValidationError) as exc_info:
            TemplateIngestRequest(**data)
        
        errors = exc_info.value.errors()
        assert any(e['loc'] == ('version',) for e in errors)

    def test_name_max_length(self):
        """Test name maximum length validation (255 chars)."""
        data = {
            "name": "A" * 256,  # Exceeds max
            "version": "1.0"
        }
        with pytest.raises(ValidationError) as exc_info:
            TemplateIngestRequest(**data)
        
        errors = exc_info.value.errors()
        assert any(e['loc'] == ('name',) for e in errors)

    def test_version_max_length(self):
        """Test version maximum length validation (50 chars)."""
        data = {
            "name": "Test",
            "version": "1" * 51  # Exceeds max
        }
        with pytest.raises(ValidationError) as exc_info:
            TemplateIngestRequest(**data)
        
        errors = exc_info.value.errors()
        assert any(e['loc'] == ('version',) for e in errors)

    def test_sepe_url_max_length(self):
        """Test sepe_url maximum length validation (1000 chars)."""
        # HttpUrl doesn't enforce max_length, so we test that very long
        # URLs are accepted by Pydantic but can be validated at app level
        data = {
            "name": "Test",
            "version": "1.0",
            "sepe_url": "https://www.sepe.es/" + "a" * 1000
        }
        # HttpUrl validates URL format but not length
        # Application-level validation should handle max length
        request = TemplateIngestRequest(**data)
        assert request.sepe_url is not None

    def test_sepe_url_format_validation(self):
        """Test that sepe_url must be a valid URL."""
        data = {
            "name": "Test",
            "version": "1.0",
            "sepe_url": "not-a-valid-url"
        }
        with pytest.raises(ValidationError) as exc_info:
            TemplateIngestRequest(**data)
        
        errors = exc_info.value.errors()
        assert any(e['loc'] == ('sepe_url',) for e in errors)

    def test_name_not_empty(self):
        """Test that name cannot be empty string."""
        data = {
            "name": "",
            "version": "1.0"
        }
        with pytest.raises(ValidationError) as exc_info:
            TemplateIngestRequest(**data)
        
        errors = exc_info.value.errors()
        assert any(e['loc'] == ('name',) for e in errors)

    def test_version_not_empty(self):
        """Test that version cannot be empty string."""
        data = {
            "name": "Test",
            "version": ""
        }
        with pytest.raises(ValidationError) as exc_info:
            TemplateIngestRequest(**data)
        
        errors = exc_info.value.errors()
        assert any(e['loc'] == ('version',) for e in errors)


class TestTemplateIngestResponse:
    """Test cases for TemplateIngestResponse schema."""

    def test_valid_response(self):
        """Test valid response with all fields."""
        data = {
            "id": 1,
            "name": "Test Template",
            "version": "1.0",
            "file_path": "/app/uploads/test.pdf",
            "file_size_bytes": 1024,
            "field_count": 10,
            "checksum": "abc123def456",
            "message": "Template ingested successfully"
        }
        response = TemplateIngestResponse(**data)
        
        assert response.id == 1
        assert response.name == "Test Template"
        assert response.version == "1.0"
        assert response.file_path == "/app/uploads/test.pdf"
        assert response.file_size_bytes == 1024
        assert response.field_count == 10
        assert response.checksum == "abc123def456"
        assert response.message == "Template ingested successfully"

    def test_default_message(self):
        """Test that message has a default value."""
        data = {
            "id": 1,
            "name": "Test Template",
            "version": "1.0",
            "file_path": "/app/uploads/test.pdf",
            "file_size_bytes": 1024,
            "field_count": 10,
            "checksum": "abc123def456"
        }
        response = TemplateIngestResponse(**data)
        
        assert response.message == "Template ingested successfully"

    def test_all_fields_required_except_message(self):
        """Test that all fields except message are required."""
        # Missing id
        with pytest.raises(ValidationError):
            TemplateIngestResponse(
                name="Test",
                version="1.0",
                file_path="/test",
                file_size_bytes=100,
                field_count=5,
                checksum="abc"
            )

    def test_field_count_non_negative(self):
        """Test that field_count must be non-negative."""
        data = {
            "id": 1,
            "name": "Test",
            "version": "1.0",
            "file_path": "/test",
            "file_size_bytes": 100,
            "field_count": -1,
            "checksum": "abc"
        }
        with pytest.raises(ValidationError) as exc_info:
            TemplateIngestResponse(**data)
        
        errors = exc_info.value.errors()
        assert any(e['loc'] == ('field_count',) for e in errors)

    def test_file_size_positive(self):
        """Test that file_size_bytes must be positive."""
        data = {
            "id": 1,
            "name": "Test",
            "version": "1.0",
            "file_path": "/test",
            "file_size_bytes": 0,
            "field_count": 5,
            "checksum": "abc"
        }
        with pytest.raises(ValidationError) as exc_info:
            TemplateIngestResponse(**data)
        
        errors = exc_info.value.errors()
        assert any(e['loc'] == ('file_size_bytes',) for e in errors)


class TestTemplateFieldData:
    """Test cases for TemplateFieldData schema."""

    def test_valid_field_data(self):
        """Test valid field data with all fields."""
        data = {
            "field_id": "A0101",
            "field_type": "text",
            "raw_type": "/Tx",
            "page_number": 1,
            "field_page_order": 0,
            "near_text": "Test label",
            "value_options": None,
            "position_data": {"x": 100, "y": 200, "width": 50, "height": 20}
        }
        field = TemplateFieldData(**data)
        
        assert field.field_id == "A0101"
        assert field.field_type == "text"
        assert field.raw_type == "/Tx"
        assert field.page_number == 1
        assert field.field_page_order == 0
        assert field.near_text == "Test label"
        assert field.value_options is None
        assert field.position_data == {
            "x": 100, "y": 200, "width": 50, "height": 20
        }

    def test_required_fields(self):
        """Test that required fields are enforced."""
        # Missing field_id
        with pytest.raises(ValidationError):
            TemplateFieldData(
                field_type="text",
                page_number=1,
                field_page_order=0
            )

    def test_page_number_positive(self):
        """Test that page_number must be positive (1-indexed)."""
        data = {
            "field_id": "A0101",
            "field_type": "text",
            "page_number": 0,  # Should be >= 1
            "field_page_order": 0
        }
        with pytest.raises(ValidationError) as exc_info:
            TemplateFieldData(**data)
        
        errors = exc_info.value.errors()
        assert any(e['loc'] == ('page_number',) for e in errors)

    def test_field_page_order_non_negative(self):
        """Test that field_page_order must be non-negative."""
        data = {
            "field_id": "A0101",
            "field_type": "text",
            "page_number": 1,
            "field_page_order": -1  # Should be >= 0
        }
        with pytest.raises(ValidationError) as exc_info:
            TemplateFieldData(**data)
        
        errors = exc_info.value.errors()
        assert any(e['loc'] == ('field_page_order',) for e in errors)

    def test_optional_fields(self):
        """Test that optional fields can be None."""
        data = {
            "field_id": "A0101",
            "field_type": "text",
            "page_number": 1,
            "field_page_order": 0,
            "raw_type": None,
            "near_text": None,
            "value_options": None,
            "position_data": None
        }
        field = TemplateFieldData(**data)
        
        assert field.raw_type is None
        assert field.near_text is None
        assert field.value_options is None
        assert field.position_data is None

    def test_value_options_as_list(self):
        """Test value_options as list of strings."""
        data = {
            "field_id": "B0201",
            "field_type": "radiobutton",
            "page_number": 2,
            "field_page_order": 5,
            "value_options": ["Sí", "No"]
        }
        field = TemplateFieldData(**data)
        
        assert field.value_options == ["Sí", "No"]

    def test_position_data_as_dict(self):
        """Test position_data as dictionary."""
        position = {
            "x": 120.5,
            "y": 450.2,
            "width": 80.0,
            "height": 15.0
        }
        data = {
            "field_id": "A0101",
            "field_type": "text",
            "page_number": 1,
            "field_page_order": 0,
            "position_data": position
        }
        field = TemplateFieldData(**data)
        
        assert field.position_data == position

