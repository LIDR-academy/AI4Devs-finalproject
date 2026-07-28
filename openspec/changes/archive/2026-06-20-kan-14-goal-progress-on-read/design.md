## Context

KAN-12 (US-04) deferred **scenario 9** — annual goal progress update when a book is marked `leido`. KAN-11 delivered `GoalsService`, `annual_reading_goals`, Home (`AnnualGoalCard`), and basic goals cache invalidation on transition to `leido` in `BookTrackerPage`. KAN-14 formalizes US-04 scenario 9 as a subtask of KAN-11, closes cache-coherence gaps, and adds integration tests.

Progress is **not stored** on `annual_reading_goals`; `GoalsService.getGoalWithProgress()` derives `books_read`, `progress_percent`, and `forecast` from `reading_records` on each `GET /v1/goals/{year}`. KAN-11 design explicitly rejected a synchronous `BooksService → GoalsService` backend hook.

The goal year for cache invalidation is the **UTC calendar year of the persisted `finished_on`** after KAN-12 auto-fill (not necessarily "today" if the client sends an explicit finish date).

## Goals / Non-Goals

**Goals:**

- Ensure Home goal card reflects updated `books_read` and `forecast` after Book Tracker PATCH without full page reload.
- Extend frontend goals cache invalidation for: transition to `leido`, transition from `leido`, and `finished_on` year changes.
- Integration tests for increment, decrement, and year-boundary cases via `PATCH` + `GET /v1/goals/{year}`.
- Sync main specs and user-stories Jira link for scenario 9 → KAN-14.

**Non-Goals:**

- Backend hook in `BooksService` or new `recomputeProgress` method (compute-on-GET per KAN-11).
- New REST endpoints, migrations, or `GoalsModule` structural changes.
- `StatsService` / `GET /v1/stats` (KAN-15).
- TBR side effects (KAN-13).

## Decisions

### 1. No backend hook — compute on GET

Progress recalculates when the client refetches `GET /v1/goals/{year}` after TanStack Query invalidation. No `GoalsService` injection into `BooksModule`.

**Rationale:** KAN-11 design §6; single source of truth in SQL count query; avoids coupling books and goals modules.

**Alternative considered:** `BooksService` calls `GoalsService.recomputeProgress()` — rejected; no persisted progress cache to update.

### 2. Frontend invalidation trigger matrix

Extend `BookTrackerPage.invalidateBooks()` (or equivalent helper) to invalidate goals when any of:

| Event | Invalidate |
| --- | --- |
| Status transitions **to** `leido` | `['goals', utcYear(finished_on)]` |
| Status transitions **from** `leido` | `['goals', utcYear(previousFinishedOn)]` |
| `finished_on` changes on `leido` book | Both previous and new UTC years when they differ |
| `finished_on` changes while not `leido` | No goals invalidation |

Use persisted `reading.finished_on` from PATCH response; fallback to current UTC year when absent after server auto-fill.

**Rationale:** Home uses `['goals', currentUtcYear]`; invalidating the affected year(s) triggers refetch on next visit.

**Alternative considered:** Optimistic update of goals cache — rejected; server count query is authoritative and cheap.

### 3. `BookTrackerRow` callback contract

Pass to `onUpdated`:

```typescript
onUpdated({
  tbrAutoCompleted?: boolean;
  finishedOn?: string | null;
  previousFinishedOn?: string | null;
  previousStatus: ReadingStatus;
  newStatus: ReadingStatus;
});
```

Derive invalidation flags in `BookTrackerPage` from status and date deltas.

**Rationale:** Row owns pre-mutation state; page owns query client.

### 4. Verification-first apply strategy

During `/opsx:apply`, audit KAN-11 implementation first. If transition-to-`leido` invalidation already exists, focus on gaps (revert, year change), tests, docs, and manual checklist.

### 5. Integration test location

Add scenarios to `backend/test/goals.integration-spec.ts`:

- PATCH `leido` → GET goals increments (may already exist).
- PATCH `leido` then revert to `leyendo` → GET goals decrements.
- PATCH `finished_on` across year boundary → GET for both years reflects correct counts.

**Rationale:** Goals API owns progress semantics; books PATCH is the mutation entry point.

## Risks / Trade-offs

- **[Risk] Only invalidating current year on revert** → **Mitigation:** Use `previousFinishedOn` from row state, not `currentUtcYear`.
- **[Risk] Completion modal PATCH skips goals invalidation** → **Mitigation:** Initial status transition already invalidates; modal PATCH only updates optional fields — if `finished_on` changes in modal, extend invalidation in completion mutation success handler.
- **[Risk] Duplicate work with KAN-11** → **Mitigation:** Verify-before-implement audit step in tasks.
- **[Risk] UTC vs local year boundary** → **Mitigation:** Document UTC; align with KAN-11/KAN-12 date rules.

## Migration Plan

1. Audit existing KAN-11 goals invalidation in frontend.
2. Implement cache-coherence gaps and integration tests.
3. Manual Book Tracker → Home pass per `MANUAL-TEST-KAN-14.md`.
4. Update `docs/product/user-stories.md` scenario 9 → KAN-14.
5. Archive merges delta specs into main `openspec/specs/`.

## Open Questions

- None blocking — invalidation uses UTC year of persisted `finished_on` per KAN-11.
