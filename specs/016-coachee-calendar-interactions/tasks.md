# Tasks: Coachee Calendar Interactions

**Input**: Design documents from `/specs/016-coachee-calendar-interactions/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, contracts/ui.md, quickstart.md

**Tests**: REQUIRED — the spec (FR-012/FR-013 + test strategy) and the plan explicitly request component/hook tests for the modal flows and optimistic-update/rollback behavior. Constitution §II (Test-First, NON-NEGOTIABLE): each pure helper gets failing unit tests before implementation; mutation hooks get `QueryClient`-based rollback tests; component tests (jsdom) cover the modal flows. Tests within each story are written and confirmed failing BEFORE that story's implementation tasks.

**Organization**: Tasks are grouped by user story so each story can be implemented and tested independently as an MVP increment. Backend is COMPLETE and untouchable — every task below is frontend-only.

**Environment notes**:
- Pure logic tests: node env, colocated `*.test.ts` (existing pattern).
- Component tests: `// @vitest-environment jsdom` header at the top of the file (per-file opt-in), Testing Library + user-event.
- New devDeps (pinned, exact): `jsdom`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`, `@testing-library/jest-dom`.
- Verification per task: `npm run typecheck && npm run lint && npm test` (frontend).
- Commit after each task or logical group. Conventional commits: `feat(...)` / `fix(...)` / `test(...)` / `chore(...)`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US5 from spec.md)
- All paths: `frontend/...` under the repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Test toolchain for the new component/hook tests. All changes are dev-only; zero runtime dependencies.

- [X] T001 [P] Add pinned devDependencies to `frontend/package.json`: `jsdom`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`, `@testing-library/jest-dom` (exact versions, no ranges per Constitution §V) and run `npm install` to update the lockfile (commit it)
- [X] T002 [P] Extend `frontend/vitest.config.ts` test `include` to `["src/**/*.test.{ts,tsx}"]`, keeping `environment: "node"` (component tests opt into jsdom per-file via `// @vitest-environment jsdom`)

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Pure decision/transform logic + the centralized optimistic mutation adapter that ALL four mutation hooks (US2–US5) and the modal (US3/US4) depend on. No user story work can begin until this phase is complete.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 Create `frontend/src/domain/utils/calendarInteraction.test.ts` — Red tests covering every branch of `deriveCalendarInteraction`: blue→cancel; green→join; gray + `isWithinReach:true` + group full→waitlist-join; gray + `isWithinReach:true` + individual occupied→waitlist-join; gray + `isOnWaitingList:true`→waitlist-leave; gray + `isWithinReach:false`→info; canceled→info; and every transition of `applyOptimisticClassUpdate` (join→blue+isEnrolled+count+1; cancel→green/gray+isEnrolled=false+count-1; waitlist-join→isOnWaitingList=true+waitingListCount+1; waitlist-leave→isOnWaitingList=false+waitingListCount-1). Assert failing before implementation. Target 100% branch coverage
- [X] T004 Create `frontend/src/domain/utils/calendarInteraction.ts` — pure module (ZERO React/Query/DOM imports, Constitution §I): `deriveCalendarInteraction({ classType, status, visibility, coacheeStatus, enrollmentCount, capacity })` → `{ kind: "cancel" | "join" | "waitlist-join" | "waitlist-leave" | "info", reason?: "canceled" | "out-of-reach" | "not-open" | null }` and `applyOptimisticClassUpdate(cls, action)` → immutable copy with re-derived visibility + `coacheeStatus` + counts per data-model.md state transitions
- [X] T005 Create `frontend/src/infrastructure/hooks/optimisticClassMutation.test.ts` — Red tests using a real `QueryClient` (same pattern as `useJoinWaitingList.test.ts`): seed `["classes"]` list datasets (`{ data: TrainingClass[] }`) and the single `["classes", id]` detail cache; assert onMutate flips the target class to the optimistic state for all four actions; assert onError restores the EXACT snapshot object; assert non-target classes are untouched. Assert failing before implementation
- [X] T006 Create `frontend/src/infrastructure/hooks/optimisticClassMutation.ts` — pure adapter (no rendering): `buildOptimisticClassMutation({ queryClient, classId, action })` returning `{ onMutate, onError, onSettled }`. `onMutate` snapshots every `["classes"]`-prefixed query via `getQueriesData`, applies `applyOptimisticClassUpdate` to the matching class in both list and single-detail cache shapes, returns the snapshot; `onError` restores the snapshot; `onSettled` keeps callers' existing invalidation behavior

**Checkpoint**: Foundation ready — pure rules and rollback adapter exist and are branch-tested. User story implementation can begin.

---

## Phase 3: User Story 1 - See your full week, including busy slots (Priority: P1) 🎯 MVP

**Goal**: The calendar renders EVERY class in the week window — blue (enrolled), green (joinable), gray busy (full group / occupied individual / out-of-reach) as informational "Busy" cards with no other Coachee's details, and canceled classes as informational entries with no action. Empty week shows the existing empty state (spec FR-001…FR-004).

**Independent Test**: A Coachee with a mix of blue, green, gray, and canceled entries verifies every entry renders with the correct color/dot and card title, gray cards show no other Coachee's identity, canceled cards offer no action, and an empty week shows the empty state — the truthful full-week view works on its own, no modal needed yet.

### Tests for User Story 1 (write FIRST, ensure they FAIL) ⚠️

- [X] T007 [US1] Extend `frontend/src/domain/utils/coacheeWeekView.test.ts` — Red tests asserting the calendar predicate now includes gray busy classes AND canceled classes (the current `isCoacheeRelevant` tests at lines 56-66 assert gray is EXCLUDED — update them to the new include-gray contract)

### Implementation for User Story 1

- [X] T008 [US1] Extend `frontend/src/domain/utils/coacheeWeekView.ts` — replace the blue/green-only `isCoacheeRelevant` predicate (line 14-16) so the calendar includes gray "busy" classes and canceled classes (export a predicate like `isCalendarClass`; keep grouping/minutiae intact)
- [X] T009 [US1] Extend `frontend/src/ui/components/coachee/CoacheeCalendarView.tsx` — apply the new include-gray predicate at line 60 so gray/canceled cards render; verify gray cards show "Busy" title + gray dot (already produced by `coacheeEventTitle` / `dotColor`) and do NOT render any other Coachee's name/private details; canceled cards keep the existing "Canceled" tag with no action; confirm the existing empty-state branch (lines 83-100) still covers an all-gray week only after a genuine empty week (FR-004)

**Checkpoint**: At this point, User Story 1 is fully functional and testable independently (full week renders truthfully; no interactions yet).

---

## Phase 4: User Story 2 - Manage your own classes from the calendar (Priority: P1)

**Goal**: Tapping a blue entry opens a detail modal (class type, time, level, Coach) with an explicit-confirmation cancel flow. Confirmed cancel updates the calendar immediately; failure reverts the calendar to its exact pre-action state with a friendly toast. Dismissing the confirmation changes nothing (spec FR-005, FR-010, FR-011, FR-012, FR-013, FR-017).

**Independent Test**: A Coachee taps a blue entry, sees class details, confirms a cancel → card stops being blue immediately; forcing the cancel to fail → card returns to its previous state + friendly error; dismissing the confirm → nothing changes. Self-service cancellation works from the calendar alone.

### Tests for User Story 2 (write FIRST, ensure they FAIL) ⚠️

- [X] T010 [US2] Create `frontend/src/ui/components/coachee/ClassInteractionModal.test.tsx` — Red component tests (jsdom + Testing Library + user-event, `QueryClientProvider` wrapper) for the CANCEL flow: open on blue card → shows type/time/level/Coach; choosing cancel shows a confirmation dialog BEFORE any mutation fires; dismissing the dialog fires no mutation and changes nothing; confirmed cancel success reflects optimistic state; confirmed cancel failure rolls back to pre-action state and shows `enrollmentErrorMessage(...)` toast (use `extractErrorCode`). Test file to be extended in US3/US4/US5

### Implementation for User Story 2

- [X] T011 [US2] Create `frontend/src/ui/components/coachee/ClassInteractionModal.tsx` — the shared interaction modal (D3): class details (type, time in gym timezone via `formatNextClassTime`, level, Coach), a primary action derived by `deriveCalendarInteraction`, and an embedded confirmation step for ANY action replicating the established overlay pattern + copy from `frontend/src/ui/components/CoacheeClassCard.tsx` (`ConfirmDialog` lines 176-221, `dialogCopy` lines 223-264). Store the confirm copy/action mapping locally (Home's `CoacheeClassCard` stays untouched). Cancel-flow only in this story
- [X] T012 [US2] Extend `frontend/src/infrastructure/hooks/useCancelEnrollment.ts` — adopt `buildOptimisticClassMutation` with `action: "cancel"` (onMutate/onError); KEEP the existing `onSuccess` invalidations (`["classes"]`, `["coachee","dashboard"]`) intact
- [X] T013 [US2] Extend `frontend/src/ui/components/coachee/CoacheeCalendarView.tsx` — replace the inline Enroll/Cancel buttons on `ClassCard` (lines 264-282, 310-331) with a tap that opens `ClassInteractionModal` for the selected class; move the existing join/cancel toast handling into the modal flow; all actions happen inside the calendar view (spec FR-017) with the "no action" cases (canceled / non-interactive gray) still rendering the modal as info-only

**Checkpoint**: User Story 2 works independently — blue entries are cancellable from the calendar behind a confirmation with optimistic update + rollback.

---

## Phase 5: User Story 3 - Join a class from the calendar (Priority: P1)

**Goal**: Tapping a green entry opens the detail modal (level, Coach, spots available) with an explicit-confirmation join flow. Confirmed join turns the entry blue immediately; failure reverts it and shows a friendly toast (spec FR-006, FR-010…FR-013).

**Independent Test**: A Coachee taps a green entry, sees level/Coach/available spots, confirms a join → card turns blue immediately; forcing a join failure (e.g. spot taken meanwhile) → card reverts to green + friendly error. Self-service join works from the calendar alone.

### Tests for User Story 3 (write FIRST, ensure they FAIL) ⚠️

- [X] T014 [US3] Extend `frontend/src/ui/components/coachee/ClassInteractionModal.test.tsx` — add JOIN-flow tests: open on green card → shows level, Coach, and `spotsAvailable` (`capacity - enrollmentCount`); choosing join shows confirmation before the mutation fires; dismiss fires no mutation; confirmed join success reflects optimistic blue state; join failure (mocked 409 CLASS_FULL) rolls back to green and toasts `enrollmentErrorMessage(...)`

### Implementation for User Story 3

- [X] T015 [US3] Extend `frontend/src/ui/components/coachee/ClassInteractionModal.tsx` — add the join action for green entries (derived by `deriveCalendarInteraction`), displaying level, Coach, and `spotsAvailable`; wire the existing join Mutation via the shared optimistic hook (see T016)
- [X] T016 [US3] Extend `frontend/src/infrastructure/hooks/useJoinClass.ts` — adopt `buildOptimisticClassMutation` with `action: "join"` (onMutate/onError); KEEP existing `onSuccess` invalidations (`["classes"]`, `["coachee","dashboard"]`)

**Checkpoint**: User Stories 1 AND 2 AND 3 each work independently.

---

## Phase 6: User Story 4 - Join or leave a waiting list from a busy slot (Priority: P1)

**Goal**: Tapping a gray busy entry that is waitlist-eligible (full group within reach, occupied individual slot within reach — from detail `coacheeStatus.isWithinReach`) opens a dialog with class details (time, type, level, Coach) offering join-waiting-list behind confirmation; already-on-list entries offer "Leave waiting list" instead (spec FR-008); non-eligible gray entries (out-of-reach) offer NO waitlist option and show a clear "not open to you" message (spec FR-009). Optimistic join/leave; failure rolls back + friendly toast (spec FR-012/FR-013).

**Independent Test**: A Coachee taps a full-group-within-reach gray entry and an occupied-individual-within-reach gray entry → both confirm join and reflect immediately; a second tap offers leave; tapping a non-eligible gray entry → no waitlist option + clear message. Self-service waitlisting works from the calendar alone.

### Tests for User Story 4 (write FIRST, ensure they FAIL) ⚠️

- [X] T017 [US4] Extend `frontend/src/ui/components/coachee/ClassInteractionModal.test.tsx` — add WAITLIST-flow tests: open on eligible gray (full group / occupied individual, `isWithinReach:true`) → shows time/type/level/Coach + join-waiting-list option; already-on-list → "Leave waiting list" instead of join; confirmed join/leave success reflects optimistic on/off-list state; failure (mocked 409 WAITING_LIST_FULL / LEVEL_MISMATCH) rolls back and toasts `waitingListErrorMessage(...)`; open on ineligible gray (`isWithinReach:false`) → NO waitlist option + "not open to you" info; open on canceled card → info-only, no action (best covered here for reuse)

### Implementation for User Story 4

- [X] T018 [US4] Extend `frontend/src/ui/components/coachee/ClassInteractionModal.tsx` — on open fetch class detail via existing `useClassDetail(id)` (queryKey `["classes", id]`, D1) and derive waitlist eligibility/action from `coacheeStatus` (`isWithinReach`, `isOnWaitingList`) — render details immediately from list data, resolve the action once detail loads (brief loading state); non-eligible gray shows the info message and no action. Reuse `getClass` usecase via `useClassDetail` (unchanged)
- [X] T019 [US4] Extend `frontend/src/infrastructure/hooks/useJoinWaitingList.ts` — adopt `buildOptimisticClassMutation` with `action: "waitlist-join"` (onMutate/onError); KEEP the shared `invalidateWaitingListQueries` on-success behavior and the exported `WAITING_LIST_JOIN_INVALIDATION_KEYS`
- [X] T020 [US4] Extend `frontend/src/infrastructure/hooks/useLeaveWaitingList.ts` — adopt `buildOptimisticClassMutation` with `action: "waitlist-leave"` (onMutate/onError); KEEP existing `onSuccess` invalidations (`["classes"]`, `["waiting-lists"]`, `["coachee","dashboard"]`)

**Checkpoint**: All four calendar interactions (join, cancel, waitlist join, waitlist leave) work independently from the calendar.

---

## Phase 7: User Story 5 - Every calendar action is immediate and trustworthy (Priority: P2)

**Goal**: The four interaction behaviors above must satisfy the cross-cutting guarantees: immediate optimistic reflection of confirmed actions, exact-rollback + friendly error on failure, an explicit confirmation dialog for EVERY calendar action (no accidental single-tap changes), no conflicting/duplicate actions while one is in flight, and reconciliation of optimistic state with server truth on invalidation/refresh (spec FR-010…FR-016, SC-002/003/008).

**Independent Test**: Performing each calendar action (join, cancel, waitlist join, waitlist leave) shows an immediate state change, a confirmation dialog on every action, and a clean revert + friendly error when each is forced to fail; double-taps on the same entry are ignored while in flight; after invalidations the calendar matches server truth. Instant, safe, consistent interactions on their own.

### Tests for User Story 5 (write FIRST, ensure they FAIL) ⚠️

- [X] T021 [US5] Extend `frontend/src/ui/components/coachee/ClassInteractionModal.test.tsx` — cross-cutting tests: EVERY action (join/cancel/waitlist-join/waitlist-leave) requires a confirmation dialog before its mutation fires (SC-002); while a mutation is pending the modal's confirm/dismiss controls are disabled and a second action on the same entry is ignored (FR-014, quickstart Scenario 10); dismissed dialogs always result in zero mutation calls (FR-011); a rejected mutation (network error) restores the exact pre-action state (FR-013)
- [X] T022 [US5] Extend `frontend/src/infrastructure/hooks/optimisticClassMutation.test.ts` — reconciliation tests: after a successful mutation, onSettled must leave the existing invalidation calls intact AND the optimistic cache converges with the refetched server state (FR-015); after a failed mutation the snapshots for list AND single-detail caches are restored object-identically (no half-updated calendar)
- [X] T023 [US5] Extend the four hook tests (`frontend/src/infrastructure/hooks/useJoinClass` / `useCancelEnrollment` / `useJoinWaitingList` / `useLeaveWaitingList` hook test files, adding any missing in the same `frontend/src/infrastructure/hooks/` directory) — assert each hook now exposes optimistic `onMutate`/`onError` via the shared adapter while STILL invalidating on success exactly as before (guards against Home regression since Home uses the same four hooks)

### Implementation for User Story 5

- [X] T024 [US5] Harden `frontend/src/ui/components/coachee/ClassInteractionModal.tsx` — lock the modal (disable action, confirm, and backdrop/dismiss) while its mutation is `isPending` (FR-014); keep the calendar in its last known-good state on failure (FR-013); rely on the shared hooks' onSuccess invalidations to reconcile optimistic vs server state (FR-015); ensure session-expiry surface: mutation refusal + no data change + existing AuthContext re-login flow is unchanged (FR-016, SC-007)
- [X] T025 [US5] Cross-check the four hooks `frontend/src/infrastructure/hooks/useJoinClass.ts`, `useCancelEnrollment.ts`, `useJoinWaitingList.ts`, `useLeaveWaitingList.ts` — confirm each passes its target action (join/cancel/waitlist-join/waitlist-leave) to `buildOptimisticClassMutation` and preserves the original on-success invalidation keys exactly (Home regression guard)

**Checkpoint**: All four interactions are immediate, confirmation-guarded, rollback-safe, and reconcile with server truth. Feature behavior complete.

---

## Phase 8: Polish & Cross-Cutting Concerns

**Purpose**: Final quality gates and end-to-end validation. No further feature scope.

- [X] T026 [P] Run the frontend engineering gates from `frontend/`: `npm run typecheck && npm run lint && npm test` — all existing `.test.ts` files (the ~10 node-env suites) AND the new `.test.tsx` jsdom suites must pass green; confirm 100% branch coverage on `calendarInteraction.test.ts` branches per Constitution §II
- [X] T027 [P] Run the backend gates from `backend/`: `npm run typecheck && npm run lint && npm test` — must pass UNCHANGED (proof the feature introduced zero backend modifications)
- [ ] T028 Execute `specs/016-coachee-calendar-interactions/quickstart.md` manual validation: Scenarios 1-10 (full-week render incl. gray/canceled; blue-cancel; green-join; gray waitlist join/leave incl. occupied individual; ineligible-gray; canceled info; forced-failure rollback; session expiry; rapid double-tap; Home regression on join/cancel/waitlist hooks) and confirm no regression on Home cards
- [X] T029 Verify no backend changes were made (`git status` — only `frontend/` + spec docs touched), `.specify/memory/constitution.md` compliance is met (Domain Purity, Test-First, Security-by-Default, API Contract Consistency, Dependency Integrity — see plan.md G1-G5), and update the feature's `checklists/requirements.md` in `specs/016-coachee-calendar-interactions/` to reflect implementation completion before the PR

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately (T001, T002 parallel)
- **Foundational (Phase 2)**: Depends on Setup — BLOCKS all user story work (modal + all four hooks need `calendarInteraction.ts` + `optimisticClassMutation.ts`)
- **User Story 1 (Phase 3)**: Depends on Foundational; independent of the modal
- **User Stories 2-4 (Phases 4-6)**: Depends on Foundational; they EXTEND the same `ClassInteractionModal.tsx`, so modal tasks are sequential (T011 → T015 → T018) while each story's hook tasks are independent
- **User Story 5 (Phase 7)**: Depends on US2-4 being complete (wraps all four interactions)
- **Polish (Phase 8)**: Depends on all user stories complete

### User Story Dependencies

- **User Story 1 (P1)**: Can start after Foundational — no dependencies on other stories. **Suggested MVP**
- **User Story 2 (P1)**: Can start after Foundational — no dependency on US1 (modal opens on tap of already-rendered cards, but US1 delivery is recommended first so gray/canceled views already exist)
- **User Story 3 (P1)**: Can start after US2's modal exists (extends the same modal file) — its hook task (T016) is independent once Foundational is done
- **User Story 4 (P1)**: Can start after the modal exists (extends it with eligibility + waitlist actions) — its hook tasks (T019/T020) are independent once Foundational is done
- **User Story 5 (P2)**: Depends on US2-4 (guarantees wrap their behaviors)

### Within Each User Story

- Tests (US1: T007; US2: T010; US3: T014; US4: T017; US5: T021-T023) MUST be written and confirmed FAILING before that story's implementation tasks
- Pure rules (T003/T004) before adapters (T005/T006) before UI (T011/T015/T018)
- Core implementation before integration; story complete before moving to next priority

### Parallel Opportunities

- **Phase 1**: T001 ∥ T002 (package.json vs vitest.config.ts)
- **Phase 2**: T003 ∥ T005 (two separate test files); T004 ∥ T006 after their respective tests
- **US1**: T007 (red test) → T008 → T009 sequential, but T007 is standalone write-first
- **Cross-story hooks**: T012 (US2) ∥ T016 (US3) ∥ T019+T020 (US4) ∥ T013 — all different files — can run in parallel once Foundational is complete
- **US5**: T021 ∥ T022 (different test files) ∥ T023 (hook tests)
- **Phase 8**: T026 ∥ T027 (independent gate runs) then T028 (manual) then T029

---

## Parallel Example: User Story 2 (cancel) + US3 (join)

```bash
# Launch all hook tasks across stories together (different files, after Foundational):
Task: "Extend useCancelEnrollment.ts with cancel optimistic adapter (T012)"
Task: "Extend useJoinClass.ts with join optimistic adapter (T016)"
Task: "Extend useJoinWaitingList.ts with waitlist-join optimistic adapter (T019)"
Task: "Extend useLeaveWaitingList.ts with waitlist-leave optimistic adapter (T020)"

# Modal tasks are sequential within the SAME file ClassInteractionModal.tsx:
Task: "Create ClassInteractionModal.tsx cancel flow (T011)"
Task: "Extend ClassInteractionModal.tsx with join flow (T015)"
Task: "Extend ClassInteractionModal.tsx with waitlist eligibility + actions (T018)"
```

## Parallel Example: Phase 2 Foundational

```bash
# Launch the two Red-test files together (different files):
Task: "Create calendarInteraction.test.ts (red, T003)"
Task: "Create optimisticClassMutation.test.ts (red, T005)"

# Then the two implementations together (different files):
Task: "Create calendarInteraction.ts (T004)"
Task: "Create optimisticClassMutation.ts (T006)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL — blocks all stories)
3. Complete Phase 3: User Story 1
4. **STOP and VALIDATE**: User Story 1 independently (full week renders blue/green/gray/canceled truthfully)
5. Deploy/demo if ready

### Incremental Delivery

1. Setup + Foundational → rollback-safe foundation
2. US1: truthful full-week view → TEST → Deploy/Demo (MVP)
3. US2: cancel from calendar → TEST → Deploy/Demo
4. US3: join from calendar → TEST → Deploy/Demo
5. US4: waitlist join/leave from calendar → TEST → Deploy/Demo
6. US5: cross-cutting immediacy/confirmation/rollback guarantees → TEST → Deploy/Demo
7. Phase 8: gates + quickstart end-to-end validation

### Parallel Team Strategy

With multiple developers:

1. Team completes Setup + Foundational together
2. Once Foundational is done (driver: Build): build harness verifies
3. Developer A: US1 (predicate + calendar rendering)
4. Developer B: US2 modal cancel flow + `useCancelEnrollment` adapter
5. Developer C: US3 join flow + `useJoinClass` adapter + US4 waitlist flows + `useJoinWaitingList`/`useLeaveWaitingList` adapters (modal tasks for B/C are sequential on `ClassInteractionModal.tsx`)
6. All stories integrate and are independently tested before US5

---

## Notes

- No backend changes, no new endpoints, no migrations — this is a strict frontend-only feature
- `useClassDetail` is reused as-is for waitlist eligibility (D1) — do NOT modify it
- Home cards consume the same four hooks; the optimistic adapter MUST preserve each hook's exact on-success invalidation keys or Home regresses (T023 covers this)
- `CoacheeClassCard.tsx` (Home) stays untouched — copy the ConfirmDialog/dialogCopy PATTERN (lines 176-264) into the new modal, do not import from it
- Keep all new devDeps EXACTLY pinned (no `^`/`~`) and commit the lockfile
- Verify tests fail (Red) before writing each implementation; commit with conventional messages after each task or logical group