# Backend Service

Backend foundation for the IPFS Gateway project.

## Local setup

```bash
uv venv .venv
source .venv/bin/activate
uv pip install -e ".[dev]"
cp .env.example .env
```

## Running the Application

### Prerequisites

Ensure Redis is installed and running (required for Celery task queue):

```bash
# Check if Redis is running
redis-cli ping
# Should return: PONG

# If not running, start Redis (choose one method):
# Method 1: As a daemon
redis-server --daemonize yes --port 6379

# Method 2: In foreground (separate terminal)
redis-server --port 6379
```

### Starting All Services

**Terminal 1 - Flask Backend:**
```bash
cd backend
source ../.venv/bin/activate
python application.py
# Backend will run on http://localhost:5000
```

**Terminal 2 - Celery Worker:**
```bash
cd backend
source ../.venv/bin/activate
celery -A core.celery_worker.celery worker -l info -Q upload,pinning,default
# Processes async tasks for file uploads, pinning, etc.
```

**Terminal 3 (Optional) - Flower Monitoring:**
```bash
cd backend
source ../.venv/bin/activate
celery -A core.celery_worker.celery flower --port=5555
# Web UI available at http://localhost:5555
```

### Stopping All Services

**Stop Flask Backend:**
```bash
# Press Ctrl+C in Terminal 1
# Or find and kill the process:
pkill -f "python application.py"
```

**Stop Celery Worker:**
```bash
# Press Ctrl+C in Terminal 2
# Or find and kill the process:
pkill -f "celery.*worker"
```

**Stop Flower (if running):**
```bash
# Press Ctrl+C in Terminal 3
# Or find and kill the process:
pkill -f "celery.*flower"
```

**Stop Redis (if started as daemon):**
```bash
redis-cli shutdown
# Or:
pkill redis-server
```

### Checking Service Status

```bash
# Check Flask backend
curl http://localhost:5000/health || echo "Backend not running"

# Check Redis
redis-cli ping || echo "Redis not running"

# Check Celery worker (via Flower or task test)
curl http://localhost:5555 || echo "Flower not running"

# List all running processes
ps aux | grep -E "python application.py|celery|redis-server"
```

## Tests

All test commands must be run from the **`backend/`** directory (i.e. after `cd backend`).

```bash
# Run all backend unit tests
python -m unittest discover -s ../tests/backend/unit -p "test_*.py" -v

# Run e2e tests against real services (requires backend/.env and RUN_E2E_TESTS=1)
# Ensure FILEBASE_ACCESS_KEY, FILEBASE_SECRET_KEY, FILEBASE_BUCKET and REDIS_URL are set in backend/.env
RUN_E2E_TESTS=1 python -m unittest discover -s ../tests/backend/e2e -p "test_*.py" -v

# Coverage gate (minimum 80%)
coverage run -m unittest discover -s ../tests/backend/unit -p "test_*.py"
coverage report
```

## Security Controls

The backend now applies centralized rate limiting, request tracing, and browser-hardening response headers.

### Rate limiting

- Registration uses a per-IP limit.
- Upload, retrieve, pinning, status, renew, admin, and task endpoints use API-key-aware limits.
- Limit values are configured through environment variables such as `RATE_LIMIT_UPLOAD` and `RATE_LIMIT_ADMIN`.
- When enabled, responses expose `X-RateLimit-Limit`, `X-RateLimit-Remaining`, `X-RateLimit-Reset`, and `Retry-After`.

### Request tracing

- Clients can supply `X-Request-ID`.
- Invalid request IDs are replaced with a generated identifier.
- The request ID is returned in the response headers and included in centralized error payloads.

### Security headers

All API responses include:

- `X-Content-Type-Options: nosniff`
- `X-Frame-Options: DENY`
- `Referrer-Policy: no-referrer`
- `Content-Security-Policy: default-src 'none'; frame-ancestors 'none'; base-uri 'none'; form-action 'none'`

### CORS configuration

Configure allowed browser access with these environment variables:

```bash
ALLOWED_ORIGINS=https://frontend.example.com
CORS_METHODS=GET,POST,OPTIONS
CORS_ALLOW_HEADERS=Content-Type,X-API-Key,X-Request-ID
CORS_EXPOSE_HEADERS=X-RateLimit-Limit,X-RateLimit-Remaining,X-RateLimit-Reset,Retry-After,X-Request-ID
CORS_MAX_AGE=3600
```

### Payload limits

Set `MAX_CONTENT_LENGTH` to reject oversized request bodies before route processing. Oversized requests return `413 Request payload too large` and include the request ID in the JSON error response.

## API Documentation

### File Upload (US-005)

Upload files to IPFS via Filebase with automatic pinning.

#### POST /api/v1/files/upload

Upload a single file to IPFS.

**Request:**
```bash
curl -X POST http://localhost:5000/api/v1/files/upload \
	-H "X-API-Key: your_api_key_here" \
	-F "file=@document.pdf"
```

**Response (Synchronous - file < 10MB):**
```json
{
	"status": 201,
	"message": "File uploaded successfully",
	"data": {
		"cid": "QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
		"original_filename": "document.pdf",
		"size": 1048576,
		"pinned": true,
		"uploaded_at": "2026-03-09T15:30:00Z"
	}
}
```

**Response (Asynchronous - file >= 10MB):**
```json
{
	"status": 202,
	"message": "File upload queued",
	"data": {
		"task_id": "550e8400-e29b-41d4-a716-446655440000",
		"status_url": "/api/v1/files/upload/status/550e8400-e29b-41d4-a716-446655440000"
	}
}
```

#### GET /api/v1/files/upload/status/:task_id

Check the status of an async file upload.

**Request:**
```bash
curl http://localhost:5000/api/v1/files/upload/status/550e8400-e29b-41d4-a716-446655440000 \
	-H "X-API-Key: your_api_key_here"
```

**Response (In Progress):**
```json
{
	"status": "in_progress",
	"task_id": "550e8400-e29b-41d4-a716-446655440000",
	"progress": 50
}
```

**Response (Completed):**
```json
{
	"status": "completed",
	"task_id": "550e8400-e29b-41d4-a716-446655440000",
	"progress": 100,
	"data": {
		"status": "completed",
		"cid": "QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx",
		"filename": "document.pdf",
		"size": 50000000,
		"file_id": 42
	}
}
```

**Response (Failed):**
```json
{
	"status": "failed",
	"task_id": "550e8400-e29b-41d4-a716-446655440000",
	"error": "File upload failed after retries"
}
```

---

### File Retrieval (US-006)

Retrieve files from IPFS with intelligent caching, streaming, and access control.

#### GET /api/v1/files/retrieve/:cid

Retrieve a file by its Content Identifier (CID).

**Request:**
```bash
curl http://localhost:5000/api/v1/files/retrieve/QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx \
	-H "X-API-Key: your_api_key_here"
```

**Request (Force Download):**
```bash
curl http://localhost:5000/api/v1/files/retrieve/QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx?download \
	-H "X-API-Key: your_api_key_here" \
	-O
```

**Request (With Cache Validation):**
```bash
curl http://localhost:5000/api/v1/files/retrieve/QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx \
	-H "X-API-Key: your_api_key_here" \
	-H "If-None-Match: \"QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx\""
```

**Response (Success - 200 OK):**
```
HTTP/1.1 200 OK
Content-Type: application/pdf
Content-Disposition: inline; filename="document.pdf"
ETag: "QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
Cache-Control: public, max-age=31536000, immutable
Last-Modified: Mon, 09 Mar 2026 15:30:00 GMT
X-File-ID: 42
X-Content-CID: QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx

[Binary file content]
```

**Response (Not Modified - 304):**
```
HTTP/1.1 304 Not Modified
ETag: "QmXxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
Cache-Control: public, max-age=31536000, immutable
Last-Modified: Mon, 09 Mar 2026 15:30:00 GMT
```

**Response (Access Denied - 403):**
```json
{
	"error": "Access denied: not file owner"
}
```

**Response (Not Found - 404):**
```json
{
	"error": "File not found"
}
```

#### Features

- **Authorization**: Only file owners can retrieve their files
- **HTTP Caching**: 
	- ETag based on CID (content-addressed identifier)
	- 304 Not Modified responses for cached content
	- Immutable caching with 1-year max-age
	- Supports If-None-Match and If-Modified-Since headers
- **Streaming**: Large files streamed in 64KB chunks to minimize memory usage
- **MIME Type Detection**: Automatic detection from file extension with custom mappings
- **Content Disposition**: 
	- Inline display by default
	- Force download with `?download` query parameter
- **Retrieval Tracking**: 
	- Updates `retrieval_count` on each access
	- Records `last_retrieved_at` timestamp
- **Audit Logging**: All retrieval attempts logged with:
	- Resource type and ID
	- IP address
	- User agent
	- Access decision (success, denied, cached, failed)
	- Request ID correlation for cross-service tracing
- **Error Handling**:
	- Circuit breaker pattern for IPFS connectivity
	- Retry logic with exponential backoff
	- Proper HTTP status codes (200, 304, 403, 404, 500)

---

### Celery Task Queue (US-007)

Celery is configured with Redis for async task execution and status tracking.

#### Worker and Monitoring

Start Celery worker:

```bash
cd backend
celery -A core.celery_worker.celery worker -l info -Q upload,pinning,default
```

Start Celery beat (future scheduled tasks):

```bash
cd backend
celery -A core.celery_worker.celery beat -l info
```

Start Flower monitoring:

```bash
cd backend
celery -A core.celery_worker.celery flower --port=5555
```

#### GET /api/v1/tasks/:task_id/status

Get status for any async task.

```bash
curl http://localhost:5000/api/v1/tasks/550e8400-e29b-41d4-a716-446655440000/status \
	-H "X-API-Key: your_api_key_here"
```

Response example:

```json
{
	"status": 200,
	"data": {
		"task_id": "550e8400-e29b-41d4-a716-446655440000",
		"state": "PROGRESS",
		"progress": 65,
		"message": "Uploading to IPFS..."
	}
}
```

#### Failed-task inspection and replay

List failed tasks captured by `task_failure` signal:

```bash
curl "http://localhost:5000/api/v1/tasks/failed?limit=20&offset=0" \
	-H "X-API-Key: your_api_key_here"
```

Replay one failed task:

```bash
curl -X POST http://localhost:5000/api/v1/tasks/failed/<failure_id>/replay \
	-H "X-API-Key: your_api_key_here"
```

#### Async pin/unpin endpoints

Queue pin operation:

```bash
curl -X POST http://localhost:5000/api/v1/files/pin/<cid> \
	-H "X-API-Key: your_api_key_here"
```

Queue unpin operation:

```bash
curl -X POST http://localhost:5000/api/v1/files/unpin/<cid> \
	-H "X-API-Key: your_api_key_here"
```

Both endpoints return `202 Accepted` with `task_id` and `status_url`.

---

### Content Pinning Management (US-008)

Pin/unpin operations are authenticated, ownership-protected, and executed asynchronously through Celery.

#### POST /api/v1/files/pin/:cid

Queue pinning operation for a user-owned file.

```bash
curl -X POST http://localhost:5000/api/v1/files/pin/<cid> \
	-H "X-API-Key: your_api_key_here"
```

Success (`202 Accepted`):

```json
{
	"status": 202,
	"message": "Pinning request queued",
	"data": {
		"task_id": "uuid-task-id",
		"status_url": "/api/v1/tasks/uuid-task-id/status",
		"cid": "QmX..."
	}
}
```

#### POST /api/v1/files/unpin/:cid

Queue unpinning operation for a user-owned file.

```bash
curl -X POST http://localhost:5000/api/v1/files/unpin/<cid> \
	-H "X-API-Key: your_api_key_here"
```

Success (`202 Accepted`):

```json
{
	"status": 202,
	"message": "Unpinning request queued",
	"data": {
		"task_id": "uuid-task-id",
		"status_url": "/api/v1/tasks/uuid-task-id/status",
		"cid": "QmX..."
	}
}
```

#### Pin/Unpin Error Responses

```json
{
	"status": 404,
	"message": "Content not found"
}
```

```json
{
	"status": 403,
	"message": "Access denied to this content"
}
```

```json
{
	"status": 409,
	"message": "Content is already pinned"
}
```

```json
{
	"status": 409,
	"message": "Content is already unpinned"
}
```

#### US-008 Notes

- API key is required on all pinning endpoints (`X-API-Key` header).
- Users can only pin/unpin files they own.
- File records are never deleted during unpin (soft operation).
- Operations are queued to Celery `pinning` queue and tracked by task status API.
- Audit logs are recorded for queued/completed operations and authorization failures.

### Audit Logging (US-010)

- `GET /api/v1/users/admin/audit-logs` returns paginated audit records for admin users only.
- Supported query parameters:
	- `page` and `per_page`
	- `user_id`
	- `action`
	- `from` and `to` using ISO-8601 dates
	- `include_raw_ip=true` for explicitly requested raw IP visibility on non-expired entries
- Audit entries now include request correlation IDs when available.
- Raw IP addresses are retained only for `AUDIT_IP_RETENTION_DAYS` and then redacted in-place.
- `AUDIT_IP_REDACTION_MODE` supports `mask` and `hash`.
- Redaction events are appended as `ip_redaction_applied` audit records to preserve an append-only trail.

#### Audit Configuration

Add the following environment variables in `.env` when tuning audit retention:

```bash
AUDIT_LOG_DEFERRED_WRITE=true
AUDIT_IP_RETENTION_DAYS=90
AUDIT_IP_REDACTION_MODE=mask
AUDIT_REDACTION_BATCH_SIZE=200
```

---

### Features

- **Multipart file upload** via form data (`multipart/form-data`)
- **API Key authentication** required (X-API-Key header)
- **File validation** - size limits (max 100MB), MIME type whitelist, path traversal prevention
- **Smart upload routing**:
	- Files < 10MB uploaded synchronously with immediate CID response
	- Files >= 10MB queued for async processing with task ID
- **Robust error handling**:
	- Circuit breaker pattern (fails after 5 consecutive errors, recovers after 60s)
	- Exponential backoff retry (max 3 attempts, 2-10s delays)
	- Proper HTTP status codes (201, 202, 400, 413, 503)
- **Automatic pinning** - all files automatically pinned on IPFS
- **Audit logging** - all uploads tracked in audit log
- **Progress tracking** - check async upload status via dedicated endpoint

### Configuration

Set the following environment variables in `.env`:

```
# Filebase S3-Compatible API
FILEBASE_ACCESS_KEY=your-filebase-access-key
FILEBASE_SECRET_KEY=your-filebase-secret-key
FILEBASE_BUCKET=your-filebase-bucket-name
FILEBASE_ENDPOINT=https://s3.filebase.com

# File Upload Limits
MAX_FILE_SIZE=104857600  # 100MB in bytes
ASYNC_UPLOAD_THRESHOLD=10485760  # 10MB in bytes
```

### Error Responses

| Status | Error | Description |
|--------|-------|-------------|
| 400 | file_required | No file provided in request |
| 400 | file_empty | Selected file is empty |
| 400 | validation_error | Filename or file validation failed |
| 413 | file_too_large | File exceeds maximum size limit |
| 503 | upload_service_error | IPFS service unavailable (circuit breaker open) |
| 500 | internal_error | Unexpected error during upload |

### Architecture

```
POST /upload
	├─ Validate API Key
	├─ Validate File (filename, size, MIME type)
	├─ Generate Safe Filename (UUID prefix + extension)
	└─ Route by Size
			├─ < 10MB: Upload Synchronously
			│   ├─ Call IPFS Service
			│   ├─ Circuit Breaker (if fails, status 503)
			│   ├─ Retry with Exponential Backoff (max 3 attempts)
			│   ├─ Save to Database
			│   ├─ Log to Audit Trail
			│   └─ Return 201 with CID
			│
			└─ >= 10MB: Queue Async Task
					├─ Serialize file data
					├─ Send to Celery task queue
					├─ Return 202 with task ID
					└─ Task executes:
							├─ Upload to IPFS
							├─ Save to Database
							├─ Log to Audit Trail
							└─ Store result in Redis
```

### Testing

Run unit tests for file upload functionality:

```bash
python -m unittest tests.backend.test_file_validators -v
python -m unittest tests.backend.test_ipfs_service -v
python -m unittest discover -s tests/backend -p "test_*.py" -v
```

