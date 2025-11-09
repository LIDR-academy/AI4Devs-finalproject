# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-10-26-03-version-ingestion-feature/spec.md

## Technical Requirements

### Backend Architecture

#### 1. New Ingestion Endpoint (SOLID Principle)

**File:** `backend/app/api/v1/endpoints/ingest.py`

**New Endpoint:** `POST /api/v1/templates/ingest/version`

**Purpose:** Handle version ingestion for existing templates, following Single Responsibility Principle by separating version creation from initial template creation.

**Authentication:** Required - uses `get_current_active_user` dependency

**Request Parameters:**

- `file: UploadFile` - The PDF file (max 10MB)
- `template_id: int` - Foreign key to existing template (Form field)
- `version: str` - Version number/identifier (Form field, max 50 chars)
- `change_summary: str` - Description of changes (Form field, TEXT)
- `sepe_url: Optional[str]` - Optional SEPE URL (Form field, max 1000 chars)

**Response:** `TemplateVersionIngestResponse` schema with:

- `template_id: int` - Parent template ID
- `version_id: int` - New version ID for navigation
- `version_number: str`
- `change_summary: str`
- `file_path: str`
- `file_size_bytes: int`
- `field_count: int`
- `is_current: bool` - Always True for new versions
- `message: str`

**Validation Logic:**

1. Verify `template_id` exists in `pdf_templates` table
2. Check user has permission to add versions (optional - can implement later)
3. Validate PDF file (extension, size, not empty)
4. Verify PDF contains AcroForm fields

**Error Responses:**

- 400: Invalid file, no fields, or corrupted PDF
- 401: Not authenticated
- 404: Template not found
- 413: File exceeds 10MB
- 422: Validation error
- 500: Internal server error

#### 2. Template Names Endpoint

**File:** `backend/app/api/v1/endpoints/templates.py`

**New Endpoint:** `GET /api/v1/templates/names`

**Purpose:** Provide lightweight template list for UI selectors

**Authentication:** Required - uses `get_current_active_user` dependency

**Query Parameters:**

- `search: Optional[str]` - Filter by template name (case-insensitive)
- `limit: int` - Default 100, max 500
- `sort_by: str` - Default "name", options: "name", "created_at"
- `sort_order: str` - Default "asc", options: "asc", "desc"

**Response:** `TemplateNamesResponse` schema

```python
{
  "items": [
    {
      "id": 1,
      "name": "Solicitud Prestación Desempleo",
      "current_version": "2024-Q1"
    }
  ],
  "total": 1
}
```

**Performance:** Query should be optimized with proper indexing on `name` and `created_at` fields

#### 3. Template Service Methods

**File:** `backend/app/services/template_service.py`

**New Method:** `async def ingest_template_version()`

**Signature:**

```python
async def ingest_template_version(
    self,
    file: UploadFile,
    template_id: int,
    version: str,
    change_summary: Optional[str],
    sepe_url: Optional[str],
    user_id: int
) -> TemplateVersion:
```

**Workflow:**

1. **Validate Template Exists:**

   - Query `pdf_templates` for `template_id`
   - Raise `ValueError` if not found

2. **Save PDF File:**

   - Generate unique filename with UUID
   - Store in uploads directory
   - Calculate SHA256 checksum
   - Extract file size

3. **Analyze PDF:**

   - Use `PDFAnalysisService.analyze_pdf()`
   - Extract fields and metadata
   - Get page count, title, author, etc.

4. **Update Version Flags (Critical):**

   - Query all versions for this template
   - Set `is_current = False` for all existing versions
   - This must happen in same transaction as new version creation

5. **Create New Version Record:**

   - Insert into `template_versions` table
   - Set `is_current = True`
   - Store all file metadata and PDF metadata
   - Set `template_id` foreign key
   - Set `version_number` and `change_summary`

6. **Insert Field Records:**

   - Bulk insert into `template_fields` table
   - Link to new `version_id`
   - Include all field metadata (field_id, type, near_text, etc.)

7. **Update Parent Template:**

   - Update `pdf_templates.current_version` to new version number
   - Update `pdf_templates.updated_at` timestamp

8. **Commit Transaction:**
   - All operations must be in single transaction
   - Rollback on any error
   - Clean up file on failure

**Error Handling:**

- Wrap in try/except with proper cleanup
- Remove uploaded file if database operations fail
- Log all errors with context

#### 4. Pydantic Schemas

**File:** `backend/app/schemas/template.py`

**New Request Schema:**

```python
class TemplateVersionIngestRequest(BaseModel):
    """Schema for version ingestion request."""

    template_id: int = Field(..., gt=0, description="Existing template ID")
    version: str = Field(
        ...,
        min_length=1,
        max_length=50,
        description="Version identifier"
    )
    change_summary: Optional[str] = Field(
        None,
        description="Description of changes in this version"
    )
    sepe_url: Optional[HttpUrl] = Field(
        None,
        description="SEPE source URL"
    )

    @field_validator("version")
    @classmethod
    def validate_version(cls, v: str) -> str:
        if not v or not v.strip():
            raise ValueError("Version cannot be empty")
        return v.strip()
```

**New Response Schema:**

```python
class TemplateVersionIngestResponse(BaseModel):
    """Schema for version ingestion response."""

    template_id: int
    version_id: int = Field(..., description="New version ID for navigation")
    version_number: str
    change_summary: Optional[str] = None
    file_path: str
    file_size_bytes: int
    field_count: int
    is_current: bool = True
    message: str = "Version ingested successfully"
```

**New Template Names Schema:**

```python
class TemplateNameItem(BaseModel):
    """Lightweight template item for selectors."""

    id: int
    name: str
    current_version: str

class TemplateNamesResponse(BaseModel):
    """Response for template names endpoint."""

    items: List[TemplateNameItem]
    total: int
```

### Frontend Architecture

#### 1. UI Component Refactoring

**File:** `frontend/src/pages/TemplateAnalyzePage.tsx` (or equivalent)

**Button Changes:**

- Rename existing button from "Save as Initial Version" to "Save New Template"
- Add new button "Save New Version"
- Both buttons should be visually distinct but equal in hierarchy
- Position buttons side-by-side or stacked depending on layout

**Button States:**

- Both buttons disabled until PDF analysis completes successfully
- Show loading state during save operation
- Display success/error messages appropriately

#### 2. Version Upload Modal Component

**New Component:** `VersionUploadModal.tsx`

**Props:**

```typescript
interface VersionUploadModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (versionId: number) => void;
  analysisData: AnalysisResponse; // Current PDF analysis results
  pdfFile: File; // Current uploaded PDF file
}
```

**UI Elements:**

1. **Template Selector**

   - Component: Searchable dropdown (combobox)
   - Data Source: GET `/api/v1/templates/names`
   - Display: Template name with current version in gray
   - Search: Filter by name as user types
   - Required field with validation

2. **Version Input**

   - Component: Text input
   - Max length: 50 characters
   - Required field with validation
   - Placeholder: "e.g., 2024-Q2, v2.0, 2024-10-26"

3. **Change Summary Textarea**

   - Component: Multi-line textarea
   - Rows: 4-6
   - Optional field
   - Placeholder: "Describe what changed in this version..."
   - Character count indicator (optional)

4. **SEPE URL Input**

   - Component: Text input (URL type)
   - Optional field
   - Validation: Must be valid URL if provided
   - Placeholder: "https://www.sepe.es/..."

5. **Action Buttons**
   - Cancel: Close modal without saving
   - Save: Submit form with validation

**Validation:**

- Template must be selected
- Version must not be empty
- SEPE URL must be valid if provided
- Show inline error messages

**API Call:**

```typescript
POST /api/v1/templates/ingest/version
Content-Type: multipart/form-data

FormData:
  - file: File (PDF)
  - template_id: number
  - version: string
  - change_summary: string (optional)
  - sepe_url: string (optional)
```

**Success Handling:**

- Close modal
- Show success toast/notification
- Redirect to version detail page: `/templates/versions/{version_id}`

**Error Handling:**

- Display error message in modal
- Keep modal open for retry
- Specific error messages for different failure types

#### 3. API Service Functions

**File:** `frontend/src/services/api.ts` (or equivalent)

**New Functions:**

```typescript
export async function getTemplateNames(params?: {
  search?: string;
  limit?: number;
  sort_by?: string;
  sort_order?: string;
}): Promise<TemplateNamesResponse> {
  // Implementation
}

export async function ingestTemplateVersion(
  file: File,
  data: {
    template_id: number;
    version: string;
    change_summary?: string;
    sepe_url?: string;
  }
): Promise<TemplateVersionIngestResponse> {
  // Implementation with FormData
}
```

#### 4. TypeScript Types

**File:** `frontend/src/types/template.ts` (or equivalent)

```typescript
export interface TemplateNameItem {
  id: number;
  name: string;
  current_version: string;
}

export interface TemplateNamesResponse {
  items: TemplateNameItem[];
  total: number;
}

export interface TemplateVersionIngestRequest {
  template_id: number;
  version: string;
  change_summary?: string;
  sepe_url?: string;
}

export interface TemplateVersionIngestResponse {
  template_id: number;
  version_id: number;
  version_number: string;
  change_summary?: string;
  file_path: string;
  file_size_bytes: number;
  field_count: number;
  is_current: boolean;
  message: string;
}
```

### Database Considerations

**No Schema Changes Required** - All necessary tables and columns already exist from previous version refactoring (spec 2025-10-26-01-database-version-refactor):

- `pdf_templates` table has `current_version` field
- `template_versions` table has all required fields:
  - `template_id` (FK)
  - `version_number`
  - `change_summary`
  - `is_current`
  - `file_path`
  - `file_size_bytes`
  - `field_count`
  - `sepe_url`
  - PDF metadata fields
- `template_fields` table links to `version_id`

**Important Transaction Logic:**
The version ingestion must ensure atomicity:

1. All existing versions marked `is_current = False`
2. New version created with `is_current = True`
3. Template record updated with new `current_version`
4. All operations in single transaction

### Performance Considerations

1. **Template Names Query:**

   - Use indexed query on `pdf_templates.name`
   - Limit to 500 results maximum
   - Add pagination if needed in future

2. **File Upload:**

   - Stream file upload to avoid memory issues
   - Validate file size before processing
   - Use async file operations

3. **Field Extraction:**

   - Bulk insert fields in single query
   - Use prepared statements for efficiency

4. **Frontend Loading States:**
   - Show loading spinner during template names fetch
   - Debounce search input (300ms)
   - Cache template names for session

### Security Considerations

1. **Authentication:**

   - All endpoints require valid JWT token
   - Verify token on every request

2. **Authorization (Future Enhancement):**

   - Consider restricting version creation to template owners
   - Add permission check in service layer

3. **File Validation:**

   - Verify PDF file type and extension
   - Check file size limits
   - Validate file is not malicious

4. **Input Sanitization:**
   - Sanitize all text inputs
   - Validate URL format for SEPE URL
   - Prevent SQL injection through ORM

### Code Style Conventions

**Backend (Python):**

- Use `snake_case` for all variables, functions, parameters
- Strict type hints on all functions
- Follow PEP 8 formatting
- Use async/await for I/O operations
- Comprehensive error logging

**Frontend (React/TypeScript):**

- Use `camelCase` for variables and functions
- Use `PascalCase` for components and types
- Strict TypeScript types, no `any`
- Functional components with hooks
- Proper error boundaries

### Testing Requirements

**Backend Tests:**

1. Test version ingestion endpoint with valid data
2. Test template_id validation (404 for non-existent)
3. Test version flag updates (is_current logic)
4. Test transaction rollback on failure
5. Test file cleanup on error

**Frontend Tests:**

1. Test modal opens and closes correctly
2. Test template selector loads and filters
3. Test form validation
4. Test API error handling
5. Test success redirect

**Integration Tests:**

1. End-to-end version upload flow
2. Verify database state after ingestion
3. Verify file system state
4. Test concurrent version uploads

## External Dependencies

No new external dependencies required. All functionality can be implemented with existing libraries:

**Backend:**

- FastAPI (routing)
- SQLAlchemy (ORM)
- Pydantic (validation)
- PyPDF2/pdfplumber (PDF analysis) - already in use

**Frontend:**

- React (UI framework)
- React Router (navigation)
- Axios (HTTP client) or Fetch API
- Existing UI component library for modal and form controls
