# TASK-US-004-03: Create Revoke Endpoint

[Trello Card](https://trello.com/c/9ZLORC3f)



## Parent User Story
[US-004: API Key Management](../../user-stories/backend/US-004-api-key-management.md)

## Description
Implement the `POST /api/v1/users/revoke` admin-only endpoint that allows administrators to revoke any user's API key by marking them as deleted.

## Priority
🟠 High

## Estimated Time
2 hours

## Detailed Steps

### 1. Create Revoke Route (core/users/routes/revoke.py)
```python
"""API key revocation endpoint (admin only)."""

from flask import jsonify, request
from sqlmodel import Session, select

from core import get_engine
from core.auth.decorators import require_admin
from core.common.exceptions import NotFoundError, ValidationError
from core.common.models import AuditLog
from core.users.models import User
import arrow


@require_admin
def revoke():
    """Revoke API key for specified user (admin only).
    
    Request body must include:
        - user_email: Email of user whose key should be revoked
    
    Returns:
        Success message on revocation.
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
        
        if user.is_deleted:
            return jsonify({
                "status": 200,
                "message": "API key already revoked"
            }), 200
        
        # Mark user as deleted (soft delete for revocation)
        user.is_deleted = True
        user.is_active = False
        user.updated_at = arrow.utcnow().datetime
        session.add(user)
        
        # Log revocation action
        admin_key = request.headers.get("X-API-Key")
        admin_user = session.exec(
            select(User).where(User.api_key == admin_key)
        ).first()
        
        audit = AuditLog(
            user_id=user.id,
            action="api_key_revoked_by_admin",
            timestamp=arrow.utcnow().datetime,
            details=f'{{"admin_email": "{admin_user.email if admin_user else "unknown"}"}}',
        )
        session.add(audit)
        session.commit()
        
        return jsonify({
            "status": 200,
            "message": "API key revoked successfully"
        }), 200
```

### 2. Register Route (core/users/__init__.py)
```python
from core.users.routes.revoke import revoke

users_bp.add_url_rule("/revoke", view_func=revoke, methods=["POST"])
```

### 3. Create Integration Tests (tests/backend/test_revoke.py)
```python
"""Integration tests for API key revocation endpoint."""

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


class TestRevokeEndpoint(unittest.TestCase):
    """Test admin API key revocation."""

    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "revoke_test.db"

        class RevokeTestConfig(TestingConfig):
            DATABASE_URL = f"sqlite:///{db_path}"
            TESTING = True

        self.app = create_app(RevokeTestConfig)
        self.client = self.app.test_client()
        SQLModel.metadata.create_all(get_engine())

        # Create admin and regular user
        with Session(get_engine()) as session:
            self.admin_user = User(
                email="admin@example.com",
                password_hash="hashed_password",
                api_key="ipfs_gw_admin_key_12345",
                is_active=True,
                is_admin=True,
            )
            self.regular_user = User(
                email="user@example.com",
                password_hash="hashed_password",
                api_key="ipfs_gw_user_key_12345",
                is_active=True,
                is_admin=False,
            )
            session.add(self.admin_user)
            session.add(self.regular_user)
            session.commit()

    def tearDown(self) -> None:
        SQLModel.metadata.drop_all(get_engine())
        self.temp_dir.cleanup()

    def test_revoke_with_admin_key_succeeds(self) -> None:
        """Admin can revoke user API keys."""
        response = self.client.post(
            "/api/v1/users/revoke",
            headers={"X-API-Key": "ipfs_gw_admin_key_12345"},
            json={"user_email": "user@example.com"},
        )

        self.assertEqual(response.status_code, 200)
        
        # Verify user is marked as deleted
        with Session(get_engine()) as session:
            user = session.exec(
                select(User).where(User.email == "user@example.com")
            ).first()
            self.assertTrue(user.is_deleted)
            self.assertFalse(user.is_active)

    def test_revoke_logs_audit_event(self) -> None:
        """Revocation should create audit log entry."""
        self.client.post(
            "/api/v1/users/revoke",
            headers={"X-API-Key": "ipfs_gw_admin_key_12345"},
            json={"user_email": "user@example.com"},
        )

        with Session(get_engine()) as session:
            user = session.exec(
                select(User).where(User.email == "user@example.com")
            ).first()
            logs = session.exec(
                select(AuditLog).where(
                    AuditLog.user_id == user.id,
                    AuditLog.action == "api_key_revoked_by_admin"
                )
            ).all()
            self.assertEqual(len(logs), 1)

    def test_revoke_with_non_admin_key_returns_403(self) -> None:
        """Non-admin users cannot revoke API keys."""
        response = self.client.post(
            "/api/v1/users/revoke",
            headers={"X-API-Key": "ipfs_gw_user_key_12345"},
            json={"user_email": "user@example.com"},
        )

        self.assertEqual(response.status_code, 403)

    def test_revoke_nonexistent_user_returns_404(self) -> None:
        """Revoking nonexistent user should return 404."""
        response = self.client.post(
            "/api/v1/users/revoke",
            headers={"X-API-Key": "ipfs_gw_admin_key_12345"},
            json={"user_email": "nonexistent@example.com"},
        )

        self.assertEqual(response.status_code, 404)

    def test_revoke_without_email_returns_422(self) -> None:
        """Missing user_email should return 422."""
        response = self.client.post(
            "/api/v1/users/revoke",
            headers={"X-API-Key": "ipfs_gw_admin_key_12345"},
            json={},
        )

        self.assertEqual(response.status_code, 422)


if __name__ == "__main__":
    unittest.main()
```

## Acceptance Criteria
- [ ] `POST /api/v1/users/revoke` endpoint exists
- [ ] Endpoint protected by `@require_admin` decorator
- [ ] Accepts `user_email` in request body
- [ ] Marks user as `is_deleted=True` and `is_active=False`
- [ ] Creates audit log entry with admin email
- [ ] Returns 200 on success
- [ ] Returns 403 for non-admin users
- [ ] Returns 404 for nonexistent users
- [ ] Returns 422 for missing email
- [ ] Already revoked keys return 200 with appropriate message
- [ ] All tests pass

## Notes
- Uses soft delete (`is_deleted=True`) rather than hard delete
- Admin identity tracked in audit log
- Revoked keys cannot be used for any operations
- This is a permanent action (use reactivate to reverse)

## Completion Status
- [x] 100% - Completed
