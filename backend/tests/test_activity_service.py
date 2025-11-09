"""
Tests for ActivityService.

These tests verify the Activity service layer including:
- Activity logging functionality
- Recent activities retrieval with filtering
- JOIN queries with user attribution
- Error handling
"""

import pytest
from datetime import datetime, timezone

from app.models.user import User
from app.models.activity import Activity
from app.services.activity_service import ActivityService
from app.schemas.activity import ActivityType, ActivityListResponse


class TestActivityServiceLogActivity:
    """Test cases for ActivityService.log_activity method."""

    def test_log_activity_with_user(self, db_session):
        """Test logging an activity with user attribution."""
        # Create user
        user = User(
            email="testuser@example.com",
            hashed_password="hashedpassword123",
            full_name="Test User"
        )
        db_session.add(user)
        db_session.commit()

        # Log activity
        service = ActivityService(db_session)
        service.log_activity(
            user_id=user.id,
            activity_type=ActivityType.TEMPLATE_SAVED.value,
            description="Template ingested: Test Template v1.0",
            entity_id=42
        )

        # Verify activity was logged
        activity = db_session.query(Activity).first()
        assert activity is not None
        assert activity.user_id == user.id
        assert activity.activity_type == "TEMPLATE_SAVED"
        assert activity.description == "Template ingested: Test Template v1.0"
        assert activity.entity_id == 42
        assert activity.timestamp is not None

    def test_log_activity_without_user(self, db_session):
        """Test logging a system activity without user (user_id=None)."""
        service = ActivityService(db_session)
        service.log_activity(
            user_id=None,
            activity_type=ActivityType.TEMPLATE_ANALYSIS.value,
            description="System maintenance completed",
            entity_id=None
        )

        # Verify activity was logged
        activity = db_session.query(Activity).first()
        assert activity is not None
        assert activity.user_id is None
        assert activity.activity_type == "TEMPLATE_ANALYSIS"
        assert activity.description == "System maintenance completed"
        assert activity.entity_id is None

    def test_log_activity_without_entity_id(self, db_session):
        """Test logging an activity without entity reference (temporary operations)."""
        # Create user
        user = User(
            email="tempuser@example.com",
            hashed_password="hashedpassword123"
        )
        db_session.add(user)
        db_session.commit()

        service = ActivityService(db_session)
        service.log_activity(
            user_id=user.id,
            activity_type=ActivityType.TEMPLATE_ANALYSIS.value,
            description="PDF template analyzed: test.pdf (15 fields)",
            entity_id=None
        )

        # Verify activity was logged
        activity = db_session.query(Activity).first()
        assert activity is not None
        assert activity.entity_id is None

    def test_log_activity_all_types(self, db_session):
        """Test logging activities of all supported types."""
        # Create user
        user = User(
            email="alltypes@example.com",
            hashed_password="hashedpassword123"
        )
        db_session.add(user)
        db_session.commit()

        service = ActivityService(db_session)
        
        # Log one activity of each type
        for activity_type in ActivityType:
            service.log_activity(
                user_id=user.id,
                activity_type=activity_type.value,
                description=f"Test {activity_type.value} activity",
                entity_id=None
            )

        # Verify all were logged
        activities = db_session.query(Activity).all()
        assert len(activities) == len(ActivityType)
        
        logged_types = {a.activity_type for a in activities}
        expected_types = {t.value for t in ActivityType}
        assert logged_types == expected_types

    def test_log_activity_error_handling_does_not_raise(self, db_session):
        """Test that logging errors are caught and don't break the main operation."""
        service = ActivityService(db_session)
        
        # Close the session to simulate a database error
        db_session.close()
        
        # This should NOT raise an exception
        try:
            service.log_activity(
                user_id=1,
                activity_type=ActivityType.LOGIN.value,
                description="Test activity with closed session",
                entity_id=None
            )
            # If we get here, error was handled gracefully
            assert True
        except Exception as e:
            pytest.fail(f"log_activity should not raise exceptions: {e}")

    def test_log_activity_invalid_user_id_handled(self, db_session):
        """Test logging with non-existent user_id (FK constraint with SET NULL)."""
        service = ActivityService(db_session)
        
        # Log activity with non-existent user_id
        # This should work because user_id is nullable and has ON DELETE SET NULL
        service.log_activity(
            user_id=99999,  # Non-existent user
            activity_type=ActivityType.LOGIN.value,
            description="Test with invalid user",
            entity_id=None
        )

        # Activity should still be logged (FK constraint allows null)
        activity = db_session.query(Activity).first()
        assert activity is not None


class TestActivityServiceGetRecentActivities:
    """Test cases for ActivityService.get_recent_activities method."""

    def test_get_recent_activities_basic(self, db_session):
        """Test retrieving recent activities without filters."""
        # Create user
        user = User(
            email="recentuser@example.com",
            hashed_password="hashedpassword123",
            full_name="Recent User"
        )
        db_session.add(user)
        db_session.commit()

        # Create multiple activities
        for i in range(5):
            activity = Activity(
                user_id=user.id,
                activity_type=ActivityType.TEMPLATE_SAVED.value,
                description=f"Activity {i}",
                entity_id=i
            )
            db_session.add(activity)
        db_session.commit()

        # Get recent activities
        service = ActivityService(db_session)
        result = service.get_recent_activities(limit=10, exclude_types=None)

        # Verify response
        assert isinstance(result, ActivityListResponse)
        assert len(result.items) == 5
        assert result.total == 5
        
        # Verify user attribution
        for item in result.items:
            assert item.user_email == "recentuser@example.com"
            assert item.user_full_name == "Recent User"

    def test_get_recent_activities_exclude_login(self, db_session):
        """Test excluding LOGIN activities from results."""
        # Create user
        user = User(
            email="loginuser@example.com",
            hashed_password="hashedpassword123"
        )
        db_session.add(user)
        db_session.commit()

        # Create mixed activities
        activities_data = [
            (ActivityType.LOGIN.value, "User logged in"),
            (ActivityType.TEMPLATE_SAVED.value, "Template saved"),
            (ActivityType.LOGIN.value, "User logged in again"),
            (ActivityType.COMPARISON_SAVED.value, "Comparison saved"),
        ]
        
        for activity_type, description in activities_data:
            activity = Activity(
                user_id=user.id,
                activity_type=activity_type,
                description=description
            )
            db_session.add(activity)
        db_session.commit()

        # Get activities excluding LOGIN
        service = ActivityService(db_session)
        result = service.get_recent_activities(
            limit=10,
            exclude_types=[ActivityType.LOGIN.value]
        )

        # Verify LOGIN events are excluded
        assert len(result.items) == 2
        assert result.total == 2
        for item in result.items:
            assert item.activity_type != ActivityType.LOGIN

    def test_get_recent_activities_with_limit(self, db_session):
        """Test pagination with limit parameter."""
        # Create user
        user = User(
            email="limituser@example.com",
            hashed_password="hashedpassword123"
        )
        db_session.add(user)
        db_session.commit()

        # Create 20 activities
        for i in range(20):
            activity = Activity(
                user_id=user.id,
                activity_type=ActivityType.TEMPLATE_SAVED.value,
                description=f"Activity {i}"
            )
            db_session.add(activity)
        db_session.commit()

        # Get limited results
        service = ActivityService(db_session)
        result = service.get_recent_activities(limit=5, exclude_types=None)

        # Verify limit is respected
        assert len(result.items) == 5
        assert result.total == 20  # Total count should still be full

    def test_get_recent_activities_ordered_by_timestamp(self, db_session):
        """Test that activities are ordered by timestamp DESC (most recent first)."""
        # Create user
        user = User(
            email="orderuser@example.com",
            hashed_password="hashedpassword123"
        )
        db_session.add(user)
        db_session.commit()

        # Create activities in order
        for i in range(3):
            activity = Activity(
                user_id=user.id,
                activity_type=ActivityType.TEMPLATE_SAVED.value,
                description=f"Activity {i}",
                entity_id=i
            )
            db_session.add(activity)
            db_session.commit()  # Commit each to ensure different timestamps

        # Get activities
        service = ActivityService(db_session)
        result = service.get_recent_activities(limit=10, exclude_types=None)

        # Verify order (most recent first)
        assert len(result.items) == 3
        # Last created should be first in results
        assert result.items[0].description == "Activity 2"
        assert result.items[1].description == "Activity 1"
        assert result.items[2].description == "Activity 0"

    def test_get_recent_activities_without_user(self, db_session):
        """Test retrieving activities without user (system activities)."""
        # Create activity without user
        activity = Activity(
            user_id=None,
            activity_type=ActivityType.TEMPLATE_ANALYSIS.value,
            description="System activity",
            entity_id=None
        )
        db_session.add(activity)
        db_session.commit()

        # Get activities
        service = ActivityService(db_session)
        result = service.get_recent_activities(limit=10, exclude_types=None)

        # Verify activity is returned with null user fields
        assert len(result.items) == 1
        assert result.items[0].user_id is None
        assert result.items[0].user_email is None
        assert result.items[0].user_full_name is None

    def test_get_recent_activities_user_deleted(self, db_session):
        """Test retrieving activities after user deletion (ON DELETE SET NULL)."""
        # Create user
        user = User(
            email="deleteduser@example.com",
            hashed_password="hashedpassword123",
            full_name="Deleted User"
        )
        db_session.add(user)
        db_session.commit()
        user_id = user.id

        # Create activity
        activity = Activity(
            user_id=user_id,
            activity_type=ActivityType.TEMPLATE_SAVED.value,
            description="Activity before user deletion"
        )
        db_session.add(activity)
        db_session.commit()

        # Delete user
        db_session.delete(user)
        db_session.commit()

        # Get activities
        service = ActivityService(db_session)
        result = service.get_recent_activities(limit=10, exclude_types=None)

        # Verify activity still exists with null user
        assert len(result.items) == 1
        assert result.items[0].user_id is None
        assert result.items[0].user_email is None

    def test_get_recent_activities_empty_result(self, db_session):
        """Test retrieving activities when database is empty."""
        service = ActivityService(db_session)
        result = service.get_recent_activities(limit=10, exclude_types=None)

        # Verify empty result
        assert isinstance(result, ActivityListResponse)
        assert len(result.items) == 0
        assert result.total == 0

    def test_get_recent_activities_multiple_users(self, db_session):
        """Test retrieving activities from multiple users."""
        # Create multiple users
        user1 = User(email="user1@example.com", hashed_password="hash1", full_name="User One")
        user2 = User(email="user2@example.com", hashed_password="hash2", full_name="User Two")
        db_session.add_all([user1, user2])
        db_session.commit()

        # Create activities for different users
        activity1 = Activity(
            user_id=user1.id,
            activity_type=ActivityType.TEMPLATE_SAVED.value,
            description="Activity by user 1"
        )
        activity2 = Activity(
            user_id=user2.id,
            activity_type=ActivityType.COMPARISON_SAVED.value,
            description="Activity by user 2"
        )
        db_session.add_all([activity1, activity2])
        db_session.commit()

        # Get activities
        service = ActivityService(db_session)
        result = service.get_recent_activities(limit=10, exclude_types=None)

        # Verify both activities are returned with correct user attribution
        assert len(result.items) == 2
        emails = {item.user_email for item in result.items}
        assert emails == {"user1@example.com", "user2@example.com"}

    def test_get_recent_activities_exclude_multiple_types(self, db_session):
        """Test excluding multiple activity types."""
        # Create user
        user = User(
            email="multiexclude@example.com",
            hashed_password="hashedpassword123"
        )
        db_session.add(user)
        db_session.commit()

        # Create various activity types
        types_to_create = [
            ActivityType.LOGIN,
            ActivityType.NEW_USER,
            ActivityType.TEMPLATE_SAVED,
            ActivityType.COMPARISON_SAVED,
        ]
        
        for activity_type in types_to_create:
            activity = Activity(
                user_id=user.id,
                activity_type=activity_type.value,
                description=f"Activity {activity_type.value}"
            )
            db_session.add(activity)
        db_session.commit()

        # Exclude LOGIN and NEW_USER
        service = ActivityService(db_session)
        result = service.get_recent_activities(
            limit=10,
            exclude_types=[ActivityType.LOGIN.value, ActivityType.NEW_USER.value]
        )

        # Verify only TEMPLATE_SAVED and COMPARISON_SAVED remain
        assert len(result.items) == 2
        assert result.total == 2
        types_in_result = {item.activity_type for item in result.items}
        assert types_in_result == {ActivityType.TEMPLATE_SAVED, ActivityType.COMPARISON_SAVED}

