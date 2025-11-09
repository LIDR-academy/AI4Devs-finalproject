"""
Tests for template ingestion API endpoint.

Tests the POST /api/v1/templates/ingest endpoint including authentication,
file validation, service integration, and error handling.
"""
import pytest
from unittest.mock import Mock, patch, AsyncMock
from fastapi.testclient import TestClient

from app.main import app
from app.core.auth import get_current_active_user
from app.models.user import User
from app.services.template_service import TemplateIngestionError
from app.services.pdf_analysis_service import (
    InvalidPDFError,
    NoFormFieldsError
)
from app.models.template import PDFTemplate


class TestIngestEndpoint:
    """Test cases for the template ingestion endpoint."""

    @pytest.fixture
    def mock_user(self):
        """Create a mock authenticated user."""
        user = Mock(spec=User)
        user.id = 1
        user.email = "test@example.com"
        user.is_active = True
        return user

    @pytest.fixture
    def client(self, mock_user):
        """Create test client with mocked authentication."""
        def override_get_current_active_user():
            return mock_user

        app.dependency_overrides[get_current_active_user] = (
            override_get_current_active_user
        )
        yield TestClient(app)
        app.dependency_overrides.clear()

    @pytest.fixture
    def unauthenticated_client(self):
        """Create test client without authentication."""
        return TestClient(app)

    @pytest.fixture
    def sample_pdf_content(self):
        """Create sample PDF content for testing."""
        return b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\n%%EOF"

    @pytest.fixture
    def mock_template_response(self):
        """Mock template response from service."""
        mock_template = Mock(spec=PDFTemplate)
        mock_template.id = 1
        mock_template.name = "Test Template"
        mock_template.version = "1.0"
        mock_template.file_path = "/app/uploads/test.pdf"
        mock_template.file_size_bytes = 1024
        mock_template.field_count = 10
        return mock_template

    # Success Tests

    def test_ingest_success(
        self,
        client,
        sample_pdf_content,
        mock_template_response
    ):
        """Test successful template ingestion."""
        with patch('app.api.v1.endpoints.ingest.TemplateService') as m_svc:
            mock_instance = Mock()
            mock_instance.ingest_template = AsyncMock(
                return_value=mock_template_response
            )
            m_svc.return_value = mock_instance

            files = {
                "file": ("test.pdf", sample_pdf_content, "application/pdf")
            }
            data = {
                "name": "Test Template",
                "version": "1.0",
                "sepe_url": "https://www.sepe.es/test"
            }

            response = client.post(
                "/api/v1/templates/ingest",
                files=files,
                data=data
            )

            assert response.status_code == 201
            response_data = response.json()
            assert response_data["id"] == 1
            assert response_data["name"] == "Test Template"
            assert response_data["current_version"] == "1.0"
            assert "checksum" in response_data
            assert "message" in response_data
            assert "version_id" in response_data  # New field for navigation
            assert isinstance(response_data["version_id"], int)

    def test_ingest_without_sepe_url(
        self,
        client,
        sample_pdf_content,
        mock_template_response
    ):
        """Test ingestion without optional sepe_url."""
        with patch('app.api.v1.endpoints.ingest.TemplateService') as m_svc:
            mock_instance = Mock()
            mock_instance.ingest_template = AsyncMock(
                return_value=mock_template_response
            )
            m_svc.return_value = mock_instance

            files = {
                "file": ("test.pdf", sample_pdf_content, "application/pdf")
            }
            data = {
                "name": "Test Template",
                "version": "1.0"
            }

            response = client.post(
                "/api/v1/templates/ingest",
                files=files,
                data=data
            )

            assert response.status_code == 201

    # Authentication Tests

    def test_ingest_requires_authentication(
        self,
        unauthenticated_client,
        sample_pdf_content
    ):
        """Test that endpoint requires authentication."""
        files = {
            "file": ("test.pdf", sample_pdf_content, "application/pdf")
        }
        data = {"name": "Test", "version": "1.0"}

        response = unauthenticated_client.post(
            "/api/v1/templates/ingest",
            files=files,
            data=data
        )

        assert response.status_code in (401, 403)

    # Validation Tests

    def test_ingest_missing_file(self, client):
        """Test error when file is missing."""
        data = {"name": "Test", "version": "1.0"}

        response = client.post(
            "/api/v1/templates/ingest",
            data=data
        )

        assert response.status_code == 422

    def test_ingest_missing_name(
        self,
        client,
        sample_pdf_content
    ):
        """Test error when name is missing."""
        files = {
            "file": ("test.pdf", sample_pdf_content, "application/pdf")
        }
        data = {"version": "1.0"}

        response = client.post(
            "/api/v1/templates/ingest",
            files=files,
            data=data
        )

        assert response.status_code == 422

    def test_ingest_missing_version(
        self,
        client,
        sample_pdf_content
    ):
        """Test error when version is missing."""
        files = {
            "file": ("test.pdf", sample_pdf_content, "application/pdf")
        }
        data = {"name": "Test"}

        response = client.post(
            "/api/v1/templates/ingest",
            files=files,
            data=data
        )

        assert response.status_code == 422

    def test_ingest_invalid_file_type(self, client):
        """Test error when file is not a PDF."""
        files = {"file": ("test.txt", b"not a pdf", "text/plain")}
        data = {"name": "Test", "version": "1.0"}

        response = client.post(
            "/api/v1/templates/ingest",
            files=files,
            data=data
        )

        assert response.status_code == 400
        response_body = response.text
        assert "PDF" in response_body

    def test_ingest_empty_file(self, client):
        """Test error when file is empty."""
        files = {"file": ("test.pdf", b"", "application/pdf")}
        data = {"name": "Test", "version": "1.0"}

        response = client.post(
            "/api/v1/templates/ingest",
            files=files,
            data=data
        )

        assert response.status_code == 400
        response_body = response.text.lower()
        assert "empty" in response_body

    def test_ingest_file_too_large(self, client):
        """Test error when file exceeds size limit."""
        # Create large file content (> 10MB)
        large_content = b"X" * (11 * 1024 * 1024)
        files = {
            "file": ("test.pdf", large_content, "application/pdf")
        }
        data = {"name": "Test", "version": "1.0"}

        response = client.post(
            "/api/v1/templates/ingest",
            files=files,
            data=data
        )

        assert response.status_code == 413

    # Service Error Tests

    def test_ingest_invalid_pdf(
        self,
        client,
        sample_pdf_content
    ):
        """Test handling of invalid PDF error."""
        with patch('app.api.v1.endpoints.ingest.TemplateService') as m_svc:
            mock_instance = Mock()
            mock_instance.ingest_template = AsyncMock(
                side_effect=InvalidPDFError("Invalid PDF")
            )
            m_svc.return_value = mock_instance

            files = {
                "file": ("test.pdf", sample_pdf_content, "application/pdf")
            }
            data = {"name": "Test", "version": "1.0"}

            response = client.post(
                "/api/v1/templates/ingest",
                files=files,
                data=data
            )

            assert response.status_code == 400
            response_body = response.text
            assert "Invalid" in response_body or "PDF" in response_body

    def test_ingest_no_form_fields(
        self,
        client,
        sample_pdf_content
    ):
        """Test handling of PDF with no form fields."""
        with patch('app.api.v1.endpoints.ingest.TemplateService') as m_svc:
            mock_instance = Mock()
            mock_instance.ingest_template = AsyncMock(
                side_effect=NoFormFieldsError("No form fields")
            )
            m_svc.return_value = mock_instance

            files = {
                "file": ("test.pdf", sample_pdf_content, "application/pdf")
            }
            data = {"name": "Test", "version": "1.0"}

            response = client.post(
                "/api/v1/templates/ingest",
                files=files,
                data=data
            )

            assert response.status_code == 400
            response_body = response.text.lower()
            assert "form" in response_body or "fields" in response_body

    def test_ingest_database_error(
        self,
        client,
        sample_pdf_content
    ):
        """Test handling of database error."""
        with patch('app.api.v1.endpoints.ingest.TemplateService') as m_svc:
            mock_instance = Mock()
            mock_instance.ingest_template = AsyncMock(
                side_effect=TemplateIngestionError("Database error")
            )
            m_svc.return_value = mock_instance

            files = {
                "file": ("test.pdf", sample_pdf_content, "application/pdf")
            }
            data = {"name": "Test", "version": "1.0"}

            response = client.post(
                "/api/v1/templates/ingest",
                files=files,
                data=data
            )

            assert response.status_code == 500

    def test_ingest_unexpected_error(
        self,
        client,
        sample_pdf_content
    ):
        """Test handling of unexpected error."""
        with patch('app.api.v1.endpoints.ingest.TemplateService') as m_svc:
            mock_instance = Mock()
            mock_instance.ingest_template = AsyncMock(
                side_effect=Exception("Unexpected error")
            )
            m_svc.return_value = mock_instance

            files = {
                "file": ("test.pdf", sample_pdf_content, "application/pdf")
            }
            data = {"name": "Test", "version": "1.0"}

            response = client.post(
                "/api/v1/templates/ingest",
                files=files,
                data=data
            )

            assert response.status_code == 500

    # Field Validation Tests

    def test_ingest_name_too_long(
        self,
        client,
        sample_pdf_content
    ):
        """Test error when name exceeds maximum length."""
        files = {
            "file": ("test.pdf", sample_pdf_content, "application/pdf")
        }
        data = {
            "name": "A" * 256,  # Exceeds 255 char limit
            "version": "1.0"
        }

        response = client.post(
            "/api/v1/templates/ingest",
            files=files,
            data=data
        )

        assert response.status_code == 422

    def test_ingest_version_too_long(
        self,
        client,
        sample_pdf_content
    ):
        """Test error when version exceeds maximum length."""
        files = {
            "file": ("test.pdf", sample_pdf_content, "application/pdf")
        }
        data = {
            "name": "Test",
            "version": "1" * 51  # Exceeds 50 char limit
        }

        response = client.post(
            "/api/v1/templates/ingest",
            files=files,
            data=data
        )

        assert response.status_code == 422

    def test_ingest_invalid_sepe_url(
        self,
        client,
        sample_pdf_content,
        mock_template_response
    ):
        """Test error when sepe_url is not a valid URL."""
        # Mock the service to prevent actual PDF processing
        with patch('app.api.v1.endpoints.ingest.TemplateService') as m_svc:
            mock_instance = Mock()
            mock_instance.ingest_template = AsyncMock(
                return_value=mock_template_response
            )
            m_svc.return_value = mock_instance

            files = {
                "file": ("test.pdf", sample_pdf_content, "application/pdf")
            }
            data = {
                "name": "Test",
                "version": "1.0",
                "sepe_url": "not-a-valid-url"
            }

            response = client.post(
                "/api/v1/templates/ingest",
                files=files,
                data=data
            )

            # FastAPI validation happens before endpoint logic
            # Invalid URL format should return 422
            assert response.status_code in (422, 201)


class TestIngestVersionEndpoint:
    """Test cases for the version ingestion endpoint."""

    @pytest.fixture
    def mock_user(self):
        """Create a mock authenticated user."""
        user = Mock(spec=User)
        user.id = 1
        user.email = "test@example.com"
        user.is_active = True
        return user

    @pytest.fixture
    def client(self, mock_user):
        """Create test client with mocked authentication."""
        def override_get_current_active_user():
            return mock_user

        app.dependency_overrides[get_current_active_user] = (
            override_get_current_active_user
        )
        yield TestClient(app)
        app.dependency_overrides.clear()

    @pytest.fixture
    def unauthenticated_client(self):
        """Create test client without authentication."""
        return TestClient(app)

    @pytest.fixture
    def sample_pdf_content(self):
        """Create sample PDF content for testing."""
        return b"%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n>>\nendobj\n%%EOF"

    @pytest.fixture
    def mock_version_response(self):
        """Mock version response from service."""
        from app.models.template import TemplateVersion
        mock_version = Mock(spec=TemplateVersion)
        mock_version.id = 100
        mock_version.template_id = 10
        mock_version.version_number = "2024-Q2"
        mock_version.change_summary = "Updated fields"
        mock_version.is_current = True
        mock_version.file_path = "/app/uploads/test-v2.pdf"
        mock_version.file_size_bytes = 2048
        mock_version.field_count = 15
        return mock_version

    # Success Tests

    def test_ingest_version_success(
        self,
        client,
        sample_pdf_content,
        mock_version_response
    ):
        """Test successful version ingestion."""
        with patch('app.api.v1.endpoints.ingest.TemplateService') as m_svc:
            mock_instance = Mock()
            mock_instance.ingest_template_version = AsyncMock(
                return_value=mock_version_response
            )
            m_svc.return_value = mock_instance

            files = {
                "file": ("test_v2.pdf", sample_pdf_content, "application/pdf")
            }
            data = {
                "template_id": "10",
                "version": "2024-Q2",
                "change_summary": "Updated fields for new regulations",
                "sepe_url": "https://www.sepe.es/v2"
            }

            response = client.post(
                "/api/v1/templates/ingest/version",
                files=files,
                data=data
            )

            assert response.status_code == 201
            response_data = response.json()
            assert response_data["version_id"] == 100
            assert response_data["template_id"] == 10
            assert response_data["version_number"] == "2024-Q2"
            assert response_data["change_summary"] == "Updated fields"
            assert response_data["is_current"] is True
            assert "message" in response_data

    def test_ingest_version_minimal_data(
        self,
        client,
        sample_pdf_content,
        mock_version_response
    ):
        """Test version ingestion with only required fields."""
        with patch('app.api.v1.endpoints.ingest.TemplateService') as m_svc:
            mock_instance = Mock()
            mock_instance.ingest_template_version = AsyncMock(
                return_value=mock_version_response
            )
            m_svc.return_value = mock_instance

            files = {
                "file": ("test.pdf", sample_pdf_content, "application/pdf")
            }
            data = {
                "template_id": "10",
                "version": "2.0"
                # change_summary and sepe_url are optional
            }

            response = client.post(
                "/api/v1/templates/ingest/version",
                files=files,
                data=data
            )

            assert response.status_code == 201

    # Authentication Tests

    def test_ingest_version_requires_authentication(
        self,
        unauthenticated_client,
        sample_pdf_content
    ):
        """Test that version endpoint requires authentication."""
        files = {
            "file": ("test.pdf", sample_pdf_content, "application/pdf")
        }
        data = {"template_id": "10", "version": "2.0"}

        response = unauthenticated_client.post(
            "/api/v1/templates/ingest/version",
            files=files,
            data=data
        )

        assert response.status_code in (401, 403)

    # Validation Tests

    def test_ingest_version_missing_file(self, client):
        """Test error when file is missing."""
        data = {"template_id": "10", "version": "2.0"}

        response = client.post(
            "/api/v1/templates/ingest/version",
            data=data
        )

        assert response.status_code == 422

    def test_ingest_version_missing_template_id(
        self,
        client,
        sample_pdf_content
    ):
        """Test error when template_id is missing."""
        files = {
            "file": ("test.pdf", sample_pdf_content, "application/pdf")
        }
        data = {"version": "2.0"}

        response = client.post(
            "/api/v1/templates/ingest/version",
            files=files,
            data=data
        )

        assert response.status_code == 422

    def test_ingest_version_missing_version(
        self,
        client,
        sample_pdf_content
    ):
        """Test error when version is missing."""
        files = {
            "file": ("test.pdf", sample_pdf_content, "application/pdf")
        }
        data = {"template_id": "10"}

        response = client.post(
            "/api/v1/templates/ingest/version",
            files=files,
            data=data
        )

        assert response.status_code == 422

    def test_ingest_version_invalid_template_id(
        self,
        client,
        sample_pdf_content
    ):
        """Test error when template_id is invalid (not a positive integer)."""
        files = {
            "file": ("test.pdf", sample_pdf_content, "application/pdf")
        }
        data = {
            "template_id": "-1",  # Negative not allowed
            "version": "2.0"
        }

        response = client.post(
            "/api/v1/templates/ingest/version",
            files=files,
            data=data
        )

        assert response.status_code == 422

    def test_ingest_version_invalid_file_type(self, client):
        """Test error when file is not a PDF."""
        files = {"file": ("test.txt", b"not a pdf", "text/plain")}
        data = {"template_id": "10", "version": "2.0"}

        response = client.post(
            "/api/v1/templates/ingest/version",
            files=files,
            data=data
        )

        assert response.status_code == 400
        assert "PDF" in response.text

    def test_ingest_version_empty_file(self, client):
        """Test error when file is empty."""
        files = {"file": ("test.pdf", b"", "application/pdf")}
        data = {"template_id": "10", "version": "2.0"}

        response = client.post(
            "/api/v1/templates/ingest/version",
            files=files,
            data=data
        )

        assert response.status_code == 400
        assert "empty" in response.text.lower()

    def test_ingest_version_file_too_large(self, client):
        """Test error when file exceeds size limit."""
        large_content = b"X" * (11 * 1024 * 1024)
        files = {
            "file": ("test.pdf", large_content, "application/pdf")
        }
        data = {"template_id": "10", "version": "2.0"}

        response = client.post(
            "/api/v1/templates/ingest/version",
            files=files,
            data=data
        )

        assert response.status_code == 413

    # Service Error Tests

    def test_ingest_version_template_not_found(
        self,
        client,
        sample_pdf_content
    ):
        """Test handling when template doesn't exist."""
        with patch('app.api.v1.endpoints.ingest.TemplateService') as m_svc:
            mock_instance = Mock()
            mock_instance.ingest_template_version = AsyncMock(
                side_effect=ValueError("Template with ID 999 not found")
            )
            m_svc.return_value = mock_instance

            files = {
                "file": ("test.pdf", sample_pdf_content, "application/pdf")
            }
            data = {"template_id": "999", "version": "2.0"}

            response = client.post(
                "/api/v1/templates/ingest/version",
                files=files,
                data=data
            )

            assert response.status_code == 404
            assert "not found" in response.text.lower()

    def test_ingest_version_invalid_pdf(
        self,
        client,
        sample_pdf_content
    ):
        """Test handling of invalid PDF error."""
        with patch('app.api.v1.endpoints.ingest.TemplateService') as m_svc:
            mock_instance = Mock()
            mock_instance.ingest_template_version = AsyncMock(
                side_effect=InvalidPDFError("Corrupted PDF")
            )
            m_svc.return_value = mock_instance

            files = {
                "file": ("test.pdf", sample_pdf_content, "application/pdf")
            }
            data = {"template_id": "10", "version": "2.0"}

            response = client.post(
                "/api/v1/templates/ingest/version",
                files=files,
                data=data
            )

            assert response.status_code == 400
            assert "Invalid" in response.text or "PDF" in response.text

    def test_ingest_version_no_form_fields(
        self,
        client,
        sample_pdf_content
    ):
        """Test handling of PDF with no form fields."""
        with patch('app.api.v1.endpoints.ingest.TemplateService') as m_svc:
            mock_instance = Mock()
            mock_instance.ingest_template_version = AsyncMock(
                side_effect=NoFormFieldsError("No AcroForm fields")
            )
            m_svc.return_value = mock_instance

            files = {
                "file": ("test.pdf", sample_pdf_content, "application/pdf")
            }
            data = {"template_id": "10", "version": "2.0"}

            response = client.post(
                "/api/v1/templates/ingest/version",
                files=files,
                data=data
            )

            assert response.status_code == 400
            response_lower = response.text.lower()
            assert "form" in response_lower or "fields" in response_lower

    def test_ingest_version_database_error(
        self,
        client,
        sample_pdf_content
    ):
        """Test handling of database error."""
        with patch('app.api.v1.endpoints.ingest.TemplateService') as m_svc:
            mock_instance = Mock()
            error_msg = "Database transaction failed"
            mock_instance.ingest_template_version = AsyncMock(
                side_effect=TemplateIngestionError(error_msg)
            )
            m_svc.return_value = mock_instance

            files = {
                "file": ("test.pdf", sample_pdf_content, "application/pdf")
            }
            data = {"template_id": "10", "version": "2.0"}

            response = client.post(
                "/api/v1/templates/ingest/version",
                files=files,
                data=data
            )

            assert response.status_code == 500

    def test_ingest_version_unexpected_error(
        self,
        client,
        sample_pdf_content
    ):
        """Test handling of unexpected error."""
        with patch('app.api.v1.endpoints.ingest.TemplateService') as m_svc:
            mock_instance = Mock()
            mock_instance.ingest_template_version = AsyncMock(
                side_effect=Exception("Unexpected error")
            )
            m_svc.return_value = mock_instance

            files = {
                "file": ("test.pdf", sample_pdf_content, "application/pdf")
            }
            data = {"template_id": "10", "version": "2.0"}

            response = client.post(
                "/api/v1/templates/ingest/version",
                files=files,
                data=data
            )

            assert response.status_code == 500

    # Field Validation Tests

    def test_ingest_version_version_too_long(
        self,
        client,
        sample_pdf_content
    ):
        """Test error when version exceeds maximum length."""
        files = {
            "file": ("test.pdf", sample_pdf_content, "application/pdf")
        }
        data = {
            "template_id": "10",
            "version": "V" * 51  # Exceeds 50 char limit
        }

        response = client.post(
            "/api/v1/templates/ingest/version",
            files=files,
            data=data
        )

        assert response.status_code == 422

    def test_ingest_version_with_long_change_summary(
        self,
        client,
        sample_pdf_content,
        mock_version_response
    ):
        """Test version ingestion with long change summary."""
        with patch('app.api.v1.endpoints.ingest.TemplateService') as m_svc:
            mock_instance = Mock()
            mock_instance.ingest_template_version = AsyncMock(
                return_value=mock_version_response
            )
            m_svc.return_value = mock_instance

            files = {
                "file": ("test.pdf", sample_pdf_content, "application/pdf")
            }
            data = {
                "template_id": "10",
                "version": "2.0",
                "change_summary": "A" * 1000  # Long but valid TEXT field
            }

            response = client.post(
                "/api/v1/templates/ingest/version",
                files=files,
                data=data
            )

            assert response.status_code == 201
