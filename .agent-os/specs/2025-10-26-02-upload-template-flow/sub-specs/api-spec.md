# API Specification - Upload Template Flow

## New Endpoint

### GET /api/v1/templates/versions/{version_id}

Get detailed information about a specific template version including associated template data.

#### Purpose

Retrieve complete version information for display on success pages and version detail views. This endpoint combines version-specific data with basic template information in a single response.

#### Method & Path

- **Method:** GET
- **Path:** `/api/v1/templates/versions/{version_id}`
- **Authentication:** Required (JWT Bearer token)

#### Path Parameters

| Parameter    | Type    | Required | Description                               |
| ------------ | ------- | -------- | ----------------------------------------- |
| `version_id` | integer | Yes      | Unique identifier of the template version |

#### Request Headers

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

#### Response Format

**Status Code:** 200 OK

```json
{
  "id": 1,
  "version_number": "1.0",
  "change_summary": "Initial version",
  "is_current": true,
  "created_at": "2025-10-26T10:00:00Z",
  "file_path": "/app/uploads/abc-123.pdf",
  "file_size_bytes": 2621440,
  "field_count": 48,
  "sepe_url": "https://www.sepe.es/templates/solicitud-prestacion",
  "title": "Solicitud de Prestación por Desempleo",
  "author": "SEPE",
  "subject": "Formulario de Solicitud",
  "creation_date": "2024-10-15T08:00:00Z",
  "modification_date": "2024-10-20T14:30:00Z",
  "page_count": 5,
  "template": {
    "id": 10,
    "name": "Solicitud Prestación Desempleo",
    "current_version": "1.0",
    "comment": "Formulario oficial SEPE 2024",
    "uploaded_by": 5,
    "created_at": "2025-10-26T09:45:00Z"
  }
}
```

#### Response Fields

**Version Information:**
| Field | Type | Description |
|-------|------|-------------|
| `id` | integer | Unique version identifier |
| `version_number` | string | Version number (e.g., "1.0", "2.1") |
| `change_summary` | string \| null | Description of changes in this version |
| `is_current` | boolean | Whether this is the current active version |
| `created_at` | string (ISO 8601) | When the version was created |

**File Information (Version-Specific):**
| Field | Type | Description |
|-------|------|-------------|
| `file_path` | string | Absolute path to the PDF file |
| `file_size_bytes` | integer | File size in bytes |
| `field_count` | integer | Number of AcroForm fields extracted |
| `sepe_url` | string \| null | Optional SEPE source URL |

**PDF Metadata:**
| Field | Type | Description |
|-------|------|-------------|
| `title` | string \| null | PDF document title from metadata |
| `author` | string \| null | PDF document author from metadata |
| `subject` | string \| null | PDF document subject from metadata |
| `creation_date` | string \| null (ISO 8601) | When PDF was created |
| `modification_date` | string \| null (ISO 8601) | When PDF was last modified |
| `page_count` | integer | Number of pages in the PDF |

**Associated Template:**
| Field | Type | Description |
|-------|------|-------------|
| `template.id` | integer | Template unique identifier |
| `template.name` | string | Template name |
| `template.current_version` | string | Current version number of the template |
| `template.comment` | string \| null | Optional comment about the template |
| `template.uploaded_by` | integer \| null | User ID who uploaded the template |
| `template.created_at` | string (ISO 8601) | When template was created |

#### Error Responses

**404 Not Found - Version doesn't exist**

```json
{
  "detail": "Template version not found"
}
```

**404 Not Found - Associated template doesn't exist**

```json
{
  "detail": "Associated template not found"
}
```

**401 Unauthorized - Missing or invalid token**

```json
{
  "detail": "Not authenticated"
}
```

**403 Forbidden - Insufficient permissions (if authorization is implemented)**

```json
{
  "detail": "Not enough permissions to view this version"
}
```

**422 Validation Error - Invalid version_id**

```json
{
  "detail": [
    {
      "loc": ["path", "version_id"],
      "msg": "value is not a valid integer",
      "type": "type_error.integer"
    }
  ]
}
```

#### Example Requests

**Using curl:**

```bash
curl -X GET \
  'https://api.example.com/api/v1/templates/versions/1' \
  -H 'Authorization: Bearer eyJhbGciOiJIUzI1NiIs...' \
  -H 'Content-Type: application/json'
```

**Using JavaScript fetch:**

```javascript
const response = await fetch("/api/v1/templates/versions/1", {
  method: "GET",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
});

const versionDetail = await response.json();
```

**Using Python requests:**

```python
import requests

response = requests.get(
    'https://api.example.com/api/v1/templates/versions/1',
    headers={
        'Authorization': f'Bearer {token}',
        'Content-Type': 'application/json'
    }
)

version_detail = response.json()
```

## Modified Endpoint Behavior

### POST /api/v1/templates/ingest

No changes to the endpoint itself, but the frontend will now use the response differently.

#### Current Response (unchanged):

```json
{
  "id": 10,
  "name": "Solicitud Prestación",
  "current_version": "1.0",
  "comment": null,
  "file_path": "/app/uploads/abc-123.pdf",
  "file_size_bytes": 2621440,
  "field_count": 48,
  "sepe_url": "https://www.sepe.es/templates/solicitud",
  "checksum": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "message": "Template ingested successfully"
}
```

#### New Frontend Behavior:

After successful ingestion, the frontend will:

1. Extract the template `id` from the response
2. Fetch the newly created version using the template's current version
3. Redirect to `/templates/created/{version_id}`

**Note:** Since the ingestion response returns the template ID (not version ID), the frontend will need to either:

- Option A: Fetch the template first, then get the current version ID
- Option B: Modify ingestion response to include version_id (recommended)

### Recommended: Update Ingestion Response

**Add `version_id` to TemplateIngestResponse:**

```python
class TemplateIngestResponse(BaseModel):
    id: int  # template_id
    name: str
    current_version: str
    comment: Optional[str] = None
    file_path: str
    file_size_bytes: int
    field_count: int
    sepe_url: Optional[str] = None
    checksum: str
    message: str = "Template ingested successfully"
    version_id: int  # NEW: ID of the created version for direct navigation
```

**Updated Response Example:**

```json
{
  "id": 10,
  "name": "Solicitud Prestación",
  "current_version": "1.0",
  "comment": null,
  "file_path": "/app/uploads/abc-123.pdf",
  "file_size_bytes": 2621440,
  "field_count": 48,
  "sepe_url": "https://www.sepe.es/templates/solicitud",
  "checksum": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855",
  "message": "Template ingested successfully",
  "version_id": 1
}
```

This allows direct navigation to `/templates/created/1` without additional API calls.

## API Flow Diagram

```
┌─────────────────┐
│  User uploads   │
│  PDF and fills  │
│  metadata form  │
└────────┬────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ POST /api/v1/templates/ingest           │
│ - Saves PDF file                        │
│ - Analyzes structure                    │
│ - Creates template + version records    │
│ - Returns template ID & version_id      │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ Frontend redirects to:                  │
│ /templates/created/{version_id}         │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────────────────────────────┐
│ GET /api/v1/templates/versions/{id}     │
│ - Fetches version details               │
│ - Includes template information         │
│ - Returns complete data for display     │
└────────┬────────────────────────────────┘
         │
         ▼
┌─────────────────┐
│  Success page   │
│  displays all   │
│  information    │
└─────────────────┘
```

## Database Queries

### Get Version by ID (with template join)

**SQLAlchemy Query:**

```python
version = db.query(TemplateVersion)\
    .options(joinedload(TemplateVersion.template))\
    .filter(TemplateVersion.id == version_id)\
    .first()
```

**Generated SQL:**

```sql
SELECT
    tv.id, tv.template_id, tv.version_number, tv.change_summary,
    tv.is_current, tv.created_at, tv.file_path, tv.file_size_bytes,
    tv.field_count, tv.sepe_url, tv.title, tv.author, tv.subject,
    tv.creation_date, tv.modification_date, tv.page_count,
    pt.id AS pt_id, pt.name, pt.current_version, pt.comment,
    pt.uploaded_by, pt.created_at AS pt_created_at
FROM template_versions AS tv
LEFT JOIN pdf_templates AS pt ON pt.id = tv.template_id
WHERE tv.id = :version_id
```

## Rate Limiting

- No specific rate limiting for this endpoint
- Standard authentication rate limits apply
- Consider caching responses since version data rarely changes

## Versioning

- **API Version:** v1
- **Endpoint Version:** 1.0
- **Backward Compatibility:** New endpoint, no breaking changes
- **Deprecation:** N/A

## Notes

1. The endpoint returns comprehensive data in one request to minimize API calls
2. Template information is nested to maintain clear data structure
3. All datetime fields use ISO 8601 format with timezone
4. File paths are absolute server paths (not exposed to client directly)
5. The endpoint is designed for authenticated users only
6. Consider adding pagination if we add version history to this endpoint
