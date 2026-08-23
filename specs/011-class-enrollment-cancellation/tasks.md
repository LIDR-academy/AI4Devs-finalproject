---

description: "Task list for implementing Class Enrollment & Cancellation (US-3.1)"

---

# Tasks: Class Enrollment & Cancellation

**Input**: Design documents from `/specs/011-class-enrollment-cancellation/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ (api.md, ui.md), quickstart.md

**Tests**: The project constitution (`.specify/memory/constitution.md` §II Test-First, NON-NEGOTIABLE) mandates tests written and failing before production code (Red-Green) with domain services at 100% branch coverage and an integration (Supertest) happy-path + validation-error test for every endpoint. All user story phases therefore include test tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
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

**Purpose**: The pure `EnrollmentPolicy` domain service — the single source of every join/cancel business rule, required by both backend user stories

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T002 [P] Write `EnrollmentPolicy.test.ts` in `backend/src/domain/services/EnrollmentPolicy.test.ts` covering ALL branches: capacity full/ok, level reach ok/out-of-reach (incl. coachee without level), time overlap yes/no, already-enrolled, individual class, canceled class, cancel-ownership yes/no, opened-spot true/false, Coach notification types 3/4/5, and join-rule ordering — confirm the suite FAILS against the missing service
- [X] T003 Implement `EnrollmentPolicy.ts` in `backend/src/domain/services/EnrollmentPolicy.ts` as a pure TypeScript service (zero Prisma/Express/Zod imports) exposing `assertGroupJoinEligible`, cancel-ownership, `openedSpotDetected`, and `coachNotificationTypeForCancellation`; make T002 pass with 100% branch coverage

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Join a group class with an available spot (Priority: P1) 🎯 MVP

**Goal**: A Coachee self-joins an ACTIVE group class via `POST /classes/:id/enrollment` (JWT identity only), with capacity (max 4), level-reach (±1), time-overlap and already-enrolled validation, and the documented error codes `CLASS_FULL`, `LEVEL_MISMATCH`, `OVERLAP_DETECTED`, `ALREADY_ENROLLED`, plus `VALIDATION_ERROR` (individual / canceled) and `NOT_FOUND`.

**Independent Test**: Supertest against `POST /api/v1/classes/:id/enrollment` — one happy path (201 + enrollment object, count +1) and one test per documented error code, plus a two-coachee last-spot race proving exactly one 201 and one `CLASS_FULL`. See `quickstart.md` Scenarios 1-2, 4.

### Tests for User Story 1 (write FIRST, ensure they FAIL) ⚠️

- [X] T004 [P] [US1] Write `JoinTrainingClass.test.ts` in `backend/src/__tests__/JoinTrainingClass.test.ts` (mocked `PrismaClient`): happy path + each failure (class not found, canceled class, individual class, already enrolled, level mismatch incl. missing coachee level, overlap, class full, serializable-tx race yielding one `CLASS_FULL`)
- [X] T005 [P] [US1] Write POST integration tests (happy + every error code + race) in `backend/src/__tests__/classes.enrollment.int.test.ts` via Supertest — confirm they FAIL against the current `501 NOT_IMPLEMENTED` stub

### Implementation for User Story 1

- [X] T006 [US1] Implement `JoinTrainingClass.ts` in `backend/src/application/use-cases/JoinTrainingClass.ts`: reads class + coachee, runs `EnrollmentPolicy.assertGroupJoinEligible`, loads the coachee's overlapping enrolled active classes via `hasOverlap`, performs the read-check-create inside `prisma.$transaction(..., { isolationLevel: "Serializable" })` (see research.md D2), creates the `ClassEnrollment` row, and writes `SecurityAuditLog` (class.enroll SUCCESS or DENIED)
- [X] T007 [US1] Register `JoinTrainingClass` in `backend/src/config/container.ts` (constructor args: `prisma`, `new EnrollmentPolicy()`, `auditLogger`)
- [X] T008 [US1] Replace the `501` stub in `backend/src/infrastructure/routes/classes.ts` for `POST /classes/:id/enrollment` with a real handler: `authenticate` + `requireRole(UserRole.COACHEE)`, JWT-derived coachee id (no body), `201` enrollment object response

**Checkpoint**: User Story 1 fully functional and independently testable (MVP)

---

## Phase 4: User Story 2 - Cancel own attendance from any enrolled class (Priority: P1)

**Goal**: The enrolled Coachee cancels via `DELETE /classes/:id/enrollment` from any class they are in (group join or assigned individual), with no penalties, the `ClassEnrollment` row deleted, opened-spot detection for waiting lists, a Coach `Notification` row (types 3/4/5), and `waitingListProcessed`/`claimedByCoachee` in the response (auto-promotion is EP-04).

**Independent Test**: Supertest against `DELETE /api/v1/classes/:id/enrollment` — happy path (200, row removed, count -1, coach notification row created, `claimedByCoachee: null`) plus `404` (not enrolled / class missing), `400` (canceled class), `403` (non-Coachee). See `quickstart.md` Scenario 3.

### Tests for User Story 2 (write FIRST, ensure they FAIL) ⚠️

- [X] T009 [P] [US2] Write `CancelEnrollment.test.ts` in `backend/src/__tests__/CancelEnrollment.test.ts` (mocked `PrismaClient`): happy path group-with-WL (type 4), group-without-WL (type 5), assigned individual (type 3), `openedSpotDetected` true/false, not-enrolled 404, canceled 400, class-missing 404, ownership enforcement
- [X] T010 [US2] Add DELETE integration tests (happy + `404`/`400`/`403`) to `backend/src/__tests__/classes.enrollment.int.test.ts` — confirm they FAIL against the current `501` stub

### Implementation for User Story 2

- [X] T011 [US2] Implement `CancelEnrollment.ts` in `backend/src/application/use-cases/CancelEnrollment.ts`: load class + enrollment + waiting-list count, enforce class ACTIVE and enrollment ownership, delete the `ClassEnrollment` row, create the Coach `Notification` row via `EnrollmentPolicy.coachNotificationTypeForCancellation`, return `{ message, waitingListProcessed, claimedByCoachee: null }`, write `SecurityAuditLog` (class.cancel-enrollment SUCCESS or DENIED); all in one transaction
- [X] T012 [US2] Register `CancelEnrollment` in `backend/src/config/container.ts`
- [X] T013 [US2] Replace the `501` stub in `backend/src/infrastructure/routes/classes.ts` for `DELETE /classes/:id/enrollment` with a real handler: `authenticate` + `requireRole(UserRole.COACHEE)`, JWT-derived coachee id (no body), `200` cancel object response

**Checkpoint**: User Stories 1 AND 2 both work independently

---

## Phase 5: User Story 3 - See the correct join state on every class card (Priority: P2)

**Goal**: Coachee class cards render the correct action — `Join` (green, open spot, within reach), `Cancel` (enrolled), `Waiting list` option replacing `Join` when full (FR-016), no join action for individual/canceled/out-of-reach — flipping state without a full reload and showing per-error-code toasts on refusals. State is derived purely from server-provided `visibility`/`coacheeStatus`; no client-side business rules.

**Independent Test**: `classCardState.test.ts` unit matrix (each input combination → expected action per `contracts/ui.md`) and a manual UI pass on `CoacheeHomePage` (see `quickstart.md` Frontend section): confirm Join/Cancel/Waiting-list labels, confirmation dialogs, toasts, and cache-driven state flips.

### Tests for User Story 3 (write FIRST, ensure they FAIL) ⚠️

- [X] T014 [P] [US3] Write `classCardState.test.ts` in `frontend/src/domain/utils/classCardState.test.ts` covering the full state→action matrix from `contracts/ui.md` (canceled, individual, enrolled/blue, on-waiting-list, full→waiting-list, green-with-spot, out-of-reach gray)

### Implementation for User Story 3

- [X] T015 [P] [US3] Add `EnrollResponse` and `CancelEnrollmentResponse` types to `frontend/src/domain/types/class.ts`
- [X] T016 [P] [US3] Create `classCardState.ts` in `frontend/src/domain/utils/classCardState.ts` (pure state→action mapping per `contracts/ui.md` §1)
- [X] T017 [P] [US3] Create `enrollmentErrorMessages.ts` in `frontend/src/domain/utils/enrollmentErrorMessages.ts` mapping `error.code` (`CLASS_FULL`, `LEVEL_MISMATCH`, `OVERLAP_DETECTED`, `ALREADY_ENROLLED`, `NOT_FOUND`, `FORBIDDEN`, `VALIDATION_ERROR`, unknown/network) to Coachee-facing messages; never surface `error.ref`
- [X] T018 [P] [US3] Extend `classesRepository.ts` in `frontend/src/infrastructure/repositories/classesRepository.ts` with `join(id)` → `POST /classes/:id/enrollment` and `cancelEnrollment(id)` → `DELETE /classes/:id/enrollment`
- [X] T019 [P] [US3] Create `useJoinClass.ts` in `frontend/src/infrastructure/hooks/useJoinClass.ts` (TanStack mutation posting to `classesRepository.join`, invalidating the class-list query on success)
- [X] T020 [P] [US3] Create `useCancelEnrollment.ts` in `frontend/src/infrastructure/hooks/useCancelEnrollment.ts` (mutation calling `classesRepository.cancelEnrollment`, invalidating the class-list query on success)
- [X] T021 [US3] Create `CoacheeClassCard.tsx` in `frontend/src/ui/components/CoacheeClassCard.tsx`: renders class info (type, level, gym-time start via existing `gymDateTime` helpers, Coach, enrollmentCount/capacity) and uses `classCardState` + `EnrollmentActions`-style buttons with confirmation dialogs, `enrollmentErrorMessages` toasts, and cache-state flips (deps: T015-T020)
- [X] T022 [US3] Create `CoacheeClassList.tsx` in `frontend/src/ui/components/CoacheeClassList.tsx`: fetches via `useListClasses` over the visible window, renders cards chronologically, shows an empty state (deps: T016, T021)
- [X] T023 [US3] Wire `CoacheeClassList` into `frontend/src/ui/pages/coachee/HomePage.tsx` (replace the static "Joinable Classes" placeholder; keep HomePage layout otherwise unchanged)

**Checkpoint**: All user stories independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Verification and governance gates that span the whole feature

- [X] T024 [P] Run the full PR gate in both `backend/` and `frontend/`: `npm run typecheck`, `npm run lint` (biome), `npm test` (vitest), and `npm audit --audit-level=high`
- [X] T025 Run `quickstart.md` validation end-to-end: backend curl scenarios (join happy + all errors, cancel happy + errors, last-spot race) and the frontend manual card flow
- [X] T026 Constitution compliance review (Domain Purity G1, Test-First G2, Security-by-Default G3, API Contract G4, Dependency Integrity G5) before merge; confirm `Complexity Tracking` remains empty

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on the `EnrollmentPolicy` foundational phase
  - US1 and US2 (both P1) share `backend/src/infrastructure/routes/classes.ts` — their use cases and tests are parallel-safe, but the two route-stub replacements (T008, T013) must be sequential on that one file
  - US3 (P2, frontend) has no dependency on US1/US2 backend work and can run fully in parallel
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 2 only — MVP deliverable
- **User Story 2 (P1)**: Depends on Phase 2 only; independent of US1 (shares only the routes file, sequenced via T008→T013)
- **User Story 3 (P2)**: Depends on Phase 2 only; consumes existing `GET /classes` `visibility`/`coacheeStatus` (no new backend)

### Within Each User Story

- Tests written and confirmed FAILING before implementation (Constitution §II Red-Green)
- Domain service (Phase 2) → use cases → DI registration → route handlers
- Unit tests before integration tests; both before the route work they exercise

### Parallel Opportunities

- Foundational phase: T002 (tests) and T003 (service) are sequential; nothing else in Phase 2
- US1 tests T004/T005 run in parallel; US2 tests T009/T010 run in parallel
- US1 + US2 + US3 can all be implemented in parallel by different developers (route-file edits T008/T013 coordinated; US3 frontend fully isolated)
- US3 implementation tasks T015-T020 are all parallel-safe (distinct files); T021/T022 sequentially depend on them

---

## Parallel Example: User Story 3

```bash
# Launch all independent US3 building blocks together:
Task: "T015 Extend frontend/src/domain/types/class.ts"
Task: "T016 Create frontend/src/domain/utils/classCardState.ts"
Task: "T017 Create frontend/src/domain/utils/enrollmentErrorMessages.ts"
Task: "T018 Extend frontend/src/infrastructure/repositories/classesRepository.ts"
Task: "T019 Create frontend/src/infrastructure/hooks/useJoinClass.ts"
Task: "T020 Create frontend/src/infrastructure/hooks/useCancelEnrollment.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (`EnrollmentPolicy`)
3. Complete Phase 3: User Story 1 (join)
4. **STOP and VALIDATE**: run `classes.enrollment.int.test.ts` + `quickstart.md` Scenarios 1-2
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add User Story 1 (join) → test independently → MVP
3. Add User Story 2 (cancel) → test independently
4. Add User Story 3 (card states) → test independently + manual UI pass
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (join backend)
   - Developer B: User Story 2 (cancel backend) — coordinate the shared routes file with Developer A
   - Developer C: User Story 3 (frontend cards) — fully independent
3. Stories complete and integrate independently; Polish phase gates the merge

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to the spec user story for traceability (US1 join, US2 cancel, US3 card states)
- Each user story is independently completable and testable
- Tests fail-before-production per Constitution §II; domain service targets 100% branch coverage
- Every endpoint change is guarded by `authenticate` + `requireRole(COACHEE)`; identity comes from the JWT only (no body id) — Constitution §III
- Error responses always use `{ error: { code, message, ref } }` with the documented codes — Constitution §IV
- Commit after each task or logical group; no schema migrations or new dependencies are expected