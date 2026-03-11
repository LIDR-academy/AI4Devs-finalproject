"""
User service for business logic and database operations.

This module contains all user-related business logic, including user creation,
retrieval, and authentication operations. It follows the Single Responsibility
Principle by separating database operations from HTTP endpoint handlers.
"""

from typing import Optional
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.schemas.auth import UserRegister


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Retrieve a user by their email address.

    Args:
        db: SQLAlchemy database session
        email: User's email address

    Returns:
        User model instance if found, None otherwise
    """
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user_data: UserRegister) -> User:
    """
    Create a new user with hashed password.

    Args:
        db: SQLAlchemy database session
        user_data: UserRegister Pydantic schema with user details

    Returns:
        Created User model instance

    Note:
        Caller should verify email uniqueness before calling function.
    """
    # Hash the password
    hashed_password = get_password_hash(user_data.password)

    # Create user instance
    db_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        is_active=True,
        is_superuser=False
    )

    # Persist to database
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """
    Retrieve a user by their ID.

    Args:
        db: SQLAlchemy database session
        user_id: User's unique identifier

    Returns:
        User model instance if found, None otherwise
    """
    return db.query(User).filter(User.id == user_id).first()


def authenticate_user(
    db: Session, email: str, password: str
) -> Optional[User]:
    """
    Authenticate a user with email and password.

    Args:
        db: SQLAlchemy database session
        email: User's email address
        password: Plain text password to verify

    Returns:
        User model instance if credentials are valid, None otherwise

    Note:
        This function only verifies credentials. The caller should check
        the user's is_active status separately if needed.
    """
    # Get user by email
    user = get_user_by_email(db, email)
    if not user:
        return None

    # Verify password
    if not verify_password(password, str(user.hashed_password)):
        return None

    return user
