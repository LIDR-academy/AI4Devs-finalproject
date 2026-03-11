"""
User model for SEPE Templates Comparator.

This module defines the User SQLAlchemy model for user authentication
and profile management.
"""

from sqlalchemy import Column, Integer, String, Boolean, DateTime
from sqlalchemy.sql import func
from sqlalchemy.orm import relationship

from app.core.database import Base


class User(Base):
    """User model for authentication and profile information."""
    
    __tablename__ = "users"
    
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String(255), unique=True, nullable=False, index=True)
    hashed_password = Column(String(255), nullable=False)
    full_name = Column(String(255), nullable=True)
    is_active = Column(Boolean, default=True, index=True)
    is_superuser = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    # Relationships
    uploaded_templates = relationship(
        "PDFTemplate",
        back_populates="uploader",
        foreign_keys="PDFTemplate.uploaded_by"
    )
    created_comparisons = relationship(
        "Comparison",
        back_populates="creator",
        foreign_keys="Comparison.created_by"
    )
    
    def __repr__(self) -> str:
        return f"<User(id={self.id}, email='{self.email}', active={self.is_active})>"
