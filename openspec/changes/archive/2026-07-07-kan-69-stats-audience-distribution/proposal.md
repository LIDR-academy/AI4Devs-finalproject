## Why

Reading Stats already shows genre and format distributions; público objetivo should use the user-owned audience catalog (KAN-65/67) instead of the legacy enum column.

## What Changes

- Compute `audience_distribution` from `books.audience_id` joined to `audiences.name`.
- Update audience pie chart labels to show user audience names.
- Update api-spec and stats integration tests.

## Capabilities

### New Capabilities

- *(none)*

### Modified Capabilities

- `stats-pie-distributions`: Audience distribution uses user audience labels via `audience_id`.

## Impact

- `backend/src/stats/`
- `backend/test/stats.integration-spec.ts`
- `frontend/src/components/stats/AudiencePieChart.tsx`
- `frontend/src/pages/StatsPage.tsx`
- `docs/api-spec.yml`
