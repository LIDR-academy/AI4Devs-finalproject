# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-10-27-01-comparison-persistence/spec.md

## Technical Requirements

### Backend Requirements

#### 1. Database Schema Modifications

**Critical Foreign Key Changes:**
- Modify `comparisons` table to reference `template_versions` instead of `pdf_templates`
- Change `source_template_id` → `source_version_id` (FK to `template_versions.id`)
- Change `target_template_id` → `target_version_id` (FK to `template_versions.id`)
- Update all related relationships and indexes

**New Columns in `comparisons` Table:**
- `modification_percentage` (FLOAT, NOT NULL)
- `fields_added` (INTEGER, NOT NULL, DEFAULT 0)
- `fields_removed` (INTEGER, NOT NULL, DEFAULT 0)
- `fields_modified` (INTEGER, NOT NULL, DEFAULT 0)
- `fields_unchanged` (INTEGER, NOT NULL, DEFAULT 0)

**Enhanced `comparison_fields` Table:**
- Add `field_id` (VARCHAR(255), NOT NULL) - replaces ambiguous `field_name`
- Add `status` (VARCHAR(20), NOT NULL) - stores FieldChangeStatus enum value
- Add `source_page_number` (INTEGER, nullable)
- Add `target_page_number` (INTEGER, nullable)
- Add `page_number_changed` (BOOLEAN, DEFAULT false)
- Add `near_text_diff` (VARCHAR(20)) - stores DiffStatus enum value
- Add `source_near_text` (TEXT, nullable)
- Add `target_near_text` (TEXT, nullable)
- Add `value_options_diff` (VARCHAR(20)) - stores DiffStatus enum value
- Add `source_value_options` (JSONB, nullable)
- Add `target_value_options` (JSONB, nullable)
- Add `position_change` (VARCHAR(20)) - stores DiffStatus enum value
- Add `source_position` (JSONB, nullable) - stores {x0, y0, x1, y1}
- Add `target_position` (JSONB, nullable) - stores {x0, y0, x1, y1}
- Remove obsolete columns: `old_value`, `new_value`, `position_x`, `position_y`, `change_type`

**Indexes:**
- Index on `comparisons.source_version_id`
- Index on `comparisons.target_version_id`
- Index on `comparisons.created_at`
- Index on `comparison_fields.status`
- Index on `comparison_fields.field_id`

#### 2. Pydantic Schemas

**New Schema: `ComparisonSaveRequest`**
```python
class ComparisonSaveRequest(BaseModel):
    """Request to save a comparison result."""
    source_version_id: int
    target_version_id: int
    global_metrics: GlobalMetrics
    field_changes: List[FieldChange]
    
    # Note: analyzed_at is auto-generated on save
```

**New Schema: `ComparisonSummary`**
```python
class ComparisonSummary(BaseModel):
    """Summary of a saved comparison for list views."""
    id: int
    source_version_id: int
    target_version_id: int
    source_version_number: str
    target_version_number: str
    source_template_name: str
    target_template_name: str
    modification_percentage: float
    fields_added: int
    fields_removed: int
    fields_modified: int
    fields_unchanged: int
    created_at: datetime
    created_by: Optional[int]
    
    class Config:
        from_attributes = True
```

**New Schema: `ComparisonListResponse`**
```python
class ComparisonListResponse(BaseModel):
    """Paginated list of saved comparisons."""
    items: List[ComparisonSummary]
    total: int
    page: int
    page_size: int
    total_pages: int
```

**Updated Schema: `ComparisonResult`**
- Add `id: Optional[int]` field to indicate if comparison is saved
- Keep all existing fields

#### 3. Service Layer Methods

**ComparisonService Extensions:**

```python
def save_comparison(
    self,
    user_id: int,
    comparison_result: ComparisonResult
) -> int:
    """
    Save a comparison result to the database.
    
    Args:
        user_id: ID of user saving the comparison
        comparison_result: Complete comparison data from analyze endpoint
    
    Returns:
        int: ID of the created comparison record
    
    Raises:
        ValueError: If source/target versions don't exist
        SQLAlchemyError: If database transaction fails
    
    Implementation:
    1. Begin database transaction
    2. Create Comparison record with global metrics
    3. Create ComparisonField records for each field change
    4. Commit transaction (or rollback on error)
    5. Return comparison ID
    """

def get_comparison(
    self,
    comparison_id: int
) -> ComparisonResult:
    """
    Retrieve a saved comparison by ID.
    
    Args:
        comparison_id: ID of saved comparison
    
    Returns:
        ComparisonResult: Reconstructed comparison data
    
    Raises:
        ValueError: If comparison not found
    
    Implementation:
    1. Fetch Comparison record with eager loading of versions
    2. Fetch all ComparisonField records
    3. Reconstruct GlobalMetrics from comparison record
    4. Reconstruct FieldChange list from comparison_fields
    5. Return ComparisonResult
    """

def list_comparisons(
    self,
    page: int = 1,
    page_size: int = 20,
    sort_by: str = "created_at",
    sort_order: str = "desc",
    search: Optional[str] = None
) -> Tuple[List[ComparisonSummary], int]:
    """
    List saved comparisons with pagination and filtering.
    
    Args:
        page: Page number (1-indexed)
        page_size: Items per page
        sort_by: Field to sort by
        sort_order: 'asc' or 'desc'
        search: Optional search term for template names
    
    Returns:
        Tuple of (list of summaries, total count)
    
    Implementation:
    1. Build query with joins to template_versions and pdf_templates
    2. Apply search filter if provided
    3. Apply sorting
    4. Calculate pagination offset
    5. Execute query with limit/offset
    6. Return results and total count
    """

def comparison_exists(
    self,
    source_version_id: int,
    target_version_id: int
) -> Optional[int]:
    """
    Check if a comparison already exists between two versions.
    
    Args:
        source_version_id: Source version ID
        target_version_id: Target version ID
    
    Returns:
        Optional[int]: Comparison ID if exists, None otherwise
    
    Note: This enables duplicate detection in the UI
    """
```

#### 4. API Endpoints

**POST `/api/v1/comparisons/ingest`**
- Request Body: `ComparisonSaveRequest` (or reuse `ComparisonResult`)
- Response: `{"id": int, "message": "Comparison saved successfully"}`
- Status Codes: 201 (Created), 400 (Bad Request), 401 (Unauthorized), 422 (Validation Error), 500 (Server Error)
- Authentication: Required (JWT)
- Rate Limit: 20 requests per minute per user

**GET `/api/v1/comparisons/{comparison_id}`**
- Path Parameter: `comparison_id` (integer)
- Response: `ComparisonResult` (same schema as `/analyze` endpoint)
- Status Codes: 200 (OK), 401 (Unauthorized), 404 (Not Found), 500 (Server Error)
- Authentication: Required (JWT)
- Caching: Cache response for 5 minutes (comparisons are immutable)

**GET `/api/v1/comparisons`**
- Query Parameters:
  - `page` (integer, default=1, min=1)
  - `page_size` (integer, default=20, min=1, max=100)
  - `sort_by` (string, enum: ["created_at", "modification_percentage"], default="created_at")
  - `sort_order` (string, enum: ["asc", "desc"], default="desc")
  - `search` (string, optional) - searches template names and version numbers
- Response: `ComparisonListResponse`
- Status Codes: 200 (OK), 401 (Unauthorized), 422 (Validation Error), 500 (Server Error)
- Authentication: Required (JWT)

#### 5. Migration Strategy

**Alembic Migration File:**
- Filename: `YYYYMMDD_HHMMSS_add_comparison_persistence.py`
- Operations:
  1. Create backup constraint names for rollback
  2. Drop existing foreign keys on `comparisons` table
  3. Rename columns: `source_template_id` → `source_version_id`, `target_template_id` → `target_version_id`
  4. Add new foreign keys to `template_versions` table
  5. Add new columns to `comparisons` table with defaults
  6. Add new columns to `comparison_fields` table
  7. Create new indexes
  8. Drop obsolete columns from `comparison_fields` (in separate migration if data exists)
  
**Rollback Strategy:**
- Downgrade reverses all operations
- Data migration script provided separately if existing data needs preservation

#### 6. Error Handling

**Service Layer:**
- Use Python `logging` module for all errors
- Wrap database operations in try-except blocks
- Raise custom exceptions: `ComparisonNotFoundError`, `ComparisonSaveError`
- Use descriptive error messages

**API Layer:**
- Return appropriate HTTP status codes
- Provide user-friendly error messages in response body
- Log detailed errors server-side for debugging
- Use FastAPI's `HTTPException` consistently

#### 7. Performance Considerations

**Database:**
- Use eager loading (`joinedload`) for relationships to avoid N+1 queries
- Index frequently queried columns (version IDs, created_at, status)
- Use JSONB for flexible position/options storage with PostgreSQL indexing
- Pagination prevents large result sets from overwhelming the system

**Caching:**
- Cache saved comparison results (immutable data) for 5 minutes
- Cache template/version metadata for 5 minutes
- Use ETags for client-side caching

**Query Optimization:**
- Limit search queries to indexed columns only
- Use ILIKE with indexes for case-insensitive search
- Paginate all list endpoints (max 100 items per page)

### Frontend Requirements

#### 1. Save Comparison Button Component

**Location:** Displayed below GlobalMetricsCard on comparison results page

**Component: `SaveComparisonButton.tsx`**
- Props:
  - `comparisonResult: ComparisonResult` - current comparison data
  - `onSaveSuccess: (comparisonId: number) => void` - callback after save
- State:
  - `isSaving: boolean` - loading state
  - `error: string | null` - error message
  - `savedComparisonId: number | null` - ID after successful save
- Behavior:
  - Disabled if comparison already saved (show "Saved" badge)
  - Show loading spinner during save
  - Display success message with link to saved comparison
  - Display error message on failure
  - Call `comparisonsService.saveComparison()` method

**Styling:**
- Primary button style (green background)
- Icon: Save/Bookmark icon from Lucide
- Loading state: Spinner icon replaces save icon
- Success state: Checkmark icon with "Saved" text
- Responsive: Full width on mobile, auto width on desktop

#### 2. Comparisons List Page

**Route:** `/comparisons`

**Component: `ComparisonsPage.tsx`**
- State:
  - `comparisons: ComparisonSummary[]` - list of comparisons
  - `totalPages: number` - pagination info
  - `currentPage: number`
  - `sortBy: string`
  - `sortOrder: 'asc' | 'desc'`
  - `searchTerm: string`
  - `isLoading: boolean`
  - `error: string | null`

**UI Sections:**
1. **Page Header**
   - Title: "Saved Comparisons"
   - Subtitle: "View and manage all saved template version comparisons"
   - Action: "New Comparison" button (navigates to `/comparisons/create`)

2. **Search and Filters Bar**
   - Search input (debounced, 300ms delay)
   - Sort dropdown (Created Date, Modification %)
   - Sort order toggle (Ascending/Descending)

3. **Comparisons Table**
   - Columns:
     - Source Version (template name + version number)
     - Target Version (template name + version number)
     - Modification % (with progress bar)
     - Changes Summary (+X/-Y/~Z format)
     - Date Saved (relative time + tooltip with exact datetime)
     - Actions (View Details button)
   - Row hover effect
   - Click row to navigate to detail page
   - Empty state: "No comparisons saved yet" with CTA button

4. **Pagination Controls**
   - Previous/Next buttons
   - Page numbers (max 7 visible)
   - Items per page selector (10, 20, 50)
   - Total results counter

**Styling:**
- Responsive table (horizontal scroll on mobile)
- Alternating row colors
- Status badges for change counts (green/red/orange)
- Dark mode support throughout

#### 3. Comparison Detail Page

**Route:** `/comparisons/:id`

**Component: `SavedComparisonPage.tsx`**
- Fetch comparison data on mount using `comparisonsService.getComparison(id)`
- Display loading skeleton while fetching
- Reuse existing components:
  - `GlobalMetricsCard` - for metrics display
  - `ComparisonTable` - for field changes
- Add page header with:
  - Breadcrumb navigation (Home > Comparisons > Detail)
  - Source/Target version info
  - Date saved
  - "View in New Analysis" button (pre-fills comparison form)
- Handle errors (404 if comparison not found)

**State Management:**
- Use React Query or SWR for data fetching and caching
- Handle loading, error, and success states
- Refetch on window focus (optional)

#### 4. API Service Methods

**File: `src/services/comparisons.service.ts`**

```typescript
class ComparisonsService {
  /**
   * Save a comparison result to the database
   */
  async saveComparison(
    comparisonResult: ComparisonResult
  ): Promise<{ id: number; message: string }> {
    return apiService.post('/comparisons/ingest', comparisonResult);
  }

  /**
   * Get a saved comparison by ID
   */
  async getComparison(
    comparisonId: number
  ): Promise<ComparisonResult> {
    return apiService.get(`/comparisons/${comparisonId}`);
  }

  /**
   * List saved comparisons with pagination
   */
  async listComparisons(
    params: {
      page?: number;
      page_size?: number;
      sort_by?: string;
      sort_order?: 'asc' | 'desc';
      search?: string;
    }
  ): Promise<ComparisonListResponse> {
    return apiService.get('/comparisons', { params });
  }

  /**
   * Check if a comparison exists between two versions
   */
  async checkComparisonExists(
    sourceVersionId: number,
    targetVersionId: number
  ): Promise<{ exists: boolean; comparison_id?: number }> {
    return apiService.get('/comparisons/check', {
      params: { source_version_id: sourceVersionId, target_version_id: targetVersionId }
    });
  }
}
```

#### 5. TypeScript Types

**File: `src/types/comparison.types.ts` (additions)**

```typescript
export interface ComparisonSummary {
  id: number;
  source_version_id: number;
  target_version_id: number;
  source_version_number: string;
  target_version_number: string;
  source_template_name: string;
  target_template_name: string;
  modification_percentage: number;
  fields_added: number;
  fields_removed: number;
  fields_modified: number;
  fields_unchanged: number;
  created_at: string;
  created_by: number | null;
}

export interface ComparisonListResponse {
  items: ComparisonSummary[];
  total: number;
  page: number;
  page_size: number;
  total_pages: number;
}

export interface SaveComparisonResponse {
  id: number;
  message: string;
}
```

#### 6. Routing Configuration

**Add to `App.tsx` or router configuration:**
```typescript
<Route path="/comparisons" element={<ComparisonsPage />} />
<Route path="/comparisons/:id" element={<SavedComparisonPage />} />
```

**Add to navigation menu:**
- Link: "Comparisons"
- Path: `/comparisons`
- Icon: History or Database icon
- Badge: Show count of saved comparisons (optional)

#### 7. UI/UX Enhancements

**Loading States:**
- Skeleton loaders for table rows
- Spinner for button actions
- Progress indicators for long operations

**Empty States:**
- Friendly message when no comparisons exist
- Call-to-action button to create first comparison
- Illustration or icon to improve visual appeal

**Error Handling:**
- Toast notifications for save success/failure
- Inline error messages for form validation
- Retry buttons for failed operations
- User-friendly error messages (avoid technical jargon)

**Accessibility:**
- ARIA labels on all interactive elements
- Keyboard navigation support (tab, enter, arrow keys)
- Screen reader announcements for dynamic updates
- Focus management (e.g., focus on error message after save failure)
- Color contrast ratios meet WCAG 2.1 AA standards

**Responsive Design:**
- Mobile: Stack columns, horizontal scroll for table
- Tablet: 2-column layout for metrics
- Desktop: Full table with all columns visible
- Consistent breakpoints: 400px, 640px, 768px, 1024px, 1280px

#### 8. Form Validation

**Save Comparison:**
- Validate that comparison data is complete before saving
- Check that source and target version IDs are present
- Ensure global metrics are calculated
- Verify field_changes array is not empty

**List Filters:**
- Validate page number (must be >= 1)
- Validate page_size (must be 1-100)
- Validate sort_by (must be in allowed list)
- Validate sort_order (must be 'asc' or 'desc')

### Integration Requirements

#### 1. Navigation Flow

**Create Comparison → Save → View Saved:**
1. User performs comparison on `/comparisons/create`
2. Results displayed on same page
3. User clicks "Save Comparison" button
4. System saves and shows success message with link
5. User clicks link to navigate to `/comparisons/{id}`

**List → Detail:**
1. User navigates to `/comparisons`
2. User clicks on a comparison row
3. System navigates to `/comparisons/{id}`
4. Detail page loads and displays full comparison

**Detail → New Analysis:**
1. User is on `/comparisons/{id}` viewing saved comparison
2. User clicks "View in New Analysis" button
3. System navigates to `/comparisons/create` with pre-filled version IDs
4. User can modify selections or re-run comparison

#### 2. State Management

**Global State (Optional):**
- Cache list of saved comparisons for faster navigation
- Store current comparison data in context for save button
- Maintain pagination/filter state when returning to list page

**Local State:**
- Component-level state for loading, errors, form inputs
- Use React Query for server state management (recommended)
- Cache API responses to reduce server load

#### 3. Notification System

**Success Notifications:**
- "Comparison saved successfully" (with link to view)
- Auto-dismiss after 5 seconds
- Option to manually dismiss

**Error Notifications:**
- "Failed to save comparison. Please try again."
- Display specific error message from API
- Persist until user dismisses
- Option to retry action

**Info Notifications:**
- "A comparison between these versions already exists" (with link)
- "Loading comparison data..."

### Security Requirements

#### 1. Authentication

- All endpoints require valid JWT token
- Token validated on every request
- Expired tokens return 401 Unauthorized
- Frontend redirects to login on 401 response

#### 2. Authorization

- Users can only save comparisons they created (enforced by user_id)
- Users can view any saved comparison (read-only access)
- Future enhancement: Role-based access control (RBAC)

#### 3. Input Validation

**Backend:**
- Validate all request parameters with Pydantic
- Sanitize search input to prevent SQL injection
- Validate foreign key references exist before saving
- Enforce maximum page_size to prevent resource exhaustion

**Frontend:**
- Validate form inputs before submission
- Encode special characters in search queries
- Prevent XSS attacks with React's built-in escaping

#### 4. Rate Limiting

- Save endpoint: 20 requests per minute per user
- List endpoint: 60 requests per minute per user
- Detail endpoint: 100 requests per minute per user
- Return 429 (Too Many Requests) when limit exceeded

### Testing Requirements

#### Backend Tests

**Service Layer Tests:**
- `test_save_comparison_success()` - saves comparison with all fields
- `test_save_comparison_rollback_on_error()` - ensures transaction rollback
- `test_get_comparison_by_id()` - retrieves saved comparison
- `test_get_comparison_not_found()` - handles missing comparison
- `test_list_comparisons_pagination()` - pagination works correctly
- `test_list_comparisons_sorting()` - sorting by different fields
- `test_list_comparisons_search()` - search filtering works
- `test_comparison_exists()` - detects duplicate comparisons

**API Endpoint Tests:**
- `test_ingest_endpoint_success()` - POST returns 201 with ID
- `test_ingest_endpoint_unauthorized()` - POST returns 401 without auth
- `test_ingest_endpoint_validation_error()` - POST returns 422 for invalid data
- `test_get_comparison_endpoint()` - GET returns correct data
- `test_get_comparison_not_found()` - GET returns 404 for invalid ID
- `test_list_comparisons_endpoint()` - GET returns paginated list
- `test_list_comparisons_filtering()` - GET applies search filter

**Database Tests:**
- `test_migration_upgrade()` - migration runs without errors
- `test_migration_downgrade()` - rollback restores previous schema
- `test_foreign_key_constraints()` - FK references are enforced
- `test_indexes_created()` - indexes exist for performance

#### Frontend Tests

**Component Tests:**
- `test_save_button_renders()` - button displays correctly
- `test_save_button_click()` - calls API on click
- `test_save_button_loading_state()` - shows spinner while saving
- `test_save_button_success_state()` - shows success message
- `test_save_button_error_state()` - shows error message
- `test_comparisons_page_renders()` - page loads without errors
- `test_comparisons_table_displays_data()` - table shows comparisons
- `test_comparisons_pagination()` - pagination controls work
- `test_comparisons_sorting()` - sorting updates list
- `test_comparisons_search()` - search filters results
- `test_saved_comparison_page_loads()` - detail page fetches data
- `test_saved_comparison_page_not_found()` - handles 404 error

**Integration Tests:**
- `test_save_and_view_flow()` - complete save → list → detail flow
- `test_navigation_between_pages()` - routing works correctly
- `test_error_handling_flow()` - errors display and recover gracefully

### Code Quality Requirements

#### Backend Code Style

- Follow PEP 8 style guide
- Use type hints for all function parameters and return values
- Write docstrings for all public methods (Google style)
- Keep functions under 50 lines (extract helpers for longer logic)
- Use meaningful variable names (avoid abbreviations)
- Add inline comments for complex logic
- Use `logging` module for all debug/info/error messages

#### Frontend Code Style

- Follow ESLint configuration (Airbnb style guide)
- Use TypeScript strict mode
- Write JSDoc comments for complex functions
- Use semantic HTML elements
- Keep components under 300 lines (extract sub-components)
- Use meaningful prop and state names
- Destructure props at top of component
- Use functional components with hooks (no class components)

#### SOLID Principles

- **Single Responsibility:** Each service/component has one purpose
- **Open/Closed:** Extend behavior without modifying existing code
- **Liskov Substitution:** Subtypes must be substitutable for base types
- **Interface Segregation:** No unused dependencies in interfaces
- **Dependency Inversion:** Depend on abstractions, not concretions

#### DRY (Don't Repeat Yourself)

- Extract common logic into utility functions
- Reuse existing components (GlobalMetricsCard, ComparisonTable)
- Create shared TypeScript types in `types/` directory
- Use constants for magic numbers and strings

### Performance Targets

**Backend:**
- Save comparison: < 500ms (p95)
- Get comparison: < 200ms (p95)
- List comparisons: < 300ms (p95)
- Database queries: < 100ms (p95)

**Frontend:**
- Initial page load: < 2 seconds
- Navigation between pages: < 500ms
- Save button click → success message: < 1 second
- Table sort/filter: < 200ms (client-side)

**Database:**
- Comparison insert: < 100ms
- Comparison query with joins: < 150ms
- List query with pagination: < 200ms

### Monitoring and Logging

**Backend Logging:**
- Log all API requests (method, path, user_id, response time)
- Log all database transactions (save, query, error)
- Log errors with stack traces
- Log performance metrics (query times, endpoint latency)

**Frontend Logging:**
- Log navigation events (page views)
- Log API errors (status code, message)
- Log user actions (save, filter, sort)
- Use analytics tool (optional: Google Analytics, Mixpanel)

**Metrics to Track:**
- Number of comparisons saved per day/week/month
- Average time to save comparison
- Most compared template versions
- User engagement (list page visits, detail page visits)
- Error rates (save failures, 404 errors)

## External Dependencies

No new external dependencies are required for this feature. All necessary libraries are already part of the existing tech stack:

**Backend:**
- SQLAlchemy (ORM)
- Alembic (migrations)
- Pydantic (validation)
- FastAPI (routing)

**Frontend:**
- React (UI framework)
- React Router (routing)
- Axios (HTTP client)
- Tailwind CSS (styling)

**Optional Enhancements:**
- React Query or SWR for data fetching (improves caching and UX)
- date-fns or dayjs for date formatting (lightweight alternative to moment.js)

