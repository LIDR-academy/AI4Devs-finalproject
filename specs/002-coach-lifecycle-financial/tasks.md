# Tasks: Coach Lifecycle & Financial Data

**Input**: Design documents from `specs/002-coach-lifecycle-financial/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api-contracts.md

**Tests**: Included per Constitution v1.0.0 (Section II — Test-First for Domain Logic). The constitution mandates minimum 90% coverage, 100% branch coverage for domain services, and happy-path + error-path for every use case and endpoint.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/` at repository root
- **Frontend**: `frontend/src/` at repository root

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Minimal setup for the feature — extend existing Prisma schema

- [ ] T001 Add SecurityAuditLog model to Prisma schema in `backend/prisma/schema.prisma`
- [ ] T002 [P] Create Prisma migration for SecurityAuditLog table (`npm run db:migrate`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

### Backend — Domain Layer

- [ ] T003 Create Coach domain entity in `backend/src/domain/entities/Coach.ts`
- [ ] T004 [P] Create CoachRepository port interface in `backend/src/domain/ports/CoachRepository.ts`
- [ ] T005 [P] Create EncryptionService port interface in `backend/src/domain/ports/EncryptionService.ts`
- [ ] T006 Create CoachService (email uniqueness check) in `backend/src/domain/services/CoachService.ts`

### Backend — Infrastructure Layer

- [ ] T007 [P] Implement Aes256GcmEncryptionService in `backend/src/infrastructure/encryption/Aes256GcmEncryptionService.ts`
- [ ] T008 [P] Implement AuditLogger in `backend/src/infrastructure/logging/AuditLogger.ts`
- [ ] T009 Implement PrismaCoachRepository in `backend/src/infrastructure/persistence/PrismaCoachRepository.ts`

### Backend — Config

- [ ] T010 Update container.ts with all Coach DI wiring in `backend/src/config/container.ts`

### Frontend — Domain Types & Repository

- [ ] T011 [P] Create Coach domain types in `frontend/src/domain/types/coach.ts`
- [ ] T012 Create coachesRepository in `frontend/src/infrastructure/repositories/coachesRepository.ts`

### Tests

- [ ] T013 [P] [P] Write EncryptionService unit test in `backend/src/__tests__/encryption.test.ts` (MUST fail before T007)

**Checkpoint**: Foundation ready — user story implementation can now begin

---

## Phase 3: User Story 1 — Admin Creates a Coach (Priority: P1) 🎯 MVP

**Goal**: Admin can create a coach with profile and financial data. Financial data is encrypted at rest. Coach profile (without financial data) is returned on creation.

**Independent Test**: Create a new coach via `POST /api/v1/coaches` with valid data, verify 201 response contains profile fields but NO bankAccount/ssn/dni. Verify the stored DB row has encrypted financial data.

### Tests for User Story 1 ⚠️

- [ ] T014 [P] [US1] Write integration test for POST /coaches happy path (create + verify no financial data in response) in `backend/src/__tests__/coaches.test.ts`
- [ ] T015 [P] [US1] Write integration test for POST /coaches duplicate email (expect 409) in `backend/src/__tests__/coaches.test.ts`
- [ ] T016 [P] [US1] Write integration test for POST /coaches missing required fields (expect 400) in `backend/src/__tests__/coaches.test.ts`
- [ ] T017 [P] [US1] Write integration test for POST /coaches non-Admin access (expect 403) in `backend/src/__tests__/coaches.test.ts`
- [ ] T018 [P] [US1] Write integration test verifying financial data is encrypted in DB in `backend/src/__tests__/coaches.test.ts`

### Implementation for User Story 1

- [ ] T019 [US1] Create CreateCoach use case in `backend/src/application/use-cases/CreateCoach.ts`
- [ ] T020 [P] [US1] Create useCreateCoach hook in `frontend/src/infrastructure/hooks/useCreateCoach.ts`
- [ ] T021 [P] [US1] Create frontend createCoach use case in `frontend/src/domain/usecases/createCoach.ts`
- [ ] T022 [US1] Implement POST /api/v1/coaches route handler in `backend/src/infrastructure/routes/coaches.ts` (replace 501 stub)
- [ ] T023 [US1] Add create coach modal/dialog to Admin CoachesPage in `frontend/src/ui/pages/admin/CoachesPage.tsx`

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently

---

## Phase 4: User Story 2 — Admin Lists and Views Coaches (Priority: P1)

**Goal**: Admin can browse all coaches with pagination and status filtering, and view detailed coach profiles.

**Independent Test**: Create a coach, then request `GET /api/v1/coaches?status=active` and verify the created coach appears in the paginated list without financial data. Request `GET /api/v1/coaches/:id` and verify full profile without financial data.

### Tests for User Story 2 ⚠️

- [ ] T024 [P] [US2] Write integration test for GET /coaches paginated list (expect 200 + paginated response with no financial data) in `backend/src/__tests__/coaches.test.ts`
- [ ] T025 [P] [US2] Write integration test for GET /coaches with status filter in `backend/src/__tests__/coaches.test.ts`
- [ ] T026 [P] [US2] Write integration test for GET /coaches/:id detail (expect 200 + no financial data) in `backend/src/__tests__/coaches.test.ts`
- [ ] T027 [P] [US2] Write integration test for GET /coaches/:id not found (expect 404) in `backend/src/__tests__/coaches.test.ts`
- [ ] T028 [P] [US2] Write integration test for non-Admin access to list/detail (expect 403) in `backend/src/__tests__/coaches.test.ts`

### Implementation for User Story 2

- [ ] T029 [US2] Create FindCoaches use case in `backend/src/application/use-cases/FindCoaches.ts`
- [ ] T030 [US2] Create GetCoachById use case in `backend/src/application/use-cases/GetCoachById.ts`
- [ ] T031 [P] [US2] Create frontend findCoaches use case in `frontend/src/domain/usecases/findCoaches.ts`
- [ ] T032 [P] [US2] Create frontend getCoachById use case in `frontend/src/domain/usecases/getCoachById.ts`
- [ ] T033 [P] [US2] Create useFindCoaches hook in `frontend/src/infrastructure/hooks/useFindCoaches.ts`
- [ ] T034 [P] [US2] Create useCoach hook in `frontend/src/infrastructure/hooks/useCoach.ts`
- [ ] T035 [US2] Implement GET /api/v1/coaches route handler in `backend/src/infrastructure/routes/coaches.ts` (replace 501 stub)
- [ ] T036 [US2] Implement GET /api/v1/coaches/:id route handler in `backend/src/infrastructure/routes/coaches.ts` (replace 501 stub)
- [ ] T037 [US2] Create Admin CoachesPage with pagination + status filter in `frontend/src/ui/pages/admin/CoachesPage.tsx`
- [ ] T038 [US2] Create Admin CoachDetailPage in `frontend/src/ui/pages/admin/CoachDetailPage.tsx`
- [ ] T039 [US2] Register new admin coach routes in `frontend/src/infrastructure/routes/App.tsx`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 — Admin Updates Coach Profile and Lifecycle Status (Priority: P2)

**Goal**: Admin can update coach profile fields and activate/deactivate coaches.

**Independent Test**: Create a coach, update profile fields via `PUT /api/v1/coaches/:id`, verify changes reflected. Deactivate via `PATCH /api/v1/coaches/:id/status`, verify status changed. Reactivate, verify status changed back.

### Tests for User Story 3 ⚠️

- [ ] T040 [P] [US3] Write integration test for PUT /coaches/:id profile update (expect 200 + updated fields) in `backend/src/__tests__/coaches.test.ts`
- [ ] T041 [P] [US3] Write integration test for PATCH /coaches/:id/status deactivate (expect 200 + inactive status) in `backend/src/__tests__/coaches.test.ts`
- [ ] T042 [P] [US3] Write integration test for PATCH /coaches/:id/status reactivate (expect 200 + active status) in `backend/src/__tests__/coaches.test.ts`
- [ ] T043 [P] [US3] Write integration test for PATCH /coaches/:id/status idempotent (expect 200 when already in requested state) in `backend/src/__tests__/coaches.test.ts`
- [ ] T044 [P] [US3] Write integration test for non-Admin update/status (expect 403) in `backend/src/__tests__/coaches.test.ts`

### Implementation for User Story 3

- [ ] T045 [US3] Create UpdateCoach use case in `backend/src/application/use-cases/UpdateCoach.ts`
- [ ] T046 [US3] Create ToggleCoachStatus use case in `backend/src/application/use-cases/ToggleCoachStatus.ts`
- [ ] T047 [P] [US3] Create frontend updateCoach use case in `frontend/src/domain/usecases/updateCoach.ts`
- [ ] T048 [P] [US3] Create frontend toggleCoachStatus use case in `frontend/src/domain/usecases/toggleCoachStatus.ts`
- [ ] T049 [P] [US3] Create useUpdateCoach hook in `frontend/src/infrastructure/hooks/useUpdateCoach.ts`
- [ ] T050 [P] [US3] Create useToggleCoachStatus hook in `frontend/src/infrastructure/hooks/useToggleCoachStatus.ts`
- [ ] T051 [US3] Implement PUT /api/v1/coaches/:id route handler in `backend/src/infrastructure/routes/coaches.ts` (replace 501 stub)
- [ ] T052 [US3] Implement PATCH /api/v1/coaches/:id/status route handler in `backend/src/infrastructure/routes/coaches.ts` (replace 501 stub)
- [ ] T053 [US3] Add profile editing (name, email, phone, specialities) + activate/deactivate toggle to Admin CoachDetailPage in `frontend/src/ui/pages/admin/CoachDetailPage.tsx`

**Checkpoint**: At this point, User Stories 1, 2, AND 3 should all work independently

---

## Phase 6: User Story 4 — Admin Accesses Financial Data via Dedicated Endpoint (Priority: P1)

**Goal**: Admin can retrieve a coach's financial data through a dedicated, audited endpoint. Financial data is never exposed through list or general profile endpoints. Access is logged as a security event.

**Independent Test**: Create a coach with financial data. Verify GET /coaches and GET /coaches/:id do NOT include financial fields. Request GET /coaches/:id/financial and verify decrypted financial data returned. Verify SecurityAuditLog table has a log entry. Request with non-Admin token — expect 403.

### Tests for User Story 4 ⚠️

- [ ] T054 [P] [US4] Write integration test for GET /coaches/:id/financial happy path (expect 200 + decrypted financial data) in `backend/src/__tests__/coaches.test.ts`
- [ ] T055 [P] [US4] Write integration test verifying financial data is NOT in list response in `backend/src/__tests__/coaches.test.ts`
- [ ] T056 [P] [US4] Write integration test verifying financial data is NOT in detail response in `backend/src/__tests__/coaches.test.ts`
- [ ] T057 [P] [US4] Write integration test for audit log entry after financial access in `backend/src/__tests__/coaches.test.ts`
- [ ] T058 [P] [US4] Write integration test for non-Admin financial access (expect 403 + audit log entry) in `backend/src/__tests__/coaches.test.ts`
- [ ] T059 [P] [US4] Write integration test for decryption failure handling (expect 503) in `backend/src/__tests__/coaches.test.ts`

### Implementation for User Story 4

- [ ] T060 [US4] Create GetCoachFinancialData use case in `backend/src/application/use-cases/GetCoachFinancialData.ts`
- [ ] T061 [P] [US4] Create frontend getCoachFinancialData use case in `frontend/src/domain/usecases/getCoachFinancialData.ts`
- [ ] T062 [P] [US4] Create useCoachFinancialData hook in `frontend/src/infrastructure/hooks/useCoachFinancialData.ts`
- [ ] T063 [US4] Implement GET /api/v1/coaches/:id/financial route handler with audit logging in `backend/src/infrastructure/routes/coaches.ts` (replace 501 stub)
- [ ] T064 [US4] Create Admin CoachFinancialDataPage in `frontend/src/ui/pages/admin/CoachFinancialDataPage.tsx`
- [ ] T065 [US4] Add financial data link/button to Admin CoachDetailPage in `frontend/src/ui/pages/admin/CoachDetailPage.tsx`
- [ ] T066 [US4] Register financial data route in `frontend/src/infrastructure/routes/App.tsx`

**Checkpoint**: All user stories should now be independently functional

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Improvements that affect multiple user stories

- [ ] T067 [P] Add CoachFinancialData page to admin nav layout in `frontend/src/ui/components/layouts/AdminLayout.tsx` (if applicable)
- [ ] T068 Run full test suite: `cd backend && npm test`
- [ ] T069 Run lint + typecheck: `cd backend && npm run lint && npm run typecheck` and `cd frontend && npm run lint && npm run typecheck`
- [ ] T070 Run quickstart.md validation scenarios end-to-end
- [ ] T071 [P] Add API contract documentation to `backend/docs/api-specifications.md`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion — BLOCKS all user stories
- **User Stories (Phase 3-6)**: All depend on Foundational phase completion
  - US1 (Phase 3) = MVP — no dependency on other stories
  - US2 (Phase 4) = Can start after Phase 2 — assumes US1 data exists but independently testable
  - US3 (Phase 5) = Can start after Phase 2 — independently testable
  - US4 (Phase 6) = Can start after Phase 2 — independently testable (requires US1 data for full flow)
- **Polish (Phase 7)**: Depends on all user stories being complete

### User Story Dependencies

- **US1 (P1)**: Can start after Phase 2 — No dependencies on other stories
- **US2 (P1)**: Can start after Phase 2 — No dependencies on other stories
- **US3 (P2)**: Can start after Phase 2 — No dependencies on other stories
- **US4 (P1)**: Can start after Phase 2 — No dependencies on other stories

### Within Each User Story

- Tests MUST be written and FAIL before implementation (Constitution II — Red-Green-Refactor)
- Use cases before route handlers
- Frontend use cases before hooks before pages
- Story complete before moving to next priority

### Parallel Opportunities

- All Phase 1 tasks can run in parallel [P]
- T003-T006 (domain layer) can all run in parallel [P]
- T007-T009 (infrastructure) can all run in parallel [P]
- T011-T012 (frontend types + repo) can run in parallel [P]
- Within each US phase:
  - All test tasks [P] can run in parallel
  - All frontend use case/hook tasks [P] can run in parallel
  - But implementation must be sequential within each layer
- Different user stories can be worked on in parallel by different team members once Phase 2 is complete

---

## Parallel Example: User Story 1

```bash
# Launch all US1 tests together (write first, expect failure):
Task: "Write integration test for POST /coaches happy path"
Task: "Write integration test for POST /coaches duplicate email"
Task: "Write integration test for POST /coaches missing fields"
Task: "Write integration test for POST /coaches non-Admin"
Task: "Write integration test for POST /coaches encryption"

# Launch all US1 frontend artifacts together (after backend implementation):
Task: "Create useCreateCoach hook"
Task: "Create createCoach use case"
Task: "Update CoachesPage with create modal"
```

## Parallel Example: User Story 2

```bash
# Launch all US2 tests together (write first, expect failure):
Task: "Write integration test for GET /coaches list"
Task: "Write integration test for GET /coaches with filter"
Task: "Write integration test for GET /coaches/:id detail"

# Launch all US2 frontend artifacts together (after backend implementation):
Task: "Create findCoaches use case"
Task: "Create useFindCoaches hook"
Task: "Create getCoachById use case"
Task: "Create useCoach hook"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1: Setup — SecurityAuditLog migration
2. Phase 2: Foundational — Coach entity, ports, services, encryption, repository, container, frontend types
3. Phase 3: User Story 1 — Create Coach (backend + frontend)
4. **STOP and VALIDATE**: Test US1 independently via quickstart.md
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 (Create Coach) → Test independently → MVP!
3. Add US2 (List/View) → Test independently
4. Add US4 (Financial Data) → Test independently
5. Add US3 (Update/Status) → Test independently
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: US1 (Create Coach) — P1 MVP
   - Developer B: US2 (List/View Coaches) — P1
   - Developer C: US4 (Financial Data) — P1
3. US3 (Update/Status) — P2, can be picked up by any available developer

---

## Notes

- [P] tasks = different files, no dependencies
- [US1-4] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Tests MUST fail before implementing (verify test failure)
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- The existing `backend/src/infrastructure/routes/coaches.ts` has 501 stubs for all 6 endpoints — replace each stub with real implementation in the respective US phase
- The `User` Prisma model already has `bank_account`, `ssn`, `dni` fields — no schema migration needed for financial data columns
- `backend/src/config/container.ts` needs updates in Phase 2 (foundational) and then incremental additions in each US phase for new use cases
- `frontend/src/infrastructure/routes/App.tsx` needs updates in Phase 4 and Phase 6 for new admin coach pages
