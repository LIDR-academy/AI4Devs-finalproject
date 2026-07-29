## Why

Reading Stats currently defaults to the current UTC month and only supports month-level filtering. US-08 (KAN-38) requires full-year filtering with the current year as the default, matching product documentation and enabling year-level KPI review before chart enhancements (KAN-42).

## What Changes

- Add `GET /v1/stats?period=year&year=YYYY` for year-scoped aggregates (same KPI/distribution shape as monthly, without `month`).
- Extend Reading Stats UI with a period mode control (year | month), year picker, and persisted selection.
- Default the dashboard to the current UTC year in year mode.
- Invalidate year-level TanStack Query cache when reading records affect annual totals.

## Capabilities

### New Capabilities

- None (extends existing stats capabilities).

### Modified Capabilities

- `monthly-stats-api`: Year-period query endpoint and aggregation bounds.
- `monthly-stats-ui`: Period filter (year + month), default year view, persistence, accessible controls.

## Impact

- Backend: `StatsService`, `StatsController`, integration tests.
- Frontend: `StatsPage`, API client, cache invalidation, `localStorage` persistence.
- Docs: `docs/api-spec.yml`.
