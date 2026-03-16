# TASK-US-004-02: Create Renew Endpoint

[Trello Card](https://trello.com/c/2CgbbT4N)



## Parent User Story
[US-004: API Key Management](../../user-stories/backend/US-004-api-key-management.md)

## Description
Implement the `POST /api/v1/users/renew` endpoint with step-up verification that allows authenticated users to rotate their API key. This is a security-sensitive operation requiring two-factor verification.

## Priority
🟠 High

## Estimated Time
4 hours

## Detailed Steps

### 1. Create Verification Code Storage
Add temporary verification code storage (can use Redis or in-memory for MVP):

```python
# core/users/verification.py
"""Verification code management for step-up authentication."""

import secrets
import time
from typing import Optional

# In-memory storage for MVP (use Redis in production)
_verification_codes = {}


def generate_verification_code(user_id: int) -> str:
    """Generate a 6-digit verification code for user.
    
    Args:
        user_id: User ID to generate code for.
        
    Returns:
        6-digit verification code.
    """
    code = str(secrets.randbelow(1000000)).zfill(6)
    _verification_codes[user_id] = {
        "code": code,
        "expires_at": time.time() + 600,  # 10 minutes
    }
    return code


def verify_code(user_id: int, code: str) -> bool:
    """Verify a code for the given user.
    
    Args:
        user_id: User ID to verify.
        code: Code provided by user.
        
    Returns:
        True if code is valid and not expired.
    """
    stored = _verification_codes.get(user_id)
    if not stored:
        return False
    
    if time.time() > stored["expires_at"]:
        del _verification_codes[user_id]
        return False
    
    if stored["code"] == code:
        del _verification_codes[user_id]
        return True
    
    return False
```

### 2. Create Challenge Endpoint (core/users/routes/renew_challenge.py)
```python
"""API key renewal challenge endpoint (step-up initiation)."""

from flask import jsonify, request
from sqlmodel import Session, select

from core import get_engine
from core.auth.decorators import require_api_key
from core.common.exceptions import AuthenticationError
from core.users.models import User
from core.users.verification import generate_verification_code


@require_api_key
def renew_challenge():
    """Initiate API key renewal with step-up verification challenge.
    
    Returns:
        202 response indicating verification code sent.
    """
    api_key = request.headers.get("X-API-Key")
    
    with Session(get_engine()) as session:
        user = session.exec(
            select(User).where(User.api_key == api_key)
        ).first()
        
        if not user:
            raise AuthenticationError("Invalid API key")
        
        # Generate and send verification code
        code = generate_verification_code(user.id)
        
        # TODO: Send code via email (future enhancement)
        # For now, log it for testing
        print(f"Verification code for {user.email}: {code}")
        
        return jsonify({
            "status": 202,
            "message": "Verification code sent"
        }), 202
```

### 3. Create Renew Endpoint (core/users/routes/renew.py)
```python
"""API key renewal endpoint with step-up verification."""

from flask import jsonify, request
from sqlmodel import Session, select

from core import get_engine
from core.auth.decorators import require_api_key
from core.common.exceptions import AuthenticationError, ValidationError
from core.common.models import AuditLog
from core.users.models import User
from core.users.verification import verify_code
import arrow


@require_api_key
def renew():
    """Renew API key with step-up verification.
    
    Request body must include:
        - verification_code: 6-digit code from challenge
    
    Returns:
        New API key on successful verification.
    """
    api_key = request.headers.get("X-API-Key")
    data = request.get_json()
    
    if not data or "verification_code" not in data:
        raise ValidationError("Missing verification_code in request body")
    
    verification_code = data["verification_code"]
    
    with Session(get_engine()) as session:
        user = session.exec(
            select(User).where(User.api_key == api_key)
        ).first()
        
        if not user:
            raise AuthenticationError("Invalid API key")
        
        # Verify step-up code
        if not verify_code(user.id, verification_code):
            # Log failed attempt
            audit = AuditLog(
                user_id=user.id,
                action="api_key_renew_failed",
                timestamp=arrow.utcnow().datetime,
                details='{"reason": "invalid_verification_code"}',
            )
            session.add(audit)
            session.commit()
            raise AuthenticationError("Invalid or expired verification code")
        
        # Generate new API key
        new_api_key = user.renew_api_key()
        session.add(user)
        
        # Log successful renewal
        audit = AuditLog(
            user_id=user.id,
            action="api_key_renewed",
            timestamp=arrow.utcnow().datetime,
            details='{"status": "success"}',
        )
        session.add(audit)
        session.commit()
        
        return jsonify({
            "status": 200,
            "message": "New API key generated",
            "data": {
                "api_key": new_api_key
            }
        }), 200
```

### 4. Register Routes (core/users/__init__.py)
```python
from core.users.routes.renew_challenge import renew_challenge
from core.users.routes.renew import renew

users_bp.add_url_rule("/renew/challenge", view_func=renew_challenge, methods=["POST"])
users_bp.add_url_rule("/renew", view_func=renew, methods=["POST"])
```

### 5. Create Integration Tests (tests/backend/test_renew.py)
```python
"""Integration tests for API key renewal endpoints."""

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
from core.users.models import User
from core.users.verification import _verification_codes


class TestRenewEndpoint(unittest.TestCase):
    """Test API key renewal with step-up verification."""

    def setUp(self) -> None:
        self.temp_dir = tempfile.TemporaryDirectory()
        db_path = Path(self.temp_dir.name) / "renew_test.db"

        class RenewTestConfig(TestingConfig):
            DATABASE_URL = f"sqlite:///{db_path}"
            TESTING = True

        self.app = create_app(RenewTestConfig)
        self.client = self.app.test_client()
        SQLModel.metadata.create_all(get_engine())

        # Create test user
        with Session(get_engine()) as session:
            self.test_user = User(
                email="test@example.com",
                password_hash="hashed_password",
                api_key="ipfs_gw_test_key_12345",
                is_active=True,
            )
            session.add(self.test_user)
            session.commit()
            session.refresh(self.test_user)
            self.user_id = self.test_user.id

    def tearDown(self) -> None:
        _verification_codes.clear()
        SQLModel.metadata.drop_all(get_engine())
        self.temp_dir.cleanup()

    def test_challenge_returns_202(self) -> None:
        """Challenge endpoint should return 202 and generate code."""
        response = self.client.post(
            "/api/v1/users/renew/challenge",
            headers={"X-API-Key": "ipfs_gw_test_key_12345"},
        )

        self.assertEqual(response.status_code, 202)
        self.assertIn(self.user_id, _verification_codes)

    def test_renew_with_valid_code_returns_new_key(self) -> None:
        """Valid verification code should generate new API key."""
        # Request challenge
        self.client.post(
            "/api/v1/users/renew/challenge",
            headers={"X-API-Key": "ipfs_gw_test_key_12345"},
        )
        
        code = _verification_codes[self.user_id]["code"]
        
        # Renew with code
        response = self.client.post(
            "/api/v1/users/renew",
            headers={"X-API-Key": "ipfs_gw_test_key_12345"},
            json={"verification_code": code},
        )

        self.assertEqual(response.status_code, 200)
        data = response.get_json()
        new_key = data["data"]["api_key"]
        self.assertTrue(new_key.startswith("ipfs_gw_"))
        self.assertNotEqual(new_key, "ipfs_gw_test_key_12345")

    def test_renew_with_invalid_code_returns_401(self) -> None:
        """Invalid verification code should return 401."""
        response = self.client.post(
            "/api/v1/users/renew",
            headers={"X-API-Key": "ipfs_gw_test_key_12345"},
            json={"verification_code": "000000"},
        )

        self.assertEqual(response.status_code, 401)

    def test_renew_without_code_returns_422(self) -> None:
        """Missing verification code should return 422."""
        response = self.client.post(
            "/api/v1/users/renew",
            headers={"X-API-Key": "ipfs_gw_test_key_12345"},
            json={},
        )

        self.assertEqual(response.status_code, 422)


if __name__ == "__main__":
    unittest.main()
```

## Acceptance Criteria
- [ ] `POST /api/v1/users/renew/challenge` endpoint exists
- [ ] Challenge endpoint generates 6-digit verification code
- [ ] Challenge endpoint returns 202 Accepted
- [ ] `POST /api/v1/users/renew` endpoint exists
- [ ] Renew requires valid verification code
- [ ] Renew generates new API key using `user.renew_api_key()`
- [ ] Old API key is invalidated after renewal
- [ ] Failed attempts are logged in AuditLog
- [ ] Successful renewals are logged in AuditLog
- [ ] Returns 401 for invalid/expired verification code
- [ ] Returns 422 for missing verification code
- [ ] All tests pass

## Notes
- For MVP, verification codes stored in-memory (use Redis in production)
- Codes expire after 10 minutes
- Email integration is TODO (log codes for testing)
- Old API key becomes invalid immediately after renewal
- Step-up verification prevents unauthorized key rotation

## Completion Status
- [x] 100% - Completed
