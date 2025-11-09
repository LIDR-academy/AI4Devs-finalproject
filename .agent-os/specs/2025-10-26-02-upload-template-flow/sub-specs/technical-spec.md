# Technical Specification - Upload Template Flow Refactoring

## Architecture Overview

This feature refactors the template upload flow to integrate the analysis page into the main application navigation and adds a success confirmation page. The flow will be:

```
User clicks "Upload Template"
  → Navigate to /analyze (with layout/nav)
  → User uploads and analyzes PDF
  → User clicks "Save as Initial Version"
  → POST /api/v1/templates/ingest
  → Redirect to /templates/created/:versionId
  → Fetch version details from GET /api/v1/templates/versions/:versionId
  → Display success page with all details
```

## Frontend Architecture

### 1. Routing Changes (App.tsx)

**Current Structure:**

```typescript
// Standalone route without layout
<Route path="/analyze" element={<TemplateAnalyzePage />} />
```

**New Structure:**

```typescript
// Inside protected routes with layout
<Route path="/analyze" element={<TemplateAnalyzePage />} />
<Route path="/templates/created/:versionId" element={<TemplateCreatedPage />} />
```

**Impact:**

- `/analyze` will now show the sidebar navigation
- Users can navigate to other pages while on analyze
- Consistent UX across all pages

### 2. Navigation Component Update

**File:** `frontend/src/components/Layout/Sidebar.tsx` (or equivalent)

**Changes:**

- Update "Upload Template" menu item `href` from `/upload` to `/analyze`
- Ensure proper active state highlighting for `/analyze` route

**Code Example:**

```typescript
{
  name: 'Upload Template',
  href: '/analyze',  // Changed from /upload
  icon: UploadIcon,
  current: pathname === '/analyze'
}
```

### 3. TemplateAnalyzePage Modifications

**File:** `frontend/src/pages/TemplateAnalyzePage/TemplateAnalyzePage.tsx`

**Current Save Handler:**

```typescript
const handleSaveTemplate = async (data) => {
  // ... save logic ...
  // Currently just closes modal
};
```

**New Save Handler:**

```typescript
const handleSaveTemplate = async (data) => {
  try {
    const response = await templatesService.ingestTemplate(data);
    // Redirect to success page with version ID
    navigate(`/templates/created/${response.id}`);
  } catch (error) {
    // Handle error
  }
};
```

**Implementation Details:**

- Import `useNavigate` from `react-router-dom`
- Extract version ID from ingestion response
- Redirect to `/templates/created/:versionId` on success
- Keep error handling in modal for failed saves

### 4. New Component: TemplateCreatedPage

**File:** `frontend/src/pages/templates/TemplateCreatedPage.tsx`

**Component Structure:**

```typescript
interface TemplateCreatedPageProps {
  className?: string;
}

const TemplateCreatedPage: React.FC<TemplateCreatedPageProps> = ({
  className,
}) => {
  const { versionId } = useParams<{ versionId: string }>();
  const navigate = useNavigate();

  // Fetch version details
  const { data, loading, error } = useTemplateVersion(versionId);

  // Render success page
  return (
    <div className="template-created-page">
      {/* Success Message */}
      {/* Template Information */}
      {/* Version Information */}
      {/* Action Buttons */}
    </div>
  );
};
```

**Display Sections:**

1. **Success Message:**

   - Green checkmark icon
   - "Template Created Successfully!" heading
   - Subtext: "Your template has been analyzed and saved"

2. **Template Information Card:**

   - Template Name
   - Current Version
   - Comment (if provided)
   - Upload Date
   - Uploaded By

3. **Version Details Card:**

   - PDF Metadata:
     - Title, Author, Subject
     - Creation Date, Modification Date
   - File Information:
     - Page Count
     - Field Count
     - File Size (formatted in MB)

4. **Action Buttons:**
   - **Download PDF:** Downloads the original PDF file
   - **View Template:** Navigate to `/templates/:templateId`
   - **Upload Another:** Navigate back to `/analyze`

**Loading & Error States:**

- Show skeleton loading while fetching data
- Display error message if version not found
- Retry button for failed requests

### 5. New Service Method

**File:** `frontend/src/services/templates.service.ts`

**New Method:**

```typescript
class TemplatesService {
  // ... existing methods ...

  /**
   * Get template version by ID with full details
   */
  async getVersionById(versionId: number): Promise<TemplateVersionDetail> {
    return apiService.get<TemplateVersionDetail>(
      `/templates/versions/${versionId}`
    );
  }
}
```

### 6. TypeScript Type Definitions

**File:** `frontend/src/types/templates.types.ts`

**New Interface:**

```typescript
/**
 * Detailed template version information for success page
 * Includes both version data and associated template data
 */
export interface TemplateVersionDetail {
  // Version information
  id: number;
  version_number: string;
  change_summary: string | null;
  is_current: boolean;
  created_at: string;

  // File information (version-specific)
  file_path: string;
  file_size_bytes: number;
  field_count: number;
  sepe_url: string | null;

  // PDF metadata
  title: string | null;
  author: string | null;
  subject: string | null;
  creation_date: string | null;
  modification_date: string | null;
  page_count: number;

  // Associated template information
  template: {
    id: number;
    name: string;
    current_version: string;
    comment: string | null;
    uploaded_by: number | null;
    created_at: string;
  };
}
```

### 7. Custom Hook (Optional)

**File:** `frontend/src/hooks/useTemplateVersion.ts`

**Implementation:**

```typescript
export const useTemplateVersion = (versionId: string | undefined) => {
  const [data, setData] = useState<TemplateVersionDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!versionId) return;

    const fetchVersion = async () => {
      try {
        setLoading(true);
        const response = await templatesService.getVersionById(
          Number(versionId)
        );
        setData(response);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchVersion();
  }, [versionId]);

  return { data, loading, error };
};
```

## Backend Architecture

### New Endpoint: Get Version by ID

**File:** `backend/app/api/v1/endpoints/templates.py`

**Endpoint Definition:**

```python
@router.get(
    "/versions/{version_id}",
    response_model=TemplateVersionDetailResponse,
    summary="Get Template Version by ID",
    description="""
    Retrieve detailed information about a specific template version.

    This endpoint returns:
    - Complete version metadata (file info, PDF metadata)
    - Associated template information
    - Useful for success pages and version detail views

    **Authentication Required:** Valid JWT token
    """,
    tags=["Templates - Versions"]
)
def get_version_by_id(
    version_id: int,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> Any:
    """
    Get detailed template version information by ID.

    Args:
        version_id: Unique version identifier
        current_user: Authenticated user
        db: Database session

    Returns:
        TemplateVersionDetailResponse: Complete version data with template info

    Raises:
        HTTPException 404: If version not found
        HTTPException 403: If user lacks permission
    """
    # Query version with joined template
    version = db.query(TemplateVersion).filter(
        TemplateVersion.id == version_id
    ).first()

    if not version:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Template version not found"
        )

    # Get associated template
    template = version.template

    if not template:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="Associated template not found"
        )

    # Check permissions (optional - implement if needed)
    # if template.uploaded_by != current_user.id and not current_user.is_superuser:
    #     raise HTTPException(
    #         status_code=status.HTTP_403_FORBIDDEN,
    #         detail="Not enough permissions to view this version"
    #     )

    return TemplateVersionDetailResponse(
        # Version data
        id=version.id,
        version_number=version.version_number,
        change_summary=version.change_summary,
        is_current=version.is_current,
        created_at=version.created_at,
        # File information
        file_path=version.file_path,
        file_size_bytes=version.file_size_bytes,
        field_count=version.field_count,
        sepe_url=version.sepe_url,
        # PDF metadata
        title=version.title,
        author=version.author,
        subject=version.subject,
        creation_date=version.creation_date,
        modification_date=version.modification_date,
        page_count=version.page_count,
        # Template information
        template=TemplateBasicInfo(
            id=template.id,
            name=template.name,
            current_version=template.current_version,
            comment=template.comment,
            uploaded_by=template.uploaded_by,
            created_at=template.created_at
        )
    )
```

### New Response Schemas

**File:** `backend/app/schemas/template.py`

**New Schemas:**

```python
class TemplateBasicInfo(BaseModel):
    """Basic template information for version detail response."""
    id: int
    name: str
    current_version: str
    comment: Optional[str] = None
    uploaded_by: Optional[int] = None
    created_at: datetime

    class Config:
        from_attributes = True


class TemplateVersionDetailResponse(BaseModel):
    """
    Detailed template version response with associated template info.

    Used for success pages and version detail views where we need
    both version and template information in one response.
    """
    # Version information
    id: int
    version_number: str
    change_summary: Optional[str] = None
    is_current: bool
    created_at: datetime

    # File information (version-specific)
    file_path: str
    file_size_bytes: int
    field_count: int
    sepe_url: Optional[str] = None

    # PDF metadata
    title: Optional[str] = None
    author: Optional[str] = None
    subject: Optional[str] = None
    creation_date: Optional[datetime] = None
    modification_date: Optional[datetime] = None
    page_count: int

    # Associated template
    template: TemplateBasicInfo

    class Config:
        from_attributes = True
```

## Testing Strategy

### Frontend Tests

**1. TemplateCreatedPage Component Tests**

- Renders loading state while fetching data
- Displays success message and version details when loaded
- Shows error message when version not found
- Download button triggers correct download URL
- View Template button navigates to correct route
- Upload Another button navigates to /analyze

**2. Integration Tests**

- Navigate from analyze page to success page after save
- Success page correctly displays data from API
- Back navigation works correctly

**3. Service Tests**

- getVersionById method calls correct API endpoint
- Handles 404 responses appropriately
- Returns correctly typed data

### Backend Tests

**1. Endpoint Tests**

- Returns 200 with correct data for valid version ID
- Returns 404 for non-existent version
- Returns 401 for unauthenticated requests
- Includes template information in response
- All fields are correctly populated

**2. Schema Tests**

- TemplateVersionDetailResponse validates correctly
- All required fields are present
- Optional fields handle null values

## Performance Considerations

1. **Single API Call:** The new endpoint returns both version and template data in one request
2. **Eager Loading:** Use SQLAlchemy joins to avoid N+1 queries
3. **Caching:** Consider caching version details (they don't change often)
4. **Response Size:** The response is comprehensive but not excessive

## Security Considerations

1. **Authentication:** Endpoint requires valid JWT token
2. **Authorization:** Consider adding ownership checks if needed
3. **Data Validation:** Validate version_id parameter
4. **Error Messages:** Don't leak sensitive information in errors

## Accessibility

1. **Success Icon:** Provide aria-label for screen readers
2. **Headings:** Use semantic heading hierarchy
3. **Navigation:** Ensure keyboard navigation works for all buttons
4. **Focus Management:** Focus on heading when page loads
5. **Loading States:** Announce loading status to screen readers

## Browser Compatibility

- Support modern browsers (Chrome, Firefox, Safari, Edge)
- Responsive design for mobile, tablet, desktop
- Graceful degradation for older browsers
- Test on various viewport sizes
