"""
Authentication endpoints for SEPE Templates Comparator API.

This module provides HTTP endpoints for user authentication and account
management. All endpoints follow RESTful conventions and return appropriate
HTTP status codes.

Endpoints:
    POST /register - Create a new user account
    POST /login - Authenticate user and receive JWT token
    POST /login/oauth - OAuth2-compatible login endpoint
    GET /me - Get current authenticated user information
    POST /change-password - Change password for authenticated user
    POST /password-reset - Request password reset token
    POST /password-reset/confirm - Confirm password reset with token

Architecture:
    - Uses service layer (user_service) for business logic
    - Endpoints handle only HTTP concerns (validation, status codes)
    - Follows SOLID principles (Single Responsibility)
    - No direct database queries in endpoint handlers

Security:
    - JWT-based authentication
    - Bcrypt password hashing
    - Protected endpoints require valid JWT token
    - Time-limited password reset tokens
"""

from datetime import timedelta
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status
from fastapi.security import OAuth2PasswordRequestForm
from sqlalchemy.orm import Session

from app.core.auth import get_current_active_user
from app.core.config import settings
from app.core.database import get_db
from app.core.security import (
    create_access_token,
    get_password_hash,
    generate_password_reset_token,
    verify_password,
    verify_password_reset_token,
)
from app.models.user import User
from app.schemas.auth import (
    Token,
    UserLogin,
    UserRegister,
    UserResponse,
    PasswordReset,
    PasswordResetConfirm,
    PasswordChange,
)
from app.services import user_service
from app.services.activity_service import ActivityService
from app.schemas.activity import ActivityType

router = APIRouter()


@router.post(
    "/register",
    response_model=UserResponse,
    status_code=status.HTTP_201_CREATED
)
def register(
    user_data: UserRegister,
    db: Session = Depends(get_db)
) -> Any:
    """
    Register a new user account.

    Creates a new user with the provided email, password, and full name.
    The password is automatically hashed before storage. Returns the created
    user information (without password).

    Args:
        user_data: User registration data validated by Pydantic schema:
            - email: Valid email address (unique)
            - password: Password (min 8 characters)
            - full_name: User's full name
        db: Database session dependency injected by FastAPI.

    Returns:
        UserResponse: Created user data including:
            - id: Unique user identifier
            - email: User's email
            - full_name: User's full name
            - is_active: Account status (always True for new users)
            - is_superuser: Superuser status (always False for new users)
            - created_at: Account creation timestamp

    Raises:
        HTTPException: 400 Bad Request if email is already registered.
        HTTPException: 422 Unprocessable Entity if validation fails.

    Example Request:
        POST /api/v1/auth/register
        {
            "email": "user@example.com",
            "password": "securepass123",
            "full_name": "John Doe"
        }

    Example Response (201 Created):
        {
            "id": 1,
            "email": "user@example.com",
            "full_name": "John Doe",
            "is_active": true,
            "is_superuser": false,
            "created_at": "2024-01-01T12:00:00Z"
        }
    """
    # Check if user already exists
    existing_user = user_service.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )

    # Create new user using service layer
    db_user = user_service.create_user(db, user_data)

    # Log NEW_USER activity
    activity_service = ActivityService(db)
    activity_service.log_activity(
        user_id=db_user.id,
        activity_type=ActivityType.NEW_USER.value,
        description=f"New user registered: {db_user.email}",
        entity_id=db_user.id
    )

    return UserResponse(
        id=db_user.id,
        email=db_user.email,
        full_name=db_user.full_name,
        is_active=db_user.is_active,
        is_superuser=db_user.is_superuser,
        created_at=db_user.created_at.isoformat() + "Z"
    )


@router.post("/login", response_model=Token)
def login(
    user_credentials: UserLogin,
    db: Session = Depends(get_db)
) -> Any:
    """
    Authenticate user and generate JWT access token.

    Validates the user's email and password, then generates a JWT token
    that can be used to access protected endpoints. The token must be
    included in the Authorization header for subsequent requests.

    Args:
        user_credentials: Login credentials validated by Pydantic schema:
            - email: User's email address
            - password: User's password (plain text, will be verified)
        db: Database session dependency injected by FastAPI.

    Returns:
        Token: Authentication response including:
            - access_token: JWT token string
            - token_type: Always "bearer"
            - expires_in: Token lifetime in seconds
            - user: User information (UserResponse schema)

    Raises:
        HTTPException: 401 Unauthorized if credentials are incorrect.
        HTTPException: 400 Bad Request if user account is inactive.

    Example Request:
        POST /api/v1/auth/login
        {
            "email": "user@example.com",
            "password": "securepass123"
        }

    Example Response (200 OK):
        {
            "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
            "token_type": "bearer",
            "expires_in": 86400,
            "user": {
                "id": 1,
                "email": "user@example.com",
                "full_name": "John Doe",
                "is_active": true,
                "is_superuser": false,
                "created_at": "2024-01-01T12:00:00Z"
            }
        }

    Usage:
        After receiving the token, include it in subsequent requests:
        Authorization: Bearer <access_token>
    """
    # Authenticate user using service layer
    user = user_service.authenticate_user(
        db,
        user_credentials.email,
        user_credentials.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password",
            headers={"WWW-Authenticate": "Bearer"},
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    access_token_expires = timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    access_token = create_access_token(
        subject=user.id, expires_delta=access_token_expires
    )

    # Log LOGIN activity
    activity_service = ActivityService(db)
    activity_service.log_activity(
        user_id=user.id,
        activity_type=ActivityType.LOGIN.value,
        description=f"User logged in: {user.email}",
        entity_id=None
    )

    return Token(
        access_token=access_token,
        token_type="bearer",
        expires_in=settings.JWT_EXPIRATION_HOURS * 3600,
        user=UserResponse(
            id=user.id,
            email=user.email,
            full_name=user.full_name,
            is_active=user.is_active,
            is_superuser=user.is_superuser,
            created_at=user.created_at.isoformat() + "Z"
        )
    )


@router.post("/login/oauth", response_model=Token)
def login_oauth(
    form_data: OAuth2PasswordRequestForm = Depends(),
    db: Session = Depends(get_db)
) -> Any:
    """
    OAuth2 compatible login endpoint.

    Args:
        form_data: OAuth2 form data
        db: Database session

    Returns:
        Token: JWT access token and user data
    """
    user_credentials = UserLogin(
        email=form_data.username, password=form_data.password
    )
    return login(user_credentials, db)


@router.get("/me", response_model=UserResponse)
def get_current_user_info(
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Get current user information.

    Args:
        current_user: Current authenticated user

    Returns:
        UserResponse: Current user data
    """
    return UserResponse(
        id=current_user.id,
        email=current_user.email,
        full_name=current_user.full_name,
        is_active=current_user.is_active,
        is_superuser=current_user.is_superuser,
        created_at=current_user.created_at.isoformat() + "Z"
    )


@router.post("/change-password")
def change_password(
    password_data: PasswordChange,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Change user password.

    Args:
        password_data: Password change data
        current_user: Current authenticated user
        db: Database session

    Returns:
        dict: Success message

    Raises:
        HTTPException: If old password is incorrect
    """
    if not verify_password(
        password_data.old_password,
        str(current_user.hashed_password)
    ):
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Incorrect password"
        )

    new_hash = get_password_hash(password_data.new_password)
    current_user.hashed_password = new_hash  # type: ignore
    db.commit()

    return {"message": "Password updated successfully"}


@router.post("/password-reset")
def request_password_reset(
    reset_data: PasswordReset,
    db: Session = Depends(get_db)
) -> Any:
    """
    Request password reset.

    Args:
        reset_data: Password reset request data
        db: Database session

    Returns:
        dict: Success message
    """
    # Use service layer to get user by email
    user = user_service.get_user_by_email(db, reset_data.email)

    if user:
        # Generate password reset token
        _ = generate_password_reset_token(str(user.email))
        # TODO: Send email with reset token
        # For now, we'll just return success

    # Always return success to prevent email enumeration
    msg = "If the email exists, a password reset link has been sent"
    return {"message": msg}


@router.post("/password-reset/confirm")
def confirm_password_reset(
    reset_data: PasswordResetConfirm,
    db: Session = Depends(get_db)
) -> Any:
    """
    Confirm password reset with token.

    Args:
        reset_data: Password reset confirmation data
        db: Database session

    Returns:
        dict: Success message

    Raises:
        HTTPException: If token is invalid
    """
    email = verify_password_reset_token(reset_data.token)
    if not email:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Invalid or expired reset token"
        )

    # Use service layer to get user by email
    user = user_service.get_user_by_email(db, email)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="User not found"
        )

    new_hash = get_password_hash(reset_data.new_password)
    user.hashed_password = new_hash  # type: ignore
    db.commit()

    return {"message": "Password reset successfully"}
