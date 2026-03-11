# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-11-02-02-homepage-metrics/spec.md

## Technical Requirements

### Backend Requirements

#### 1. Metrics Router (`backend/app/api/v1/endpoints/metrics.py`)

Create a new FastAPI router dedicated to read-only metrics endpoints:

- **Router Configuration:**

  - Prefix: `/metrics`
  - Tags: `["metrics"]`
  - All endpoints require authentication: `Depends(get_current_active_user)`

- **Design Principles:**
  - Follow Single Responsibility Principle (SRP)
  - Separate reporting logic from business logic routers
  - Read-only operations (no POST, PUT, DELETE)
  - Optimized queries for performance

#### 2. Pydantic Schemas (`backend/app/schemas/metrics.py`)

Create response models for each metric:

```python
class TemplatesSummaryResponse(BaseModel):
    """Summary of templates and versions in the system."""
    total_templates: int = Field(..., description="Number of unique templates")
    total_versions: int = Field(..., description="Total number of versions across all templates")

    class Config:
        json_schema_extra = {
            "example": {
                "total_templates": 15,
                "total_versions": 45
            }
        }

class ComparisonsCountResponse(BaseModel):
    """Count of saved comparisons."""
    total_comparisons: int = Field(..., description="Total number of saved comparisons")

    class Config:
        json_schema_extra = {
            "example": {
                "total_comparisons": 50
            }
        }

class MonthlyActivityResponse(BaseModel):
    """Activity count for current month."""
    activities_this_month: int = Field(..., description="Number of activities in current calendar month")
    month: str = Field(..., description="Current month in YYYY-MM format")

    class Config:
        json_schema_extra = {
            "example": {
                "activities_this_month": 120,
                "month": "2025-11"
            }
        }
```

#### 3. Endpoint Implementations

**A. GET /api/v1/metrics/templates/summary**

```python
@router.get("/templates/summary", response_model=TemplatesSummaryResponse)
async def get_templates_summary(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Get summary of templates and versions.

    Returns the count of unique templates and total versions
    across all templates in the system.
    """
```

**Query Logic:**

```python
# Count unique templates
total_templates = db.query(PDFTemplate).count()

# Count total versions
total_versions = db.query(TemplateVersion).count()

return {
    "total_templates": total_templates,
    "total_versions": total_versions
}
```

**B. GET /api/v1/metrics/comparisons/count**

```python
@router.get("/comparisons/count", response_model=ComparisonsCountResponse)
async def get_comparisons_count(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Get total count of saved comparisons.

    Returns the number of comparisons stored in the database.
    """
```

**Query Logic:**

```python
total_comparisons = db.query(Comparison).count()

return {
    "total_comparisons": total_comparisons
}
```

**C. GET /api/v1/metrics/activity/monthly**

```python
@router.get("/activity/monthly", response_model=MonthlyActivityResponse)
async def get_monthly_activity(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_active_user)
) -> Any:
    """
    Get activity count for current calendar month.

    Returns the number of activities logged in the current month,
    including the month identifier.
    """
```

**Query Logic:**

```python
from datetime import datetime
from sqlalchemy import extract

# Get current month
now = datetime.utcnow()
current_year = now.year
current_month = now.month

# Count activities in current month
activities_count = db.query(Activity).filter(
    extract('year', Activity.timestamp) == current_year,
    extract('month', Activity.timestamp) == current_month
).count()

return {
    "activities_this_month": activities_count,
    "month": f"{current_year}-{current_month:02d}"
}
```

#### 4. Router Registration

Update `backend/app/api/v1/router.py`:

```python
from app.api.v1.endpoints import auth, templates, comparisons, ingest, activity, metrics

api_router.include_router(metrics.router, prefix="/metrics", tags=["metrics"])
```

#### 5. Error Handling

Each endpoint should handle:

- Database connection errors (500)
- Authentication errors (401)
- Active user verification (403)

Standard error response format:

```json
{
  "detail": "Error message"
}
```

#### 6. Performance Requirements

- Response time: < 50ms for all metrics endpoints
- Use simple COUNT queries (no JOINs or complex aggregations)
- Leverage existing database indexes
- No caching layer required for MVP (future enhancement)

### Frontend Requirements

#### 1. TypeScript Types (`frontend/src/types/metrics.types.ts`)

```typescript
export interface TemplatesSummary {
  total_templates: number;
  total_versions: number;
}

export interface ComparisonsCount {
  total_comparisons: number;
}

export interface MonthlyActivity {
  activities_this_month: number;
  month: string;
}
```

#### 2. Metrics Service (`frontend/src/services/metrics.service.ts`)

```typescript
class MetricsService {
  private readonly basePath = "/metrics";

  async getTemplatesSummary(): Promise<TemplatesSummary> {
    return apiService.get<TemplatesSummary>(
      `${this.basePath}/templates/summary`
    );
  }

  async getComparisonsCount(): Promise<ComparisonsCount> {
    return apiService.get<ComparisonsCount>(
      `${this.basePath}/comparisons/count`
    );
  }

  async getMonthlyActivity(): Promise<MonthlyActivity> {
    return apiService.get<MonthlyActivity>(`${this.basePath}/activity/monthly`);
  }
}

export const metricsService = new MetricsService();
```

#### 3. HomePage Component Updates

**State Management:**

```typescript
const [metricsLoading, setMetricsLoading] = useState(true);
const [metricsError, setMetricsError] = useState<string | null>(null);
const [templatesSummary, setTemplatesSummary] =
  useState<TemplatesSummary | null>(null);
const [comparisonsCount, setComparisonsCount] =
  useState<ComparisonsCount | null>(null);
const [monthlyActivity, setMonthlyActivity] = useState<MonthlyActivity | null>(
  null
);
```

**Data Fetching:**

```typescript
useEffect(() => {
  const fetchMetrics = async () => {
    try {
      setMetricsLoading(true);
      setMetricsError(null);

      const [templates, comparisons, activity] = await Promise.all([
        metricsService.getTemplatesSummary(),
        metricsService.getComparisonsCount(),
        metricsService.getMonthlyActivity(),
      ]);

      setTemplatesSummary(templates);
      setComparisonsCount(comparisons);
      setMonthlyActivity(activity);
    } catch (error) {
      console.error("Failed to load metrics:", error);
      setMetricsError(
        error instanceof Error ? error.message : "Failed to load metrics"
      );
    } finally {
      setMetricsLoading(false);
    }
  };

  fetchMetrics();
}, []);
```

**UI Updates:**

Replace the mock `stats` array with dynamic rendering:

```typescript
// Total Templates card
{
  metricsLoading ? (
    <div className="animate-pulse">...</div>
  ) : metricsError ? (
    <span className="text-sm text-red-500">Error loading</span>
  ) : templatesSummary ? (
    <>
      <p className="text-sm text-gray-600 dark:text-gray-400">
        Total Templates
      </p>
      <p className="text-2xl font-semibold text-gray-900 dark:text-white">
        {templatesSummary.total_templates}
      </p>
      <p className="text-xs text-gray-500">
        {templatesSummary.total_versions} versions
      </p>
    </>
  ) : null;
}
```

Similar pattern for:

- Active Comparisons: Display `comparisonsCount.total_comparisons`
- This Month: Display `monthlyActivity.activities_this_month`

#### 4. Loading States

- Skeleton loaders for each metric card
- Shimmer animation effect
- Maintains layout structure during loading

#### 5. Error Handling

- Individual error states per metric
- Graceful degradation (show what loaded successfully)
- Error icon + message in failed metric cards
- Retry option (manual page refresh)

### Integration Points

1. **Router Integration**: Add metrics router to main API router
2. **Authentication**: Reuse existing JWT authentication flow
3. **Database Access**: Use existing database session dependency
4. **Frontend Service**: Follow existing service pattern (like `activityService`)

### Code Quality Standards

- Follow existing project conventions
- Use TypeScript strict mode
- Include JSDoc comments for all functions
- Follow SRP and clean code principles
- Use existing error handling patterns
- Maintain consistent code style

### Testing Approach

- Manual testing of all three endpoints
- Verify response formats match schemas
- Test loading states in UI
- Test error scenarios (disconnected, auth failure)
- Verify metrics update on data changes
