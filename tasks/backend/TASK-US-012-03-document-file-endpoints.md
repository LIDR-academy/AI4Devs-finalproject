# TASK-US-012-03: Document File Endpoints

[Trello Card](https://trello.com/c/eAzIcw9s)

## Parent User Story
[US-012: API Documentation with Swagger](../../user-stories/backend/US-012-api-documentation.md)

## Description
Add Flasgger YAML docstrings to all file-operation route functions: file upload (`POST /api/v1/files/upload`), upload task status polling (`GET /api/v1/files/upload/status/<task_id>`), and file retrieval (`GET /api/v1/files/retrieve/<cid>`). Docstrings must cover multipart/form-data for upload, Celery async task response shapes, and IPFS-specific fields such as the CID.

## Priority
🟡 Medium

## Estimated Time
45 minutes

## Detailed Steps

### 1. Document the file upload endpoint
`backend/core/files/routes/upload.py` — `POST /api/v1/files/upload`
```python
def upload_file():
    """Upload a file to IPFS via Filebase.
    ---
    tags:
      - Files
    summary: Upload file to IPFS
    description: >
      Accepts a multipart/form-data request with a single file field named `file`.
      The upload is processed asynchronously via Celery. The response contains a
      `task_id` that can be polled at `GET /api/v1/files/upload/status/{task_id}`.
    consumes:
      - multipart/form-data
    parameters:
      - in: formData
        name: file
        type: file
        required: true
        description: The file to upload (max 50 MB)
    responses:
      202:
        description: Upload task accepted
        schema:
          type: object
          properties:
            status:
              type: integer
              example: 202
            message:
              type: string
              example: File upload initiated
            data:
              type: object
              properties:
                task_id:
                  type: string
                  example: d3b07384-d9b7-11ec-9d64-0242ac120002
      400:
        description: No file provided or file is empty
      413:
        description: File exceeds maximum allowed size
      422:
        description: Unsupported file type
      401:
        description: Invalid or missing API key
    security:
      - ApiKeyAuth: []
    """
```

### 2. Document the upload task status endpoint
`backend/core/files/routes/upload.py` — `GET /api/v1/files/upload/status/<task_id>`
```python
def upload_status(task_id):
    """Poll the status of an async file-upload task.
    ---
    tags:
      - Tasks
    summary: Get upload task status
    description: >
      Polls the Celery task identified by `task_id`. Returns the current state
      (`PENDING`, `STARTED`, `SUCCESS`, `FAILURE`) and, on success, the IPFS CID
      and file metadata.
    parameters:
      - in: path
        name: task_id
        type: string
        required: true
        description: UUID of the Celery upload task
        example: d3b07384-d9b7-11ec-9d64-0242ac120002
    responses:
      200:
        description: Task status retrieved
        schema:
          type: object
          properties:
            status:
              type: integer
              example: 200
            data:
              type: object
              properties:
                task_id:
                  type: string
                state:
                  type: string
                  enum: [PENDING, STARTED, SUCCESS, FAILURE]
                  example: SUCCESS
                cid:
                  type: string
                  example: QmXyz...
                  description: IPFS CID (present on SUCCESS only)
                filename:
                  type: string
                  example: report.pdf
      404:
        description: Task ID not found
      500:
        description: Task failed — see `message` for error details
      401:
        description: Invalid or missing API key
    security:
      - ApiKeyAuth: []
    """
```

### 3. Document the file retrieval endpoint
`backend/core/files/routes/retrieve.py` — `GET /api/v1/files/retrieve/<cid>`
```python
def retrieve_file(cid):
    """Retrieve a file from IPFS by its CID.
    ---
    tags:
      - Files
    summary: Retrieve file by CID
    description: >
      Downloads the file identified by `cid` from the IPFS network via Filebase
      and streams it back to the caller with the original Content-Type.
      Access is restricted to the API key owner who uploaded the file.
    parameters:
      - in: path
        name: cid
        type: string
        required: true
        description: IPFS Content Identifier (CID)
        example: QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco
    produces:
      - application/octet-stream
      - application/json
    responses:
      200:
        description: File content streamed successfully
        headers:
          Content-Disposition:
            type: string
            description: Attachment filename hint
      403:
        description: Access denied — file belongs to a different user
      404:
        description: File not found for the given CID
      500:
        description: IPFS retrieval error
      401:
        description: Invalid or missing API key
    security:
      - ApiKeyAuth: []
    """
```

### 4. Verify in Swagger UI
Open `/swagger` and expand the **Files** and **Tasks** sections. Confirm:
- The upload endpoint shows the `file` form-data parameter.
- The retrieval endpoint shows the `cid` path parameter.
- The task-status endpoint shows the `task_id` path parameter and all four possible states.

## Acceptance Criteria
- [x] `POST /api/v1/files/upload` docstring documents multipart/form-data input and async 202 response
- [x] `GET /api/v1/files/upload/status/<task_id>` docstring documents all Celery states in the response
- [x] `GET /api/v1/files/retrieve/<cid>` docstring documents 200 file stream, 403, 404, and 500 responses
- [x] All three endpoints appear under the correct tags (`Files`, `Tasks`) in Swagger UI
- [x] No existing tests are broken

## Notes
- The retrieval endpoint returns a raw file stream on 200, not a JSON body. Document the `produces` list accordingly (`application/octet-stream`).
- `task_id` uses UUID format; add `format: uuid` if the OpenAPI spec version supports it.
- Reusable error-envelope schema defined in TASK-US-012-05 can be referenced here once created.

## Completion Status
- [x] 100% - Completed
