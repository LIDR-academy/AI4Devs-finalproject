"""
Tests for Activity API endpoints.

These tests verify the GET /api/v1/activity/recent endpoint including:
- Authentication requirements
- Successful activity retrieval
- Query parameter validation
- Filtering behavior
- Error handling
"""

import pytest
from fastapi import status
from fastapi.testclient import TestClient

from app.models.user import User
from app.models.activity import Activity
from app.core.security import create_access_token


class TestActivityRecentEndpoint:
    """Test cases for GET /api/v1/activity/recent endpoint."""

    def test_get_recent_activities_success(self, client: TestClient, db_session):
        """Test successful retrieval of recent activities."""
        # Create user
        user = User(
            email="testuser@example.com",
            hashed_password="hashedpassword123",
            full_name="Test User",
            is_active=True
        )
        db_session.add(user)
        db_session.commit()

        # Create activities
        for i in range(3):
            activity = Activity(
                user_id=user.id,
                activity_type="TEMPLATE_SAVED",
                description=f"Activity {i}"
            )
            db_session.add(activity)
        db_session.commit()

        # Create JWT token
        token = create_access_token({"sub": user.email})

        # Make request
        response = client.get(
            "/api/v1/activity/recent",
            headers={"Authorization": f"Bearer {token}"}
        )

        # Verify response
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "items" in data
        assert "total" in data
        assert len(data["items"]) == 3
        assert data["total"] == 3

        # Verify user attribution
        for item in data["items"]:
            assert item["user_email"] == "testuser@example.com"
            assert item["user_full_name"] == "Test User"

    def test_get_recent_activities_requires_authentication(self, client: TestClient):
        """Test that endpoint requires authentication."""
        # Make request without token
        response = client.get("/api/v1/activity/recent")

        # Verify 401 Unauthorized
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_recent_activities_invalid_token(self, client: TestClient):
        """Test that invalid token returns 401."""
        # Make request with invalid token
        response = client.get(
            "/api/v1/activity/recent",
            headers={"Authorization": "Bearer invalid_token_here"}
        )

        # Verify 401 Unauthorized
        assert response.status_code == status.HTTP_401_UNAUTHORIZED

    def test_get_recent_activities_with_limit(self, client: TestClient, db_session):
        """Test pagination with limit parameter."""
        # Create user
        user = User(
            email="limituser@example.com",
            hashed_password="hashedpassword123",
            is_active=True
        )
        db_session.add(user)
        db_session.commit()

        # Create 10 activities
        for i in range(10):
            activity = Activity(
                user_id=user.id,
                activity_type="TEMPLATE_SAVED",
                description=f"Activity {i}"
            )
            db_session.add(activity)
        db_session.commit()

        # Create JWT token
        token = create_access_token({"sub": user.email})

        # Make request with limit=5
        response = client.get(
            "/api/v1/activity/recent?limit=5",
            headers={"Authorization": f"Bearer {token}"}
        )

        # Verify response
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["items"]) == 5
        assert data["total"] == 10  # Total should still be 10

    def test_get_recent_activities_limit_validation_min(self, client: TestClient, db_session):
        """Test that limit parameter has minimum value of 1."""
        # Create user
        user = User(
            email="minuser@example.com",
            hashed_password="hashedpassword123",
            is_active=True
        )
        db_session.add(user)
        db_session.commit()

        # Create JWT token
        token = create_access_token({"sub": user.email})

        # Make request with limit=0 (invalid)
        response = client.get(
            "/api/v1/activity/recent?limit=0",
            headers={"Authorization": f"Bearer {token}"}
        )

        # Verify 422 Unprocessable Entity
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_get_recent_activities_limit_validation_max(self, client: TestClient, db_session):
        """Test that limit parameter has maximum value of 100."""
        # Create user
        user = User(
            email="maxuser@example.com",
            hashed_password="hashedpassword123",
            is_active=True
        )
        db_session.add(user)
        db_session.commit()

        # Create JWT token
        token = create_access_token({"sub": user.email})

        # Make request with limit=101 (invalid)
        response = client.get(
            "/api/v1/activity/recent?limit=101",
            headers={"Authorization": f"Bearer {token}"}
        )

        # Verify 422 Unprocessable Entity
        assert response.status_code == status.HTTP_422_UNPROCESSABLE_ENTITY

    def test_get_recent_activities_default_limit(self, client: TestClient, db_session):
        """Test that default limit is 10."""
        # Create user
        user = User(
            email="defaultuser@example.com",
            hashed_password="hashedpassword123",
            is_active=True
        )
        db_session.add(user)
        db_session.commit()

        # Create 20 activities
        for i in range(20):
            activity = Activity(
                user_id=user.id,
                activity_type="TEMPLATE_SAVED",
                description=f"Activity {i}"
            )
            db_session.add(activity)
        db_session.commit()

        # Create JWT token
        token = create_access_token({"sub": user.email})

        # Make request without limit parameter
        response = client.get(
            "/api/v1/activity/recent",
            headers={"Authorization": f"Bearer {token}"}
        )

        # Verify default limit of 10 is applied
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["items"]) == 10
        assert data["total"] == 20

    def test_get_recent_activities_excludes_login(self, client: TestClient, db_session):
        """Test that LOGIN activities are excluded by default."""
        # Create user
        user = User(
            email="loginuser@example.com",
            hashed_password="hashedpassword123",
            is_active=True
        )
        db_session.add(user)
        db_session.commit()

        # Create mixed activities
        activities_data = [
            ("LOGIN", "User logged in"),
            ("TEMPLATE_SAVED", "Template saved"),
            ("LOGIN", "User logged in again"),
            ("COMPARISON_SAVED", "Comparison saved"),
        ]
        
        for activity_type, description in activities_data:
            activity = Activity(
                user_id=user.id,
                activity_type=activity_type,
                description=description
            )
            db_session.add(activity)
        db_session.commit()

        # Create JWT token
        token = create_access_token({"sub": user.email})

        # Make request
        response = client.get(
            "/api/v1/activity/recent",
            headers={"Authorization": f"Bearer {token}"}
        )

        # Verify LOGIN events are excluded
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["items"]) == 2
        assert data["total"] == 2
        
        # Verify no LOGIN activities in response
        activity_types = [item["activity_type"] for item in data["items"]]
        assert "LOGIN" not in activity_types

    def test_get_recent_activities_ordered_by_timestamp(self, client: TestClient, db_session):
        """Test that activities are ordered by timestamp DESC."""
        # Create user
        user = User(
            email="orderuser@example.com",
            hashed_password="hashedpassword123",
            is_active=True
        )
        db_session.add(user)
        db_session.commit()

        # Create activities with different entity_ids to distinguish them
        for i in range(3):
            activity = Activity(
                user_id=user.id,
                activity_type="TEMPLATE_SAVED",
                description=f"Activity {i}",
                entity_id=i
            )
            db_session.add(activity)
            db_session.commit()  # Commit each to ensure different timestamps

        # Create JWT token
        token = create_access_token({"sub": user.email})

        # Make request
        response = client.get(
            "/api/v1/activity/recent",
            headers={"Authorization": f"Bearer {token}"}
        )

        # Verify order (most recent first)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["items"]) == 3
        
        # Last created should be first in results
        assert data["items"][0]["entity_id"] == 2
        assert data["items"][1]["entity_id"] == 1
        assert data["items"][2]["entity_id"] == 0

    def test_get_recent_activities_empty_result(self, client: TestClient, db_session):
        """Test response when no activities exist."""
        # Create user
        user = User(
            email="emptyuser@example.com",
            hashed_password="hashedpassword123",
            is_active=True
        )
        db_session.add(user)
        db_session.commit()

        # Create JWT token
        token = create_access_token({"sub": user.email})

        # Make request
        response = client.get(
            "/api/v1/activity/recent",
            headers={"Authorization": f"Bearer {token}"}
        )

        # Verify empty result
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["items"] == []
        assert data["total"] == 0

    def test_get_recent_activities_inactive_user(self, client: TestClient, db_session):
        """Test that inactive users cannot access the endpoint."""
        # Create inactive user
        user = User(
            email="inactive@example.com",
            hashed_password="hashedpassword123",
            is_active=False
        )
        db_session.add(user)
        db_session.commit()

        # Create JWT token
        token = create_access_token({"sub": user.email})

        # Make request
        response = client.get(
            "/api/v1/activity/recent",
            headers={"Authorization": f"Bearer {token}"}
        )

        # Verify 401 or 403 (depends on implementation)
        assert response.status_code in [status.HTTP_401_UNAUTHORIZED, status.HTTP_403_FORBIDDEN]

    def test_get_recent_activities_multiple_users(self, client: TestClient, db_session):
        """Test that activities from all users are returned (not filtered by current user)."""
        # Create multiple users
        user1 = User(email="user1@example.com", hashed_password="hash1", full_name="User One", is_active=True)
        user2 = User(email="user2@example.com", hashed_password="hash2", full_name="User Two", is_active=True)
        db_session.add_all([user1, user2])
        db_session.commit()

        # Create activities for different users
        activity1 = Activity(
            user_id=user1.id,
            activity_type="TEMPLATE_SAVED",
            description="Activity by user 1"
        )
        activity2 = Activity(
            user_id=user2.id,
            activity_type="COMPARISON_SAVED",
            description="Activity by user 2"
        )
        db_session.add_all([activity1, activity2])
        db_session.commit()

        # Create JWT token for user1
        token = create_access_token({"sub": user1.email})

        # Make request as user1
        response = client.get(
            "/api/v1/activity/recent",
            headers={"Authorization": f"Bearer {token}"}
        )

        # Verify both activities are returned
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert len(data["items"]) == 2
        
        # Verify both users' activities are present
        emails = {item["user_email"] for item in data["items"]}
        assert emails == {"user1@example.com", "user2@example.com"}

    def test_get_recent_activities_response_structure(self, client: TestClient, db_session):
        """Test that response has correct structure."""
        # Create user
        user = User(
            email="structureuser@example.com",
            hashed_password="hashedpassword123",
            full_name="Structure User",
            is_active=True
        )
        db_session.add(user)
        db_session.commit()

        # Create activity
        activity = Activity(
            user_id=user.id,
            activity_type="TEMPLATE_SAVED",
            description="Test activity",
            entity_id=42
        )
        db_session.add(activity)
        db_session.commit()

        # Create JWT token
        token = create_access_token({"sub": user.email})

        # Make request
        response = client.get(
            "/api/v1/activity/recent",
            headers={"Authorization": f"Bearer {token}"}
        )

        # Verify response structure
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        
        # Verify top-level structure
        assert "items" in data
        assert "total" in data
        assert isinstance(data["items"], list)
        assert isinstance(data["total"], int)
        
        # Verify item structure
        item = data["items"][0]
        assert "id" in item
        assert "timestamp" in item
        assert "user_id" in item
        assert "user_email" in item
        assert "user_full_name" in item
        assert "activity_type" in item
        assert "description" in item
        assert "entity_id" in item
        
        # Verify values
        assert item["user_email"] == "structureuser@example.com"
        assert item["user_full_name"] == "Structure User"
        assert item["activity_type"] == "TEMPLATE_SAVED"
        assert item["description"] == "Test activity"
        assert item["entity_id"] == 42

