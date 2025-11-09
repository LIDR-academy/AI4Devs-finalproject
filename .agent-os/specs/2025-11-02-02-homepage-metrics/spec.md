# Spec Requirements Document

> Spec: HomePage Real-Time Metrics  
> Created: 2025-11-02

## Overview

Replace mock data in HomePage with real-time metrics obtained from new read-only backend endpoints. This feature will provide accurate, live statistics about templates, comparisons, and monthly activity, enhancing dashboard transparency and user trust in system data.

## User Stories

### Dashboard Metrics Visibility

As a **system administrator**, I want to see accurate, real-time metrics on the homepage dashboard, so that I can quickly assess system usage and activity without relying on mock data.

The dashboard will display three key metrics: total templates (with version breakdown), total comparisons saved, and activities in the current month. Each metric will be fetched from dedicated backend endpoints that query the database in real-time, ensuring data accuracy. Users will see loading states while metrics load and error states if fetching fails.

### Template Management Overview

As a **template manager**, I want to see how many templates and versions exist in the system, so that I can understand the current state of template library without navigating to other pages.

The "Total Templates" card will show both the number of unique templates and total versions in a user-friendly format like "45 Versions of 15 Templates". This provides immediate insight into template management status.

### Activity Monitoring

As a **team member**, I want to see how much activity has occurred this month, so that I can gauge team productivity and system usage trends.

The "This Month" card will display the count of activities logged in the current calendar month, providing a quick pulse check on system engagement.

## Spec Scope

1. **Backend Metrics Router** - Create new `metrics.py` router under `/api/v1/metrics` following SRP to separate reporting logic from business logic routers.

2. **Templates Summary Endpoint** - Implement `GET /api/v1/metrics/templates/summary` to return count of unique templates and total versions.

3. **Comparisons Count Endpoint** - Implement `GET /api/v1/metrics/comparisons/count` to return total number of saved comparisons.

4. **Monthly Activity Endpoint** - Implement `GET /api/v1/metrics/activity/monthly` to return count of activities in current calendar month (exclude from the count the LOGIN activity_type).

5. **Frontend Integration** - Update `HomePage.tsx` to consume new metrics endpoints and replace mock data with real values, including proper loading and error states.

## Out of Scope

- Historical metrics or trends (only current month for activity)
- User-specific metrics filtering
- Metrics caching or optimization (future enhancement)
- Detailed breakdowns by activity type in monthly metric
- Export or download of metrics data
- Real-time metrics updates via WebSockets
- Metrics dashboard customization
- Comparison of metrics across time periods

## Expected Deliverable

1. Users can view accurate, real-time metrics on the HomePage dashboard showing total templates (with version count), total comparisons, and activities in the current month.

2. All metrics endpoints are authenticated, performant (<50ms response time), and properly documented with OpenAPI schemas.

3. Frontend displays loading states during metric fetching and graceful error messages if any metric fails to load, ensuring the dashboard remains functional even with partial data.
