# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""
Test Free User Limits - Iteration 17
Tests for free user restrictions: max 2 diagrams, 6 AI uses/month, max 10 OOP classes, max 10 components, export blocked.
Subscription and admin users have no limits.
"""
import pytest
import requests
import os
from pymongo import MongoClient

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')

# Test user constants
TEST_USER_ID = "user_test_dev_001"
TEST_USER_EMAIL = "test@bpmnmodeler.dev"


@pytest.fixture(scope="module")
def mongo_client():
    """MongoDB client for direct database operations."""
    client = MongoClient(MONGO_URL)
    yield client[DB_NAME]
    client.close()


@pytest.fixture(scope="module")
def session():
    """Requests session with auth headers."""
    s = requests.Session()
    s.headers.update({"Content-Type": "application/json"})
    return s


@pytest.fixture(scope="module")
def auth_token(session):
    """Get authentication token via dev-login."""
    response = session.post(f"{BASE_URL}/api/auth/dev-login")
    assert response.status_code == 200, f"Dev login failed: {response.text}"
    data = response.json()
    token = data.get("session_token")
    assert token, "No session_token in dev-login response"
    session.headers.update({"Authorization": f"Bearer {token}"})
    return token


@pytest.fixture
def set_user_role_free(mongo_client, auth_token):
    """Set test user role to 'free' before test."""
    mongo_client.users.update_one(
        {"user_id": TEST_USER_ID},
        {"$set": {"role": "free"}}
    )
    yield
    # Reset to subscription after test
    mongo_client.users.update_one(
        {"user_id": TEST_USER_ID},
        {"$set": {"role": "subscription"}}
    )


@pytest.fixture
def set_user_role_subscription(mongo_client, auth_token):
    """Set test user role to 'subscription' before test."""
    mongo_client.users.update_one(
        {"user_id": TEST_USER_ID},
        {"$set": {"role": "subscription"}}
    )
    yield


class TestLimitsEndpoint:
    """Tests for GET /api/auth/limits endpoint."""

    def test_limits_returns_restricted_for_free_user(self, session, auth_token, set_user_role_free):
        """GET /api/auth/limits returns correct limits for free users."""
        response = session.get(f"{BASE_URL}/api/auth/limits")
        assert response.status_code == 200, f"Limits endpoint failed: {response.text}"
        
        data = response.json()
        assert data["role"] == "free", f"Expected role 'free', got {data['role']}"
        assert data["restricted"] == True, "Expected restricted=True for free user"
        assert "limits" in data, "Missing 'limits' in response"
        
        limits = data["limits"]
        assert "diagrams" in limits, "Missing diagrams limit"
        assert "ai" in limits, "Missing ai limit"
        assert "oop" in limits, "Missing oop limit"
        assert "components" in limits, "Missing components limit"
        assert "export" in limits, "Missing export limit"
        
        # Verify limit values
        assert limits["diagrams"]["max"] == 2, f"Expected max_diagrams=2, got {limits['diagrams']['max']}"
        assert limits["ai"]["max"] == 6, f"Expected max_ai=6, got {limits['ai']['max']}"
        assert limits["oop"]["max"] == 10, f"Expected max_oop=10, got {limits['oop']['max']}"
        assert limits["components"]["max"] == 10, f"Expected max_components=10, got {limits['components']['max']}"
        assert limits["export"]["allowed"] == False, "Expected export.allowed=False for free user"
        
        print("✓ GET /api/auth/limits returns correct limits for free users")

    def test_limits_returns_unrestricted_for_subscription_user(self, session, auth_token, set_user_role_subscription):
        """GET /api/auth/limits returns restricted=false for subscription users."""
        response = session.get(f"{BASE_URL}/api/auth/limits")
        assert response.status_code == 200, f"Limits endpoint failed: {response.text}"
        
        data = response.json()
        assert data["role"] == "subscription", f"Expected role 'subscription', got {data['role']}"
        assert data["restricted"] == False, "Expected restricted=False for subscription user"
        assert data["limits"] == {}, "Expected empty limits for subscription user"
        
        print("✓ GET /api/auth/limits returns restricted=false for subscription users")


class TestDiagramLimits:
    """Tests for diagram creation limits."""

    def test_diagram_creation_allowed_for_subscription(self, session, auth_token, set_user_role_subscription, mongo_client):
        """POST /api/diagrams works for subscription users without limit."""
        # Create a diagram
        response = session.post(f"{BASE_URL}/api/diagrams", json={
            "name": "TEST_Subscription_Diagram",
            "description": "Test diagram for subscription user",
            "current_xml": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Inicio" />
  </bpmn:process>
</bpmn:definitions>"""
        })
        assert response.status_code == 200, f"Diagram creation failed: {response.text}"
        
        data = response.json()
        diagram_id = data.get("id")
        assert diagram_id, "No diagram ID returned"
        
        # Cleanup
        session.delete(f"{BASE_URL}/api/diagrams/{diagram_id}")
        print("✓ POST /api/diagrams works for subscription users")

    def test_diagram_creation_limit_for_free_user(self, session, auth_token, set_user_role_free, mongo_client):
        """POST /api/diagrams returns 403 when free user exceeds 2 diagrams limit."""
        # First, clean up any existing test diagrams created by this user
        existing = list(mongo_client.diagrams.find({"created_by": TEST_USER_ID}))
        for d in existing:
            mongo_client.diagrams.delete_one({"id": d["id"]})
        
        # Create 2 diagrams (should succeed)
        created_ids = []
        for i in range(2):
            # Insert directly to simulate existing diagrams
            mongo_client.diagrams.insert_one({
                "id": f"test_limit_diag_{i}",
                "name": f"TEST_Free_Diagram_{i}",
                "created_by": TEST_USER_ID,
                "current_xml": "<test/>"
            })
            created_ids.append(f"test_limit_diag_{i}")
        
        # Try to create a 3rd diagram (should fail with 403)
        response = session.post(f"{BASE_URL}/api/diagrams", json={
            "name": "TEST_Free_Diagram_3",
            "description": "This should fail",
            "current_xml": """<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" id="Definitions_1" targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="Process_1" isExecutable="true">
    <bpmn:startEvent id="StartEvent_1" name="Inicio" />
  </bpmn:process>
</bpmn:definitions>"""
        })
        
        # Cleanup
        for did in created_ids:
            mongo_client.diagrams.delete_one({"id": did})
        
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        assert "limit" in response.text.lower() or "free" in response.text.lower(), "Expected limit error message"
        
        print("✓ POST /api/diagrams returns 403 when free user exceeds 2 diagrams limit")


class TestOOPClassLimits:
    """Tests for OOP class creation limits."""

    def test_oop_class_creation_allowed_for_subscription(self, session, auth_token, set_user_role_subscription):
        """POST /api/oop-classes works for subscription users."""
        response = session.post(f"{BASE_URL}/api/oop-classes", json={
            "name": "TEST_SubscriptionClass",
            "description": "Test class",
            "category": "other",
            "properties": []
        })
        assert response.status_code == 200, f"OOP class creation failed: {response.text}"
        
        data = response.json()
        class_id = data.get("id")
        
        # Cleanup
        if class_id:
            session.delete(f"{BASE_URL}/api/oop-classes/{class_id}")
        
        print("✓ POST /api/oop-classes works for subscription users")

    def test_oop_class_limit_for_free_user(self, session, auth_token, set_user_role_free, mongo_client):
        """POST /api/oop-classes returns 403 when free user exceeds 10 classes limit."""
        # Clean up existing test classes
        mongo_client.oop_classes.delete_many({"created_by": TEST_USER_ID})
        
        # Create 10 classes directly in DB
        created_ids = []
        for i in range(10):
            mongo_client.oop_classes.insert_one({
                "id": f"test_limit_class_{i}",
                "name": f"TEST_FreeClass_{i}",
                "created_by": TEST_USER_ID,
                "category": "other",
                "properties": []
            })
            created_ids.append(f"test_limit_class_{i}")
        
        # Try to create 11th class (should fail)
        response = session.post(f"{BASE_URL}/api/oop-classes", json={
            "name": "TEST_FreeClass_11",
            "description": "This should fail",
            "category": "other",
            "properties": []
        })
        
        # Cleanup
        for cid in created_ids:
            mongo_client.oop_classes.delete_one({"id": cid})
        
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        assert "limit" in response.text.lower() or "free" in response.text.lower(), "Expected limit error message"
        
        print("✓ POST /api/oop-classes returns 403 when free user exceeds 10 classes limit")


class TestComponentLimits:
    """Tests for component creation limits."""

    def test_component_creation_allowed_for_subscription(self, session, auth_token, set_user_role_subscription):
        """POST /api/components works for subscription users."""
        response = session.post(f"{BASE_URL}/api/components", json={
            "name": "TEST_SubscriptionComponent",
            "description": "Test component",
            "category": "other",
            "xml_fragment": "<test/>",
            "is_public": True
        })
        assert response.status_code == 200, f"Component creation failed: {response.text}"
        
        data = response.json()
        comp_id = data.get("id")
        
        # Cleanup
        if comp_id:
            session.delete(f"{BASE_URL}/api/components/{comp_id}")
        
        print("✓ POST /api/components works for subscription users")

    def test_component_limit_for_free_user(self, session, auth_token, set_user_role_free, mongo_client):
        """POST /api/components returns 403 when free user exceeds 10 components limit."""
        # Clean up existing test components
        mongo_client.bpmn_components.delete_many({"created_by": TEST_USER_ID})
        
        # Create 10 components directly in DB
        created_ids = []
        for i in range(10):
            mongo_client.bpmn_components.insert_one({
                "id": f"test_limit_comp_{i}",
                "name": f"TEST_FreeComponent_{i}",
                "created_by": TEST_USER_ID,
                "category": "other",
                "xml_fragment": "<test/>",
                "is_public": True
            })
            created_ids.append(f"test_limit_comp_{i}")
        
        # Try to create 11th component (should fail)
        response = session.post(f"{BASE_URL}/api/components", json={
            "name": "TEST_FreeComponent_11",
            "description": "This should fail",
            "category": "other",
            "xml_fragment": "<test/>",
            "is_public": True
        })
        
        # Cleanup
        for cid in created_ids:
            mongo_client.bpmn_components.delete_one({"id": cid})
        
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        assert "limit" in response.text.lower() or "free" in response.text.lower(), "Expected limit error message"
        
        print("✓ POST /api/components returns 403 when free user exceeds 10 components limit")


class TestExportLimits:
    """Tests for export restrictions."""

    def test_export_blocked_for_free_user(self, session, auth_token, set_user_role_free, mongo_client):
        """GET /api/projects/{id}/export returns 403 for free users."""
        # First create a project
        project_response = session.post(f"{BASE_URL}/api/projects", json={
            "name": "TEST_ExportProject",
            "description": "Test project for export"
        })
        
        if project_response.status_code != 200:
            # Try to find an existing project
            projects_response = session.get(f"{BASE_URL}/api/projects")
            if projects_response.status_code == 200:
                projects = projects_response.json()
                if projects:
                    project_id = projects[0]["id"]
                else:
                    pytest.skip("No projects available for export test")
            else:
                pytest.skip("Cannot create or find projects for export test")
        else:
            project_id = project_response.json().get("id")
        
        # Try to export (should fail for free user)
        response = session.get(f"{BASE_URL}/api/projects/{project_id}/export")
        
        # Cleanup if we created the project
        if project_response.status_code == 200:
            session.delete(f"{BASE_URL}/api/projects/{project_id}")
        
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        assert "free" in response.text.lower() or "export" in response.text.lower(), "Expected export restriction message"
        
        print("✓ GET /api/projects/{id}/export returns 403 for free users")

    def test_export_allowed_for_subscription_user(self, session, auth_token, set_user_role_subscription, mongo_client):
        """GET /api/projects/{id}/export works for subscription users."""
        # First create a project
        project_response = session.post(f"{BASE_URL}/api/projects", json={
            "name": "TEST_ExportProjectSub",
            "description": "Test project for export"
        })
        
        if project_response.status_code != 200:
            # Try to find an existing project
            projects_response = session.get(f"{BASE_URL}/api/projects")
            if projects_response.status_code == 200:
                projects = projects_response.json()
                if projects:
                    project_id = projects[0]["id"]
                else:
                    pytest.skip("No projects available for export test")
            else:
                pytest.skip("Cannot create or find projects for export test")
        else:
            project_id = project_response.json().get("id")
        
        # Try to export (should succeed for subscription user)
        response = session.get(f"{BASE_URL}/api/projects/{project_id}/export")
        
        # Cleanup if we created the project
        if project_response.status_code == 200:
            session.delete(f"{BASE_URL}/api/projects/{project_id}")
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "format" in data, "Missing format in export response"
        assert data["format"] == "bpmn-modeler-export", "Invalid export format"
        
        print("✓ GET /api/projects/{id}/export works for subscription users")


class TestRoleReset:
    """Ensure test user role is reset to subscription after all tests."""

    def test_reset_user_role(self, mongo_client, auth_token):
        """Reset test user role to subscription."""
        mongo_client.users.update_one(
            {"user_id": TEST_USER_ID},
            {"$set": {"role": "subscription"}}
        )
        
        # Verify
        user = mongo_client.users.find_one({"user_id": TEST_USER_ID})
        assert user["role"] == "subscription", "Failed to reset user role"
        
        print("✓ Test user role reset to subscription")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
