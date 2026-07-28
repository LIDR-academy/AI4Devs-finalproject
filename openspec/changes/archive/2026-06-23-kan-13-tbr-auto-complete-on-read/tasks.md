## 0. Branch (mandatory first)

- [x] 0.1 Create and checkout feature branch `feature/KAN-13-tbr-auto-complete-on-read` from main

## 1. Audit existing implementation (verify-before-build)

- [x] 1.1 Confirm `backend/src/lists/tbr.service.ts` exposes `markCompletedIfInActiveMonthTbr(userId, bookId, finishedOn)` with active-month lookup from `finished_on` UTC
- [x] 1.2 Confirm `backend/src/books/books.service.ts` calls TBR service on `leido` transition and sets `meta.tbrAutoCompleted` when true
- [x] 1.3 Confirm `backend/src/books/books.module.ts` imports `ListsModule`
- [x] 1.4 Confirm `frontend/src/pages/BookTrackerPage.tsx` invalidates `['tbr', year, month]` when `tbrAutoCompleted` is true
- [x] 1.5 Confirm `docs/api-spec.yml` documents `PatchSideEffectsMeta.tbrAutoCompleted` on PATCH reading-record
- [x] 1.6 Implement any missing pieces from audit (skip if all present)

## 2. Backend hook (if gaps found in audit)

- [x] 2.1 Ensure `TBRService.markCompletedIfInActiveMonthTbr` sets `completed = true` and `completed_at` on open `tbr_entries` row
- [x] 2.2 Wire `BooksService.patchReadingRecord`: after save, on `leido` transition call TBR service; populate `meta.tbrAutoCompleted`
- [x] 2.3 Ensure TBR failure logs warn and does not roll back reading save or fail PATCH
- [x] 2.4 Extend `backend/src/books/dto/reading-record-response.dto.ts` with optional `tbrAutoCompleted` on meta DTO

## 3. Integration tests (backend)

- [x] 3.1 `backend/test/books.integration-spec.ts`: PATCH `leido` without TBR entry → `tbrAutoCompleted` undefined
- [x] 3.2 Same file: add book to current-month TBR → PATCH `leido` → `meta.tbrAutoCompleted === true` and GET TBR shows `completed: true`

## 4. Frontend cache coherence (if gaps found in audit)

- [x] 4.1 Ensure `frontend/src/api/types.ts` includes `tbrAutoCompleted?: boolean` on patch meta type
- [x] 4.2 Ensure `frontend/src/components/BookTrackerRow.tsx` passes `data.meta?.tbrAutoCompleted` to `onUpdated`
- [x] 4.3 Ensure `BookTrackerPage` invalidates TBR query using UTC month of `finished_on` when available

## 5. Manual test checklist

- [x] 5.1 Add `MANUAL-TEST-KAN-13.md` in change folder: add book to TBR → mark read on Book Tracker → verify completed on `/lists`
- [ ] 5.2 Link PR to Jira **KAN-13** when acceptance criteria pass

## 6. Review and update existing unit tests (mandatory)

- [x] 6.1 Review tests touched by `BooksService` and `TBRService`; adjust mocks for `markCompletedIfInActiveMonthTbr` where needed

## 7. Run unit tests and verify database state (mandatory)

- [x] 7.1 Capture pre-test database baseline for `tbr_entries` (count, sample completed flags)
- [x] 7.2 Run targeted tests: `cd backend && npm run test:integration -- books.integration-spec`
- [x] 7.3 Run full backend suite: `cd backend && npm test`
- [x] 7.4 Verify post-test database state and restore if tests leave orphaned TBR rows
- [x] 7.5 Save report to `openspec/changes/kan-13-tbr-auto-complete-on-read/reports/YYYY-MM-DD-step-7-unit-test-and-db-verification.md`

## 8. Manual endpoint testing with curl (mandatory — agent executes)

- [x] 8.1 Start backend (`cd backend && npm run start:dev`) and obtain JWT via `POST /v1/auth/dev-login`
- [x] 8.2 Create or pick a book; `POST /v1/tbr/{year}/{month}/entries` to add it to current-month TBR
- [x] 8.3 `PATCH /v1/books/{bookId}/reading-record` with `{ "status": "leido" }` — confirm `meta.tbrAutoCompleted: true`
- [x] 8.4 `GET /v1/tbr/{year}/{month}` — confirm entry `completed: true` and `completed_at` set
- [x] 8.5 Repeat PATCH on book **not** in TBR — confirm `tbrAutoCompleted` absent
- [x] 8.6 Document curl commands and responses in step-7 or step-8 report

## 9. E2E / UI verification (mandatory — agent executes)

- [x] 9.1 Start frontend and backend; manual UI pass per `MANUAL-TEST-KAN-13.md`
- [x] 9.2 Cross-check: mark book read on `/book-tracker` → navigate to `/lists` → entry shows completed styling

## 10. Update technical documentation (mandatory)

- [x] 10.1 Confirm `docs/api-spec.yml` PATCH reading-record description mentions `meta.tbrAutoCompleted`
- [x] 10.2 Update `docs/product/user-stories.md`: US-04 scenario 8 dependency from KAN-10 → **KAN-13**; add Jira link on scenario 8 row if applicable
- [x] 10.3 Remove or update US-04 technical note "ignore meta.tbrAutoCompleted in this historia" if still present
