# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-11-02-01-activity-audit-system/spec.md

## Technical Requirements

### Backend Requirements

#### 1. Activity Model (SQLAlchemy)

- Create new `Activity` model in `backend/app/models/activity.py`
- Follow existing model conventions (snake_case, type hints, relationships)
- Include proper indexes for query performance
- Use `TIMESTAMP WITH TIME ZONE` for timestamp fields
- Support nullable `user_id` for system-generated activities

#### 2. Activity Service Layer

- Create `ActivityService` class in `backend/app/services/activity_service.py`
- Implement `log_activity(db, user_id, activity_type, description, entity_id)` method
- Implement `get_recent_activities(db, limit, exclude_types)` method
- Follow existing service patterns (dependency injection, error handling)
- Use logging module for debugging
- Return Pydantic schemas, not raw models

#### 3. Endpoint Integration Points

Modify the following endpoints to call `ActivityService.log_activity` **after** successful response preparation:

- **`POST /api/v1/auth/register`** (`backend/app/api/v1/endpoints/auth.py`)
  - Activity Type: `NEW_USER`
  - Description: `"New user registered: {email}"`
  - Entity ID: `user.id`
- **`POST /api/v1/auth/login`** (`backend/app/api/v1/endpoints/auth.py`)

  - Activity Type: `LOGIN`
  - Description: `"User logged in: {email}"`
  - Entity ID: `user.id`
  - Note: This will be logged but excluded from UI display

- **`POST /api/v1/templates/analyze`** (`backend/app/api/v1/endpoints/templates.py`)

  - Activity Type: `TEMPLATE_ANALYSIS`
  - Description: `"PDF template analyzed: {filename} ({field_count} fields)"`
  - Entity ID: `null` (temporary analysis)

- **`POST /api/v1/ingest/ingest`** (`backend/app/api/v1/endpoints/ingest.py`)

  - Activity Type: `TEMPLATE_SAVED`
  - Description: `"Template ingested: {name} v{version} by {user_email}"`
  - Entity ID: `template_version.id`

- **`POST /api/v1/ingest/ingest/version`** (`backend/app/api/v1/endpoints/ingest.py`)

  - Activity Type: `VERSION_SAVED`
  - Description: `"New version created: {name} v{version} by {user_email}"`
  - Entity ID: `template_version.id`

- **`POST /api/v1/comparisons/analyze`** (`backend/app/api/v1/endpoints/comparisons.py`)

  - Activity Type: `COMPARISON_ANALYSIS`
  - Description: `"Comparison analyzed: {source_name} v{source_ver} vs {target_name} v{target_ver}"`
  - Entity ID: `null` (temporary analysis)

- **`POST /api/v1/comparisons/ingest`** (`backend/app/api/v1/endpoints/comparisons.py`)
  - Activity Type: `COMPARISON_SAVED`
  - Description: `"Comparison saved: {source_name} v{source_ver} vs {target_name} v{target_ver} by {user_email}"`
  - Entity ID: `comparison.id`

#### 4. Activity Query Endpoint

- Create new router endpoint `GET /api/v1/activity/recent`
- Path: `backend/app/api/v1/endpoints/activity.py` (new file)
- Query Parameters:
  - `limit: int = Query(10, ge=1, le=100)` - Number of activities to return
- Response: `ActivityListResponse` (Pydantic schema)
- Features:
  - Join with `users` table to include user email/name
  - Exclude `LOGIN` activity type from results
  - Order by `timestamp DESC`
  - Include JWT authentication requirement
  - Rate limiting: 120 requests/minute
  - Proper error handling (500, 401)

#### 5. Pydantic Schemas

Create schemas in `backend/app/schemas/activity.py`:

```python
class ActivityType(str, Enum):
    LOGIN = "LOGIN"
    NEW_USER = "NEW_USER"
    TEMPLATE_ANALYSIS = "TEMPLATE_ANALYSIS"
    TEMPLATE_SAVED = "TEMPLATE_SAVED"
    VERSION_SAVED = "VERSION_SAVED"
    COMPARISON_ANALYSIS = "COMPARISON_ANALYSIS"
    COMPARISON_SAVED = "COMPARISON_SAVED"

class ActivityResponse(BaseModel):
    id: int
    timestamp: datetime
    user_id: Optional[int]
    user_email: Optional[str]
    user_full_name: Optional[str]
    activity_type: ActivityType
    description: str
    entity_id: Optional[int]

class ActivityListResponse(BaseModel):
    items: List[ActivityResponse]
    total: int
```

### Frontend Requirements

#### 1. TypeScript Types

- Create `Activity` interface in `frontend/src/types/activity.types.ts`
- Match backend `ActivityResponse` schema exactly
- Export from `frontend/src/types/index.ts`

#### 2. API Service

- Create `ActivityService` class in `frontend/src/services/activity.service.ts`
- Implement `getRecentActivities(limit?: number)` method
- Use existing `apiService` for HTTP calls
- Follow existing service patterns (error handling, typing)

#### 3. HomePage Component Updates

- Import and use `ActivityService.getRecentActivities()`
- Replace mock activity data with API call
- Use `useEffect` to fetch data on component mount
- Implement loading state (skeleton loader or spinner)
- Implement error state (graceful error message)
- Format timestamps using relative time (e.g., "2 hours ago")
- Map activity types to appropriate color indicators:
  - `TEMPLATE_SAVED`/`VERSION_SAVED`: green
  - `COMPARISON_SAVED`: blue
  - `COMPARISON_ANALYSIS`: blue
  - `TEMPLATE_ANALYSIS`: purple
  - `NEW_USER`: yellow

#### 4. UI/UX Specifications

- Display up to 10 most recent activities
- Each activity item shows:
  - Colored dot indicator (based on activity type)
  - Description text (from API response)
  - Relative timestamp (e.g., "2 hours ago", "1 day ago")
- Loading state: Display skeleton loaders for activity items
- Error state: Display friendly message "Unable to load recent activity"
- Empty state: Display "No recent activity" if no activities exist
- Maintain existing responsive design (mobile, tablet, desktop)
- Dark mode support for all activity elements
- Accessibility: Proper ARIA labels and semantic HTML

### Performance Considerations

- **Database Indexing**: Create indexes on `activity.timestamp`, `activity.user_id`, `activity.activity_type`
- **Query Optimization**: Use SELECT only necessary columns in JOIN query
- **API Caching**: Consider implementing short-term caching (30-60 seconds) for activity endpoint
- **Frontend Caching**: Store activities in component state, refresh only on mount or manual action
- **Pagination**: Backend supports `limit` parameter, default 10, max 100

### Error Handling

#### Backend

- Handle database connection errors gracefully
- Log all activity creation failures (but don't fail the main operation)
- Return 500 with descriptive message if activity query fails
- Return 401 if authentication is missing/invalid

#### Frontend

- Display user-friendly error messages
- Don't block homepage rendering if activity fetch fails
- Log errors to console for debugging
- Provide fallback UI (show empty state or cached data)

### Testing Requirements

#### Backend

- Unit tests for `ActivityService` methods
- Integration tests for activity logging in each endpoint
- Test activity query endpoint with various filters
- Test user attribution in activity responses
- Test exclusion of LOGIN events in query

#### Frontend

- Unit tests for `ActivityService` API methods
- Component tests for HomePage activity section
- Test loading states, error states, and empty states
- Test activity type color mapping
- Test timestamp formatting

### Code Quality Standards

- Follow PEP 8 for Python code (use `black` and `isort`)
- Follow React/TypeScript standards for frontend
- Use snake_case for Python (variables, functions, models)
- Use camelCase for TypeScript (variables, functions)
- Add comprehensive docstrings to all new Python functions
- Add JSDoc comments to TypeScript service methods
- Maintain 100% type safety (no `any` types in TypeScript)
- Follow SOLID principles (separation of concerns)
