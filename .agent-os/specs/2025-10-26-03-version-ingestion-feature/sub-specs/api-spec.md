# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-10-26-03-version-ingestion-feature/spec.md

## Endpoints

### POST /api/v1/templates/ingest/version

**Purpose:** Ingest a new version for an existing PDF template with complete analysis and persistence.

**Authentication:** Required (JWT Bearer token)

**Tags:** `["Template Ingestion"]`

**Request:**

Content-Type: `multipart/form-data`

**Parameters:**

| Parameter      | Type       | Location | Required | Description                                                       |
| -------------- | ---------- | -------- | -------- | ----------------------------------------------------------------- |
| file           | UploadFile | FormData | Yes      | PDF template file (max 10MB)                                      |
| template_id    | integer    | FormData | Yes      | ID of existing template (must exist in pdf_templates)             |
| version        | string     | FormData | Yes      | Version identifier (1-50 characters)                              |
| change_summary | string     | FormData | No       | Description of changes in this version (TEXT)                     |
| sepe_url       | string     | FormData | No       | Optional SEPE source URL (max 1000 characters, must be valid URL) |

**Request Example:**

```bash
curl -X POST "http://localhost:8000/api/v1/templates/ingest/version" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." \
  -F "file=@/path/to/template.pdf" \
  -F "template_id=10" \
  -F "version=2024-Q2" \
  -F "change_summary=Updated form fields for new regulations" \
  -F "sepe_url=https://www.sepe.es/templates/solicitud-v2"
```

**Response:**

Status Code: `201 Created`

Content-Type: `application/json`

**Response Schema:**

```json
{
  "template_id": 10,
  "version_id": 25,
  "version_number": "2024-Q2",
  "change_summary": "Updated form fields for new regulations",
  "file_path": "/app/uploads/abc-def-123-456.pdf",
  "file_size_bytes": 2621440,
  "field_count": 52,
  "is_current": true,
  "message": "Version ingested successfully"
}
```

**Response Fields:**

| Field           | Type           | Description                                         |
| --------------- | -------------- | --------------------------------------------------- |
| template_id     | integer        | Parent template ID                                  |
| version_id      | integer        | New version ID (use for navigation to success page) |
| version_number  | string         | Version identifier provided in request              |
| change_summary  | string \| null | Description of changes (may be null)                |
| file_path       | string         | Server path to stored PDF file                      |
| file_size_bytes | integer        | File size in bytes                                  |
| field_count     | integer        | Number of AcroForm fields extracted from PDF        |
| is_current      | boolean        | Always true for newly created versions              |
| message         | string         | Success message                                     |

**Error Responses:**

| Status Code               | Description                                    | Example Response                                                                                     |
| ------------------------- | ---------------------------------------------- | ---------------------------------------------------------------------------------------------------- |
| 400 Bad Request           | Invalid file, no form fields, or corrupted PDF | `{"detail": "Only PDF files are allowed"}`                                                           |
| 400 Bad Request           | No AcroForm fields found                       | `{"detail": "No AcroForm fields found in PDF"}`                                                      |
| 401 Unauthorized          | Missing or invalid JWT token                   | `{"detail": "Not authenticated"}`                                                                    |
| 404 Not Found             | Template ID does not exist                     | `{"detail": "Template with ID 10 not found"}`                                                        |
| 413 Payload Too Large     | File exceeds 10MB                              | `{"detail": "File exceeds maximum size limit of 10MB. File size: 12.3MB"}`                           |
| 422 Unprocessable Entity  | Validation error in form fields                | `{"detail": [{"loc": ["body", "version"], "msg": "field required", "type": "value_error.missing"}]}` |
| 500 Internal Server Error | Server error during processing                 | `{"detail": "Failed to ingest version. Please try again."}`                                          |

**Business Logic:**

1. **Validate Template Exists:**

   - Query `pdf_templates` table for `template_id`
   - Return 404 if not found

2. **Validate File:**

   - Check file extension is `.pdf`
   - Validate file size ≤ 10MB
   - Validate file is not empty

3. **Process PDF:**

   - Save file to uploads directory with UUID filename
   - Calculate SHA256 checksum
   - Extract AcroForm fields using PDFAnalysisService
   - Extract PDF metadata (title, author, page count, etc.)

4. **Update Database (Atomic Transaction):**

   - Mark all existing versions as `is_current = False` for this template
   - Insert new `template_versions` record with `is_current = True`
   - Bulk insert field records into `template_fields`
   - Update `pdf_templates.current_version` to new version number
   - Update `pdf_templates.updated_at` timestamp

5. **Return Response:**
   - Return version details including `version_id` for navigation

**Rollback on Error:**

- If any step fails, delete uploaded file
- Rollback database transaction
- Return appropriate error response

---

### GET /api/v1/templates/names

**Purpose:** Retrieve lightweight list of template names and IDs for UI selectors (e.g., dropdowns in version upload modal).

**Authentication:** Required (JWT Bearer token)

**Tags:** `["Templates - CRUD"]`

**Query Parameters:**

| Parameter  | Type    | Required | Default | Description                                               |
| ---------- | ------- | -------- | ------- | --------------------------------------------------------- |
| search     | string  | No       | null    | Filter by template name (case-insensitive, partial match) |
| limit      | integer | No       | 100     | Maximum number of results (1-500)                         |
| sort_by    | string  | No       | "name"  | Sort field: "name" or "created_at"                        |
| sort_order | string  | No       | "asc"   | Sort order: "asc" or "desc"                               |

**Request Example:**

```bash
# Get all templates sorted by name
curl -X GET "http://localhost:8000/api/v1/templates/names" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Search templates
curl -X GET "http://localhost:8000/api/v1/templates/names?search=Solicitud&limit=20" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Sort by creation date (newest first)
curl -X GET "http://localhost:8000/api/v1/templates/names?sort_by=created_at&sort_order=desc" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

**Response:**

Status Code: `200 OK`

Content-Type: `application/json`

**Response Schema:**

```json
{
  "items": [
    {
      "id": 1,
      "name": "Solicitud Prestación Desempleo",
      "current_version": "2024-Q1"
    },
    {
      "id": 5,
      "name": "Solicitud Modificación Datos",
      "current_version": "v3.2"
    }
  ],
  "total": 2
}
```

**Response Fields:**

| Field                   | Type    | Description                                |
| ----------------------- | ------- | ------------------------------------------ |
| items                   | array   | Array of template name items               |
| items[].id              | integer | Template unique identifier                 |
| items[].name            | string  | Template name                              |
| items[].current_version | string  | Current version identifier                 |
| total                   | integer | Total number of templates matching filters |

**Error Responses:**

| Status Code               | Description                  | Example Response                                                                                  |
| ------------------------- | ---------------------------- | ------------------------------------------------------------------------------------------------- |
| 401 Unauthorized          | Missing or invalid JWT token | `{"detail": "Not authenticated"}`                                                                 |
| 422 Unprocessable Entity  | Invalid query parameter      | `{"detail": [{"loc": ["query", "limit"], "msg": "value must be <= 500", "type": "value_error"}]}` |
| 500 Internal Server Error | Server error                 | `{"detail": "Failed to retrieve templates"}`                                                      |

**Business Logic:**

1. **Build Query:**

   - Query `pdf_templates` table
   - Select only `id`, `name`, `current_version` columns
   - Apply search filter if provided (ILIKE on name)

2. **Apply Sorting:**

   - Sort by specified field (name or created_at)
   - Apply sort order (asc or desc)

3. **Apply Pagination:**

   - Limit results to specified limit (max 500)
   - Count total matching records

4. **Return Response:**
   - Return lightweight array of items
   - Include total count for potential pagination

**Performance Notes:**

- Query uses index on `name` field for fast searching
- Returns minimal data to reduce payload size
- Suitable for autocomplete/typeahead components

---

## Existing Endpoint Updates

### GET /api/v1/templates/versions/{version_id}

**Status:** No changes required - already exists and returns all necessary version details.

**Usage After Version Ingestion:**

- Frontend redirects to `/templates/versions/{version_id}` after successful version upload
- This endpoint provides complete version information for success page display

### GET /api/v1/templates/{template_id}/versions

**Status:** No changes required - already exists and lists all versions for a template.

**Usage for Version History:**

- Can be used to display version history on template detail pages
- Shows all versions including newly created ones

---

## API Integration Flow

### Complete Version Upload Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API-Names as GET /templates/names
    participant API-Ingest as POST /templates/ingest/version
    participant API-Version as GET /templates/versions/{id}
    participant Database
    participant FileSystem

    User->>Frontend: Click "Save New Version"
    Frontend->>API-Names: GET /templates/names
    API-Names->>Database: Query pdf_templates
    Database-->>API-Names: Template list
    API-Names-->>Frontend: {items: [...], total: N}
    Frontend->>User: Show modal with template selector

    User->>Frontend: Select template, enter version, submit
    Frontend->>API-Ingest: POST /ingest/version (multipart form)
    API-Ingest->>FileSystem: Save PDF file
    API-Ingest->>API-Ingest: Analyze PDF fields
    API-Ingest->>Database: BEGIN TRANSACTION
    API-Ingest->>Database: UPDATE versions SET is_current=false
    API-Ingest->>Database: INSERT INTO template_versions
    API-Ingest->>Database: INSERT INTO template_fields (bulk)
    API-Ingest->>Database: UPDATE pdf_templates.current_version
    API-Ingest->>Database: COMMIT TRANSACTION
    API-Ingest-->>Frontend: {version_id: 25, message: "Success"}

    Frontend->>User: Show success notification
    Frontend->>Frontend: Navigate to /templates/versions/25
    Frontend->>API-Version: GET /templates/versions/25
    API-Version->>Database: Query version with template info
    Database-->>API-Version: Version details
    API-Version-->>Frontend: Complete version data
    Frontend->>User: Display version success page
```

### Error Handling Flow

```mermaid
sequenceDiagram
    participant User
    participant Frontend
    participant API-Ingest as POST /templates/ingest/version
    participant Database
    participant FileSystem

    User->>Frontend: Submit version upload
    Frontend->>API-Ingest: POST /ingest/version

    alt Template Not Found
        API-Ingest->>Database: Query template_id
        Database-->>API-Ingest: Not found
        API-Ingest-->>Frontend: 404 Template not found
        Frontend->>User: Show error: "Template not found"

    else PDF Analysis Fails
        API-Ingest->>FileSystem: Save PDF temporarily
        API-Ingest->>API-Ingest: Analyze PDF
        API-Ingest->>API-Ingest: ERROR: No form fields
        API-Ingest->>FileSystem: Delete temporary file
        API-Ingest-->>Frontend: 400 No AcroForm fields
        Frontend->>User: Show error: "PDF has no form fields"

    else Database Error
        API-Ingest->>Database: BEGIN TRANSACTION
        API-Ingest->>Database: INSERT INTO template_versions
        Database-->>API-Ingest: ERROR: Constraint violation
        API-Ingest->>Database: ROLLBACK TRANSACTION
        API-Ingest->>FileSystem: Delete uploaded file
        API-Ingest-->>Frontend: 500 Internal error
        Frontend->>User: Show error: "Failed to save version"
    end
```

---

## OpenAPI Schema Additions

### Request Body Schema (POST /templates/ingest/version)

```yaml
requestBody:
  required: true
  content:
    multipart/form-data:
      schema:
        type: object
        required:
          - file
          - template_id
          - version
        properties:
          file:
            type: string
            format: binary
            description: PDF template file (max 10MB)
          template_id:
            type: integer
            minimum: 1
            description: ID of existing template
          version:
            type: string
            minLength: 1
            maxLength: 50
            description: Version identifier
          change_summary:
            type: string
            description: Description of changes (optional)
          sepe_url:
            type: string
            format: uri
            maxLength: 1000
            description: Optional SEPE source URL
```

### Response Schema (POST /templates/ingest/version)

```yaml
responses:
  "201":
    description: Version ingested successfully
    content:
      application/json:
        schema:
          type: object
          required:
            - template_id
            - version_id
            - version_number
            - file_path
            - file_size_bytes
            - field_count
            - is_current
            - message
          properties:
            template_id:
              type: integer
            version_id:
              type: integer
            version_number:
              type: string
            change_summary:
              type: string
              nullable: true
            file_path:
              type: string
            file_size_bytes:
              type: integer
            field_count:
              type: integer
            is_current:
              type: boolean
            message:
              type: string
```

### Response Schema (GET /templates/names)

```yaml
responses:
  "200":
    description: Template names retrieved successfully
    content:
      application/json:
        schema:
          type: object
          required:
            - items
            - total
          properties:
            items:
              type: array
              items:
                type: object
                required:
                  - id
                  - name
                  - current_version
                properties:
                  id:
                    type: integer
                  name:
                    type: string
                  current_version:
                    type: string
            total:
              type: integer
```

---

## Rate Limiting Considerations

**Template Names Endpoint:**

- Consider implementing rate limiting (e.g., 100 requests per minute per user)
- Cache results on frontend for duration of session
- Debounce search input to reduce API calls

**Version Ingestion Endpoint:**

- Rate limit to prevent abuse (e.g., 10 version uploads per minute per user)
- Monitor for suspicious patterns (multiple uploads of same file)

---

## Monitoring and Logging

**Metrics to Track:**

1. Version ingestion success rate
2. Average ingestion time
3. File upload sizes
4. Field extraction counts
5. Error rates by type (PDF errors, database errors, etc.)

**Log Events:**

1. Version ingestion started (user_id, template_id, version)
2. Version ingestion completed (version_id, field_count, processing_time)
3. Version ingestion failed (error_type, error_message)
4. Template names query (user_id, search_term, result_count)

**Log Format:**

```json
{
  "timestamp": "2025-10-26T10:30:45Z",
  "level": "INFO",
  "event": "version_ingestion_started",
  "user_id": 5,
  "template_id": 10,
  "version": "2024-Q2",
  "file_size_bytes": 2621440
}
```
