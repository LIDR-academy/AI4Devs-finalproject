## 0. Branch (mandatory first)

- [x] 0.1 Create and checkout feature branch `feature/KAN-10-tbr-add-pending-catalog` from current work branch

## 1. Backend — TBR entry eligibility

- [x] 1.1 In `TbrService.addEntry`, load `readingRecord` and return **422** `TBR_BOOK_NOT_PENDING` when `status !== 'pendiente'`
- [x] 1.2 Document 422 response on `POST /v1/tbr/{year}/{month}/entries` in `docs/api-spec.yml`
- [x] 1.3 Integration test in `backend/test/tbr.integration-spec.ts`: add `leyendo` book → 422

## 2. Frontend — Add to TBR modal

- [x] 2.1 Refactor `AddToTbrModal.tsx` with **Library** and **Search** tabs
- [x] 2.2 Library tab: filter `reading_status === 'pendiente'` and exclude `existingBookIds`; update empty state copy
- [x] 2.3 Search tab: debounced `searchCatalog`, edition selection, confirm button
- [x] 2.4 On catalog confirm: `createBook` → `addTbrEntry`; handle 409 duplicate (pending → add; non-pending → error)
- [x] 2.5 Update `ListsPage.tsx` to invalidate `['books']` and `['tbr', year, month]` on success
- [x] 2.6 Extend `AddToTbrModal.css` for tabs and search layout

## 3. Verification

- [x] 3.1 Update `openspec/changes/kan-10-monthly-tbr/MANUAL-TEST-KAN-10.md` or add `MANUAL-TEST-KAN-10-ADD-FLOW.md` with pending filter + catalog scenarios
- [x] 3.2 Manual curl: POST TBR entry for non-pending book → 422

## 4. Review and update existing unit tests (mandatory)

- [x] 4.1 Review `tbr.integration-spec.ts` and `books.integration-spec.ts` for regressions

## 5. Run unit tests and verify database state (mandatory)

- [x] 5.1 Run `cd backend && npm run test:integration -- tbr.integration-spec`
- [x] 5.2 Run `cd backend && npm test`
- [x] 5.3 Save report to `openspec/changes/kan-10-tbr-add-pending-catalog/reports/YYYY-MM-DD-step-5-unit-test-verification.md`

## 6. Manual endpoint testing with curl (mandatory — agent executes)

- [x] 6.1 POST TBR entry for `pendiente` book → 201
- [x] 6.2 PATCH book to `leyendo`, POST TBR entry → 422 `TBR_BOOK_NOT_PENDING`
- [x] 6.3 Document in step-5 report

## 7. E2E / UI verification (mandatory — agent executes)

- [ ] 7.1 Library tab shows only pending books
- [ ] 7.2 Search tab adds new catalog book to library + TBR
- [ ] 7.3 Verify `leyendo` book absent from library picker

## 8. Update technical documentation (mandatory)

- [x] 8.1 Confirm `docs/api-spec.yml` 422 on TBR POST
- [x] 8.2 Brief note in `docs/standards/frontend-standards.md` on TBR add modal tabs
