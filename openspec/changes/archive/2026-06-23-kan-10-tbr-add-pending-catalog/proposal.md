## Why

KAN-10 shipped a basic "Add book to TBR" modal that lists every library title not already on the list. That mixes books already being read or finished with titles that still make sense as monthly reading plans. UC-05 §3a also expects adding catalog titles not yet in the library in the same flow (UC-01 + TBR). This follow-up aligns the TBR add experience with product intent: only `pendiente` books from the library, plus catalog search that creates new library entries as `pendiente` and adds them to the active TBR.

## What Changes

- **Add to TBR modal — library tab:** show only books with `reading_status === pendiente` that are not already on the current month's TBR; exclude `leyendo`, `leido`, and `dnf`.
- **Add to TBR modal — catalog search:** search field (reuse `GET /v1/books/catalog/search`) to find editions not in the library; on confirm, `POST /v1/books` (creates `reading_records.status = pendiente`) then `POST /v1/tbr/{year}/{month}/entries`.
- **Empty states:** distinct copy when no pending library books vs when search returns no results.
- **Backend guard (optional but recommended):** `POST /v1/tbr/{year}/{month}/entries` returns **422** when the target book's reading status is not `pendiente` (prevents API bypass).
- **Cache invalidation:** after catalog add, invalidate `['books']` and `['tbr', year, month]`.

**Non-goals:**

- Drag & drop reorder.
- Cover picker in TBR catalog flow (use edition default/hint cover unless user asks later; can reuse `AddBookModal` cover step in a follow-up).
- Changing TBR auto-complete or monthly list creation rules.

## Capabilities

### New Capabilities

- `tbr-add-book-flow`: Pending-only library picker, catalog search tab/section, create-book-then-add-to-TBR orchestration, empty states, and server-side eligibility rule on TBR entry creation.

### Modified Capabilities

- _(none in `openspec/specs/` yet — KAN-10 `monthly-tbr-ui` delta requirements are superseded by `tbr-add-book-flow` at archive time)_

## Impact

- **Frontend:** `AddToTbrModal.tsx` (tabs or sections: Library / Search), `ListsPage.tsx` mutation orchestration; reuse `searchCatalog`, `createBook`, `catalogEditionToCreatePayload` from `api/client.ts`.
- **Backend:** `TbrService.addEntry` — validate `readingRecord.status === 'pendiente'` before insert; integration test for 422.
- **Docs:** update `MANUAL-TEST-KAN-10.md` add-flow scenarios; no new REST endpoints.
- **Product refs:** UC-05 §3a, UC-01, KAN-10 follow-up.
