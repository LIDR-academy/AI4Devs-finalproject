# Spec Tasks

## Tasks

- [x] 1. Backend: Metrics Schemas and Models

  - [x] 1.1 Create Pydantic schemas in `backend/app/schemas/metrics.py`
  - [x] 1.2 Define TemplatesSummaryResponse schema with total_templates and total_versions
  - [x] 1.3 Define ComparisonsCountResponse schema with total_comparisons
  - [x] 1.4 Define MonthlyActivityResponse schema with activities_this_month and month
  - [x] 1.5 Add field descriptions and example configurations
  - [x] 1.6 Verify schemas with type checking

- [x] 2. Backend: Metrics Router and Endpoints

  - [x] 2.1 Create metrics router in `backend/app/api/v1/endpoints/metrics.py`
  - [x] 2.2 Implement GET /metrics/templates/summary endpoint
  - [x] 2.3 Implement GET /metrics/comparisons/count endpoint
  - [x] 2.4 Implement GET /metrics/activity/monthly endpoint (exclude LOGIN activity_type)
  - [x] 2.5 Add authentication dependency to all endpoints
  - [x] 2.6 Add error handling with try-catch blocks
  - [x] 2.7 Add OpenAPI documentation strings
  - [x] 2.8 Register metrics router in `backend/app/api/v1/router.py`

- [x] 3. Backend: Manual Testing

  - [x] 3.1 Test GET /metrics/templates/summary with authentication
  - [x] 3.2 Test GET /metrics/comparisons/count with authentication
  - [x] 3.3 Test GET /metrics/activity/monthly with authentication
  - [x] 3.4 Verify response formats match schemas
  - [x] 3.5 Verify counts are accurate against database
  - [x] 3.6 Test error scenarios (no auth, inactive user)
  - [x] 3.7 Verify performance (<50ms response time)

- [x] 4. Frontend: TypeScript Types and Service

  - [x] 4.1 Create TypeScript types in `frontend/src/types/metrics.types.ts`
  - [x] 4.2 Define TemplatesSummary interface
  - [x] 4.3 Define ComparisonsCount interface
  - [x] 4.4 Define MonthlyActivity interface
  - [x] 4.5 Export types from `frontend/src/types/index.ts`
  - [x] 4.6 Create MetricsService in `frontend/src/services/metrics.service.ts`
  - [x] 4.7 Implement getTemplatesSummary() method
  - [x] 4.8 Implement getComparisonsCount() method
  - [x] 4.9 Implement getMonthlyActivity() method

- [x] 5. Frontend: HomePage Integration

  - [x] 5.1 Add state variables for metrics (loading, error, data)
  - [x] 5.2 Implement useEffect to fetch metrics on mount
  - [x] 5.3 Use Promise.all to fetch all three metrics in parallel
  - [x] 5.4 Replace "Total Templates" mock data with real data
  - [x] 5.5 Replace "Active Comparisons" mock data with real data
  - [x] 5.6 Replace "This Month" mock data with real data
  - [x] 5.7 Implement loading states with skeleton loaders
  - [x] 5.8 Implement error handling for failed metrics
  - [x] 5.9 Test component renders correctly with real data
  - [x] 5.10 Verify dark mode support for all states

- [ ] 6. Documentation and Verification
  - [ ] 6.1 Verify OpenAPI documentation in Swagger UI
  - [ ] 6.2 Test complete user flow (login → view dashboard)
  - [ ] 6.3 Verify all metrics display accurately
  - [ ] 6.4 Verify loading states work correctly
  - [ ] 6.5 Verify error states display properly
  - [ ] 6.6 Create completion summary document

## Task Dependencies

```
Task 1 (Schemas) → Task 2 (Endpoints) → Task 3 (Manual Testing)
                                      ↓
                Task 4 (Frontend Types/Service) → Task 5 (HomePage) → Task 6 (Verification)
```

## Estimated Complexity

- **Task 1:** Low (schema definitions)
- **Task 2:** Medium (3 endpoints with queries)
- **Task 3:** Low (manual testing)
- **Task 4:** Low (TypeScript types and service)
- **Task 5:** Medium (component updates with states)
- **Task 6:** Low (documentation and verification)

**Total Estimated Time:** 3-4 hours

## Key Deliverables

1. ✅ New `/api/v1/metrics` router with 3 endpoints
2. ✅ Pydantic schemas for all metric responses
3. ✅ TypeScript types and MetricsService
4. ✅ HomePage displaying real-time metrics
5. ✅ Loading and error states for all metrics
6. ✅ Complete OpenAPI documentation
