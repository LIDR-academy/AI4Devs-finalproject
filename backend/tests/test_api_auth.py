"""
Tests for authentication API endpoints.
"""

import pytest
from fastapi.testclient import TestClient
from sqlalchemy.orm import Session

from app.core.security import get_password_hash
from app.models.user import User


class TestAuthEndpoints:
    """Test cases for authentication endpoints."""
    
    def test_register_new_user(self, client: TestClient, db_session: Session):
        """Test user registration with valid data."""
        user_data = {
            "email": "test@example.com",
            "password": "testpassword123",
            "full_name": "Test User"
        }
        
        response = client.post("/api/v1/auth/register", json=user_data)
        assert response.status_code == 201
        
        data = response.json()
        assert data["email"] == user_data["email"]
        assert data["full_name"] == user_data["full_name"]
        assert data["is_active"] is True
        assert data["is_superuser"] is False
        assert "id" in data
        assert "created_at" in data
        
        # Verify user was created in database
        db_user = db_session.query(User).filter(
            User.email == user_data["email"]
        ).first()
        assert db_user is not None
        assert db_user.email == user_data["email"]
    
    def test_register_duplicate_email(
        self, client: TestClient, db_session: Session
    ):
        """Test registration with existing email."""
        # Create existing user
        existing_user = User(
            email="existing@example.com",
            hashed_password=get_password_hash("password123"),
            full_name="Existing User",
            is_active=True
        )
        db_session.add(existing_user)
        db_session.commit()
        
        # Try to register with same email
        user_data = {
            "email": "existing@example.com",
            "password": "newpassword123",
            "full_name": "New User"
        }
        
        response = client.post("/api/v1/auth/register", json=user_data)
        assert response.status_code == 400
        assert "Email already registered" in response.json()["detail"]
    
    def test_register_invalid_email(self, client: TestClient):
        """Test registration with invalid email."""
        user_data = {
            "email": "invalid-email",
            "password": "testpassword123",
            "full_name": "Test User"
        }
        
        response = client.post("/api/v1/auth/register", json=user_data)
        assert response.status_code == 422  # Validation error
    
    def test_register_short_password(self, client: TestClient):
        """Test registration with short password."""
        user_data = {
            "email": "test@example.com",
            "password": "123",  # Too short
            "full_name": "Test User"
        }
        
        response = client.post("/api/v1/auth/register", json=user_data)
        assert response.status_code == 422  # Validation error
    
    def test_login_valid_credentials(
        self, client: TestClient, db_session: Session
    ):
        """Test login with valid credentials."""
        # Create test user
        password = "testpassword123"
        user = User(
            email="login@example.com",
            hashed_password=get_password_hash(password),
            full_name="Login User",
            is_active=True
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        
        # Login
        login_data = {
            "email": "login@example.com",
            "password": password
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        assert response.status_code == 200
        
        data = response.json()
        assert "access_token" in data
        assert data["token_type"] == "bearer"
        assert "expires_in" in data
        assert data["user"]["email"] == "login@example.com"
        assert data["user"]["id"] == user.id
    
    def test_login_invalid_email(self, client: TestClient):
        """Test login with non-existent email."""
        login_data = {
            "email": "nonexistent@example.com",
            "password": "password123"
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["message"]
    
    def test_login_invalid_password(self, client: TestClient, db_session: Session):
        """Test login with incorrect password."""
        # Create test user
        user = User(
            email="wrongpass@example.com",
            hashed_password=get_password_hash("correctpassword"),
            full_name="Test User",
            is_active=True
        )
        db_session.add(user)
        db_session.commit()
        
        # Try login with wrong password
        login_data = {
            "email": "wrongpass@example.com",
            "password": "wrongpassword"
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        assert response.status_code == 401
        assert "Incorrect email or password" in response.json()["message"]
    
    def test_login_inactive_user(self, client: TestClient, db_session: Session):
        """Test login with inactive user."""
        # Create inactive user
        password = "testpassword123"
        user = User(
            email="inactive@example.com",
            hashed_password=get_password_hash(password),
            full_name="Inactive User",
            is_active=False  # Inactive user
        )
        db_session.add(user)
        db_session.commit()
        
        # Try login
        login_data = {
            "email": "inactive@example.com",
            "password": password
        }
        
        response = client.post("/api/v1/auth/login", json=login_data)
        assert response.status_code == 400
        assert "Inactive user" in response.json()["detail"]
    
    def test_get_current_user_valid_token(self, client: TestClient, db_session: Session):
        """Test getting current user with valid token."""
        # Create test user
        password = "testpassword123"
        user = User(
            email="current@example.com",
            hashed_password=get_password_hash(password),
            full_name="Current User",
            is_active=True
        )
        db_session.add(user)
        db_session.commit()
        db_session.refresh(user)
        
        # Login to get token
        login_data = {
            "email": "current@example.com",
            "password": password
        }
        login_response = client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        
        # Get current user
        headers = {"Authorization": f"Bearer {token}"}
        response = client.get("/api/v1/auth/me", headers=headers)
        
        assert response.status_code == 200
        data = response.json()
        assert data["email"] == "current@example.com"
        assert data["id"] == user.id
        assert data["full_name"] == "Current User"
    
    def test_get_current_user_invalid_token(self, client: TestClient):
        """Test getting current user with invalid token."""
        headers = {"Authorization": "Bearer invalid_token"}
        response = client.get("/api/v1/auth/me", headers=headers)
        
        assert response.status_code == 401
        assert "Could not validate credentials" in response.json()["message"]
    
    def test_get_current_user_no_token(self, client: TestClient):
        """Test getting current user without token."""
        response = client.get("/api/v1/auth/me")
        
        assert response.status_code == 403  # Forbidden, no authorization header
    
    def test_change_password_valid(self, client: TestClient, db_session: Session):
        """Test changing password with valid old password."""
        # Create test user
        old_password = "oldpassword123"
        user = User(
            email="changepass@example.com",
            hashed_password=get_password_hash(old_password),
            full_name="Change Pass User",
            is_active=True
        )
        db_session.add(user)
        db_session.commit()
        
        # Login to get token
        login_data = {
            "email": "changepass@example.com",
            "password": old_password
        }
        login_response = client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        
        # Change password
        headers = {"Authorization": f"Bearer {token}"}
        change_data = {
            "old_password": old_password,
            "new_password": "newpassword123"
        }
        
        response = client.post("/api/v1/auth/change-password", json=change_data, headers=headers)
        assert response.status_code == 200
        assert "Password updated successfully" in response.json()["message"]
        
        # Verify old password no longer works
        old_login_response = client.post("/api/v1/auth/login", json={
            "email": "changepass@example.com",
            "password": old_password
        })
        assert old_login_response.status_code == 401
        
        # Verify new password works
        new_login_response = client.post("/api/v1/auth/login", json={
            "email": "changepass@example.com",
            "password": "newpassword123"
        })
        assert new_login_response.status_code == 200
    
    def test_change_password_invalid_old(self, client: TestClient, db_session: Session):
        """Test changing password with incorrect old password."""
        # Create test user
        password = "correctpassword123"
        user = User(
            email="wrongold@example.com",
            hashed_password=get_password_hash(password),
            full_name="Test User",
            is_active=True
        )
        db_session.add(user)
        db_session.commit()
        
        # Login to get token
        login_data = {
            "email": "wrongold@example.com",
            "password": password
        }
        login_response = client.post("/api/v1/auth/login", json=login_data)
        token = login_response.json()["access_token"]
        
        # Try to change password with wrong old password
        headers = {"Authorization": f"Bearer {token}"}
        change_data = {
            "old_password": "wrongoldpassword",
            "new_password": "newpassword123"
        }
        
        response = client.post("/api/v1/auth/change-password", json=change_data, headers=headers)
        assert response.status_code == 400
        assert "Incorrect password" in response.json()["detail"]
