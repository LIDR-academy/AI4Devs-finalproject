# TASK-US-004-01: Create Status Endpoint

[Trello Card](https://trello.com/c/0NtEmnOS)



## Parent User Story
[US-004: API Key Management](../../user-stories/backend/US-004-api-key-management.md)

## Description
Implement the `POST /api/v1/users/status` endpoint that allows users to check their API key status, including activation state, creation date, last renewal date, and usage count.

## Priority
🔴 Critical

## Estimated Time
2 hours

## Detailed Steps

### 1. Create Status Route (core/users/routes/status.py)
```python
"""API key status check endpoint."""

from flask import jsonify, request
from sqlmodel import Session, select

from core import get_engine
from core.auth.decorators import require_api_key
from core.common.exceptions import AuthenticationError
from core.users.models import User


@require_api_key
def status():
    """Check API key status for authenticated user.
    
    Returns:
        JSON response with API key status information.
    """
    api_key = request.headers.get("X-API-Key")
    
    with Session(get_engine()) as session:
        user = session.exec(
            select(User).where(User.api_key == api_key)
        ).first()
        
        if not user:
            raise AuthenticationError("Invalid API key")
        
        # Determine status based on user flags
        if user.is_deleted:
            status_value = "revoked"
        elif user.is_active:
            status_value = "active"
        else:
            status_value = "inactive"
        
        return jsonify({
            "status": 200,
            "data": {
                "api_key_status": status_value,
                "created_at": user.created_at.isoformat(),
                "last_renewed_at": user.last_renewed_at.isoformat() if user.last_renewed_at else None,
                "usage_count": user.usage_count,
            }
        }), 200
```

### 2. Register Route in Blueprint (core/users/__init__.py)
```python
from flask import Blueprint

users_bp = Blueprint("users", __name__, url_prefix="/api/v1/users")

from core.users.routes.register import register
from core.users.routes.status import status

users_bp.add_url_rule("/register", view_func=register, methods=["POST"])
users_bp.add_url_rule("/status", view_func=status, methods=["POST"])
```

### 3. Update User Model if Needed
Ensure the User model has all required fields:
- `api_key`
- `created_at`
- `last_renewed_at`
- `usage_count`
- `is_active`
- `is_deleted`

All fields already exist in the current User model.

### 4. Create Integration Tests (tests/backend/test_status.py)
```python
"""Integration tests for API key status endpoint."""

import tempfile
import unittest
from pathlib import Path
import sys

from sqlmodel import SQLModel, Session

ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from config.testing import TestingConfig
from core import create_app, get_engine
from core.users.models import User


class TestStatusEndpoint(unittest.TestCase):
    """Test API key status check functionality."""

    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "status_test.db"

        class StatusTestConfig(TestingConfig):
            DATABASE_URL = f"sqlite:///{db_path}"
            TESTING = True

        self.app = create_app(StatusTestConfig)
        self.client = self.app.test_client()
        SQLModel.metadata.create_all(get_engine())

        # Create test user
        with Session(get_engine()) as session:
            self.test_user = User(
                email="test@example.com",
                password_hash="hashed_password",
                api_key="ipfs_gw_test_key_12345",
                is_active=True,
                usage_count=42,
            )
            session.add(self.test_user)
            session.commit()

    def tearDown(self) -> None:
        SQLModel.metadata.drop_all(get_engine())
        self.temp_dir.cleanup()

    def test_status_returns_active_for_valid_key(self) -> None:
        """Valid API key should return active status with user data."""
        response = self.client.post(
            "/api/v1/users/status",
            headers={"X-API-Key": "ipfs_gw_test_key_12345"},
        )

        self.assertEqual(response.status_code, 200)
        data = response.get_json()["data"]
        self.assertEqual(data["api_key_status"], "active")
        self.assertEqual(data["usage_count"], 42)
        self.assertIsNotNone(data["created_at"])

    def test_status_returns_401_for_invalid_key(self) -> None:
        """Invalid API key should return 401."""
        response = self.client.post(
            "/api/v1/users/status",
            headers={"X-API-Key": "invalid_key"},
        )

        self.assertEqual(response.status_code, 401)

    def test_status_returns_401_for_missing_key(self) -> None:
        """Missing API key header should return 401."""
        response = self.client.post("/api/v1/users/status")

        self.assertEqual(response.status_code, 401)

    def test_status_returns_revoked_for_deleted_user(self) -> None:
        """Deleted user should show revoked status."""
        with Session(get_engine()) as session:
            user = session.exec(
                select(User).where(User.api_key == "ipfs_gw_test_key_12345")
            ).first()
            user.is_deleted = True
            session.add(user)
            session.commit()

        response = self.client.post(
            "/api/v1/users/status",
            headers={"X-API-Key": "ipfs_gw_test_key_12345"},
        )

        self.assertEqual(response.status_code, 200)
        data = response.get_json()["data"]
        self.assertEqual(data["api_key_status"], "revoked")


if __name__ == "__main__":
    unittest.main()
```

## Acceptance Criteria
- [ ] `POST /api/v1/users/status` endpoint exists and is registered
- [ ] Endpoint requires valid `X-API-Key` header via `@require_api_key` decorator
- [ ] Returns 200 with status "active" for active users
- [ ] Returns 200 with status "inactive" for inactive users
- [ ] Returns 200 with status "revoked" for deleted users
- [ ] Returns 401 for invalid or missing API key
- [ ] Response includes `created_at`, `last_renewed_at`, and `usage_count`
- [ ] All tests pass

## Notes
- This endpoint does NOT require step-up verification (status check only)
- The decorator `@require_api_key` will be implemented in TASK-US-004-05
- Status values: `"active"`, `"inactive"`, `"revoked"`
- Deleted users (`is_deleted=True`) show as "revoked"
- Inactive users (`is_active=False`) show as "inactive"

## Completion Status
- [ ] 0% - Not Started
