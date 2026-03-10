# TASK-US-013-05: Write e2e integration tests

[Trello Card](https://trello.com/c/sx0adEYZ)

## Parent User Story
[US-013: Backend Testing Suite](../../user-stories/backend/US-013-backend-testing.md)

## Description
Write end-to-end integration tests in `tests/backend/e2e/` that exercise all API endpoints against real external services: Filebase (S3 API) and Redis. Tests load configuration from the `.env` file and perform actual HTTP calls through the Flask test client. These tests verify the full request-to-response cycle including authentication, file storage, and task queuing.

## Priority
🟡 **Medium** - Critical for deployment confidence; requires real credentials.

## Estimated Time
 3 hours

## Detailed Steps

### 1. Create `tests/backend/e2e/__init__.py`
Empty file to make the directory a Python package.

### 2. Create `tests/backend/e2e/conftest.py`
```python
import os
from dotenv import load_dotenv

load_dotenv()

REQUIRED_E2E_ENV = ("FILEBASE_ACCESS_KEY", "FILEBASE_SECRET_KEY", "FILEBASE_BUCKET", "REDIS_URL")

def e2e_ready():
    """Return (ready, missing_vars) used by unittest SkipTest checks."""
    if os.getenv("RUN_E2E_TESTS", "0") != "1":
        return False, ["RUN_E2E_TESTS"]
    missing = [k for k in REQUIRED_E2E_ENV if not os.environ.get(k)]
    return len(missing) == 0, missing
```

### 3. Create `tests/backend/e2e/test_auth_endpoints.py`
Cover the full authentication lifecycle:
```python
import pytest

@pytest.mark.e2e
class TestAuthEndpointsE2E:
    def test_register_new_user(self, client):
        """POST /api/v1/users/register returns 201 with an api_key."""
        ...

    def test_register_duplicate_email_returns_409(self, client):
        ...

    def test_status_get_returns_200(self, client):
        """GET /api/v1/users/status returns 200 (health check)."""
        ...

    def test_status_post_valid_key(self, client, api_key):
        """POST /api/v1/users/status returns active status for valid key."""
        ...

    def test_status_post_invalid_key_returns_401(self, client):
        ...

    def test_renew_challenge(self, client, api_key):
        """POST /api/v1/users/renew/challenge returns a challenge token."""
        ...

    def test_renew_with_challenge_token(self, client, api_key):
        """POST /api/v1/users/renew rotates API key."""
        ...
```

### 4. Create `tests/backend/e2e/test_file_endpoints.py`
Cover upload, retrieval, pinning, and unpinning against real Filebase:
```python
import io
import pytest

@pytest.mark.e2e
class TestFileEndpointsE2E:
    def test_upload_small_file(self, client, auth_headers):
        """POST /api/v1/files/upload uploads a small file and returns a CID."""
        data = {"file": (io.BytesIO(b"hello ipfs"), "hello.txt")}
        response = client.post(
            "/api/v1/files/upload",
            data=data,
            headers=auth_headers,
            content_type="multipart/form-data",
        )
        assert response.status_code in (201, 202)
        ...

    def test_retrieve_uploaded_file(self, client, auth_headers, uploaded_cid):
        """GET /api/v1/files/retrieve/<cid> returns the file content."""
        ...

    def test_pin_file(self, client, auth_headers, uploaded_cid):
        """POST /api/v1/files/pin/<cid> returns 202."""
        ...

    def test_unpin_file(self, client, auth_headers, uploaded_cid):
        """POST /api/v1/files/unpin/<cid> returns 202."""
        ...

    def test_upload_status_task_polling(self, client, auth_headers):
        """GET /api/v1/files/upload/status/<task_id> polls async task state."""
        ...
```

### 5. Create `tests/backend/e2e/test_admin_endpoints.py`
Cover admin-only operations:
```python
import pytest

@pytest.mark.e2e
class TestAdminEndpointsE2E:
    def test_admin_status_as_admin(self, client, admin_auth_headers):
        """GET /api/v1/users/admin returns 200 for admin key."""
        ...

    def test_admin_status_as_regular_user_returns_403(self, client, auth_headers):
        ...

    def test_audit_logs_returns_paginated_results(self, client, admin_auth_headers):
        """GET /api/v1/users/admin/audit-logs returns paginated list."""
        ...

    def test_revoke_user(self, client, admin_auth_headers, target_user_email):
        """POST /api/v1/users/revoke deactivates a user."""
        ...

    def test_reactivate_user(self, client, admin_auth_headers, target_user_email):
        """POST /api/v1/users/reactivate reactivates a deactivated user."""
        ...
```

### 6. Add a shared `uploaded_cid` fixture in `tests/backend/e2e/conftest.py`
```python
@pytest.fixture(scope="module")
def uploaded_cid(client, auth_headers):
    """Upload a small file once per module and return its CID."""
    import io
    data = {"file": (io.BytesIO(b"e2e test content"), "e2e_test.txt")}
    resp = client.post(
        "/api/v1/files/upload",
        data=data,
        headers=auth_headers,
        content_type="multipart/form-data",
    )
    body = resp.get_json()
    return body.get("data", {}).get("cid")
```

### 7. Run e2e tests
```bash
# Requires backend/.env + RUN_E2E_TESTS=1
.venv/bin/python -m unittest discover -s tests/backend/e2e -p 'test_*.py' -v
```

## Acceptance Criteria
- [x] `tests/backend/e2e/` contains `__init__.py`, `conftest.py`, `test_auth_endpoints.py`, `test_file_endpoints.py`, and `test_admin_endpoints.py`
- [x] E2E tests use `unittest` and skip automatically when `RUN_E2E_TESTS=1` or required `.env` variables are missing
- [x] Tests are automatically skipped when required `.env` variables are absent
- [x] `test_auth_endpoints.py` covers: register, duplicate registration, GET/POST status, renew challenge, renew
- [x] `test_file_endpoints.py` covers: upload, retrieve, pin, unpin, upload-status polling
- [x] `test_admin_endpoints.py` covers: admin status, audit logs, revoke, reactivate, 403 for non-admin
- [x] E2E tests are runnable with a valid `backend/.env` pointing to a real Filebase bucket and Redis instance

## Notes
- e2e tests should use a dedicated test bucket/prefix in Filebase to avoid polluting production data (e.g., `FILEBASE_BUCKET=ipfs-test-bucket`).
- Clean up any uploaded files after each test module using a `teardown` fixture to keep the test bucket tidy.
- Redis must be running and accessible for Celery task e2e tests; use `REDIS_URL` from `.env`.
- These tests are intentionally excluded from the standard CI run (`--ignore=tests/backend/e2e`) and triggered separately with credentials.

## Completion Status
- [x] 100% - Completed
