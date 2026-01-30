# TASK-US-002-01: Create User Model

## Parent User Story
[US-002: Database Models and Migrations](../../user-stories/backend/US-002-database-models-migrations.md)

## Description
Define the User model using SQLModel with all required fields for user management, authentication, and API key handling.

## Priority
🔴 Critical

## Estimated Time
1.5 hours

## Detailed Steps

### 1. Create core/users/models.py
```python
"""User model definition."""

from datetime import datetime
from typing import Optional
import secrets
import uuid

from sqlmodel import Field, SQLModel, Relationship
from passlib.hash import bcrypt
import arrow


class User(SQLModel, table=True):
    """User model for the IPFS Gateway."""
    
    __tablename__ = "users"
    
    id: Optional[int] = Field(default=None, primary_key=True)
    email: str = Field(unique=True, nullable=False, index=True, max_length=255)
    password_hash: str = Field(nullable=False)
    api_key: str = Field(unique=True, nullable=False, index=True, max_length=64)
    is_active: bool = Field(default=True)
    is_admin: bool = Field(default=False)
    is_deleted: bool = Field(default=False)
    usage_count: int = Field(default=0)
    created_at: datetime = Field(default_factory=lambda: arrow.utcnow().datetime)
    updated_at: datetime = Field(default_factory=lambda: arrow.utcnow().datetime)
    last_renewed_at: Optional[datetime] = Field(default=None)
    
    # Relationships
    files: list["File"] = Relationship(back_populates="user")
    audit_logs: list["AuditLog"] = Relationship(back_populates="user")
    
    def set_password(self, password: str) -> None:
        """Hash and set the user's password.
        
        Args:
            password: Plain text password to hash.
        """
        self.password_hash = bcrypt.hash(password)
    
    def verify_password(self, password: str) -> bool:
        """Verify a password against the stored hash.
        
        Args:
            password: Plain text password to verify.
            
        Returns:
            bool: True if password matches, False otherwise.
        """
        return bcrypt.verify(password, self.password_hash)
    
    @staticmethod
    def generate_api_key() -> str:
        """Generate a new unique API key.
        
        Returns:
            str: A new API key with prefix.
        """
        key = secrets.token_hex(32)
        return f"ipfs_gw_{key}"
    
    def renew_api_key(self) -> str:
        """Generate and set a new API key.
        
        Returns:
            str: The new API key.
        """
        self.api_key = self.generate_api_key()
        self.last_renewed_at = arrow.utcnow().datetime
        self.updated_at = arrow.utcnow().datetime
        return self.api_key
    
    def increment_usage(self) -> None:
        """Increment the usage counter."""
        self.usage_count += 1
        self.updated_at = arrow.utcnow().datetime
    
    def soft_delete(self) -> None:
        """Soft delete the user."""
        self.is_deleted = True
        self.is_active = False
        self.updated_at = arrow.utcnow().datetime
    
    def revoke(self) -> None:
        """Revoke the user's API key."""
        self.is_active = False
        self.updated_at = arrow.utcnow().datetime
    
    def reactivate(self) -> None:
        """Reactivate the user's API key."""
        self.is_active = True
        self.updated_at = arrow.utcnow().datetime
    
    def to_dict(self, include_sensitive: bool = False) -> dict:
        """Convert user to dictionary.
        
        Args:
            include_sensitive: Include sensitive fields like api_key.
            
        Returns:
            dict: User data as dictionary.
        """
        data = {
            "id": self.id,
            "email": self.email,
            "is_active": self.is_active,
            "is_admin": self.is_admin,
            "usage_count": self.usage_count,
            "created_at": self.created_at.isoformat() if self.created_at else None,
            "last_renewed_at": self.last_renewed_at.isoformat() if self.last_renewed_at else None,
        }
        if include_sensitive:
            data["api_key"] = self.api_key
        return data


# Import forward references after definition
from core.files.models import File
from core.common.models import AuditLog

User.model_rebuild()
```

### 2. Create Pydantic Schemas
```python
# core/users/schemas.py
"""Pydantic schemas for User validation."""

from pydantic import BaseModel, EmailStr, Field
from datetime import datetime
from typing import Optional


class UserCreate(BaseModel):
    """Schema for user registration."""
    email: EmailStr
    password: str = Field(min_length=8, max_length=128)


class UserResponse(BaseModel):
    """Schema for user response."""
    email: str
    api_key: str
    
    model_config = {"from_attributes": True}


class UserStatus(BaseModel):
    """Schema for user status response."""
    api_key_status: str
    created_at: datetime
    last_renewed_at: Optional[datetime]
    usage_count: int
```

## Acceptance Criteria
- [ ] User model is defined with all required fields
- [ ] Password hashing methods work correctly
- [ ] API key generation is secure
- [ ] Relationships are properly defined
- [ ] Indexes are added for frequently queried fields
- [ ] Pydantic schemas are created for validation

## Notes
- Use bcrypt for password hashing (secure and battle-tested)
- API key prefix helps identify keys in logs
- Soft delete preserves data while removing access

## Completion Status
- [ ] 0% - Not Started
