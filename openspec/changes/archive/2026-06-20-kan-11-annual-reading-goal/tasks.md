## 0. Branch (mandatory first)

- [x] 0.1 Create and checkout feature branch `feature/KAN-11-annual-reading-goal` from main

## 1. API contract and docs

- [x] 1.1 Add goals paths to `docs/api-spec.yml`: `GET /v1/goals/{year}`, `PUT /v1/goals/{year}` with request/response schemas
- [x] 1.2 Add `annual_reading_goals` section to `docs/data-model.md` (remove from planned extensions)

## 2. Database migration (backend)

- [x] 2.1 Create migration `backend/src/migrations/<timestamp>-CreateAnnualReadingGoals.ts` per design.md
- [x] 2.2 Add TypeORM entity `backend/src/goals/entities/annual-reading-goal.entity.ts`
- [x] 2.3 Run `cd backend && npm run migration:run` and verify table exists

## 3. Goals module and API (backend)

- [x] 3.1 Scaffold `backend/src/goals/goals.module.ts`, `goals.controller.ts`, `goals.service.ts`, DTOs
- [x] 3.2 Implement `GoalsService.countBooksReadInYear(userId, year)` via join `books` + `reading_records`
- [x] 3.3 Implement `GoalsService.computeForecast(...)` per design.md thresholds and formulas
- [x] 3.4 Implement `GET /v1/goals/:year` — always 200 with `goal: null` when unset
- [x] 3.5 Implement `PUT /v1/goals/:year` — upsert with validation `target_book_count` 1–365
- [x] 3.6 Register `GoalsModule` in `app.module.ts`; JWT guard on goals routes
- [x] 3.7 Integration tests in `backend/test/goals.integration-spec.ts`: upsert, progress count, forecast with/without sufficient data, validation 400, user scoping

## 4. API client and types (frontend)

- [x] 4.1 Add goal types in `frontend/src/api/types.ts` (`AnnualGoalResponse`, `GoalForecast`, etc.)
- [x] 4.2 Add `getAnnualGoal(year)` and `upsertAnnualGoal(year, targetBookCount)` in `frontend/src/api/client.ts`

## 5. Home UI (frontend)

- [x] 5.1 Add `frontend/src/pages/HomePage.tsx` and styles with `AnnualGoalCard` component
- [x] 5.2 Wire TanStack Query `['goals', currentYear]`; show «N / target», percentage, progress bar, forecast message
- [x] 5.3 Register `/` route in `frontend/src/App.tsx`; set authenticated default to Home (keep `/book-tracker`)
- [x] 5.4 Extend Book Tracker PATCH success handler to invalidate `['goals', year]` on transition to `leido`

## 6. Verification and Jira

- [x] 6.1 Add `MANUAL-TEST-KAN-11.md` in change folder mapping US-03 scenarios 1–3
- [x] 6.2 Link PR to Jira **KAN-11** when acceptance criteria pass

## 7. Review and update existing unit tests (mandatory)

- [x] 7.1 Review Book Tracker tests/mocks for goals cache invalidation if unit tests cover PATCH handlers

## 8. Run unit tests and verify database state (mandatory)

- [x] 8.1 Capture pre-test database baseline for `annual_reading_goals`
- [x] 8.2 Run targeted tests: `cd backend && npm run test:integration -- goals.integration-spec`
- [x] 8.3 Run full backend suite: `cd backend && npm test`
- [x] 8.4 Verify post-test database state and restore if tests leave orphaned goal rows
- [x] 8.5 Save report to `openspec/changes/kan-11-annual-reading-goal/reports/YYYY-MM-DD-step-8-unit-test-and-db-verification.md`

## 9. Manual endpoint testing with curl (mandatory — agent executes)

- [x] 9.1 Start backend (`cd backend && npm run start:dev`) and obtain JWT via `POST /v1/auth/dev-login`
- [x] 9.2 `PUT /v1/goals/{year}` with `{ "target_book_count": 50 }` — confirm 200 and persisted goal
- [x] 9.3 `GET /v1/goals/{year}` — confirm `books_read`, `progress_percent` after marking books `leido`
- [x] 9.4 `GET /v1/goals/{year}` with insufficient data — confirm `forecast: null`
- [x] 9.5 `PUT` with invalid target — confirm 400; restore database state after tests
- [x] 9.6 Document curl commands and responses in step-8 or step-9 report

## 10. E2E / UI verification (mandatory — agent executes)

- [x] 10.1 Start frontend (`cd frontend && npm run dev`) with backend running
- [x] 10.2 Home: set goal 50 — confirm card shows saved target
- [x] 10.3 Mark book `leido` on Book Tracker — confirm Home card updates to new count without full page reload
- [x] 10.4 Document UI steps in `MANUAL-TEST-KAN-11.md` with pass/fail notes

## 11. Update technical documentation (mandatory)

- [x] 11.1 Confirm `docs/api-spec.yml` and `docs/data-model.md` match implementation
- [x] 11.2 Update `docs/product/user-stories.md` — link US-03 / US-04 scenario 9 to KAN-11
