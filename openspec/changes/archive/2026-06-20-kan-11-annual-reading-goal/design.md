## Context

`annual_reading_goals` is documented in `readme.md` §3.2.6 but listed as a planned extension in `docs/data-model.md`; no `goals` module exists in `backend/src/`. The SPA currently defaults to `/book-tracker`; Home (`/`) is not implemented. US-03 (KAN-11) requires saving a numeric annual target, showing «books_read / target» with percentage, and a pace-based forecast (UC-06). Progress is derived from `reading_records` where `status = 'leido'` and `finished_on` falls in the goal year — not stored on the goal row.

## Goals / Non-Goals

**Goals:**

- Persist `annual_reading_goals` with `UNIQUE (user_id, year)`.
- `GoalsService.getGoalWithProgress(userId, year)` — returns goal (or null), `books_read`, `progress_percent`, `forecast`.
- `GoalsService.upsertGoal(userId, year, targetBookCount)` — create or update target.
- REST: `GET` and `PUT` under `/v1/goals/{year}`; JWT user scoping.
- Forecast: linear projection from current pace; `ahead` / `on_track` / `behind` status per UC-06 §3a/3b.
- Home page at `/` with inline edit for target and progress display.
- Invalidate `['goals', year]` on Book Tracker when a book transitions to `leido`.

**Non-Goals:**

- `/goals` dedicated page, multi-year picker, or trend charts.
- Synchronous `BooksService` → `GoalsService` hook (compute on GET only).
- Stats dashboard integration (KAN-15).
- Timezone per-user configuration (UTC calendar year on server, consistent with KAN-12 date rules).

## Decisions

### 1. New `goals` module

```
backend/src/goals/
  goals.module.ts
  goals.controller.ts
  goals.service.ts
  entities/annual-reading-goal.entity.ts
  dto/
```

**Rationale:** Matches `readme.md` architecture (`GoalService` under `goals/`).

**Alternative:** Embed in `BooksModule` — rejected; violates feature boundaries.

### 2. Progress count query

Count books owned by user where reading record has `status = 'leido'` and `finished_on` in `[year-01-01, year+1-01-01)` (UTC date boundaries).

```sql
SELECT COUNT(*) FROM reading_records rr
JOIN books b ON b.id = rr.book_id
WHERE b.user_id = :userId
  AND rr.status = 'leido'
  AND rr.finished_on >= :yearStart
  AND rr.finished_on < :yearEnd;
```

**Rationale:** Single source of truth; same rule future `StatsService` will use (KAN-15).

### 3. Forecast algorithm

Computed only when **sufficient data**: `books_read >= 1` AND `days_elapsed >= 7` where `days_elapsed` = days from Jan 1 of `year` (or first `finished_on` of the year, whichever is later) to today (UTC).

| Field | Formula |
| --- | --- |
| `projected_year_end_count` | `round(books_read / days_elapsed * days_in_year)` |
| `pace_books_per_week` | `round(books_read / days_elapsed * 7, 1)` |
| `required_books_per_week` | `max(0, round((target - books_read) / weeks_remaining, 1))` |
| `on_track` | `projected_year_end_count >= target` |
| `status` | `ahead` if projection > target + 10%; `behind` if projection < target; else `on_track` |

When insufficient data, `forecast: null` and UI shows neutral copy.

**Alternative:** Require minimum 2 books — rejected; US-03 scenario 3 says «datos suficientes» without a hard book minimum beyond having pace signal.

### 4. REST shapes

```text
GET  /v1/goals/{year}
PUT  /v1/goals/{year}
Body: { "target_book_count": 50 }

200: {
  year: number,
  goal: { id, target_book_count, created_at, updated_at } | null,
  books_read: number,
  progress_percent: number | null,  // null when no goal set
  forecast: {
    projected_year_end_count, on_track, pace_books_per_week,
    required_books_per_week, status, message
  } | null
}
```

- `PUT` upserts by `(user_id, year)`; validates `target_book_count` integer 1–365.
- `GET` always returns 200 (even when `goal` is null) so Home can render empty state without 404 handling.
- `year` path param validated: 1970–2100.

### 5. Home route and default redirect

- Add `HomePage` at `/`.
- Change `App.tsx` default redirect from `/book-tracker` to `/` for authenticated users.
- `AnnualGoalCard` uses `useQuery(['goals', currentYear])`.

**Alternative:** Keep Book Tracker as default — rejected; PRD positions Home as primary landing with goal widget.

### 6. Cache invalidation on `leido`

Extend existing Book Tracker PATCH success handler (same location as TBR invalidation):

```typescript
if (status transitioned to 'leido') {
  const year = finished_on year UTC ?? current UTC year;
  queryClient.invalidateQueries({ queryKey: ['goals', year] });
}
```

No backend hook in `BooksService` — forecast recalculates on next GET.

### 7. Migration

`CreateAnnualReadingGoals` migration with table per `readme.md` §3.2.6; index on `UNIQUE (user_id, year)`.

## Risks / Trade-offs

| Risk | Mitigation |
| --- | --- |
| Forecast misleading early in year with 1 book | Require 7-day minimum; show neutral copy until threshold |
| Timezone mismatch (user finishes book «last day of year» locally) | Document UTC rule; align with KAN-12 `finished_on` semantics |
| Home route breaks existing bookmarks to `/book-tracker` | Book Tracker remains at `/book-tracker`; only default redirect changes |
| Duplicate count logic with future StatsService | Extract shared query helper or document contract for KAN-15 |

## Migration Plan

1. Run migration `npm run migration:run` in backend.
2. Deploy backend `goals` module before frontend Home (GET returns `goal: null` safely).
3. Rollback: `migration:revert`; remove goals routes; revert default redirect.

## Open Questions

- Copy language for forecast messages: Spanish in UI (product default) vs English in API `message` field — **decision:** Spanish in UI layer; API returns structured fields only (`status`, numbers); UI builds message string.
