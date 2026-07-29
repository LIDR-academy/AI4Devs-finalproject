## Why

KAN-40/KAN-41 delivered the chart grid and pie slots. The two bar slots still show placeholders. US-12 requires books and pages bar charts with axis switching: months in month mode, years in year mode (KAN-38 period filter).

## What Changes

- Extend stats API with `monthly_breakdown` (month mode) and `yearly_breakdown` (year mode).
- Add accessible CSS `BarChart` and wire books/pages bar slots on Reading Stats.

Non-goals: custom date ranges; chart library dependency.

## Capabilities

### New Capabilities

- `stats-bar-charts`: Time-series breakdown fields and frontend bar chart rendering.

### Modified Capabilities

- `monthly-stats-ui`: Bar slots render real charts instead of placeholders.

## Impact

- Backend: `stats.service.ts`, DTOs, integration tests, `docs/api-spec.yml`
- Frontend: `BarChart`, `BooksBarChart`, `PagesBarChart`, `StatsPage`, `api/types.ts`
