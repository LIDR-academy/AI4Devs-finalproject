---

description: "Task list for implementing Coachee Dashboard & Calendar (US-3.2)"

---

# Tasks: Coachee Dashboard & Calendar

**Input**: Design documents from `/specs/012-coachee-dashboard-calendar/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/ (api.md, ui.md), quickstart.md

**Tests**: The project constitution (`.specify/memory/constitution.md` §II Test-First, NON-NEGOTIABLE) mandates tests written and failing before production code (Red-Green) with domain services at 100% branch coverage, use cases covering happy + error paths, and an integration (Supertest) happy-path + error test for every new endpoint. All user story phases therefore include test tasks.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Web app: `backend/src/`, `frontend/src/`
- Tests: `backend/src/__tests__/`, frontend domain utils colocated with sources (existing convention: `*.test.ts` next to `*.ts`)

**No migrations and no new dependencies**: the data model is entirely read-only (see `data-model.md`); every dependency already exists and is pinned.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify the baseline before any change

- [X] T001 [P] Run `npm run typecheck && npm run lint && npm test` in both `backend/` and `frontend/` (plus `npm audit --audit-level=high` in both) to confirm a green baseline before any code changes
- [X] T002 Create/switch to the feature branch `012-coachee-dashboard-calendar` (AGENTS.md branch conventions — feature branches follow `NNN-short-description`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: The shared Coachee view-state primitives that BOTH P1 views (Home US1 and Calendar US2) consume — one source for loading / empty / error presentation (spec US3's cross-view guarantees are wired at the page level in its own phase)

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [X] T003 [P] Create shared view-state components in `frontend/src/ui/components/coachee/ViewState.tsx`: `LoadingState` (spinner/skeleton), `EmptyState` (friendly copy via `title` + `description` props), and `ErrorStateWithRetry` (message + retry button that calls a passed refetch) — reused by Home and Calendar; no new deps

**Checkpoint**: Foundation ready - user story implementation can now begin in parallel

---

## Phase 3: User Story 1 - See your next class and what you can join on Home (Priority: P1) 🎯 MVP

**Goal**: The Coachee lands on Home and sees their next scheduled class (or a clear "No upcoming classes"), a chronological 10-day joinable-group-class list with real Join actions (US-3.1 hooks), and the active waiting-list count. Backed by the new `GET /coachee/dashboard` endpoint (JWT identity only) returning `{ nextClass, joinableClasses, activeWaitingListCount }` per `contracts/api.md`.

**Independent Test**: Supertest against `GET /api/v1/coachee/dashboard` — happy full shape (next class + joinable list + count), `nextClass: null`, `joinableClasses: []`, `activeWaitingListCount: 0`, `403` Coach/Admin, `401` unauthenticated; plus the frontend Home manual pass. See `quickstart.md` Scenarios 1 and frontend steps 1-3.

### Tests for User Story 1 (write FIRST, ensure they FAIL) ⚠️

- [X] T004 [P] [US1] Write `CoacheeDashboardPolicy.test.ts` in `backend/src/domain/services/CoacheeDashboardPolicy.test.ts` covering ALL branches: `pickNextClass` (none, single, multiple ordered, past class excluded, canceled class excluded); `isJoinable`/`filterJoinable` (group vs individual, ACTIVE vs CANCELED, reach ±1 and out incl. coachee without level, open vs full `enrollments < 4`, already enrolled); `countActiveWaitingLists` (ACTIVE vs CANCELED class); `joinableWindow` boundaries (start of today in `Europe/Madrid`, +10 wall-clock days) — confirm the suite FAILS against the missing service
- [X] T005 [P] [US1] Write `GetCoacheeDashboard.test.ts` in `backend/src/__tests__/GetCoacheeDashboard.test.ts` (mocked `PrismaClient`): happy path (next class, joinable list, active count), no-next-class, no-joinable, zero waiting lists, coachee-level lookup, and policy-delegation
- [X] T006 [P] [US1] Write integration tests in `backend/src/__tests__/coachee.dashboard.int.test.ts` via Supertest against `GET /api/v1/coachee/dashboard`: full documented shape (nextClass fields incl. `status: "ACTIVE"`, joinableClass fields incl. `isWithinReach`/`hasOpenSpots`, activeWaitingListCount), `nextClass: null`, `joinableClasses: []`, `activeWaitingListCount: 0`, `403` for Coach/Admin tokens, `401` unauthenticated — confirm they FAIL against the `501 NOT_IMPLEMENTED` stub

### Implementation for User Story 1

- [X] T007 [US1] Implement `CoacheeDashboardPolicy.ts` in `backend/src/domain/services/CoacheeDashboardPolicy.ts` as a pure TypeScript service (zero Prisma/Express/Zod imports) exposing `pickNextClass`, `isJoinable`, `filterJoinable`, `countActiveWaitingLists`, and `joinableWindow` (via `TimeZoneMath.zonedWallClockParts`/`zonedDateTimeToUtc`/`addWallClockDays`; reuse `ReachCalculator.isWithinReach`); make T004 pass with 100% branch coverage (research.md D1)
- [X] T008 [US1] Implement `GetCoacheeDashboard.ts` in `backend/src/application/use-cases/GetCoacheeDashboard.ts`: load the coachee level, run three narrow Prisma queries (enrolled future classes; `GROUP` + `ACTIVE` classes inside the policy-computed 10-day window; the coachee's `WaitingList` rows with class), pass through `CoacheeDashboardPolicy`, return `{ nextClass, joinableClasses, activeWaitingListCount }` (research.md D2); make T005 pass
- [X] T009 [P] [US1] Create `coacheeDashboardDto.ts` in `backend/src/infrastructure/dto/coacheeDashboardDto.ts` mapping exactly the `contracts/api.md` shape — `nextClass` (`id, classType, startTime, assignedCoach{id,name}, level{id,name,color}|null, status`), `joinableClasses` (`classType: "GROUP"`, `enrollmentCount`, `capacity`, `isWithinReach`, `hasOpenSpots`), `activeWaitingListCount` — and NEVER mapping enrollment/coachee details (research.md D3)
- [X] T010 [US1] Register `GetCoacheeDashboard` in `backend/src/config/container.ts` (constructor args: `prisma`, `new CoacheeDashboardPolicy()`)
- [X] T011 [US1] Replace the `501` stub for `GET /coachee/dashboard` in `backend/src/infrastructure/routes/classes.ts` with a real handler: `authenticate` + `requireRole(UserRole.COACHEE)`, JWT-derived coachee id, `200` dashboard object via T009 mapper; makes T006 pass
- [X] T012 [P] [US1] Add `CoacheeDashboard`, `NextClass`, and `JoinableClass` types to `frontend/src/domain/types/coachee.ts` mirroring `contracts/api.md` (JoinableClass carries `assignedCoach`, `level`, `enrollmentCount`, `capacity`, `isWithinReach`, `hasOpenSpots`)
- [X] T013 [P] [US1] Extend `classesRepository.ts` in `frontend/src/infrastructure/repositories/classesRepository.ts` with `getCoacheeDashboard()` → `GET /coachee/dashboard`
- [X] T014 [P] [US1] Create `useCoacheeDashboard.ts` in `frontend/src/infrastructure/hooks/useCoacheeDashboard.ts` (TanStack query, key `["coachee","dashboard"]`, typed on T012, refetchable for pull-to-refresh)
- [X] T015 [P] [US1] Write `nextClassInfo.test.ts` in `frontend/src/domain/utils/nextClassInfo.test.ts` (empty-state derivation for `nextClass === null`, gym-timezone start formatting via existing `gymDateTime`) — confirm FAIL against the missing util
- [X] T016 [US1] Implement `nextClassInfo.ts` in `frontend/src/domain/utils/nextClassInfo.ts` (pure helpers consumed by `NextClassCard`); make T015 pass
- [X] T017 [US1] Create `NextClassCard.tsx` in `frontend/src/ui/components/coachee/NextClassCard.tsx`: renders `nextClass` (start time via T016, type label, Coach, level dot + name) or the `EmptyState` "No upcoming classes" (spec FR-001); `LoadingState` while loading (deps: T003, T012, T016)
- [X] T018 [US1] Create `JoinableClassList.tsx` in `frontend/src/ui/components/coachee/JoinableClassList.tsx`: chronological list (reuse `sortClassesByGymTime`) of `joinableClasses` showing time, level, Coach, and a **Join** button wired to the existing `useJoinClass` + `enrollmentErrorMessage` (`ERROR`-code map — US-3.1); on success invalidate both the `["classes"]` and `["coachee","dashboard"]` queries so the list/dashboard refresh; `EmptyState` when none; `LoadingState`/`ErrorStateWithRetry` (deps: T003, T012, T014)
- [X] T019 [P] [US1] Create `WaitingListBadge.tsx` in `frontend/src/ui/components/coachee/WaitingListBadge.tsx`: shows the active waiting-list count from `CoacheeDashboard.activeWaitingListCount`; renders nothing when `0` (spec FR-003)
- [X] T020 [US1] Wire `CoacheeHomePage` in `frontend/src/ui/pages/coachee/HomePage.tsx` to `useCoacheeDashboard`: render `NextClassCard`, `JoinableClassList`, and `WaitingListBadge` in the existing page layout; page-level `LoadingState` / `ErrorStateWithRetry` around the dashboard query (deps: T003, T014, T017, T018, T019)

**Checkpoint**: At this point, User Story 1 should be fully functional and testable independently (MVP)

---

## Phase 4: User Story 2 - Browse the week on a color-coded calendar (Priority: P1)

**Goal**: The Calendar tab shows the current 1-week view (`currentGymWeekBounds()` in `Europe/Madrid`) with entries colored from the server-provided `visibility` — **blue** = own, **green** = joinable, **gray** = other/busy (masked as "Busy", no names) — and canceled classes always gray. Tapping a green entry offers Join, a blue entry offers detail + Cancel, and a gray full-in-reach group class or occupied individual slot offers the (disabled, US-3.3) waiting-list affordance. Reuses the existing `GET /classes` visibility and the existing `@schedule-x` week pattern — **no backend work**.

**Independent Test**: `coacheeCalendarEvents.test.ts` visibility→color/title matrix and a manual pass on `CoacheeCalendarPage`: every entry matches its real state (FR-006), taps surface the correct option (FR-008), gray entries never show Coachee names. See `quickstart.md` Scenario 2 + frontend step 4.

### Tests for User Story 2 (write FIRST, ensure they FAIL) ⚠️

- [X] T021 [P] [US2] Write `coacheeCalendarEvents.test.ts` in `frontend/src/domain/utils/coacheeCalendarEvents.test.ts` covering: `visibility:"blue"` → `#3b82f6`, `"green"` → `#10b981`, `"gray"` → `#6b7280`; a `CANCELED` class always gray regardless of `visibility`; gray entries titled "Busy" with no coachee name; recurrence/level metadata preserved — confirm FAIL against the missing util

### Implementation for User Story 2

- [X] T022 [P] [US2] Create `coacheeCalendarEvents.ts` in `frontend/src/domain/utils/coacheeCalendarEvents.ts`: pure mapping of `TrainingClass` + `visibility` → schedule-x event (`cellColor`, masked title for gray, duration via existing `gymDateTime`); make T021 pass (research.md D5)
- [X] T023 [US2] Create `CoacheeClassDetailModal.tsx` in `frontend/src/ui/components/coachee/CoacheeClassDetailModal.tsx`: per `visibility` offers **Join** (green, via `useJoinClass`), detail + **Cancel** (blue, via `useCancelEnrollment`), or the **"Join waiting list"** affordance for gray full-in-reach / occupied-individual (disabled label — US-3.3), all with `enrollmentErrorMessage` toasts; `LoadingState` while the class loads (deps: T003, T021-executed util T022) — **SUPERSEDED by UX redesign**: the modal was removed; the coachee calendar now renders a day-strip + card list with inline **Enroll**/**Cancel enrollment** buttons (see `contracts/ui.md` §2).
- [X] T024 [US2] Create `CoacheeCalendarView.tsx` in `frontend/src/ui/components/coachee/CoacheeCalendarView.tsx`: `@schedule-x` `createViewWeek` in `Europe/Madrid` (day bounds 06:00–24:00, no admin/coach filters), events from `useListClasses({ start, end })` over the week mapped via T022, `onEventClick` → T023, empty-week `EmptyState` / load `ErrorStateWithRetry` (research.md D6; deps: T003, T022, T023)
- [X] T025 [US2] Wire `CoacheeCalendarPage` in `frontend/src/ui/pages/coachee/CalendarPage.tsx` to `CoacheeCalendarView` (compute `currentGymWeekBounds()`, pass to the view, page-level `LoadingState`/`ErrorStateWithRetry`)

**Checkpoint**: At this point, User Stories 1 AND 2 should both work independently

---

## Phase 5: User Story 3 - Every view always responds: loading, empty, error, and pull-to-refresh (Priority: P2)

**Goal**: Home and Calendar never leave the Coachee blank: loading indicators, friendly empty states, and an error state with a working retry on both views; a dependency-free touch-based pull-to-refresh on mobile (plus a desktop Refresh button for parity) that reflects schedule changes (join/cancel/waiting-list/level) after a refresh.

**Independent Test**: `pullGesture.test.ts` gesture-behavior matrix + manual pass (slow network → loading; backend stopped → error + retry recovers; empty data → empty states; mobile pull-down at scrollTop 0 → spinner → refetch; a class joined elsewhere disappears from Home joinable list and the calendar recolor after refresh). See `quickstart.md` frontend steps 2-3.

### Tests for User Story 3 (write FIRST, ensure they FAIL) ⚠️

- [X] T026 [P] [US3] Write `pullGesture.test.ts` in `frontend/src/infrastructure/hooks/pullGesture.test.ts` for a pure gesture reducer: only start at `scrollTop === 0`, distance tracking with clamp, threshold crossing enables trigger, release below threshold cancels, release above threshold triggers refetch — confirm FAIL against the missing module

### Implementation for User Story 3

- [X] T027 [US3] Implement `pullGesture.ts` in `frontend/src/infrastructure/hooks/pullGesture.ts` as the pure touch-gesture state machine (start/move/end reducer); make T026 pass
- [X] T028 [P] [US3] Create `usePullToRefresh.ts` in `frontend/src/infrastructure/hooks/usePullToRefresh.ts`: attaches touch handlers to the `CoacheeLayout` scroll container, drives the gesture via T027, shows a spinner above the threshold, and calls the active view's `refetch`; no new deps (research.md D8)
- [X] T029 [US3] Wire pull-to-refresh into `frontend/src/ui/pages/coachee/HomePage.tsx`: `usePullToRefresh` → dashboard query `refetch`; add a desktop "Refresh" button; audit/complete Loading/Empty/Error coverage for all three Home sections (deps: T014, T028)
- [X] T030 [US3] Wire pull-to-refresh into `frontend/src/ui/pages/coachee/CalendarPage.tsx`: `usePullToRefresh` → week query `refetch`; add a desktop "Refresh" button; audit/complete Loading/Empty/Error coverage (deps: T025, T028)
- [X] T031 [US3] Add post-action refresh coordination: after a successful Join/Cancel on Home or the Calendar modal, invalidate BOTH the `["classes"]` query and the `["coachee","dashboard"]` query (extend the invalidations in `frontend/src/infrastructure/hooks/useJoinClass.ts` and `frontend/src/infrastructure/hooks/useCancelEnrollment.ts`) so colors/list/count reflect the change on the next fetch (spec FR-014)

**Checkpoint**: All user stories should now be independently functional

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Documentation, verification, and governance gates that span the whole feature

- [X] T032 [P] Correct `docs/api-specifications.md` §`GET /coachee/dashboard` so `nextClass.status` reads `"ACTIVE"` (uppercase) instead of `"active"`, matching every other class response (research.md D4; doc-only consistency edit)
- [X] T033 [P] Run the full PR gate in both `backend/` and `frontend/`: `npm run typecheck`, `npm run lint` (biome), `npm test` (vitest), and `npm audit --audit-level=high`. **Audit exception (documented):** backend `npm audit` fails on pre-existing transitive dev-dep findings (prisma 6->7, vitest 2->4, both major) — tracked as COACHER-190; frontend audit passes (2 moderate).
- [X] T034 Run `quickstart.md` validation (backend curl scenarios validated live against dev server: dashboard happy path, nextClass ACTIVE / null, empty joinable, waiting 0, visibility blue/green/gray with gray name masking, 403 non-coachee, 401 invalid token; frontend manual browser steps remain for human pass) end-to-end: backend curl scenarios (dashboard happy + all error/null/zero cases, calendar `visibility` values) and the frontend manual Home + Calendar + states + pull-to-refresh pass
- [X] T035 Constitution compliance review (Domain Purity G1, Test-First G2, Security-by-Default G3, API Contract G4, Dependency Integrity G5) before merge; confirm `Complexity Tracking` remains empty

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup - `ViewState.tsx` (T003) is consumed by T017/T018 (US1) and T023/T024 (US2)
- **User Stories (Phase 3+)**: All depend on the Foundational `ViewState` primitives
  - US1 (P1) and US2 (P1) are otherwise **fully independent** — US1 is all new backend endpoint + Home UI; US2 is pure frontend over the existing `GET /classes` visibility
  - US3 (P2) depends on US1 and US2 (it wires refresh/state into both pages and the shared query keys)
- **Polish (Final Phase)**: Depends on all user stories being complete

### User Story Dependencies

- **User Story 1 (P1)**: Depends on Phase 2 only — MVP deliverable (`GET /coachee/dashboard` + Home UI)
- **User Story 2 (P1)**: Depends on Phase 2 only — no dependency on US1; the calendar already has its data source (`GET /classes` + `visibility`)
- **User Story 3 (P2)**: Depends on US1 + US2 pages being wired (pull-to-refresh + cache coordination apply to both)

### Within Each User Story

- Tests written and confirmed FAILING before implementation (Constitution §II Red-Green); domain service targets 100% branch coverage
- Backend (US1): policy → use case → DTO → DI registration → route handler, each test-driven
- Frontend: types → repository → hooks → pure utils → components → page wiring
- US1 backend route work (T009-T011) must be sequential on `backend/src/infrastructure/routes/classes.ts` (only one endpoint changes here, so no cross-story contention)

### Parallel Opportunities

- Phase 1: T001 can run in parallel with T002 (branch switch) if desired
- US1 tests T004/T005/T006 all run in parallel (distinct files); implementation T009 (DTO), T012-T015 (frontend types/repo/hook/util-test) are parallel-safe; T007→T008→T010→T011 are sequential on the backend stack
- US2 test T021 and implementation T022 are sequential on the util, but the whole US2 story is parallel-safe with US1
- US3: T026 (test) and then T027→T028 sequential; T029/T030/T031 run in parallel (distinct page/hook files)
- Two developers can run US1 (backend + Home) and US2 (calendar) fully in parallel after Phase 2

---

## Parallel Example: User Story 1

```bash
# Launch all independent US1 building blocks together:
Task: "T004 Write backend/src/domain/services/CoacheeDashboardPolicy.test.ts"
Task: "T005 Write backend/src/__tests__/GetCoacheeDashboard.test.ts"
Task: "T006 Write backend/src/__tests__/coachee.dashboard.int.test.ts"
Task: "T009 Create backend/src/infrastructure/dto/coacheeDashboardDto.ts"
Task: "T012 Add types to frontend/src/domain/types/coachee.ts"
Task: "T013 Extend frontend/src/infrastructure/repositories/classesRepository.ts"
Task: "T014 Create frontend/src/infrastructure/hooks/useCoacheeDashboard.ts"
Task: "T015 Write frontend/src/domain/utils/nextClassInfo.test.ts"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (`ViewState.tsx`)
3. Complete Phase 3: User Story 1 (`GET /coachee/dashboard` + Home UI)
4. **STOP and VALIDATE**: run `coachee.dashboard.int.test.ts` + `quickstart.md` backend Scenario 1 and frontend Home steps 1-3
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → foundation ready
2. Add User Story 1 (dashboard endpoint + Home) → test independently → MVP
3. Add User Story 2 (calendar) → test independently (`coacheeCalendarEvents.test.ts` + manual)
4. Add User Story 3 (states + pull-to-refresh) → test independently (`pullGesture.test.ts` + manual)
5. Each story adds value without breaking previous stories

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done:
   - Developer A: User Story 1 (backend endpoint + Home)
   - Developer B: User Story 2 (calendar) — fully independent, no shared files
   - Developer C: User Story 3 (pull-to-refresh + state wiring) once A/B land their pages
3. Stories complete and integrate independently; Polish phase gates the merge

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to the spec user story for traceability (US1 Home, US2 Calendar, US3 states + refresh)
- Each user story is independently completable and testable
- Tests fail-before-production per Constitution §II; `CoacheeDashboardPolicy` targets 100% branch coverage
- The endpoint is guarded by `authenticate` + `requireRole(COACHEE)`; identity comes from the JWT only (no body) — Constitution §III
- Calendar colors are ONLY the server-computed `visibility` (blue/green/gray); no client-side reach/capacity recomputation — Constitution §IV/plan D5
- Error responses always use `{ error: { code, message, ref } }` with documented codes — Constitution §IV
- Commit after each task or logical group; no schema migrations and no new dependencies are expected