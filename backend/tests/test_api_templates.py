"""
Tests for template CRUD API endpoints.

Note: Template ingestion tests are in test_ingest_endpoint.py
"""

from datetime import datetime, timezone
import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, create_access_token
from app.models.user import User
from app.models.template import PDFTemplate, TemplateVersion, TemplateField


class TestTemplateEndpoints:
    """Test cases for template CRUD endpoints."""
    
    @pytest.fixture
    def test_user(self, db: Session) -> User:
        """Create a test user."""
        user = User(
            email="testuser@example.com",
            hashed_password=get_password_hash("testpassword123"),
            full_name="Test User",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    @pytest.fixture
    def auth_headers(self, test_user: User) -> dict:
        """Create authentication headers for test user."""
        token = create_access_token(subject=str(test_user.id))
        return {"Authorization": f"Bearer {token}"}
    
    def create_template_with_version(
        self, 
        db: Session, 
        name: str, 
        version: str, 
        user_id: int,
        file_path: str = None,
        file_size_bytes: int = 1024,
        field_count: int = 5
    ) -> PDFTemplate:
        """Helper to create a template with its current version."""
        template = PDFTemplate(
            name=name,
            current_version=version,
            uploaded_by=user_id
        )
        db.add(template)
        db.flush()  # Get template.id
        
        version_record = TemplateVersion(
            template_id=template.id,
            version_number=version,
            file_path=file_path or f"/fake/path/{name.replace(' ', '_')}.pdf",
            file_size_bytes=file_size_bytes,
            field_count=field_count,
            is_current=True,
            page_count=1
        )
        db.add(version_record)
        db.commit()
        db.refresh(template)
        return template
    
    def test_list_templates_empty(self, client: TestClient):
        """Test listing templates when none exist."""
        response = client.get("/api/v1/templates/")
        
        assert response.status_code == 200
        data = response.json()
        assert data["items"] == []
        assert data["total"] == 0
        assert data["limit"] == 10
        assert data["offset"] == 0
    
    def test_list_templates_with_data(self, client: TestClient, db: Session, test_user: User):
        """Test listing templates with existing data."""
        # Create test templates with current versions
        template1 = PDFTemplate(
            name="Template 1",
            current_version="1.0",
            uploaded_by=test_user.id
        )
        template2 = PDFTemplate(
            name="Template 2",
            current_version="2.0",
            uploaded_by=test_user.id
        )
        
        db.add_all([template1, template2])
        db.commit()
        
        # Create current versions
        version1 = TemplateVersion(
            template_id=template1.id,
            version_number="1.0",
            file_path="/fake/path/template1.pdf",
            file_size_bytes=1024,
            field_count=5,
            is_current=True,
            page_count=1
        )
        version2 = TemplateVersion(
            template_id=template2.id,
            version_number="2.0",
            file_path="/fake/path/template2.pdf",
            file_size_bytes=2048,
            field_count=10,
            is_current=True,
            page_count=1
        )
        
        db.add_all([version1, version2])
        db.commit()
        
        response = client.get("/api/v1/templates/")
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 2
        assert data["total"] == 2
        
        # Check that templates are returned
        template_names = [item["name"] for item in data["items"]]
        assert "Template 1" in template_names
        assert "Template 2" in template_names
    
    def test_list_templates_pagination(self, client: TestClient, db: Session, test_user: User):
        """Test template list pagination."""
        # Create multiple templates with versions
        for i in range(15):
            self.create_template_with_version(
                db, f"Template {i}", "1.0", test_user.id
            )
        
        # Test first page
        response = client.get("/api/v1/templates/?limit=10&skip=0")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 10
        assert data["total"] == 15
        
        # Test second page
        response = client.get("/api/v1/templates/?limit=10&skip=10")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 5
        assert data["total"] == 15
    
    def test_list_templates_search(self, client: TestClient, db: Session, test_user: User):
        """Test template search functionality."""
        # Create test templates with versions
        self.create_template_with_version(db, "Employment Form", "1.0", test_user.id)
        self.create_template_with_version(db, "Unemployment Benefit", "1.0", test_user.id)
        
        # Search for "employment"
        response = client.get("/api/v1/templates/?search=employment")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 1
        assert data["items"][0]["name"] == "Employment Form"
        
        # Search for "benefit"
        response = client.get("/api/v1/templates/?search=benefit")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 1
        assert data["items"][0]["name"] == "Unemployment Benefit"
    
    def test_get_template_valid_id(self, client: TestClient, db: Session, test_user: User):
        """Test getting template by valid ID."""
        template = PDFTemplate(
            name="Test Template",
            version="1.0",
            file_path="/fake/path/template.pdf",
            file_size_bytes=1024,
            field_count=5,
            sepe_url="https://www.sepe.es/test",
            uploaded_by=test_user.id
        )
        db.add(template)
        db.commit()
        db.refresh(template)
        
        response = client.get(f"/api/v1/templates/{template.id}")
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == template.id
        assert data["name"] == "Test Template"
        assert data["version"] == "1.0"
        assert data["sepe_url"] == "https://www.sepe.es/test"
        assert data["uploaded_by"] == test_user.id
    
    def test_get_template_invalid_id(self, client: TestClient):
        """Test getting template by invalid ID."""
        response = client.get("/api/v1/templates/99999")
        
        assert response.status_code == 404
        assert "Template not found" in response.json()["detail"]
    
    def test_update_template_owner(self, client: TestClient, db: Session, test_user: User, auth_headers: dict):
        """Test updating template by owner."""
        template = PDFTemplate(
            name="Original Name",
            version="1.0",
            file_path="/fake/path/template.pdf",
            file_size_bytes=1024,
            field_count=5,
            uploaded_by=test_user.id
        )
        db.add(template)
        db.commit()
        db.refresh(template)
        
        update_data = {
            "name": "Updated Name",
            "version": "2.0",
            "sepe_url": "https://www.sepe.es/updated"
        }
        
        response = client.put(
            f"/api/v1/templates/{template.id}",
            json=update_data,
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["name"] == "Updated Name"
        assert data["version"] == "2.0"
        assert data["sepe_url"] == "https://www.sepe.es/updated"
    
    def test_update_template_unauthorized(self, client: TestClient, db: Session, test_user: User):
        """Test updating template without authentication."""
        template = PDFTemplate(
            name="Test Template",
            version="1.0",
            file_path="/fake/path/template.pdf",
            file_size_bytes=1024,
            field_count=5,
            uploaded_by=test_user.id
        )
        db.add(template)
        db.commit()
        db.refresh(template)
        
        update_data = {"name": "Updated Name"}
        
        response = client.put(f"/api/v1/templates/{template.id}", json=update_data)
        
        assert response.status_code == 403  # Forbidden
    
    def test_update_template_not_owner(self, client: TestClient, db: Session, test_user: User):
        """Test updating template by non-owner."""
        # Create another user
        other_user = User(
            email="other@example.com",
            hashed_password=get_password_hash("password123"),
            full_name="Other User",
            is_active=True
        )
        db.add(other_user)
        db.commit()
        db.refresh(other_user)
        
        # Create template owned by other user
        template = PDFTemplate(
            name="Test Template",
            version="1.0",
            file_path="/fake/path/template.pdf",
            file_size_bytes=1024,
            field_count=5,
            uploaded_by=other_user.id
        )
        db.add(template)
        db.commit()
        db.refresh(template)
        
        # Try to update with test_user token
        token = create_access_token(subject=test_user.id)
        headers = {"Authorization": f"Bearer {token}"}
        update_data = {"name": "Updated Name"}
        
        response = client.put(
            f"/api/v1/templates/{template.id}",
            json=update_data,
            headers=headers
        )
        
        assert response.status_code == 403
        assert "Not enough permissions" in response.json()["detail"]
    
    def test_delete_template_owner(self, client: TestClient, db: Session, test_user: User, auth_headers: dict):
        """Test deleting template by owner."""
        template = PDFTemplate(
            name="Test Template",
            version="1.0",
            file_path="/fake/path/template.pdf",
            file_size_bytes=1024,
            field_count=5,
            uploaded_by=test_user.id
        )
        db.add(template)
        db.commit()
        db.refresh(template)
        
        response = client.delete(f"/api/v1/templates/{template.id}", headers=auth_headers)
        
        assert response.status_code == 200
        assert "Template deleted successfully" in response.json()["message"]
        
        # Verify template was deleted
        deleted_template = db.query(PDFTemplate).filter(PDFTemplate.id == template.id).first()
        assert deleted_template is None
    
    def test_delete_template_not_found(self, client: TestClient, auth_headers: dict):
        """Test deleting non-existent template."""
        response = client.delete("/api/v1/templates/99999", headers=auth_headers)
        
        assert response.status_code == 404
        assert "Template not found" in response.json()["detail"]
    
    # Download Endpoint Tests
    
    def test_download_template_success(self, client: TestClient, db: Session, test_user: User, auth_headers: dict, tmp_path):
        """Test downloading template PDF successfully."""
        # Create a temporary PDF file
        pdf_path = tmp_path / "test_template.pdf"
        pdf_content = b"%PDF-1.4\nTest PDF content"
        pdf_path.write_bytes(pdf_content)
        
        # Create template with actual file
        template = PDFTemplate(
            name="Test Template",
            version="1.0",
            file_path=str(pdf_path),
            file_size_bytes=len(pdf_content),
            field_count=5,
            uploaded_by=test_user.id
        )
        db.add(template)
        db.commit()
        db.refresh(template)
        
        response = client.get(f"/api/v1/templates/{template.id}/download", headers=auth_headers)
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
        assert "attachment" in response.headers["content-disposition"]
        assert "Test_Template_v1.0.pdf" in response.headers["content-disposition"]
        assert response.content == pdf_content
    
    def test_download_template_not_found(self, client: TestClient, auth_headers: dict):
        """Test downloading non-existent template."""
        response = client.get("/api/v1/templates/99999/download", headers=auth_headers)
        
        assert response.status_code == 404
        assert "Template not found" in response.json()["detail"]
    
    def test_download_template_file_not_found(self, client: TestClient, db: Session, test_user: User, auth_headers: dict):
        """Test downloading template when PDF file doesn't exist on disk."""
        template = PDFTemplate(
            name="Test Template",
            version="1.0",
            file_path="/nonexistent/path/template.pdf",
            file_size_bytes=1024,
            field_count=5,
            uploaded_by=test_user.id
        )
        db.add(template)
        db.commit()
        db.refresh(template)
        
        response = client.get(f"/api/v1/templates/{template.id}/download", headers=auth_headers)
        
        assert response.status_code == 404
        assert "PDF file not found" in response.json()["detail"]
    
    def test_download_template_unauthorized(self, client: TestClient, db: Session, test_user: User, tmp_path):
        """Test downloading template without authentication."""
        pdf_path = tmp_path / "test_template.pdf"
        pdf_path.write_bytes(b"%PDF-1.4\nTest")
        
        template = PDFTemplate(
            name="Test Template",
            version="1.0",
            file_path=str(pdf_path),
            file_size_bytes=100,
            field_count=5,
            uploaded_by=test_user.id
        )
        db.add(template)
        db.commit()
        db.refresh(template)
        
        response = client.get(f"/api/v1/templates/{template.id}/download")
        
        assert response.status_code == 403  # Not authenticated
    
    def test_download_template_special_characters_in_name(self, client: TestClient, db: Session, test_user: User, auth_headers: dict, tmp_path):
        """Test downloading template with special characters in filename."""
        pdf_path = tmp_path / "test.pdf"
        pdf_path.write_bytes(b"%PDF-1.4\nTest")
        
        template = PDFTemplate(
            name="Template & Test (Special)",
            version="1.0-alpha",
            file_path=str(pdf_path),
            file_size_bytes=100,
            field_count=5,
            uploaded_by=test_user.id
        )
        db.add(template)
        db.commit()
        db.refresh(template)
        
        response = client.get(f"/api/v1/templates/{template.id}/download", headers=auth_headers)
        
        assert response.status_code == 200
        assert response.headers["content-type"] == "application/pdf"
        # Filename should be sanitized
        assert "attachment" in response.headers["content-disposition"]
    
    # Version Endpoints Tests (Enhanced with pagination)
    
    def test_get_template_versions_with_pagination(self, client: TestClient, db: Session, test_user: User):
        """Test getting template versions with pagination and sorting."""
        template = PDFTemplate(
            name="Test Template",
            version="1.0",
            file_path="/fake/path/template.pdf",
            file_size_bytes=1024,
            field_count=5,
            uploaded_by=test_user.id
        )
        db.add(template)
        db.commit()
        db.refresh(template)
        
        # Create multiple versions
        for i in range(5):
            version = TemplateVersion(
                template_id=template.id,
                version_number=f"1.{i}",
                change_summary=f"Changes in version 1.{i}",
                is_current=(i == 4),  # Last one is current
                title=f"SEPE Form v1.{i}",
                author="SEPE",
                subject="Employment Registration",
                page_count=3 + i
            )
            db.add(version)
        db.commit()
        
        # Test first page
        response = client.get(f"/api/v1/templates/{template.id}/versions?limit=3&offset=0")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 3
        assert data["total"] == 5
        assert data["limit"] == 3
        assert data["offset"] == 0
        
        # Test sorting (newest first by default)
        assert data["items"][0]["version_number"] == "1.4"
        assert data["items"][0]["is_current"] is True
    
    def test_get_template_versions_metadata(self, client: TestClient, db: Session, test_user: User):
        """Test that version metadata is included in response."""
        template = PDFTemplate(
            name="Test Template",
            version="1.0",
            file_path="/fake/path/template.pdf",
            file_size_bytes=1024,
            field_count=5,
            uploaded_by=test_user.id
        )
        db.add(template)
        db.commit()
        db.refresh(template)
        
        version = TemplateVersion(
            template_id=template.id,
            version_number="1.0",
            change_summary="Initial version",
            is_current=True,
            title="SEPE Employment Form 2024",
            author="SEPE - Servicio Público de Empleo Estatal",
            subject="Employment Registration",
            creation_date=datetime(2024, 1, 15, tzinfo=timezone.utc),
            modification_date=datetime(2024, 10, 1, tzinfo=timezone.utc),
            page_count=5
        )
        db.add(version)
        db.commit()
        
        response = client.get(f"/api/v1/templates/{template.id}/versions")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 1
        
        version_data = data["items"][0]
        assert version_data["title"] == "SEPE Employment Form 2024"
        assert version_data["author"] == "SEPE - Servicio Público de Empleo Estatal"
        assert version_data["subject"] == "Employment Registration"
        assert version_data["page_count"] == 5
    
    def test_get_template_versions_sorting(self, client: TestClient, db: Session, test_user: User):
        """Test template versions with different sorting options."""
        template = PDFTemplate(
            name="Test Template",
            version="1.0",
            file_path="/fake/path/template.pdf",
            file_size_bytes=1024,
            field_count=5,
            uploaded_by=test_user.id
        )
        db.add(template)
        db.commit()
        db.refresh(template)
        
        # Create versions
        version1 = TemplateVersion(
            template_id=template.id,
            version_number="1.0",
            is_current=False,
            page_count=3
        )
        version2 = TemplateVersion(
            template_id=template.id,
            version_number="2.0",
            is_current=True,
            page_count=5
        )
        db.add_all([version1, version2])
        db.commit()
        
        # Test ascending order
        response = client.get(f"/api/v1/templates/{template.id}/versions?sort_order=asc")
        assert response.status_code == 200
        data = response.json()
        assert data["items"][0]["version_number"] == "1.0"
        
        # Test descending order (default)
        response = client.get(f"/api/v1/templates/{template.id}/versions?sort_order=desc")
        assert response.status_code == 200
        data = response.json()
        assert data["items"][0]["version_number"] == "2.0"
    
    # Current Version Fields Endpoint Tests
    
    def test_get_current_version_fields_success(self, client: TestClient, db: Session, test_user: User):
        """Test getting fields from current version."""
        template = PDFTemplate(
            name="Test Template",
            version="1.0",
            file_path="/fake/path/template.pdf",
            file_size_bytes=1024,
            field_count=2,
            uploaded_by=test_user.id
        )
        db.add(template)
        db.commit()
        db.refresh(template)
        
        version = TemplateVersion(
            template_id=template.id,
            version_number="1.0",
            is_current=True,
            page_count=1
        )
        db.add(version)
        db.commit()
        db.refresh(version)
        
        # Create fields
        field1 = TemplateField(
            version_id=version.id,
            field_id="A0101",
            field_type="text",
            raw_type="/Tx",
            page_number=1,
            field_page_order=0,
            near_text="Nombre completo:",
            value_options=None,
            position_data={"x0": 100, "y0": 200, "x1": 300, "y1": 220}
        )
        field2 = TemplateField(
            version_id=version.id,
            field_id="A0102",
            field_type="radiobutton",
            raw_type="/Btn",
            page_number=1,
            field_page_order=1,
            near_text="Sexo:",
            value_options=["Hombre", "Mujer", "Otro"],
            position_data={"x0": 100, "y0": 240, "x1": 200, "y1": 260}
        )
        db.add_all([field1, field2])
        db.commit()
        
        response = client.get(f"/api/v1/templates/{template.id}/fields/current")
        assert response.status_code == 200
        data = response.json()
        
        assert data["total"] == 2
        assert len(data["items"]) == 2
        assert data["version_info"]["version_number"] == "1.0"
        assert data["version_info"]["field_count"] == 2
        
        # Check field ordering (by page_number, then field_page_order)
        assert data["items"][0]["field_id"] == "A0101"
        assert data["items"][1]["field_id"] == "A0102"
    
    def test_get_current_version_fields_pagination(self, client: TestClient, db: Session, test_user: User):
        """Test pagination for current version fields."""
        template = PDFTemplate(
            name="Test Template",
            version="1.0",
            file_path="/fake/path/template.pdf",
            file_size_bytes=1024,
            field_count=25,
            uploaded_by=test_user.id
        )
        db.add(template)
        db.commit()
        db.refresh(template)
        
        version = TemplateVersion(
            template_id=template.id,
            version_number="1.0",
            is_current=True,
            page_count=3
        )
        db.add(version)
        db.commit()
        db.refresh(version)
        
        # Create 25 fields
        for i in range(25):
            field = TemplateField(
                version_id=version.id,
                field_id=f"A{i:04d}",
                field_type="text",
                page_number=(i // 10) + 1,
                field_page_order=i % 10,
                near_text=f"Field {i}"
            )
            db.add(field)
        db.commit()
        
        # Test first page
        response = client.get(f"/api/v1/templates/{template.id}/fields/current?limit=20&offset=0")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 20
        assert data["total"] == 25
        
        # Test second page
        response = client.get(f"/api/v1/templates/{template.id}/fields/current?limit=20&offset=20")
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 5
    
    def test_get_current_version_fields_search(self, client: TestClient, db: Session, test_user: User):
        """Test search functionality for current version fields."""
        template = PDFTemplate(
            name="Test Template",
            version="1.0",
            file_path="/fake/path/template.pdf",
            file_size_bytes=1024,
            field_count=3,
            uploaded_by=test_user.id
        )
        db.add(template)
        db.commit()
        db.refresh(template)
        
        version = TemplateVersion(
            template_id=template.id,
            version_number="1.0",
            is_current=True,
            page_count=1
        )
        db.add(version)
        db.commit()
        db.refresh(version)
        
        field1 = TemplateField(
            version_id=version.id,
            field_id="NAME_FIELD",
            field_type="text",
            page_number=1,
            field_page_order=0,
            near_text="Nombre completo del solicitante"
        )
        field2 = TemplateField(
            version_id=version.id,
            field_id="EMAIL_FIELD",
            field_type="text",
            page_number=1,
            field_page_order=1,
            near_text="Correo electrónico"
        )
        field3 = TemplateField(
            version_id=version.id,
            field_id="PHONE_FIELD",
            field_type="text",
            page_number=1,
            field_page_order=2,
            near_text="Número de teléfono"
        )
        db.add_all([field1, field2, field3])
        db.commit()
        
        # Search by field_id
        response = client.get(f"/api/v1/templates/{template.id}/fields/current?search=NAME")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["field_id"] == "NAME_FIELD"
        
        # Search by near_text
        response = client.get(f"/api/v1/templates/{template.id}/fields/current?search=correo")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["field_id"] == "EMAIL_FIELD"
    
    def test_get_current_version_fields_page_filter(self, client: TestClient, db: Session, test_user: User):
        """Test filtering fields by page number."""
        template = PDFTemplate(
            name="Test Template",
            version="1.0",
            file_path="/fake/path/template.pdf",
            file_size_bytes=1024,
            field_count=6,
            uploaded_by=test_user.id
        )
        db.add(template)
        db.commit()
        db.refresh(template)
        
        version = TemplateVersion(
            template_id=template.id,
            version_number="1.0",
            is_current=True,
            page_count=3
        )
        db.add(version)
        db.commit()
        db.refresh(version)
        
        # Create fields on different pages
        for page in [1, 1, 2, 2, 3, 3]:
            field = TemplateField(
                version_id=version.id,
                field_id=f"FIELD_PAGE_{page}",
                field_type="text",
                page_number=page,
                field_page_order=0,
                near_text=f"Field on page {page}"
            )
            db.add(field)
        db.commit()
        
        # Filter by page 2
        response = client.get(f"/api/v1/templates/{template.id}/fields/current?page_number=2")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        assert all(item["page_number"] == 2 for item in data["items"])
    
    def test_get_current_version_fields_no_current_version(self, client: TestClient, db: Session, test_user: User):
        """Test getting fields when no current version exists."""
        template = PDFTemplate(
            name="Test Template",
            version="1.0",
            file_path="/fake/path/template.pdf",
            file_size_bytes=1024,
            field_count=0,
            uploaded_by=test_user.id
        )
        db.add(template)
        db.commit()
        db.refresh(template)
        
        response = client.get(f"/api/v1/templates/{template.id}/fields/current")
        assert response.status_code == 404
        assert "No current version found" in response.json()["detail"]
    
    # Specific Version Fields Endpoint Tests
    
    def test_get_version_fields_success(self, client: TestClient, db: Session, test_user: User):
        """Test getting fields from specific version."""
        template = PDFTemplate(
            name="Test Template",
            version="1.0",
            file_path="/fake/path/template.pdf",
            file_size_bytes=1024,
            field_count=2,
            uploaded_by=test_user.id
        )
        db.add(template)
        db.commit()
        db.refresh(template)
        
        version = TemplateVersion(
            template_id=template.id,
            version_number="1.0",
            is_current=False,
            page_count=1
        )
        db.add(version)
        db.commit()
        db.refresh(version)
        
        field = TemplateField(
            version_id=version.id,
            field_id="A0101",
            field_type="text",
            page_number=1,
            field_page_order=0,
            near_text="Test field"
        )
        db.add(field)
        db.commit()
        
        response = client.get(f"/api/v1/templates/{template.id}/versions/{version.id}/fields")
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["field_id"] == "A0101"
        assert data["version_info"]["version_id"] == version.id
    
    def test_get_version_fields_version_mismatch(self, client: TestClient, db: Session, test_user: User):
        """Test getting fields when version doesn't belong to template."""
        template1 = PDFTemplate(
            name="Template 1",
            version="1.0",
            file_path="/fake/path/template1.pdf",
            file_size_bytes=1024,
            field_count=0,
            uploaded_by=test_user.id
        )
        template2 = PDFTemplate(
            name="Template 2",
            version="1.0",
            file_path="/fake/path/template2.pdf",
            file_size_bytes=1024,
            field_count=0,
            uploaded_by=test_user.id
        )
        db.add_all([template1, template2])
        db.commit()
        db.refresh(template1)
        db.refresh(template2)
        
        version = TemplateVersion(
            template_id=template2.id,
            version_number="1.0",
            is_current=True,
            page_count=1
        )
        db.add(version)
        db.commit()
        db.refresh(version)
        
        # Try to access version from wrong template
        response = client.get(f"/api/v1/templates/{template1.id}/versions/{version.id}/fields")
        assert response.status_code == 400
        assert "does not belong to" in response.json()["detail"]
    
    def test_get_version_fields_version_not_found(self, client: TestClient, db: Session, test_user: User):
        """Test getting fields from non-existent version."""
        template = PDFTemplate(
            name="Test Template",
            version="1.0",
            file_path="/fake/path/template.pdf",
            file_size_bytes=1024,
            field_count=0,
            uploaded_by=test_user.id
        )
        db.add(template)
        db.commit()
        db.refresh(template)
        
        response = client.get(f"/api/v1/templates/{template.id}/versions/99999/fields")
        assert response.status_code == 404
        assert "Version not found" in response.json()["detail"]


class TestGetVersionById:
    """Test cases for GET /api/v1/templates/versions/{version_id} endpoint."""
    
    @pytest.fixture
    def test_user(self, db: Session) -> User:
        """Create a test user."""
        user = User(
            email="versiontest@example.com",
            hashed_password=get_password_hash("testpassword123"),
            full_name="Version Test User",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    @pytest.fixture
    def auth_headers(self, test_user: User) -> dict:
        """Create authentication headers for test user."""
        token = create_access_token(subject=str(test_user.id))
        return {"Authorization": f"Bearer {token}"}
    
    def create_template_with_version(
        self, 
        db: Session, 
        name: str, 
        version: str, 
        user_id: int,
        file_path: str = "/test/file.pdf",
        file_size_bytes: int = 2621440,
        field_count: int = 48
    ) -> tuple[PDFTemplate, TemplateVersion]:
        """Helper to create a template with its version."""
        template = PDFTemplate(
            name=name,
            current_version=version,
            comment="Test template comment",
            uploaded_by=user_id
        )
        db.add(template)
        db.flush()
        
        # Create version
        version_record = TemplateVersion(
            template_id=template.id,
            version_number=version,
            is_current=True,
            file_path=file_path,
            file_size_bytes=file_size_bytes,
            field_count=field_count,
            sepe_url="https://www.sepe.es/test",
            title="Test Template Title",
            author="SEPE",
            subject="Test Subject",
            page_count=5
        )
        db.add(version_record)
        db.commit()
        db.refresh(template)
        db.refresh(version_record)
        
        return template, version_record
    
    def test_get_version_by_id_success(
        self, 
        client: TestClient, 
        db: Session, 
        auth_headers: dict, 
        test_user: User
    ):
        """Test successfully retrieving a version by ID."""
        template, version = self.create_template_with_version(
            db, "Test Template", "1.0", test_user.id
        )
        
        response = client.get(
            f"/api/v1/templates/versions/{version.id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify version data
        assert data["id"] == version.id
        assert data["version_number"] == "1.0"
        assert data["is_current"] is True
        assert data["file_path"] == "/test/file.pdf"
        assert data["file_size_bytes"] == 2621440
        assert data["field_count"] == 48
        assert data["sepe_url"] == "https://www.sepe.es/test"
        assert data["title"] == "Test Template Title"
        assert data["author"] == "SEPE"
        assert data["subject"] == "Test Subject"
        assert data["page_count"] == 5
        
        # Verify template data
        assert data["template"]["id"] == template.id
        assert data["template"]["name"] == "Test Template"
        assert data["template"]["current_version"] == "1.0"
        assert data["template"]["comment"] == "Test template comment"
        assert data["template"]["uploaded_by"] == test_user.id
    
    def test_get_version_by_id_not_found(
        self, 
        client: TestClient, 
        auth_headers: dict
    ):
        """Test retrieving a non-existent version."""
        response = client.get(
            "/api/v1/templates/versions/99999",
            headers=auth_headers
        )
        
        assert response.status_code == 404
        assert "not found" in response.json()["detail"].lower()
    
    def test_get_version_by_id_unauthorized(
        self, 
        client: TestClient, 
        db: Session, 
        test_user: User
    ):
        """Test retrieving a version without authentication."""
        template, version = self.create_template_with_version(
            db, "Test Template", "1.0", test_user.id
        )
        
        response = client.get(f"/api/v1/templates/versions/{version.id}")
        
        assert response.status_code == 401
    
    def test_get_version_by_id_with_null_fields(
        self, 
        client: TestClient, 
        db: Session, 
        auth_headers: dict, 
        test_user: User
    ):
        """Test retrieving a version with null optional fields."""
        template = PDFTemplate(
            name="Minimal Template",
            current_version="1.0",
            comment=None,  # Null comment
            uploaded_by=test_user.id
        )
        db.add(template)
        db.flush()
        
        version = TemplateVersion(
            template_id=template.id,
            version_number="1.0",
            is_current=True,
            file_path="/test/minimal.pdf",
            file_size_bytes=1024,
            field_count=0,
            sepe_url=None,  # Null sepe_url
            title=None,  # Null metadata
            author=None,
            subject=None,
            creation_date=None,
            modification_date=None,
            page_count=1
        )
        db.add(version)
        db.commit()
        db.refresh(version)
        
        response = client.get(
            f"/api/v1/templates/versions/{version.id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Verify null fields are properly serialized
        assert data["sepe_url"] is None
        assert data["title"] is None
        assert data["author"] is None
        assert data["subject"] is None
        assert data["creation_date"] is None
        assert data["modification_date"] is None
        assert data["template"]["comment"] is None
    
    def test_get_version_by_id_multiple_versions(
        self, 
        client: TestClient, 
        db: Session, 
        auth_headers: dict, 
        test_user: User
    ):
        """Test retrieving a specific version when multiple versions exist."""
        # Create template
        template = PDFTemplate(
            name="Multi-Version Template",
            current_version="2.0",
            uploaded_by=test_user.id
        )
        db.add(template)
        db.flush()
        
        # Create version 1.0 (old)
        version_1 = TemplateVersion(
            template_id=template.id,
            version_number="1.0",
            is_current=False,
            file_path="/test/v1.pdf",
            file_size_bytes=1000,
            field_count=10,
            page_count=1
        )
        db.add(version_1)
        
        # Create version 2.0 (current)
        version_2 = TemplateVersion(
            template_id=template.id,
            version_number="2.0",
            is_current=True,
            file_path="/test/v2.pdf",
            file_size_bytes=2000,
            field_count=20,
            page_count=2
        )
        db.add(version_2)
        db.commit()
        db.refresh(version_1)
        db.refresh(version_2)
        
        # Fetch version 1
        response = client.get(
            f"/api/v1/templates/versions/{version_1.id}",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["id"] == version_1.id
        assert data["version_number"] == "1.0"
        assert data["is_current"] is False
        assert data["file_path"] == "/test/v1.pdf"
        assert data["field_count"] == 10
        
        # Template still shows current version 2.0
        assert data["template"]["current_version"] == "2.0"


class TestTemplateNamesEndpoint:
    """Test cases for GET /api/v1/templates/names endpoint."""
    
    @pytest.fixture
    def test_user(self, db: Session) -> User:
        """Create a test user."""
        user = User(
            email="names_test@example.com",
            hashed_password=get_password_hash("testpassword123"),
            full_name="Names Test User",
            is_active=True
        )
        db.add(user)
        db.commit()
        db.refresh(user)
        return user
    
    @pytest.fixture
    def auth_headers(self, test_user: User) -> dict:
        """Create authentication headers for test user."""
        token = create_access_token(subject=str(test_user.id))
        return {"Authorization": f"Bearer {token}"}
    
    def create_template_with_version(
        self, 
        db: Session, 
        name: str, 
        version: str, 
        user_id: int
    ) -> PDFTemplate:
        """Helper to create a template with its current version."""
        template = PDFTemplate(
            name=name,
            current_version=version,
            uploaded_by=user_id
        )
        db.add(template)
        db.flush()
        
        version_record = TemplateVersion(
            template_id=template.id,
            version_number=version,
            file_path=f"/fake/path/{name.replace(' ', '_')}.pdf",
            file_size_bytes=1024,
            field_count=5,
            is_current=True,
            page_count=1
        )
        db.add(version_record)
        db.commit()
        db.refresh(template)
        return template
    
    def test_get_template_names_empty(
        self, 
        client: TestClient, 
        auth_headers: dict
    ):
        """Test getting template names when none exist."""
        response = client.get(
            "/api/v1/templates/names",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["items"] == []
        assert data["total"] == 0
    
    def test_get_template_names_success(
        self, 
        client: TestClient, 
        db: Session, 
        auth_headers: dict, 
        test_user: User
    ):
        """Test successfully getting template names."""
        # Create test templates
        template1 = self.create_template_with_version(
            db, "Solicitud Prestación Desempleo", "2024-Q1", test_user.id
        )
        template2 = self.create_template_with_version(
            db, "Modificación Datos Personales", "v2.0", test_user.id
        )
        template3 = self.create_template_with_version(
            db, "Certificado de Empresa", "1.5", test_user.id
        )
        
        response = client.get(
            "/api/v1/templates/names",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 3
        assert len(data["items"]) == 3
        
        # Verify structure of items
        for item in data["items"]:
            assert "id" in item
            assert "name" in item
            assert "current_version" in item
        
        # Verify specific templates are included
        template_names = [item["name"] for item in data["items"]]
        assert "Solicitud Prestación Desempleo" in template_names
        assert "Modificación Datos Personales" in template_names
        assert "Certificado de Empresa" in template_names
    
    def test_get_template_names_default_sorting(
        self, 
        client: TestClient, 
        db: Session, 
        auth_headers: dict, 
        test_user: User
    ):
        """Test default sorting by name ascending."""
        # Create templates in different order
        self.create_template_with_version(db, "Zebra Template", "1.0", test_user.id)
        self.create_template_with_version(db, "Alpha Template", "1.0", test_user.id)
        self.create_template_with_version(db, "Beta Template", "1.0", test_user.id)
        
        response = client.get(
            "/api/v1/templates/names",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        
        # Should be sorted alphabetically by name
        names = [item["name"] for item in data["items"]]
        assert names == ["Alpha Template", "Beta Template", "Zebra Template"]
    
    def test_get_template_names_sort_by_created_at(
        self, 
        client: TestClient, 
        db: Session, 
        auth_headers: dict, 
        test_user: User
    ):
        """Test sorting by created_at."""
        # Create templates in specific order
        template1 = self.create_template_with_version(db, "First", "1.0", test_user.id)
        template2 = self.create_template_with_version(db, "Second", "1.0", test_user.id)
        template3 = self.create_template_with_version(db, "Third", "1.0", test_user.id)
        
        # Sort by created_at descending (newest first)
        response = client.get(
            "/api/v1/templates/names?sort_by=created_at&sort_order=desc",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        names = [item["name"] for item in data["items"]]
        assert names == ["Third", "Second", "First"]
        
        # Sort by created_at ascending (oldest first)
        response = client.get(
            "/api/v1/templates/names?sort_by=created_at&sort_order=asc",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        names = [item["name"] for item in data["items"]]
        assert names == ["First", "Second", "Third"]
    
    def test_get_template_names_search(
        self, 
        client: TestClient, 
        db: Session, 
        auth_headers: dict, 
        test_user: User
    ):
        """Test search functionality."""
        self.create_template_with_version(db, "Solicitud de Prestación", "1.0", test_user.id)
        self.create_template_with_version(db, "Solicitud de Empleo", "1.0", test_user.id)
        self.create_template_with_version(db, "Certificado Médico", "1.0", test_user.id)
        self.create_template_with_version(db, "Modificación de Datos", "1.0", test_user.id)
        
        # Search for "Solicitud" (case-insensitive)
        response = client.get(
            "/api/v1/templates/names?search=solicitud",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 2
        names = [item["name"] for item in data["items"]]
        assert "Solicitud de Prestación" in names
        assert "Solicitud de Empleo" in names
        
        # Search for "certificado" (case-insensitive)
        response = client.get(
            "/api/v1/templates/names?search=certificado",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 1
        assert data["items"][0]["name"] == "Certificado Médico"
        
        # Search with no results
        response = client.get(
            "/api/v1/templates/names?search=nonexistent",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 0
        assert data["items"] == []
    
    def test_get_template_names_pagination(
        self, 
        client: TestClient, 
        db: Session, 
        auth_headers: dict, 
        test_user: User
    ):
        """Test pagination with limit parameter."""
        # Create 10 templates
        for i in range(10):
            self.create_template_with_version(
                db, f"Template {i:02d}", "1.0", test_user.id
            )
        
        # Get first 5
        response = client.get(
            "/api/v1/templates/names?limit=5",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 5
        assert data["total"] == 10
        
        # Get all with high limit
        response = client.get(
            "/api/v1/templates/names?limit=100",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 10
        assert data["total"] == 10
    
    def test_get_template_names_limit_validation(
        self, 
        client: TestClient, 
        auth_headers: dict
    ):
        """Test limit parameter validation."""
        # Test limit below minimum (should use default or fail validation)
        response = client.get(
            "/api/v1/templates/names?limit=0",
            headers=auth_headers
        )
        assert response.status_code == 422  # Validation error
        
        # Test limit above maximum
        response = client.get(
            "/api/v1/templates/names?limit=600",
            headers=auth_headers
        )
        assert response.status_code == 422  # Validation error
    
    def test_get_template_names_sort_order_validation(
        self, 
        client: TestClient, 
        auth_headers: dict
    ):
        """Test sort_order parameter validation."""
        # Invalid sort order
        response = client.get(
            "/api/v1/templates/names?sort_order=invalid",
            headers=auth_headers
        )
        assert response.status_code == 422  # Validation error
    
    def test_get_template_names_unauthorized(self, client: TestClient):
        """Test accessing endpoint without authentication."""
        response = client.get("/api/v1/templates/names")
        
        assert response.status_code == 401  # Unauthorized
    
    def test_get_template_names_combined_filters(
        self, 
        client: TestClient, 
        db: Session, 
        auth_headers: dict, 
        test_user: User
    ):
        """Test combining search, limit, and sorting."""
        # Create various templates
        self.create_template_with_version(db, "SEPE Form A", "1.0", test_user.id)
        self.create_template_with_version(db, "SEPE Form B", "1.0", test_user.id)
        self.create_template_with_version(db, "SEPE Form C", "1.0", test_user.id)
        self.create_template_with_version(db, "Other Template", "1.0", test_user.id)
        
        # Search for "SEPE", limit to 2, sort by name descending
        response = client.get(
            "/api/v1/templates/names?search=SEPE&limit=2&sort_by=name&sort_order=desc",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert data["total"] == 3  # Total matching search
        assert len(data["items"]) == 2  # Limited to 2
        
        # Should be sorted descending
        names = [item["name"] for item in data["items"]]
        assert names == ["SEPE Form C", "SEPE Form B"]
    
    def test_get_template_names_includes_current_version(
        self, 
        client: TestClient, 
        db: Session, 
        auth_headers: dict, 
        test_user: User
    ):
        """Test that response includes current_version field."""
        self.create_template_with_version(db, "Test Template", "2024-Q1", test_user.id)
        
        response = client.get(
            "/api/v1/templates/names",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 1
        assert data["items"][0]["current_version"] == "2024-Q1"
    
    def test_get_template_names_minimal_data(
        self, 
        client: TestClient, 
        db: Session, 
        auth_headers: dict, 
        test_user: User
    ):
        """Test that response contains only minimal necessary data."""
        self.create_template_with_version(db, "Test Template", "1.0", test_user.id)
        
        response = client.get(
            "/api/v1/templates/names",
            headers=auth_headers
        )
        
        assert response.status_code == 200
        data = response.json()
        item = data["items"][0]
        
        # Should only have these 3 fields
        assert set(item.keys()) == {"id", "name", "current_version"}
        
        # Should NOT have heavy fields like file_path, field_count, etc.
        assert "file_path" not in item
        assert "file_size_bytes" not in item
        assert "field_count" not in item
        assert "uploaded_by" not in item