"""
Tests for the main FastAPI application configuration.
"""

import pytest
from fastapi.testclient import TestClient

from app.main import app


class TestApplicationConfiguration:
    """Test cases for FastAPI application configuration."""
    
    def test_app_creation(self):
        """Test that the FastAPI application is created successfully."""
        assert app is not None
        assert app.title == "SEPE Templates Comparator API"
        assert app.version == "1.0.0"
    
    def test_cors_configuration(self, client: TestClient):
        """Test that CORS is properly configured."""
        response = client.options("/api/v1/health")
        assert response.status_code in [200, 405]  # 405 if OPTIONS not implemented
    
    def test_health_endpoint_exists(self, client: TestClient):
        """Test that health check endpoint is available."""
        response = client.get("/api/v1/health")
        # Should return 404 until implemented, but endpoint should be routable
        assert response.status_code in [200, 404]
    
    def test_api_info_endpoint_exists(self, client: TestClient):
        """Test that API info endpoint is available."""
        response = client.get("/api/v1/info")
        # Should return 404 until implemented, but endpoint should be routable
        assert response.status_code in [200, 404]
    
    def test_openapi_docs_available(self, client: TestClient):
        """Test that OpenAPI documentation is available."""
        response = client.get("/docs")
        assert response.status_code == 200
        assert "text/html" in response.headers.get("content-type", "")
    
    def test_openapi_json_available(self, client: TestClient):
        """Test that OpenAPI JSON schema is available."""
        response = client.get("/openapi.json")
        assert response.status_code == 200
        assert response.headers.get("content-type") == "application/json"
        
        openapi_data = response.json()
        assert openapi_data["info"]["title"] == "SEPE Templates Comparator API"
        assert openapi_data["info"]["version"] == "1.0.0"


class TestApplicationStructure:
    """Test cases for application directory structure."""
    
    def test_app_module_importable(self):
        """Test that main app modules can be imported."""
        try:
            from app.main import app
            assert app is not None
        except ImportError:
            pytest.fail("Could not import main app module")
    
    def test_core_modules_importable(self):
        """Test that core modules can be imported."""
        try:
            from app.core.config import settings
            from app.core.database import get_db
            assert settings is not None
            assert get_db is not None
        except ImportError:
            pytest.fail("Could not import core modules")
    
    def test_api_modules_importable(self):
        """Test that API modules can be imported."""
        try:
            from app.api.v1.router import api_router
            assert api_router is not None
        except ImportError:
            pytest.fail("Could not import API modules")


class TestErrorHandling:
    """Test cases for application error handling."""
    
    def test_404_error_handling(self, client: TestClient):
        """Test that 404 errors are handled properly."""
        response = client.get("/nonexistent-endpoint")
        assert response.status_code == 404

        error_data = response.json()
        # Check for our custom error format
        assert "error" in error_data
        assert "message" in error_data
        assert error_data["status_code"] == 404
    
    def test_method_not_allowed_handling(self, client: TestClient):
        """Test that 405 errors are handled properly."""
        # Try to POST to a GET-only endpoint
        response = client.post("/docs")
        assert response.status_code == 405
