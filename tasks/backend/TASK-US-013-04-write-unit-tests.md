# TASK-US-013-04: Write unit tests (move existing + add new)

[Trello Card](https://trello.com/c/Yw8ZfSrF)

## Parent User Story
[US-013: Backend Testing Suite](../../user-stories/backend/US-013-backend-testing.md)

## Description
Move all existing unit tests from `tests/backend/` into `tests/backend/unit/` to match the target directory structure. Then add new unit tests for service functions and utilities that are not yet covered: `ipfs_service`, `audit_service`, Celery task helpers, and input validators. Target: 90% coverage of all service-layer functions.

## Priority
🟠 **High** - Core quality gate for the backend.

## Estimated Time
3 hours

## Detailed Steps

### 1. Move existing test files to `tests/backend/unit/`
Move (do not copy) all existing `tests/backend/test_*.py` files into `tests/backend/unit/`:
```bash
mkdir -p tests/backend/unit
mv tests/backend/test_registration_auth.py tests/backend/unit/
mv tests/backend/test_status.py tests/backend/unit/
mv tests/backend/test_swagger_docs.py tests/backend/unit/
# ... any other existing test files
```
Update any relative imports inside those files if necessary.

### 2. Verify all moved tests still pass
```bash
.venv/bin/python -m pytest tests/backend/unit/ -v
```

### 3. Add unit tests for `ipfs_service`
Create `tests/backend/unit/test_ipfs_service.py`:
- Test `upload_file()` with a mock S3 client — verify correct bucket, key, and content-type are used
- Test `download_file()` returns expected bytes when S3 mock returns a stream
- Test circuit-breaker behaviour: assert `ServiceUnavailable` is raised after the configured failure threshold
- Test retry logic: assert the upload is retried the configured number of times on transient errors
- Use `unittest.mock.patch` to mock the Filebase S3 client

### 4. Add unit tests for `audit_service`
Create `tests/backend/unit/test_audit_service.py`:
- Test `log_event()` creates an `AuditLog` record with correct fields
- Test `query_audit_logs()` returns paginated results respecting `page` and `per_page`
- Test `query_audit_logs()` filters by `user_email` when provided
- Test `query_audit_logs()` filters by `action` when provided
- Use an in-memory SQLite database via the `db_session` fixture

### 5. Add unit tests for Celery task helpers
Create `tests/backend/unit/test_celery_tasks.py`:
- Test that the upload Celery task calls `ipfs_service.upload_file()` with correct arguments
- Test that the task updates task state to `SUCCESS` on completion
- Test that the task updates task state to `FAILURE` and records the error on exception
- Use `@pytest.mark.unit` marker and mock the Celery worker (call the task function directly, not via `.delay()`)

### 6. Add unit tests for input validators / decorators
Create `tests/backend/unit/test_validators.py`:
- Test that invalid email format triggers a `422` response from the registration endpoint
- Test that a password shorter than the minimum length triggers a `422` response
- Test that the `@require_api_key` decorator rejects a request with a missing `X-API-Key` header
- Test that the `@require_admin` decorator rejects a non-admin API key with `403`

### 7. Add `test_models.py` for model validation
Create `tests/backend/test_models.py`:
- Test `User` model: verify `is_active` defaults to `True`, `is_admin` to `False`
- Test `FileRecord` model: verify required fields raise validation errors when absent
- Test `AuditLog` model: verify `timestamp` is auto-populated

### 8. Run the full unit suite and check coverage
```bash
.venv/bin/python -m pytest tests/backend/unit/ -v --cov=backend --cov-report=term-missing
```

## Acceptance Criteria
- [x] All existing tests are moved to `tests/backend/unit/` and still pass
- [x] `test_ipfs_service.py` covers upload, download, circuit-breaker, and retry scenarios using mocks
- [x] `test_audit_service.py` covers `log_event` and `query_audit_logs` with filtering and pagination
- [x] `test_celery_tasks.py` covers task success and failure paths without a running Celery worker
- [x] `test_validators.py` covers invalid-input and auth-decorator rejection scenarios
- [x] `test_models.py` validates model defaults and required-field constraints
- [x] All new unit tests are tagged with `@pytest.mark.unit`
- [x] No test requires a live network connection, Redis, or Filebase

## Notes
- Keep using `unittest.TestCase` patterns for consistency with existing tests; pytest will discover and run them.
- Mock at the boundary: patch `boto3.client` (used by `ipfs_service`), not internal methods.
- For Celery tasks, call the underlying function directly (e.g., `upload_to_ipfs.apply()`) rather than spawning a worker process.
- When moving files, ensure `tests/backend/unit/__init__.py` exists to avoid import resolution issues.

## Completion Status
- [x] 100% - Completed
