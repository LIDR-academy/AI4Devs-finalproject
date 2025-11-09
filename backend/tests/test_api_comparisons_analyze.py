"""
Unit tests for POST /api/v1/comparisons/analyze endpoint.

Tests the analyze comparison API endpoint for template version comparison.
"""
from datetime import datetime
from unittest.mock import MagicMock, Mock, patch

import pytest
from fastapi import status
from fastapi.testclient import TestClient

from app.main import app
from app.schemas.comparison import (
    ComparisonResult,
    DiffStatus,
    FieldChange,
    FieldChangeStatus,
    GlobalMetrics,
)

client = TestClient(app)


@pytest.fixture
def mock_auth_token():
    """Mock JWT token for authentication."""
    return "mock-jwt-token"


@pytest.fixture
def mock_current_user():
    """Mock authenticated user."""
    user = Mock()
    user.id = 1
    user.email = "test@example.com"
    user.is_active = True
    return user


@pytest.fixture
def mock_comparison_result():
    """Mock comparison result."""
    return ComparisonResult(
        source_version_id=1,
        target_version_id=2,
        global_metrics=GlobalMetrics(
            source_version_number="2024-Q1",
            target_version_number="2024-Q2",
            source_page_count=5,
            target_page_count=6,
            page_count_changed=True,
            source_field_count=48,
            target_field_count=52,
            field_count_changed=True,
            fields_added=4,
            fields_removed=0,
            fields_modified=3,
            fields_unchanged=45,
            modification_percentage=14.58,
            source_created_at=datetime(2024, 1, 15, 10, 30, 0),
            target_created_at=datetime(2024, 4, 20, 14, 25, 0)
        ),
        field_changes=[
            FieldChange(
                field_id="NOMBRE",
                status=FieldChangeStatus.UNCHANGED,
                field_type="text",
                source_page_number=1,
                target_page_number=1,
                page_number_changed=False,
                near_text_diff=DiffStatus.EQUAL,
                source_near_text="Nombre",
                target_near_text="Nombre",
                value_options_diff=DiffStatus.NOT_APPLICABLE,
                position_change=DiffStatus.EQUAL,
                source_position={"x0": 100, "y0": 200, "x1": 300, "y1": 220},
                target_position={"x0": 100, "y0": 200, "x1": 300, "y1": 220}
            ),
            FieldChange(
                field_id="NEW_FIELD",
                status=FieldChangeStatus.ADDED,
                field_type="text",
                source_page_number=None,
                target_page_number=6,
                page_number_changed=False,
                near_text_diff=DiffStatus.NOT_APPLICABLE,
                source_near_text=None,
                target_near_text="New field",
                value_options_diff=DiffStatus.NOT_APPLICABLE,
                source_value_options=None,
                target_value_options=None,
                position_change=DiffStatus.NOT_APPLICABLE,
                source_position=None,
                target_position={"x0": 50, "y0": 750, "x1": 70, "y1": 770}
            )
        ]
    )


class TestAnalyzeComparisonEndpoint:
    """Tests for POST /api/v1/comparisons/analyze endpoint."""

    @patch('app.api.v1.endpoints.comparisons.get_current_active_user')
    @patch('app.api.v1.endpoints.comparisons.ComparisonService')
    def test_successful_comparison(
        self,
        mock_service_class,
        mock_get_user,
        mock_current_user,
        mock_comparison_result
    ):
        """Test successful comparison analysis."""
        # Setup mocks
        mock_get_user.return_value = mock_current_user
        mock_service = MagicMock()
        mock_service.compare_versions.return_value = mock_comparison_result
        mock_service_class.return_value = mock_service

        # Make request
        response = client.post(
            "/api/v1/comparisons/analyze",
            json={
                "source_version_id": 1,
                "target_version_id": 2
            },
            headers={"Authorization": "Bearer mock-token"}
        )

        # Assertions
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["source_version_id"] == 1
        assert data["target_version_id"] == 2
        assert data["global_metrics"]["fields_added"] == 4
        assert data["global_metrics"]["fields_removed"] == 0
        assert data["global_metrics"]["fields_modified"] == 3
        assert len(data["field_changes"]) == 2

    @patch('app.api.v1.endpoints.comparisons.get_current_active_user')
    def test_comparison_without_authentication(self, mock_get_user):
        """Test that comparison requires authentication."""
        mock_get_user.side_effect = Exception("Not authenticated")

        response = client.post(
            "/api/v1/comparisons/analyze",
            json={
                "source_version_id": 1,
                "target_version_id": 2
            }
        )

        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    @patch('app.api.v1.endpoints.comparisons.get_current_active_user')
    @patch('app.api.v1.endpoints.comparisons.ComparisonService')
    def test_comparison_with_same_version_ids(
        self,
        mock_service_class,
        mock_get_user,
        mock_current_user
    ):
        """Test that comparing same versions returns 422 error."""
        mock_get_user.return_value = mock_current_user

        response = client.post(
            "/api/v1/comparisons/analyze",
            json={
                "source_version_id": 1,
                "target_version_id": 1
            },
            headers={"Authorization": "Bearer mock-token"}
        )

        # Pydantic validation should catch this
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @patch('app.api.v1.endpoints.comparisons.get_current_active_user')
    @patch('app.api.v1.endpoints.comparisons.ComparisonService')
    def test_comparison_with_nonexistent_source_version(
        self,
        mock_service_class,
        mock_get_user,
        mock_current_user
    ):
        """Test comparison with non-existent source version."""
        mock_get_user.return_value = mock_current_user
        mock_service = MagicMock()
        mock_service.compare_versions.side_effect = ValueError(
            "Version with ID 999 not found"
        )
        mock_service_class.return_value = mock_service

        response = client.post(
            "/api/v1/comparisons/analyze",
            json={
                "source_version_id": 999,
                "target_version_id": 2
            },
            headers={"Authorization": "Bearer mock-token"}
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert "not found" in response.json()["detail"].lower()

    @patch('app.api.v1.endpoints.comparisons.get_current_active_user')
    @patch('app.api.v1.endpoints.comparisons.ComparisonService')
    def test_comparison_with_nonexistent_target_version(
        self,
        mock_service_class,
        mock_get_user,
        mock_current_user
    ):
        """Test comparison with non-existent target version."""
        mock_get_user.return_value = mock_current_user
        mock_service = MagicMock()
        mock_service.compare_versions.side_effect = ValueError(
            "Version with ID 999 not found"
        )
        mock_service_class.return_value = mock_service

        response = client.post(
            "/api/v1/comparisons/analyze",
            json={
                "source_version_id": 1,
                "target_version_id": 999
            },
            headers={"Authorization": "Bearer mock-token"}
        )

        assert response.status_code == status.HTTP_404_NOT_FOUND

    @patch('app.api.v1.endpoints.comparisons.get_current_active_user')
    @patch('app.api.v1.endpoints.comparisons.ComparisonService')
    def test_comparison_with_negative_version_id(
        self,
        mock_service_class,
        mock_get_user,
        mock_current_user
    ):
        """Test that negative version IDs are rejected."""
        mock_get_user.return_value = mock_current_user

        response = client.post(
            "/api/v1/comparisons/analyze",
            json={
                "source_version_id": -1,
                "target_version_id": 2
            },
            headers={"Authorization": "Bearer mock-token"}
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @patch('app.api.v1.endpoints.comparisons.get_current_active_user')
    @patch('app.api.v1.endpoints.comparisons.ComparisonService')
    def test_comparison_with_zero_version_id(
        self,
        mock_service_class,
        mock_get_user,
        mock_current_user
    ):
        """Test that zero version IDs are rejected."""
        mock_get_user.return_value = mock_current_user

        response = client.post(
            "/api/v1/comparisons/analyze",
            json={
                "source_version_id": 0,
                "target_version_id": 2
            },
            headers={"Authorization": "Bearer mock-token"}
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @patch('app.api.v1.endpoints.comparisons.get_current_active_user')
    @patch('app.api.v1.endpoints.comparisons.ComparisonService')
    def test_comparison_with_missing_source_version_id(
        self,
        mock_service_class,
        mock_get_user,
        mock_current_user
    ):
        """Test that missing source_version_id is rejected."""
        mock_get_user.return_value = mock_current_user

        response = client.post(
            "/api/v1/comparisons/analyze",
            json={
                "target_version_id": 2
            },
            headers={"Authorization": "Bearer mock-token"}
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @patch('app.api.v1.endpoints.comparisons.get_current_active_user')
    @patch('app.api.v1.endpoints.comparisons.ComparisonService')
    def test_comparison_with_missing_target_version_id(
        self,
        mock_service_class,
        mock_get_user,
        mock_current_user
    ):
        """Test that missing target_version_id is rejected."""
        mock_get_user.return_value = mock_current_user

        response = client.post(
            "/api/v1/comparisons/analyze",
            json={
                "source_version_id": 1
            },
            headers={"Authorization": "Bearer mock-token"}
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @patch('app.api.v1.endpoints.comparisons.get_current_active_user')
    @patch('app.api.v1.endpoints.comparisons.ComparisonService')
    def test_comparison_with_invalid_type(
        self,
        mock_service_class,
        mock_get_user,
        mock_current_user
    ):
        """Test that invalid type for version IDs is rejected."""
        mock_get_user.return_value = mock_current_user

        response = client.post(
            "/api/v1/comparisons/analyze",
            json={
                "source_version_id": "invalid",
                "target_version_id": 2
            },
            headers={"Authorization": "Bearer mock-token"}
        )

        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    @patch('app.api.v1.endpoints.comparisons.get_current_active_user')
    @patch('app.api.v1.endpoints.comparisons.ComparisonService')
    def test_comparison_database_error(
        self,
        mock_service_class,
        mock_get_user,
        mock_current_user
    ):
        """Test handling of database errors."""
        mock_get_user.return_value = mock_current_user
        mock_service = MagicMock()
        mock_service.compare_versions.side_effect = Exception(
            "Database connection error"
        )
        mock_service_class.return_value = mock_service

        response = client.post(
            "/api/v1/comparisons/analyze",
            json={
                "source_version_id": 1,
                "target_version_id": 2
            },
            headers={"Authorization": "Bearer mock-token"}
        )

        assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
        assert "Failed to analyze comparison" in response.json()["detail"]

    @patch('app.api.v1.endpoints.comparisons.get_current_active_user')
    @patch('app.api.v1.endpoints.comparisons.ComparisonService')
    def test_comparison_result_structure(
        self,
        mock_service_class,
        mock_get_user,
        mock_current_user,
        mock_comparison_result
    ):
        """Test that response has correct structure."""
        mock_get_user.return_value = mock_current_user
        mock_service = MagicMock()
        mock_service.compare_versions.return_value = mock_comparison_result
        mock_service_class.return_value = mock_service

        response = client.post(
            "/api/v1/comparisons/analyze",
            json={
                "source_version_id": 1,
                "target_version_id": 2
            },
            headers={"Authorization": "Bearer mock-token"}
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()

        # Check top-level structure
        assert "source_version_id" in data
        assert "target_version_id" in data
        assert "global_metrics" in data
        assert "field_changes" in data
        assert "analyzed_at" in data

        # Check global_metrics structure
        metrics = data["global_metrics"]
        assert "source_version_number" in metrics
        assert "target_version_number" in metrics
        assert "source_page_count" in metrics
        assert "target_page_count" in metrics
        assert "fields_added" in metrics
        assert "fields_removed" in metrics
        assert "fields_modified" in metrics
        assert "fields_unchanged" in metrics
        assert "modification_percentage" in metrics

        # Check field_changes structure
        assert isinstance(data["field_changes"], list)
        if len(data["field_changes"]) > 0:
            field_change = data["field_changes"][0]
            assert "field_id" in field_change
            assert "status" in field_change
            assert "near_text_diff" in field_change
            assert "position_change" in field_change

    @patch('app.api.v1.endpoints.comparisons.get_current_active_user')
    @patch('app.api.v1.endpoints.comparisons.ComparisonService')
    def test_comparison_with_empty_field_changes(
        self,
        mock_service_class,
        mock_get_user,
        mock_current_user
    ):
        """Test comparison with no field changes (identical versions)."""
        mock_get_user.return_value = mock_current_user

        # Create result with no changes
        empty_result = ComparisonResult(
            source_version_id=1,
            target_version_id=2,
            global_metrics=GlobalMetrics(
                source_version_number="2024-Q1",
                target_version_number="2024-Q1",
                source_page_count=5,
                target_page_count=5,
                page_count_changed=False,
                source_field_count=48,
                target_field_count=48,
                field_count_changed=False,
                fields_added=0,
                fields_removed=0,
                fields_modified=0,
                fields_unchanged=48,
                modification_percentage=0.0,
                source_created_at=datetime(2024, 1, 15),
                target_created_at=datetime(2024, 1, 15)
            ),
            field_changes=[]
        )

        mock_service = MagicMock()
        mock_service.compare_versions.return_value = empty_result
        mock_service_class.return_value = mock_service

        response = client.post(
            "/api/v1/comparisons/analyze",
            json={
                "source_version_id": 1,
                "target_version_id": 2
            },
            headers={"Authorization": "Bearer mock-token"}
        )

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["global_metrics"]["modification_percentage"] == 0.0
        assert len(data["field_changes"]) == 0

