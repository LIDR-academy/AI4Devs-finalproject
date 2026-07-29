## Context

US-05 / UC-07 asks for a monthly reading-statistics dashboard. The data needed already exists: `reading_records` (status, rating, read_format, finished_on) joined to `books` (page_count, genre), scoped by `user_id`. The `goals` module is the architectural precedent — it computes period-scoped aggregates from `reading_records` on read (no denormalized counters) using TypeORM query builders and a `yearBounds` helper. KAN-15 follows the same pattern at month granularity.

Insights (KAN-16) and multi-period comparison (V1) are deliberately excluded so this change stays small and ships the read-only KPIs first.

## Goals / Non-Goals

**Goals:**

- A single authenticated endpoint returning all monthly KPIs in one response so the dashboard needs one request per month.
- A read definition identical to goals: `status = 'leido'` and `finished_on` within the month, so goals and stats never disagree.
- Aggregation pushed to SQL (`COUNT`/`SUM`/`AVG`/`GROUP BY`) rather than loading rows into Node.
- A dashboard with KPI cards, genre chart, format breakdown, and a month selector that refetches on change.

**Non-Goals:**

- Automatic insights / trends (KAN-16).
- Two-period comparison, custom ranges, year/all-time views.
- New tables or stored aggregates.
- Backfill or import flows.

## Decisions

### Decision 1: Compute on read, no new table

Reuse the goals approach: aggregate from `reading_records` + `books` per request. Stats datasets are small (one user's monthly reads) and correctness/consistency matter more than micro-optimizing reads.

- **Alternative considered:** a materialized `monthly_stats` table or counters updated on PATCH. Rejected for MVP — adds migration, write-path coupling, and cache-invalidation bugs for negligible gain.

### Decision 2: Endpoint shape `GET /v1/stats/{year}/{month}`

Mirror the month-scoped TBR routes (`/tbr/{year}/{month}`) and the goals controller validation style (`ParseIntPipe` + a static `validate` guard). Always `200` with a zeroed/empty payload when the user has no qualifying books (parallel to `/goals/{year}` returning `goal: null`).

Response (snake_case per `docs/data-model.md`):

```json
{
  "year": 2026,
  "month": 6,
  "books_read": 4,
  "pages_read": 1320,
  "average_rating": 4.25,
  "genre_distribution": [{ "genre": "Fantasy", "count": 2 }, { "genre": "unknown", "count": 1 }],
  "format_distribution": [{ "format": "fisico", "count": 3 }, { "format": "ebook", "count": 1 }],
  "predominant_format": "fisico"
}
```

`average_rating: number | null`, `predominant_format: string | null`.

- **Alternative considered:** `GET /v1/stats?year=&month=` query params. Rejected for consistency with the existing path-param month routes.

### Decision 3: Period semantics and null handling

- **Month window:** `[YYYY-MM-01, next-month-01)` on `finished_on`, computed with a `monthBounds(year, month)` helper analogous to `GoalsService.yearBounds` (December rolls to next year's January).
- **books_read:** count of qualifying reading records.
- **pages_read:** `SUM(books.page_count)` over qualifying books; `NULL` page counts treated as 0.
- **average_rating:** `AVG(rating)` over qualifying records with non-null rating; `null` when none rated; rounded to 2 decimals.
- **genre_distribution:** `GROUP BY books.genre` over qualifying books; `NULL` genre bucketed as `"unknown"`; ordered by count desc.
- **format_distribution:** `GROUP BY reading_records.read_format`; `NULL` bucketed as `"unknown"`.
- **predominant_format:** the non-`unknown` format with the highest count; ties broken deterministically (e.g. enum order `fisico` > `ebook` > `audio`); `null` when no format recorded.

### Decision 4: Frontend dashboard with isolated charting decision

`/stats` route renders KPI cards + a genre-distribution chart + a format breakdown + a month selector. Data via `useQuery({ queryKey: ['stats', year, month] })`, defaulting to the current UTC month (HomePage pattern). Loading, empty (no books), and error states are explicit.

- **Charting:** prefer a lightweight CSS/SVG bar list to avoid a new runtime dependency for the MVP; if a richer chart is wanted, add `recharts`. The chart is isolated in its own component/task so the choice does not block the rest.

### Decision 5: Cache coherence on read transitions

When a reading-record PATCH transitions to `leido`, invalidate `['stats', year, month]` for the UTC year/month of `finished_on`, reusing the existing goals-invalidation hook in the Book Tracker PATCH handler.

## Risks / Trade-offs

- **Genre data quality** (free-text/nullable `genre`) → chart may be noisy; mitigate with the `unknown` bucket and count-desc ordering; normalization is out of scope.
- **Month-boundary off-by-one** on `finished_on` → covered by explicit boundary unit tests (last day of month vs first of next).
- **DB-specific AVG/rounding** (Postgres numeric) → round and coerce types in the service; assert exact values in unit tests.
- **Compute-on-read cost grows with history** → acceptable for personal-scale data; `idx_books_user_id` already supports the user filter; revisit with aggregates only if profiling shows a problem.
- **New charting dependency risk** → mitigated by defaulting to no-dependency CSS bars.

## Migration Plan

No database migration (reads existing tables). Deploy backend `StatsModule` first, then frontend route. Rollback is removing the route/module; no data changes to revert.

## Open Questions

- Charting: CSS bars (default) vs `recharts` — confirm during implementation.
- Should `unknown` genre/format buckets be hidden when empty, or always shown with 0? (Lean: omit empty buckets.)
