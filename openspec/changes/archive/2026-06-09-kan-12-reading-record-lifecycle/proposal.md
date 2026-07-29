## Why

KAN-12 (US-04) is the critical next step after KAN-9: books enter the library as `pendiente`, but the tracker is still read-only. Without inline status, dates, rating, and format, the product cannot feed UC-07 stats, UC-05 TBR, or UC-06 goals. Implementing the reading-record lifecycle in Book Tracker unlocks accurate `leido` + `finished_on` data for downstream features.

## What Changes

- **`PATCH /v1/books/{bookId}/reading-record`**: partial update of `reading_records` (`status`, `started_on`, `finished_on`, `rating`, `read_format`) with server-side transition rules and validation (e.g. `finished_on` not before `started_on`).
- **Response metadata**: `meta.openCompletionModal: true` when status transitions to `leido` (UC-04 client flow); ignore `meta.tbrAutoCompleted` in this change.
- **Extended `GET /v1/books`**: list items include `started_on`, `finished_on`, `rating`, `read_format` (and existing `reading_status`) for the tracker table.
- **Book Tracker UI**: inline status selector, date pickers, star rating; completion modal on transition to `leido` (finish date, format, stars); TanStack Query cache updates without full page reload.
- **Contract docs**: add PATCH path and schemas to `docs/api-spec.yml` (aligned with `readme.md` §4 fragment).
- **Tests**: integration tests for PATCH transitions, date validation, user scoping; manual checklist for KAN-12 scenarios 1–7.

**Non-goals (explicit):**

- UC-03 page progress (`current_page`, progress bar) — separate story.
- UC-04 tags in completion modal — no `TagService` / tag tables.
- TBR auto-complete on `leido` (KAN-10 / scenario 8) and annual goal side effects (KAN-11 / scenario 9).
- `StatsService`, `TBRService`, `GoalService` recalculation hooks.

## Capabilities

### New Capabilities

- `reading-record-patch`: Authenticated PATCH endpoint, DTO validation, status transition rules, date/rating/format validation, `ReadingRecordPatchedResponse` with optional `meta.openCompletionModal`.
- `book-list-reading-fields`: Extended library list payload so Book Tracker can render dates, rating, and format without extra round-trips.
- `book-tracker-lifecycle-ui`: Interactive tracker row (status, dates, stars), completion modal, client error handling for 422 date validation.

### Modified Capabilities

- _(none — existing `openspec/specs/` capabilities are unchanged at requirement level; list extension is covered by `book-list-reading-fields`)_

## Impact

- **Backend (`backend/src/books/`):** new route on `BooksController`, `PatchReadingRecordDto`, service method `patchReadingRecord`, extended `BookListItemDto` / `listForUser`.
- **Frontend (`frontend/src/`):** `BookTrackerPage`, new components (`CompletionModal`, status/date/rating controls), `patchReadingRecord` in `api/client.ts` and `api/types.ts`.
- **Docs:** `docs/api-spec.yml`, optionally `docs/standards/frontend-standards.md` (tracker patterns).
- **Product refs:** `docs/product/user-stories.md` US-04, `docs/product/use-cases.md` UC-02, UC-04 (partial), Jira **KAN-12** (épica KAN-4).
- **Dependencies:** KAN-9 complete (`books` + `reading_records` schema exists). Blocks accurate data for KAN-15/KAN-16 stats until shipped.
