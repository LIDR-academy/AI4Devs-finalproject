# Tasks: Default Password & Force Change on First Login

**Input**: Design documents from `specs/004-default-password-force-change/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Tests are included as specified in spec.md acceptance scenarios.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- **Web app**: `backend/src/`, `frontend/src/`
- Paths shown use this project's structure based on plan.md

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization — no setup needed, project already scaffolded.

*No tasks required — project already has full structure (Express, Prisma, React, Vite, etc.)*

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Prisma schema change and migration that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [ ] T001 Add `must_change_password Boolean @default(true)` field to User model in `backend/prisma/schema.prisma` (after `password_hash`)

- [ ] T002 Run Prisma migration: `npx prisma migrate dev --name add_must_change_password` in `backend/`

- [ ] T003 Regenerate Prisma client: `npx prisma db:generate` in `backend/`

**Checkpoint**: Foundation ready — database has `must_change_password` column with default `true`

---

## Phase 3: User Story 1 - Admin creates coachee with phone as default password (Priority: P1) 🎯 MVP

**Goal**: Admin creates a coachee; phone is required and used as the initial password; `must_change_password` is `true` by default.

**Independent Test**: Admin creates a coachee with phone, then logs in as that coachee using the phone as password.

### Implementation for User Story 1

- [ ] T004 [P] [US1] Replace `crypto.randomUUID()` with `data.phone` as the password (hashed with bcrypt) in `backend/src/application/use-cases/CreateCoachee.ts`

- [ ] T005 [US1] Change phone from optional to required in Zod schema in `backend/src/infrastructure/routes/coachees.ts`: change `z.string().max(20).optional().nullable()` to `z.string().min(1).max(20)`

- [ ] T006 [P] [US1] Add asterisk `*` to phone label and add validation error "Phone is required" when empty in `frontend/src/ui/pages/admin/CoacheesPage.tsx`

**Checkpoint**: Admin must provide phone when creating coachee; coachee can log in with phone as password.

---

## Phase 4: User Story 2 - Coachee logs in for the first time and is forced to change password (Priority: P1)

**Goal**: Login response includes `mustChangePassword`; coachee is redirected to change-password page instead of home.

**Independent Test**: A coachee with `must_change_password = true` logs in and is redirected to `/change-password`.

### Implementation for User Story 2

- [ ] T007 [US2] Add `mustChangePassword` to user object in `POST /auth/login` response in `backend/src/infrastructure/routes/auth.ts`

- [ ] T008 [US2] Add `mustChangePassword` to user object in `POST /auth/refresh` response in `backend/src/infrastructure/routes/auth.ts`

- [ ] T009 [P] [US2] Add `mustChangePassword: boolean` to the `User` interface in `frontend/src/domain/types/auth.ts`

- [ ] T010 [US2] After successful login, check `data.user.mustChangePassword` and navigate to `/change-password` instead of role home in `frontend/src/ui/pages/LoginPage.tsx`

- [ ] T011 [US2] Add redirect logic in `RootRedirect`: if `user.mustChangePassword === true`, redirect to `/change-password` instead of role home in `frontend/src/infrastructure/routes/App.tsx`

**Checkpoint**: Coachee with `must_change_password = true` is redirected to change-password on login and on any navigation.

---

## Phase 5: User Story 3 - Coachee changes password (Priority: P1)

**Goal**: Authenticated user can change password via dedicated endpoint and page; flag clears on success.

**Independent Test**: A coachee on `/change-password` submits current + new password, gets redirected to home upon success.

### Implementation for User Story 3

- [ ] T012 [US3] Add `POST /auth/change-password` endpoint with Zod validation (`currentPassword: string`, `newPassword: string` min 6 chars) in `backend/src/infrastructure/routes/auth.ts`

- [ ] T013 [US3] Implement change-password logic: verify current password with bcrypt, hash new password with bcrypt cost 12, update `password_hash`, set `must_change_password = false`, return `{ message: "Password changed successfully" }` in `backend/src/infrastructure/routes/auth.ts`

- [ ] T014 [P] [US3] Create `useChangePassword` hook in `frontend/src/infrastructure/hooks/useChangePassword.ts` (POST to `/auth/change-password`, handle success/error)

- [ ] T015 [US3] Create `ChangePasswordPage` with form fields (current password, new password, confirm new password), validation (all required, new min 6 chars, new === confirm), and redirect to role-based home on success in `frontend/src/ui/pages/ChangePasswordPage.tsx`

- [ ] T016 [US3] Add route `"/change-password"` with `<ChangePasswordPage />` element (requires auth — redirect to `/login` if unauthenticated) in `frontend/src/infrastructure/routes/App.tsx`

**Checkpoint**: Authenticated user can change password; flag clears; redirected to home.

---

## Phase 6: User Story 4 - Coachee logs in after changing password (Priority: P2)

**Goal**: After password change, subsequent logins go directly to home without forced change.

**Independent Test**: A coachee who changed password logs in with new password and goes directly to home.

*No additional implementation tasks needed — this is the natural outcome of US2 + US3: when `must_change_password` is `false`, `RootRedirect` and `LoginPage` do not redirect to change-password.*

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Tests, documentation, lint, typecheck

- [ ] T017 [P] Write unit test for `CreateCoachee` use case verifying password = phone in `backend/src/__tests__/CreateCoachee.test.ts`

- [ ] T018 [P] Write integration test for `POST /auth/change-password` endpoint (happy path + validation errors) in `backend/src/__tests__/auth.ts`

- [ ] T019 Write integration test for login response including `mustChangePassword` field in `backend/src/__tests__/auth.ts`

- [ ] T020 Update `docs/api-specifications.md` with `POST /auth/change-password` endpoint documentation and updated login/refresh/coachees sections (already done in spec)

- [ ] T021 Run `npm run lint` and fix any Biome issues

- [ ] T022 Run `npm run typecheck` and fix any TypeScript errors

- [ ] T023 Run full test suite: `npm test`

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No tasks — project already scaffolded
- **Foundational (Phase 2)**: T001→T002→T003 sequential — BLOCKS all user stories
- **US1 (Phase 3)**: Depends on Foundational — backend tasks (T004, T005) can start in parallel; frontend (T006) can optionally start in parallel since it's independent
- **US2 (Phase 4)**: Depends on Foundational — T007+T008 (backend) and T009+T010+T011 (frontend) can be parallel within the phase
- **US3 (Phase 5)**: Depends on Foundational — T012+T013 (backend) before T014+T015+T016 (frontend)
- **US4 (Phase 6)**: No implementation tasks — natural outcome
- **Polish (Phase 7)**: Depends on US1, US2, US3 complete

### User Story Dependencies

- **US1 (P1)**: Can start after Foundational — no dependencies on other stories
- **US2 (P1)**: Can start after Foundational — must coordinate with US1 on `mustChangePassword` field but independently testable
- **US3 (P1)**: Can start after Foundational — independently testable; the change-password endpoint works for any role
- **US4 (P2)**: Natural outcome — requires US2 and US3 to be complete to verify

### Within Each User Story

- Backend tasks before frontend tasks where API changes are needed
- Core implementation before validation/logging
- Story complete before moving to next priority

### Parallel Opportunities

- T004 and T005 (US1 backend changes) can run in parallel
- T006 (US1 frontend) can run in parallel with T004 and T005 (different projects)
- T007 and T008 (US2 backend auth response) can run in parallel
- T009 (US2 types) can run in parallel with T007/T008
- T010 and T011 (US2 frontend) depend on T009 but can run in parallel with each other
- T012 and T013 (US3 backend) are sequential within the same file
- T014 can run in parallel with T015 (different files)
- T016 depends on T015 (page must exist before route)

---

## Parallel Example: User Story 1

```bash
# Launch backend tasks in parallel:
Task: "Replace crypto.randomUUID() with data.phone in CreateCoachee.ts"
Task: "Change phone to required in coachees.ts Zod schema"

# Launch frontend task (can run in parallel with backend):
Task: "Add phone validation to CoacheesPage.tsx"
```

## Parallel Example: User Story 2

```bash
# Launch backend auth response changes in parallel:
Task: "Add mustChangePassword to login response in auth.ts"
Task: "Add mustChangePassword to refresh response in auth.ts"

# Launch frontend type change (independent):
Task: "Add mustChangePassword to User interface in auth.ts"
```

## Parallel Example: User Story 3

```bash
# Launch hook creation and page creation in parallel:
Task: "Create useChangePassword hook"
Task: "Create ChangePasswordPage"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 2: Foundational (Prisma migration)
2. Complete Phase 3: User Story 1 (phone required, phone as password)
3. **STOP and VALIDATE**: Create a coachee → log in with phone → login succeeds
4. Deploy/demo if ready — coachees can at least log in (forced change pending)

### Incremental Delivery

1. Complete Foundational → Database ready
2. Add User Story 1 → Coachees can log in with phone → Deploy/Demo
3. Add User Story 2 → Coachees are redirected to change-password → Deploy/Demo
4. Add User Story 3 → Coachees can change password → Deploy/Demo (MVP complete!)
5. Add Polish (Phase 7) → Tests pass, docs updated

### Parallel Team Strategy

With multiple developers:
1. Complete Foundational (Phase 2) together
2. Once Foundational is done:
   - Developer A: US1 (backend + frontend)
   - Developer B: US2 (backend auth response + frontend redirect)
   - Developer C: US3 (backend change-password endpoint + frontend page)
3. Stories complete and integrate independently
4. Polish (Phase 7) can be distributed

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
