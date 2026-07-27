# Copyright (c) 2026 sdd-ia, LLC. All rights reserved.

"""
Test User Role System for BPMN Modeler
Tests:
- GET /api/auth/me returns user with role field
- POST /api/auth/dev-login returns user with role field
- GET /api/admin/users lists all users (admin only, 403 for non-admin)
- PUT /api/admin/users/{user_id}/role changes user role (admin only, 403 for non-admin)
- POST /api/i18n/translations/bulk is protected (admin only, 403 for non-admin)
- PUT /api/i18n/translations/{lang} is protected (admin only)
- DELETE /api/i18n/translations/{lang}/{key} is protected (admin only)
"""
import pytest
import requests
import os
from pymongo import MongoClient

BASE_URL = os.environ.get('REACT_APP_BACKEND_URL', '').rstrip('/')
MONGO_URL = os.environ.get('MONGO_URL', 'mongodb://localhost:27017')
DB_NAME = os.environ.get('DB_NAME', 'test_database')

# MongoDB client for direct role manipulation
mongo_client = MongoClient(MONGO_URL)
db = mongo_client[DB_NAME]


@pytest.fixture(scope="module")
def session():
    """Create a requests session."""
    return requests.Session()


@pytest.fixture(scope="module")
def dev_login_token(session):
    """Get dev login token (subscription role by default)."""
    response = session.post(f"{BASE_URL}/api/auth/dev-login")
    assert response.status_code == 200, f"Dev login failed: {response.text}"
    data = response.json()
    return data.get("session_token")


@pytest.fixture(scope="module")
def dev_user_id(session):
    """Get dev user ID."""
    response = session.post(f"{BASE_URL}/api/auth/dev-login")
    assert response.status_code == 200
    return response.json().get("user_id")


def set_user_role(email: str, role: str):
    """Directly set user role in MongoDB."""
    db.users.update_one({"email": email}, {"$set": {"role": role}})


def get_user_role(email: str) -> str:
    """Get user role from MongoDB."""
    user = db.users.find_one({"email": email})
    return user.get("role") if user else None


class TestDevLoginReturnsRole:
    """Test that dev-login returns user with role field."""
    
    def test_dev_login_returns_role_field(self, session):
        """POST /api/auth/dev-login should return role field."""
        response = session.post(f"{BASE_URL}/api/auth/dev-login")
        assert response.status_code == 200
        data = response.json()
        
        # Verify role field exists
        assert "role" in data, "Response should contain 'role' field"
        assert data["role"] in ["free", "subscription", "admin"], f"Invalid role: {data['role']}"
        
        # Verify other expected fields
        assert "user_id" in data
        assert "email" in data
        assert "session_token" in data
        print(f"✓ dev-login returns role: {data['role']}")


class TestAuthMeReturnsRole:
    """Test that /api/auth/me returns user with role field."""
    
    def test_auth_me_returns_role_field(self, session, dev_login_token):
        """GET /api/auth/me should return role field."""
        headers = {"Authorization": f"Bearer {dev_login_token}"}
        response = session.get(f"{BASE_URL}/api/auth/me", headers=headers)
        assert response.status_code == 200
        data = response.json()
        
        # Verify role field exists
        assert "role" in data, "Response should contain 'role' field"
        assert data["role"] in ["free", "subscription", "admin"], f"Invalid role: {data['role']}"
        print(f"✓ /api/auth/me returns role: {data['role']}")


class TestAdminUsersEndpoint:
    """Test GET /api/admin/users endpoint (admin only)."""
    
    def test_admin_users_returns_403_for_non_admin(self, session, dev_login_token):
        """Non-admin users should get 403 when accessing /api/admin/users."""
        # Ensure dev user is NOT admin
        set_user_role("test@bpmnmodeler.dev", "subscription")
        
        # Get fresh token after role change
        login_resp = session.post(f"{BASE_URL}/api/auth/dev-login")
        token = login_resp.json().get("session_token")
        
        headers = {"Authorization": f"Bearer {token}"}
        response = session.get(f"{BASE_URL}/api/admin/users", headers=headers)
        
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ Non-admin gets 403 on /api/admin/users")
    
    def test_admin_users_returns_200_for_admin(self, session):
        """Admin users should get 200 and list of users."""
        # Set dev user as admin
        set_user_role("test@bpmnmodeler.dev", "admin")
        
        # Get fresh token after role change
        login_resp = session.post(f"{BASE_URL}/api/auth/dev-login")
        token = login_resp.json().get("session_token")
        
        headers = {"Authorization": f"Bearer {token}"}
        response = session.get(f"{BASE_URL}/api/admin/users", headers=headers)
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        
        # Verify response is a list of users
        assert isinstance(data, list), "Response should be a list"
        if len(data) > 0:
            # Verify user objects have expected fields
            user = data[0]
            assert "user_id" in user or "email" in user, "User should have user_id or email"
        
        print(f"✓ Admin gets 200 on /api/admin/users, found {len(data)} users")
        
        # Reset role back to subscription
        set_user_role("test@bpmnmodeler.dev", "subscription")


class TestAdminUpdateRoleEndpoint:
    """Test PUT /api/admin/users/{user_id}/role endpoint (admin only)."""
    
    def test_update_role_returns_403_for_non_admin(self, session, dev_user_id):
        """Non-admin users should get 403 when trying to change roles."""
        # Ensure dev user is NOT admin
        set_user_role("test@bpmnmodeler.dev", "subscription")
        
        # Get fresh token
        login_resp = session.post(f"{BASE_URL}/api/auth/dev-login")
        token = login_resp.json().get("session_token")
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        response = session.put(
            f"{BASE_URL}/api/admin/users/{dev_user_id}/role",
            headers=headers,
            json={"role": "free"}
        )
        
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ Non-admin gets 403 on PUT /api/admin/users/{user_id}/role")
    
    def test_update_role_works_for_admin(self, session, dev_user_id):
        """Admin users should be able to change other users' roles."""
        # Set dev user as admin
        set_user_role("test@bpmnmodeler.dev", "admin")
        
        # Get fresh token
        login_resp = session.post(f"{BASE_URL}/api/auth/dev-login")
        token = login_resp.json().get("session_token")
        
        # Create a test user to modify (or use existing)
        # First, let's get the list of users
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        users_resp = session.get(f"{BASE_URL}/api/admin/users", headers=headers)
        users = users_resp.json()
        
        # Find a user that's not the current admin (or use dev user itself for testing)
        target_user_id = dev_user_id
        
        # Change role to 'free'
        response = session.put(
            f"{BASE_URL}/api/admin/users/{target_user_id}/role",
            headers=headers,
            json={"role": "free"}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        data = response.json()
        assert data.get("role") == "free" or data.get("status") == "ok"
        
        # Verify role was actually changed
        db_role = get_user_role("test@bpmnmodeler.dev")
        assert db_role == "free", f"Expected role 'free' in DB, got {db_role}"
        
        print("✓ Admin can change user roles via PUT /api/admin/users/{user_id}/role")
        
        # Reset role back to subscription
        set_user_role("test@bpmnmodeler.dev", "subscription")
    
    def test_update_role_rejects_invalid_role(self, session, dev_user_id):
        """Should reject invalid role values."""
        # Set dev user as admin
        set_user_role("test@bpmnmodeler.dev", "admin")
        
        # Get fresh token
        login_resp = session.post(f"{BASE_URL}/api/auth/dev-login")
        token = login_resp.json().get("session_token")
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        response = session.put(
            f"{BASE_URL}/api/admin/users/{dev_user_id}/role",
            headers=headers,
            json={"role": "invalid_role"}
        )
        
        assert response.status_code == 400, f"Expected 400 for invalid role, got {response.status_code}"
        print("✓ Invalid role values are rejected with 400")
        
        # Reset role
        set_user_role("test@bpmnmodeler.dev", "subscription")


class TestI18nAdminProtection:
    """Test that i18n write endpoints are admin-only."""
    
    def test_bulk_translations_returns_403_for_non_admin(self, session):
        """POST /api/i18n/translations/bulk should return 403 for non-admin."""
        # Ensure dev user is NOT admin
        set_user_role("test@bpmnmodeler.dev", "subscription")
        
        # Get fresh token
        login_resp = session.post(f"{BASE_URL}/api/auth/dev-login")
        token = login_resp.json().get("session_token")
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        response = session.post(
            f"{BASE_URL}/api/i18n/translations/bulk",
            headers=headers,
            json={"es": {"test_key": "test_value"}}
        )
        
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ Non-admin gets 403 on POST /api/i18n/translations/bulk")
    
    def test_put_translations_returns_403_for_non_admin(self, session):
        """PUT /api/i18n/translations/{lang} should return 403 for non-admin."""
        # Ensure dev user is NOT admin
        set_user_role("test@bpmnmodeler.dev", "subscription")
        
        # Get fresh token
        login_resp = session.post(f"{BASE_URL}/api/auth/dev-login")
        token = login_resp.json().get("session_token")
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        response = session.put(
            f"{BASE_URL}/api/i18n/translations/es",
            headers=headers,
            json={"translations": {"test_key": "test_value"}}
        )
        
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ Non-admin gets 403 on PUT /api/i18n/translations/{lang}")
    
    def test_delete_translation_returns_403_for_non_admin(self, session):
        """DELETE /api/i18n/translations/{lang}/{key} should return 403 for non-admin."""
        # Ensure dev user is NOT admin
        set_user_role("test@bpmnmodeler.dev", "subscription")
        
        # Get fresh token
        login_resp = session.post(f"{BASE_URL}/api/auth/dev-login")
        token = login_resp.json().get("session_token")
        
        headers = {"Authorization": f"Bearer {token}"}
        
        response = session.delete(
            f"{BASE_URL}/api/i18n/translations/es/test_key",
            headers=headers
        )
        
        assert response.status_code == 403, f"Expected 403, got {response.status_code}"
        print("✓ Non-admin gets 403 on DELETE /api/i18n/translations/{lang}/{key}")
    
    def test_bulk_translations_works_for_admin(self, session):
        """POST /api/i18n/translations/bulk should work for admin."""
        # Set dev user as admin
        set_user_role("test@bpmnmodeler.dev", "admin")
        
        # Get fresh token
        login_resp = session.post(f"{BASE_URL}/api/auth/dev-login")
        token = login_resp.json().get("session_token")
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        response = session.post(
            f"{BASE_URL}/api/i18n/translations/bulk",
            headers=headers,
            json={"es": {"test_admin_key": "test_admin_value"}}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("✓ Admin can POST /api/i18n/translations/bulk")
        
        # Reset role
        set_user_role("test@bpmnmodeler.dev", "subscription")
    
    def test_put_translations_works_for_admin(self, session):
        """PUT /api/i18n/translations/{lang} should work for admin."""
        # Set dev user as admin
        set_user_role("test@bpmnmodeler.dev", "admin")
        
        # Get fresh token
        login_resp = session.post(f"{BASE_URL}/api/auth/dev-login")
        token = login_resp.json().get("session_token")
        
        headers = {
            "Authorization": f"Bearer {token}",
            "Content-Type": "application/json"
        }
        
        response = session.put(
            f"{BASE_URL}/api/i18n/translations/es",
            headers=headers,
            json={"translations": {"test_admin_key": "test_admin_value"}}
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("✓ Admin can PUT /api/i18n/translations/{lang}")
        
        # Reset role
        set_user_role("test@bpmnmodeler.dev", "subscription")
    
    def test_delete_translation_works_for_admin(self, session):
        """DELETE /api/i18n/translations/{lang}/{key} should work for admin."""
        # Set dev user as admin
        set_user_role("test@bpmnmodeler.dev", "admin")
        
        # Get fresh token
        login_resp = session.post(f"{BASE_URL}/api/auth/dev-login")
        token = login_resp.json().get("session_token")
        
        headers = {"Authorization": f"Bearer {token}"}
        
        response = session.delete(
            f"{BASE_URL}/api/i18n/translations/es/test_admin_key",
            headers=headers
        )
        
        assert response.status_code == 200, f"Expected 200, got {response.status_code}: {response.text}"
        print("✓ Admin can DELETE /api/i18n/translations/{lang}/{key}")
        
        # Reset role
        set_user_role("test@bpmnmodeler.dev", "subscription")


class TestI18nGetIsPublic:
    """Test that GET /api/i18n/translations is public (no auth required)."""
    
    def test_get_translations_is_public(self, session):
        """GET /api/i18n/translations should work without auth."""
        response = session.get(f"{BASE_URL}/api/i18n/translations")
        assert response.status_code == 200, f"Expected 200, got {response.status_code}"
        print("✓ GET /api/i18n/translations is public (no auth required)")


class TestRoleResolution:
    """Test that admin email always gets admin role."""
    
    def test_admin_email_gets_admin_role(self):
        """oscar.hidalgo.puertas@gmail.com should always be admin."""
        # Check if admin email exists in DB
        admin_user = db.users.find_one({"email": "oscar.hidalgo.puertas@gmail.com"})
        if admin_user:
            assert admin_user.get("role") == "admin", f"Admin email should have admin role, got {admin_user.get('role')}"
            print("✓ Admin email has admin role in database")
        else:
            print("⚠ Admin email user not found in database (will be created on first login)")


# Cleanup fixture to reset dev user role after all tests
@pytest.fixture(scope="module", autouse=True)
def cleanup(request):
    """Reset dev user role to subscription after all tests."""
    def reset_role():
        set_user_role("test@bpmnmodeler.dev", "subscription")
        print("\n✓ Reset dev user role to 'subscription'")
    
    request.addfinalizer(reset_role)
