"""
Activity service for audit trail and recent activity tracking.

This module provides business logic for logging activities and retrieving
recent activity records with user attribution.
"""

import logging
from typing import Optional, List
from sqlalchemy.orm import Session
from sqlalchemy import desc

from app.models.activity import Activity
from app.models.user import User
from app.schemas.activity import ActivityResponse, ActivityListResponse


logger = logging.getLogger(__name__)


class ActivityService:
    """Service for managing activity audit trail."""

    def __init__(self, db: Session):
        """
        Initialize the activity service.

        Args:
            db: SQLAlchemy database session
        """
        self.db = db
        self.logger = logging.getLogger(__name__)

    def log_activity(
        self,
        user_id: Optional[int],
        activity_type: str,
        description: str,
        entity_id: Optional[int] = None
    ) -> None:
        """
        Log a new activity to the database.

        This method logs activities without raising exceptions to prevent
        activity logging failures from breaking main operations.

        Args:
            user_id: ID of user performing the action (None for system activities)
            activity_type: Type of activity (must match ActivityType enum)
            description: Human-readable description of the activity
            entity_id: Optional reference to related entity

        Notes:
            - This method should NOT raise exceptions that fail the main operation
            - Errors are logged but swallowed to prevent activity logging from breaking core features
            - Uses db.commit() to persist immediately
        """
        try:
            # Create activity record
            activity = Activity(
                user_id=user_id,
                activity_type=activity_type,
                description=description,
                entity_id=entity_id
            )

            # Persist to database
            self.db.add(activity)
            self.db.commit()

            self.logger.info(
                f"Activity logged: type={activity_type}, user_id={user_id}, "
                f"entity_id={entity_id}"
            )

        except Exception as e:
            # Log the error but don't raise it
            self.logger.error(
                f"Failed to log activity: type={activity_type}, "
                f"user_id={user_id}, error={str(e)}"
            )
            # Rollback the transaction to prevent issues
            try:
                self.db.rollback()
            except Exception:
                pass  # Even rollback failed, nothing we can do

    def get_recent_activities(
        self,
        limit: int = 10,
        exclude_types: Optional[List[str]] = None
    ) -> ActivityListResponse:
        """
        Retrieve recent activities from the database.

        This method performs a LEFT JOIN with the users table to include
        user attribution (email and full name) in the response.

        Args:
            limit: Maximum number of activities to return (default: 10)
            exclude_types: List of activity types to exclude (e.g., ["LOGIN"])

        Returns:
            ActivityListResponse with items and total count

        Raises:
            Exception: If database query fails

        Notes:
            - Joins with users table to include user attribution
            - Orders by timestamp DESC (most recent first)
            - Returns null for user fields if user was deleted (ON DELETE SET NULL)
        """
        try:
            # Build base query with LEFT JOIN to users
            query = self.db.query(
                Activity,
                User.email.label('user_email'),
                User.full_name.label('user_full_name')
            ).outerjoin(
                User, Activity.user_id == User.id
            )

            # Apply exclusion filter if specified
            if exclude_types:
                query = query.filter(~Activity.activity_type.in_(exclude_types))

            # Get total count before applying limit
            total = query.count()

            # Apply ordering and limit
            query = query.order_by(desc(Activity.timestamp)).limit(limit)

            # Execute query
            results = query.all()

            # Transform results into ActivityResponse objects
            items = []
            for activity, user_email, user_full_name in results:
                activity_response = ActivityResponse(
                    id=activity.id,
                    timestamp=activity.timestamp,
                    user_id=activity.user_id,
                    user_email=user_email,
                    user_full_name=user_full_name,
                    activity_type=activity.activity_type,
                    description=activity.description,
                    entity_id=activity.entity_id
                )
                items.append(activity_response)

            # Return paginated response
            return ActivityListResponse(items=items, total=total)

        except Exception as e:
            self.logger.error(f"Failed to fetch recent activities: {str(e)}")
            raise

