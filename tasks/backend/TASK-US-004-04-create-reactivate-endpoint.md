# TASK-US-004-04: Create Reactivate Endpoint

[Trello Card](https://trello.com/c/TmZWsuUV)



## Parent User Story
[US-004: API Key Management](../../user-stories/backend/US-004-api-key-management.md)

## Description
Implement the `POST /api/v1/users/reactivate` admin-only endpoint that allows administrators to reactivate previously revoked API keys.

## Priority
🟡 Medium

## Estimated Time
2 hours

## Detailed Steps

### 1. Create Reactivate Route (core/users/routes/reactivate.py)
```python
"""API key reactivation endpoint (admin only)."""

from flask import jsonify, request
from sqlmodel import Session, select

from core import get_engine
from core.auth.decorators import require_admin
from core.common.exceptions import NotFoundError, ValidationError
from core.common.models import AuditLog
from core.users.models import User
import arrow


@require_admin
def reactivate():
    """Reactivate revoked API key for specified user (admin only).
    
    Request body must include:
        - user_email: Email of user whose key should be reactivated
    
    Returns:
        Success message on reactivation.
    """
    data = request.get_json()
    
    if not data or "user_email" not in data:
        raise ValidationError("Missing user_email in request body")
    
    user_email = data["user_email"]
    
    with Session(get_engine()) as session:
        user = session.exec(
            select(User).where(User.email == user_email)
        ).first()
        
        if not user:
            raise NotFoundError(f"User with email {user_email} not found")
        
        if not user.is_deleted:
            return jsonify({
                "status": 200,
                "message": "API key is already active"
            }), 200
        
        # Reactivate user
        user.is_deleted = False
        user.is_active = True
        user.updated_at = arrow.utcnow().datetime
        session.add(user)
        
        # Log reactivation action
        admin_key = request.headers.get("X-API-Key")
        admin_user = session.exec(
            select(User).where(User.api_key == admin_key)
        ).first()
        
        audit = AuditLog(
            user_id=user.id,
            action="api_key_reactivated_by_admin",
            timestamp=arrow.utcnow().datetime,
            details=f'{{"admin_email": "{admin_user.email if admin_user else "unknown"}"}}',
        )
        session.add(audit)
        session.commit()
        
        return jsonify({
            "status": 200,
            "message": "API key reactivated successfully"
        }), 200
```

### 2. Register Route (core/users/__init__.py)
```python
from core.users.routes.reactivate import reactivate

users_bp.add_url_rule("/reactivate", view_func=reactivate, methods=["POST"])
```

### 3. Create Integration Tests (tests/backend/test_reactivate.py)
```python
"""Integration tests for API key reactivation endpoint."""

import tempfile
import unittest
from pathlib import Path
import sys

from sqlmodel import SQLModel, Session, select

ROOT = Path(__file__).resolve().parents[2]
BACKEND_DIR = ROOT / "backend"
if str(BACKEND_DIR) not in sys.path:
    sys.path.insert(0, str(BACKEND_DIR))

from config.testing import TestingConfig
from core import create_app, get_engine
from core.common.models import AuditLog
from core.users.models import User


class TestReactivateEndpoint(unittest.TestCase):
    """Test admin API key reactivation."""

    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "reactivate_test.db"

        class ReactivateTestConfig(TestingConfig):
            DATABASE_URL = f"sqlite:///{db_path}"
            TESTING = True

        self.app = create_app(ReactivateTestConfig)
        self.client = self.app.test_client()
        SQLModel.metadata.create_all(get_engine())

        # Create admin and revoked user
        with Session(get_engine()) as session:
            self.admin_user = User(
                email="admin@example.com",
                password_hash="hashed_password",
                api_key="ipfs_gw_admin_key_12345",
                is_active=True,
                is_admin=True,
            )
            self.revoked_user = User(
                email="revoked@example.com",
                password_hash="hashed_password",
                api_key="ipfs_gw_revoked_key_12345",
                is_active=False,
                is_admin=False,
                is_deleted=True,
            )
            session.add(self.admin_user)
            session.add(self.revoked_user)
            session.commit()

    def tearDown(self) -> None:
        SQLModel.metadata.drop_all(get_engine())
        self.temp_dir.cleanup()

    def test_reactivate_with_admin_key_succeeds(self) -> None:
        """Admin can reactivate revoked API keys."""
        response = self.client.post(
            "/api/v1/users/reactivate",
            headers={"X-API-Key": "ipfs_gw_admin_key_12345"},
            json={"user_email": "revoked@example.com"},
        )

        self.assertEqual(response.status_code, 200)
        
        # Verify user is reactivated
        with Session(get_engine()) as session:
            user = session.exec(
                select(User).where(User.email == "revoked@example.com")
            ).first()
            self.assertFalse(user.is_deleted)
            self.assertTrue(user.is_active)

    def test_reactivate_logs_audit_event(self) -> None:
        """Reactivation should create audit log entry."""
        self.client.post(
            "/api/v1/users/reactivate",
            headers={"X-API-Key": "ipfs_gw_admin_key_12345"},
            json={"user_email": "revoked@example.com"},
        )

        with Session(get_engine()) as session:
            user = session.exec(
                select(User).where(User.email == "revoked@example.com")
            ).first()
            logs = session.exec(
                select(AuditLog).where(
                    AuditLog.user_id == user.id,
                    AuditLog.action == "api_key_reactivated_by_admin"
                )
            ).all()
            self.assertEqual(len(logs), 1)

    def test_reactivate_with_non_admin_key_returns_403(self) -> None:
        """Non-admin users cannot reactivate API keys."""
        response = self.client.post(
            "/api/v1/users/reactivate",
            headers={"X-API-Key": "ipfs_gw_revoked_key_12345"},
            json={"user_email": "revoked@example.com"},
        )

        self.assertEqual(response.status_code, 403)

    def test_reactivate_active_user_returns_200(self) -> None:
        """Reactivating active user returns success message."""
        response = self.client.post(
            "/api/v1/users/reactivate",
            headers={"X-API-Key": "ipfs_gw_admin_key_12345"},
            json={"user_email": "admin@example.com"},
        )

        self.assertEqual(response.status_code, 200)
        self.assertIn("already active", response.get_json()["message"])

    def test_reactivate_nonexistent_user_returns_404(self) -> None:
        """Reactivating nonexistent user should return 404."""
        response = self.client.post(
            "/api/v1/users/reactivate",
            headers={"X-API-Key": "ipfs_gw_admin_key_12345"},
            json={"user_email": "nonexistent@example.com"},
        )

        self.assertEqual(response.status_code, 404)

    def test_reactivate_without_email_returns_422(self) -> None:
        """Missing user_email should return 422."""
        response = self.client.post(
            "/api/v1/users/reactivate",
            headers={"X-API-Key": "ipfs_gw_admin_key_12345"},
            json={},
        )

        self.assertEqual(response.status_code, 422)


if __name__ == "__main__":
    unittest.main()
```

## Acceptance Criteria
- [ ] `POST /api/v1/users/reactivate` endpoint exists
- [ ] Endpoint protected by `@require_admin` decorator
- [ ] Accepts `user_email` in request body
- [ ] Sets `is_deleted=False` and `is_active=True`
- [ ] Creates audit log entry with admin email
- [ ] Returns 200 on success
- [ ] Returns 403 for non-admin users
- [ ] Returns 404 for nonexistent users
- [ ] Returns 422 for missing email
- [ ] Already active keys return 200 with appropriate message
- [ ] All tests pass

## Notes
- Reverses the soft delete from revoke operation
- Admin identity tracked in audit log
- Reactivated keys work immediately
- Original API key is restored (not regenerated)

## Completion Status
- [x] 100% - Completed
