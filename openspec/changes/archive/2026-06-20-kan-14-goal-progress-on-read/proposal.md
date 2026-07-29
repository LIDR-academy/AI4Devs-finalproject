## Why

KAN-12 (US-04) shipped the reading-record lifecycle but explicitly deferred **scenario 9** — updating annual goal progress when a book is marked `leido`. KAN-11 delivered `GoalsService`, `annual_reading_goals`, and the Home goal card, but the end-to-end US-04 scenario 9 side effect (Book Tracker → Home progress refresh) was scoped as a follow-up subtask. Without completing this connection, readers must manually refresh Home to see updated counts after finishing a book, breaking UC-06 and the US-04 acceptance criteria for goal coherence.

**Note:** Basic goals cache invalidation on transition to `leido` may already exist on the current branch from KAN-11. This change formalizes KAN-14 as the owning ticket, closes cache-coherence gaps (revert from `leido`, `finished_on` year change), adds integration tests, and updates main specs.

## What Changes

- **Verify compute-on-GET pattern:** Progress remains derived from `reading_records` via `GoalsService.getGoalWithProgress()` on `GET /v1/goals/{year}` — no backend `BooksService → GoalsService` hook (per KAN-11 design).
- **Frontend cache coherence:** Extend Book Tracker PATCH success handling to invalidate `['goals', year]` on transition **to** `leido`, transition **from** `leido`, and when `finished_on` changes the UTC goal year(s).
- **Specs sync:** Extend `book-tracker-lifecycle-ui` cache coherence requirements for goals invalidation edge cases; confirm `annual-reading-goal-api` scenario for progress after PATCH.
- **Tests & docs:** Integration tests for increment, decrement, and year-boundary cases; manual checklist `MANUAL-TEST-KAN-14.md`; link KAN-14 on US-04 scenario 9 in `docs/product/user-stories.md`.

**Non-goals:**

- New REST endpoints, database migrations, or `GoalsModule` changes (KAN-11).
- Backend synchronous hook or `recomputeProgress` method (progress is computed on GET).
- `StatsService` / `GET /v1/stats` integration (KAN-15).
- TBR side effects (KAN-13) or TBR CRUD (KAN-10).

## Capabilities

### New Capabilities

_(none — frontend cache coherence and test coverage only; no new REST endpoints or pages)_

### Modified Capabilities

- `book-tracker-lifecycle-ui`: Extend goals cache invalidation to cover transition from `leido`, `finished_on` year changes, and dual-year invalidation when a finish date moves across calendar years.
- `annual-reading-goal-api`: Add explicit requirement scenario for progress decrement when status reverts from `leido` and when `finished_on` moves out of the goal year.

## Impact

- **Frontend:** `frontend/src/pages/BookTrackerPage.tsx`, `frontend/src/components/BookTrackerRow.tsx`.
- **Backend:** No structural changes expected; integration tests in `backend/test/goals.integration-spec.ts`.
- **Docs:** `docs/product/user-stories.md` (scenario 9 → KAN-14).
- **Dependencies:** KAN-11 (`goals` module, `annual_reading_goals`, Home + `AnnualGoalCard`); KAN-12 (`PATCH /v1/books/{bookId}/reading-record`).
- **Product refs:** US-04 scenario 9, US-03 scenarios 2–3, UC-02 (side effect), UC-06; Jira **KAN-14** (subtask of KAN-11).
