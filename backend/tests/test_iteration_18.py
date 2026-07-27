# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""
Iteration 18 Tests: i18n translations and UpgradeModal/Limits functionality
Tests:
- Free user limits (OOP classes, components, export)
- Subscription user has no restrictions
- Limits endpoint returns correct data
"""
import pytest
import requests
import os

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')

class TestHealthAndAuth:
    """Basic health and auth tests"""
    
    def test_health_endpoint(self):
        """Test health endpoint is accessible"""
        response = requests.get(f"{BASE_URL}/api/health")
        assert response.status_code == 200
        data = response.json()
        assert data["status"] == "healthy"
        print("SUCCESS: Health endpoint working")
    
    def test_dev_login(self):
        """Test dev login returns session token"""
        response = requests.post(f"{BASE_URL}/api/auth/dev-login")
        assert response.status_code == 200
        data = response.json()
        assert "session_token" in data
        assert "user_id" in data
        assert "email" in data
        print(f"SUCCESS: Dev login working, user: {data['email']}")


class TestFreeUserLimits:
    """Test free user plan limits"""
    
    @pytest.fixture(autouse=True)
    def setup_free_user(self):
        """Set user to free role before tests"""
        import subprocess
        subprocess.run([
            "mongosh", "--quiet", "mongodb://localhost:27017/test_database", "--eval",
            'db.users.updateOne({email: "test@bpmnmodeler.dev"}, {$set: {role: "free"}})'
        ], capture_output=True)
        yield
        # Reset to subscription after tests
        subprocess.run([
            "mongosh", "--quiet", "mongodb://localhost:27017/test_database", "--eval",
            'db.users.updateOne({email: "test@bpmnmodeler.dev"}, {$set: {role: "subscription"}})'
        ], capture_output=True)
    
    def get_auth_token(self):
        """Get auth token for free user"""
        response = requests.post(f"{BASE_URL}/api/auth/dev-login")
        return response.json()["session_token"]
    
    def test_free_user_limits_endpoint(self):
        """Test limits endpoint returns correct data for free user"""
        token = self.get_auth_token()
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.get(f"{BASE_URL}/api/auth/limits", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert data["role"] == "free"
        assert data["restricted"] == True
        assert "limits" in data
        
        # Check all limit types are present
        limits = data["limits"]
        assert "diagrams" in limits
        assert "ai" in limits
        assert "oop" in limits
        assert "components" in limits
        assert "export" in limits
        
        # Check export is not allowed for free users
        assert limits["export"]["allowed"] == False
        
        print(f"SUCCESS: Free user limits endpoint working")
        print(f"  - Diagrams: {limits['diagrams']['current']}/{limits['diagrams']['max']}")
        print(f"  - OOP: {limits['oop']['current']}/{limits['oop']['max']}")
        print(f"  - Components: {limits['components']['current']}/{limits['components']['max']}")
    
    def test_free_user_export_blocked(self):
        """Test free user cannot export projects"""
        token = self.get_auth_token()
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get a project ID
        response = requests.get(f"{BASE_URL}/api/projects", headers=headers)
        if response.status_code == 200 and len(response.json()) > 0:
            project_id = response.json()[0]["id"]
            
            # Try to export
            response = requests.get(f"{BASE_URL}/api/projects/{project_id}/export", headers=headers)
            assert response.status_code == 403
            data = response.json()
            assert "free plan" in data["detail"].lower() or "not available" in data["detail"].lower()
            print("SUCCESS: Free user export correctly blocked")
        else:
            pytest.skip("No projects available for export test")


class TestSubscriptionUser:
    """Test subscription user has no restrictions"""
    
    @pytest.fixture(autouse=True)
    def setup_subscription_user(self):
        """Ensure user is subscription role"""
        import subprocess
        subprocess.run([
            "mongosh", "--quiet", "mongodb://localhost:27017/test_database", "--eval",
            'db.users.updateOne({email: "test@bpmnmodeler.dev"}, {$set: {role: "subscription"}})'
        ], capture_output=True)
        yield
    
    def get_auth_token(self):
        """Get auth token for subscription user"""
        response = requests.post(f"{BASE_URL}/api/auth/dev-login")
        return response.json()["session_token"]
    
    def test_subscription_user_limits_endpoint(self):
        """Test limits endpoint returns no restrictions for subscription user"""
        token = self.get_auth_token()
        headers = {"Authorization": f"Bearer {token}"}
        
        response = requests.get(f"{BASE_URL}/api/auth/limits", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        assert data["role"] == "subscription"
        assert data["restricted"] == False
        assert data["limits"] == {}
        
        print("SUCCESS: Subscription user has no restrictions")
    
    def test_subscription_user_can_export(self):
        """Test subscription user can export projects"""
        token = self.get_auth_token()
        headers = {"Authorization": f"Bearer {token}"}
        
        # Get a project ID
        response = requests.get(f"{BASE_URL}/api/projects", headers=headers)
        if response.status_code == 200 and len(response.json()) > 0:
            project_id = response.json()[0]["id"]
            
            # Try to export
            response = requests.get(f"{BASE_URL}/api/projects/{project_id}/export", headers=headers)
            assert response.status_code == 200
            data = response.json()
            assert "format" in data
            assert data["format"] == "bpmn-modeler-export"
            print("SUCCESS: Subscription user can export projects")
        else:
            pytest.skip("No projects available for export test")


class TestOOPClassLimits:
    """Test OOP class creation limits for free users"""
    
    @pytest.fixture(autouse=True)
    def setup_and_cleanup(self):
        """Set user to free and cleanup test classes"""
        import subprocess
        # Set to free
        subprocess.run([
            "mongosh", "--quiet", "mongodb://localhost:27017/test_database", "--eval",
            'db.users.updateOne({email: "test@bpmnmodeler.dev"}, {$set: {role: "free"}})'
        ], capture_output=True)
        # Cleanup test classes
        subprocess.run([
            "mongosh", "--quiet", "mongodb://localhost:27017/test_database", "--eval",
            'db.oop_classes.deleteMany({name: /^TEST_LIMIT_/})'
        ], capture_output=True)
        yield
        # Cleanup after test
        subprocess.run([
            "mongosh", "--quiet", "mongodb://localhost:27017/test_database", "--eval",
            'db.oop_classes.deleteMany({name: /^TEST_LIMIT_/})'
        ], capture_output=True)
        # Reset to subscription
        subprocess.run([
            "mongosh", "--quiet", "mongodb://localhost:27017/test_database", "--eval",
            'db.users.updateOne({email: "test@bpmnmodeler.dev"}, {$set: {role: "subscription"}})'
        ], capture_output=True)
    
    def get_auth_token(self):
        """Get auth token"""
        response = requests.post(f"{BASE_URL}/api/auth/dev-login")
        return response.json()["session_token"]
    
    def test_oop_class_limit_enforced(self):
        """Test that OOP class limit is enforced for free users"""
        token = self.get_auth_token()
        headers = {"Authorization": f"Bearer {token}", "Content-Type": "application/json"}
        
        # Create 10 classes (the limit)
        for i in range(10):
            response = requests.post(
                f"{BASE_URL}/api/oop-classes",
                headers=headers,
                json={"name": f"TEST_LIMIT_Class_{i}", "description": f"Test class {i}", "category": "other", "properties": []}
            )
            assert response.status_code == 200, f"Failed to create class {i}: {response.text}"
        
        print("SUCCESS: Created 10 OOP classes (at limit)")
        
        # Try to create 11th class (should fail)
        response = requests.post(
            f"{BASE_URL}/api/oop-classes",
            headers=headers,
            json={"name": "TEST_LIMIT_Class_11", "description": "Test class 11", "category": "other", "properties": []}
        )
        assert response.status_code == 403
        data = response.json()
        assert "limit" in data["detail"].lower() or "max" in data["detail"].lower()
        print("SUCCESS: 11th OOP class creation correctly blocked")


if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
