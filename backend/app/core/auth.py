"""
Authentication dependencies for FastAPI endpoints.

This module provides reusable FastAPI dependencies for authentication and
authorization. These dependencies can be injected into route handlers to
protect endpoints and enforce access control.

Dependencies Provided:
    - get_current_user: Extract and validate user from JWT token
    - get_current_active_user: Ensure user is authenticated and active
    - get_current_superuser: Ensure user is a superuser
    - get_optional_current_user: Get user if authenticated, None otherwise

Usage:
    >>> from fastapi import APIRouter, Depends
    >>> from app.core.auth import get_current_active_user
    >>> from app.models.user import User
    >>>
    >>> router = APIRouter()
    >>>
    >>> @router.get("/protected")
    >>> async def protected_route(
    ...     current_user: User = Depends(get_current_active_user)
    ... ):
    ...     return {"user": current_user.email}

Security Model:
    - Uses HTTP Bearer token authentication (JWT)
    - Tokens must be sent in Authorization header: "Bearer <token>"
    - User validation includes database lookup and status checks
    - Failed authentication returns 401 Unauthorized
    - Insufficient permissions return 403 Forbidden
"""

from typing import Optional
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_token
from app.models.user import User


# Security scheme for JWT tokens
security = HTTPBearer()


async def get_current_user(
    credentials: HTTPAuthorizationCredentials = Depends(security),
    db: Session = Depends(get_db)
) -> User:
    """
    FastAPI dependency to extract and validate the current user from JWT token.

    This dependency validates the JWT token from the Authorization header,
    extracts the user ID, and retrieves the user from the database. Use this
    as a base dependency for all protected endpoints.

    Args:
        credentials: HTTP Bearer token credentials automatically extracted
            from the "Authorization: Bearer <token>" header by FastAPI.
        db: SQLAlchemy database session injected by FastAPI.

    Returns:
        User: The authenticated user object from the database.

    Raises:
        HTTPException: 401 Unauthorized in the following cases:
            - Token is missing or malformed
            - Token signature is invalid
            - Token has expired
            - User ID from token doesn't exist in database

    Example:
        >>> @router.get("/profile")
        >>> async def get_profile(user: User = Depends(get_current_user)):
        ...     return {"email": user.email, "name": user.full_name}

    Security:
        - Validates token cryptographically using JWT signature
        - Checks token expiration automatically
        - Performs database lookup to ensure user still exists
        - Does NOT check if user is active (use get_current_active_user)

    Note:
        This dependency does not check is_active status. For most endpoints,
        you should use get_current_active_user instead to ensure the user
        account is active.
    """
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

    try:
        token = credentials.credentials
        user_id = verify_token(token)
        if user_id is None:
            raise credentials_exception
    except Exception:
        raise credentials_exception

    user = db.query(User).filter(User.id == int(user_id)).first()
    if user is None:
        raise credentials_exception

    return user


async def get_current_active_user(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    FastAPI dependency to get authenticated user and verify they are active.

    This is the most commonly used authentication dependency. It ensures
    the user is both authenticated (valid token) and active (account not
    disabled). Use this for all standard protected endpoints.

    Args:
        current_user: User object injected by the get_current_user dependency.
            FastAPI automatically resolves this dependency chain.

    Returns:
        User: The authenticated and active user object.

    Raises:
        HTTPException: 400 Bad Request if the user account is inactive
            (is_active = False).

    Example:
        >>> @router.get("/dashboard")
        >>> async def dashboard(
        ...     user: User = Depends(get_current_active_user)
        ... ):
        ...     return {"message": f"Welcome {user.full_name}"}

        >>> @router.post("/data")
        >>> async def create_data(
        ...     data: DataCreate,
        ...     user: User = Depends(get_current_active_user)
        ... ):
        ...     # User is guaranteed to be authenticated and active
        ...     return create_user_data(user.id, data)

    Security:
        - Inherits all validation from get_current_user (token, expiry, etc.)
        - Additional check for is_active status
        - Prevents inactive/banned users from accessing resources
        - Returns 400 (not 403) to distinguish from permission errors

    Note:
        Use this dependency instead of get_current_user for most endpoints
        unless you specifically need to allow inactive users.
    """
    if not current_user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )
    return current_user


async def get_current_superuser(
    current_user: User = Depends(get_current_user)
) -> User:
    """
    FastAPI dependency to ensure the current user is a superuser.

    Use this dependency for admin-only endpoints that require elevated
    privileges. It validates the user is authenticated and has the
    is_superuser flag set to True.

    Args:
        current_user: User object injected by the get_current_user dependency.
            FastAPI automatically resolves this dependency chain.

    Returns:
        User: The authenticated superuser object.

    Raises:
        HTTPException: 403 Forbidden if the user is not a superuser
            (is_superuser = False).

    Example:
        >>> @router.delete("/users/{user_id}")
        >>> async def delete_user(
        ...     user_id: int,
        ...     admin: User = Depends(get_current_superuser)
        ... ):
        ...     # Only superusers can access this endpoint
        ...     return delete_user_by_id(user_id)

        >>> @router.get("/admin/stats")
        >>> async def admin_stats(
        ...     admin: User = Depends(get_current_superuser)
        ... ):
        ...     return get_system_statistics()

    Security:
        - Inherits all validation from get_current_user
        - Additional check for is_superuser status
        - Returns 403 Forbidden for non-superusers (not 401)
        - Appropriate for admin/management endpoints

    Note:
        This dependency does NOT check is_active status. If you need both
        superuser and active checks, combine with get_current_active_user
        or add the check manually.
    """
    if not current_user.is_superuser:
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="Not enough permissions"
        )
    return current_user


def get_optional_current_user(
    credentials: Optional[HTTPAuthorizationCredentials] = Depends(security),
    db: Session = Depends(get_db)
) -> Optional[User]:
    """
    FastAPI dependency to optionally extract user from JWT token.

    This dependency is useful for endpoints that provide different behavior
    for authenticated vs anonymous users, but don't require authentication.
    It returns the user if a valid token is provided, or None otherwise.

    Unlike get_current_user, this dependency does NOT raise exceptions for
    missing or invalid tokens - it simply returns None.

    Args:
        credentials: Optional HTTP Bearer token credentials. If no token is
            provided in the Authorization header, this will be None.
        db: SQLAlchemy database session injected by FastAPI.

    Returns:
        Optional[User]: The authenticated and active user if a valid token
            is provided, None if no token or invalid token.

    Example:
        >>> @router.get("/items")
        >>> async def list_items(
        ...     user: Optional[User] = Depends(get_optional_current_user)
        ... ):
        ...     if user:
        ...         # Show user-specific items
        ...         return get_user_items(user.id)
        ...     else:
        ...         # Show public items
        ...         return get_public_items()

        >>> @router.get("/content/{content_id}")
        >>> async def get_content(
        ...     content_id: int,
        ...     user: Optional[User] = Depends(get_optional_current_user)
        ... ):
        ...     content = get_content_by_id(content_id)
        ...     # Show full content if premium user, preview if not
        ...     return content if user and user.is_premium else content.preview

    Behavior:
        - No token provided: Returns None (no exception)
        - Invalid/expired token: Returns None (no exception)
        - Valid token, inactive user: Returns None
        - Valid token, active user: Returns User object

    Security:
        - Gracefully handles missing or invalid tokens
        - Always checks is_active status
        - Useful for optional authentication
        - Does not expose authentication failures

    Note:
        This dependency checks is_active status and returns None for
        inactive users. This differs from get_current_user which doesn't
        check is_active.
    """
    if not credentials:
        return None

    try:
        token = credentials.credentials
        user_id = verify_token(token)
        if user_id is None:
            return None

        user = db.query(User).filter(User.id == int(user_id)).first()
        return user if user and user.is_active else None
    except Exception:
        return None
