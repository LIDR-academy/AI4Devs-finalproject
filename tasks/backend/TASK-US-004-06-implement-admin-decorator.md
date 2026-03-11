# TASK-US-004-06: Implement Admin Decorator

[Trello Card](https://trello.com/c/ZdUKMLgC)



## Parent User Story
[US-004: API Key Management](../../user-stories/backend/US-004-api-key-management.md)

## Description
Create the `@require_admin` decorator for protecting admin-only endpoints. This decorator builds on `@require_api_key` by adding admin privilege verification.

## Priority
🟠 High

## Estimated Time
1.5 hours

## Detailed Steps

### 1. Add Admin Decorator to Auth Module (core/auth/decorators.py)
```python
def require_admin(f):
    """Decorator to require admin privileges.
    
    Validates that:
    - Valid API key is present (via require_api_key logic)
    - User has admin privileges (is_admin=True)
    
    Raises:
        AuthenticationError: If API key is missing or invalid.
        AuthorizationError: If user is not an admin.
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
            
            if not user.is_admin:
                from core.common.exceptions import AuthorizationError
                raise AuthorizationError("Admin privileges required")
        
        return f(*args, **kwargs)
    
    return decorated_function
```

### 2. Update Auth Module Exports (core/auth/__init__.py)
```python
"""Authentication and authorization module."""

from core.auth.decorators import require_api_key, require_admin, get_current_user

__all__ = ["require_api_key", "require_admin", "get_current_user"]
```

### 3. Ensure Authorization Exception Exists (core/common/exceptions.py)
```python
class AuthorizationError(APIException):
    """Authorization failed - insufficient privileges (403)."""
    
    def __init__(self, message: str = "Insufficient privileges"):
        super().__init__(message, status_code=403)
```

### 4. Create Unit Tests (tests/backend/test_admin_decorator.py)
```python
"""Unit tests for admin authorization decorator."""

import tempfile
import unittest
from pathlib import Path
import sys

from flask import jsonify
from sqlmodel import SQLModel, Session

ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from config.testing import TestingConfig
from core import create_app, get_engine
from core.auth.decorators import require_admin
from core.users.models import User


class TestAdminDecorator(unittest.TestCase):
    """Test admin authorization decorator."""

    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "admin_test.db"

        class AdminTestConfig(TestingConfig):
            DATABASE_URL = f"sqlite:///{db_path}"
            TESTING = True

        self.app = create_app(AdminTestConfig)
        self.client = self.app.test_client()
        SQLModel.metadata.create_all(get_engine())

        # Create test users
        with Session(get_engine()) as session:
            self.admin_user = User(
                email="admin@example.com",
                password_hash="hashed",
                api_key="ipfs_gw_admin_key",
                is_active=True,
                is_admin=True,
            )
            self.regular_user = User(
                email="user@example.com",
                password_hash="hashed",
                api_key="ipfs_gw_user_key",
                is_active=True,
                is_admin=False,
            )
            session.add(self.admin_user)
            session.add(self.regular_user)
            session.commit()

        # Add test endpoint
        @self.app.route("/test/admin")
        @require_admin
        def admin_endpoint():
            return jsonify({"message": "admin access granted"}), 200

    def tearDown(self) -> None:
        SQLModel.metadata.drop_all(get_engine())
        self.temp_dir.cleanup()

    def test_admin_api_key_allows_access(self) -> None:
        """Admin user should access admin endpoint."""
        response = self.client.get(
            "/test/admin",
            headers={"X-API-Key": "ipfs_gw_admin_key"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.get_json()["message"], "admin access granted")

    def test_regular_user_returns_403(self) -> None:
        """Non-admin user should get 403 Forbidden."""
        response = self.client.get(
            "/test/admin",
            headers={"X-API-Key": "ipfs_gw_user_key"},
        )

        self.assertEqual(response.status_code, 403)
        self.assertIn("privileges", response.get_json()["message"].lower())

    def test_missing_api_key_returns_401(self) -> None:
        """Missing API key should return 401 (not 403)."""
        response = self.client.get("/test/admin")

        self.assertEqual(response.status_code, 401)

    def test_invalid_api_key_returns_401(self) -> None:
        """Invalid API key should return 401 (not 403)."""
        response = self.client.get(
            "/test/admin",
            headers={"X-API-Key": "invalid_key"},
        )

        self.assertEqual(response.status_code, 401)


if __name__ == "__main__":
    unittest.main()
```

## Acceptance Criteria
- [ ] `@require_admin` decorator created in `core/auth/decorators.py`
- [ ] Decorator performs all `@require_api_key` checks
- [ ] Decorator additionally checks `is_admin=True`
- [ ] Returns 401 for authentication failures (missing/invalid key)
- [ ] Returns 403 for authorization failures (non-admin user)
- [ ] Admin users can access protected endpoints
- [ ] Regular users get 403 Forbidden
- [ ] All tests pass

## Notes
- Combines authentication and authorization checks
- 401 = authentication problem (who are you?)
- 403 = authorization problem (you are authenticated but lack privileges)
- Used by `/revoke` and `/reactivate` endpoints

## Completion Status
- [ ] 0% - Not Started
