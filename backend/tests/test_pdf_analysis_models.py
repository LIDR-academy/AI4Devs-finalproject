"""
Tests for PDF template analysis Pydantic models and response structures.

Tests the data models used for the PDF analysis API endpoint including
validation, serialization, and response formatting.
"""
import pytest
from typing import List, Optional
from pydantic import ValidationError

from app.schemas.pdf_analysis import (
    TemplateField,
    AnalysisResponse,
    AnalysisMetadata,
    ErrorResponse
)


class TestTemplateField:
    """Test cases for TemplateField Pydantic model."""

    def test_template_field_creation_valid(self):
        """Test creating TemplateField with valid data."""
        field = TemplateField(
            field_id="A0101",
            type="text",
            near_text="hasta un máximo de",
            value_options=None
        )
        
        assert field.field_id == "A0101"
        assert field.type == "text"
        assert field.near_text == "hasta un máximo de"
        assert field.value_options is None

    def test_template_field_with_options(self):
        """Test TemplateField with value options for selection fields."""
        field = TemplateField(
            field_id="B0201",
            type="radiobutton",
            near_text="Seleccione una opción:",
            value_options=["Sí", "No"]
        )
        
        assert field.field_id == "B0201"
        assert field.type == "radiobutton"
        assert field.near_text == "Seleccione una opción:"
        assert field.value_options == ["Sí", "No"]
        assert len(field.value_options) == 2

    def test_template_field_listbox_with_multiple_options(self):
        """Test TemplateField with listbox type and multiple options."""
        options = ["Madrid", "Barcelona", "Valencia", "Sevilla", "Bilbao"]
        field = TemplateField(
            field_id="C0301",
            type="listbox",
            near_text="Provincia:",
            value_options=options
        )
        
        assert field.type == "listbox"
        assert field.value_options == options
        assert len(field.value_options) == 5

    def test_template_field_validation_field_id_required(self):
        """Test that field_id is required."""
        with pytest.raises(ValidationError) as exc_info:
            TemplateField(
                type="text",
                near_text="test text",
                value_options=None
            )
        
        errors = exc_info.value.errors()
        assert any(error['loc'] == ('field_id',) for error in errors)

    def test_template_field_validation_type_required(self):
        """Test that type is required."""
        with pytest.raises(ValidationError) as exc_info:
            TemplateField(
                field_id="A0101",
                near_text="test text",
                value_options=None
            )
        
        errors = exc_info.value.errors()
        assert any(error['loc'] == ('type',) for error in errors)

    def test_template_field_validation_near_text_required(self):
        """Test that near_text is required."""
        with pytest.raises(ValidationError) as exc_info:
            TemplateField(
                field_id="A0101",
                type="text",
                value_options=None
            )
        
        errors = exc_info.value.errors()
        assert any(error['loc'] == ('near_text',) for error in errors)

    def test_template_field_validation_field_id_not_empty(self):
        """Test that field_id cannot be empty string."""
        with pytest.raises(ValidationError) as exc_info:
            TemplateField(
                field_id="",
                type="text",
                near_text="test text",
                value_options=None
            )
        
        errors = exc_info.value.errors()
        assert any(error['loc'] == ('field_id',) for error in errors)

    def test_template_field_validation_type_valid_values(self):
        """Test that type must be one of the valid field types."""
        valid_types = ["text", "radiobutton", "checkbox", "listbox"]
        
        # Test valid types
        for field_type in valid_types:
            field = TemplateField(
                field_id="TEST01",
                type=field_type,
                near_text="test text",
                value_options=None
            )
            assert field.type == field_type

    def test_template_field_validation_invalid_type(self):
        """Test that invalid field type raises validation error."""
        with pytest.raises(ValidationError) as exc_info:
            TemplateField(
                field_id="A0101",
                type="invalid_type",
                near_text="test text",
                value_options=None
            )
        
        errors = exc_info.value.errors()
        assert any(error['loc'] == ('type',) for error in errors)

    def test_template_field_serialization(self):
        """Test TemplateField serialization to dictionary."""
        field = TemplateField(
            field_id="A0101",
            type="text",
            near_text="hasta un máximo de",
            value_options=None
        )
        
        data = field.model_dump()
        expected = {
            "field_id": "A0101",
            "type": "text", 
            "near_text": "hasta un máximo de",
            "value_options": None
        }
        
        assert data == expected

    def test_template_field_json_serialization(self):
        """Test TemplateField JSON serialization."""
        field = TemplateField(
            field_id="B0201",
            type="radiobutton",
            near_text="Seleccione:",
            value_options=["Sí", "No"]
        )
        
        json_data = field.model_dump_json()
        assert '"field_id":"B0201"' in json_data
        assert '"type":"radiobutton"' in json_data
        assert '"value_options":["Sí","No"]' in json_data


class TestAnalysisMetadata:
    """Test cases for AnalysisMetadata model."""

    def test_analysis_metadata_creation(self):
        """Test creating AnalysisMetadata with valid data."""
        metadata = AnalysisMetadata(
            total_fields=12,
            processing_time_ms=1250,
            document_pages=3
        )
        
        assert metadata.total_fields == 12
        assert metadata.processing_time_ms == 1250
        assert metadata.document_pages == 3

    def test_analysis_metadata_validation_positive_values(self):
        """Test that metadata fields must be positive integers."""
        # Test negative total_fields
        with pytest.raises(ValidationError):
            AnalysisMetadata(
                total_fields=-1,
                processing_time_ms=1000,
                document_pages=1
            )
        
        # Test negative processing_time_ms
        with pytest.raises(ValidationError):
            AnalysisMetadata(
                total_fields=5,
                processing_time_ms=-100,
                document_pages=1
            )
        
        # Test negative document_pages
        with pytest.raises(ValidationError):
            AnalysisMetadata(
                total_fields=5,
                processing_time_ms=1000,
                document_pages=-1
            )

    def test_analysis_metadata_zero_values(self):
        """Test AnalysisMetadata with zero values (should be valid)."""
        metadata = AnalysisMetadata(
            total_fields=0,
            processing_time_ms=0,
            document_pages=1
        )
        
        assert metadata.total_fields == 0
        assert metadata.processing_time_ms == 0
        assert metadata.document_pages == 1


class TestAnalysisResponse:
    """Test cases for AnalysisResponse model."""

    @pytest.fixture
    def sample_fields(self):
        """Sample template fields for testing."""
        return [
            TemplateField(
                field_id="A0101",
                type="text",
                near_text="hasta un máximo de",
                value_options=None
            ),
            TemplateField(
                field_id="A0102",
                type="text", 
                near_text="que suponen un",
                value_options=None
            ),
            TemplateField(
                field_id="B0201",
                type="radiobutton",
                near_text="Seleccione:",
                value_options=["Sí", "No"]
            )
        ]

    @pytest.fixture
    def sample_metadata(self):
        """Sample metadata for testing."""
        return AnalysisMetadata(
            total_fields=3,
            processing_time_ms=1250,
            document_pages=2
        )

    def test_analysis_response_creation(self, sample_fields, sample_metadata):
        """Test creating AnalysisResponse with valid data."""
        response = AnalysisResponse(
            status="success",
            data=sample_fields,
            metadata=sample_metadata
        )
        
        assert response.status == "success"
        assert len(response.data) == 3
        assert response.metadata.total_fields == 3
        assert response.metadata.processing_time_ms == 1250

    def test_analysis_response_default_status(self, sample_fields, sample_metadata):
        """Test that status defaults to 'success'."""
        response = AnalysisResponse(
            data=sample_fields,
            metadata=sample_metadata
        )
        
        assert response.status == "success"

    def test_analysis_response_empty_data(self, sample_metadata):
        """Test AnalysisResponse with empty data list."""
        response = AnalysisResponse(
            status="success",
            data=[],
            metadata=AnalysisMetadata(
                total_fields=0,
                processing_time_ms=500,
                document_pages=1
            )
        )
        
        assert response.status == "success"
        assert len(response.data) == 0
        assert response.metadata.total_fields == 0

    def test_analysis_response_serialization(self, sample_fields, sample_metadata):
        """Test AnalysisResponse serialization."""
        response = AnalysisResponse(
            status="success",
            data=sample_fields,
            metadata=sample_metadata
        )
        
        data = response.model_dump()
        
        assert data["status"] == "success"
        assert len(data["data"]) == 3
        assert data["data"][0]["field_id"] == "A0101"
        assert data["metadata"]["total_fields"] == 3

    def test_analysis_response_json_matches_specification(self, sample_fields, sample_metadata):
        """Test that JSON output matches the API specification format."""
        response = AnalysisResponse(
            status="success",
            data=sample_fields,
            metadata=sample_metadata
        )
        
        json_data = response.model_dump()
        
        # Verify structure matches specification
        assert "status" in json_data
        assert "data" in json_data
        assert "metadata" in json_data
        
        # Verify data structure
        first_field = json_data["data"][0]
        assert "field_id" in first_field
        assert "type" in first_field
        assert "near_text" in first_field
        assert "value_options" in first_field
        
        # Verify metadata structure
        metadata = json_data["metadata"]
        assert "total_fields" in metadata
        assert "processing_time_ms" in metadata
        assert "document_pages" in metadata


class TestErrorResponse:
    """Test cases for ErrorResponse model."""

    def test_error_response_creation(self):
        """Test creating ErrorResponse with valid data."""
        error = ErrorResponse(
            status="error",
            error="invalid_file_format",
            message="The uploaded file is not a valid PDF document",
            timestamp="2025-10-05T10:00:00Z"
        )
        
        assert error.status == "error"
        assert error.error == "invalid_file_format"
        assert error.message == "The uploaded file is not a valid PDF document"
        assert error.timestamp == "2025-10-05T10:00:00Z"

    def test_error_response_validation_required_fields(self):
        """Test that all error response fields are required."""
        with pytest.raises(ValidationError) as exc_info:
            ErrorResponse()
        
        errors = exc_info.value.errors()
        required_fields = {'status', 'error', 'message', 'timestamp'}
        error_fields = {error['loc'][0] for error in errors}
        
        assert required_fields.issubset(error_fields)

    def test_error_response_serialization(self):
        """Test ErrorResponse serialization."""
        error = ErrorResponse(
            status="error",
            error="file_too_large",
            message="File exceeds maximum size limit",
            timestamp="2025-10-05T10:00:00Z"
        )
        
        data = error.model_dump()
        expected = {
            "status": "error",
            "error": "file_too_large",
            "message": "File exceeds maximum size limit",
            "timestamp": "2025-10-05T10:00:00Z"
        }
        
        assert data == expected

    def test_error_response_common_error_codes(self):
        """Test ErrorResponse with common error codes from specification."""
        error_codes = [
            "invalid_file_format",
            "file_too_large", 
            "no_form_fields",
            "processing_error",
            "missing_file"
        ]
        
        for error_code in error_codes:
            error = ErrorResponse(
                status="error",
                error=error_code,
                message=f"Test message for {error_code}",
                timestamp="2025-10-05T10:00:00Z"
            )
            assert error.error == error_code


class TestModelIntegration:
    """Integration tests for model interactions."""

    def test_template_field_in_analysis_response(self):
        """Test TemplateField integration within AnalysisResponse."""
        fields = [
            TemplateField(
                field_id="A0101",
                type="text",
                near_text="hasta un máximo de",
                value_options=None
            ),
            TemplateField(
                field_id="B0201",
                type="radiobutton", 
                near_text="Seleccione:",
                value_options=["Sí", "No"]
            )
        ]
        
        metadata = AnalysisMetadata(
            total_fields=len(fields),
            processing_time_ms=800,
            document_pages=1
        )
        
        response = AnalysisResponse(
            data=fields,
            metadata=metadata
        )
        
        # Verify the response can be serialized properly
        json_data = response.model_dump_json()
        assert '"field_id":"A0101"' in json_data
        assert '"field_id":"B0201"' in json_data
        assert '"total_fields":2' in json_data

    def test_model_validation_consistency(self):
        """Test that model validation is consistent across related fields."""
        # Create response where metadata total_fields matches data length
        fields = [
            TemplateField(
                field_id="A0101",
                type="text",
                near_text="test",
                value_options=None
            )
        ]
        
        metadata = AnalysisMetadata(
            total_fields=1,  # Matches len(fields)
            processing_time_ms=500,
            document_pages=1
        )
        
        response = AnalysisResponse(
            data=fields,
            metadata=metadata
        )
        
        assert len(response.data) == response.metadata.total_fields
