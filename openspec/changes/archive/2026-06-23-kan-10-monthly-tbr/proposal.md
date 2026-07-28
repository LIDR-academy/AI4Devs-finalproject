## Why

KAN-10 (US-02, UC-05 partial) delivers the monthly TBR workflow that the PRD and Home roadmap depend on. Books can already transition to `leido` via KAN-12, but TBR tables, APIs, and the Lists UI do not exist yet—readers cannot plan monthly reading or see checklist completion when they finish a book. This change introduces the minimum TBR surface (auto-create, empty-state UX, add/remove entries, auto-complete on read) so UC-02 scenario 8 and US-02 scenarios 1–3 are satisfied.

## What Changes

- **Database:** new tables `monthly_tbr_lists` and `tbr_entries` with `UNIQUE (user_id, year, month)` and `UNIQUE (monthly_tbr_id, book_id)` per `readme.md` §3.2.5.
- **`lists` module (backend):** `TBRService` with `getOrCreateMonthlyTbr`, entry CRUD, and `markCompletedIfInActiveMonthTbr`.
- **REST API:** `GET /v1/tbr/{year}/{month}`, `POST /v1/tbr/{year}/{month}/entries`, `DELETE /v1/tbr/{year}/{month}/entries/{entryId}`.
- **Auto-create:** daily job creates an empty list the day before a month starts when missing; `GET` also lazy-creates on first access (idempotent).
- **Reading-record hook:** when `PATCH /v1/books/{bookId}/reading-record` transitions to `leido`, complete matching open entry in the **current calendar month** TBR and return `meta.tbrAutoCompleted: true` when applicable.
- **Lists UI:** new `/lists` route with month selector (default current month), empty-state CTA, checklist with completed styling, add-from-library flow.
- **Docs & tests:** update `docs/data-model.md` and `docs/api-spec.yml`; integration tests for TBR CRUD and auto-complete; manual checklist `MANUAL-TEST-KAN-10.md`.

**Non-goals (explicit):**

- Drag & drop reorder (`sort_order` append-only on add; reorder API/UI deferred).
- Custom lists, favorites, challenges (PRD Lists beyond monthly TBR).
- Home TBR progress widget.
- Bulk planning of 12 future months (only `getOrCreate` per requested month).
- Auto-complete for past-month TBR entries when marking `leido` today (current month only per US-02 scenario 3).
- `StatsService` / `GoalService` hooks (KAN-11, KAN-15).

## Capabilities

### New Capabilities

- `monthly-tbr-lists`: Schema migration, `TBRService`, monthly list auto-create (job + lazy), authenticated TBR REST endpoints, user scoping, duplicate-entry guards.
- `monthly-tbr-ui`: Lists page, month navigation, empty state, add/remove entries from library, completed-entry display, TanStack Query cache invalidation on `tbrAutoCompleted`.

### Modified Capabilities

- `reading-record-patch`: Replace "no TBR side effects" with requirement to invoke `TBRService` on transition to `leido` and set `meta.tbrAutoCompleted` when an open entry in the active month is completed.

## Impact

- **Backend:** new `backend/src/lists/` module; migration; `BooksModule` imports `ListsModule` for `TBRService`; optional `@nestjs/schedule` cron for auto-create job.
- **Frontend:** `ListsPage`, TBR components, `api/client.ts` + `api/types.ts`, route and nav link in `App.tsx`.
- **Docs:** `docs/data-model.md`, `docs/api-spec.yml`, `docs/product/user-stories.md` (link KAN-10 on US-02).
- **Product refs:** US-02, UC-05 (partial), Jira **KAN-10** (épica KAN-5).
- **Dependencies:** requires KAN-12 (`PATCH` reading record + `leido` transitions). Blocks Home TBR widget until a follow-up ticket.
