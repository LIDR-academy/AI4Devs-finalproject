# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-10-25-01-template-management-page/spec.md

## API Structure

All endpoints follow the existing API structure:

- **Base URL**: `/api/v1`
- **Authentication**: JWT Bearer token (required for all endpoints)
- **Content Type**: `application/json` for JSON responses, `application/pdf` for file downloads
- **Error Format**: Consistent error response with error code, message, and timestamp
- **Documentation**: Automatic OpenAPI/Swagger documentation at `/docs`

## Endpoints

### GET /api/v1/templates/{template_id}/download

**Purpose:** Download the PDF file of a template's current version

**Parameters:**

- `template_id` (path parameter, integer, required) - The ID of the template to download

**Authentication:** Required - JWT Bearer token in Authorization header

**Response:**

Success (200 OK):

- **Content-Type**: `application/pdf`
- **Content-Disposition**: `attachment; filename="{template_name}_v{version}.pdf"`
- **Content-Length**: File size in bytes
- **Body**: Binary PDF file stream

**Errors:**

- 401 Unauthorized - Missing or invalid JWT token
- 404 Not Found - Template with specified ID does not exist
- 404 Not Found - PDF file not found on disk at file_path location
- 500 Internal Server Error - File read error or file system issue

**Implementation Notes:**

- Query `pdf_templates` table to retrieve template record by ID
- Extract `file_path`, `name`, and `version` fields from template record
- Verify file exists at `file_path` location on disk before streaming
- Use FastAPI's `FileResponse` with `media_type="application/pdf"` for efficient streaming
- Generate filename as `{name}_v{version}.pdf` with special characters sanitized
- Stream file in chunks to avoid memory issues with large PDFs
- Log download events for audit trail

---

### GET /api/v1/templates/{template_id}/versions

**Purpose:** Retrieve all versions of a specific template with complete metadata

**Parameters:**

- `template_id` (path parameter, integer, required) - The ID of the template
- `limit` (query parameter, integer, optional, default=20) - Number of results per page (max 100)
- `offset` (query parameter, integer, optional, default=0) - Number of results to skip for pagination
- `sort_by` (query parameter, string, optional, default="created_at") - Field to sort by (created_at, version_number, page_count)
- `sort_order` (query parameter, string, optional, default="desc") - Sort order: asc or desc

**Authentication:** Required - JWT Bearer token in Authorization header

**Response:**

Success (200 OK):

```json
{
  "items": [
    {
      "id": 1,
      "template_id": 1,
      "version_number": "2.0.0",
      "change_summary": "Updated field validations and added new signature field",
      "is_current": true,
      "created_at": "2025-10-20T10:00:00Z",
      "title": "SEPE Employment Registration Form 2024",
      "author": "SEPE - Servicio Público de Empleo Estatal",
      "subject": "Employment Registration and Benefits Application",
      "creation_date": "2024-01-15T00:00:00Z",
      "modification_date": "2024-10-01T00:00:00Z",
      "page_count": 5
    },
    {
      "id": 2,
      "template_id": 1,
      "version_number": "1.0.0",
      "change_summary": "Initial version",
      "is_current": false,
      "created_at": "2025-09-15T14:30:00Z",
      "title": "SEPE Employment Registration Form 2023",
      "author": "SEPE",
      "subject": "Employment Registration",
      "creation_date": "2023-01-10T00:00:00Z",
      "modification_date": "2023-09-01T00:00:00Z",
      "page_count": 4
    }
  ],
  "total": 2,
  "limit": 20,
  "offset": 0
}
```

**Errors:**

- 401 Unauthorized - Missing or invalid JWT token
- 404 Not Found - Template with specified ID does not exist
- 422 Unprocessable Entity - Invalid query parameters (limit >100, invalid sort_by field, invalid sort_order value)

**Implementation Notes:**

- JOIN `template_versions` table with `pdf_templates` on `template_id` foreign key
- Verify template exists before querying versions
- Order by `created_at DESC` by default to show newest versions first
- Support sorting by `version_number`, `created_at`, or `page_count`
- Include all metadata fields from template_versions table
- Apply pagination using LIMIT and OFFSET SQL clauses
- Return total count for client-side pagination controls

---

### GET /api/v1/templates/{template_id}/fields/current

**Purpose:** Retrieve all AcroForm fields from the current version of a template

**Parameters:**

- `template_id` (path parameter, integer, required) - The ID of the template
- `limit` (query parameter, integer, optional, default=20) - Number of results per page (max 100)
- `offset` (query parameter, integer, optional, default=0) - Number of results to skip for pagination
- `page_number` (query parameter, integer, optional) - Filter fields by specific page number (1-indexed)
- `search` (query parameter, string, optional) - Search text to filter by field_id or near_text (case-insensitive)

**Authentication:** Required - JWT Bearer token in Authorization header

**Response:**

Success (200 OK):

```json
{
  "items": [
    {
      "id": 1,
      "version_id": 1,
      "field_id": "A0101",
      "field_type": "text",
      "raw_type": "/Tx",
      "page_number": 1,
      "field_page_order": 0,
      "near_text": "Nombre completo:",
      "value_options": null,
      "position_data": {
        "x0": 100.5,
        "y0": 200.3,
        "x1": 300.7,
        "y1": 220.8
      },
      "created_at": "2025-10-20T10:00:00Z"
    },
    {
      "id": 2,
      "version_id": 1,
      "field_id": "A0102",
      "field_type": "radiobutton",
      "raw_type": "/Btn",
      "page_number": 1,
      "field_page_order": 1,
      "near_text": "Sexo:",
      "value_options": ["Hombre", "Mujer", "Otro"],
      "position_data": {
        "x0": 100.5,
        "y0": 240.2,
        "x1": 200.3,
        "y1": 260.7
      },
      "created_at": "2025-10-20T10:00:00Z"
    }
  ],
  "total": 45,
  "limit": 20,
  "offset": 0,
  "version_info": {
    "version_id": 1,
    "version_number": "2.0.0",
    "field_count": 45
  }
}
```

**Errors:**

- 401 Unauthorized - Missing or invalid JWT token
- 404 Not Found - Template with specified ID does not exist
- 404 Not Found - No current version found (no version with is_current=true)
- 422 Unprocessable Entity - Invalid query parameters (limit >100, page_number <1)

**Implementation Notes:**

- JOIN `template_fields` with `template_versions` WHERE `is_current = true` AND `template_id = {template_id}`
- JOIN with `pdf_templates` to verify template exists
- Order results by `page_number ASC`, then `field_page_order ASC` for natural reading order
- Apply search filter using ILIKE on both `field_id` and `near_text` columns if search parameter provided
- Apply page_number filter if specified
- Include version metadata in response for context
- Parse JSONB columns (`value_options`, `position_data`) into proper JSON objects
- Apply pagination with LIMIT and OFFSET
- Return total count of matching fields before pagination

---

### GET /api/v1/templates/{template_id}/versions/{version_id}/fields

**Purpose:** Retrieve all AcroForm fields from a specific version of a template (for historical analysis)

**Parameters:**

- `template_id` (path parameter, integer, required) - The ID of the template
- `version_id` (path parameter, integer, required) - The ID of the specific version
- `limit` (query parameter, integer, optional, default=20) - Number of results per page (max 100)
- `offset` (query parameter, integer, optional, default=0) - Number of results to skip for pagination
- `page_number` (query parameter, integer, optional) - Filter fields by specific page number
- `search` (query parameter, string, optional) - Search text to filter by field_id or near_text

**Authentication:** Required - JWT Bearer token in Authorization header

**Response:**

Success (200 OK):

```json
{
  "items": [
    {
      "id": 5,
      "version_id": 2,
      "field_id": "A0101",
      "field_type": "text",
      "raw_type": "/Tx",
      "page_number": 1,
      "field_page_order": 0,
      "near_text": "Full Name:",
      "value_options": null,
      "position_data": {
        "x0": 95.2,
        "y0": 205.1,
        "x1": 295.8,
        "y1": 225.4
      },
      "created_at": "2025-09-15T14:30:00Z"
    }
  ],
  "total": 42,
  "limit": 20,
  "offset": 0,
  "version_info": {
    "version_id": 2,
    "version_number": "1.0.0",
    "field_count": 42
  }
}
```

**Errors:**

- 401 Unauthorized - Missing or invalid JWT token
- 404 Not Found - Template with specified ID does not exist
- 404 Not Found - Version with specified ID does not exist
- 400 Bad Request - Version does not belong to the specified template (template_id mismatch)
- 422 Unprocessable Entity - Invalid query parameters

**Implementation Notes:**

- First verify that `version_id` exists and belongs to `template_id` by checking template_versions table
- JOIN `template_fields` with `template_versions` on `version_id`
- Same ordering, filtering, and pagination logic as current version endpoint
- Useful for comparing fields between different versions
- Same response structure as `/fields/current` endpoint for consistency

## Controllers and Business Logic

### TemplatesController

**download_template(template_id: int)**

- Retrieve template record from database
- Validate file_path exists on disk
- Generate sanitized filename
- Return FileResponse with streaming

**get_template_versions(template_id: int, limit: int, offset: int, sort_by: str, sort_order: str)**

- Validate template exists
- Validate and sanitize sort parameters
- Query versions with pagination and sorting
- Return paginated response

**get_current_version_fields(template_id: int, limit: int, offset: int, page_number: Optional[int], search: Optional[str])**

- Validate template exists
- Find current version (is_current=true)
- Query fields with filters and pagination
- Include version metadata in response
- Return paginated response

**get_version_fields(template_id: int, version_id: int, limit: int, offset: int, page_number: Optional[int], search: Optional[str])**

- Validate template exists
- Validate version exists and belongs to template
- Query fields with filters and pagination
- Include version metadata in response
- Return paginated response

## Error Response Format

All error responses follow consistent format:

```json
{
  "error": {
    "code": "TEMPLATE_NOT_FOUND",
    "message": "Template with ID 123 not found",
    "timestamp": "2025-10-25T10:00:00Z"
  }
}
```

**Error Codes:**

- `TEMPLATE_NOT_FOUND` - Template ID does not exist
- `VERSION_NOT_FOUND` - Version ID does not exist
- `VERSION_MISMATCH` - Version does not belong to specified template
- `FILE_NOT_FOUND` - PDF file not found on disk
- `FILE_READ_ERROR` - Error reading file from disk
- `INVALID_PARAMETERS` - Invalid query parameters
- `UNAUTHORIZED` - Missing or invalid authentication token
- `NO_CURRENT_VERSION` - Template has no version marked as current

## Integration Points

### Database Tables

- `pdf_templates` - Main template records
- `template_versions` - Version history with metadata
- `template_fields` - AcroForm field data

### File System

- PDF files stored at paths specified in `pdf_templates.file_path`
- Default storage location: `/uploads/templates/` (configurable via PDF_STORAGE_PATH env var)

### Authentication

- JWT token validation via existing auth middleware
- User context available for audit logging

## Performance Considerations

- File streaming for large PDFs to avoid memory issues
- Database query optimization with proper indexes on:
  - `template_versions.template_id`
  - `template_versions.is_current`
  - `template_fields.version_id`
  - `template_fields.page_number`
- Pagination enforced with maximum limit of 100 to prevent large result sets
- ILIKE search uses database indexes on field_id and near_text columns
- Response caching headers for static version data
