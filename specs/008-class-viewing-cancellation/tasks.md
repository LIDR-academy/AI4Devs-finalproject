---

description: "Task list for Class Viewing & Cancellation (US-2.3 / COACHER-17)"
---

# Tasks: Class Viewing & Cancellation

**Input**: Design documents from `/specs/008-class-viewing-cancellation/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Test tasks ARE included because the project constitution (§II Test-First) mandates tests written and failing before production code for domain services (100% branch coverage) and happy-path + validation-error coverage for every endpoint.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1 = list schedule, US2 = cancel class, US3 = class detail)
- Include exact file paths in descriptions

## Path Conventions

- **Web app** (this project): `backend/src/`, `frontend/src/`
- Backend: hexagonal layers — `application/use-cases/`, `domain/services/`, `infrastructure/routes/`, `infrastructure/dto/`, `config/container.ts`, `__tests__/`
- Frontend: `domain/types/`, `infrastructure/repositories/`, `infrastructure/hooks/`, `ui/components/`, `ui/pages/admin/`, `ui/pages/coach/`

---

## Phase 1: Setup (Verification Baseline)

**Purpose**: Confirm the repository compiles, tests pass, and the database is ready before any changes. No infrastructure is created — the project stack already exists.

- [X] T001 Verify backend baseline: run `npm run typecheck` and `npm test` in `backend/` and record the result (must be green before starting)
- [X] T002 Verify frontend baseline: run `npm run typecheck` and `npm test` in `frontend/` and record the result (must be green before starting)
- [X] T003 Verify database state: run `npm run db:migrate` and `npm run db:seed` in `backend/` (no schema changes are expected; this confirms a usable local DB)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared contracts/types used by more than one user story.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Extend the backend class DTO with list metadata and role-scoped fields (`visibility?: "blue" | "green" | "gray"`, `coacheeStatus?: { isEnrolled, isOnWaitingList, isWithinReach }`, `ListMeta { page, limit, total, totalPages }`) in `backend/src/infrastructure/dto/trainingClassDto.ts`
- [X] T005 [P] Extend frontend class domain types (`ListClassesParams`, `ListClassesResponse` with meta, `coacheeStatus`/`visibility` on `TrainingClass`) in `frontend/src/domain/types/class.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - View and filter the class schedule (Priority: P1) 🎯 MVP

**Goal**: Admin/Coach can request the class list for a required date range, filter by `classType` and `coachId`, browse pages, and see the schedule with correct role-based visibility (Coachee receives `visibility` per the contract). Reworks the current `GET /classes` (which returns everything unfiltered).

**Independent Test**: Query `GET /classes?start=...&end=...` (with and without filters) against a known set of classes — exactly the in-range classes are returned, filters are honored, `meta.total` matches, and a missing/inverted range returns `400`. Frontend: the list renders for a chosen range with working filters.

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T006 [P] [US1] Rework `GET /classes` API tests to the contract in `backend/src/__tests__/classes.test.ts`: 200 happy path with `{ data, meta }`, 400 for missing/inverted date range, 400 for invalid `classType`/`coachId`, 200 for coachee role returning `visibility` per class
- [X] T007 [P] [US1] Unit test `ListTrainingClasses` in `backend/src/__tests__/ListTrainingClasses.test.ts`: date-range boundary (inclusive start/end), `classType`/`coachId` filters, pagination meta, Admin/Coach see-all vs Coachee scoping with visibility classification

### Implementation for User Story 1

- [X] T008 [P] [US1] Rework `ListTrainingClasses` use case in `backend/src/application/use-cases/ListTrainingClasses.ts`: accept `{ start, end, classType?, coachId?, page, limit, viewerRole, viewerId }`, filter by `start_time ∈ [start, end]` with `classType`/`coachId`, paginate, and compute Coachee `visibility` (blue own/enrolled, green within-reach group with open spot via `ReachCalculator`, gray otherwise)
- [X] T009 [P] [US1] Add `classesRepository.list(params)` to `frontend/src/infrastructure/repositories/classesRepository.ts` (query string with `start`/`end`/`classType`/`coachId`/`page`/`limit`; returns `{ data, meta }`)
- [X] T010 [US1] Rework the `GET /classes` route in `backend/src/infrastructure/routes/classes.ts`: strict Zod query schema (required `start`/`end`, optional `classType`/`coachId`, `page`/`limit`), allow any authenticated role with role-scoping delegated to the use case, return `{ data, meta }`; register the reworked use case in `backend/src/config/container.ts`
- [X] T011 [US1] Create `useListClasses` query hook (React Query v5) in `frontend/src/infrastructure/hooks/useListClasses.ts` (params-driven, page-aware)
- [X] T012 [US1] Create `ClassList` component in `frontend/src/ui/components/ClassList.tsx`: date-range picker, `classType`/assigned-coach filters, paginated table, canceled classes shown gray with a "Canceled" tag
- [X] T013 [US1] Wire `ClassList` into `frontend/src/ui/pages/admin/CalendarPage.tsx`, `frontend/src/ui/pages/admin/TodayPage.tsx`, `frontend/src/ui/pages/coach/CalendarPage.tsx`, `frontend/src/ui/pages/coach/TodayPage.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently (backend contract + Admin/Coach list UI + Coachee scoping)

---

## Phase 4: User Story 2 - Cancel a class, single or whole series (Priority: P1)

**Goal**: Authorized Admin/Coach soft-cancels a class (`status → CANCELED`), keeps it visible gray, frees the Google Calendar slot, records audit + type-7 notifications, and supports `scope=single` vs `scope=series` (future only). New `DELETE /recurring-series/:id` cancels the series at its root. Replaces the current hard-deleting `DELETE /classes/:id`.

**Independent Test**: Cancel a class as the assigned Coach → `200 { id, status: "CANCELED", canceledInstances: null }`, still listed, calendar event gone; cancel a recurring instance with `scope=series` → `canceledInstances` equals remaining future ACTIVE instances and past instances are untouched; Coachee/non-assigned-Coach → `403`; double-cancel → `409`; audit row + type-7 notifications created.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T014 [P] [US2] Domain tests for `ClassCancellationPolicy` in `backend/src/domain/services/ClassCancellationPolicy.test.ts` (100% branch coverage): authz matrix (Admin / assigned Coach / other Coach / Coachee), single vs series instance selection, already-canceled skip, past-instance protection, notification-type mapping
- [X] T015 [P] [US2] Use-case tests for `CancelTrainingClass` and `CancelRecurringSeries` in `backend/src/__tests__/CancelTrainingClass.test.ts`: 200 soft-cancel, 403 not-authorized, 404, 409 already canceled, series count with past preserved, calendar delete invoked, notifications + audit rows created
- [X] T016 [P] [US2] API tests in `backend/src/__tests__/classes.test.ts` for `DELETE /classes/:id` (`single` default, `scope=series`) and `DELETE /recurring-series/:id`

### Implementation for User Story 2

- [X] T017 [P] [US2] Implement pure domain service `ClassCancellationPolicy` in `backend/src/domain/services/ClassCancellationPolicy.ts` (`canCancel(actor, assignedCoachId)`, `selectInstancesToCancel(instances, targetId, scope, now)` returning future ACTIVE ids, `notificationTypeForCancellation()`), zero infra imports
- [X] T018 [P] [US2] Implement `CancelTrainingClass` in `backend/src/application/use-cases/CancelTrainingClass.ts`: load class (404), assert not already canceled (409), authorize via policy (403), delete Google Calendar event(s) first (503 on failure, no DB change), then in a transaction mark canceled + create type-7 `Notification` rows for enrolled coachees + audit log `class.cancel`; `scope=series` also cancels future ACTIVE instances of the series
- [X] T019 [P] [US2] Implement `CancelRecurringSeries` in `backend/src/application/use-cases/CancelRecurringSeries.ts`: load series + its classes (404), authorize creator/assigned coach/Admin (403), cancel future ACTIVE instances only (past untouched), delete their calendar events, create notifications + audit, return `{ seriesId, canceledInstanceCount, status: "CANCELED" }`
- [X] T020 [US2] Register `CancelTrainingClass` and `CancelRecurringSeries` in `backend/src/config/container.ts`; rework `DELETE /classes/:id` (accept `scope` query param, return the soft-cancel payload) and implement `DELETE /recurring-series/:id` in `backend/src/infrastructure/routes/classes.ts`; retire the hard-deleting `DeleteTrainingClass` wiring
- [X] T021 [P] [US2] Add `classesRepository.cancel(id, scope)` to `frontend/src/infrastructure/repositories/classesRepository.ts`
- [X] T022 [P] [US2] Create `useCancelClass` mutation hook in `frontend/src/infrastructure/hooks/useCancelClass.ts` (invalidates class list/detail queries on success)
- [X] T023 [US2] Create `CancelClassDialog` in `frontend/src/ui/components/CancelClassDialog.tsx`: confirmation with scope choice ("this occurrence only" vs "entire series") for recurring classes, disabled for non-authorized users
- [X] T024 [US2] Wire the cancel action into the class detail/list views for admin and coach (`frontend/src/ui/components/ClassDetailView.tsx`, `frontend/src/ui/pages/admin/TodayPage.tsx`)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - View class details (Priority: P2)

**Goal**: Admin/Coach opens a single class and sees full detail: type, coach, level, time, description, enrolled coachees, enrollment count vs capacity, waiting-list count, recurring membership; Coachee role additionally receives `coacheeStatus` and scoped names. Reworks the current inline `GET /classes/:id` route.

**Independent Test**: `GET /classes/:id` returns accurate counts matching stored state (SC-007); coachee role gets `coacheeStatus`; unknown id → `404`. Frontend: opening a class from the list renders the detail view with counts and the cancel entry point.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T025 [P] [US3] API tests for `GET /classes/:id` in `backend/src/__tests__/classes.test.ts`: 200 with enrollment/waiting-list counts, `coacheeStatus` present for coachee role, 404 for unknown class
- [X] T026 [P] [US3] Unit test `GetTrainingClass` in `backend/src/__tests__/GetTrainingClass.test.ts`: full detail shape, coachee-status calculation, name scoping by role

### Implementation for User Story 3

- [X] T027 [P] [US3] Implement `GetTrainingClass` use case in `backend/src/application/use-cases/GetTrainingClass.ts`: load with `assignedCoach`/`level`/`enrollments.coachee`/`waitingLists`, throw 404 when absent, apply role-scoped names + `coacheeStatus` for coachee
- [X] T028 [P] [US3] Add `classesRepository.get(id)` to `frontend/src/infrastructure/repositories/classesRepository.ts`
- [X] T029 [US3] Rework `GET /classes/:id` in `backend/src/infrastructure/routes/classes.ts` to use `GetTrainingClass` and return the extended DTO; register the use case in `backend/src/config/container.ts`
- [X] T030 [US3] Create `useClassDetail` query hook in `frontend/src/infrastructure/hooks/useClassDetail.ts`
- [X] T031 [US3] Create `ClassDetailView` in `frontend/src/ui/components/ClassDetailView.tsx`: enrollment/waiting-list counts, coach/level/time/description, recurring badge, cancel button wired to `CancelClassDialog`; open from `ClassList`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, verification gates, documentation consistency, and end-to-end validation.

- [X] T032 [P] Remove the now-unused `DeleteTrainingClass` hard-delete use case (`backend/src/application/use-cases/DeleteTrainingClass.ts`) after confirming its references are all updated (container, routes, `classes.int.test.ts`) — move its Google Calendar int-test cleanup to `CancelTrainingClass`
- [X] T033 [P] Verify `docs/api-specifications.md` (§Classes) still matches the implemented behavior; update only if a drift was introduced
- [X] T034 Run backend gates: `npm run lint`, `npm run typecheck`, `npm test` in `backend/`
- [X] T035 [P] Run frontend gates: `npm run lint`, `npm run typecheck`, `npm test` in `frontend/`
- [X] T036 [P] Run `npm audit --audit-level=high` in `backend/` and `frontend/`
- [X] T037 Execute the validation scenarios in `specs/008-class-viewing-cancellation/quickstart.md` (automated tests, curl API checks incl. cancel + notifications/audit, manual Admin/Coach UI flows)
- [X] T038 Constitution compliance review: domain purity (`ClassCancellationPolicy` has zero infra imports), security-by-default (role guards, strict Zod, 403/audit), envelope consistency (list meta, error shape)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately (baseline must be green)
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - no dependencies on other stories (MVP)
- **User Story 2 (P1)**: Can start after Foundational - reuses `ClassCancellationPolicy` (new domain service) and the list's canceled-state rendering, but is independently testable
- **User Story 3 (P2)**: Can start after Foundational - shares the DTO/types (Phase 2) with US1; its detail endpoint is independent of US2

### Within Each User Story

- Tests MUST be written and FAIL before implementation (constitution §II)
- Domain service before use cases; use cases before routes; backend before frontend wiring
- Story complete before moving to next priority

### Parallel Opportunities

- All Phase 2 tasks marked [P] can run in parallel (different files)
- Within each story, the test tasks marked [P] can run in parallel (different test files)
- US1 backend (`T008`) and frontend repository (`T009`) are parallel
- US2 domain (`T017`) and both use cases (`T018`, `T019`) are sequential, but each is parallel to the frontend repository task (`T021`)
- US3 use case (`T027`) and repository (`T028`) are parallel
- Polish verification tasks (`T034`/`T035`/`T036`) run in parallel across backend/frontend

---

## Parallel Example: User Story 2

```bash
# Launch all US2 first stage together (different files):
Task: "T014 Domain tests for ClassCancellationPolicy in backend/src/domain/services/ClassCancellationPolicy.test.ts"
Task: "T015 Use-case tests in backend/src/__tests__/CancelTrainingClass.test.ts"
Task: "T016 API tests in backend/src/__tests__/classes.test.ts"

# After T017, launch use cases:
Task: "T018 Implement CancelTrainingClass in backend/src/application/use-cases/CancelTrainingClass.ts"
Task: "T019 Implement CancelRecurringSeries in backend/src/application/use-cases/CancelRecurringSeries.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify baseline)
2. Complete Phase 2: Foundational (DTO + frontend types)
3. Complete Phase 3: User Story 1 (list + filters + pagination + visibility)
4. **STOP and VALIDATE**: `GET /classes` contract tests pass; Admin/Coach list renders
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (cancel, incl. reworking the DELETE route to soft-cancel) → Test independently → Deploy/Demo
4. Add User Story 3 (detail) → Test independently → Deploy/Demo
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (backend list + Coachee scoping)
   - Developer B: User Story 2 (cancellation domain + use cases + routes)
   - Developer C: User Story 3 (detail endpoint)
3. Reasonable to add one frontend track after the shared types land (Phase 2)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify tests fail before implementing (constitution §II)
- Commit after each task or logical group with conventional commits (`feat(classes): ...`, `test(classes): ...`)
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- `docs/api-specifications.md` already documents the target contract — CLI `biome check src/` + `tsc --noEmit` + `vitest run` must pass before merge (AGENTS.md PR process)