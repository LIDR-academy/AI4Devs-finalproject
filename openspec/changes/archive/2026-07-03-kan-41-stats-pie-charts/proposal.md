## Why

KAN-40 delivered the chart grid with placeholders for audience and rating pies, and list/bar visualizations for format and genre. US-12 requires pie charts for all four pie slots with accessible legends. KAN-35 (audience column) and KAN-31 (half-star ratings) are done; the stats API must expose the missing distributions.

## What Changes

- Extend `GET /v1/stats` responses with `audience_distribution` and `rating_distribution`.
- Add a shared accessible SVG `PieChart` component (no new chart library).
- Replace format list, genre bar, and audience/rating placeholders with pie charts in slots 1–4.

Non-goals: bar charts (KAN-42); API versioning.

## Capabilities

### New Capabilities

- `stats-pie-distributions`: Stats API audience/rating distributions and frontend pie chart rendering for genre, format, audience and rating.

### Modified Capabilities

- `monthly-stats-ui`: Pie slots 1–4 render real pie charts instead of list/bar/placeholder when data exists.

## Impact

- **Backend:** `stats.service.ts`, DTOs, integration tests.
- **Frontend:** new `PieChart` + chart wrappers, `StatsPage`, `api/types.ts`.
- **Docs:** `docs/api-spec.yml`.
