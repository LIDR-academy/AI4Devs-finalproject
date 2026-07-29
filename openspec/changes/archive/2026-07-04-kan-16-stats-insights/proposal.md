## Why

Reading Stats shows KPIs and charts but no narrative takeaways. US-06 (KAN-16) adds deterministic automatic insights (≥3 per period with data) so users spot trends quickly.

## What Changes

- Add `insights` array to monthly and yearly stats API responses.
- Implement rule-based insight generation in `StatsService` (no LLM): period comparison, dominant genre, format mix, pages milestone, rating pattern.
- Render an Insights section on `/stats` below KPI cards.

Non-goals: LLM copy; custom date ranges; Recap page.

## Capabilities

### New Capabilities

- `stats-insights`: Insight DTO, generator rules, and Reading Stats UI section.

### Modified Capabilities

- `monthly-stats-api`: Stats responses include `insights`.
- `monthly-stats-ui`: Insights section on Reading Stats.

## Impact

- Backend: `stats-insights.ts`, `stats.service.ts`, DTOs, tests, `docs/api-spec.yml`
- Frontend: `InsightsList`, `StatsPage`, `api/types.ts`
