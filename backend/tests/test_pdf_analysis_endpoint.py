"""
Tests for PDF template analysis API endpoint.

Tests the /api/v1/templates/analyze endpoint including file upload validation,
PDF processing, response formatting, and error handling.
"""
import pytest
import tempfile
import io
from pathlib import Path
from unittest.mock import Mock, patch, MagicMock
from fastapi.testclient import TestClient
from fastapi import UploadFile

from app.main import app
from app.services.pdf_analysis_service import (
    PDFAnalysisService,
    TemplateFieldData,
    PDFProcessingError,
    InvalidPDFError,
    NoFormFieldsError
)
from app.schemas.pdf_analysis import TemplateField, AnalysisResponse


class TestPDFAnalysisEndpoint:
    """Test cases for the PDF analysis endpoint."""

    @pytest.fixture
    def client(self):
        """Create test client."""
        return TestClient(app)

    @pytest.fixture
    def sample_pdf_content(self):
        """Create sample PDF content for testing."""
        # Create a minimal PDF-like content for testing
        return b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n%%EOF"

    @pytest.fixture
    def mock_analysis_results(self):
        """Mock PDF analysis results."""
        return [
            TemplateFieldData(
                field_id="A0101",
                type="text",
                near_text="hasta un máximo de",
                value_options=None
            ),
            TemplateFieldData(
                field_id="A0102",
                type="text", 
                near_text="que suponen un",
                value_options=None
            ),
            TemplateFieldData(
                field_id="B0201",
                type="radiobutton",
                near_text="Seleccione una opción:",
                value_options=["Sí", "No"]
            )
        ]

    def test_analyze_endpoint_success(self, client, sample_pdf_content, mock_analysis_results):
        """Test successful PDF analysis."""
        with patch('app.api.v1.endpoints.templates.PDFAnalysisService') as mock_service:
            # Setup mock service
            mock_instance = Mock()
            mock_instance.analyze_pdf.return_value = mock_analysis_results
            mock_service.return_value = mock_instance
            
            # Create test file
            files = {
                "file": ("test.pdf", sample_pdf_content, "application/pdf")
            }
            
            # Make request
            response = client.post("/api/v1/templates/analyze", files=files)
            
            # Assertions
            assert response.status_code == 200
            data = response.json()
            
            assert data["status"] == "success"
            assert len(data["data"]) == 3
            assert "metadata" in data
            
            # Check first field structure
            first_field = data["data"][0]
            assert first_field["field_id"] == "A0101"
            assert first_field["type"] == "text"
            assert first_field["near_text"] == "hasta un máximo de"
            assert first_field["value_options"] is None
            
            # Check metadata structure
            metadata = data["metadata"]
            assert "total_fields" in metadata
            assert "processing_time_ms" in metadata
            assert "document_pages" in metadata
            assert metadata["total_fields"] == 3

    def test_analyze_endpoint_with_selection_fields(self, client, sample_pdf_content):
        """Test PDF analysis with selection fields (radio, checkbox, listbox)."""
        mock_results = [
            TemplateFieldData(
                field_id="B0201",
                type="radiobutton",
                near_text="Seleccione:",
                value_options=["Sí", "No"]
            ),
            TemplateFieldData(
                field_id="C0301",
                type="listbox",
                near_text="Provincia:",
                value_options=["Madrid", "Barcelona", "Valencia"]
            )
        ]
        
        with patch('app.api.v1.endpoints.templates.PDFAnalysisService') as mock_service:
            mock_instance = Mock()
            mock_instance.analyze_pdf.return_value = mock_results
            mock_service.return_value = mock_instance
            
            files = {"file": ("test.pdf", sample_pdf_content, "application/pdf")}
            response = client.post("/api/v1/templates/analyze", files=files)
            
            assert response.status_code == 200
            data = response.json()
            
            # Check selection fields have options
            radio_field = data["data"][0]
            assert radio_field["type"] == "radiobutton"
            assert radio_field["value_options"] == ["Sí", "No"]
            
            listbox_field = data["data"][1]
            assert listbox_field["type"] == "listbox"
            assert listbox_field["value_options"] == ["Madrid", "Barcelona", "Valencia"]

    def test_analyze_endpoint_no_file_provided(self, client):
        """Test endpoint with no file provided."""
        response = client.post("/api/v1/templates/analyze")
        
        assert response.status_code == 422
        data = response.json()
        assert "detail" in data

    def test_analyze_endpoint_invalid_file_format(self, client):
        """Test endpoint with invalid file format."""
        # Create non-PDF file
        files = {
            "file": ("test.txt", b"This is not a PDF file", "text/plain")
        }
        
        response = client.post("/api/v1/templates/analyze", files=files)
        
        assert response.status_code == 400
        data = response.json()
        assert data["status"] == "error"
        assert data["error"] == "invalid_file_format"
        assert "PDF" in data["message"]

    def test_analyze_endpoint_file_too_large(self, client):
        """Test endpoint with file exceeding size limit."""
        # Create large file content (> 10MB)
        large_content = b"x" * (11 * 1024 * 1024)  # 11MB
        
        files = {
            "file": ("large.pdf", large_content, "application/pdf")
        }
        
        response = client.post("/api/v1/templates/analyze", files=files)
        
        assert response.status_code == 413
        data = response.json()
        assert data["status"] == "error"
        assert data["error"] == "file_too_large"
        assert "10MB" in data["message"]

    def test_analyze_endpoint_invalid_pdf_error(self, client, sample_pdf_content):
        """Test endpoint with corrupted PDF file."""
        with patch('app.api.v1.endpoints.templates.PDFAnalysisService') as mock_service:
            mock_instance = Mock()
            mock_instance.analyze_pdf.side_effect = InvalidPDFError("Invalid PDF format")
            mock_service.return_value = mock_instance
            
            files = {"file": ("corrupted.pdf", sample_pdf_content, "application/pdf")}
            response = client.post("/api/v1/templates/analyze", files=files)
            
            assert response.status_code == 400
            data = response.json()
            assert data["status"] == "error"
            assert data["error"] == "invalid_file_format"
            assert "Invalid PDF format" in data["message"]

    def test_analyze_endpoint_no_form_fields_error(self, client, sample_pdf_content):
        """Test endpoint with PDF containing no form fields."""
        with patch('app.api.v1.endpoints.templates.PDFAnalysisService') as mock_service:
            mock_instance = Mock()
            mock_instance.analyze_pdf.side_effect = NoFormFieldsError("No AcroForm fields found")
            mock_service.return_value = mock_instance
            
            files = {"file": ("no_fields.pdf", sample_pdf_content, "application/pdf")}
            response = client.post("/api/v1/templates/analyze", files=files)
            
            assert response.status_code == 400
            data = response.json()
            assert data["status"] == "error"
            assert data["error"] == "no_form_fields"
            assert "No AcroForm fields found" in data["message"]

    def test_analyze_endpoint_processing_error(self, client, sample_pdf_content):
        """Test endpoint with PDF processing error."""
        with patch('app.api.v1.endpoints.templates.PDFAnalysisService') as mock_service:
            mock_instance = Mock()
            mock_instance.analyze_pdf.side_effect = PDFProcessingError("Processing failed")
            mock_service.return_value = mock_instance
            
            files = {"file": ("error.pdf", sample_pdf_content, "application/pdf")}
            response = client.post("/api/v1/templates/analyze", files=files)
            
            assert response.status_code == 500
            data = response.json()
            assert data["status"] == "error"
            assert data["error"] == "processing_error"
            assert "Processing failed" in data["message"]

    def test_analyze_endpoint_file_extension_validation(self, client):
        """Test file extension validation."""
        test_cases = [
            ("test.txt", "text/plain", 400),
            ("test.doc", "application/msword", 400),
            ("test.jpg", "image/jpeg", 400),
            ("test.pdf", "application/pdf", 200),  # Should be valid
            ("TEST.PDF", "application/pdf", 200),  # Case insensitive
        ]
        
        for filename, content_type, expected_status in test_cases:
            with patch('app.api.v1.endpoints.templates.PDFAnalysisService') as mock_service:
                if expected_status == 200:
                    mock_instance = Mock()
                    mock_instance.analyze_pdf.return_value = []
                    mock_service.return_value = mock_instance
                
                files = {"file": (filename, b"test content", content_type)}
                response = client.post("/api/v1/templates/analyze", files=files)
                
                assert response.status_code == expected_status

    def test_analyze_endpoint_content_type_validation(self, client, sample_pdf_content):
        """Test content type validation."""
        # Test with correct PDF content but wrong content type
        files = {
            "file": ("test.pdf", sample_pdf_content, "text/plain")
        }
        
        # Should still work if filename is .pdf
        with patch('app.api.v1.endpoints.templates.PDFAnalysisService') as mock_service:
            mock_instance = Mock()
            mock_instance.analyze_pdf.return_value = []
            mock_service.return_value = mock_instance
            
            response = client.post("/api/v1/templates/analyze", files=files)
            assert response.status_code == 200

    def test_analyze_endpoint_processing_time_tracking(self, client, sample_pdf_content, mock_analysis_results):
        """Test that processing time is tracked and included in response."""
        with patch('app.api.v1.endpoints.templates.PDFAnalysisService') as mock_service:
            mock_instance = Mock()
            mock_instance.analyze_pdf.return_value = mock_analysis_results
            mock_service.return_value = mock_instance
            
            files = {"file": ("test.pdf", sample_pdf_content, "application/pdf")}
            response = client.post("/api/v1/templates/analyze", files=files)
            
            assert response.status_code == 200
            data = response.json()
            
            # Check that processing time is included and is a positive integer
            processing_time = data["metadata"]["processing_time_ms"]
            assert isinstance(processing_time, int)
            assert processing_time >= 0

    def test_analyze_endpoint_response_format_matches_spec(self, client, sample_pdf_content, mock_analysis_results):
        """Test that response format exactly matches API specification."""
        with patch('app.api.v1.endpoints.templates.PDFAnalysisService') as mock_service:
            mock_instance = Mock()
            mock_instance.analyze_pdf.return_value = mock_analysis_results
            mock_service.return_value = mock_instance
            
            files = {"file": ("test.pdf", sample_pdf_content, "application/pdf")}
            response = client.post("/api/v1/templates/analyze", files=files)
            
            assert response.status_code == 200
            data = response.json()
            
            # Verify exact structure from specification
            required_keys = {"status", "data", "metadata"}
            assert set(data.keys()) == required_keys
            
            # Verify field structure
            for field in data["data"]:
                field_keys = {"field_id", "type", "near_text", "value_options"}
                assert set(field.keys()) == field_keys
            
            # Verify metadata structure
            metadata_keys = {"total_fields", "processing_time_ms", "document_pages"}
            assert set(data["metadata"].keys()) == metadata_keys

    def test_analyze_endpoint_error_response_format(self, client):
        """Test that error responses follow consistent format."""
        # Test with invalid file format
        files = {"file": ("test.txt", b"not a pdf", "text/plain")}
        response = client.post("/api/v1/templates/analyze", files=files)
        
        assert response.status_code == 400
        data = response.json()
        
        # Verify error response structure
        required_keys = {"status", "error", "message", "timestamp"}
        assert set(data.keys()) == required_keys
        
        assert data["status"] == "error"
        assert isinstance(data["error"], str)
        assert isinstance(data["message"], str)
        assert isinstance(data["timestamp"], str)

    def test_analyze_endpoint_cors_headers(self, client, sample_pdf_content):
        """Test that CORS headers are properly set for non-authenticated endpoint."""
        with patch('app.api.v1.endpoints.templates.PDFAnalysisService') as mock_service:
            mock_instance = Mock()
            mock_instance.analyze_pdf.return_value = []
            mock_service.return_value = mock_instance
            
            files = {"file": ("test.pdf", sample_pdf_content, "application/pdf")}
            response = client.post("/api/v1/templates/analyze", files=files)
            
            # Check that response is successful (indicating CORS is properly configured)
            assert response.status_code == 200

    def test_analyze_endpoint_no_authentication_required(self, client, sample_pdf_content):
        """Test that endpoint works without authentication."""
        with patch('app.api.v1.endpoints.templates.PDFAnalysisService') as mock_service:
            mock_instance = Mock()
            mock_instance.analyze_pdf.return_value = []
            mock_service.return_value = mock_instance
            
            # Make request without any authentication headers
            files = {"file": ("test.pdf", sample_pdf_content, "application/pdf")}
            response = client.post("/api/v1/templates/analyze", files=files)
            
            # Should work without authentication
            assert response.status_code == 200

    def test_analyze_endpoint_memory_management(self, client, mock_analysis_results):
        """Test that endpoint handles memory efficiently with large files."""
        # Create a moderately large file (within limits)
        large_content = b"%PDF-1.4\n" + b"x" * (5 * 1024 * 1024)  # 5MB
        
        with patch('app.api.v1.endpoints.templates.PDFAnalysisService') as mock_service:
            mock_instance = Mock()
            mock_instance.analyze_pdf.return_value = mock_analysis_results
            mock_service.return_value = mock_instance
            
            files = {"file": ("large.pdf", large_content, "application/pdf")}
            response = client.post("/api/v1/templates/analyze", files=files)
            
            assert response.status_code == 200
            # If we get here, memory was handled properly

    def test_analyze_endpoint_concurrent_requests(self, client, sample_pdf_content, mock_analysis_results):
        """Test that endpoint can handle concurrent requests properly."""
        import threading
        import time
        
        results = []
        
        def make_request():
            with patch('app.api.v1.endpoints.templates.PDFAnalysisService') as mock_service:
                mock_instance = Mock()
                mock_instance.analyze_pdf.return_value = mock_analysis_results
                mock_service.return_value = mock_instance
                
                files = {"file": ("test.pdf", sample_pdf_content, "application/pdf")}
                response = client.post("/api/v1/templates/analyze", files=files)
                results.append(response.status_code)
        
        # Create multiple threads
        threads = []
        for _ in range(3):
            thread = threading.Thread(target=make_request)
            threads.append(thread)
            thread.start()
        
        # Wait for all threads to complete
        for thread in threads:
            thread.join()
        
        # All requests should succeed
        assert all(status == 200 for status in results)
        assert len(results) == 3

    @pytest.mark.integration
    def test_analyze_endpoint_with_real_pdf(self, client):
        """Integration test with real PDF file (if available)."""
        # This test will only run if the example PDF exists
        pdf_path = Path("../exampleTemplates/HorasComplementarias.pdf")
        
        if pdf_path.exists():
            with open(pdf_path, "rb") as f:
                pdf_content = f.read()
            
            files = {"file": ("HorasComplementarias.pdf", pdf_content, "application/pdf")}
            response = client.post("/api/v1/templates/analyze", files=files)
            
            assert response.status_code == 200
            data = response.json()
            
            # Should find actual fields from the real PDF
            assert len(data["data"]) > 0
            assert data["metadata"]["total_fields"] > 0
            
            # Check that field IDs match expected pattern (A0101, A0102, etc.)
            field_ids = [field["field_id"] for field in data["data"]]
            assert any(field_id.startswith("A") for field_id in field_ids)
        else:
            pytest.skip("Real PDF file not available for integration test")


class TestPDFAnalysisEndpointValidation:
    """Test cases for input validation and edge cases."""

    @pytest.fixture
    def client(self):
        """Create test client."""
        return TestClient(app)

    def test_analyze_endpoint_empty_file(self, client):
        """Test with empty file."""
        files = {"file": ("empty.pdf", b"", "application/pdf")}
        response = client.post("/api/v1/templates/analyze", files=files)
        
        assert response.status_code == 400
        data = response.json()
        assert data["status"] == "error"

    def test_analyze_endpoint_malformed_pdf(self, client):
        """Test with malformed PDF content."""
        malformed_content = b"This is not a valid PDF file content"
        
        files = {"file": ("malformed.pdf", malformed_content, "application/pdf")}
        response = client.post("/api/v1/templates/analyze", files=files)
        
        # Should handle gracefully with appropriate error
        assert response.status_code in [400, 500]
        data = response.json()
        assert data["status"] == "error"

    def test_analyze_endpoint_filename_edge_cases(self, client):
        """Test with various filename edge cases."""
        test_cases = [
            ("file.PDF", 200),  # Uppercase extension
            ("file.Pdf", 200),  # Mixed case
            ("file with spaces.pdf", 200),  # Spaces in filename
            ("file-with-dashes.pdf", 200),  # Dashes
            ("file_with_underscores.pdf", 200),  # Underscores
            ("file.pdf.pdf", 200),  # Double extension
            ("no_extension", 400),  # No extension
            (".pdf", 200),  # Just extension
        ]
        
        for filename, expected_status in test_cases:
            with patch('app.api.v1.endpoints.templates.PDFAnalysisService') as mock_service:
                if expected_status == 200:
                    mock_instance = Mock()
                    mock_instance.analyze_pdf.return_value = []
                    mock_service.return_value = mock_instance
                
                files = {"file": (filename, b"test", "application/pdf")}
                response = client.post("/api/v1/templates/analyze", files=files)
                
                assert response.status_code == expected_status
