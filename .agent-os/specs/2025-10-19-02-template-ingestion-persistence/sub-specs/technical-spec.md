# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-10-19-02-template-ingestion-persistence/spec.md

## Technical Requirements

### Backend Architecture

#### 1. Router Separation (SOLID - Single Responsibility Principle)

**File Structure:**

```
backend/app/api/v1/endpoints/
├── templates.py      # CRUD operations only (GET, PUT, DELETE)
└── ingest.py         # New file for ingestion logic (POST /ingest)
```

**Responsibilities:**

- `templates.py`: List templates, get template details, update template metadata, delete templates, get template versions
- `ingest.py`: Handle new template ingestion (file upload + analysis + persistence)

#### 2. Ingestion Endpoint Specification

**Route:** `POST /api/v1/templates/ingest`

**Authentication:** Required - Uses `current_user: User = Depends(get_current_active_user)`

**Request Body (multipart/form-data):**

```python
{
    "file": UploadFile,           # Required - PDF file
    "name": str,                  # Required - Template name (max 255 chars)
    "version": str,               # Required - Version identifier (max 50 chars)
    "sepe_url": Optional[str]     # Optional - SEPE source URL (max 1000 chars)
}
```

**Response (201 Created):**

```python
{
    "id": int,                    # Template ID
    "name": str,
    "version": str,
    "file_path": str,             # Container path
    "file_size_bytes": int,
    "field_count": int,
    "checksum": str,              # SHA256 hash
    "message": str
}
```

**Error Responses:**

- `400 Bad Request`: Invalid file format, empty file, no form fields found
- `401 Unauthorized`: No authentication provided
- `413 Payload Too Large`: File exceeds 10MB limit
- `500 Internal Server Error`: Processing failure, database transaction failure

#### 3. Service Layer - TemplateService

**Location:** `backend/app/services/template_service.py` (new file)

**Class:** `TemplateService`

**Core Methods:**

```python
class TemplateService:
    def __init__(self, db: Session):
        self.db = db
        self.pdf_analysis_service = PDFAnalysisService()

    async def ingest_template(
        self,
        file: UploadFile,
        name: str,
        version: str,
        sepe_url: Optional[str],
        user_id: int
    ) -> PDFTemplate:
        """
        Complete template ingestion workflow:
        1. Validate and save file to persistent storage
        2. Calculate file checksum (SHA256)
        3. Analyze PDF using PDFAnalysisService
        4. Create database records transactionally
        """
        pass

    def _save_file(self, file: UploadFile) -> Tuple[str, int, str]:
        """
        Save uploaded file to persistent storage.
        Returns: (file_path, file_size_bytes, checksum)
        """
        pass

    def _extract_pdf_metadata(self, file_path: Path) -> Dict[str, Any]:
        """
        Extract PDF document metadata (title, author, creation_date, etc.)
        """
        pass

    def _create_template_records(
        self,
        name: str,
        version: str,
        file_path: str,
        file_size: int,
        checksum: str,
        sepe_url: Optional[str],
        user_id: int,
        fields: List[TemplateFieldData],
        metadata: Dict[str, Any],
        page_count: int
    ) -> PDFTemplate:
        """
        Create PDFTemplate, TemplateVersion, and TemplateField records
        in a single database transaction.
        """
        pass
```

**File Storage Details:**

- **Storage Location:** `settings.UPLOAD_DIRECTORY` (/app/uploads in container, mapped to backend_uploads volume)
- **Filename Generation:** `{uuid4()}.pdf` for uniqueness
- **Checksum:** SHA256 hash of file content
- **File Path Format:** Absolute container path (e.g., `/app/uploads/{uuid}.pdf`)

#### 4. Pydantic Schema Enhancements

**Location:** `backend/app/schemas/template.py`

**New Schemas:**

```python
class TemplateIngestRequest(BaseModel):
    """Schema for template ingestion request."""
    name: str = Field(..., max_length=255, description="Template name")
    version: str = Field(..., max_length=50, description="Version identifier")
    sepe_url: Optional[str] = Field(None, max_length=1000, description="SEPE source URL")

class TemplateFieldData(BaseModel):
    """Schema matching template_fields table structure."""
    field_id: str = Field(..., max_length=255)
    field_type: str = Field(..., max_length=50)
    raw_type: Optional[str] = Field(None, max_length=50)
    page_number: int = Field(..., ge=1, description="1-indexed page number")
    field_page_order: int = Field(..., ge=0, description="Order within page")
    near_text: Optional[str] = None
    value_options: Optional[List[str]] = None
    position_data: Optional[Dict[str, Any]] = Field(
        None,
        description="JSON data with field position coordinates"
    )

class TemplateIngestResponse(BaseModel):
    """Schema for template ingestion response."""
    id: int
    name: str
    version: str
    file_path: str
    file_size_bytes: int
    field_count: int
    checksum: str
    message: str = "Template ingested successfully"
```

**Schema Mapping:**

The existing `TemplateField` from `pdf_analysis.py` needs to be transformed into `TemplateFieldData`:

```python
# Transformation logic (in TemplateService)
def _transform_analysis_to_field_data(
    self,
    analysis_fields: List[TemplateFieldData],  # From PDFAnalysisService
    position_data_map: Dict[str, Any]
) -> List[TemplateFieldData]:
    """
    Transform PDFAnalysisService output to database-ready TemplateFieldData.
    Add page_number, field_page_order, position_data.
    """
    pass
```

#### 5. Database Transaction Strategy

**Transaction Scope:**

```python
try:
    # Create PDFTemplate record
    template = PDFTemplate(...)
    db.add(template)
    db.flush()  # Get template.id without committing

    # Create TemplateVersion record
    version = TemplateVersion(template_id=template.id, ...)
    db.add(version)
    db.flush()  # Get version.id

    # Bulk insert TemplateField records
    fields = [
        TemplateField(version_id=version.id, ...)
        for field_data in analyzed_fields
    ]
    db.bulk_save_objects(fields)

    # Commit all changes atomically
    db.commit()
    db.refresh(template)
    return template

except Exception as e:
    db.rollback()
    # Clean up uploaded file
    if os.path.exists(file_path):
        os.remove(file_path)
    raise
```

### Frontend Architecture

#### 1. Component Enhancement - TemplateAnalyzePage

**Location:** `frontend/src/pages/TemplateAnalyzePage/TemplateAnalyzePage.tsx`

**New UI Elements:**

1. **Save Button:**

   - Location: Action buttons area (next to "Export Results", "Analyze Another")
   - Label: "Guardar como Versión Inicial"
   - Visibility: Only shown when `uploadState === "success"` and `analysisResults` exists
   - Icon: `Save` from Lucide React
   - Style: Primary button (blue background)

2. **Metadata Modal:**

   - Component: `TemplateSaveModal` (new component)
   - Trigger: Click on "Guardar como Versión Inicial" button
   - Fields:
     - Template Name (required, text input, max 255 chars)
     - Version (required, text input, max 50 chars, placeholder: "e.g., 1.0, 2023-Q1")
     - SEPE URL (optional, URL input, max 1000 chars)
   - Actions:
     - Cancel (closes modal)
     - Save (validates and calls API)
   - Validation:
     - Required field validation
     - Length validation
     - URL format validation for SEPE URL

3. **Save State Management:**

```typescript
// Add to existing state in useAnalyzePageState hook
interface AnalyzePageState {
  // ... existing fields
  saveState: "idle" | "saving" | "success" | "error";
  saveError: string | null;
  showSaveModal: boolean;
}
```

#### 2. New Frontend Component - TemplateSaveModal

**Location:** `frontend/src/components/TemplateSaveModal/TemplateSaveModal.tsx`

**Props:**

```typescript
interface TemplateSaveModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TemplateSaveData) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

interface TemplateSaveData {
  name: string;
  version: string;
  sepe_url?: string;
}
```

**Features:**

- Form validation with real-time feedback
- Loading state during API call
- Error display for API failures
- Accessibility compliant (ARIA labels, keyboard navigation)
- Mobile responsive design

#### 3. API Service - Template Ingestion

**Location:** `frontend/src/services/templateService.ts` (new file)

**Function:**

```typescript
export interface TemplateIngestRequest {
  file: File;
  name: string;
  version: string;
  sepe_url?: string;
}

export interface TemplateIngestResponse {
  id: number;
  name: string;
  version: string;
  file_path: string;
  file_size_bytes: number;
  field_count: number;
  checksum: string;
  message: string;
}

export const ingestTemplate = async (
  request: TemplateIngestRequest
): Promise<TemplateIngestResponse> => {
  const formData = new FormData();
  formData.append("file", request.file);
  formData.append("name", request.name);
  formData.append("version", request.version);
  if (request.sepe_url) {
    formData.append("sepe_url", request.sepe_url);
  }

  const response = await fetch("/api/v1/templates/ingest", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${getAuthToken()}`,
    },
    body: formData,
  });

  if (!response.ok) {
    const error = await response.json();
    throw new AnalysisError(error.detail, response.status);
  }

  return await response.json();
};
```

#### 4. User Flow Integration

**Complete Flow:**

```
1. User uploads PDF → Analysis starts
2. Analysis completes → Show results table + "Guardar como Versión Inicial" button
3. User clicks save button → Open TemplateSaveModal
4. User fills metadata form → Validation feedback
5. User clicks Save in modal → Call ingestTemplate API
6. API succeeds → Close modal, show success toast, optionally redirect to template details
7. API fails → Show error in modal, allow retry
```

#### 5. State Management Updates

**Hook Enhancement:** `usePDFAnalysis.ts`

```typescript
// Add save-related state and handlers
const [showSaveModal, setShowSaveModal] = useState(false);
const [saveState, setSaveState] = useState<
  "idle" | "saving" | "success" | "error"
>("idle");
const [saveError, setSaveError] = useState<string | null>(null);

const handleSaveTemplate = async (metadata: TemplateSaveData) => {
  if (!selectedFile || !analysisResults) return;

  try {
    setSaveState("saving");
    setSaveError(null);

    const response = await ingestTemplate({
      file: selectedFile,
      name: metadata.name,
      version: metadata.version,
      sepe_url: metadata.sepe_url,
    });

    setSaveState("success");
    setShowSaveModal(false);

    // Show success notification
    toast.success(`Template "${metadata.name}" saved successfully!`);

    // Optional: Redirect to template details page
    // navigate(`/templates/${response.id}`);
  } catch (error) {
    setSaveState("error");
    setSaveError(
      error instanceof Error ? error.message : "Failed to save template"
    );
  }
};

const handleOpenSaveModal = () => {
  setShowSaveModal(true);
  setSaveState("idle");
  setSaveError(null);
};

const handleCloseSaveModal = () => {
  setShowSaveModal(false);
  setSaveError(null);
};
```

### Performance Considerations

1. **File Upload:** Use streaming for large files to avoid memory issues
2. **Database Bulk Insert:** Use `bulk_save_objects` for efficient field insertion
3. **Transaction Optimization:** Single transaction for all related records to ensure consistency
4. **Checksum Calculation:** Stream-based SHA256 to handle large files efficiently
5. **Frontend Loading States:** Prevent duplicate submissions with proper loading state management

### Error Handling

**Backend Error Scenarios:**

- Invalid PDF file → 400 with descriptive message
- No form fields found → 400 with "No AcroForm fields found"
- File too large → 413 with size limit message
- Unauthorized → 401 with authentication required message
- Database transaction failure → 500 with rollback and file cleanup
- File system write failure → 500 with appropriate error message

**Frontend Error Handling:**

- Network errors → Display retry option
- Validation errors → Show inline field errors
- API errors → Display error message in modal
- File upload errors → Clear feedback to user
- Success → Close modal, show success toast, update UI state

### Security Considerations

1. **Authentication:** All ingestion endpoints require valid JWT token
2. **File Validation:** Strict PDF validation before processing
3. **Path Traversal Prevention:** Use secure file path generation with UUID
4. **SQL Injection Prevention:** Use SQLAlchemy ORM with parameterized queries
5. **File Size Limits:** Enforce 10MB limit consistently across frontend and backend
6. **Checksum Verification:** Store SHA256 hash to detect file tampering

## External Dependencies (Conditional)

No new external dependencies are required for this implementation. The spec uses existing libraries:

**Backend:**

- **PyPDF2** - Already in use for PDF analysis
- **pdfplumber** - Already in use for text extraction
- **SQLAlchemy** - Already in use for ORM
- **FastAPI** - Already in use for API framework
- **Pydantic** - Already in use for validation

**Frontend:**

- **React** - Already in use
- **Lucide React** - Already in use for icons
- **TailwindCSS** - Already in use for styling
- **React Hook Form** - May need to add for form management (lightweight, recommended for controlled forms)

### Justification for React Hook Form (if not already present):

- **Purpose:** Simplify form validation and state management in TemplateSaveModal
- **Size:** ~8.5KB gzipped
- **Benefits:** Built-in validation, better performance than controlled components, TypeScript support
- **Alternative:** Can use plain React state if bundle size is a concern, but will require more boilerplate
