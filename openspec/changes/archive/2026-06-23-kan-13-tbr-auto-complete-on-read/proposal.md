## Why

KAN-12 (US-04) shipped the reading-record lifecycle but explicitly deferred **scenario 8** — auto-completing the monthly TBR when a book is marked `leido`. Without this hook, readers must manually check off TBR entries on Lists after finishing a book on Book Tracker, breaking UC-02 §3b and UC-05. KAN-13 closes that gap by connecting `BooksService.patchReadingRecord` to `TBRService` once KAN-10 TBR infrastructure exists.

**Note:** The hook may already be implemented on the current branch as part of KAN-10 work. This change formalizes KAN-13 as the owning ticket, updates main specs, and verifies end-to-end behavior.

## What Changes

- **Backend hook:** On status transition to `leido`, call `TBRService.markCompletedIfInActiveMonthTbr(userId, bookId, finishedOn)`; set `tbr_entries.completed = true` and `completed_at` when an open entry exists in the active month's TBR.
- **PATCH response:** Include `meta.tbrAutoCompleted: true` when an entry was completed; omit otherwise.
- **Frontend cache:** When `tbrAutoCompleted` is true, invalidate TanStack Query `['tbr', year, month]` so `/lists` reflects completion without manual refresh.
- **Specs sync:** Replace KAN-12 "no TBR side effects" requirement in `reading-record-patch` with TBR auto-complete rules; extend `book-tracker-lifecycle-ui` cache coherence for TBR queries.
- **Tests & docs:** Integration tests for with/without TBR entry; manual checklist `MANUAL-TEST-KAN-13.md`; link KAN-13 on US-04 scenario 8 in `docs/product/user-stories.md`.

**Non-goals:**

- TBR list CRUD, auto-create job, or Lists page (KAN-10).
- Annual goal side effect on `leido` (KAN-11 / US-04 scenario 9).
- Auto-complete for months other than the UTC month of `finished_on`.
- Stats recalculation (KAN-15).

## Capabilities

### New Capabilities

_(none — integration hook only; no new REST endpoints or pages)_

### Modified Capabilities

- `reading-record-patch`: Remove "No TBR side effects"; add TBR auto-complete on transition to `leido` with `meta.tbrAutoCompleted`.
- `book-tracker-lifecycle-ui`: Extend cache coherence to invalidate active-month TBR query when `meta.tbrAutoCompleted` is true.

## Impact

- **Backend:** `backend/src/books/books.service.ts`, `backend/src/books/books.module.ts`, `backend/src/lists/tbr.service.ts`, `backend/src/books/dto/reading-record-response.dto.ts`.
- **Frontend:** `frontend/src/pages/BookTrackerPage.tsx`, `frontend/src/components/BookTrackerRow.tsx`, `frontend/src/api/types.ts`.
- **Tests:** `backend/test/books.integration-spec.ts`.
- **Docs:** `docs/api-spec.yml` (confirm `tbrAutoCompleted` documented), `docs/product/user-stories.md` (scenario 8 → KAN-13).
- **Dependencies:** KAN-10 (`lists` module, `monthly_tbr_lists`, `tbr_entries`); KAN-12 (`PATCH /v1/books/{bookId}/reading-record`).
- **Product refs:** US-04 scenario 8, US-02 scenario 3, UC-02 §3b, UC-05; Jira **KAN-13**.
