# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-10-26-01-database-version-refactor/spec.md

## Overview

This specification documents the API changes required to support the refactored database schema where version-specific attributes are moved from `pdf_templates` to `template_versions`. The API must maintain backward compatibility while ensuring data is correctly read from and written to the new structure.

## Modified Endpoints

### 1. GET /api/v1/templates/

**Purpose:** List all templates with pagination, sorting, and filtering

**Method:** GET

**Authentication:** Required (JWT Bearer token)

**Changes Required:**

- Query must join with `template_versions` where `is_current = TRUE` to fetch version-specific data
- Response includes `current_version` instead of `version`
- File metadata comes from the related current version

**Parameters:**

| Parameter    | Type    | Location | Required | Description                                                |
| ------------ | ------- | -------- | -------- | ---------------------------------------------------------- |
| `limit`      | integer | query    | No       | Number of results per page (default: 20)                   |
| `offset`     | integer | query    | No       | Number of results to skip (default: 0)                     |
| `sort_by`    | string  | query    | No       | Field to sort by (name, current_version, created_at, etc.) |
| `sort_order` | string  | query    | No       | Sort order: asc or desc (default: desc)                    |
| `search`     | string  | query    | No       | Search term for template name                              |

**Response Format (200 OK):**

```json
{
  "items": [
    {
      "id": 1,
      "name": "SEPE Form 145",
      "current_version": "2.1",
      "comment": "Updated for 2024 regulations",
      "file_path": "/uploads/sepe_form_145_v2.1.pdf",
      "file_size_bytes": 2621440,
      "field_count": 45,
      "sepe_url": "https://www.sepe.es/templates/form-145",
      "uploaded_by": 1,
      "created_at": "2025-01-15T10:30:00Z",
      "updated_at": "2025-10-20T14:22:00Z"
    }
  ],
  "total": 15,
  "limit": 20,
  "offset": 0
}
```

**Implementation Notes:**

- Join query: `SELECT pt.*, tv.file_path, tv.file_size_bytes, tv.field_count, tv.sepe_url FROM pdf_templates pt LEFT JOIN template_versions tv ON pt.id = tv.template_id AND tv.is_current = TRUE`
- Sorting by version-specific fields requires joining with template_versions
- Ensure proper indexing for performance

**Error Responses:**

- `401 Unauthorized` - Missing or invalid authentication token
- `500 Internal Server Error` - Database query error

---

### 2. GET /api/v1/templates/{template_id}

**Purpose:** Get detailed information about a specific template

**Method:** GET

**Authentication:** Required (JWT Bearer token)

**Changes Required:**

- Fetch version-specific data from the current version relationship
- Response structure includes `current_version` instead of `version`

**Parameters:**

| Parameter     | Type    | Location | Required | Description                |
| ------------- | ------- | -------- | -------- | -------------------------- |
| `template_id` | integer | path     | Yes      | Template unique identifier |

**Response Format (200 OK):**

```json
{
  "id": 1,
  "name": "SEPE Form 145",
  "current_version": "2.1",
  "comment": "Updated for 2024 regulations",
  "file_path": "/uploads/sepe_form_145_v2.1.pdf",
  "file_size_bytes": 2621440,
  "field_count": 45,
  "sepe_url": "https://www.sepe.es/templates/form-145",
  "uploaded_by": 1,
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-10-20T14:22:00Z"
}
```

**Implementation Notes:**

- Query: `SELECT pt.*, tv.* FROM pdf_templates pt LEFT JOIN template_versions tv ON pt.id = tv.template_id AND tv.is_current = TRUE WHERE pt.id = :template_id`
- Include null checks for cases where no current version exists

**Error Responses:**

- `401 Unauthorized` - Missing or invalid authentication token
- `404 Not Found` - Template ID does not exist
- `500 Internal Server Error` - Database query error

---

### 3. GET /api/v1/templates/{template_id}/download

**Purpose:** Download the PDF file for a template

**Method:** GET

**Authentication:** Required (JWT Bearer token)

**Changes Required:**

- Fetch `file_path` from the current version record instead of parent template
- Error handling if current version doesn't exist

**Parameters:**

| Parameter     | Type    | Location | Required | Description                |
| ------------- | ------- | -------- | -------- | -------------------------- |
| `template_id` | integer | path     | Yes      | Template unique identifier |

**Response Format (200 OK):**

- Content-Type: `application/pdf`
- Content-Disposition: `attachment; filename="template_name_v2.1.pdf"`
- Body: PDF file binary data

**Implementation Notes:**

```python
# Fetch current version
current_version = db.query(TemplateVersion).filter(
    TemplateVersion.template_id == template_id,
    TemplateVersion.is_current == True
).first()

if not current_version:
    raise HTTPException(status_code=404, detail="No current version found")

file_path = current_version.file_path
# Stream file from file_path
```

**Error Responses:**

- `401 Unauthorized` - Missing or invalid authentication token
- `404 Not Found` - Template ID does not exist or file not found
- `500 Internal Server Error` - File read error

---

### 4. PUT /api/v1/templates/{template_id}

**Purpose:** Update template metadata

**Method:** PUT

**Authentication:** Required (JWT Bearer token)

**Changes Required:**

- Only update parent template fields (`name`, `comment`, `current_version`)
- Version-specific fields should not be updated via this endpoint

**Parameters:**

| Parameter     | Type    | Location | Required | Description                |
| ------------- | ------- | -------- | -------- | -------------------------- |
| `template_id` | integer | path     | Yes      | Template unique identifier |

**Request Body:**

```json
{
  "name": "SEPE Form 145 - Updated",
  "comment": "Updated template name for clarity"
}
```

**Response Format (200 OK):**

```json
{
  "id": 1,
  "name": "SEPE Form 145 - Updated",
  "current_version": "2.1",
  "comment": "Updated template name for clarity",
  "file_path": "/uploads/sepe_form_145_v2.1.pdf",
  "file_size_bytes": 2621440,
  "field_count": 45,
  "sepe_url": "https://www.sepe.es/templates/form-145",
  "uploaded_by": 1,
  "created_at": "2025-01-15T10:30:00Z",
  "updated_at": "2025-10-26T10:15:00Z"
}
```

**Implementation Notes:**

- Update only: `name`, `comment` (no version-specific fields)
- Set `updated_at` to current timestamp
- Return full template data including current version info

**Error Responses:**

- `401 Unauthorized` - Missing or invalid authentication token
- `404 Not Found` - Template ID does not exist
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - Database update error

---

### 5. POST /api/v1/templates/ingest

**Purpose:** Upload and analyze a new PDF template or create a new version

**Method:** POST

**Authentication:** Required (JWT Bearer token)

**Changes Required:**

- Create/update `PDFTemplate` with `name`, `current_version`, `comment`
- Create `TemplateVersion` record with `file_path`, `file_size_bytes`, `field_count`, `sepe_url`, and PDF metadata
- Set `is_current = TRUE` for new version, `is_current = FALSE` for previous versions
- Update parent template's `current_version` to match new version's `version_number`

**Parameters:**

| Parameter  | Type   | Location  | Required | Description                                    |
| ---------- | ------ | --------- | -------- | ---------------------------------------------- |
| `file`     | file   | form-data | Yes      | PDF file to upload                             |
| `name`     | string | form-data | No       | Template name (auto-generated if not provided) |
| `version`  | string | form-data | Yes      | Version number/identifier                      |
| `sepe_url` | string | form-data | No       | SEPE website URL for this template             |
| `comment`  | string | form-data | No       | Administrative comment                         |

**Response Format (200 OK):**

```json
{
  "template_id": 1,
  "version_id": 5,
  "name": "SEPE Form 145",
  "current_version": "2.2",
  "file_path": "/uploads/sepe_form_145_v2.2_20251026.pdf",
  "file_size_bytes": 2756820,
  "field_count": 48,
  "sepe_url": "https://www.sepe.es/templates/form-145",
  "analysis": {
    "page_count": 6,
    "field_count": 48,
    "fields_by_type": {
      "text": 35,
      "checkbox": 10,
      "signature": 3
    }
  }
}
```

**Implementation Logic:**

```python
# 1. Check if template with this name exists
existing_template = db.query(PDFTemplate).filter(PDFTemplate.name == name).first()

if existing_template:
    # Update existing template
    # Mark previous versions as not current
    db.query(TemplateVersion).filter(
        TemplateVersion.template_id == existing_template.id,
        TemplateVersion.is_current == True
    ).update({"is_current": False})

    # Update parent template
    existing_template.current_version = version
    existing_template.comment = comment
    existing_template.updated_at = datetime.now()

    template_id = existing_template.id
else:
    # Create new template
    new_template = PDFTemplate(
        name=name,
        current_version=version,
        comment=comment,
        uploaded_by=current_user.id
    )
    db.add(new_template)
    db.flush()  # Get ID for foreign key
    template_id = new_template.id

# 2. Analyze PDF (existing logic)
analysis_result = pdf_service.analyze_pdf(file_path)

# 3. Create new version record
new_version = TemplateVersion(
    template_id=template_id,
    version_number=version,
    file_path=file_path,
    file_size_bytes=file_size,
    field_count=analysis_result.field_count,
    sepe_url=sepe_url,
    is_current=True,
    page_count=analysis_result.page_count,
    title=analysis_result.pdf_metadata.title,
    author=analysis_result.pdf_metadata.author,
    subject=analysis_result.pdf_metadata.subject,
    creation_date=analysis_result.pdf_metadata.creation_date,
    modification_date=analysis_result.pdf_metadata.modification_date,
    change_summary=f"Version {version} uploaded"
)
db.add(new_version)
db.flush()

# 4. Create field records (existing logic)
for field_data in analysis_result.fields:
    new_field = TemplateField(
        version_id=new_version.id,
        field_id=field_data.field_id,
        field_type=field_data.field_type,
        # ... other fields
    )
    db.add(new_field)

db.commit()
```

**Error Responses:**

- `401 Unauthorized` - Missing or invalid authentication token
- `400 Bad Request` - Invalid file format or missing required fields
- `422 Unprocessable Entity` - Validation error
- `500 Internal Server Error` - File storage or database error

---

### 6. GET /api/v1/templates/{template_id}/versions

**Purpose:** Get all versions of a template

**Method:** GET

**Authentication:** Required (JWT Bearer token)

**Changes Required:**

- Response now includes version-specific fields (`file_path`, `file_size_bytes`, `field_count`, `sepe_url`)

**Parameters:**

| Parameter     | Type    | Location | Required | Description                              |
| ------------- | ------- | -------- | -------- | ---------------------------------------- |
| `template_id` | integer | path     | Yes      | Template unique identifier               |
| `limit`       | integer | query    | No       | Number of results per page (default: 20) |
| `offset`      | integer | query    | No       | Number of results to skip (default: 0)   |
| `sort_by`     | string  | query    | No       | Field to sort by (default: created_at)   |
| `sort_order`  | string  | query    | No       | Sort order: asc or desc (default: desc)  |

**Response Format (200 OK):**

```json
{
  "items": [
    {
      "id": 5,
      "template_id": 1,
      "version_number": "2.2",
      "file_path": "/uploads/sepe_form_145_v2.2_20251026.pdf",
      "file_size_bytes": 2756820,
      "field_count": 48,
      "sepe_url": "https://www.sepe.es/templates/form-145",
      "change_summary": "Added 3 new signature fields",
      "is_current": true,
      "created_at": "2025-10-26T09:15:00Z",
      "title": "SEPE Employment Form 145",
      "author": "SEPE",
      "subject": "Employment Documentation",
      "creation_date": "2025-10-25T00:00:00Z",
      "modification_date": "2025-10-26T00:00:00Z",
      "page_count": 6
    },
    {
      "id": 4,
      "template_id": 1,
      "version_number": "2.1",
      "file_path": "/uploads/sepe_form_145_v2.1.pdf",
      "file_size_bytes": 2621440,
      "field_count": 45,
      "sepe_url": "https://www.sepe.es/templates/form-145",
      "change_summary": "Updated for 2024 regulations",
      "is_current": false,
      "created_at": "2025-01-15T10:30:00Z",
      "title": "SEPE Employment Form 145",
      "author": "SEPE",
      "subject": "Employment Documentation",
      "creation_date": "2025-01-14T00:00:00Z",
      "modification_date": "2025-01-15T00:00:00Z",
      "page_count": 5
    }
  ],
  "total": 5,
  "limit": 20,
  "offset": 0
}
```

**Implementation Notes:**

- No join required - all data comes from `template_versions` table
- Includes new columns in response

**Error Responses:**

- `401 Unauthorized` - Missing or invalid authentication token
- `404 Not Found` - Template ID does not exist
- `500 Internal Server Error` - Database query error

---

### 7. GET /api/v1/templates/{template_id}/fields/current

**Purpose:** Get AcroForm fields for the current version

**Method:** GET

**Authentication:** Required (JWT Bearer token)

**Changes Required:** None (already works with version-based structure)

**Implementation Notes:**

- Query joins through: `template_versions` (where `is_current = TRUE`) → `template_fields`
- No changes needed as fields are already version-specific

---

## Schema Updates

### TemplateBase (Pydantic)

```python
class TemplateBase(BaseModel):
    """Base template schema."""
    name: str = Field(..., max_length=255)
    current_version: str = Field(..., max_length=50)  # renamed from 'version'
    comment: Optional[str] = None  # new field
```

### TemplateResponse (Pydantic)

```python
class TemplateResponse(BaseModel):
    """Template response with current version data."""
    id: int
    name: str
    current_version: str
    comment: Optional[str] = None

    # From current version (computed/joined)
    file_path: str
    file_size_bytes: int
    field_count: int
    sepe_url: Optional[str] = None

    uploaded_by: Optional[int] = None
    created_at: datetime
    updated_at: Optional[datetime] = None

    class Config:
        from_attributes = True
```

### TemplateVersionResponse (Pydantic)

```python
class TemplateVersionResponse(BaseModel):
    """Template version response with full metadata."""
    id: int
    template_id: int
    version_number: str

    # New fields
    file_path: str
    file_size_bytes: int
    field_count: int
    sepe_url: Optional[str] = None

    change_summary: Optional[str] = None
    is_current: bool
    created_at: datetime

    # PDF Document Metadata
    title: Optional[str] = None
    author: Optional[str] = None
    subject: Optional[str] = None
    creation_date: Optional[datetime] = None
    modification_date: Optional[datetime] = None
    page_count: int

    class Config:
        from_attributes = True
```

## Backward Compatibility Strategy

### API Response Structure

**Goal:** Maintain same response structure for existing clients

**Approach:** Include version-specific fields in template responses by fetching from current version

**Implementation:**

```python
@router.get("/", response_model=TemplateListResponse)
async def list_templates(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user),
    # ... pagination params
):
    # Join with current version
    query = db.query(PDFTemplate, TemplateVersion).outerjoin(
        TemplateVersion,
        and_(
            PDFTemplate.id == TemplateVersion.template_id,
            TemplateVersion.is_current == True
        )
    )

    # Build response with combined data
    items = []
    for template, version in results:
        item = {
            **template.__dict__,
            "file_path": version.file_path if version else None,
            "file_size_bytes": version.file_size_bytes if version else 0,
            "field_count": version.field_count if version else 0,
            "sepe_url": version.sepe_url if version else None,
        }
        items.append(item)

    return TemplateListResponse(items=items, total=total, ...)
```

### Breaking Changes Documentation

**Changes that require client updates:**

1. **Field rename:** `version` → `current_version` in template objects
2. **New field:** `comment` added to template objects (nullable)
3. **Version endpoints:** Now include `file_path`, `file_size_bytes`, `field_count`, `sepe_url`

**Migration guide for API clients:**

```javascript
// Before
const templateVersion = template.version;

// After
const templateVersion = template.current_version;
```

## Testing Checklist

### API Endpoint Tests

- [ ] GET /templates/ returns templates with current version data
- [ ] GET /templates/{id} returns correct version-specific fields
- [ ] GET /templates/{id}/download streams correct file from version path
- [ ] PUT /templates/{id} updates only parent fields
- [ ] POST /templates/ingest creates version with all fields
- [ ] POST /templates/ingest updates existing template correctly
- [ ] GET /templates/{id}/versions includes new version fields

### Edge Cases

- [ ] Template with no current version (should handle gracefully)
- [ ] Template with multiple versions (current flag is correct)
- [ ] Uploading same version number (should update or error)
- [ ] Large file upload (file size correctly recorded)
- [ ] Missing sepe_url (null handling)

### Performance Tests

- [ ] Template list query with join is performant
- [ ] Sorting by version fields works correctly
- [ ] Pagination with large datasets
- [ ] Concurrent version uploads

## Documentation Updates

### Swagger/OpenAPI

- Update all endpoint descriptions
- Update request/response schemas
- Add migration notes to API changelog
- Document breaking changes

### Developer README

- Document new schema structure
- Update example API calls
- Add migration instructions
- Update entity relationship diagrams
