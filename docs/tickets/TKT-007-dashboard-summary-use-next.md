# TKT-007 - Dashboard Summary and Use-Next

## Metadata
- Type: Full-Stack
- Priority: P1
- User Story: US-007
- Main domains: Dashboard, Insights

## Objective
Build dashboard KPIs and prioritized consume-next list for fast daily decisions.

## Scope
In scope:
- Summary counts endpoint.
- Use-next list endpoint.
- Dashboard UI cards and list rendering.

Out of scope:
- Recipe suggestions.
- Predictive analytics.

## API
- GET /api/dashboard/summary
- GET /api/dashboard/use-next

## Data
- PANTRY_ITEM
- CONSUMPTION_EVENT

## Technical tasks
1. Implement aggregation queries for active and expiring counts.
2. Implement ordering strategy for consume-next.
3. Build dashboard cards and list components.
4. Add refresh behavior after item status changes.

## Testing
- Unit: ranking comparator and tie-break rules.
- Integration: summary and use-next endpoints.
- E2E: dashboard updates after consume/waste events.

## Acceptance criteria
1. Dashboard shows active and expiring counts.
2. Use-next list is correctly ordered by risk.
3. Dashboard refreshes after relevant events.

## Definition of done
- Deterministic ordering tests pass.
- Dashboard UX verified on mobile layouts.
