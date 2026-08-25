---

description: "Task list for Calendar Block Management (US-2.4 / COACHER-19)"
---

# Tasks: Calendar Block Management

**Input**: Design documents from `/specs/009-calendar-block-management/`

**Prerequisites**: plan.md (required), spec.md (required for user stories), research.md, data-model.md, contracts/

**Tests**: Test tasks ARE included because the project constitution (§II Test-First) mandates tests written and failing before production code for domain services (100% branch coverage) and happy-path + validation-error coverage for every endpoint.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1 = create personal block, US2 = create gym-wide block, US3 = cancel block, US4 = view blocks & availability)
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
- [X] T003 Verify database state: run `npm run db:migrate` and `npm run db:seed` in `backend/` and confirm the existing schema applies (no Block changes yet)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared prerequisites used by more than one user story: the `Block.status` column, the pure `BlockPolicy` domain service, the block DTO, and the frontend block types.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T004 Add `status ClassStatus @default(ACTIVE)` to the `Block` model in `backend/prisma/schema.prisma`, run `npm run db:generate && npm run db:migrate` (new additive migration), and update the `Block` node in the ERD inside `docs/system-architecture.md` to include the `status` field
- [X] T005 [P] Write domain tests for the pure `BlockPolicy` service in `backend/src/domain/services/BlockPolicy.test.ts` (100% branch coverage): window matrix (hour-aligned vs misaligned, < 1h, start ≥ end, past start), personal-create matrix (Admin any / Coach self / Coach other → denied), gym-wide matrix (Admin / Coach → denied), cancel matrix (Admin any / Coach own personal / Coach other's personal / Coach gym-wide → denied). **Must fail before T006**
- [X] T006 Implement pure domain service `BlockPolicy` in `backend/src/domain/services/BlockPolicy.ts` (`validBlockWindow(start, end, now)`, `canCreatePersonal(actorRole, actorId, targetCoachId)`, `canCreateGymWide(actorRole)`, `canCancel(actorRole, actorId, block)`) — zero infrastructure imports in `src/domain/`
- [X] T007 [P] Create the block DTO transformer `toBlockDTO` in `backend/src/infrastructure/dto/blockDto.ts` mapping snake_case rows to `{ id, blockType, createdBy: {id,name}, coach: {id,name}|null, startTime, endTime, description }` per `contracts/api.md`
- [X] T008 [P] Create frontend block domain types (`BlockType`, `Block`, `ListBlocksParams`, `ListBlocksResponse`, `CreateBlockPayload`, `CreateBlockResponse`, `CancelBlockResponse`) in `frontend/src/domain/types/block.ts`

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - Create a personal time block (Priority: P1) 🎯 MVP

**Goal**: A Coach blocks their own calendar (or an Admin blocks any active Coach) for an hour-aligned period of ≥ 1 hour, validated against overlapping classes/blocks on that Coach's calendar, with a matching external calendar event and audit logging. Existing incomplete `CreateBlock`/`POST /blocks` are reworked.

**Independent Test**: `POST /blocks` with `blockType=PERSONAL` → `201` (Coach self; Admin → any active coach), `403` for a Coach blocking another Coach, `404` for an invalid/inactive target, `400` for a misaligned/short/past window, `409` for overlap with a class or block on the Coach's calendar; the event exists on the external calendar (int test with credentials).

### Tests for User Story 1

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T009 [P] [US1] API tests for the personal branch of `POST /blocks` in `backend/src/__tests__/blocks.test.ts`: 201 Coach-self, 201 Admin→other coach, 403 Coach→other coach, 404 inactive/nonexistent target coach, 400 misaligned/short/past window, 409 overlap with a class, 409 overlap with a block (use the existing hand-signed-JWT helper and per-describe PrismaClient seeding/cleanup)
- [X] T010 [P] [US1] Create `backend/src/__tests__/blocks.int.test.ts` gated by `describe.runIf(hasCredentials)`: a created personal block produces a Google Calendar event (`google_event_id` set)

### Implementation for User Story 1

- [X] T011 [US1] Rework `CreateBlock` in `backend/src/application/use-cases/CreateBlock.ts`: personal branch — authorize target via `BlockPolicy.canCreatePersonal` (audit DENIED + `403`), resolve the target coach must exist with role `ADMIN`/`COACH` and status `ACTIVE` (`404`), validate the window via `BlockPolicy.validBlockWindow` (`400`), reject overlap with the target Coach's ACTIVE classes or ACTIVE blocks (personal on that coach or any gym-wide) via `OverlapChecker` (`409 OVERLAP_DETECTED`), create the calendar event first (503 on failure, no DB write), insert the block storing `google_event_id` with rollback of the event on DB failure, audit `block.create` SUCCESS
- [X] T012 [US1] Rework the `POST /blocks` route in `backend/src/infrastructure/routes/blocks.ts`: `authenticate` + `requireRole(UserRole.ADMIN, UserRole.COACH)`, strict Zod body schema (`blockType` enum, optional `coachId` uuid, `startDateTime`/`endDateTime` datetime, optional `description` ≤ 500), `503` guard when `container.createBlock` is null, respond `201` with `toBlockDTO`
- [X] T013 [US1] Register the reworked `CreateBlock` (with the new `BlockPolicy` instance and `AuditLogger`) in `backend/src/config/container.ts`; keep `deleteBlock`/`listBlocks` wiring unchanged until their phases
- [X] T014 [P] [US1] Add `blocksRepository.create(payload)` to `frontend/src/infrastructure/repositories/blocksRepository.ts` + thin use-case wrappers in `frontend/src/domain/usecases/{createBlock,listBlocks,cancelBlock}.ts`
- [X] T015 [P] [US1] Create `useCreateBlock` mutation hook in `frontend/src/infrastructure/hooks/useCreateBlock.ts` (invalidates `["blocks"]` query key on success)
- [X] T016 [US1] Create `CreateBlockModal` in `frontend/src/ui/components/CreateBlockModal.tsx`: block type selector (Personal / Gym-wide), Admin-only coach dropdown (reuse `useAssignableCoaches`) and Coach personal locked to self, hour-aligned start/end picks (≥ 1h), optional description, inline error display for validation/overlap
- [X] T017 [US1] Wire an "Add Block" button + `CreateBlockModal` into `frontend/src/ui/pages/admin/CalendarPage.tsx` and `frontend/src/ui/pages/coach/CalendarPage.tsx` (Coach sees only the Personal option targeting self)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently (personal block create happy path + rejection branches + calendar sync + create UI)

---

## Phase 4: User Story 2 - Create a gym-wide time block (Priority: P1)

**Goal**: Admin-only gym-wide block that cannot overlap any existing class or block gym-wide and is mirrored to the external calendar. Reuses the `CreateBlock` endpoint (type selector already present in the modal).

**Independent Test**: `POST /blocks` with `blockType=GYM_WIDE` → `201` as Admin, `403` as Coach, `409` when overlapping any class or any block (personal or gym-wide); the event exists on the external calendar.

### Tests for User Story 2

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T018 [P] [US2] API tests for the gym-wide branch of `POST /blocks` in `backend/src/__tests__/blocks.test.ts`: 201 Admin, 403 Coach, 409 overlapping an existing class, 409 overlapping an existing block (personal or gym-wide), 400 misaligned/short/past window

### Implementation for User Story 2

- [X] T019 [US2] Extend `CreateBlock` in `backend/src/application/use-cases/CreateBlock.ts` with the gym-wide branch: authorize via `BlockPolicy.canCreateGymWide` (audit DENIED + `403`), reject overlap with ANY ACTIVE class or ANY ACTIVE block gym-wide via `OverlapChecker` (`409 OVERLAP_DETECTED`), calendar-first + rollback, audit `block.create` SUCCESS, `coach_id = null`

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently (both block types creatable with correct authorization/overlap)

---

## Phase 5: User Story 3 - Cancel a time block (Priority: P1)

**Goal**: Soft-cancel (`status → CANCELED`), record retained, `google_event_id` cleared, external event removed, and the block excluded from the list and availability. Admin cancels any block; Coach only own `PERSONAL`. Replaces the hard-deleting `DeleteBlock`.

**Independent Test**: `DELETE /blocks/:id` → `200 { id, status: "CANCELED" }`; the block disappears from `GET /blocks` and stops blocking availability, and is absent from the external calendar (int test); `403` for a Coach canceling another's personal or a gym-wide block; `404` unknown id; `409` double-cancel.

### Tests for User Story 3

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T020 [P] [US3] Use-case tests for `CancelBlock` in `backend/src/__tests__/CancelBlock.test.ts`: 200 soft-cancel (status CANCELED, `google_event_id` cleared, calendar delete invoked, audit `block.cancel` SUCCESS), 403 not-authorized (+ audit DENIED), 404 unknown, 409 already canceled, 503 when calendar delete fails (no DB change)
- [X] T021 [P] [US3] API tests for `DELETE /blocks/:id` in `backend/src/__tests__/blocks.test.ts` (200 response shape, 403 Coach own-other / coach gym-wide, 404, 409) + extend `backend/src/__tests__/blocks.int.test.ts` so cancel removes the Google event (no event remains, `google_event_id` null)

### Implementation for User Story 3

- [X] T022 [US3] Implement `CancelBlock` in `backend/src/application/use-cases/CancelBlock.ts` (replaces `DeleteBlock.ts`): find block (`404`), reject already-canceled (`409`), authorize via `BlockPolicy.canCancel` (audit DENIED + `403`), delete the Google event first (503 on failure, no DB write; also 503 if calendar missing but `google_event_id` present), then update `status = CANCELED` + clear `google_event_id`, audit `block.cancel` SUCCESS
- [X] T023 [US3] Rewrite `DELETE /blocks/:id` in `backend/src/infrastructure/routes/blocks.ts` (`authenticate` + `requireRole(ADMIN, COACH)`; `200 { id, status: "CANCELED" }`), register `CancelBlock` in `backend/src/config/container.ts` in place of `deleteBlock`, and remove the now-unused `backend/src/application/use-cases/DeleteBlock.ts`
- [X] T024 [P] [US3] Add `blocksRepository.cancel(id)` to `frontend/src/infrastructure/repositories/blocksRepository.ts` + `useCancelBlock` mutation hook in `frontend/src/infrastructure/hooks/useCancelBlock.ts` (invalidates `["blocks"]` and `["classes", ...available-slots]` on success)
- [X] T025 [US3] Create `BlockDetailView` in `frontend/src/ui/components/BlockDetailView.tsx` (type, start/end, coach or "entire gym", description, created-by; Cancel action shown for Admin on any block and for Coach on own `PERSONAL` only) and open it on block click in `ClassCalendar`

**Checkpoint**: At this point, User Stories 1-3 should be independently functional (create personal/gym-wide + cancel with correct role rules, calendar sync, audit)

---

## Phase 6: User Story 4 - View blocked time and see it affect availability (Priority: P2)

**Goal**: Blocks list within a date range (interval overlap, `blockType` filter, pagination, only ACTIVE), rendered next to classes on the calendar; available-slots and class-creation overlap checks ignore CANCELED blocks (FR-014).

**Independent Test**: `GET /blocks?start=...&end=...` returns `{ data, meta }` with exactly the ACTIVE blocks overlapping the window; `blockType` filter honored; canceled blocks never returned; Admin and Coach see the same set; `GET /classes/available-slots` excludes ACTIVE-blocked slots but includes them after cancel; `POST /classes` is rejected over an ACTIVE block and allowed after cancel.

### Tests for User Story 4

> **NOTE: Write these tests FIRST, ensure they FAIL before implementation**

- [X] T026 [P] [US4] API tests for `GET /blocks` in `backend/src/__tests__/blocks.test.ts`: 200 `{ data, meta }` with interval-overlap semantics, 400 missing/malformed/inverted range and invalid `blockType`, `blockType` filter, canceled blocks excluded, Coach sees the same set as Admin, pagination meta accuracy
- [X] T027 [P] [US4] Extend `backend/src/__tests__/GetAvailableSlots.test.ts` so the `prisma.block.findMany` stub carries `status` and only ACTIVE blocks exclude slots; extend CreateTrainingClass overlap tests in `backend/src/__tests__/CreateTrainingClass.test.ts` so CANCELED blocks do not block class creation while ACTIVE ones do

### Implementation for User Story 4

- [X] T028 [US4] Rework `ListBlocks` in `backend/src/application/use-cases/ListBlocks.ts`: accept `{ start, end, blockType?, page, limit }`, interval-overlap membership (`start_time < end AND end_time > start`), `status: "ACTIVE"` filter, optional `block_type`, `orderBy start_time ASC`, `skip/take` pagination
- [X] T029 [US4] Rework `GET /blocks` in `backend/src/infrastructure/routes/blocks.ts`: `authenticate` + `requireRole(ADMIN, COACH)`, strict Zod query schema (required ISO `start`/`end`, optional `blockType`, `page`/`limit`), `400` for inverted range, respond `{ data: [...toBlockDTO], meta }`
- [X] T030 [P] [US4] Add `status: "ACTIVE"` to the block `findMany` in `backend/src/application/use-cases/GetAvailableSlots.ts` (line ~47-52) so canceled blocks no longer exclude slots
- [X] T031 [P] [US4] Add `status: "ACTIVE"` to the range-block `findMany` in `CreateTrainingClass.loadSlotContext` in `backend/src/application/use-cases/CreateTrainingClass.ts`
- [X] T032 [P] [US4] Add `blocksRepository.list(params)` + `useListBlocks` query hook (params-driven, `keepPreviousData`) in `frontend/src/infrastructure/repositories/blocksRepository.ts` and `frontend/src/infrastructure/hooks/useListBlocks.ts`
- [X] T033 [US4] Render blocks in `frontend/src/ui/components/ClassCalendar.tsx`: create `toBlockCalendarEvent` in `frontend/src/domain/utils/blockCalendarEvents.ts` (distinct gray/dark Schedule-X event with block type label), fetch blocks for the active week with `useListBlocks`, merge into the event set alongside classes, and wire block click → `BlockDetailView` (mobile Schedule-X day-view block rendering deferred to US-2.5)

**Checkpoint**: All user stories should now be independently functional (blocks visible on the calendar and excluded from availability)

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Cleanup, verification gates, documentation consistency, and end-to-end validation.

- [X] T034 [P] Confirm no stale references to the removed `DeleteBlock` remain (`backend/src/config/container.ts`, routes, tests) and the container wires `createBlock`/`cancelBlock`/`listBlocks` exactly
- [X] T035 [P] Update `docs/api-specifications.md` §Blocks with two notes: `GET /blocks` excludes canceled blocks, and `blockType` is serialized as enum values (`PERSONAL`/`GYM_WIDE`)
- [X] T036 Run backend gates: `npm run lint`, `npm run typecheck`, `npm test` in `backend/`
- [X] T037 [P] Run frontend gates: `npm run lint`, `npm run typecheck`, `npm test` in `frontend/`
- [X] T038 [P] Run `npm audit --audit-level=high` in `backend/` and `frontend/`
- [X] T039 Execute the validation scenarios in `specs/009-calendar-block-management/quickstart.md` (automated tests, curl API checks incl. overlap/403/409/audit + zero notifications, manual Admin/Coach UI flows incl. create modal, calendar rendering, cancel)
- [X] T040 Constitution compliance review: domain purity (`BlockPolicy` zero infra imports), security-by-default (role guards, strict Zod, 403 + audit DENIED), envelope consistency (`{data,meta}` / `{error:{code,message,ref}}`), availability respecting ACTIVE blocks only

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately (baseline must be green)
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories (migration, `BlockPolicy`, DTO, frontend types)
- **User Stories (Phase 3+)**: All depend on Foundational completion
  - US1 (Phase 3) and US4 (Phase 6) also touch `blocks.ts` and `container.ts` → sequential on those files
  - US2 (Phase 4) extends `CreateBlock` (US1 file) → after US1
  - US3 (Phase 5) depends on `BlockPolicy.canCancel` (Phase 2) only; independent of US1/US2
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational - no dependencies on other stories (MVP)
- **User Story 2 (P1)**: Extends `CreateBlock` (US1) — the gym-wide branch shares the endpoint/use case; independently testable via Admin 201 / Coach 403 / 409
- **User Story 3 (P1)**: Can start after Foundational (uses `BlockPolicy.canCancel`); independent of US1/US2 in tests
- **User Story 4 (P2)**: Can start after Foundational; list endpoint shares `blocks.ts` with US1/US3 (sequential edits) but is independently testable

### Within Each User Story

- Tests MUST be written and FAIL before implementation (constitution §II)
- Domain service before use cases; use cases before routes; backend before frontend wiring
- Story complete before moving to next priority

### Parallel Opportunities

- All Phase 2 tasks marked [P] can run in parallel (migration + test file + DTO + frontend types)
- Within each story, the test tasks marked [P] can run in parallel (different test files)
- US1 use case (`T011`) is parallel to the frontend repository (`T014`) and `useCreateBlock` (`T015`)
- US3 `CancelBlock` (`T022`) is parallel to the frontend `cancel` repository/hook (`T024`)
- US4 backend filters (`T030`/`T031`) are parallel to the frontend list (`T032`)
- Polish verification tasks (`T036`/`T037`/`T038`) run in parallel across backend/frontend
- Across stories, US3 test files are parallel to US1/US2 backend work

---

## Parallel Example: User Story 4

```bash
# Launch all first-stage US4 tasks together (different files):
Task: "T026 API tests for GET /blocks in backend/src/__tests__/blocks.test.ts"
Task: "T027 Extend GetAvailableSlots + CreateTrainingClass tests"
Task: "T032 Frontend blocksRepository.list + useListBlocks"

# After T028 (ListBlocks), launch the route + rendering:
Task: "T029 Rework GET /blocks route in backend/src/infrastructure/routes/blocks.ts"
Task: "T030 Add status ACTIVE to GetAvailableSlots.ts"
Task: "T031 Add status ACTIVE to CreateTrainingClass.ts loadSlotContext"
Task: "T033 Render blocks in frontend/src/ui/components/ClassCalendar.tsx"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (verify baseline)
2. Complete Phase 2: Foundational (migration + BlockPolicy + DTO + types)
3. Complete Phase 3: User Story 1 (create personal block, route hardening, create UI)
4. **STOP and VALIDATE**: `POST /blocks` personal branch contract tests pass; create modal works for a Coach
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add User Story 1 (personal create) → Test independently → Deploy/Demo (MVP!)
3. Add User Story 2 (gym-wide create) → Test independently → Deploy/Demo
4. Add User Story 3 (soft-cancel) → Test independently → Deploy/Demo
5. Add User Story 4 (list + availability + calendar rendering) → Test independently → Deploy/Demo
6. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (personal branch + route + modal)
   - Developer B: User Story 3 (CancelBlock soft-cancel + detail view)
   - Developer C: User Story 4 (ListBlocks + availability filters + calendar rendering)
3. User Story 2 (gym-wide branch) follows US1 on the shared `CreateBlock` file
4. After all stories: Polish phase gates (lint/typecheck/test/audit/quickstart)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story is independently completable and testable
- Verify tests fail before implementing (constitution §II)
- Commit after each task or logical group with conventional commits (`feat(blocks): ...`, `test(blocks): ...`, `fix(availability): ...`)
- Stop at any checkpoint to validate story independently
- Avoid: vague tasks, same file conflicts, cross-story dependencies that break independence
- `docs/api-specifications.md` §Blocks already documents the target contract — CLI `biome check src/` + `tsc --noEmit` + `vitest run` must pass before merge (AGENTS.md PR process)