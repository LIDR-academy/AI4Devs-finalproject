# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-11-02-01-activity-audit-system/spec.md

## API Endpoints

### GET /api/v1/activity/recent

Retrieve recent activity records for display on the dashboard.

**Purpose:** Fetch the most recent system activities to populate the "Recent Activity" section on the homepage. Activities are filtered to exclude LOGIN events and include user attribution.

**Authentication:** Required (JWT Bearer token)

**Rate Limiting:** 120 requests/minute per user

#### Request

**Method:** `GET`

**Path:** `/api/v1/activity/recent`

**Query Parameters:**

| Parameter | Type    | Required | Default | Validation       | Description                    |
| --------- | ------- | -------- | ------- | ---------------- | ------------------------------ |
| `limit`   | integer | No       | 10      | min: 1, max: 100 | Number of activities to return |

**Headers:**

```http
Authorization: Bearer <jwt_token>
```

**Example Request:**

```bash
curl -X GET "https://api.example.com/api/v1/activity/recent?limit=10" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

#### Response

**Success Response (200 OK):**

**Content-Type:** `application/json`

**Schema:**

```json
{
  "items": [
    {
      "id": 123,
      "timestamp": "2025-11-02T14:30:00Z",
      "user_id": 5,
      "user_email": "user@example.com",
      "user_full_name": "John Doe",
      "activity_type": "TEMPLATE_SAVED",
      "description": "Template ingested: SEPE Form 2024 v2.0 by user@example.com",
      "entity_id": 42
    }
  ],
  "total": 156
}
```

**Response Fields:**

| Field                    | Type              | Description                                                            |
| ------------------------ | ----------------- | ---------------------------------------------------------------------- |
| `items`                  | array             | Array of activity objects                                              |
| `items[].id`             | integer           | Unique activity identifier                                             |
| `items[].timestamp`      | string (ISO 8601) | When the activity occurred (UTC)                                       |
| `items[].user_id`        | integer \| null   | ID of the user who performed the action                                |
| `items[].user_email`     | string \| null    | Email of the user (joined from users table)                            |
| `items[].user_full_name` | string \| null    | Full name of the user (joined from users table)                        |
| `items[].activity_type`  | string            | Type of activity (enum value)                                          |
| `items[].description`    | string            | Human-readable description                                             |
| `items[].entity_id`      | integer \| null   | Reference to related entity (template_version.id, comparison.id, etc.) |
| `total`                  | integer           | Total number of activities matching the filter (excluding LOGIN)       |

**Activity Types (Returned Values):**

- `NEW_USER` - New user registered
- `TEMPLATE_ANALYSIS` - PDF analyzed (temporary)
- `TEMPLATE_SAVED` - Template ingested
- `VERSION_SAVED` - New version created
- `COMPARISON_ANALYSIS` - Comparison analyzed (temporary)
- `COMPARISON_SAVED` - Comparison saved

**Note:** `LOGIN` activities are **excluded** from the response.

**Example Response:**

```json
{
  "items": [
    {
      "id": 245,
      "timestamp": "2025-11-02T15:45:32Z",
      "user_id": 12,
      "user_email": "admin@sepe.es",
      "user_full_name": "María García",
      "activity_type": "COMPARISON_SAVED",
      "description": "Comparison saved: SEPE Form A v1.0 vs SEPE Form A v2.0 by admin@sepe.es",
      "entity_id": 89
    },
    {
      "id": 244,
      "timestamp": "2025-11-02T14:30:18Z",
      "user_id": 8,
      "user_email": "user@company.com",
      "user_full_name": "Carlos López",
      "activity_type": "VERSION_SAVED",
      "description": "New version created: SEPE Form B v3.1 by user@company.com",
      "entity_id": 156
    },
    {
      "id": 243,
      "timestamp": "2025-11-02T13:22:45Z",
      "user_id": 8,
      "user_email": "user@company.com",
      "user_full_name": "Carlos López",
      "activity_type": "TEMPLATE_ANALYSIS",
      "description": "PDF template analyzed: sepe_form_nueva.pdf (18 fields)",
      "entity_id": null
    },
    {
      "id": 242,
      "timestamp": "2025-11-02T11:15:00Z",
      "user_id": 5,
      "user_email": "newuser@example.com",
      "user_full_name": "Ana Martínez",
      "activity_type": "NEW_USER",
      "description": "New user registered: newuser@example.com",
      "entity_id": 5
    }
  ],
  "total": 156
}
```

#### Error Responses

**401 Unauthorized:**

```json
{
  "detail": "Not authenticated"
}
```

**Description:** JWT token is missing or invalid.

**422 Unprocessable Entity:**

```json
{
  "detail": [
    {
      "loc": ["query", "limit"],
      "msg": "ensure this value is less than or equal to 100",
      "type": "value_error.number.not_le"
    }
  ]
}
```

**Description:** Query parameter validation failed (e.g., limit > 100).

**429 Too Many Requests:**

```json
{
  "detail": "Rate limit exceeded. Please try again later."
}
```

**Description:** Rate limit of 120 requests/minute exceeded.

**500 Internal Server Error:**

```json
{
  "detail": "Failed to fetch recent activities"
}
```

**Description:** Database error or unexpected server error.

#### Implementation Details

**Database Query:**

```sql
SELECT
    a.id,
    a.timestamp,
    a.user_id,
    u.email AS user_email,
    u.full_name AS user_full_name,
    a.activity_type,
    a.description,
    a.entity_id
FROM activity a
LEFT JOIN users u ON a.user_id = u.id
WHERE a.activity_type != 'LOGIN'
ORDER BY a.timestamp DESC
LIMIT ?;
```

**Performance Optimizations:**

- Use index `idx_activity_timestamp` for fast descending sort
- Use index `idx_activity_type` for filtering out LOGIN events
- LEFT JOIN ensures activities without users are still returned
- Query only necessary columns (no SELECT \*)

**Caching Strategy:**

- Consider implementing short-term cache (30-60 seconds)
- Cache key: `activity:recent:{limit}`
- Invalidate on new activity creation
- Use Redis for distributed caching

**Controller Logic:**

Location: `backend/app/api/v1/endpoints/activity.py`

```python
from fastapi import APIRouter, Depends, HTTPException, Query, status
from sqlalchemy.orm import Session

from app.core.auth import get_current_active_user
from app.core.database import get_db
from app.schemas.activity import ActivityListResponse
from app.services.activity_service import ActivityService

router = APIRouter()


@router.get(
    "/recent",
    response_model=ActivityListResponse,
    summary="Get Recent Activities",
    description="""
    Retrieve recent system activities for dashboard display.

    Activities are ordered by timestamp (most recent first) and exclude
    LOGIN events for cleaner UI display. Each activity includes user
    attribution (email and full name) joined from the users table.

    **Features:**
    - Pagination support via `limit` parameter
    - Automatic exclusion of LOGIN events
    - User attribution with email and full name
    - Ordered by most recent first

    **Use Cases:**
    - Homepage "Recent Activity" dashboard widget
    - System activity monitoring
    - Quick overview of recent operations
    """,
    responses={
        200: {
            "description": "Recent activities retrieved successfully",
            "content": {
                "application/json": {
                    "example": {
                        "items": [
                            {
                                "id": 123,
                                "timestamp": "2025-11-02T14:30:00Z",
                                "user_id": 5,
                                "user_email": "user@example.com",
                                "user_full_name": "John Doe",
                                "activity_type": "TEMPLATE_SAVED",
                                "description": "Template ingested: SEPE Form v2.0",
                                "entity_id": 42
                            }
                        ],
                        "total": 156
                    }
                }
            }
        },
        401: {"description": "Not authenticated"},
        422: {"description": "Invalid query parameters"},
        500: {"description": "Server error"}
    },
    tags=["Activity"]
)
def get_recent_activities(
    limit: int = Query(10, ge=1, le=100, description="Number of activities to return"),
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
) -> ActivityListResponse:
    """
    Get recent system activities for dashboard display.

    Args:
        limit: Maximum number of activities to return (1-100)
        db: Database session
        current_user: Authenticated user (required)

    Returns:
        ActivityListResponse with items and total count

    Raises:
        HTTPException: 500 if database query fails
    """
    try:
        activity_service = ActivityService(db)
        result = activity_service.get_recent_activities(
            limit=limit,
            exclude_types=["LOGIN"]
        )
        return result
    except Exception as e:
        logger.error(f"Failed to fetch recent activities: {str(e)}")
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch recent activities"
        )
```

## Service Layer Interface

### ActivityService

Location: `backend/app/services/activity_service.py`

#### Method: `log_activity`

Log a new activity to the database.

```python
def log_activity(
    self,
    user_id: Optional[int],
    activity_type: str,
    description: str,
    entity_id: Optional[int] = None
) -> None:
    """
    Log a new activity to the database.

    Args:
        user_id: ID of user performing the action (None for system activities)
        activity_type: Type of activity (must match ActivityType enum)
        description: Human-readable description of the activity
        entity_id: Optional reference to related entity

    Raises:
        ValueError: If activity_type is invalid
        Exception: If database insert fails (logged but not raised)

    Notes:
        - This method should NOT raise exceptions that fail the main operation
        - Errors are logged but swallowed to prevent activity logging from breaking core features
        - Uses db.commit() to persist immediately
    """
```

#### Method: `get_recent_activities`

Retrieve recent activities with optional filtering.

```python
def get_recent_activities(
    self,
    limit: int = 10,
    exclude_types: Optional[List[str]] = None
) -> ActivityListResponse:
    """
    Retrieve recent activities from the database.

    Args:
        limit: Maximum number of activities to return
        exclude_types: List of activity types to exclude (e.g., ["LOGIN"])

    Returns:
        ActivityListResponse with items and total count

    Raises:
        Exception: If database query fails

    Notes:
        - Joins with users table to include user attribution
        - Orders by timestamp DESC (most recent first)
        - Returns null for user fields if user was deleted (ON DELETE SET NULL)
    """
```

## Integration Points

### Endpoint Modifications

Each of the following endpoints must be modified to call `ActivityService.log_activity` **after** successful operation completion:

1. **POST /api/v1/auth/register**

   - Call after user creation, before returning response
   - Use `db` session from endpoint
   - Pass `user.id`, `"NEW_USER"`, description with email, `user.id`

2. **POST /api/v1/auth/login**

   - Call after token generation, before returning response
   - Use `db` session from endpoint
   - Pass `user.id`, `"LOGIN"`, description with email, `user.id`

3. **POST /api/v1/templates/analyze**

   - Call after successful analysis, before returning response
   - Use `db` session from endpoint
   - Pass `current_user.id`, `"TEMPLATE_ANALYSIS"`, description with filename and field count, `None`

4. **POST /api/v1/ingest/ingest**

   - Call after successful template creation, before returning response
   - Use `db` session from endpoint
   - Pass `current_user.id`, `"TEMPLATE_SAVED"`, description with template name/version, `version_id`

5. **POST /api/v1/ingest/ingest/version**

   - Call after successful version creation, before returning response
   - Use `db` session from endpoint
   - Pass `current_user.id`, `"VERSION_SAVED"`, description with template name/version, `version_id`

6. **POST /api/v1/comparisons/analyze**

   - Call after successful analysis, before returning response
   - Use `db` session from endpoint
   - Pass `current_user.id`, `"COMPARISON_ANALYSIS"`, description with source/target info, `None`

7. **POST /api/v1/comparisons/ingest**
   - Call after successful comparison save, before returning response
   - Use `db` session from endpoint
   - Pass `current_user.id`, `"COMPARISON_SAVED"`, description with source/target info, `comparison_id`

### Error Handling in Integrations

**Critical Principle:** Activity logging failures must NOT break the main operation.

```python
try:
    activity_service = ActivityService(db)
    activity_service.log_activity(
        user_id=current_user.id,
        activity_type="TEMPLATE_SAVED",
        description=f"Template ingested: {template_name} v{version}",
        entity_id=version_id
    )
except Exception as e:
    # Log the error but don't fail the main operation
    logger.error(f"Failed to log activity: {str(e)}")
    # Continue with the response
```

## OpenAPI Documentation

The activity endpoint will be documented in the FastAPI automatic OpenAPI/Swagger UI with:

- Complete parameter descriptions
- Example requests and responses
- Error response schemas
- Authentication requirements
- Rate limiting information

Access Swagger UI at: `http://localhost:8000/docs#/activity/recent`

## Versioning

**API Version:** v1

**Endpoint Stability:** Stable

**Breaking Changes Policy:** Any changes to response schema will require a new API version (v2)

**Deprecation Notice:** None (new endpoint)
