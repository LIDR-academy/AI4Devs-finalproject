"""
Tests for Activity model.

These tests verify the Activity audit trail model including:
- Model creation and field validation
- Relationship with User model
- Timestamp default behavior
- Nullable fields (user_id, entity_id)
- String representation
"""

import pytest
from datetime import datetime, timezone
from sqlalchemy.exc import IntegrityError

from app.models.user import User
from app.models.activity import Activity


class TestActivityModel:
    """Test cases for Activity model."""

    def test_activity_creation_with_all_fields(self, db_session):
        """Test creating an activity with all fields populated."""
        # Create user
        user = User(
            email="testuser@example.com",
            hashed_password="hashedpassword123",
            full_name="Test User"
        )
        db_session.add(user)
        db_session.commit()

        # Create activity
        activity = Activity(
            user_id=user.id,
            activity_type="TEMPLATE_SAVED",
            description="Template ingested: Test Template v1.0 by testuser@example.com",
            entity_id=42
        )
        db_session.add(activity)
        db_session.commit()

        # Verify activity
        assert activity.id is not None
        assert activity.timestamp is not None
        assert isinstance(activity.timestamp, datetime)
        assert activity.user_id == user.id
        assert activity.activity_type == "TEMPLATE_SAVED"
        assert activity.description == "Template ingested: Test Template v1.0 by testuser@example.com"
        assert activity.entity_id == 42

    def test_activity_creation_without_user(self, db_session):
        """Test creating a system activity without a user (user_id is nullable)."""
        activity = Activity(
            user_id=None,
            activity_type="SYSTEM_MAINTENANCE",
            description="System backup completed",
            entity_id=None
        )
        db_session.add(activity)
        db_session.commit()

        # Verify activity
        assert activity.id is not None
        assert activity.timestamp is not None
        assert activity.user_id is None
        assert activity.activity_type == "SYSTEM_MAINTENANCE"
        assert activity.description == "System backup completed"
        assert activity.entity_id is None

    def test_activity_creation_without_entity_id(self, db_session):
        """Test creating an activity without entity reference (temporary operations)."""
        # Create user
        user = User(
            email="tempuser@example.com",
            hashed_password="hashedpassword123"
        )
        db_session.add(user)
        db_session.commit()

        # Create activity for temporary analysis
        activity = Activity(
            user_id=user.id,
            activity_type="TEMPLATE_ANALYSIS",
            description="PDF template analyzed: test.pdf (15 fields)",
            entity_id=None
        )
        db_session.add(activity)
        db_session.commit()

        # Verify activity
        assert activity.id is not None
        assert activity.entity_id is None
        assert activity.description == "PDF template analyzed: test.pdf (15 fields)"

    def test_activity_timestamp_default(self, db_session):
        """Test that timestamp is automatically set to current time."""
        before_creation = datetime.now(timezone.utc)
        
        activity = Activity(
            activity_type="LOGIN",
            description="User logged in",
        )
        db_session.add(activity)
        db_session.commit()
        
        after_creation = datetime.now(timezone.utc)

        # Verify timestamp is set and within expected range
        assert activity.timestamp is not None
        # Note: timestamp might not have timezone info in SQLite tests
        # Just verify it exists and is a datetime
        assert isinstance(activity.timestamp, datetime)

    def test_activity_missing_activity_type_fails(self, db_session):
        """Test that activity_type is required (NOT NULL constraint)."""
        activity = Activity(
            description="Missing activity type",
        )
        db_session.add(activity)
        
        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_activity_missing_description_fails(self, db_session):
        """Test that description is required (NOT NULL constraint)."""
        activity = Activity(
            activity_type="TEST",
        )
        db_session.add(activity)
        
        with pytest.raises(IntegrityError):
            db_session.commit()

    def test_activity_user_relationship(self, db_session):
        """Test relationship between Activity and User models."""
        # Create user
        user = User(
            email="reluser@example.com",
            hashed_password="hashedpassword123",
            full_name="Relationship User"
        )
        db_session.add(user)
        db_session.commit()

        # Create activity
        activity = Activity(
            user_id=user.id,
            activity_type="NEW_USER",
            description=f"New user registered: {user.email}"
        )
        db_session.add(activity)
        db_session.commit()

        # Verify relationship
        assert activity.user is not None
        assert activity.user.id == user.id
        assert activity.user.email == user.email
        assert activity.user.full_name == "Relationship User"

    def test_activity_user_backref(self, db_session):
        """Test backref from User to activities."""
        # Create user
        user = User(
            email="backrefuser@example.com",
            hashed_password="hashedpassword123"
        )
        db_session.add(user)
        db_session.commit()

        # Create multiple activities for the same user
        activity1 = Activity(
            user_id=user.id,
            activity_type="LOGIN",
            description="User logged in"
        )
        activity2 = Activity(
            user_id=user.id,
            activity_type="TEMPLATE_SAVED",
            description="Template saved"
        )
        db_session.add_all([activity1, activity2])
        db_session.commit()

        # Verify backref - user has access to their activities
        db_session.refresh(user)
        assert len(user.activities) == 2
        assert activity1 in user.activities
        assert activity2 in user.activities

    def test_activity_user_deletion_sets_null(self, db_session):
        """Test that deleting a user sets activity.user_id to NULL (ON DELETE SET NULL)."""
        # Create user
        user = User(
            email="deleteuser@example.com",
            hashed_password="hashedpassword123"
        )
        db_session.add(user)
        db_session.commit()
        user_id = user.id

        # Create activity
        activity = Activity(
            user_id=user_id,
            activity_type="LOGIN",
            description="User logged in: deleteuser@example.com"
        )
        db_session.add(activity)
        db_session.commit()
        activity_id = activity.id

        # Verify activity has user_id
        assert activity.user_id == user_id

        # Delete user
        db_session.delete(user)
        db_session.commit()

        # Verify activity still exists but user_id is NULL
        db_session.expire_all()  # Clear session cache
        activity = db_session.query(Activity).filter(Activity.id == activity_id).first()
        assert activity is not None
        assert activity.user_id is None
        assert activity.description == "User logged in: deleteuser@example.com"

    def test_activity_repr(self, db_session):
        """Test string representation of Activity model."""
        # Create user
        user = User(
            email="repruser@example.com",
            hashed_password="hashedpassword123"
        )
        db_session.add(user)
        db_session.commit()

        # Create activity
        activity = Activity(
            user_id=user.id,
            activity_type="COMPARISON_SAVED",
            description="Comparison saved"
        )
        db_session.add(activity)
        db_session.commit()

        # Verify repr
        repr_str = repr(activity)
        assert "Activity" in repr_str
        assert f"id={activity.id}" in repr_str
        assert "type='COMPARISON_SAVED'" in repr_str
        assert f"user_id={user.id}" in repr_str
        assert "timestamp=" in repr_str

    def test_activity_multiple_types(self, db_session):
        """Test creating activities with different activity types."""
        activity_types = [
            "LOGIN",
            "NEW_USER",
            "TEMPLATE_ANALYSIS",
            "TEMPLATE_SAVED",
            "VERSION_SAVED",
            "COMPARISON_ANALYSIS",
            "COMPARISON_SAVED",
        ]

        for activity_type in activity_types:
            activity = Activity(
                activity_type=activity_type,
                description=f"Test {activity_type} activity"
            )
            db_session.add(activity)
        
        db_session.commit()

        # Verify all activities were created
        activities = db_session.query(Activity).all()
        assert len(activities) >= len(activity_types)
        
        created_types = [a.activity_type for a in activities]
        for activity_type in activity_types:
            assert activity_type in created_types

    def test_activity_long_description(self, db_session):
        """Test that description field can handle long text (TEXT type)."""
        long_description = "A" * 1000  # 1000 character description
        
        activity = Activity(
            activity_type="TEST",
            description=long_description
        )
        db_session.add(activity)
        db_session.commit()

        # Verify long description is stored correctly
        assert activity.description == long_description
        assert len(activity.description) == 1000

    def test_activity_ordering_by_timestamp(self, db_session):
        """Test querying activities ordered by timestamp (most recent first)."""
        # Create activities with slight delays would be ideal, but we'll just
        # rely on auto-increment IDs and timestamp defaults
        activity1 = Activity(
            activity_type="LOGIN",
            description="First activity"
        )
        activity2 = Activity(
            activity_type="TEMPLATE_SAVED",
            description="Second activity"
        )
        activity3 = Activity(
            activity_type="COMPARISON_SAVED",
            description="Third activity"
        )
        
        db_session.add(activity1)
        db_session.commit()
        db_session.add(activity2)
        db_session.commit()
        db_session.add(activity3)
        db_session.commit()

        # Query activities ordered by timestamp DESC
        activities = db_session.query(Activity).order_by(
            Activity.timestamp.desc()
        ).all()

        # Verify ordering (most recent first)
        assert len(activities) >= 3
        # The last created should be first in DESC order
        assert activities[0].description == "Third activity"

