# Technical Specification - Template Comparison Feature

## Backend Architecture

### 1. Database Schema (Existing - No Changes Required)

The comparison will use existing tables:
- `template_versions`: Version metadata
- `template_fields`: Field details for each version

### 2. Pydantic Schemas

#### ComparisonRequest
```python
class ComparisonRequest(BaseModel):
    source_version_id: int = Field(..., gt=0, description="Source version ID to compare from")
    target_version_id: int = Field(..., gt=0, description="Target version ID to compare to")
    
    @model_validator(mode='after')
    def validate_different_versions(self) -> 'ComparisonRequest':
        if self.source_version_id == self.target_version_id:
            raise ValueError("Source and target versions must be different")
        return self
```

#### GlobalMetrics
```python
class GlobalMetrics(BaseModel):
    source_version_number: str
    target_version_number: str
    source_page_count: int
    target_page_count: int
    page_count_changed: bool
    source_field_count: int
    target_field_count: int
    field_count_changed: bool
    fields_added: int
    fields_removed: int
    fields_modified: int
    fields_unchanged: int
    modification_percentage: float = Field(..., description="Percentage of fields that changed")
    source_created_at: datetime
    target_created_at: datetime
```

#### FieldChange
```python
class FieldChangeStatus(str, Enum):
    ADDED = "ADDED"
    REMOVED = "REMOVED"
    MODIFIED = "MODIFIED"
    UNCHANGED = "UNCHANGED"

class DiffStatus(str, Enum):
    EQUAL = "EQUAL"
    DIFFERENT = "DIFFERENT"
    NOT_APPLICABLE = "NOT_APPLICABLE"

class FieldChange(BaseModel):
    field_id: str
    status: FieldChangeStatus
    field_type: Optional[str] = None
    source_page_number: Optional[int] = None
    target_page_number: Optional[int] = None
    page_number_changed: bool
    near_text_diff: DiffStatus
    source_near_text: Optional[str] = None
    target_near_text: Optional[str] = None
    value_options_diff: DiffStatus
    source_value_options: Optional[List[str]] = None
    target_value_options: Optional[List[str]] = None
    position_change: DiffStatus
    source_position: Optional[dict] = None  # {x0, y0, x1, y1}
    target_position: Optional[dict] = None
```

#### ComparisonResult
```python
class ComparisonResult(BaseModel):
    source_version_id: int
    target_version_id: int
    global_metrics: GlobalMetrics
    field_changes: List[FieldChange]
    analyzed_at: datetime = Field(default_factory=datetime.utcnow)
```

### 3. Comparison Service Logic

#### ComparisonService Class

```python
class ComparisonService:
    def __init__(self, db: Session):
        self.db = db
    
    def compare_versions(
        self,
        source_version_id: int,
        target_version_id: int
    ) -> ComparisonResult:
        """
        Compare two template versions field-by-field.
        
        Steps:
        1. Fetch both versions and validate they exist
        2. Fetch all fields for both versions
        3. Calculate global metrics
        4. Perform field-by-field comparison
        5. Return structured comparison result
        """
        # Step 1: Fetch versions
        source_version = self._get_version(source_version_id)
        target_version = self._get_version(target_version_id)
        
        # Step 2: Fetch fields
        source_fields = self._get_version_fields(source_version_id)
        target_fields = self._get_version_fields(target_version_id)
        
        # Step 3: Calculate metrics
        global_metrics = self._calculate_global_metrics(
            source_version, target_version,
            source_fields, target_fields
        )
        
        # Step 4: Compare fields
        field_changes = self._compare_fields(source_fields, target_fields)
        
        return ComparisonResult(
            source_version_id=source_version_id,
            target_version_id=target_version_id,
            global_metrics=global_metrics,
            field_changes=field_changes
        )
    
    def _get_version(self, version_id: int) -> TemplateVersion:
        """Fetch version or raise 404"""
        
    def _get_version_fields(self, version_id: int) -> List[TemplateField]:
        """Fetch all fields for a version"""
        
    def _calculate_global_metrics(
        self,
        source_version: TemplateVersion,
        target_version: TemplateVersion,
        source_fields: List[TemplateField],
        target_fields: List[TemplateField]
    ) -> GlobalMetrics:
        """Calculate high-level comparison metrics"""
        
    def _compare_fields(
        self,
        source_fields: List[TemplateField],
        target_fields: List[TemplateField]
    ) -> List[FieldChange]:
        """
        Perform field-by-field comparison.
        
        Algorithm:
        1. Create dictionaries indexed by field_id
        2. Find added fields (in target, not in source)
        3. Find removed fields (in source, not in target)
        4. Find common fields and check for modifications
        5. Return sorted list of changes
        """
        
    def _compare_field_attributes(
        self,
        source_field: TemplateField,
        target_field: TemplateField
    ) -> FieldChange:
        """
        Compare individual field attributes.
        
        Compares:
        - page_number
        - near_text
        - value_options (list comparison)
        - position_data (coordinate comparison with tolerance)
        """
```

#### Position Comparison Logic

```python
def _compare_positions(
    self,
    source_pos: Optional[dict],
    target_pos: Optional[dict],
    tolerance: float = 5.0  # pixels
) -> DiffStatus:
    """
    Compare field positions with tolerance.
    
    Considers positions equal if all coordinates are within tolerance.
    """
    if source_pos is None and target_pos is None:
        return DiffStatus.NOT_APPLICABLE
    
    if source_pos is None or target_pos is None:
        return DiffStatus.DIFFERENT
    
    # Compare each coordinate with tolerance
    for key in ['x0', 'y0', 'x1', 'y1']:
        if abs(source_pos.get(key, 0) - target_pos.get(key, 0)) > tolerance:
            return DiffStatus.DIFFERENT
    
    return DiffStatus.EQUAL
```

### 4. API Endpoint

#### Router: comparison.py

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

router = APIRouter()

@router.post(
    "/analyze",
    response_model=ComparisonResult,
    status_code=status.HTTP_200_OK,
    summary="Analyze Template Version Differences",
    description="""
    Compare two template versions field-by-field.
    
    This endpoint performs an in-memory comparison using data from the database.
    It identifies added, removed, and modified fields, and calculates global metrics.
    
    **Use Case:**
    When SEPE publishes a new version of a form, administrators need to understand
    what has changed to update documentation, training materials, and integration code.
    
    **Validation:**
    - Both version IDs must exist
    - Version IDs must be different
    - User must be authenticated
    """,
    responses={
        200: {
            "description": "Comparison completed successfully",
            "content": {
                "application/json": {
                    "example": {
                        "source_version_id": 1,
                        "target_version_id": 2,
                        "global_metrics": {
                            "source_version_number": "2024-Q1",
                            "target_version_number": "2024-Q2",
                            "source_page_count": 5,
                            "target_page_count": 6,
                            "page_count_changed": True,
                            "source_field_count": 48,
                            "target_field_count": 52,
                            "field_count_changed": True,
                            "fields_added": 4,
                            "fields_removed": 0,
                            "fields_modified": 3,
                            "fields_unchanged": 45,
                            "modification_percentage": 14.58
                        },
                        "field_changes": [
                            {
                                "field_id": "NEW_FIELD_01",
                                "status": "ADDED",
                                "field_type": "text",
                                "target_page_number": 6,
                                "near_text_diff": "NOT_APPLICABLE"
                            }
                        ]
                    }
                }
            }
        },
        400: {"description": "Validation error (same version IDs)"},
        401: {"description": "Not authenticated"},
        404: {"description": "One or both versions not found"},
        422: {"description": "Invalid request parameters"}
    },
    tags=["Comparisons"]
)
async def analyze_comparison(
    request: ComparisonRequest,
    current_user: User = Depends(get_current_active_user),
    db: Session = Depends(get_db)
) -> ComparisonResult:
    """Analyze differences between two template versions."""
    
    try:
        comparison_service = ComparisonService(db)
        result = comparison_service.compare_versions(
            source_version_id=request.source_version_id,
            target_version_id=request.target_version_id
        )
        return result
        
    except ValueError as e:
        # Handle "not found" or validation errors
        if "not found" in str(e).lower():
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail=str(e)
            )
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail=str(e)
        )
    
    except Exception as e:
        logger.error(f"Comparison analysis error: {str(e)}", exc_info=True)
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to analyze comparison"
        )
```

### 5. Code Conventions

- Follow PEP 8 style guide
- Use `snake_case` for variables and functions
- Use type hints throughout
- Comprehensive docstrings for all public methods
- Use SQLAlchemy for all database queries
- Handle errors gracefully with specific error messages
- Log all errors for debugging
- Write unit tests for all service methods

## Frontend Architecture

### 1. TypeScript Types

```typescript
// Comparison types
export type FieldChangeStatus = 'ADDED' | 'REMOVED' | 'MODIFIED' | 'UNCHANGED';
export type DiffStatus = 'EQUAL' | 'DIFFERENT' | 'NOT_APPLICABLE';

export interface ComparisonRequest {
  source_version_id: number;
  target_version_id: number;
}

export interface GlobalMetrics {
  source_version_number: string;
  target_version_number: string;
  source_page_count: number;
  target_page_count: number;
  page_count_changed: boolean;
  source_field_count: number;
  target_field_count: number;
  field_count_changed: boolean;
  fields_added: number;
  fields_removed: number;
  fields_modified: number;
  fields_unchanged: number;
  modification_percentage: number;
  source_created_at: string;
  target_created_at: string;
}

export interface FieldChange {
  field_id: string;
  status: FieldChangeStatus;
  field_type?: string;
  source_page_number?: number;
  target_page_number?: number;
  page_number_changed: boolean;
  near_text_diff: DiffStatus;
  source_near_text?: string;
  target_near_text?: string;
  value_options_diff: DiffStatus;
  source_value_options?: string[];
  target_value_options?: string[];
  position_change: DiffStatus;
  source_position?: { x0: number; y0: number; x1: number; y1: number };
  target_position?: { x0: number; y0: number; x1: number; y1: number };
}

export interface ComparisonResult {
  source_version_id: number;
  target_version_id: number;
  global_metrics: GlobalMetrics;
  field_changes: FieldChange[];
  analyzed_at: string;
}
```

### 2. API Service Method

```typescript
// In templatesService or new comparisonsService
async analyzeComparison(
  request: ComparisonRequest
): Promise<ComparisonResult> {
  return apiService.post<ComparisonResult>(
    '/comparisons/analyze',
    request
  );
}
```

### 3. Component Structure

#### CreateComparisonPage.tsx

**State Management:**
- `sourceTemplateId`: Selected source template
- `sourceVersionId`: Selected source version
- `targetTemplateId`: Selected target template
- `targetVersionId`: Selected target version
- `comparisonResult`: API response data
- `isAnalyzing`: Loading state
- `error`: Error message
- `fieldFilter`: Current filter ('ALL', 'ADDED', 'REMOVED', 'MODIFIED')

**UI Sections:**
1. **Selection Form**
   - Two-column layout (Source | Target)
   - Template selector (dropdown)
   - Version selector (dropdown, cascading from template)
   - Validation message if versions are identical
   - "Execute Comparison" button

2. **Global Metrics Cards**
   - Page Count comparison
   - Field Count comparison
   - Modification statistics
   - Visual indicators for changes

3. **Field Changes Table**
   - Filter buttons (All, Added, Removed, Modified)
   - Table columns: Field ID, Status, Source Page, Target Page, Near Text Diff, Value Options Diff, Position Change
   - Color coding by status:
     - Green: ADDED
     - Red: REMOVED
     - Orange: MODIFIED
     - Gray: UNCHANGED
   - Expandable rows for detailed diff information

### 4. Component Styling

- Use Tailwind CSS for consistent styling
- Responsive design (mobile, tablet, desktop)
- Dark mode support
- Accessibility features (ARIA labels, keyboard navigation)
- Loading states with spinners
- Empty states with helpful messages

## Testing Strategy

### Backend Tests

1. **Unit Tests - ComparisonService**
   - Test field comparison logic
   - Test position comparison with tolerance
   - Test global metrics calculation
   - Test handling of added/removed/modified fields
   - Test error cases (version not found)

2. **Integration Tests - API Endpoint**
   - Test successful comparison
   - Test authentication requirement
   - Test validation (same version IDs)
   - Test 404 for non-existent versions
   - Test error handling

### Frontend Tests

1. **Component Tests - CreateComparisonPage**
   - Test form rendering
   - Test template/version selection
   - Test validation message display
   - Test comparison execution
   - Test results display
   - Test filtering functionality

2. **Integration Tests**
   - Test full comparison workflow
   - Test error scenarios
   - Test loading states

## Performance Considerations

- Database queries optimized with proper indexing
- In-memory comparison for speed
- Pagination for large field lists (if > 100 fields)
- Lazy loading of detailed diff information
- Caching of template/version lists

## Security Considerations

- Authentication required for all endpoints
- Validate user has access to templates being compared
- Sanitize all user inputs
- Rate limiting on comparison endpoint
- SQL injection prevention via ORM

