# Backend Service

Backend foundation for the IPFS Gateway project.

## Local setup

```bash
uv venv .venv
source .venv/bin/activate
uv pip install -e ".[dev]"
cp .env.example .env
python application.py
```

## Tests

```bash
python -m unittest discover -s ../tests/backend -p "test_*.py"
```

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
```

