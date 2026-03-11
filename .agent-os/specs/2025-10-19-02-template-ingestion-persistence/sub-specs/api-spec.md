# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-10-19-02-template-ingestion-persistence/spec.md

## Overview

This specification defines the new `/api/v1/templates/ingest` endpoint and documents the refactoring of the existing templates router to separate ingestion logic from CRUD operations, adhering to the Single Responsibility Principle.

## Router Structure Changes

### Before (Current State)

```
backend/app/api/v1/endpoints/
└── templates.py
    ├── POST /upload          # File upload + basic metadata
    ├── POST /analyze         # PDF analysis (no persistence)
    ├── GET /                 # List templates
    ├── GET /{template_id}    # Get template details
    ├── PUT /{template_id}    # Update template metadata
    ├── DELETE /{template_id} # Delete template
    └── GET /{template_id}/versions  # Get template versions
```

### After (New Structure)

```
backend/app/api/v1/endpoints/
├── templates.py              # CRUD operations only
│   ├── GET /                 # List templates
│   ├── GET /{template_id}    # Get template details
│   ├── PUT /{template_id}    # Update template metadata
│   ├── DELETE /{template_id} # Delete template
│   └── GET /{template_id}/versions  # Get template versions
│
├── ingest.py                 # NEW: Ingestion logic
│   └── POST /ingest          # Complete template ingestion
│
└── analyze.py                # Analysis-only (optional refactor)
    └── POST /analyze         # PDF analysis without persistence
```

**Rationale:**

- **SOLID Principle**: Separate concerns (ingestion vs. CRUD vs. analysis)
- **Maintainability**: Clear separation makes code easier to understand and modify
- **Testability**: Each router can be tested independently
- **Scalability**: Future features (batch ingestion, scheduled analysis) fit naturally

## Endpoints

### POST /api/v1/templates/ingest

**Purpose:** Complete template ingestion workflow - uploads PDF file, analyzes it, and persists all data (template, version, fields) in a single transactional operation.

**Authentication:** Required (JWT Bearer Token)

**Request**

**Method:** `POST`

**Content-Type:** `multipart/form-data`

**Headers:**

```http
Authorization: Bearer {jwt_token}
Content-Type: multipart/form-data
```

**Form Fields:**

| Field      | Type   | Required | Constraints               | Description                 |
| ---------- | ------ | -------- | ------------------------- | --------------------------- |
| `file`     | File   | Yes      | PDF only, max 10MB        | PDF template file to ingest |
| `name`     | String | Yes      | 1-255 chars               | Template name               |
| `version`  | String | Yes      | 1-50 chars                | Version identifier          |
| `sepe_url` | String | No       | Max 1000 chars, valid URL | SEPE source URL             |

**Example Request (cURL):**

```bash
curl -X POST "http://localhost:8000/api/v1/templates/ingest" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "file=@/path/to/template.pdf" \
  -F "name=Solicitud de Prestación por Desempleo" \
  -F "version=2024-Q1" \
  -F "sepe_url=https://www.sepe.es/contenidos/personas/prestaciones/..."
```

**Example Request (Python with requests):**

```python
import requests

url = "http://localhost:8000/api/v1/templates/ingest"
headers = {
    "Authorization": f"Bearer {token}"
}
files = {
    "file": ("template.pdf", open("template.pdf", "rb"), "application/pdf")
}
data = {
    "name": "Solicitud de Prestación por Desempleo",
    "version": "2024-Q1",
    "sepe_url": "https://www.sepe.es/..."
}

response = requests.post(url, headers=headers, files=files, data=data)
print(response.json())
```

**Example Request (JavaScript/TypeScript):**

```typescript
const formData = new FormData();
formData.append("file", pdfFile); // File object from input
formData.append("name", "Solicitud de Prestación por Desempleo");
formData.append("version", "2024-Q1");
formData.append("sepe_url", "https://www.sepe.es/...");

const response = await fetch("/api/v1/templates/ingest", {
  method: "POST",
  headers: {
    Authorization: `Bearer ${token}`,
  },
  body: formData,
});

const result = await response.json();
```

**Response**

**Success Response (201 Created):**

```json
{
  "id": 42,
  "name": "Solicitud de Prestación por Desempleo",
  "version": "2024-Q1",
  "file_path": "/app/uploads/a3f2c4b8-9e12-4d5a-b6c7-1234567890ab.pdf",
  "file_size_bytes": 245760,
  "field_count": 48,
  "checksum": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "message": "Template ingested successfully"
}
```

**Response Fields:**

| Field             | Type    | Description                                  |
| ----------------- | ------- | -------------------------------------------- |
| `id`              | Integer | Unique template ID (from `pdf_templates.id`) |
| `name`            | String  | Template name as provided                    |
| `version`         | String  | Version identifier as provided               |
| `file_path`       | String  | Absolute file path in container              |
| `file_size_bytes` | Integer | File size in bytes                           |
| `field_count`     | Integer | Number of AcroForm fields extracted          |
| `checksum`        | String  | SHA256 hash of file content                  |
| `message`         | String  | Success confirmation message                 |

**Error Responses:**

#### 400 Bad Request

**Scenario 1: Invalid File Format**

```json
{
  "detail": "Only PDF files are allowed. Please upload a valid PDF document."
}
```

**Scenario 2: Empty File**

```json
{
  "detail": "Uploaded file is empty. Please provide a valid PDF document."
}
```

**Scenario 3: No Form Fields Found**

```json
{
  "detail": "No AcroForm fields found in the PDF document: PDF does not contain any fillable form fields"
}
```

**Scenario 4: Invalid PDF**

```json
{
  "detail": "Invalid or corrupted PDF file: Cannot read PDF structure"
}
```

**Scenario 5: Validation Error**

```json
{
  "detail": [
    {
      "loc": ["body", "name"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

#### 401 Unauthorized

```json
{
  "detail": "Not authenticated"
}
```

**Trigger:** Missing or invalid JWT token in Authorization header.

#### 413 Payload Too Large

```json
{
  "detail": "File exceeds maximum size limit of 10MB. File size: 12.3MB"
}
```

**Trigger:** Uploaded file size exceeds 10MB limit.

#### 422 Unprocessable Entity

```json
{
  "detail": [
    {
      "loc": ["body", "file"],
      "msg": "field required",
      "type": "value_error.missing"
    }
  ]
}
```

**Trigger:** Missing required form field or invalid data type.

#### 500 Internal Server Error

**Scenario 1: Database Transaction Error**

```json
{
  "detail": "Failed to persist template data. Please try again."
}
```

**Scenario 2: File System Error**

```json
{
  "detail": "Failed to save uploaded file. Please try again."
}
```

**Scenario 3: PDF Processing Error**

```json
{
  "detail": "Failed to process PDF: Unexpected error during field extraction"
}
```

**Errors:**

| Status Code | Error Type            | Description                    |
| ----------- | --------------------- | ------------------------------ |
| 400         | `invalid_file_format` | File is not a PDF              |
| 400         | `empty_file`          | File size is 0 bytes           |
| 400         | `no_form_fields`      | PDF has no AcroForm fields     |
| 400         | `invalid_pdf`         | PDF is corrupted or unreadable |
| 401         | `not_authenticated`   | Missing/invalid authentication |
| 413         | `file_too_large`      | File exceeds 10MB limit        |
| 422         | `validation_error`    | Invalid request parameters     |
| 500         | `database_error`      | Database transaction failed    |
| 500         | `filesystem_error`    | File save operation failed     |
| 500         | `processing_error`    | PDF processing failed          |

**Processing Flow:**

```
1. Authentication Check
   └─ Validate JWT token → 401 if invalid

2. Request Validation
   ├─ Validate multipart/form-data → 422 if invalid
   ├─ Validate required fields (file, name, version) → 422 if missing
   ├─ Validate name (1-255 chars) → 422 if invalid
   ├─ Validate version (1-50 chars) → 422 if invalid
   └─ Validate sepe_url (max 1000 chars, valid URL) → 422 if invalid

3. File Validation
   ├─ Check file extension (.pdf) → 400 if not PDF
   ├─ Check file size (max 10MB) → 413 if too large
   └─ Check file not empty → 400 if empty

4. File Storage
   ├─ Generate UUID filename
   ├─ Save to /app/uploads/
   ├─ Calculate SHA256 checksum
   └─ Get file_size_bytes

5. PDF Analysis
   ├─ Analyze PDF structure → 400 if invalid PDF
   ├─ Extract form fields → 400 if no fields found
   ├─ Get page count
   └─ Extract PDF metadata (title, author, dates)

6. Database Transaction (Atomic)
   ├─ Create PDFTemplate record
   ├─ Create TemplateVersion record
   ├─ Bulk create TemplateField records
   └─ Commit → 500 if transaction fails

7. Response
   └─ Return 201 with template details
```

**Rate Limiting:**

Not explicitly defined in current spec. Consider implementing:

- **Per User:** 10 ingestions per hour
- **Per IP:** 20 ingestions per hour
- **Global:** 100 ingestions per hour

**Example Implementation (FastAPI with slowapi):**

```python
from slowapi import Limiter
from slowapi.util import get_remote_address

limiter = Limiter(key_func=get_remote_address)

@router.post("/ingest", ...)
@limiter.limit("10/hour")
async def ingest_template(...):
    ...
```

---

### Existing Endpoints (Refactored)

These endpoints remain in `templates.py` but are documented here for completeness.

### GET /api/v1/templates/

**Purpose:** List all templates with pagination, filtering, and sorting.

**Authentication:** Optional (public templates visible without auth)

**Parameters:**

| Parameter    | Type    | Default      | Description                            |
| ------------ | ------- | ------------ | -------------------------------------- |
| `skip`       | Integer | 0            | Number of records to skip (pagination) |
| `limit`      | Integer | 10           | Number of records to return (max 100)  |
| `search`     | String  | None         | Search by name or version              |
| `sort_by`    | String  | `created_at` | Field to sort by                       |
| `sort_order` | String  | `desc`       | Sort order (`asc` or `desc`)           |

**Response (200 OK):**

```json
{
  "items": [
    {
      "id": 42,
      "name": "Solicitud de Prestación por Desempleo",
      "version": "2024-Q1",
      "file_path": "/app/uploads/...",
      "file_size_bytes": 245760,
      "field_count": 48,
      "sepe_url": "https://www.sepe.es/...",
      "uploaded_by": 1,
      "created_at": "2024-10-19T10:30:00Z",
      "updated_at": null
    }
  ],
  "total": 150,
  "limit": 10,
  "offset": 0
}
```

---

### GET /api/v1/templates/{template_id}

**Purpose:** Get detailed information about a specific template.

**Authentication:** Optional

**Parameters:**

| Parameter     | Type    | Location | Description |
| ------------- | ------- | -------- | ----------- |
| `template_id` | Integer | Path     | Template ID |

**Response (200 OK):**

```json
{
  "id": 42,
  "name": "Solicitud de Prestación por Desempleo",
  "version": "2024-Q1",
  "file_path": "/app/uploads/a3f2c4b8-9e12-4d5a-b6c7-1234567890ab.pdf",
  "file_size_bytes": 245760,
  "field_count": 48,
  "sepe_url": "https://www.sepe.es/...",
  "uploaded_by": 1,
  "created_at": "2024-10-19T10:30:00Z",
  "updated_at": null
}
```

**Errors:**

- `404 Not Found`: Template with given ID does not exist

---

### PUT /api/v1/templates/{template_id}

**Purpose:** Update template metadata (name, version, sepe_url).

**Authentication:** Required (only owner or superuser)

**Parameters:**

| Parameter     | Type    | Location | Description |
| ------------- | ------- | -------- | ----------- |
| `template_id` | Integer | Path     | Template ID |

**Request Body:**

```json
{
  "name": "Updated Template Name",
  "version": "2024-Q2",
  "sepe_url": "https://www.sepe.es/new-url"
}
```

**Response (200 OK):**

```json
{
  "id": 42,
  "name": "Updated Template Name",
  "version": "2024-Q2",
  "file_path": "/app/uploads/...",
  "file_size_bytes": 245760,
  "field_count": 48,
  "sepe_url": "https://www.sepe.es/new-url",
  "uploaded_by": 1,
  "created_at": "2024-10-19T10:30:00Z",
  "updated_at": "2024-10-20T14:15:00Z"
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: User is not owner or superuser
- `404 Not Found`: Template does not exist

---

### DELETE /api/v1/templates/{template_id}

**Purpose:** Delete a template and all associated data (versions, fields, file).

**Authentication:** Required (only owner or superuser)

**Parameters:**

| Parameter     | Type    | Location | Description |
| ------------- | ------- | -------- | ----------- |
| `template_id` | Integer | Path     | Template ID |

**Response (200 OK):**

```json
{
  "message": "Template deleted successfully"
}
```

**Errors:**

- `401 Unauthorized`: Not authenticated
- `403 Forbidden`: User is not owner or superuser
- `404 Not Found`: Template does not exist
- `500 Internal Server Error`: Failed to delete file or database records

---

### GET /api/v1/templates/{template_id}/versions

**Purpose:** Get all versions of a template.

**Authentication:** Optional

**Parameters:**

| Parameter     | Type    | Location | Description |
| ------------- | ------- | -------- | ----------- |
| `template_id` | Integer | Path     | Template ID |

**Response (200 OK):**

```json
[
  {
    "id": 1,
    "template_id": 42,
    "version_number": "2024-Q1",
    "change_summary": "Initial version",
    "is_current": true,
    "created_at": "2024-10-19T10:30:00Z"
  },
  {
    "id": 2,
    "template_id": 42,
    "version_number": "2024-Q2",
    "change_summary": "Updated field positions",
    "is_current": false,
    "created_at": "2024-07-15T08:20:00Z"
  }
]
```

**Errors:**

- `404 Not Found`: Template does not exist

---

### POST /api/v1/templates/analyze

**Purpose:** Analyze PDF template without persisting (stateless analysis).

**Authentication:** Not required (public endpoint)

**Note:** This endpoint remains in `templates.py` or can be moved to `analyze.py` for better organization.

**Request Body:**

```
multipart/form-data:
  file: PDF file (max 10MB)
```

**Response (200 OK):**

```json
{
  "status": "success",
  "data": [
    {
      "field_id": "A0101",
      "type": "text",
      "near_text": "hasta un máximo de",
      "value_options": null
    }
  ],
  "metadata": {
    "total_fields": 48,
    "processing_time_ms": 1250,
    "document_pages": 3
  }
}
```

**Errors:**

- `400 Bad Request`: Invalid file format, empty file, no form fields
- `413 Payload Too Large`: File exceeds 10MB
- `500 Internal Server Error`: PDF processing error

---

## Implementation Details

### FastAPI Router Configuration

**File: `backend/app/api/v1/endpoints/ingest.py`**

```python
"""
Template ingestion endpoint for SEPE Templates Comparator API.
"""
from typing import Any
from fastapi import APIRouter, Depends, HTTPException, status, UploadFile, File, Form
from sqlalchemy.orm import Session

from app.core.auth import get_current_active_user
from app.core.database import get_db
from app.models.user import User
from app.schemas.template import TemplateIngestResponse, TemplateIngestRequest
from app.services.template_service import TemplateService

router = APIRouter()


@router.post("/ingest", response_model=TemplateIngestResponse, status_code=status.HTTP_201_CREATED)
async def ingest_template(
    file: UploadFile = File(..., description="PDF template file"),
    name: str = Form(..., max_length=255, description="Template name"),
    version: str = Form(..., max_length=50, description="Version identifier"),
    sepe_url: str = Form(None, max_length=1000, description="SEPE source URL"),
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Ingest a new PDF template with complete analysis and persistence.

    This endpoint performs the following operations:
    1. Validates and stores the uploaded PDF file
    2. Analyzes the PDF to extract all AcroForm fields
    3. Persists template metadata, version, and fields to the database
    4. Returns template details with unique ID

    Args:
        file: PDF template file (max 10MB)
        name: Template name (1-255 characters)
        version: Version identifier (1-50 characters)
        sepe_url: Optional SEPE source URL (max 1000 characters)
        current_user: Authenticated user (from JWT)
        db: Database session

    Returns:
        TemplateIngestResponse: Created template details

    Raises:
        HTTPException 400: Invalid file, no fields, or corrupted PDF
        HTTPException 413: File exceeds 10MB limit
        HTTPException 500: Processing or database error
    """
    # Initialize template service
    template_service = TemplateService(db)

    try:
        # Perform complete ingestion workflow
        template = await template_service.ingest_template(
            file=file,
            name=name,
            version=version,
            sepe_url=sepe_url,
            user_id=current_user.id
        )

        # Return success response
        return TemplateIngestResponse(
            id=template.id,
            name=template.name,
            version=template.version,
            file_path=template.file_path,
            file_size_bytes=template.file_size_bytes,
            field_count=template.field_count,
            checksum=template.checksum,  # Assuming checksum field added
            message="Template ingested successfully"
        )

    except ValueError as e:
        # Validation errors (invalid file, no fields, etc.)
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    except Exception as e:
        # Unexpected errors
        import logging
        logger = logging.getLogger(__name__)
        logger.error(f"Template ingestion failed: {str(e)}", exc_info=True)

        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to ingest template. Please try again."
        )
```

### API Router Registration

**File: `backend/app/api/v1/api.py`**

```python
from fastapi import APIRouter
from app.api.v1.endpoints import auth, users, templates, ingest

api_router = APIRouter()

api_router.include_router(auth.router, prefix="/auth", tags=["auth"])
api_router.include_router(users.router, prefix="/users", tags=["users"])
api_router.include_router(templates.router, prefix="/templates", tags=["templates"])
api_router.include_router(ingest.router, prefix="/templates", tags=["ingestion"])  # NEW
```

**Tag Organization:**

- `auth`: Authentication endpoints
- `users`: User management
- `templates`: Template CRUD operations
- `ingestion`: Template ingestion workflow

### OpenAPI Documentation

**Tags Configuration:**

```python
tags_metadata = [
    {
        "name": "ingestion",
        "description": "Template ingestion operations - upload, analyze, and persist PDF templates with all field data.",
    },
    {
        "name": "templates",
        "description": "Template CRUD operations - manage existing template metadata and versions.",
    },
    {
        "name": "auth",
        "description": "Authentication and authorization endpoints.",
    },
]
```

**Endpoint Documentation Example:**

```python
@router.post(
    "/ingest",
    response_model=TemplateIngestResponse,
    status_code=status.HTTP_201_CREATED,
    summary="Ingest PDF Template",
    description="Complete workflow: upload PDF, analyze fields, persist to database",
    responses={
        201: {"description": "Template ingested successfully"},
        400: {"description": "Invalid file or no form fields found"},
        401: {"description": "Authentication required"},
        413: {"description": "File exceeds 10MB limit"},
        500: {"description": "Internal processing error"},
    }
)
async def ingest_template(...):
    ...
```

## Testing Considerations

### Unit Tests

**Test File:** `backend/tests/test_ingest_endpoint.py`

**Test Cases:**

1. ✅ Successful ingestion with valid PDF and metadata
2. ✅ Rejection of non-PDF files (400)
3. ✅ Rejection of empty files (400)
4. ✅ Rejection of PDFs without form fields (400)
5. ✅ Rejection of files exceeding 10MB (413)
6. ✅ Rejection of unauthenticated requests (401)
7. ✅ Validation of required fields (422)
8. ✅ Validation of field length constraints (422)
9. ✅ Database transaction rollback on error (500)
10. ✅ File cleanup on ingestion failure

### Integration Tests

**Test Scenarios:**

1. End-to-end ingestion flow (file → analysis → database → response)
2. Concurrent ingestion requests (race conditions)
3. Large file handling (near 10MB limit)
4. Database constraint violations (duplicate versions)
5. File system errors (disk full, permission denied)

### Frontend Tests

**Test File:** `frontend/src/test/components/TemplateSaveModal.test.tsx`

**Test Cases:**

1. ✅ Modal opens on button click
2. ✅ Form validation (required fields, length limits)
3. ✅ API call with correct payload
4. ✅ Success feedback and modal close
5. ✅ Error display and retry functionality
6. ✅ Loading state during API call
7. ✅ Accessibility compliance (ARIA, keyboard navigation)

## Security Considerations

1. **Authentication:** All ingestion endpoints require valid JWT token
2. **Authorization:** Only authenticated users can ingest templates
3. **File Validation:** Strict PDF validation before processing
4. **Path Traversal:** UUID-based filenames prevent directory traversal
5. **SQL Injection:** SQLAlchemy ORM prevents SQL injection
6. **Rate Limiting:** Prevent abuse with per-user ingestion limits
7. **File Size:** 10MB hard limit enforced at API gateway and application level

## Monitoring & Logging

### Key Metrics

1. **Ingestion Success Rate:** % of successful ingestions
2. **Processing Time:** Average time from upload to database commit
3. **Error Rate by Type:** 400, 413, 500 error breakdown
4. **File Size Distribution:** Histogram of uploaded file sizes
5. **Field Count Distribution:** Histogram of extracted field counts

### Log Events

```python
logger.info(f"Template ingestion started: user={user_id}, name={name}")
logger.info(f"File saved: path={file_path}, size={file_size_bytes}")
logger.info(f"PDF analysis complete: fields={field_count}, pages={page_count}")
logger.info(f"Database persist complete: template_id={template.id}")
logger.error(f"Ingestion failed: error={str(e)}, user={user_id}")
```

## Summary

The ingestion API provides a complete, secure, and performant workflow for persisting PDF templates with full field-level detail. Key features:

- ✅ **Authenticated endpoint** requiring JWT token
- ✅ **Complete workflow** (upload → analyze → persist)
- ✅ **Atomic transactions** ensuring data consistency
- ✅ **Comprehensive error handling** with descriptive messages
- ✅ **SOLID architecture** separating ingestion from CRUD
- ✅ **Performance optimized** with bulk inserts
- ✅ **Well-documented** with OpenAPI/Swagger
