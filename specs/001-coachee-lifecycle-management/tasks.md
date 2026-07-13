# Tasks: Coachee Lifecycle Management

**Input**: Design documents from `/specs/001-coachee-lifecycle-management/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Included per constitution requirement (Test-First principle — NON-NEGOTIABLE). Tests MUST be written and confirmed failing before production code.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Backend: `backend/src/`
- Frontend: `frontend/src/`
- Tests: `backend/src/__tests__/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create directory structure and verify project scaffolding

- [x] T001 Create domain layer directories: `backend/src/domain/entities/`, `backend/src/domain/ports/`, `backend/src/domain/services/`
- [x] T002 [P] Create application layer directory: `backend/src/application/use-cases/`
- [x] T003 [P] Create infrastructure persistence directory: `backend/src/infrastructure/persistence/`

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core domain entities, repository port, and Prisma adapter that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T004 Create `Coachee` domain entity in `backend/src/domain/entities/Coachee.ts` — pure TypeScript class with fields: id, name, email, phone, classTypePreference, status, levelId, additionalInfo, createdAt, updatedAt. No Express/Prisma/Zod imports.
- [x] T005 [P] Create `Level` domain value object in `backend/src/domain/entities/Level.ts` — pure TypeScript class with fields: id, name, color, sortOrder.
- [x] T006 Create `CoacheeRepository` port interface in `backend/src/domain/ports/CoacheeRepository.ts` — methods: create, findById, findAll (with filters/pagination), update, updateStatus, updateLevel.
- [x] T007 [P] Create `PrismaCoacheeRepository` adapter in `backend/src/infrastructure/persistence/PrismaCoacheeRepository.ts` — implements CoacheeRepository port, maps Prisma User (role=COACHEE) records to Coachee domain entity. Exclude bank_account, ssn, dni from responses.
- [x] T008 Create `CoacheeService` domain service in `backend/src/domain/services/CoacheeService.ts` — business rules: email uniqueness validation, status transition validation, level existence check.
- [x] T009 Create DI container in `backend/src/config/container.ts` — wires PrismaCoacheeRepository → CoacheeRepository port, wires use cases → repository.

**Checkpoint**: Foundation ready — user story implementation can now begin in parallel

---

## Phase 3: User Story 1 — Admin Creates and Lists Coachees (Priority: P1) 🎯 MVP

**Goal**: Admin can create a new coachee and browse the paginated, filterable list of all coachees.

**Independent Test**: Create a coachee with valid POST data, then verify they appear in the GET list response. Test duplicate email returns 409. Test non-Admin gets 403.

### Tests for User Story 1 (Constitution-required: Test-First) ⚠️

- [x] T010 [P] [US1] Write failing integration test for `POST /api/v1/coachees` (happy path) in `backend/src/__tests__/coachees.test.ts` — verify 201 with coachee object, no financial fields
- [x] T011 [P] [US1] Write failing integration test for `POST /api/v1/coachees` (duplicate email) in `backend/src/__tests__/coachees.test.ts` — verify 409 CONFLICT
- [x] T012 [P] [US1] Write failing integration test for `POST /api/v1/coachees` (missing required fields) in `backend/src/__tests__/coachees.test.ts` — verify 400 VALIDATION_ERROR
- [x] T013 [P] [US1] Write failing integration test for `POST /api/v1/coachees` (non-Admin role) in `backend/src/__tests__/coachees.test.ts` — verify 403 FORBIDDEN
- [x] T014 [P] [US1] Write failing integration test for `GET /api/v1/coachees` (happy path — paginated list) in `backend/src/__tests__/coachees.test.ts` — verify 200 with data/meta, no financial fields
- [x] T015 [P] [US1] Write failing integration test for `GET /api/v1/coachees` (filters by status and level) in `backend/src/__tests__/coachees.test.ts` — verify filtered results

### Implementation for User Story 1

- [x] T016 [US1] Create `CreateCoachee` use case in `backend/src/application/use-cases/CreateCoachee.ts` — accepts name, email, phone, classTypePreference, levelId, additionalInfo; generates random password (bcrypt cost 12); calls CoacheeService.emailUnique; calls repository.create; returns Coachee entity
- [x] T017 [P] [US1] Create `ListCoachees` use case in `backend/src/application/use-cases/ListCoachees.ts` — accepts status filter, levelId filter, page, limit; calls repository.findAll; returns paginated result
- [x] T018 [US1] Create Zod validation schemas for coachee creation in `backend/src/infrastructure/routes/coachees.ts` (inline or separate file) — validates name (required), email (required, email format), phone (optional), classTypePreference (enum), levelId (uuid), additionalInfo (optional string)
- [x] T019 [US1] Implement `POST /api/v1/coachees` route handler in `backend/src/infrastructure/routes/coachees.ts` — use validate middleware with Zod schema, wire CreateCoachee use case, return 201 with coachee (exclude financial fields)
- [x] T020 [US1] Implement `GET /api/v1/coachees` route handler in `backend/src/infrastructure/routes/coachees.ts` — parse query params (status, levelId, page, limit), wire ListCoachees use case, return 200 with `{ data, meta }` envelope

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 — Admin Views and Updates Coachee Profiles (Priority: P1)

**Goal**: Admin can view a detailed coachee profile and perform partial updates.

**Independent Test**: View a coachee profile by ID, update specific fields, verify changes reflected in subsequent read. Test non-existent ID returns 404. Test non-Admin gets 403.

### Tests for User Story 2 (Constitution-required: Test-First) ⚠️

- [x] T021 [P] [US2] Write failing integration test for `GET /api/v1/coachees/:id` (happy path) in `backend/src/__tests__/coachees.test.ts` — verify 200 with full profile, no financial fields
- [x] T022 [P] [US2] Write failing integration test for `GET /api/v1/coachees/:id` (not found) in `backend/src/__tests__/coachees.test.ts` — verify 404 NOT_FOUND
- [x] T023 [P] [US2] Write failing integration test for `PUT /api/v1/coachees/:id` (partial update) in `backend/src/__tests__/coachees.test.ts` — verify 200 with updated fields
- [x] T024 [P] [US2] Write failing integration test for `PUT /api/v1/coachees/:id` (duplicate email) in `backend/src/__tests__/coachees.test.ts` — verify 409 CONFLICT
- [x] T025 [P] [US2] Write failing integration test for coachee endpoints (non-Coach role) in `backend/src/__tests__/coachees.test.ts` — verify 403 FORBIDDEN

### Implementation for User Story 2

- [x] T026 [US2] Create `GetCoachee` use case in `backend/src/application/use-cases/GetCoachee.ts` — accepts id, calls repository.findById, throws NotFoundError if null
- [x] T027 [P] [US2] Create `UpdateCoachee` use case in `backend/src/application/use-cases/UpdateCoachee.ts` — accepts id and partial fields (name, email, phone, classTypePreference, additionalInfo); validates email uniqueness if email changed; calls repository.update
- [x] T028 [US2] Create Zod validation schemas for coachee update in `backend/src/infrastructure/routes/coachees.ts` — all fields optional, validates provided fields
- [x] T029 [US2] Implement `GET /api/v1/coachees/:id` route handler in `backend/src/infrastructure/routes/coachees.ts` — wire GetCoachee use case, return 200 with coachee profile (exclude financial fields, include additionalInfo)
- [x] T030 [US2] Implement `PUT /api/v1/coachees/:id` route handler in `backend/src/infrastructure/routes/coachees.ts` — use validate middleware, wire UpdateCoachee use case, return 200 with updated coachee

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 — Admin Manages Coachee Lifecycle Status (Priority: P2)

**Goal**: Admin can activate/deactivate coachees and change their training level.

**Independent Test**: Deactivate a coachee, verify inactive status, reactivate. Change level and verify change. Test non-Admin gets 403 on status change. Verify level change triggers notification stub.

### Tests for User Story 3 (Constitution-required: Test-First) ⚠️

- [x] T031 [P] [US3] Write failing integration test for `PATCH /api/v1/coachees/:id/status` (activate) in `backend/src/__tests__/coachees.test.ts` — verify 200 with updated status
- [x] T032 [P] [US3] Write failing integration test for `PATCH /api/v1/coachees/:id/status` (deactivate) in `backend/src/__tests__/coachees.test.ts` — verify 200 with inactive status
- [x] T033 [P] [US3] Write failing integration test for `PATCH /api/v1/coachees/:id/status` (non-Admin) in `backend/src/__tests__/coachees.test.ts` — verify 403 FORBIDDEN
- [x] T034 [P] [US3] Write failing integration test for `PATCH /api/v1/coachees/:id/level` (happy path) in `backend/src/__tests__/coachees.test.ts` — verify 200 with updated level
- [x] T035 [P] [US3] Write failing integration test for `PATCH /api/v1/coachees/:id/level` (non-existent level) in `backend/src/__tests__/coachees.test.ts` — verify 400 VALIDATION_ERROR
- [x] T036 [P] [US3] Write failing integration test for `PATCH /api/v1/coachees/:id/level` (non-existent coachee) in `backend/src/__tests__/coachees.test.ts` — verify 404 NOT_FOUND

### Implementation for User Story 3

- [x] T037 [US3] Create `UpdateCoacheeStatus` use case in `backend/src/application/use-cases/UpdateCoacheeStatus.ts` — accepts id and new status (active/inactive); calls repository.updateStatus; logs the status change event
- [x] T038 [P] [US3] Create `UpdateCoacheeLevel` use case in `backend/src/application/use-cases/UpdateCoacheeLevel.ts` — accepts id and levelId; validates level exists; calls repository.updateLevel; triggers notification #11 stub (console.log or call to notification service if available); logs the level change event
- [x] T039 [US3] Implement `PATCH /api/v1/coachees/:id/status` route handler in `backend/src/infrastructure/routes/coachees.ts` — requireRole('ADMIN'), validate status enum, wire UpdateCoacheeStatus use case, return 200 with `{ id, status }`
- [x] T040 [US3] Implement `PATCH /api/v1/coachees/:id/level` route handler in `backend/src/infrastructure/routes/coachees.ts` — requireRole('ADMIN', 'COACH'), validate levelId, wire UpdateCoacheeLevel use case, return 200 with level object

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Security hardening, auth guard verification, and final validation

- [x] T041 [P] Add `requireRole` guards to all coachee routes — POST + PATCH status require ADMIN; GET + PUT + PATCH level allow ADMIN or COACH
- [x] T042 [P] Add security event logging for all coachee operations (create, update, status change, level change) — log actor ID, action, resource, outcome per constitution requirement
- [x] T043 [P] Run quickstart.md validation — verify all 9 scenarios pass via integration tests
- [x] T044 Run full test suite: `cd backend && npm test` — verify all tests pass

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-5)**: All depend on Foundational phase completion
  - User stories can proceed in parallel (if staffed)
  - Or sequentially in priority order (US1 → US2 → US3)
- **Polish (Phase 6)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — No dependencies on other stories
- **User Story 2 (P1)**: Can start after Foundational — No dependencies on other stories
- **User Story 3 (P2)**: Can start after Foundational — No dependencies on other stories

### Within Each User Story

- Tests MUST be written and FAIL before implementation
- Use cases before route handlers
- Core implementation before integration
- Story complete before moving to next priority

### Parallel Opportunities

- All Setup tasks marked [P] can run in parallel
- All Foundational tasks marked [P] can run in parallel (within Phase 2)
- Once Foundational phase completes, ALL user stories can start in parallel (if team capacity allows)
- All tests for a user story marked [P] can run in parallel
- Different user stories can be worked on in parallel by different team members

---

## Parallel Example: User Story 1

```bash
# Launch all tests for User Story 1 together:
Task: "T010 [US1] POST /coachees happy path test"
Task: "T011 [US1] POST /coachees duplicate email test"
Task: "T012 [US1] POST /coachees missing fields test"
Task: "T013 [US1] POST /coachees non-Admin 403 test"
Task: "T014 [US1] GET /coachees paginated list test"
Task: "T015 [US1] GET /coachees filters test"

# Launch all implementations for User Story 1 together:
Task: "T016 [US1] CreateCoachee use case"
Task: "T017 [US1] ListCoachees use case"

# Then wire routes (depends on use cases):
Task: "T018 [US1] Zod schemas for creation"
Task: "T019 [US1] POST /coachees handler"
Task: "T020 [US1] GET /coachees handler"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational
3. Complete Phase 3: User Story 1 (Create + List)
4. **STOP and VALIDATE**: Run tests for US1 independently
5. Deploy/demo if ready — Admin can onboard and view coachees

### Incremental Delivery

1. Complete Setup + Foundational → Foundation ready
2. Add User Story 1 → Test independently → Deploy/Demo (MVP: create + list)
3. Add User Story 2 → Test independently → Deploy/Demo (add view + update)
4. Add User Story 3 → Test independently → Deploy/Demo (add lifecycle management)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Phase 1 + Phase 2 together
2. Once Foundational is done:
   - Developer A: User Story 1 (Create + List — highest priority)
   - Developer B: User Story 2 (View + Update)
   - Developer C: User Story 3 (Status + Level)
3. Stories complete and integrate independently
4. Developer A delivers MVP earliest (smaller scope)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Verify tests fail before implementing (Red-Green-Refactor)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
