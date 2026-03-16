# TASK-US-013-02: Create test fixtures (conftest.py)

[Trello Card](https://trello.com/c/OPZFcnH5)

[Pull Request](https://github.com/mentally-gamez-soft/ipfs-saas-ai4devs/pull/13)

## Parent User Story
[US-013: Backend Testing Suite](../../user-stories/backend/US-013-backend-testing.md)

## Description
Create shared pytest fixtures in `tests/backend/conftest.py` that provide a Flask test client, an isolated in-memory SQLite database session, a pre-registered authenticated user, and common helper utilities. These fixtures will be reused across unit and e2e test suites to avoid duplication.

## Priority
🟠 **High** - Required by almost every test file.

## Estimated Time
1.5 hours

## Detailed Steps

### 1. Create `tests/backend/conftest.py`
```python
import pytest
from core import create_app
from config.testing import TestingConfig


@pytest.fixture(scope="session")
def app():
    """Flask application configured for testing (in-memory SQLite)."""
    app = create_app(TestingConfig)
    yield app


@pytest.fixture(scope="session")
def client(app):
    """Flask test client."""
    return app.test_client()


@pytest.fixture(scope="function")
def db_session(app):
    """
    Provides a clean database session for each test function.
    Rolls back all changes after each test.
    """
    from core.extensions import db as _db
    with app.app_context():
        _db.create_all()
        yield _db.session
        _db.session.rollback()
        _db.drop_all()


@pytest.fixture(scope="function")
def registered_user(client):
    """Register a user and return the registration response data."""
    response = client.post(
        "/api/v1/users/register",
        json={"email": "fixture@example.com", "password": "F!xture_Pass1"},
        content_type="application/json",
    )
    assert response.status_code == 201
    return response.get_json()


@pytest.fixture(scope="function")
def api_key(registered_user):
    """Return only the API key string from a registered user."""
    return registered_user["data"]["api_key"]


@pytest.fixture(scope="function")
def auth_headers(api_key):
    """Return headers dict with X-API-Key set."""
    return {"X-API-Key": api_key}
```

### 2. Create `tests/backend/unit/conftest.py` (unit-specific overrides)
Unit tests may need a separate fixture scope to avoid sharing state. Add a unit-level conftest if needed:
```python
# tests/backend/unit/conftest.py
# Unit-level fixtures can override or extend the session-level ones here.
```

### 3. Create `tests/backend/e2e/conftest.py` (e2e-specific fixtures)
```python
# tests/backend/e2e/conftest.py
import os
import pytest


@pytest.fixture(scope="session")
def e2e_env():
    """Load environment variables for e2e tests from .env file."""
    from dotenv import load_dotenv
    load_dotenv()
    return {
        "filebase_bucket": os.environ["FILEBASE_BUCKET"],
        "filebase_access_key": os.environ["FILEBASE_ACCESS_KEY_ID"],
        "redis_url": os.environ.get("REDIS_URL", "redis://localhost:6379/0"),
    }
```

### 4. Validate fixtures work
```bash
.venv/bin/python -m pytest tests/backend/unit/ -v --fixtures | grep -E "registered_user|api_key|auth_headers|client|db_session"
```

## Acceptance Criteria
- [x] `tests/backend/conftest.py` exists with `app`, `client`, `db_session`, `registered_user`, `api_key`, and `auth_headers` fixtures
- [x] All fixtures use correct scopes (`session` for app/client, `function` for db_session and user fixtures)
- [x] `tests/backend/e2e/conftest.py` exists with `e2e_env` fixture that reads from `.env`
- [x] Running `pytest tests/backend/unit/ -v` succeeds with no fixture errors
- [x] Database state is cleanly isolated between tests (no cross-test pollution)

## Notes
- The current test files use `unittest.TestCase.setUp()` patterns. The new fixtures are additive — existing `unittest` tests remain intact; new pytest-style tests will use the fixtures.
- If `SQLModel` is used instead of `SQLAlchemy` directly, adapt the `db_session` fixture to use `SQLModel.metadata` and the appropriate session factory.
- e2e tests must be skipped automatically when `.env` is absent; use `pytest.importorskip` or `skipif` markers on the `.env` variables.

## Completion Status
- [x] 100% - Completed
