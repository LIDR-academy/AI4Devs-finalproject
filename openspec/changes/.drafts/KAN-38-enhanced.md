## Original

**KAN-38 — US-08 · Full-year filter on Reading Stats**

As a reader, I want to filter Reading Stats by a full calendar year (in addition to months), so I can see statistics for the entire year.

**Context:** Improvement #6. `prompts.md` says stats can be filtered by years with the current year as default. The API is documented as supporting `period=year` and `period=custom`; implementation currently exposes only `GET /v1/stats/{year}/{month}`.

**Acceptance criteria:**
- On Reading Stats, selecting a year in the period filter recalculates all KPIs and charts for the full year.
- Filter allows: specific month and full year.
- Default: current calendar year (year view).
- Filter persists when returning to the page.
- Keyboard accessible.

**Technical notes:**
- Consume `GET /v1/stats?period=year&year=YYYY` (documented in readme; not yet implemented).
- Coordinate with KAN-42 bar charts (axis month↔year) — out of scope for this ticket.

## Enhanced

### Problem

Reading Stats only supports month selection (`type="month"` input) and defaults to the current UTC month. Product spec (US-08) requires full-year filtering with **current year as the default view**, plus persistence across visits.

### Scope

**In scope**
- Backend: `GET /v1/stats?period=year&year=YYYY` returning the same aggregate shape as monthly stats (without `month`), computed from `reading_records` where `status = leido` and `finished_on` falls within `[YYYY-01-01, (YYYY+1)-01-01)`.
- Keep existing `GET /v1/stats/{year}/{month}` for backward compatibility.
- Frontend: period control with **Year** (default) and **Month** modes; year picker (`type="number"` or `select`) and month picker (`type="month"`).
- TanStack Query keys: `['stats', 'year', year]` and `['stats', 'month', year, month]`.
- Persist selection in `localStorage` (`stats_period_v1`).
- Extend `statsCacheInvalidation` to invalidate affected year queries when reading records change.
- Update `docs/api-spec.yml`, delta specs for `monthly-stats-api` and `monthly-stats-ui`.

**Out of scope**
- Bar charts with month↔year axis (KAN-42).
- Cover gallery for filtered period (KAN-39).
- `period=custom` range filter.
- Insights array from readme's aspirational unified stats response.

### API

```
GET /v1/stats?period=year&year=2026
GET /v1/stats?period=month&year=2026&month=4   # optional alias; path route remains canonical for month
```

**YearlyStatsResponse** (same fields as monthly, `month` omitted):

```json
{
  "year": 2026,
  "books_read": 12,
  "pages_read": 4200,
  "average_rating": 4.1,
  "genre_distribution": [{ "genre": "Fantasy", "count": 5 }],
  "format_distribution": [{ "format": "ebook", "count": 7 }],
  "predominant_format": "ebook"
}
```

### Files to modify

| Layer | Path |
|-------|------|
| Backend service | `backend/src/stats/stats.service.ts` — `getYearlyStats`, `yearBounds`, refactor shared aggregation |
| Backend controller | `backend/src/stats/stats.controller.ts` — `GET /stats` query handler |
| Backend DTO | `backend/src/stats/dto/yearly-stats-response.dto.ts` |
| Backend tests | `backend/test/stats.integration-spec.ts`, `backend/src/stats/stats.service.spec.ts` |
| Frontend API | `frontend/src/api/client.ts`, `frontend/src/api/types.ts` |
| Frontend page | `frontend/src/pages/StatsPage.tsx`, `StatsPage.css` |
| Frontend lib | `frontend/src/lib/statsPeriodStorage.ts`, `frontend/src/lib/statsCacheInvalidation.ts` |
| Docs | `docs/api-spec.yml` |
| Specs | delta `monthly-stats-api`, `monthly-stats-ui` |

### Definition of done

1. Year endpoint returns correct aggregates; empty year returns zeroed payload (200).
2. Stats page defaults to current UTC year in year mode.
3. Switching month/year refetches and updates KPIs + charts.
4. Selection survives navigation away and back.
5. Period controls are keyboard accessible (`label`, `focus-visible`).
6. Backend integration tests + frontend build pass.

### Non-functional

- No new DB tables; compute on read (same as monthly).
- JWT auth required; user-scoped aggregation unchanged.
