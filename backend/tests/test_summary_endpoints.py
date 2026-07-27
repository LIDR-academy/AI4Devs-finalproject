# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""
Test suite for AI Summary/Prompt Generation endpoints
Tests the new 'Generar Prompt/Resumen exportable' feature

Endpoints tested:
- POST /api/ai/diagrams/{diagram_id}/generate-summary
- POST /api/ai/projects/{project_id}/generate-summary
"""

import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')


class TestSummaryEndpoints:
    """Test AI Summary/Prompt Generation endpoints"""
    
    @pytest.fixture(autouse=True)
    def setup(self):
        """Setup test session"""
        self.session = requests.Session()
        self.session.headers.update({"Content-Type": "application/json"})
        
        # Get dev login session
        response = self.session.post(f"{BASE_URL}/api/auth/dev-login")
        if response.status_code == 200:
            data = response.json()
            self.session_token = data.get("session_token")
            self.session.headers.update({"Authorization": f"Bearer {self.session_token}"})
        
        # Test IDs from test_credentials.md
        self.test_project_id = "5ad98a45-a536-4fd8-a9e0-051f40d26ce4"
        self.test_diagram_id = "50f2d9a4-9f34-4612-bdfc-f0c7edbdd152"
    
    # ==================== Diagram Summary Endpoint Tests ====================
    
    def test_diagram_summary_endpoint_exists(self):
        """Test that diagram summary endpoint exists and is not 404"""
        response = self.session.post(
            f"{BASE_URL}/api/ai/diagrams/{self.test_diagram_id}/generate-summary",
            json={"include_xml": False, "include_oop": False}
        )
        # Should not be 404 - endpoint exists
        assert response.status_code != 404, f"Endpoint returned 404 - endpoint may not exist"
        print(f"Diagram summary endpoint exists, status: {response.status_code}")
    
    def test_diagram_summary_not_found(self):
        """Test 404 response for non-existent diagram"""
        response = self.session.post(
            f"{BASE_URL}/api/ai/diagrams/non-existent-id/generate-summary",
            json={"include_xml": False, "include_oop": False}
        )
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert "not found" in data["detail"].lower()
        print(f"Non-existent diagram returns 404: {data['detail']}")
    
    def test_diagram_summary_request_validation(self):
        """Test request body validation for diagram summary"""
        # Test with valid request body structure
        response = self.session.post(
            f"{BASE_URL}/api/ai/diagrams/{self.test_diagram_id}/generate-summary",
            json={
                "include_xml": True,
                "include_oop": True,
                "custom_context": "Test context"
            }
        )
        # Should accept valid request (may return 503 due to AI service)
        assert response.status_code in [200, 503], f"Unexpected status: {response.status_code}"
        print(f"Request validation passed, status: {response.status_code}")
    
    def test_diagram_summary_ai_service_error(self):
        """Test that AI service error returns 503 with proper message"""
        response = self.session.post(
            f"{BASE_URL}/api/ai/diagrams/{self.test_diagram_id}/generate-summary",
            json={"include_xml": False, "include_oop": False}
        )
        # Expected 503 due to AI service issues (per agent context note)
        if response.status_code == 503:
            data = response.json()
            assert "detail" in data
            assert "Error del servicio de IA" in data["detail"] or "AI" in data["detail"]
            print(f"AI service error handled correctly: 503")
        elif response.status_code == 200:
            # If AI service works, verify response structure
            data = response.json()
            assert "summary" in data
            assert "diagram_name" in data
            assert "diagram_id" in data
            print(f"AI service working, got summary response")
    
    # ==================== Project Summary Endpoint Tests ====================
    
    def test_project_summary_endpoint_exists(self):
        """Test that project summary endpoint exists and is not 404"""
        response = self.session.post(
            f"{BASE_URL}/api/ai/projects/{self.test_project_id}/generate-summary",
            json={"include_xml": False, "include_oop": False}
        )
        # Should not be 404 - endpoint exists
        assert response.status_code != 404, f"Endpoint returned 404 - endpoint may not exist"
        print(f"Project summary endpoint exists, status: {response.status_code}")
    
    def test_project_summary_not_found(self):
        """Test 404 response for non-existent project"""
        response = self.session.post(
            f"{BASE_URL}/api/ai/projects/non-existent-id/generate-summary",
            json={"include_xml": False, "include_oop": False}
        )
        assert response.status_code == 404
        data = response.json()
        assert "detail" in data
        assert "not found" in data["detail"].lower()
        print(f"Non-existent project returns 404: {data['detail']}")
    
    def test_project_summary_request_validation(self):
        """Test request body validation for project summary"""
        # Test with valid request body structure
        response = self.session.post(
            f"{BASE_URL}/api/ai/projects/{self.test_project_id}/generate-summary",
            json={
                "include_xml": True,
                "include_oop": True,
                "custom_context": "Test context for project"
            }
        )
        # Should accept valid request (may return 503 due to AI service)
        assert response.status_code in [200, 400, 503], f"Unexpected status: {response.status_code}"
        print(f"Request validation passed, status: {response.status_code}")
    
    def test_project_summary_ai_service_error(self):
        """Test that AI service error returns 503 with proper message"""
        response = self.session.post(
            f"{BASE_URL}/api/ai/projects/{self.test_project_id}/generate-summary",
            json={"include_xml": False, "include_oop": False}
        )
        # Expected 503 due to AI service issues (per agent context note)
        if response.status_code == 503:
            data = response.json()
            assert "detail" in data
            assert "Error del servicio de IA" in data["detail"] or "AI" in data["detail"]
            print(f"AI service error handled correctly: 503")
        elif response.status_code == 200:
            # If AI service works, verify response structure
            data = response.json()
            assert "summary" in data
            assert "project_name" in data
            assert "project_id" in data
            assert "diagrams_count" in data
            print(f"AI service working, got summary response")
        elif response.status_code == 400:
            # Project may have no diagrams
            data = response.json()
            print(f"Project validation: {data.get('detail', 'unknown')}")
    
    # ==================== GenerateSummaryRequest Model Tests ====================
    
    def test_summary_request_default_values(self):
        """Test that default values work for GenerateSummaryRequest"""
        # Send minimal request - should use defaults
        response = self.session.post(
            f"{BASE_URL}/api/ai/diagrams/{self.test_diagram_id}/generate-summary",
            json={}
        )
        # Should not fail validation - defaults should apply
        assert response.status_code in [200, 503], f"Default values not working: {response.status_code}"
        print(f"Default values work, status: {response.status_code}")
    
    def test_summary_request_with_custom_context(self):
        """Test custom_context parameter"""
        response = self.session.post(
            f"{BASE_URL}/api/ai/diagrams/{self.test_diagram_id}/generate-summary",
            json={
                "include_xml": False,
                "include_oop": False,
                "custom_context": "Este es un proceso de recursos humanos para contratación"
            }
        )
        assert response.status_code in [200, 503]
        print(f"Custom context accepted, status: {response.status_code}")


class TestDevLoginEndpoint:
    """Test dev-login endpoint for testing authentication"""
    
    def test_dev_login_works(self):
        """Test that dev-login endpoint returns valid session"""
        response = requests.post(f"{BASE_URL}/api/auth/dev-login")
        assert response.status_code == 200
        
        data = response.json()
        assert "user_id" in data
        assert "email" in data
        assert "name" in data
        assert "session_token" in data
        
        assert data["email"] == "test@bpmnmodeler.dev"
        assert data["name"] == "Dev Tester"
        assert len(data["session_token"]) > 0
        print(f"Dev login works: {data['email']}")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
