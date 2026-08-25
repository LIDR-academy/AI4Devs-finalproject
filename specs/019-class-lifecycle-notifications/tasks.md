# Tasks: Class Lifecycle Notifications

**Input**: Design documents from `/specs/019-class-lifecycle-notifications/`

**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/

**Tests**: Included — the spec provides Given/When/Then scenarios and the constitution requires Test-First for domain logic.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`
- **Tests**: `backend/tests/` (unit), `backend/src/__tests__/` (integration)

---

## Phase 1: Foundational (Blocking Prerequisites)

**Purpose**: Domain policy, domain service, content rendering, and DI wiring — shared by ALL user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Tests for Foundation (write FIRST, ensure they FAIL)

- [x] T001 [P] [US5] Create unit tests for `ClassLifecycleNotificationPolicy` in `backend/src/domain/services/ClassLifecycleNotificationPolicy.test.ts` — test all policy methods: `notificationTypeForNewClass()` returns 2, `notificationTypeForIndividualAssignment()` returns 8, `notificationTypeForClassCanceled()` returns 7, `notificationTypeForCoachAssignment()` returns 12, `shouldNotifyCoachOfClassAssignment()` returns true when creator ≠ assigned, false when equal, `isEligibleForNewClassNotification()` returns true when within reach, false otherwise
- [x] T002 [P] [US5] Create unit tests for `ClassLifecycleNotificationService` in `backend/src/domain/services/ClassLifecycleNotificationService.test.ts` — test all 4 methods with mocked ports: `notifyNewClassAvailable`, `notifyIndividualClassAssigned`, `notifyClassCanceled`, `notifyCoachAssigned`; verify correct recipients, content rendering, persistence before push, failure isolation (no throw on push error)
- [x] T003 [P] [US5] Create integration test skeleton in `backend/src/__tests__/class-lifecycle-notifications.test.ts` — define test helpers for creating classes, enrolling coachees, and asserting notification records

### Implementation for Foundation

- [x] T004 [P] [US5] Create `ClassLifecycleNotificationPolicy` in `backend/src/domain/services/ClassLifecycleNotificationPolicy.ts` — pure policy class with methods: `notificationTypeForNewClass()`, `notificationTypeForIndividualAssignment()`, `notificationTypeForClassCanceled()`, `notificationTypeForCoachAssignment()`, `shouldNotifyCoachOfClassAssignment(creatorId, assignedCoachId)`, `isEligibleForNewClassNotification(coacheeSortOrder, classSortOrder)`; use `isWithinReach()` from `ReachCalculator.ts` for reach check
- [x] T005 [P] [US5] Create content rendering functions in `backend/src/domain/services/NotificationContentRenderer.ts` — pure functions for each notification type: `renderNewClassAvailable(levelName, dateTime, coachName)`, `renderIndividualClassAssigned(coacheeName, dateTime, levelName, coachName)`, `renderClassCanceled(levelName, classType, dateTime, coachName)`, `renderCoachAssigned(levelName, classType, dateTime)`; each returns a human-readable string per contracts/domain-service.md
- [x] T006 [US5] Create `ClassLifecycleNotificationService` in `backend/src/domain/services/ClassLifecycleNotificationService.ts` — domain service with constructor taking 6 ports (`NotificationRepository`, `NotificationSender`, `DeviceTokenRepository`, `UserRepository`, `ClassRepository`, `EnrollmentRepository`); instantiate `ClassLifecycleNotificationPolicy` internally; implement 4 methods: `notifyNewClassAvailable(classId)`, `notifyIndividualClassAssigned(classId, coacheeId)`, `notifyClassCanceled(classId)`, `notifyCoachAssigned(classId)`; each method loads data via ports → determines recipients via policy → renders content → persists via `NotificationRepository.create()` → resolves tokens via `DeviceTokenRepository.listActiveTokens()` → pushes via `NotificationSender.send()` (wrapped in try/catch) → deactivates failed tokens; return `{ notificationsSent: number }`
- [x] T007 [US5] Wire `ClassLifecycleNotificationService` in `backend/src/config/container.ts` — instantiate service with existing ports (`PrismaNotificationRepository`, `PrismaDeviceTokenRepository`, FCM adapter, `PrismaUserRepository`, `PrismaClassRepository`, `PrismaEnrollmentRepository`); export from container

**Checkpoint**: Foundation ready — domain policy, service, and content rendering are implemented and unit-tested. User story implementation can now begin.

---

## Phase 2: User Story 1 — New Group Class Notification (Priority: P1) 🎯 MVP

**Goal**: When a new GROUP class is created with open spots, all eligible Coachees (level within reach) receive notification #2 with class details.

**Independent Test**: Create a new GROUP class at Level 3; verify eligible Coachees (Level 2, 3, 4) receive notification #2; verify non-eligible Coachees (Level 1, 5) do NOT receive it.

### Tests for User Story 1

- [x] T008 [P] [US1] Add integration test cases for `notifyNewClassAvailable` in `backend/src/__tests__/class-lifecycle-notifications.test.ts` — test: (1) eligible Coachees receive #2, (2) non-eligible Coachees do NOT receive #2

### Implementation for User Story 1

- [x] T009 [US1] Hook `ClassLifecycleNotificationService.notifyNewClassAvailable()` into `backend/src/application/use-cases/CreateTrainingClass.ts` — after successful class creation in the transaction, if `classType === "GROUP"`, call `notificationService.notifyNewClassAvailable(classId)`; wrap in try/catch to isolate failures from the creation response
- [x] T010 [US1] Ensure `CreateTrainingClass` has access to `ClassLifecycleNotificationService` — add as constructor parameter or resolve from container; pass through to the execute method

**Checkpoint**: User Story 1 is functional — new GROUP class creation triggers notification #2 to eligible Coachees.

---

## Phase 3: User Story 2 — Individual Class Assignment Notification (Priority: P1)

**Goal**: When an individual class is assigned to a Coachee, the assigned Coach receives notification #8 with Coachee name and class details.

**Independent Test**: Assign an individual class to a Coachee; verify the assigned Coach receives notification #8 with Coachee name, date/time, level, and Coach name.

### Tests for User Story 2

- [x] T011 [P] [US2] Add integration test cases for `notifyIndividualClassAssigned` in `backend/src/__tests__/class-lifecycle-notifications.test.ts` — test: (1) Coach receives #8 after individual assignment, (2) notification includes Coachee name

### Implementation for User Story 2

- [x] T012 [US2] Hook `ClassLifecycleNotificationService.notifyIndividualClassAssigned()` into `backend/src/application/use-cases/CreateTrainingClass.ts` — after successful INDIVIDUAL class creation, call `notificationService.notifyIndividualClassAssigned(classId, coacheeId)`; wrap in try/catch
- [x] T013 [US2] Ensure individual class reassignment triggers notification #8 — if an existing individual class is reassigned to a different Coachee, call `notifyIndividualClassAssigned()` with the new Coachee ID; this may require modifying the reassignment flow or adding a new hook point

**Checkpoint**: User Story 2 is functional — individual class assignment triggers notification #8 to the assigned Coach.

---

## Phase 4: User Story 3 — Class Cancellation Notification (Priority: P1)

**Goal**: When a class is canceled (single or series), all enrolled Coachees receive notification #7 with class details.

**Independent Test**: Cancel a GROUP class with 2+ enrolled Coachees; verify ALL enrolled Coachees receive notification #7 with "canceled" message and class details.

### Tests for User Story 3

- [x] T014 [P] [US3] Add integration test cases for `notifyClassCanceled` in `backend/src/__tests__/class-lifecycle-notifications.test.ts` — test: (1) all enrolled Coachees receive #7 after cancellation, (2) notification includes "canceled" in content

### Implementation for User Story 3

- [x] T015 [US3] Hook `ClassLifecycleNotificationService.notifyClassCanceled()` into `backend/src/application/use-cases/CancelTrainingClass.ts` — after successful cancellation, call `notificationService.notifyClassCanceled(classId)` for each canceled class; wrap in try/catch
- [x] T016 [US3] Hook `ClassLifecycleNotificationService.notifyClassCanceled()` into `backend/src/application/use-cases/CancelRecurringSeries.ts` — after successful series cancellation, call `notificationService.notifyClassCanceled(classId)` for each canceled class in the series; wrap in try/catch
- [x] T017 [US3] Verify existing notification #3 in `CancelEnrollment.ts` uses `SendNotification` pattern — ensure the existing Coach notification for individual class cancellation uses persist + push delivery (not just `tx.notification.create()`); if not, refactor to use `SendNotification` or the new service

**Checkpoint**: User Story 3 is functional — class cancellation triggers notification #7 to all enrolled Coachees.

---

## Phase 5: User Story 4 — Coach Assignment Notification (Priority: P2)

**Goal**: When a Coach is assigned to a class they didn't create, they receive notification #12 with class details.

**Independent Test**: Admin creates a class with Coach A, then reassigns to Coach B; verify Coach B receives #12; verify Coach A does NOT receive #12.

### Tests for User Story 4

- [x] T018 [P] [US4] Add integration test cases for `notifyCoachAssigned` in `backend/src/__tests__/class-lifecycle-notifications.test.ts` — test: (1) Coach receives #12 when assigned to class they didn't create, (2) Coach does NOT receive #12 when assigned to class they created

### Implementation for User Story 4

- [x] T019 [US4] Hook `ClassLifecycleNotificationService.notifyCoachAssigned()` into the coach assignment flow — identify where `assigned_coach_id` is updated on `TrainingClass`; after update, if `created_by !== assigned_coach_id`, call `notificationService.notifyCoachAssigned(classId)`; this may be in `CreateTrainingClass` (initial assignment) or a separate assignment use case
- [x] T020 [US4] Ensure coach reassignment triggers notification #12 — if a class is reassigned from Coach A to Coach B, and neither created the class, both should receive #12; if Coach A created the class, only Coach B receives #12

**Checkpoint**: User Story 4 is functional — coach assignment to non-created class triggers notification #12.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Integration validation, lint, typecheck, and final verification

- [x] T021 [P] Run full integration test suite for class lifecycle notifications in `backend/src/__tests__/class-lifecycle-notifications.test.ts` — verify all scenarios pass end-to-end
- [x] T022 [P] Run existing test suite to verify no regressions — `cd backend && npx vitest run`
- [x] T023 [P] Run lint check — `cd backend && npm run lint`
- [x] T024 [P] Run typecheck — `cd backend && npm run typecheck`
- [x] T025 Run quickstart.md validation scenarios — verify manual/automated scenarios from `specs/019-class-lifecycle-notifications/quickstart.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Foundational)**: No dependencies — can start immediately
- **Phase 2 (US1)**: Depends on Phase 1 completion — BLOCKED until policy, service, and content rendering are done
- **Phase 3 (US2)**: Depends on Phase 1 completion — can run in parallel with Phase 2
- **Phase 4 (US3)**: Depends on Phase 1 completion — can run in parallel with Phase 2 and 3
- **Phase 5 (US4)**: Depends on Phase 1 completion — can run in parallel with Phase 2, 3, and 4
- **Phase 6 (Polish)**: Depends on all desired user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Phase 1 — No dependencies on other stories
- **User Story 2 (P1)**: Can start after Phase 1 — No dependencies on other stories
- **User Story 3 (P1)**: Can start after Phase 1 — No dependencies on other stories
- **User Story 4 (P2)**: Can start after Phase 1 — No dependencies on other stories

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Policy/service methods before use case hooks
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Phase 1 test tasks (T001, T002, T003) can run in parallel
- T004 and T005 (policy and content renderer) can run in parallel
- Once Phase 1 completes, all user story phases (2-5) can start in parallel
- All integration test tasks (T008, T011, T014, T018) can run in parallel
- All polish tasks (T021-T025) can run in parallel

---

## Parallel Example: User Story 1

```bash
# Launch integration test for US1:
Task: "Add integration test cases for notifyNewClassAvailable in backend/src/__tests__/class-lifecycle-notifications.test.ts"

# After tests fail, implement:
Task: "Hook ClassLifecycleNotificationService.notifyNewClassAvailable() into backend/src/application/use-cases/CreateTrainingClass.ts"
Task: "Ensure CreateTrainingClass has access to ClassLifecycleNotificationService"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Foundational (policy + service + content rendering)
2. Complete Phase 2: User Story 1 (new group class notification)
3. **STOP and VALIDATE**: Test User Story 1 independently
4. Deploy/demo if ready

### Incremental Delivery

1. Complete Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 → Test independently → Deploy/Demo
4. Add User Story 3 → Test independently → Deploy/Demo
5. Add User Story 4 → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Phase 1 together (policy, service, content rendering)
2. Once Phase 1 is done:
   - Developer A: User Story 1 (new group class notification)
   - Developer B: User Story 2 (individual assignment notification)
   - Developer C: User Story 3 (cancellation notification)
3. Story 4 (coach assignment) can be picked up after any story completes
4. Stories complete and integrate independently

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify tests fail before implementing
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- No database migration required — existing `Notification` model accepts new `notification_type` values
- No new API endpoints — notifications are system-triggered side effects
