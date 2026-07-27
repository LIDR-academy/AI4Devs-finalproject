# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""
Test Demo User Feature - Iteration 19
Tests:
- Demo login with correct/incorrect credentials
- Demo user read-only restrictions (middleware blocks POST/PUT/DELETE)
- Demo user can read data (GET endpoints)
- Normal user (dev-login) can still create/modify data
- /auth/me returns is_demo=true for demo user
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

# Demo credentials from environment
DEMO_EMAIL = os.environ.get("DEMO_EMAIL", "demo@bpmnmodeler.app")
DEMO_PASSWORD = os.environ.get("DEMO_PASSWORD", "demo")


class TestDemoLogin:
    """Test demo login endpoint"""
    
    def test_demo_login_success(self):
        """POST /api/auth/demo-login with correct credentials returns user with is_demo=true"""
        response = requests.post(f"{BASE_URL}/api/auth/demo-login", json={
            "email": DEMO_EMAIL,
            "password": DEMO_PASSWORD
        })
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["email"] == DEMO_EMAIL
        assert data["name"] == "Demo User"
        assert data["is_demo"] == True
        assert "session_token" in data
        assert data["role"] == "subscription"
        print(f"✓ Demo login successful: {data['email']}, is_demo={data['is_demo']}")
    
    def test_demo_login_wrong_password(self):
        """POST /api/auth/demo-login with wrong password returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/demo-login", json={
            "email": DEMO_EMAIL,
            "password": "wrongpassword"
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "detail" in data
        print(f"✓ Wrong password rejected: {data['detail']}")
    
    def test_demo_login_wrong_email(self):
        """POST /api/auth/demo-login with wrong email returns 401"""
        response = requests.post(f"{BASE_URL}/api/auth/demo-login", json={
            "email": "wrong@email.com",
            "password": DEMO_PASSWORD
        })
        assert response.status_code == 401, f"Expected 401, got {response.status_code}: {response.text}"
        print("✓ Wrong email rejected")


class TestDemoUserReadAccess:
    """Test that demo user can read data"""
    
    @pytest.fixture(autouse=True)
    def setup_demo_session(self):
        """Get demo session token"""
        response = requests.post(f"{BASE_URL}/api/auth/demo-login", json={
            "email": DEMO_EMAIL,
            "password": DEMO_PASSWORD
        })
        assert response.status_code == 200
        self.token = response.json()["session_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_demo_user_auth_me(self):
        """GET /api/auth/me returns is_demo=true for demo user"""
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["email"] == DEMO_EMAIL
        assert data["is_demo"] == True
        print(f"✓ /auth/me returns is_demo=true: {data}")
    
    def test_demo_user_can_read_diagrams(self):
        """GET /api/diagrams works for demo user"""
        response = requests.get(f"{BASE_URL}/api/diagrams", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Demo user can read diagrams: {len(data)} diagrams")
    
    def test_demo_user_can_read_projects(self):
        """GET /api/projects works for demo user"""
        response = requests.get(f"{BASE_URL}/api/projects", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Demo user can read projects: {len(data)} projects")
    
    def test_demo_user_can_read_oop_classes(self):
        """GET /api/oop-classes works for demo user"""
        response = requests.get(f"{BASE_URL}/api/oop-classes", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Demo user can read OOP classes: {len(data)} classes")
    
    def test_demo_user_can_read_components(self):
        """GET /api/components works for demo user"""
        response = requests.get(f"{BASE_URL}/api/components", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert isinstance(data, list)
        print(f"✓ Demo user can read components: {len(data)} components")


class TestDemoUserWriteRestrictions:
    """Test that demo user cannot create/modify/delete data"""
    
    @pytest.fixture(autouse=True)
    def setup_demo_session(self):
        """Get demo session token"""
        response = requests.post(f"{BASE_URL}/api/auth/demo-login", json={
            "email": DEMO_EMAIL,
            "password": DEMO_PASSWORD
        })
        assert response.status_code == 200
        self.token = response.json()["session_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_demo_user_cannot_create_diagram(self):
        """POST /api/diagrams returns 403 for demo user"""
        response = requests.post(f"{BASE_URL}/api/diagrams", headers=self.headers, json={
            "name": "TEST_Demo_Diagram",
            "description": "Test diagram"
        })
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "demo" in data.get("detail", "").lower() or "read-only" in data.get("detail", "").lower()
        print(f"✓ Demo user blocked from creating diagram: {data['detail']}")
    
    def test_demo_user_cannot_create_project(self):
        """POST /api/projects returns 403 for demo user"""
        response = requests.post(f"{BASE_URL}/api/projects", headers=self.headers, json={
            "name": "TEST_Demo_Project",
            "description": "Test project"
        })
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "demo" in data.get("detail", "").lower() or "read-only" in data.get("detail", "").lower()
        print(f"✓ Demo user blocked from creating project: {data['detail']}")
    
    def test_demo_user_cannot_create_oop_class(self):
        """POST /api/oop-classes returns 403 for demo user"""
        response = requests.post(f"{BASE_URL}/api/oop-classes", headers=self.headers, json={
            "name": "TEST_DemoClass",
            "description": "Test class",
            "properties": []
        })
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "demo" in data.get("detail", "").lower() or "read-only" in data.get("detail", "").lower()
        print(f"✓ Demo user blocked from creating OOP class: {data['detail']}")
    
    def test_demo_user_cannot_create_component(self):
        """POST /api/components returns 403 for demo user"""
        response = requests.post(f"{BASE_URL}/api/components", headers=self.headers, json={
            "name": "TEST_DemoComponent",
            "description": "Test component",
            "xml_fragment": "<test/>"
        })
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "demo" in data.get("detail", "").lower() or "read-only" in data.get("detail", "").lower()
        print(f"✓ Demo user blocked from creating component: {data['detail']}")
    
    def test_demo_user_cannot_delete_diagram(self):
        """DELETE /api/diagrams/{id} returns 403 for demo user"""
        # Use a known diagram ID from seed data
        diagram_id = "5dc38ab6-9ab7-4907-9f95-4a98e88e5dc0"
        response = requests.delete(f"{BASE_URL}/api/diagrams/{diagram_id}", headers=self.headers)
        assert response.status_code == 403, f"Expected 403, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert "demo" in data.get("detail", "").lower() or "read-only" in data.get("detail", "").lower()
        print(f"✓ Demo user blocked from deleting diagram: {data['detail']}")


class TestNormalUserCanModify:
    """Test that normal user (dev-login) can still create/modify data"""
    
    @pytest.fixture(autouse=True)
    def setup_dev_session(self):
        """Get dev session token"""
        response = requests.post(f"{BASE_URL}/api/auth/dev-login")
        assert response.status_code == 200
        self.token = response.json()["session_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
        self.created_ids = []
    
    def teardown_method(self, method):
        """Cleanup created test data"""
        for item_type, item_id in self.created_ids:
            try:
                requests.delete(f"{BASE_URL}/api/{item_type}/{item_id}", headers=self.headers)
            except:
                pass
    
    def test_normal_user_auth_me_not_demo(self):
        """GET /api/auth/me returns is_demo=false for normal user"""
        response = requests.get(f"{BASE_URL}/api/auth/me", headers=self.headers)
        assert response.status_code == 200
        
        data = response.json()
        assert data.get("is_demo", False) == False
        print(f"✓ Normal user is_demo=false: {data['email']}")
    
    def test_normal_user_can_create_oop_class(self):
        """POST /api/oop-classes works for normal user"""
        response = requests.post(f"{BASE_URL}/api/oop-classes", headers=self.headers, json={
            "name": "TEST_NormalUserClass",
            "description": "Test class from normal user",
            "properties": [{"name": "id", "type": "string", "required": True}]
        })
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["name"] == "TEST_NormalUserClass"
        self.created_ids.append(("oop-classes", data["id"]))
        print(f"✓ Normal user can create OOP class: {data['id']}")
    
    def test_normal_user_can_create_component(self):
        """POST /api/components works for normal user"""
        response = requests.post(f"{BASE_URL}/api/components", headers=self.headers, json={
            "name": "TEST_NormalUserComponent",
            "description": "Test component from normal user",
            "xml_fragment": "<bpmn:task id='test'/>"
        })
        assert response.status_code in [200, 201], f"Expected 200/201, got {response.status_code}: {response.text}"
        
        data = response.json()
        assert data["name"] == "TEST_NormalUserComponent"
        self.created_ids.append(("components", data["id"]))
        print(f"✓ Normal user can create component: {data['id']}")


class TestDemoAllowedWritePaths:
    """Test that demo user CAN access certain write paths (login, logout, language)"""
    
    @pytest.fixture(autouse=True)
    def setup_demo_session(self):
        """Get demo session token"""
        response = requests.post(f"{BASE_URL}/api/auth/demo-login", json={
            "email": DEMO_EMAIL,
            "password": DEMO_PASSWORD
        })
        assert response.status_code == 200
        self.token = response.json()["session_token"]
        self.headers = {"Authorization": f"Bearer {self.token}"}
    
    def test_demo_user_can_set_language(self):
        """PUT /api/i18n/user-language works for demo user"""
        response = requests.put(f"{BASE_URL}/api/i18n/user-language", headers=self.headers, json={
            "language": "en"
        })
        # Should be 200 (allowed) not 403 (blocked)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("✓ Demo user can set language preference")
    
    def test_demo_user_can_logout(self):
        """POST /api/auth/logout works for demo user"""
        response = requests.post(f"{BASE_URL}/api/auth/logout", headers=self.headers)
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("✓ Demo user can logout")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
