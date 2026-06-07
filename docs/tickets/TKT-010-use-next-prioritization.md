# TKT-010 - Use-Next Prioritization

## Metadata
- Type: Full-Stack
- Priority: P1
- User Story: US-010
- Main domains: Pantry prioritization

## Objective
Provide deterministic use-next ranking across pantry and dashboard views.

## Scope
In scope:
- Prioritization service and endpoint.
- Reusable list component in pantry and dashboard.
- Deterministic tie-break behavior.

Out of scope:
- Recipe generation.
- External recipe integrations.

## API
- GET /api/pantry/use-next

## Data
- PANTRY_ITEM
- EXPIRATION_ASSESSMENT
- Optional CONSUMPTION_EVENT recency signal

## Technical tasks
1. Define scoring formula based on expiration risk.
2. Define tie-break order for equal scores.
3. Implement backend ranking query/service.
4. Implement shared frontend consume-next list component.

## Testing
- Unit: scoring and tie-break determinism.
- Integration: endpoint output ordering.
- E2E: compare list order between pantry and dashboard.

## Acceptance criteria
1. Use-next list orders highest risk items first.
2. Same ordering logic is used in pantry and dashboard.
3. Feature works without recipe dependencies.

## Definition of done
- Ranking behavior documented and covered by fixtures.
- Cross-screen ordering consistency verified.
