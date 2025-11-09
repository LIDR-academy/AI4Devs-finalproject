"""
Activity model for SEPE Templates Comparator.

This module defines the Activity SQLAlchemy model for audit trail
and recent activity tracking across the system.
"""

from sqlalchemy import Column, Integer, String, DateTime, ForeignKey, Text
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class Activity(Base):
    """
    Activity model for audit trail and recent activity tracking.

    This model logs all significant user actions in the system for:
    - Audit trail and compliance
    - Recent activity dashboard display
    - Usage analytics and debugging
    """

    __tablename__ = "activity"

    # Primary Key
    id = Column(Integer, primary_key=True, index=True)

    # Timestamp
    timestamp = Column(
        DateTime(timezone=True),
        server_default=func.now(),
        nullable=False,
        index=True
    )

    # User Reference (nullable for system activities)
    user_id = Column(
        Integer,
        ForeignKey("users.id", ondelete="SET NULL"),
        nullable=True,
        index=True
    )

    # Activity Metadata
    activity_type = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=False)

    # Entity Reference (optional, for linking to specific records)
    entity_id = Column(Integer, nullable=True, index=True)

    # Relationships
    user = relationship("User", backref="activities")

    def __repr__(self) -> str:
        return (
            f"<Activity(id={self.id}, type='{self.activity_type}', "
            f"user_id={self.user_id}, timestamp='{self.timestamp}')>"
        )

