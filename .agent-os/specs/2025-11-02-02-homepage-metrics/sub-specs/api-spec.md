# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-11-02-02-homepage-metrics/spec.md

## API Endpoints

### Base Path

All metrics endpoints are under: `/api/v1/metrics`

### Authentication

All endpoints require JWT authentication via `Bearer` token in the `Authorization` header.

---

## GET /api/v1/metrics/templates/summary

Get summary of templates and versions in the system.

### Purpose

Provides counts of unique templates and total versions across all templates for dashboard display. This metric helps users understand the size and complexity of their template library.

### Authentication

Required (JWT Bearer token)

### Request

**Method:** `GET`

**Path:** `/api/v1/metrics/templates/summary`

**Headers:**

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Query Parameters:** None

**Example Request:**

```bash
curl -X GET "http://localhost:8000/api/v1/metrics/templates/summary" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Response

**Success Response (200 OK):**

```json
{
  "total_templates": 15,
  "total_versions": 45
}
```

**Response Fields:**

| Field             | Type    | Description                                   |
| ----------------- | ------- | --------------------------------------------- |
| `total_templates` | integer | Number of unique templates in the system      |
| `total_versions`  | integer | Total number of versions across all templates |

**Business Logic:**

```sql
-- Count unique templates
SELECT COUNT(*) FROM pdf_templates;

-- Count total versions
SELECT COUNT(*) FROM template_versions;
```

### Error Responses

**401 Unauthorized:**

```json
{
  "detail": "Not authenticated"
}
```

**403 Forbidden:**

```json
{
  "detail": "Inactive user"
}
```

**500 Internal Server Error:**

```json
{
  "detail": "Failed to fetch templates summary"
}
```

---

## GET /api/v1/metrics/comparisons/count

Get total count of saved comparisons.

### Purpose

Provides the count of all comparisons saved in the system for dashboard display. This metric indicates the level of comparison activity and analysis performed.

### Authentication

Required (JWT Bearer token)

### Request

**Method:** `GET`

**Path:** `/api/v1/metrics/comparisons/count`

**Headers:**

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Query Parameters:** None

**Example Request:**

```bash
curl -X GET "http://localhost:8000/api/v1/metrics/comparisons/count" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Response

**Success Response (200 OK):**

```json
{
  "total_comparisons": 50
}
```

**Response Fields:**

| Field               | Type    | Description                                     |
| ------------------- | ------- | ----------------------------------------------- |
| `total_comparisons` | integer | Total number of saved comparisons in the system |

**Business Logic:**

```sql
SELECT COUNT(*) FROM comparisons;
```

### Error Responses

**401 Unauthorized:**

```json
{
  "detail": "Not authenticated"
}
```

**403 Forbidden:**

```json
{
  "detail": "Inactive user"
}
```

**500 Internal Server Error:**

```json
{
  "detail": "Failed to fetch comparisons count"
}
```

---

## GET /api/v1/metrics/activity/monthly

Get activity count for the current calendar month.

### Purpose

Provides the count of activities logged in the current calendar month for dashboard display. This metric shows the current month's system engagement and usage level, **_exclude from the count the LOGIN activity_type_**.

### Authentication

Required (JWT Bearer token)

### Request

**Method:** `GET`

**Path:** `/api/v1/metrics/activity/monthly`

**Headers:**

```http
Authorization: Bearer <jwt_token>
Content-Type: application/json
```

**Query Parameters:** None

**Example Request:**

```bash
curl -X GET "http://localhost:8000/api/v1/metrics/activity/monthly" \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
```

### Response

**Success Response (200 OK):**

```json
{
  "activities_this_month": 120,
  "month": "2025-11"
}
```

**Response Fields:**

| Field                   | Type    | Description                                           |
| ----------------------- | ------- | ----------------------------------------------------- |
| `activities_this_month` | integer | Number of activities logged in current calendar month |
| `month`                 | string  | Current month in YYYY-MM format                       |

**Business Logic:**

```sql
-- Count activities in current month
SELECT COUNT(*)
FROM activity
WHERE EXTRACT(YEAR FROM timestamp) = EXTRACT(YEAR FROM NOW())
  AND EXTRACT(MONTH FROM timestamp) = EXTRACT(MONTH FROM NOW());
```

### Error Responses

**401 Unauthorized:**

```json
{
  "detail": "Not authenticated"
}
```

**403 Forbidden:**

```json
{
  "detail": "Inactive user"
}
```

**500 Internal Server Error:**

```json
{
  "detail": "Failed to fetch monthly activity"
}
```

---

## Implementation Details

### Controller Implementation

**Location:** `backend/app/api/v1/endpoints/metrics.py`

```python
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import extract
from sqlalchemy.orm import Session
from datetime import datetime

from app.core.auth import get_current_active_user
from app.core.database import get_db
from app.models.template import PDFTemplate, TemplateVersion
from app.models.comparison import Comparison
from app.models.activity import Activity
from app.schemas.metrics import (
    TemplatesSummaryResponse,
    ComparisonsCountResponse,
    MonthlyActivityResponse
)

router = APIRouter()


@router.get("/templates/summary", response_model=TemplatesSummaryResponse)
async def get_templates_summary(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get summary of templates and versions."""
    try:
        total_templates = db.query(PDFTemplate).count()
        total_versions = db.query(TemplateVersion).count()

        return {
            "total_templates": total_templates,
            "total_versions": total_versions
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch templates summary"
        )


@router.get("/comparisons/count", response_model=ComparisonsCountResponse)
async def get_comparisons_count(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get total count of saved comparisons."""
    try:
        total_comparisons = db.query(Comparison).count()

        return {
            "total_comparisons": total_comparisons
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch comparisons count"
        )


@router.get("/activity/monthly", response_model=MonthlyActivityResponse)
async def get_monthly_activity(
    db: Session = Depends(get_db),
    current_user = Depends(get_current_active_user)
):
    """Get activity count for current calendar month."""
    try:
        now = datetime.utcnow()
        current_year = now.year
        current_month = now.month

        activities_count = db.query(Activity).filter(
            extract('year', Activity.timestamp) == current_year,
            extract('month', Activity.timestamp) == current_month
        ).count()

        return {
            "activities_this_month": activities_count,
            "month": f"{current_year}-{current_month:02d}"
        }
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail="Failed to fetch monthly activity"
        )
```

### Performance Considerations

**Query Optimization:**

- All queries use simple COUNT operations
- No JOINs required
- Leverage existing primary key indexes
- Expected response time: < 50ms per endpoint

**Database Impact:**

- Minimal load (simple COUNT queries)
- No table scans (indexed columns)
- No write operations

### Error Handling

All endpoints follow the same error handling pattern:

1. **Try-Catch Block:** Wrap database operations
2. **Log Errors:** Use logger for debugging
3. **Generic Error Messages:** Avoid exposing internal details
4. **Standard HTTP Status Codes:** 401, 403, 500

### Security Considerations

**Authentication:**

- All endpoints require valid JWT token
- User must be active (not disabled)
- Token expiration handled by middleware

**Authorization:**

- All authenticated users can access metrics
- No role-based restrictions (future enhancement)

**Data Privacy:**

- No sensitive user data in responses
- Aggregate counts only
- No filtering by user (system-wide metrics)

### Testing Strategy

**Manual Testing:**

```bash
# 1. Get JWT token
TOKEN=$(curl -X POST http://localhost:8000/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"user@example.com","password":"password"}' \
  | jq -r '.access_token')

# 2. Test templates summary
curl http://localhost:8000/api/v1/metrics/templates/summary \
  -H "Authorization: Bearer $TOKEN"

# 3. Test comparisons count
curl http://localhost:8000/api/v1/metrics/comparisons/count \
  -H "Authorization: Bearer $TOKEN"

# 4. Test monthly activity
curl http://localhost:8000/api/v1/metrics/activity/monthly \
  -H "Authorization: Bearer $TOKEN"
```

**Expected Results:**

- All endpoints return 200 OK
- Response format matches schema
- Counts are accurate
- No authentication errors

### OpenAPI Documentation

All endpoints are automatically documented in FastAPI Swagger UI:

**Access:** `http://localhost:8000/docs`

**Features:**

- Interactive API testing
- Request/response schemas
- Authentication configuration
- Try-it-out functionality

### Integration with Main Router

**File:** `backend/app/api/v1/router.py`

```python
from app.api.v1.endpoints import metrics

api_router.include_router(
    metrics.router,
    prefix="/metrics",
    tags=["metrics"]
)
```

---

## Frontend Integration

### Service Layer

**File:** `frontend/src/services/metrics.service.ts`

```typescript
class MetricsService {
  async getTemplatesSummary() {
    return apiService.get("/metrics/templates/summary");
  }

  async getComparisonsCount() {
    return apiService.get("/metrics/comparisons/count");
  }

  async getMonthlyActivity() {
    return apiService.get("/metrics/activity/monthly");
  }
}
```

### Usage in HomePage

```typescript
useEffect(() => {
  const fetchMetrics = async () => {
    const metrics = await Promise.all([
      metricsService.getTemplatesSummary(),
      metricsService.getComparisonsCount(),
      metricsService.getMonthlyActivity(),
    ]);
    // Update state with metrics
  };
  fetchMetrics();
}, []);
```

---

## Versioning

**API Version:** v1

**Endpoint Stability:** Stable

**Breaking Changes Policy:** Any schema changes require new API version

**Deprecation Notice:** None (new endpoints)
