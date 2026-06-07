# TKT-009 - Consumption and Waste Events

## Metadata
- Type: Backend + Frontend
- Priority: P1
- User Story: US-009
- Main domains: Events, Insights

## Objective
Implement auditable consume/waste events and waste-value metrics updates.

## Scope
In scope:
- Event creation endpoint.
- Waste suggestion confirmation flow.
- Insights query for waste metrics.

Out of scope:
- Gamification.
- Full financial accounting.

## API
- POST /api/pantry/items/:id/events
- GET /api/insights/waste

## Data
- CONSUMPTION_EVENT
- PANTRY_ITEM

## Technical tasks
1. Implement event DTOs with strict quantity/value validation.
2. Ensure actor and timestamp capture for all events.
3. Implement waste-suggestion confirmation workflow.
4. Update dashboard/insights aggregation.

## Testing
- Unit: event validation and value estimator.
- Integration: consume/waste persistence and metrics updates.
- E2E: register waste and verify insights changes.

## Acceptance criteria
1. User can register consumed and wasted events.
2. Suggested waste requires explicit confirmation.
3. Insights reflect quantity and estimated value changes.

## Definition of done
- Event writes are safe against accidental duplicate submit.
- Metrics consistency validated after event creation.
