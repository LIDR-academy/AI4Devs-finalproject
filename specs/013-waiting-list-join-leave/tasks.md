---

description: "Task list for implementing Waiting List Join/Leave (US-3.3)"

---

# Tasks: Waiting List Join/Leave

**Input**: Design documents from `/specs/013-waiting-list-join-leave/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ (api.md, ui.md), quickstart.md

**Tests**: The project constitution (`.specify/memory/constitution.md` §II Test-First, NON-NEGOTIABLE) mandates tests written and failing before production code (Red-Green) with domain services at 100% branch coverage and an integration (Supertest) happy-path + validation-error test for every endpoint. All user story phases therefore include test tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- Web app: `backend/src/`, `frontend/src/`
- Tests: `backend/src/__tests__/`, `frontend/` unit tests colocated with sources (existing convention)

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify the baseline before any change

- [X] T001 Run `npm run typecheck && npm run lint && npm test` in both `backend/` and `frontend/` (plus `npm audit --audit-level=high` in both) to confirm a green baseline before any code changes

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The pure `WaitingListPolicy` domain service — the single source of every waiting-list join/leave/list business rule, required by all four backend user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 [P] Write `WaitingListPolicy.test.ts` in `backend/src/domain/services/WaitingListPolicy.test.ts` covering ALL branches: group-full→ok, group-not-full (`GROUP_NOT_FULL`), individual-occupied→ok, individual-unoccupied (`SLOT_NOT_OCCUPIED`), list-full 4/4 (`WAITING_LIST_FULL`), already-enrolled (`ALREADY_ENROLLED`), already-on-list (`ALREADY_ON_WAITING_LIST`), level-reach ok/out/no-coachee-level (`LEVEL_MISMATCH`), canceled class (`CANCELED_CLASS`), ownership yes/no, `hasOpenSpots` true/false for group+individual, notification types 9/10, and join-rule ordering — confirm the suite FAILS against the missing service
- [X] T003 Implement `WaitingListPolicy.ts` in `backend/src/domain/services/WaitingListPolicy.ts` as a pure TypeScript service (zero Prisma/Express/Zod imports) exposing `assertJoinEligible`, ownership check, `hasOpenSpots`, and notification-type helpers (see research.md D1, D3); make T002 pass with 100% branch coverage

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Join the waiting list for a full group class (Priority: P1) 🎯 MVP

**Goal**: A Coachee joins an ACTIVE **full** group class's waiting list via `POST /classes/:id/waiting-list` (JWT identity only) with max-4 capacity, level-reach (±1), not-already-enrolled and not-already-on-list validation, and the documented error codes `WAITING_LIST_FULL`, `ALREADY_ENROLLED`, `ALREADY_ON_WAITING_LIST`, `LEVEL_MISMATCH`, `VALIDATION_ERROR` (canceled / group not full), `NOT_FOUND`, `FORBIDDEN`.

**Independent Test**: Supertest against `POST /api/v1/classes/:id/waiting-list` — one happy path (201 + entry object, count +1) and one test per documented group error, plus a two-coachee last-slot race proving exactly one 201 and one `WAITING_LIST_FULL`. See `quickstart.md` Scenarios 1-2, 6.

### Tests for User Story 1 (write FIRST, ensure they FAIL) ⚠️

- [X] T004 [P] [US1] Write `JoinWaitingList.test.ts` in `backend/src/__tests__/JoinWaitingList.test.ts` (mocked `PrismaClient`): happy path group-full, and each failure (class not found, canceled class, already enrolled, already on list, level mismatch incl. missing coachee level, group-not-full, list full, serializable-tx race yielding one `WAITING_LIST_FULL`)
- [X] T005 [P] [US1] Write POST integration tests (group happy + every error + last-slot race) in `backend/src/__tests__/waiting-list.int.test.ts` via Supertest — confirm they FAIL (no route exists yet)

### Implementation for User Story 1

- [X] T006 [US1] Implement `JoinWaitingList.ts` in `backend/src/application/use-cases/JoinWaitingList.ts`: reads class (enrollments + waitingLists + level) + coachee, runs `WaitingListPolicy.assertJoinEligible`, performs the read-check-create inside `prisma.$transaction(..., { isolationLevel: "Serializable" })` (research.md D2), creates the `WaitingList` row, records the `Notification` row type 9, and writes `SecurityAuditLog` (`waiting-list.join` SUCCESS or DENIED); maps `P2034` to `WAITING_LIST_FULL` (see `JoinTrainingClass` precedent)
- [X] T007 [US1] Register `JoinWaitingList` in `backend/src/config/container.ts` (constructor args: `prisma`, `new WaitingListPolicy()`, `auditLogger`)
- [X] T008 [US1] Add the `POST /classes/:id/waiting-list` handler in `backend/src/infrastructure/routes/classes.ts`: `authenticate` + `requireRole(UserRole.COACHEE)`, JWT-derived coachee id (no body), Zod-validated UUID param, `201` entry object response
- [X] T009 [P] [US1] Create `frontend/src/domain/types/waitingList.ts` with `WaitingListEntry`, `WaitingListListResponse`, and `JoinWaitingListResponse` (per `contracts/api.md`); no position field anywhere
- [X] T010 [P] [US1] Create `waitingListErrorMessages.ts` in `frontend/src/domain/utils/waitingListErrorMessages.ts` mapping `error.code` (`WAITING_LIST_FULL`, `ALREADY_ON_WAITING_LIST`, `ALREADY_ENROLLED`, `LEVEL_MISMATCH`, `NOT_FOUND`, `FORBIDDEN`, `VALIDATION_ERROR`, unknown/network) to Coachee-friendly messages; never surface `error.ref`
- [X] T011 [P] [US1] Create `joinWaitingList.ts` in `frontend/src/domain/usecases/joinWaitingList.ts` and `useJoinWaitingList.ts` in `frontend/src/infrastructure/hooks/useJoinWaitingList.ts` (TanStack mutation calling the repository, invalidating `["classes"]` and `["waiting-lists"]` on success)
- [X] T012 [P] [US1] Extend `classesRepository.ts` in `frontend/src/infrastructure/repositories/classesRepository.ts` with `joinWaitingList(id)` → `POST /classes/:id/waiting-list`
- [X] T013 [US1] Make the "Waiting list" action functional in `frontend/src/ui/components/CoacheeClassCard.tsx` (was a static label): `Join waiting list` button → confirmation dialog → `useJoinWaitingList` → success flips the card to the on-list/leave state via query-cache invalidation; failure shows a `waitingListErrorMessages` toast and keeps the card unchanged (deps: T010-T012)

**Checkpoint**: User Story 1 fully functional and independently testable (MVP)

---

## Phase 4: User Story 2 - Join the waiting list for an occupied individual class slot (Priority: P1)

**Goal**: A Coachee joins an ACTIVE **occupied** individual class slot's waiting list via the same `POST /classes/:id/waiting-list` — the `WaitingListPolicy` individual branch (`enrollmentCount >= 1`, else `SLOT_NOT_OCCUPIED` per research.md D3) is exercised and proven by dedicated tests. This is the capability the US-3.4 gray-block calendar interaction will consume later.

**Independent Test**: Supertest against `POST /api/v1/classes/:id/waiting-list` on an individual class — occupied slot → `201` (entry created); unoccupied slot → `400 VALIDATION_ERROR`; plus `409 WAITING_LIST_FULL` when that slot's list has 4. See `quickstart.md` Scenario 3.

### Tests for User Story 2 (write FIRST, ensure they FAIL) ⚠️

- [X] T014 [P] [US2] Add individual-slot test cases to `JoinWaitingList.test.ts` in `backend/src/__tests__/JoinWaitingList.test.ts`: occupied→ok, unoccupied (`SLOT_NOT_OCCUPIED`), individual-list-full, individual-canceled
- [X] T015 [US2] Add individual-slot integration tests (occupied `201`, unoccupied `400 VALIDATION_ERROR`) to `backend/src/__tests__/waiting-list.int.test.ts`

### Implementation for User Story 2

- [X] T016 [US2] Confirm/complete the individual eligibility wiring in `backend/src/application/use-cases/JoinWaitingList.ts` and `backend/src/domain/services/WaitingListPolicy.ts` so an individual class joins only when occupied (`enrollments.length >= 1`); the `POST` route from T008 is already the single shared entry point — no new route (deps: T014, T015 pass green)

**Checkpoint**: User Stories 1 AND 2 (both join paths) work independently

---

## Phase 5: User Story 3 - Leave any waiting list at any time (Priority: P2)

**Goal**: The waitlisted Coachee leaves via `DELETE /classes/:id/waiting-list` at any time — entry removed immediately, slot freed, no penalties, no side notification, `Notification` row type 10 recorded, `SecurityAuditLog` written (`waiting-list.leave` SUCCESS or DENIED). The frontend card shows a `Leave waiting list` action instead of an inert waiting state.

**Independent Test**: Supertest against `DELETE /api/v1/classes/:id/waiting-list` — happy path (200, row removed, count -1, notification row created) plus `404` (class missing / not on list), `403` (non-Coachee). Frontend: card flips from `Leave waiting list` back to `Join waiting list`/`Join` via cache invalidation. See `quickstart.md` Scenario 4.

### Tests for User Story 3 (write FIRST, ensure they FAIL) ⚠️

- [X] T017 [P] [US3] Write `LeaveWaitingList.test.ts` in `backend/src/__tests__/LeaveWaitingList.test.ts` (mocked `PrismaClient`): happy path (notification type 10), class-missing 404, not-on-list 404, non-owner 403, entry removal deletes exactly one row
- [X] T018 [US3] Add DELETE integration tests (happy + `404` class-missing + `404` not-on-list + `403`) to `backend/src/__tests__/waiting-list.int.test.ts`

### Implementation for User Story 3

- [X] T019 [US3] Implement `LeaveWaitingList.ts` in `backend/src/application/use-cases/LeaveWaitingList.ts`: load class + entry, enforce entry existence and ownership via `WaitingListPolicy.ownsEntry`, delete the `WaitingList` row, record the `Notification` row type 10, write `SecurityAuditLog` (`waiting-list.leave` SUCCESS or DENIED); all in one transaction
- [X] T020 [US3] Register `LeaveWaitingList` in `backend/src/config/container.ts`
- [X] T021 [US3] Add the `DELETE /classes/:id/waiting-list` handler in `backend/src/infrastructure/routes/classes.ts`: `authenticate` + `requireRole(UserRole.COACHEE)`, JWT-derived coachee id (no body), Zod-validated UUID param, `200` message response
- [X] T022 [P] [US3] Create `leaveWaitingList.ts` in `frontend/src/domain/usecases/leaveWaitingList.ts`, `useLeaveWaitingList.ts` in `frontend/src/infrastructure/hooks/useLeaveWaitingList.ts`, and extend `classesRepository.ts` in `frontend/src/infrastructure/repositories/classesRepository.ts` with `leaveWaitingList(id)` → `DELETE /classes/:id/waiting-list` (invalidating `["classes"]`, `["waiting-lists"]`, `["coachee","dashboard"]`)
- [X] T023 [P] [US3] Extend `deriveClassCardState` in `frontend/src/domain/utils/classCardState.ts`: `coacheeStatus?.isOnWaitingList` → `Leave waiting list` action (was inert `waiting` reason), and register the new action in the type union; keep enroll/cancel states unchanged
- [X] T024 [US3] Add the `Leave waiting list` action + confirmation dialog in `frontend/src/ui/components/CoacheeClassCard.tsx` using `useLeaveWaitingList`, flipping the card back to `Join waiting list`/`Join` on success (deps: T022, T023)

**Checkpoint**: User Stories 1, 2 AND 3 all work independently

---

## Phase 6: User Story 4 - View all active waiting lists (Priority: P2)

**Goal**: A Coachee sees every active waiting list they are on via `GET /waiting-lists` with class details (type, startTime, level, Coach) and an informational `hasOpenSpots` flag — never a position. The frontend gains a "My waiting lists" view with an opened-spot badge, Leave action, and empty/loading/error states, wired from the Coachee Home page.

**Independent Test**: Supertest against `GET /api/v1/waiting-lists` — entries have `hasOpenSpots` and NO position field; canceled-class entries are excluded; `403` for non-Coachee. Frontend `MyWaitingLists` renders details + opened-spot badge + Leave, with empty state. See `quickstart.md` Scenario 5 and `contracts/ui.md` §3.

### Tests for User Story 4 (write FIRST, ensure they FAIL) ⚠️

- [X] T025 [P] [US4] Write `ListWaitingLists.test.ts` in `backend/src/__tests__/ListWaitingLists.test.ts` (mocked `PrismaClient`): happy path, canceled-class entry excluded, `hasOpenSpots` true/false for group and individual, pagination meta, ordering
- [X] T026 [US4] Add GET integration tests (happy + `403` + canceled-class exclusion + no-position assertion) to `backend/src/__tests__/waiting-list.int.test.ts`

### Implementation for User Story 4

- [X] T027 [US4] Implement `ListWaitingLists.ts` in `backend/src/application/use-cases/ListWaitingLists.ts`: query the Coachee's waiting lists with class (type, startTime, level, assignedCoach, enrollments for `hasOpenSpots`), filter to ACTIVE classes via `WaitingListPolicy`, apply pagination, and return entries with `hasOpenSpots` and NO position
- [X] T028 [P] [US4] Create `waitingListDto.ts` in `backend/src/infrastructure/dto/waitingListDto.ts`: mapper to the `{ data, meta }` envelope shape in `contracts/api.md` (entry + class subset + `hasOpenSpots`)
- [X] T029 [US4] Register `ListWaitingLists` in `backend/src/config/container.ts`
- [X] T030 [US4] Add the `GET /waiting-lists` handler in `backend/src/infrastructure/routes/classes.ts`: `authenticate` + `requireRole(UserRole.COACHEE)`, `200` `{ data, meta }` response via the DTO
- [X] T031 [P] [US4] Create `listWaitingLists.ts` in `frontend/src/domain/usecases/listWaitingLists.ts`, `useMyWaitingLists.ts` in `frontend/src/infrastructure/hooks/useMyWaitingLists.ts`, and extend `classesRepository.ts` in `frontend/src/infrastructure/repositories/classesRepository.ts` with `listWaitingLists()` → `GET /waiting-lists`
- [X] T032 [US4] Create `MyWaitingLists.tsx` in `frontend/src/ui/components/coachee/MyWaitingLists.tsx`: renders entries (type, level+color, gym-time start via existing `gymDateTime` helpers, Coach), `hasOpenSpots` badge, `Leave` button via `useLeaveWaitingList`, plus empty/loading/error states; never renders a position (deps: T031, T022)
- [X] T033 [US4] Wire `MyWaitingLists` into `frontend/src/ui/pages/coachee/HomePage.tsx` (link from the existing `WaitingListBadge` count or render inline when nonzero; keep the Home layout otherwise unchanged)

**Checkpoint**: All user stories independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Verification and governance gates that span the whole feature

- [X] T034 [P] Run the full PR gate in both `backend/` and `frontend/`: `npm run typecheck`, `npm run lint` (biome), `npm test` (vitest), and `npm audit --audit-level=high`
- [X] T035 Run `quickstart.md` validation end-to-end: backend curl scenarios 1-6 (group join happy + all errors, individual-slot join, leave, list, last-slot race) and the frontend manual waiting-list flow
- [X] T036 Constitution compliance review (Domain Purity G1, Test-First G2, Security-by-Default G3, API Contract G4, Dependency Integrity G5) before merge; confirm `Complexity Tracking` remains empty

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on the `WaitingListPolicy` foundational phase
  - US1 (P1) and US2 (P1) share the `JoinWaitingList` use case and the same `POST` route: US1 builds the type-agnostic join flow (group paths), US2 proves/completes the individual branch — sequential on `JoinWaitingList.ts` and `waiting-list.int.test.ts`
  - US3 (P2) is independent of US1/US2 (its own `LeaveWaitingList` use case + `DELETE` route) — can run in parallel once Phase 2 is done
  - US4 (P2, list view) depends on the `GET` route only; its frontend tasks need US3's `useLeaveWaitingList` (T022) for the Leave button — sequence T031→T032 after T022
  - Frontend card work in US1/US3 touches `CoacheeClassCard.tsx` (T013, T024) — coordinated sequentially on that one file
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 2 only — MVP deliverable
- **User Story 2 (P1)**: Depends on Phase 2 + US1 join flow; adds the individual eligibility path and tests
- **User Story 3 (P2)**: Depends on Phase 2 only; independent of US1/US2 (own use case, route, and `classCardState` extension)
- **User Story 4 (P2)**: Depends on Phase 2 + US3's `useLeaveWaitingList` (T022) for the list-view Leave button

### Within Each User Story

- Tests written and confirmed FAILING before implementation (Constitution §II Red-Green)
- Domain service (Phase 2) → use cases → DI registration → route handlers
- Unit tests before integration tests; both before the route work they exercise

### Parallel Opportunities

- Foundational phase: T002 (tests) and T003 (service) are sequential; nothing else in Phase 2
- US1 tests T004/T005 run in parallel; US2 tests T014/T015 run in parallel; US3 tests T017/T018 run in parallel; US4 tests T025/T026 run in parallel
- US1 frontend building blocks T009-T012 are all parallel-safe (distinct files); T013 depends on them
- US3 frontend T022/T023 are parallel-safe; T024 depends on them
- US3 (backend) and US1/US2 (backend) can be worked in parallel by different developers (distinct use cases/routes appended to the same routes file must be coordinated)
- US4 frontend T031 is parallel-safe; T032/T033 depend on T031 (+T022)

---

## Parallel Example: User Story 3

```bash
# Launch all independent US3 backend tests together:
Task: "T017 Write LeaveWaitingList.test.ts in backend/src/__tests__/LeaveWaitingList.test.ts"
Task: "T018 Add DELETE integration tests to backend/src/__tests__/waiting-list.int.test.ts"

# Launch all independent US3 frontend building blocks together:
Task: "T022 Create leaveWaitingList.ts + useLeaveWaitingList.ts + classesRepository.leaveWaitingList"
Task: "T023 Extend deriveClassCardState in frontend/src/domain/utils/classCardState.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (`WaitingListPolicy`)
3. Complete Phase 3: User Story 1 (join full group class)
4. **STOP and VALIDATE**: run `JoinWaitingList.test.ts` + `waiting-list.int.test.ts` + `quickstart.md` Scenarios 1-2
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add User Story 1 (join group) → test independently → MVP
3. Add User Story 2 (join individual slot) → test independently
4. Add User Story 3 (leave) → test independently
5. Add User Story 4 (list view) → test independently + manual UI pass
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (join group backend + card action)
   - Developer B: User Story 2 (individual join path) — follows Developer A on the shared `JoinWaitingList`
   - Developer C: User Story 3 (leave backend + card leave action) — fully independent backend, coordinate the shared routes file
   - Developer D: User Story 4 (list view) — after US3's `useLeaveWaitingList` exists
3. Stories complete and integrate independently; Polish phase gates the merge

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to the spec user story for traceability (US1 join group, US2 join individual slot, US3 leave, US4 view lists)
- Each user story is independently completable and testable
- Tests fail-before-production per Constitution §II; domain service targets 100% branch coverage
- Every endpoint change is guarded by `authenticate` + `requireRole(COACHEE)`; identity comes from the JWT only (no body id) — Constitution §III
- Error responses always use `{ error: { code, message, ref } }` with the documented codes; list responses use `{ data, meta }` — Constitution §IV
- No position number is ever shown (simultaneous-notification model, PRD §6.4) — Constitution-compliant API contract
- Commit after each task or logical group; no schema migrations or new dependencies are expected