# Tasks: Level System & Role-Based UI

**Input**: Design documents from `/specs/003-level-system-role-ui/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Status**: ~80% of this feature is already implemented. Tasks below close remaining gaps identified during codebase analysis.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US4)
- Include exact file paths in descriptions

## Path Conventions

- **Backend**: `backend/src/`
- **Frontend**: `frontend/src/`

---

## Phase 1: Setup & Foundational

**Purpose**: No setup or foundational work needed. All project infrastructure, dependencies, database schema, entity models, layouts, routing, and middleware are already in place.

**Foundational items already complete**:
- Prisma schema with Level model ✅
- Seed script creating 5 levels ✅
- Level entity (`backend/src/domain/entities/Level.ts`) ✅
- GET /api/v1/levels endpoint ✅
- PATCH /api/v1/coachees/:id/level endpoint ✅
- UpdateCoacheeLevel use case (partial) ✅
- AdminLayout, CoachLayout, CoacheeLayout ✅
- ProtectedRoute ✅
- App.tsx routing ✅
- useLevels, useUpdateCoacheeLevel hooks ✅
- NotificationBell component ✅

---

## Phase 2: User Story 4 - Admin/Coach assigns training level to Coachee (Priority: P1) 🎯 MVP

**Goal**: Complete level assignment for both Admin and Coach roles with audit logging and proper navigation.

**Independent Test**: From Admin or Coach Coachee detail page, select a new level from dropdown, click "Change Level" — verify level updates immediately and audit log entry is created.

### Implementation for User Story 4

- [x] T001 [US4] Inject AuditLogger into UpdateCoacheeLevel use case in `backend/src/application/use-cases/UpdateCoacheeLevel.ts` and write SecurityAuditLog entry on level change
- [x] T002 [P] [US4] Create CoachCoacheeDetailPage with level assignment UI in `frontend/src/ui/pages/coach/CoacheeDetailPage.tsx`
- [x] T003 [P] [US4] Add coachee detail route for Coach in `frontend/src/infrastructure/routes/App.tsx`
- [x] T004 [P] [US4] Fix CoachCoacheesPage navigation bug — change route from `/admin/coachees/${c.id}` to `/coach/coachees/${c.id}` in `frontend/src/ui/pages/coach/CoacheesPage.tsx`

**Checkpoint**: Admin and Coach can assign levels to any Coachee. Level changes are audited. Coach navigation works correctly.

---

## Phase 3: User Story 3 - Coachee views role-specific layout (Priority: P1)

**Goal**: Complete Coachee experience by showing their current level on the Home page.

**Independent Test**: Log in as a Coachee with an assigned level — verify their current level is displayed on the Home page.

### Implementation for User Story 3

- [x] T005 [US3] Display logged-in Coachee's current training level on HomePage in `frontend/src/ui/pages/coachee/HomePage.tsx`

**Checkpoint**: Coachee can see their assigned level on the home screen.

---

## Phase 4: Testing

**Goal**: Add test coverage for level-related backend endpoints.

**Independent Test**: Run `npm test` in backend — all level-related tests pass.

### Implementation for Testing

- [x] T006 [P] Add GET /api/v1/levels endpoint test (happy path + auth) in `backend/src/__tests__/coachees.test.ts`
- [x] T007 [P] Add PATCH /api/v1/coachees/:id/level authorization test (Coach can change level, Coachee cannot) in `backend/src/__tests__/coachees.test.ts`

**Checkpoint**: `npm test` passes with new level coverage.

---

## Phase 5: Validation

**Purpose**: Run lint, typecheck, and full test suite to ensure code quality.

- [x] T008 Run `npm run lint` from backend/ and fix any issues
- [x] T009 Run `npm run typecheck` from backend/ and fix any issues
- [x] T010 Run `npm test` from backend/ and confirm all tests pass

---

## Dependencies & Execution Order

### Phase Dependencies

| Phase | Depends On | Notes |
|-------|-----------|-------|
| Phase 1 (Setup & Foundational) | None | Already complete |
| Phase 2 (US4 - Level Assignment) | Phase 1 | Core level assignment work |
| Phase 3 (US3 - Coachee level display) | Phase 2 | Needs level assignment working first to display valid data |
| Phase 4 (Testing) | Phase 2 | Tests verify the implementation |
| Phase 5 (Validation) | All above | Final quality gate |

### User Story Dependencies

- **US4 (P1)** — Level assignment: No dependencies on other stories. Can start immediately.
- **US3 (P1)** — Coachee level display: Depends on US4 being functional (so levels can be assigned before being displayed).
- **US1, US2** — Layouts: Already complete. No tasks needed.
- **US5** — Level seeding: Already complete. No tasks needed.

### Parallel Opportunities

- T001, T002, T003, T004 can all run in parallel (different files, no dependencies)
- T006 and T007 can run in parallel

---

## Parallel Example: User Story 4

```bash
# All US4 tasks can run concurrently:
Task: "T001 Inject AuditLogger into UpdateCoacheeLevel"
Task: "T002 Create CoachCoacheeDetailPage"
Task: "T003 Add coach coachee detail route"
Task: "T004 Fix CoachCoacheesPage navigation"
```

---

## Implementation Strategy

### MVP First (Phase 2 Only)

1. Complete Phase 2: User Story 4 (level assignment + audit + coach detail)
2. **STOP and VALIDATE**: Admin can change level on any Coachee; Coach has working coachee detail with level assignment; audit log entries created
3. Deploy/demo if ready

### Incremental Delivery

1. Complete Phase 2 → Level assignment fully functional (MVP!)
2. Complete Phase 3 → Coachee can see their level
3. Complete Phase 4 → Tests verify correctness
4. Complete Phase 5 → Quality gate passed

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Existing tests in `backend/src/__tests__/coachees.test.ts` already cover PATCH /coachees/:id/level basic flow — build on these
- No frontend test framework is currently configured in the vitest workspace; backend tests only
- AuditLogger is already instantiated in `backend/src/config/container.ts` — just needs injection into UpdateCoacheeLevel constructor
