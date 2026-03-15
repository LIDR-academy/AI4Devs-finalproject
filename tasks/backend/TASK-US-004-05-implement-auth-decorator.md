# TASK-US-004-05: Implement Auth Decorator

[Trello Card](https://trello.com/c/Rf6IPpKT)



## Parent User Story
[US-004: API Key Management](../../user-stories/backend/US-004-api-key-management.md)

## Description
Create the `@require_api_key` decorator for authenticating users via the `X-API-Key` header. This decorator will be used by endpoints that require valid API key authentication.

## Priority
🔴 Critical

## Estimated Time
2 hours

## Detailed Steps

### 1. Create Auth Decorators Module (core/auth/decorators.py)
```python
"""Authentication and authorization decorators."""

from functools import wraps
from flask import request
from sqlmodel import Session, select

from core import get_engine
from core.common.exceptions import AuthenticationError
from core.users.models import User


def require_api_key(f):
    """Decorator to require valid API key in X-API-Key header.
    
    Validates that:
    - X-API-Key header is present
    - API key exists in database
    - User is active and not deleted
    
    Raises:
        AuthenticationError: If API key is missing, invalid, or user is inactive/deleted.
    """
    @wraps(f)
    def decorated_function(*args, **kwargs):
        api_key = request.headers.get("X-API-Key")
        
        if not api_key:
            raise AuthenticationError("Missing X-API-Key header")
        
        with Session(get_engine()) as session:
            user = session.exec(
                select(User).where(User.api_key == api_key)
            ).first()
            
            if not user:
                raise AuthenticationError("Invalid API key")
            
            if user.is_deleted:
                raise AuthenticationError("API key has been revoked")
            
            if not user.is_active:
                raise AuthenticationError("API key is inactive")
        
        return f(*args, **kwargs)
    
    return decorated_function


def get_current_user() -> User:
    """Get the currently authenticated user from request context.
    
    Must be called within a request context after @require_api_key.
    
    Returns:
        User: The authenticated user.
        
    Raises:
        AuthenticationError: If no valid API key in request.
    """
    api_key = request.headers.get("X-API-Key")
    
    if not api_key:
        raise AuthenticationError("Missing X-API-Key header")
    
    with Session(get_engine()) as session:
        user = session.exec(
            select(User).where(User.api_key == api_key)
        ).first()
        
        if not user or user.is_deleted or not user.is_active:
            raise AuthenticationError("Invalid or inactive API key")
        
        return user
```

### 2. Create Auth Module Init (core/auth/__init__.py)
```python
"""Authentication and authorization module."""

from core.auth.decorators import require_api_key, get_current_user

__all__ = ["require_api_key", "get_current_user"]
```

### 3. Update Exception Handler (core/common/exceptions.py)
Ensure `AuthenticationError` exists:

```python
class AuthenticationError(APIException):
    """Authentication failed (401)."""
    
    def __init__(self, message: str = "Authentication required"):
        super().__init__(message, status_code=401)
```

### 4. Create Unit Tests (tests/backend/test_auth_decorators.py)
```python
"""Unit tests for authentication decorators."""

import tempfile
import unittest
from pathlib import Path
import sys

from flask import Flask, jsonify
from sqlmodel import SQLModel, Session

ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from config.testing import TestingConfig
from core import create_app, get_engine
from core.auth.decorators import require_api_key, get_current_user
from core.users.models import User


class TestAuthDecorators(unittest.TestCase):
    """Test API key authentication decorator."""

    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "auth_test.db"

        class AuthTestConfig(TestingConfig):
            DATABASE_URL = f"sqlite:///{db_path}"
            TESTING = True

        self.app = create_app(AuthTestConfig)
        self.client = self.app.test_client()
        SQLModel.metadata.create_all(get_engine())

        # Create test users
        with Session(get_engine()) as session:
            self.active_user = User(
                email="active@example.com",
                password_hash="hashed",
                api_key="ipfs_gw_active_key",
                is_active=True,
                is_deleted=False,
            )
            self.inactive_user = User(
                email="inactive@example.com",
                password_hash="hashed",
                api_key="ipfs_gw_inactive_key",
                is_active=False,
                is_deleted=False,
            )
            self.deleted_user = User(
                email="deleted@example.com",
                password_hash="hashed",
                api_key="ipfs_gw_deleted_key",
                is_active=True,
                is_deleted=True,
            )
            session.add(self.active_user)
            session.add(self.inactive_user)
            session.add(self.deleted_user)
            session.commit()

        # Add test endpoint
        @self.app.route("/test/protected")
        @require_api_key
        def protected_endpoint():
            return jsonify({"message": "success"}), 200

    def tearDown(self) -> None:
        SQLModel.metadata.drop_all(get_engine())
        self.temp_dir.cleanup()

    def test_valid_api_key_allows_access(self) -> None:
        """Valid active API key should allow access."""
        response = self.client.get(
            "/test/protected",
            headers={"X-API-Key": "ipfs_gw_active_key"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["message"], "success")

    def test_missing_api_key_returns_401(self) -> None:
        """Missing X-API-Key header should return 401."""
        response = self.client.get("/test/protected")

        self.assertEqual(response.status_code, 401)

    def test_invalid_api_key_returns_401(self) -> None:
        """Invalid API key should return 401."""
        response = self.client.get(
            "/test/protected",
            headers={"X-API-Key": "invalid_key"},
        )

        self.assertEqual(response.status_code, 401)

    def test_inactive_api_key_returns_401(self) -> None:
        """Inactive user API key should return 401."""
        response = self.client.get(
            "/test/protected",
            headers={"X-API-Key": "ipfs_gw_inactive_key"},
        )

        self.assertEqual(response.status_code, 401)
        self.assertIn("inactive", response.get_json()["message"].lower())

    def test_deleted_api_key_returns_401(self) -> None:
        """Deleted (revoked) user API key should return 401."""
        response = self.client.get(
            "/test/protected",
            headers={"X-API-Key": "ipfs_gw_deleted_key"},
        )

        self.assertEqual(response.status_code, 401)
        self.assertIn("revoked", response.get_json()["message"].lower())

    def test_get_current_user_returns_user(self) -> None:
        """get_current_user should return authenticated user."""
        with self.app.test_request_context(
            headers={"X-API-Key": "ipfs_gw_active_key"}
        ):
            user = get_current_user()
            self.assertEqual(user.email, "active@example.com")


if __name__ == "__main__":
    unittest.main()
```

## Acceptance Criteria
- [ ] `@require_api_key` decorator created in `core/auth/decorators.py`
- [ ] Decorator validates `X-API-Key` header presence
- [ ] Decorator checks API key exists in database
- [ ] Decorator verifies user is active (`is_active=True`)
- [ ] Decorator verifies user is not deleted (`is_deleted=False`)
- [ ] Returns 401 for missing API key
- [ ] Returns 401 for invalid API key
- [ ] Returns 401 for inactive users
- [ ] Returns 401 for deleted/revoked users
- [ ] `get_current_user()` helper function available
- [ ] All tests pass

## Notes
- Decorator checks authentication only (not authorization)
- Admin check is separate (see TASK-US-004-06)
- `get_current_user()` helper useful for endpoints needing user context
- Uses constant-time comparison for API keys (future enhancement)

## Completion Status
- [ ] 0% - Not Started
