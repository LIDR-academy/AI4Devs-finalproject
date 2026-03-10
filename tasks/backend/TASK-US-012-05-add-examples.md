# TASK-US-012-05: Add Examples and Schemas

[Trello Card](https://trello.com/c/Ovfcj8LD)

## Parent User Story
[US-012: API Documentation with Swagger](../../user-stories/backend/US-012-api-documentation.md)

## Description
Define reusable OpenAPI component schemas (definitions) for all common request and response objects — `UserResponse`, `FileUploadResponse`, `AuditLogEntry`, `ErrorEnvelope`, `SuccessEnvelope` — and add concrete `example` values to every parameter and response schema already documented in tasks 01–04. Verify that the Swagger UI provides complete interactive testing capability with pre-filled example values.

## Priority
🟡 Medium

## Estimated Time
30 minutes

## Detailed Steps

### 1. Add reusable definitions to the Swagger template
Extend `backend/config/swagger.py` — add a `definitions` key inside `SWAGGER_TEMPLATE`:
```python
SWAGGER_TEMPLATE = {
    # ... existing keys ...
    "definitions": {
        "ErrorEnvelope": {
            "type": "object",
            "properties": {
                "status":  {"type": "integer", "example": 400},
                "message": {"type": "string",  "example": "Validation error"},
                "code":    {"type": "string",  "example": "VALIDATION_ERROR"},
                "details": {"type": "object",  "nullable": True},
                "request_id": {"type": "string", "example": "req-abc-123"},
            },
        },
        "SuccessEnvelope": {
            "type": "object",
            "properties": {
                "status":     {"type": "integer", "example": 200},
                "message":    {"type": "string",  "example": "Operation successful"},
                "data":       {"type": "object"},
                "meta":       {"type": "object",  "nullable": True},
                "request_id": {"type": "string",  "example": "req-abc-123"},
            },
        },
        "UserResponse": {
            "type": "object",
            "properties": {
                "email":   {"type": "string", "format": "email",  "example": "user@example.com"},
                "api_key": {"type": "string", "example": "ipfs_gw_abc123def456"},
            },
        },
        "FileUploadData": {
            "type": "object",
            "properties": {
                "task_id":  {"type": "string", "format": "uuid",  "example": "d3b07384-d9b7-11ec-9d64-0242ac120002"},
            },
        },
        "TaskStatusData": {
            "type": "object",
            "properties": {
                "task_id":  {"type": "string", "format": "uuid"},
                "state":    {"type": "string", "enum": ["PENDING", "STARTED", "SUCCESS", "FAILURE"]},
                "cid":      {"type": "string", "example": "QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco"},
                "filename": {"type": "string", "example": "report.pdf"},
                "size":     {"type": "integer", "example": 204800},
            },
        },
        "AuditLogEntry": {
            "type": "object",
            "properties": {
                "id":         {"type": "integer", "example": 1},
                "user_id":    {"type": "integer", "example": 7},
                "action":     {"type": "string",  "example": "UPLOAD"},
                "details":    {"type": "string",  "example": "Uploaded file report.pdf"},
                "created_at": {"type": "string",  "format": "date-time"},
            },
        },
    },
}
```

### 2. Reference definitions from existing docstrings
Replace inline schema repetition with `$ref` in the previously added docstrings where possible. Example for `POST /register`:
```yaml
responses:
  201:
    description: User registered successfully
    schema:
      allOf:
        - $ref: '#/definitions/SuccessEnvelope'
        - type: object
          properties:
            data:
              $ref: '#/definitions/UserResponse'
  400:
    description: Validation error
    schema:
      $ref: '#/definitions/ErrorEnvelope'
  409:
    description: Email already registered
    schema:
      $ref: '#/definitions/ErrorEnvelope'
```

### 3. Add `example` fields to all path and query parameters
For every path parameter (`cid`, `task_id`, `user_id`) and query parameter (`page`, `per_page`, etc.) that was documented in tasks 02–04/but is missing an `example` value, add one. Example:
```yaml
parameters:
  - in: path
    name: cid
    type: string
    required: true
    example: QmXoypizjW3WknFiJnKLwHCnL72vedxjQkDDP1mXWo6uco
```

### 4. Verify interactive testing in Swagger UI
1. Open `/swagger` and click **Authorize** — enter a valid test API key.
2. Expand `POST /api/v1/users/register` — click **Try it out** and confirm the example body is pre-filled.
3. Expand `POST /api/v1/files/upload` — confirm the file picker is rendered for the `file` form-data field.
4. Expand `GET /api/v1/files/retrieve/{cid}` — confirm the example CID is pre-filled.
5. Confirm all endpoints return the expected status codes when executed.

### 5. Export and validate the OpenAPI spec
```bash
curl -s http://localhost:5000/swagger.json -o /tmp/openapi.json

# Optional: validate with swagger-cli (npm install -g @apidevtools/swagger-cli)
swagger-cli validate /tmp/openapi.json
# Expected: /tmp/openapi.json is valid
```

## Acceptance Criteria
- [x] Reusable `ErrorEnvelope`, `SuccessEnvelope`, `RegisterRequest`, `VerificationRequest`, and `AdminEmailRequest` definitions are present in `SWAGGER_TEMPLATE["definitions"]`
- [x] Endpoints reference `$ref` definitions where appropriate
- [x] Path and query parameters include `example` values
- [x] Swagger UI **Try it out** feature is available for documented endpoints
- [x] `GET /swagger.json` returns a valid specification JSON
- [x] OpenAPI 3.0 specification can be exported as JSON from `/swagger.json`
- [x] No existing tests are broken

## Notes
- Flasgger 0.9.x uses Swagger 2.0 `definitions` (not OpenAPI 3.0 `components/schemas`). If upgrading to OpenAPI 3.0 format is required in future, consider `apispec` + `flask-apispec` instead.
- Keep example values realistic but non-sensitive (never use real API keys or real user emails in the spec).
- The standard error envelope shape (`status`, `message`, `code`, `details`, `request_id`) was introduced in US-011. The `ErrorEnvelope` definition here should match it exactly.

## Completion Status
- [x] 100% - Completed
