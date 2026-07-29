## 0. Branch (mandatory first)

- [x] 0.1 Create and checkout feature branch `feature/KAN-12-reading-record-lifecycle` from main

## 1. API contract and docs

- [x] 1.1 Add `PATCH /v1/books/{bookId}/reading-record` to `docs/api-spec.yml` (schemas: `PatchReadingRecordRequest`, `ReadingRecordPatchedResponse`, `PatchSideEffectsMeta`) aligned with `readme.md` §4
- [x] 1.2 Extend `BookListItem` schema in `docs/api-spec.yml` with `started_on`, `finished_on`, `rating`, `read_format`

## 2. Reading record PATCH (backend)

- [x] 2.1 Add `PatchReadingRecordDto` in `backend/src/books/dto/patch-reading-record.dto.ts` (`status`, `started_on`, `finished_on`, `rating`, `read_format`; min 1 field; no `current_page`)
- [x] 2.2 Add response DTOs in `backend/src/books/dto/reading-record-response.dto.ts` (`ReadingRecordResource`, `ReadingRecordPatchedResponse`, meta)
- [x] 2.3 Implement `BooksService.patchReadingRecord` with transition rules, date validation (`FINISHED_BEFORE_STARTED`), and `openCompletionModal` only on transition to `leido`
- [x] 2.4 Add `PATCH :bookId/reading-record` on `BooksController` with JWT guard
- [x] 2.5 Integration tests in `backend/test/books.integration-spec.ts`: pendiente→leyendo sets `started_on`; leyendo→leido returns `meta.openCompletionModal`; invalid date order 422; 404 other user

## 3. Extended library list (backend)

- [x] 3.1 Extend `BookListItemDto` and `listForUser` to return `started_on`, `finished_on`, `rating`, `read_format`
- [x] 3.2 Integration test: list includes reading fields for a seeded book

## 4. API client and types (frontend)

- [x] 4.1 Extend `Book` / list type in `frontend/src/api/types.ts` with reading date, rating, format fields
- [x] 4.2 Add `patchReadingRecord(bookId, body)` in `frontend/src/api/client.ts`

## 5. Book Tracker lifecycle UI (frontend)

- [x] 5.1 Add `ReadingStatusSelect` mapping Spanish labels to API enums
- [x] 5.2 Add `InlineDateField` and `StarRating` components (keyboard accessible)
- [x] 5.3 Add `CompletionModal` (finish date, format, stars; dismiss without extra PATCH)
- [x] 5.4 Refactor `BookTrackerPage.tsx`: new columns (Estado editable, Inicio, Fin, Puntuación); wire mutations + `openCompletionModal`
- [x] 5.5 Show inline error on 422 date validation (KAN-12 scenario 7)

## 6. Verification and Jira

- [x] 6.1 Add `MANUAL-TEST-KAN-12.md` in change folder mapping scenarios 1–7
- [ ] 6.2 Link PR to Jira **KAN-12** when acceptance criteria pass

## 7. Review and update existing unit tests (mandatory)

- [x] 7.1 Review unit/integration tests touched by this change; add or adjust cases for PATCH and list extensions

## 8. Run unit tests and verify database state (mandatory)

- [x] 8.1 Run targeted backend tests: `cd backend && npm run test:integration -- books.integration-spec` (6/6 passed)
- [x] 8.2 Run full backend suite if required: `cd backend && npm test` (15/15 passed)
- [ ] 8.3 Verify PostgreSQL state before/after (no orphaned rows); restore if tests mutate shared DB
- [ ] 8.4 Save report to `openspec/changes/archive/2026-06-09-kan-12-reading-record-lifecycle/reports/YYYY-MM-DD-step-8-unit-test-and-db-verification.md`

## 9. Manual endpoint testing with curl (mandatory — agent executes)

- [ ] 9.1 Start backend (`cd backend && npm run start:dev`) and obtain JWT via `POST /v1/auth/dev-login`
- [ ] 9.2 `GET /v1/books` — confirm extended reading fields on a library item
- [ ] 9.3 `PATCH /v1/books/{bookId}/reading-record` with `{ "status": "leyendo" }` — confirm `started_on` set
- [ ] 9.4 `PATCH` with `{ "status": "leido" }` — confirm `meta.openCompletionModal` and `finished_on`
- [ ] 9.5 `PATCH` with invalid date range — confirm 422 `FINISHED_BEFORE_STARTED`
- [ ] 9.6 Document curl commands and responses in step-8 or step-9 report

## 10. E2E / UI verification (mandatory — agent executes)

- [ ] 10.1 Manual UI pass on `/book-tracker` per `MANUAL-TEST-KAN-12.md` (all 7 scenarios)
- [ ] 10.2 Optional: Playwright smoke for status change + modal if project E2E exists

## 11. Update technical documentation (mandatory)

- [x] 11.1 Confirm `docs/api-spec.yml` matches implemented PATCH and list fields
- [x] 11.2 Update `docs/standards/frontend-standards.md` Book Tracker section with lifecycle components (brief)
