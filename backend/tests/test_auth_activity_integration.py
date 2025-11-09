"""
Integration tests for activity logging in auth endpoints.

These tests verify that authentication-related activities are properly
logged when users register and login.
"""

import pytest
from fastapi.testclient import TestClient

from app.models.activity import Activity
from app.models.user import User


class TestAuthActivityIntegration:
    """Test cases for activity logging in auth endpoints."""

    def test_register_logs_new_user_activity(self, client: TestClient, db_session):
        """Test that user registration logs a NEW_USER activity."""
        # Register a new user
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "newuser@example.com",
                "password": "SecurePass123!",
                "full_name": "New User"
            }
        )

        # Verify registration was successful
        assert response.status_code == 201
        data = response.json()
        user_id = data["id"]

        # Verify NEW_USER activity was logged
        activity = db_session.query(Activity).filter(
            Activity.activity_type == "NEW_USER",
            Activity.user_id == user_id
        ).first()

        assert activity is not None
        assert activity.activity_type == "NEW_USER"
        assert activity.user_id == user_id
        assert "newuser@example.com" in activity.description
        assert activity.entity_id == user_id  # entity_id should be the new user's ID

    def test_login_logs_login_activity(self, client: TestClient, db_session):
        """Test that user login logs a LOGIN activity."""
        # First, register a user
        client.post(
            "/api/v1/auth/register",
            json={
                "email": "loginuser@example.com",
                "password": "SecurePass123!",
                "full_name": "Login User"
            }
        )

        # Get user ID
        user = db_session.query(User).filter(
            User.email == "loginuser@example.com"
        ).first()
        user_id = user.id

        # Clear any activities from registration
        db_session.query(Activity).delete()
        db_session.commit()

        # Now login
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "loginuser@example.com",
                "password": "SecurePass123!"
            }
        )

        # Verify login was successful
        assert response.status_code == 200

        # Verify LOGIN activity was logged
        activity = db_session.query(Activity).filter(
            Activity.activity_type == "LOGIN",
            Activity.user_id == user_id
        ).first()

        assert activity is not None
        assert activity.activity_type == "LOGIN"
        assert activity.user_id == user_id
        assert "loginuser@example.com" in activity.description.lower() or "logged in" in activity.description.lower()
        assert activity.entity_id is None  # LOGIN doesn't have an entity

    def test_multiple_logins_create_multiple_activities(self, client: TestClient, db_session):
        """Test that multiple logins create multiple activity records."""
        # Register a user
        client.post(
            "/api/v1/auth/register",
            json={
                "email": "multilogin@example.com",
                "password": "SecurePass123!",
                "full_name": "Multi Login User"
            }
        )

        # Get user ID
        user = db_session.query(User).filter(
            User.email == "multilogin@example.com"
        ).first()
        user_id = user.id

        # Clear activities
        db_session.query(Activity).delete()
        db_session.commit()

        # Login 3 times
        for i in range(3):
            response = client.post(
                "/api/v1/auth/login",
                json={
                    "email": "multilogin@example.com",
                    "password": "SecurePass123!"
                }
            )
            assert response.status_code == 200

        # Verify 3 LOGIN activities were created
        activities = db_session.query(Activity).filter(
            Activity.activity_type == "LOGIN",
            Activity.user_id == user_id
        ).all()

        assert len(activities) == 3

    def test_failed_login_does_not_log_activity(self, client: TestClient, db_session):
        """Test that failed login attempts do not create activity records."""
        # Register a user
        client.post(
            "/api/v1/auth/register",
            json={
                "email": "faillogin@example.com",
                "password": "CorrectPass123!",
                "full_name": "Fail Login User"
            }
        )

        # Clear activities
        db_session.query(Activity).delete()
        db_session.commit()

        # Attempt login with wrong password
        response = client.post(
            "/api/v1/auth/login",
            json={
                "email": "faillogin@example.com",
                "password": "WrongPassword!"
            }
        )

        # Verify login failed
        assert response.status_code == 401

        # Verify NO LOGIN activity was logged
        activities = db_session.query(Activity).filter(
            Activity.activity_type == "LOGIN"
        ).all()

        assert len(activities) == 0

    def test_register_duplicate_email_does_not_log_activity(self, client: TestClient, db_session):
        """Test that duplicate registration does not create activity."""
        # Register a user
        client.post(
            "/api/v1/auth/register",
            json={
                "email": "duplicate@example.com",
                "password": "SecurePass123!",
                "full_name": "Duplicate User"
            }
        )

        # Get count of NEW_USER activities
        initial_count = db_session.query(Activity).filter(
            Activity.activity_type == "NEW_USER"
        ).count()

        # Try to register with same email
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "duplicate@example.com",
                "password": "DifferentPass123!",
                "full_name": "Another User"
            }
        )

        # Verify registration failed
        assert response.status_code == 400

        # Verify NO additional NEW_USER activity was logged
        final_count = db_session.query(Activity).filter(
            Activity.activity_type == "NEW_USER"
        ).count()

        assert final_count == initial_count

    def test_activity_description_contains_user_email(self, client: TestClient, db_session):
        """Test that activity description includes user email for traceability."""
        # Register a user
        response = client.post(
            "/api/v1/auth/register",
            json={
                "email": "traceable@example.com",
                "password": "SecurePass123!",
                "full_name": "Traceable User"
            }
        )

        user_id = response.json()["id"]

        # Get the NEW_USER activity
        activity = db_session.query(Activity).filter(
            Activity.activity_type == "NEW_USER",
            Activity.user_id == user_id
        ).first()

        # Verify description contains email
        assert activity is not None
        assert "traceable@example.com" in activity.description

    def test_activity_timestamp_is_set(self, client: TestClient, db_session):
        """Test that activity timestamp is automatically set."""
        # Register a user
        client.post(
            "/api/v1/auth/register",
            json={
                "email": "timestamp@example.com",
                "password": "SecurePass123!",
                "full_name": "Timestamp User"
            }
        )

        # Get the activity
        activity = db_session.query(Activity).filter(
            Activity.activity_type == "NEW_USER"
        ).order_by(Activity.timestamp.desc()).first()

        # Verify timestamp is set
        assert activity is not None
        assert activity.timestamp is not None

