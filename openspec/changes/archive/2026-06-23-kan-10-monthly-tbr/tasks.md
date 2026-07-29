## 0. Branch (mandatory first)

- [x] 0.1 Create and checkout feature branch `feature/KAN-10-monthly-tbr` from main

## 1. API contract and docs

- [x] 1.1 Add TBR paths to `docs/api-spec.yml`: `GET /v1/tbr/{year}/{month}`, `POST /v1/tbr/{year}/{month}/entries`, `DELETE /v1/tbr/{year}/{month}/entries/{entryId}` with request/response schemas
- [x] 1.2 Document `meta.tbrAutoCompleted` on `ReadingRecordPatchedResponse` in `docs/api-spec.yml`
- [x] 1.3 Add `monthly_tbr_lists` and `tbr_entries` sections to `docs/data-model.md` (remove from "Planned extensions")

## 2. Database migration (backend)

- [x] 2.1 Create migration `backend/src/migrations/<timestamp>-CreateMonthlyTbrTables.ts` for `monthly_tbr_lists` and `tbr_entries` per design.md
- [x] 2.2 Add TypeORM entities `backend/src/lists/entities/monthly-tbr-list.entity.ts` and `tbr-entry.entity.ts`
- [x] 2.3 Run `cd backend && npm run migration:run` and verify tables exist

## 3. Lists module and TBR API (backend)

- [x] 3.1 Scaffold `backend/src/lists/lists.module.ts`, `tbr.controller.ts`, `tbr.service.ts`, DTOs
- [x] 3.2 Implement `TBRService.getOrCreateMonthlyTbr` with idempotent create (`ON CONFLICT` or equivalent)
- [x] 3.3 Implement `GET /v1/tbr/:year/:month` returning list + entries with book summary
- [x] 3.4 Implement `POST /v1/tbr/:year/:month/entries` (404 not owned, 409 duplicate)
- [x] 3.5 Implement `DELETE /v1/tbr/:year/:month/entries/:entryId`
- [x] 3.6 Register `ListsModule` in `app.module.ts`; JWT guard on TBR routes
- [x] 3.7 Integration tests in `backend/test/tbr.integration-spec.ts`: getOrCreate idempotent, add entry, duplicate 409, delete entry, user scoping 404

## 4. Auto-create job (backend)

- [x] 4.1 Add `@nestjs/schedule` if missing; register `ScheduleModule` in `AppModule`
- [x] 4.2 Implement `backend/src/lists/jobs/tbr-auto-create.job.ts` — daily job creates next-month empty lists with `auto_created = true` when missing
- [x] 4.3 Integration or unit test: job skips months that already have a list

## 5. Reading-record TBR hook (backend)

- [x] 5.1 Implement `TBRService.markCompletedIfInActiveMonthTbr(userId, bookId, finishedOn)` 
- [x] 5.2 Import `ListsModule` into `BooksModule`; inject `TBRService` in `BooksService.patchReadingRecord`
- [x] 5.3 On transition to `leido`, set `meta.tbrAutoCompleted: true` when an open entry is completed
- [x] 5.4 Extend `backend/test/books.integration-spec.ts`: book in current-month TBR → PATCH `leido` returns `tbrAutoCompleted: true`; book not in TBR → flag absent/false

## 6. API client and types (frontend)

- [x] 6.1 Add TBR types in `frontend/src/api/types.ts` (`MonthlyTbrResponse`, `TbrEntry`, etc.)
- [x] 6.2 Add `getMonthlyTbr`, `addTbrEntry`, `removeTbrEntry` in `frontend/src/api/client.ts`
- [x] 6.3 Extend `PatchSideEffectsMeta` with `tbrAutoCompleted`; invalidate `['tbr', year, month]` on `patchReadingRecord` when true

## 7. Lists UI (frontend)

- [x] 7.1 Add `frontend/src/pages/ListsPage.tsx` and `ListsPage.css` with month navigation (default current month)
- [x] 7.2 Add `TbrEmptyState`, `TbrEntryRow`, `AddToTbrModal` under `frontend/src/components/`
- [x] 7.3 Register `/lists` route and nav link in `frontend/src/App.tsx`
- [x] 7.4 Wire TanStack Query `['tbr', year, month]`; completed entry styling (check + strikethrough)

## 8. Verification and Jira

- [x] 8.1 Add `MANUAL-TEST-KAN-10.md` in change folder mapping US-02 scenarios 1–3
- [ ] 8.2 Link PR to Jira **KAN-10** when acceptance criteria pass

## 9. Review and update existing unit tests (mandatory)

- [x] 9.1 Review tests touched by `BooksService` and new `lists` module; adjust mocks for `TBRService` where needed

## 10. Run unit tests and verify database state (mandatory)

- [x] 10.1 Capture pre-test database baseline for `monthly_tbr_lists` and `tbr_entries`
- [x] 10.2 Run targeted tests: `cd backend && npm run test:integration -- tbr.integration-spec` and `books.integration-spec`
- [x] 10.3 Run full backend suite: `cd backend && npm test`
- [x] 10.4 Verify post-test database state and restore if tests leave orphaned TBR rows
- [x] 10.5 Save report to `openspec/changes/kan-10-monthly-tbr/reports/YYYY-MM-DD-step-10-unit-test-and-db-verification.md`

## 11. Manual endpoint testing with curl (mandatory — agent executes)

- [x] 11.1 Start backend (`cd backend && npm run start:dev`) and obtain JWT via `POST /v1/auth/dev-login`
- [x] 11.2 `GET /v1/tbr/{year}/{month}` — confirm lazy create returns empty list
- [x] 11.3 `POST /v1/tbr/{year}/{month}/entries` — add book; confirm 201; test 409 duplicate
- [x] 11.4 `PATCH /v1/books/{bookId}/reading-record` with `{ "status": "leido" }` — confirm `meta.tbrAutoCompleted: true`
- [x] 11.5 `GET /v1/tbr/{year}/{month}` — confirm entry `completed: true`
- [x] 11.6 `DELETE` entry — confirm removal; restore database state after tests
- [x] 11.7 Document curl commands and responses in step-10 or step-11 report

## 12. E2E / UI verification (mandatory — agent executes)

- [x] 12.1 Start frontend and backend; manual UI pass on `/lists` per `MANUAL-TEST-KAN-10.md` (scenarios 1–3)
- [x] 12.2 Cross-check: mark book read on `/book-tracker` updates TBR checklist on `/lists`

## 13. Update technical documentation (mandatory)

- [x] 13.1 Confirm `docs/api-spec.yml` and `docs/data-model.md` match implementation
- [x] 13.2 Update `docs/standards/frontend-standards.md` with Lists/TBR page patterns (brief)
- [x] 13.3 Add KAN-10 Jira link on US-02 row in `docs/product/user-stories.md`
