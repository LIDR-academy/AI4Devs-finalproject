# Tasks: Waiting List Automation

**Input**: Design documents from `/specs/018-waiting-list-automation/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Extend existing domain policy and define new ports required by the waiting-list automation

- [x] T001 [P] Extend `WaitingListPolicy` with notification type methods for types #1, #4, #5, #6 in `backend/src/domain/services/WaitingListPolicy.ts`
- [x] T002 [P] Create `WaitingListRepository` port in `backend/src/domain/ports/WaitingListRepository.ts` with methods: `findByClassId`, `findByClassIdAndCoacheeId`, `deleteByClassIdAndCoacheeId`
- [x] T003 [P] Create `ClassRepository` port in `backend/src/domain/ports/ClassRepository.ts` with methods: `findByIdWithEnrollmentsAndWaitingLists`
- [x] T004 [P] Create `EnrollmentRepository` port in `backend/src/domain/ports/EnrollmentRepository.ts` with methods: `create`, `findByClassIdAndCoacheeId`
- [x] T005 [P] Create `UserRepository` port in `backend/src/domain/ports/UserRepository.ts` with methods: `findById`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain service that orchestrates waiting-list processing — MUST be complete before any user story

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T006 Write unit tests for `ProcessWaitingListService` in `backend/src/domain/services/ProcessWaitingListService.test.ts` covering: cancellation with waiting list, cancellation without waiting list, simultaneous claim contention, claim on canceled class, claim when already enrolled, notification delivery failure isolation, empty waiting list edge case
- [x] T007 Implement `ProcessWaitingListService` in `backend/src/domain/services/ProcessWaitingListService.ts` — domain service that orchestrates: detecting spot opening, dispatching notifications to all waitlisted Coachees (#1), sending coach notification (#4 or #5), and processing claims (#6, #9). Depends only on domain ports, zero infrastructure imports
- [x] T008 Implement Prisma adapters for the new ports: `PrismaWaitingListRepository` in `backend/src/infrastructure/persistence/PrismaWaitingListRepository.ts`, `PrismaClassRepository` in `backend/src/infrastructure/persistence/PrismaClassRepository.ts`, `PrismaEnrollmentRepository` in `backend/src/infrastructure/persistence/PrismaEnrollmentRepository.ts`, `PrismaUserRepository` in `backend/src/infrastructure/persistence/PrismaUserRepository.ts`
- [x] T009 Run tests to confirm `ProcessWaitingListService` passes all unit tests

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 + 2 — Waitlisted Coachees and Coach are notified (Priority: P1) 🎯 MVP

**Goal**: When a Coachee cancels enrollment from a group class with a waiting list, all waitlisted Coachees receive notification #1 simultaneously and the Coach receives notification #4. If no waiting list exists, Coach receives notification #5.

**Independent Test**: Enroll a Coachee in a group class, add two Coachees to the waiting list, cancel the first Coachee's enrollment, and verify both waitlisted Coachees receive a notification identifying the class and the Coach receives exactly one notification.

### Implementation for User Story 1 + 2

- [x] T010 [US1+US2] Modify `CancelEnrollment` use case in `backend/src/application/use-cases/CancelEnrollment.ts` to invoke `ProcessWaitingListService.processSpotOpened()` after successful enrollment deletion, within the same transaction. Inject `ProcessWaitingListService` as a new constructor dependency
- [x] T011 [US1+US2] Update `CancelEnrollmentResult` interface in `backend/src/application/use-cases/CancelEnrollment.ts` to include `notificationsSent: number` and `waitingListMembersNotified: number` fields
- [x] T012 [US1+US2] Update `container.ts` in `backend/src/config/container.ts` to wire `ProcessWaitingListService` with its port dependencies and pass it to `CancelEnrollment`
- [ ] T013 [US1+US2] Write integration test for cancellation-triggered waiting-list notification in `backend/src/__tests__/integration/waiting-list-automation.test.ts` — test: cancel with waiting list → notifications created, cancel without waiting list → coach #5 only, response includes new fields
- [ ] T014 [US1+US2] Update API documentation in `docs/api-specifications.md` to reflect the extended `DELETE /classes/:id/enrollment` response with `notificationsSent` and `waitingListMembersNotified`

**Checkpoint**: Cancellation now triggers automatic waiting-list notification dispatch. Both waitlisted Coachees and Coach receive the correct notifications.

---

## Phase 4: User Story 3 — Waitlisted Coachee claims the spot (Priority: P1)

**Goal**: A waitlisted Coachee can claim an opened spot on a first-come-first-served basis. The first claimant is enrolled, their waiting-list entry is removed, and the Coach receives notification #6. Subsequent claimants receive a "spot taken" error.

**Independent Test**: Open a spot in a class with a waiting list, have two waitlisted Coachees attempt to claim it simultaneously, verify exactly one succeeds and both receive appropriate feedback.

### Implementation for User Story 3

- [x] T015 [P] [US3] Write unit tests for `ClaimWaitingListSpot` use case in `backend/src/application/use-cases/ClaimWaitingListSpot.test.ts` covering: successful claim, claim when spot already taken, claim when not on waiting list, claim on canceled class, claim when already enrolled, claim with expired session, concurrent claim contention
- [x] T016 [P] [US3] Implement `ClaimWaitingListSpot` use case in `backend/src/application/use-cases/ClaimWaitingListSpot.ts` — serializable transaction: load class + waiting-list entry, verify ACTIVE status and not full, create ClassEnrollment, delete WaitingList entry, send notification #9 to coachee, send notification #6 to coach, audit-log the claim
- [x] T017 [US3] Add `POST /classes/:id/waiting-list/claim` route in `backend/src/infrastructure/routes/classes.ts` — authenticate + requireRole(COACHEE), validate class ID param, invoke `ClaimWaitingListSpot`, return enrollment result
- [x] T018 [US3] Register `ClaimWaitingListSpot` in `backend/src/config/container.ts` with its dependencies
- [x] T019 [US3] Write integration test for the claim endpoint in `backend/src/__tests__/integration/waiting-list-automation.test.ts` — test: POST claim → enrollment created + waiting-list entry removed + notifications, duplicate claim → 409 SPOT_TAKEN, claim on canceled class → 422
- [x] T020 [US3] Update API documentation in `docs/api-specifications.md` to document the new `POST /classes/:id/waiting-list/claim` endpoint with request, response, and error contracts

**Checkpoint**: Waitlisted Coachees can claim opened spots. First-come-first-served is enforced via serializable transactions.

---

## Phase 5: User Story 4 — Safe and auditable processing (Priority: P2)

**Goal**: Every automatic waiting-list action is recorded for audit. Notification delivery failures are logged without breaking the triggering operation. Edge cases (empty list, canceled class) are handled gracefully.

**Independent Test**: Trigger cancellation on a class with a waiting list, verify audit records exist for every notification and claim action, force delivery failures and verify graceful handling.

### Implementation for User Story 4

- [x] T021 [US4] Add audit logging to `ProcessWaitingListService` for notification dispatch actions (actor="system", action="waiting-list.notify-spot-opened", resource="WAITING_LIST", outcome)
- [x] T022 [US4] Add audit logging to `ClaimWaitingListSpot` for claim actions (actor=coacheeId, action="waiting-list.claim-spot", resource="CLASS_ENROLLMENT", outcome)
- [x] T023 [US4] Write integration test for audit trail in `backend/src/__tests__/integration/waiting-list-automation.test.ts` — test: verify SecurityAuditLog entries exist after cancellation-triggered processing and after claim, verify delivery failure is logged and doesn't break operation
- [x] T024 [US4] Write edge case integration tests in `backend/src/__tests__/integration/waiting-list-automation.test.ts` — test: empty waiting list → coach #5 only, canceled class claim refused, simultaneous cancellation with one waitlisted coachee

**Checkpoint**: All waiting-list automation is auditable, delivery failures are isolated, edge cases are handled.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Final validation and documentation

- [x] T025 Run full test suite (`npm test`) and confirm all tests pass
- [x] T026 Run lint (`npm run lint`) and typecheck (`npm run typecheck`) — fix any issues
- [ ] T027 Run quickstart.md validation scenarios end-to-end against local environment
- [x] T028 Update `docs/api-specifications.md` with complete notification types reference table
- [x] T029 Verify constitution compliance: domain service has zero infrastructure imports (Principle I), domain tests written first (Principle II), claim endpoint has auth middleware (Principle III), API responses use standard envelope (Principle IV)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 completion — BLOCKS all user stories
- **US1+US2 (Phase 3)**: Depends on Phase 2 completion
- **US3 (Phase 4)**: Depends on Phase 2 completion — can run in parallel with Phase 3
- **US4 (Phase 5)**: Depends on Phase 3 and Phase 4 completion (needs both cancellation and claim flows to audit)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **US1+US2 (P1)**: Can start after Foundational (Phase 2) — no dependencies on other stories
- **US3 (P1)**: Can start after Foundational (Phase 2) — can run in parallel with US1+US2
- **US4 (P2)**: Depends on US1+US2 and US3 completion (audit covers both flows)

### Within Each User Story

- Tests written and confirmed failing before implementation (Constitution II)
- Domain policy extensions before domain service
- Domain service before use case
- Use case before route
- Route before integration tests

### Parallel Opportunities

- All Phase 1 tasks (T001–T005) can run in parallel (different files)
- Phase 3 (US1+US2) and Phase 4 (US3) can run in parallel after Phase 2
- T015 and T016 within Phase 4 can run in parallel (test + implementation in different files)

---

## Parallel Example: Phase 1 (Setup)

```bash
# Launch all port and policy extension tasks together:
Task: "Extend WaitingListPolicy with notification types #1, #4, #5, #6"
Task: "Create WaitingListRepository port"
Task: "Create ClassRepository port"
Task: "Create EnrollmentRepository port"
Task: "Create UserRepository port"
```

## Parallel Example: Phase 3 + Phase 4

```bash
# After Phase 2 completes, launch US1+US2 and US3 in parallel:
# Developer A: US1+US2 (cancellation triggers notifications)
Task: "Modify CancelEnrollment to invoke ProcessWaitingListService"
Task: "Update CancelEnrollmentResult interface"
Task: "Wire ProcessWaitingListService in container.ts"

# Developer B: US3 (claim endpoint)
Task: "Write unit tests for ClaimWaitingListSpot"
Task: "Implement ClaimWaitingListSpot use case"
Task: "Add POST /classes/:id/waiting-list/claim route"
```

---

## Implementation Strategy

### MVP First (US1+US2 Only)

1. Complete Phase 1: Setup (ports + policy extensions)
2. Complete Phase 2: Foundational (ProcessWaitingListService + adapters)
3. Complete Phase 3: US1+US2 (cancellation triggers notifications)
4. **STOP and VALIDATE**: Run quickstart Scenario 1 and 2
5. Deploy/demo if ready

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add US1+US2 → Test cancellation notification flow → Deploy/Demo (MVP!)
3. Add US3 → Test claim endpoint → Deploy/Demo
4. Add US4 → Test audit trail → Deploy/Demo
5. Each story adds value without breaking previous stories

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- US1 and US2 are combined because they are both triggered by the same cancellation event and share the `ProcessWaitingListService`
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
