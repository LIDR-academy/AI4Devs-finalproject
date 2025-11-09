"""
Tests for comparison persistence API endpoints.

These tests verify the new REST API endpoints for saving, retrieving,
listing, and checking comparison results.
"""

import pytest
from datetime import datetime
from fastapi.testclient import TestClient

from app.main import app
from app.models.user import User
from app.models.template import PDFTemplate, TemplateVersion
from app.models.comparison import Comparison, ComparisonField
from app.core.auth import create_access_token


client = TestClient(app)


@pytest.fixture
def auth_headers(db_session):
    """Create authentication headers for a test user."""
    user = User(
        email="test@example.com",
        hashed_password="hashed_password",
        is_active=True
    )
    db_session.add(user)
    db_session.commit()
    
    token = create_access_token(data={"sub": user.email})
    return {"Authorization": f"Bearer {token}"}


@pytest.fixture
def test_versions(db_session):
    """Create test template versions."""
    template = PDFTemplate(name="Test Template", current_version="1.0")
    db_session.add(template)
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

    return version1, version2


class TestIngestEndpoint:
    """Test cases for POST /api/v1/comparisons/ingest."""

    def test_ingest_comparison_success(
        self, db_session, auth_headers, test_versions
    ):
        """Test successfully ingesting a comparison."""
        version1, version2 = test_versions

        payload = {
            "source_version_id": version1.id,
            "target_version_id": version2.id,
            "global_metrics": {
                "source_version_number": "1.0",
                "target_version_number": "2.0",
                "source_page_count": 2,
                "target_page_count": 2,
                "page_count_changed": False,
                "source_field_count": 10,
                "target_field_count": 11,
                "field_count_changed": True,
                "fields_added": 1,
                "fields_removed": 0,
                "fields_modified": 0,
                "fields_unchanged": 10,
                "modification_percentage": 9.09,
                "source_created_at": version1.created_at.isoformat(),
                "target_created_at": version2.created_at.isoformat(),
            },
            "field_changes": [
                {
                    "field_id": "NEW_FIELD",
                    "status": "ADDED",
                    "field_type": "text",
                    "source_page_number": None,
                    "target_page_number": 1,
                    "page_number_changed": False,
                    "near_text_diff": "NOT_APPLICABLE",
                    "source_near_text": None,
                    "target_near_text": "New field",
                    "value_options_diff": "NOT_APPLICABLE",
                    "source_value_options": None,
                    "target_value_options": None,
                    "position_change": "NOT_APPLICABLE",
                    "source_position": None,
                    "target_position": {
                        "x0": 100, "y0": 200, "x1": 300, "y1": 220
                    },
                }
            ],
        }

        response = client.post(
            "/api/v1/comparisons/ingest",
            json=payload,
            headers=auth_headers
        )

        assert response.status_code == 201
        data = response.json()
        assert "comparison_id" in data
        assert data["comparison_id"] > 0
        assert "message" in data
        assert "created_at" in data

    def test_ingest_comparison_unauthorized(self, test_versions):
        """Test ingest without authentication."""
        version1, version2 = test_versions

        payload = {
            "source_version_id": version1.id,
            "target_version_id": version2.id,
            "global_metrics": {
                "source_version_number": "1.0",
                "target_version_number": "2.0",
                "source_page_count": 2,
                "target_page_count": 2,
                "page_count_changed": False,
                "source_field_count": 10,
                "target_field_count": 10,
                "field_count_changed": False,
                "fields_added": 0,
                "fields_removed": 0,
                "fields_modified": 0,
                "fields_unchanged": 10,
                "modification_percentage": 0.0,
                "source_created_at": datetime.utcnow().isoformat(),
                "target_created_at": datetime.utcnow().isoformat(),
            },
            "field_changes": [],
        }

        response = client.post(
            "/api/v1/comparisons/ingest",
            json=payload
        )

        assert response.status_code == 401

    def test_ingest_comparison_same_versions(
        self, auth_headers, test_versions
    ):
        """Test ingest with same source and target versions."""
        version1, _ = test_versions

        payload = {
            "source_version_id": version1.id,
            "target_version_id": version1.id,  # Same as source
            "global_metrics": {
                "source_version_number": "1.0",
                "target_version_number": "1.0",
                "source_page_count": 2,
                "target_page_count": 2,
                "page_count_changed": False,
                "source_field_count": 10,
                "target_field_count": 10,
                "field_count_changed": False,
                "fields_added": 0,
                "fields_removed": 0,
                "fields_modified": 0,
                "fields_unchanged": 10,
                "modification_percentage": 0.0,
                "source_created_at": datetime.utcnow().isoformat(),
                "target_created_at": datetime.utcnow().isoformat(),
            },
            "field_changes": [],
        }

        response = client.post(
            "/api/v1/comparisons/ingest",
            json=payload,
            headers=auth_headers
        )

        assert response.status_code == 400

    def test_ingest_comparison_invalid_version(self, auth_headers):
        """Test ingest with non-existent version."""
        payload = {
            "source_version_id": 9999,  # Non-existent
            "target_version_id": 9998,  # Non-existent
            "global_metrics": {
                "source_version_number": "1.0",
                "target_version_number": "2.0",
                "source_page_count": 2,
                "target_page_count": 2,
                "page_count_changed": False,
                "source_field_count": 10,
                "target_field_count": 10,
                "field_count_changed": False,
                "fields_added": 0,
                "fields_removed": 0,
                "fields_modified": 0,
                "fields_unchanged": 10,
                "modification_percentage": 0.0,
                "source_created_at": datetime.utcnow().isoformat(),
                "target_created_at": datetime.utcnow().isoformat(),
            },
            "field_changes": [],
        }

        response = client.post(
            "/api/v1/comparisons/ingest",
            json=payload,
            headers=auth_headers
        )

        assert response.status_code == 404


class TestGetComparisonEndpoint:
    """Test cases for GET /api/v1/comparisons/{comparison_id}."""

    def test_get_comparison_success(
        self, db_session, auth_headers, test_versions
    ):
        """Test successfully retrieving a comparison."""
        version1, version2 = test_versions

        # Create a comparison
        comparison = Comparison(
            source_version_id=version1.id,
            target_version_id=version2.id,
            modification_percentage=10.0,
            fields_added=1,
            fields_removed=0,
            fields_modified=0,
            fields_unchanged=10,
        )
        db_session.add(comparison)
        db_session.commit()

        # Create a field
        field = ComparisonField(
            comparison_id=comparison.id,
            field_id="TEST_FIELD",
            status="ADDED",
            field_type="text",
            target_page_number=1,
            page_number_changed=False,
            near_text_diff="NOT_APPLICABLE",
            value_options_diff="NOT_APPLICABLE",
            position_change="NOT_APPLICABLE",
        )
        db_session.add(field)
        db_session.commit()

        response = client.get(
            f"/api/v1/comparisons/{comparison.id}",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["source_version_id"] == version1.id
        assert data["target_version_id"] == version2.id
        assert len(data["field_changes"]) == 1
        assert data["field_changes"][0]["field_id"] == "TEST_FIELD"

    def test_get_comparison_not_found(self, auth_headers):
        """Test getting non-existent comparison."""
        response = client.get(
            "/api/v1/comparisons/99999",
            headers=auth_headers
        )

        assert response.status_code == 404

    def test_get_comparison_unauthorized(self, db_session, test_versions):
        """Test getting comparison without authentication."""
        version1, version2 = test_versions

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

        response = client.get(f"/api/v1/comparisons/{comparison.id}")

        assert response.status_code == 401


class TestListComparisonsEndpoint:
    """Test cases for GET /api/v1/comparisons."""

    def test_list_comparisons_success(
        self, db_session, auth_headers, test_versions
    ):
        """Test successfully listing comparisons."""
        version1, version2 = test_versions

        # Create multiple comparisons
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

        response = client.get(
            "/api/v1/comparisons",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert "page" in data
        assert "page_size" in data
        assert "total_pages" in data
        assert len(data["items"]) == 3
        assert data["total"] == 3

    def test_list_comparisons_pagination(
        self, db_session, auth_headers, test_versions
    ):
        """Test pagination of comparison list."""
        version1, version2 = test_versions

        # Create 15 comparisons
        for i in range(15):
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

        # Get first page
        response = client.get(
            "/api/v1/comparisons?page=1&page_size=10",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 10
        assert data["total"] == 15
        assert data["page"] == 1
        assert data["total_pages"] == 2

    def test_list_comparisons_sorting(
        self, db_session, auth_headers, test_versions
    ):
        """Test sorting of comparison list."""
        version1, version2 = test_versions

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

        # Get list sorted by modification_percentage descending
        response = client.get(
            "/api/v1/comparisons?sort_by=modification_percentage&sort_order=desc",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        percentages = [item["modification_percentage"] for item in data["items"]]
        assert percentages == [50.0, 30.0, 10.0]

    def test_list_comparisons_empty(self, auth_headers):
        """Test listing when no comparisons exist."""
        response = client.get(
            "/api/v1/comparisons",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert len(data["items"]) == 0
        assert data["total"] == 0

    def test_list_comparisons_unauthorized(self):
        """Test listing without authentication."""
        response = client.get("/api/v1/comparisons")

        assert response.status_code == 401


class TestCheckComparisonEndpoint:
    """Test cases for GET /api/v1/comparisons/check."""

    def test_check_comparison_exists(
        self, db_session, auth_headers, test_versions
    ):
        """Test checking for existing comparison."""
        version1, version2 = test_versions

        # Create comparison
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

        response = client.get(
            f"/api/v1/comparisons/check?source_version_id={version1.id}"
            f"&target_version_id={version2.id}",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["exists"] is True
        assert data["comparison_id"] == comparison.id
        assert data["created_at"] is not None

    def test_check_comparison_not_exists(
        self, auth_headers, test_versions
    ):
        """Test checking for non-existent comparison."""
        version1, version2 = test_versions

        response = client.get(
            f"/api/v1/comparisons/check?source_version_id={version1.id}"
            f"&target_version_id={version2.id}",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["exists"] is False
        assert data["comparison_id"] is None
        assert data["created_at"] is None

    def test_check_comparison_bidirectional(
        self, db_session, auth_headers, test_versions
    ):
        """Test bidirectional check."""
        version1, version2 = test_versions

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

        # Check in reverse direction
        response = client.get(
            f"/api/v1/comparisons/check?source_version_id={version2.id}"
            f"&target_version_id={version1.id}",
            headers=auth_headers
        )

        assert response.status_code == 200
        data = response.json()
        assert data["exists"] is True
        assert data["comparison_id"] == comparison.id

    def test_check_comparison_missing_params(self, auth_headers):
        """Test check with missing parameters."""
        response = client.get(
            "/api/v1/comparisons/check?source_version_id=1",
            headers=auth_headers
        )

        assert response.status_code == 422

    def test_check_comparison_unauthorized(self, test_versions):
        """Test check without authentication."""
        version1, version2 = test_versions

        response = client.get(
            f"/api/v1/comparisons/check?source_version_id={version1.id}"
            f"&target_version_id={version2.id}"
        )

        assert response.status_code == 401

