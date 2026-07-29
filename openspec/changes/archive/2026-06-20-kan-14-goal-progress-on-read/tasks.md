## 0. Branch (mandatory first)

- [x] 0.1 Create and checkout feature branch `feature/KAN-14-goal-progress-on-read` from main

## 1. Audit existing implementation (verify-before-build)

- [x] 1.1 Confirm KAN-11 merged: `GoalsModule`, `annual_reading_goals` migration, `GET/PUT /v1/goals/{year}`, Home + `AnnualGoalCard`
- [x] 1.2 Confirm `frontend/src/pages/BookTrackerPage.tsx` invalidates `['goals', year]` on transition to `leido`
- [x] 1.3 Confirm `GoalsService.countBooksReadInYear()` uses `status = leido` and `finished_on` UTC year bounds
- [x] 1.4 Identify gaps: revert from `leido`, `finished_on` year change, completion modal `finished_on` edit
- [x] 1.5 Implement any missing pieces from audit (skip sections if all present)

## 2. Frontend cache coherence (if gaps found in audit)

- [x] 2.1 Refactor `BookTrackerPage.invalidateBooks()` to accept status/date deltas and invalidate all affected goal years
- [x] 2.2 Update `BookTrackerRow.tsx` to pass `previousStatus`, `previousFinishedOn`, and new `reading` fields to `onUpdated`
- [x] 2.3 Invalidate goals on transition **from** `leido` using UTC year of previous `finished_on`
- [x] 2.4 Invalidate both previous and new goal years when `finished_on` changes on a `leido` book
- [x] 2.5 Ensure completion modal mutation invalidates goals when `finished_on` year changes

## 3. Integration tests (backend)

- [x] 3.1 Confirm `backend/test/goals.integration-spec.ts` has PATCH `leido` → GET goals increment test
- [x] 3.2 Add test: PATCH `leido` then revert to `leyendo` → GET goals decrements `books_read`
- [x] 3.3 Add test: PATCH `finished_on` from year A to year B → GET for both years reflects correct counts
- [x] 3.4 Add test: PATCH `leido` with `finished_on` outside goal year → GET goal year unchanged

## 4. Manual test checklist

- [x] 4.1 Add `MANUAL-TEST-KAN-14.md` in change folder: goal set → mark read on Book Tracker → Home shows updated count and forecast
- [x] 4.2 Include scenarios for revert from `leido` and cross-year `finished_on` edit
- [x] 4.3 Link PR to Jira **KAN-14** when acceptance criteria pass

## 5. Review and update existing unit tests (mandatory)

- [x] 5.1 Review Book Tracker frontend tests/mocks for extended `onUpdated` callback if unit tests exist
- [x] 5.2 Review `goals.integration-spec.ts` setup for multi-book revert and year-boundary cases

## 6. Run unit tests and verify database state (mandatory)

- [x] 6.1 Capture pre-test database baseline for `reading_records` and `annual_reading_goals` counts
- [x] 6.2 Run targeted tests: `cd backend && npm run test:integration -- goals.integration-spec`
- [x] 6.3 Run full backend suite: `cd backend && npm test`
- [x] 6.4 Verify post-test database state and restore if tests leave orphaned rows
- [x] 6.5 Save report to `openspec/changes/kan-14-goal-progress-on-read/reports/YYYY-MM-DD-step-6-unit-test-and-db-verification.md`

## 7. Manual endpoint testing with curl (mandatory — agent executes)

- [x] 7.1 Start backend (`cd backend && npm run start:dev`) and obtain JWT via `POST /v1/auth/dev-login`
- [x] 7.2 `PUT /v1/goals/{year}` with `{ "target_book_count": 50 }` — note baseline `books_read`
- [x] 7.3 `PATCH /v1/books/{bookId}/reading-record` with `{ "status": "leido" }` — confirm `finished_on` set
- [x] 7.4 `GET /v1/goals/{year}` — confirm `books_read` incremented and `forecast` present when sufficient data
- [x] 7.5 PATCH same book back to `{ "status": "leyendo" }` — confirm GET goals decrements
- [x] 7.6 Document curl commands and responses in step-6 or step-7 report

## 8. E2E / UI verification (mandatory — agent executes)

- [x] 8.1 Start frontend and backend; manual UI pass per `MANUAL-TEST-KAN-14.md`
- [x] 8.2 Cross-check: mark book read on `/book-tracker` → navigate to `/` → goal card shows updated count without F5

## 9. Update technical documentation (mandatory)

- [x] 9.1 Update `docs/product/user-stories.md`: US-04 scenario 9 dependency from KAN-11 → **KAN-14** (KAN-11 = infra; KAN-14 = side effect)
- [x] 9.2 Confirm no doc references to non-existent `recomputeProgress` or `GET /v1/stats` for this scenario
