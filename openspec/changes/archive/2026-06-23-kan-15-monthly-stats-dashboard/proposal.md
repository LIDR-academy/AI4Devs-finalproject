## Why

KAN-11/KAN-14 give readers annual goals and reliable `leido` + `finished_on` data, but the core value proposition of the PRD — analyzing reading habits — is still missing: there is no way to see monthly KPIs or a genre breakdown. KAN-15 (US-05 / UC-07) delivers the first read-only **monthly statistics dashboard** so readers can review how much and what they read per month. Automatic insights (US-06 / KAN-16) build on this foundation later.

## What Changes

- **`stats` module (backend):** new `StatsService` computing per-month aggregates from existing `reading_records` joined to `books`; no schema change, no new table.
- **REST API:** `GET /v1/stats/{year}/{month}` (JWT) returning `books_read`, `pages_read`, `average_rating`, `genre_distribution`, `format_distribution`, and `predominant_format` for the authenticated user.
- **Reading Stats UI:** new `/stats` route with a dashboard — KPI cards, a genre-distribution chart, a format breakdown, and a month selector that recalculates all indicators.
- **Navigation:** add a `Reading Stats` link from Home (and existing nav).
- **Cache coherence:** invalidate TanStack Query `['stats', year, month]` after a reading-record PATCH transitions to `leido` so the dashboard updates without reload.
- **Docs & tests:** update `docs/api-spec.yml` and `docs/data-model.md` (computed stats note); backend unit/integration tests for aggregation and boundaries; manual checklist `MANUAL-TEST-KAN-15.md`.

**Period semantics:** a book counts toward a month when `reading_records.status = 'leido'` and `finished_on` is in `[YYYY-MM-01, next-month-01)`, mirroring the year-bounds logic in `GoalsService` so "read" is defined consistently across goals and stats.

**Non-goals (explicit):**

- Automatic insights / trend detection (US-06, KAN-16).
- Two-period comparison view and custom date ranges (V1; UC-07 alt flow 4a).
- New persistence/aggregate tables (stats are computed on read).
- Year-level or all-time dashboards beyond a single calendar month.
- Import-driven backfill (UC-08).

## Capabilities

### New Capabilities

- `monthly-stats-api`: `StatsModule` / `StatsService`, authenticated `GET /v1/stats/{year}/{month}`, month-scoped aggregation (counts, pages, average rating, genre and format distributions, predominant format), validation, and user scoping.
- `monthly-stats-ui`: `/stats` route, dashboard page, KPI cards, genre-distribution chart, format breakdown, month selector, TanStack Query wiring, and loading/empty/error states.

### Modified Capabilities

- `book-tracker-lifecycle-ui`: Extend cache coherence to also invalidate `['stats', year, month]` (UTC year/month of `finished_on`) when a reading record transitions to `leido`.

## Impact

- **Backend:** new `backend/src/stats/` module (controller, service, DTO, spec); register `StatsModule` in `app.module.ts`. Reads existing `books` + `reading_records` (uses `idx_books_user_id`); no migration.
- **Frontend:** new `StatsPage` + dashboard components, `getMonthlyStats` in `api/client.ts`, types in `api/types.ts`, `/stats` route in `App.tsx`, nav link from `HomePage`; extend Book Tracker PATCH handler for stats cache invalidation. Charting library decision (e.g. `recharts` vs CSS bars) settled in design.
- **Docs:** `docs/api-spec.yml` (new `Stats` tag + path/schema), `docs/data-model.md` (computed stats note), `docs/product/user-stories.md` (link KAN-15 on US-05).
- **Product refs:** US-05, UC-07; Jira **KAN-15**.
- **Dependencies:** KAN-12 (`reading_records` with `status = leido` and `finished_on`); aligns with KAN-11/KAN-14 read definitions.
