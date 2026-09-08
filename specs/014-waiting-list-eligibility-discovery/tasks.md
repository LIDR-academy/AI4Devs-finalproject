---

description: "Task list for implementing Waiting List Eligibility Discovery (US-3.4/3.5, waitlistEligibleClasses)"

---

# Tasks: Waiting List Eligibility Discovery

**Input**: Design documents from `/specs/014-waiting-list-eligibility-discovery/` (plan.md, spec.md)

**Prerequisites**: plan.md, spec.md (013 join/leave backend is complete and green)

**Tests**: The project constitution (`.specify/memory/constitution.md` §II Test-First, NON-NEGOTIABLE) mandates tests written and failing before production code (Red-Green) with domain services at 100% branch coverage and an integration (Supertest) happy-path + refusal-path test for every endpoint change. All user story phases therefore include test tasks.

**Organization**: Tasks are grouped by phase to enforce ordering — the shared eligibility predicate (single source of truth) must exist before the application use case, the DTO before any Supertest green run, and docs before any code (Constitution §IV, FR-017). Story labels trace tasks back to spec user stories.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1 discover, US2 join-from-discovery, US3 membership consistency, US4 server-authoritative)
- Include exact file paths in descriptions

## Path Conventions

- Web app: `backend/src/`, `frontend/src/`, docs in `docs/`
- Tests: `backend/src/__tests__/` (use cases, Supertest integration), `backend/src/domain/services/` (domain service tests, colocated), `frontend/` unit tests colocated with sources (`*.test.ts` only — the frontend Vitest config includes `src/**/*.test.ts` in a node environment, so pure-function tests only, no DOM/components)

**Scope guard**: No schema changes/migrations, no new routes, no new dependencies. Client NEVER derives eligibility — it renders the server-computed `waitlistEligibleClasses`. Test-first throughout; docs update lands BEFORE any production code.

---

## Phase 1: Setup (Shared Baseline)

**Purpose**: Verify the baseline before any change

- [ ] T001 Run `npm run typecheck && npm run lint && npm test` in both `backend/` and `frontend/` (plus `npm audit --audit-level=high` in both) to confirm a green baseline before any code changes

---

## Phase 2: Documentation First (Blocking — Constitution §IV / FR-017)

**Purpose**: The extended `GET /coachee/dashboard` contract is documented BEFORE any production code, per FR-017 and Constitution §IV

**⚠️ CRITICAL**: No production code may be written until the doc change in this phase is committed

- [ ] T002 [US1] Update `docs/api-specifications.md` for the extended dashboard contract:
  - In the `### GET /coachee/dashboard` section (≈line 561): extend the Description ("a list of full group classes the Coachee may join a waiting list for within the same 10-day window"), add the `waitlistEligibleClasses` array to the 200 JSON example with the exact documented shape `{ id (uuid), classType ("group", always), startTime (ISO 8601), level {id,name,color}, assignedCoach {id,name}, enrollmentCount, capacity (4), isWithinReach (bool), isOnWaitingList (bool, always false) }`, and add Business Rules: same decision logic as `POST /classes/:id/waiting-list` (single source of truth), same 10-day Madrid wall-clock window as `joinableClasses`, mutually exclusive with `joinableClasses` (a class is open-spot joinable XOR waitlist-eligible), ordered by startTime ascending, no pagination, group classes only, empty array when none qualify.
  - Update the endpoints summary table row (`GET /coachee/dashboard` at ≈line 1275) to mention waitlist-eligible classes.
  - **Verify** with `git diff docs/api-specifications.md` that only the dashboard section/row changed and the doc reflects FR-002/FR-003/FR-004/FR-016 — no other endpoint contracts touched (FR-015).

**Checkpoint**: Dashboard contract documented and reviewable — implementation can begin

---

## Phase 3: Domain — Shared Waitlist-Eligibility Predicate (Blocking Prerequisites)

**Purpose**: The pure eligibility decision used by BOTH the join endpoint (013) and the dashboard discovery list (single source of truth, FR-001/FR-004/US4-4). Predicate lives in `WaitingListPolicy`; `CoacheeDashboardPolicy` wraps it for filtering/ordering. Zero Prisma/Express/Zod imports (Constitution §I).

**⚠️ CRITICAL**: No dashboard/use-case/DTO work may begin until this phase is complete

### Tests (write FIRST, ensure they FAIL) ⚠️

- [ ] T003 [P] [US1] Add tests for `WaitingListPolicy.isEligibleForWaitingList` in `backend/src/domain/services/WaitingListPolicy.test.ts`: a boolean predicate that returns exactly `assertJoinEligible(input).ok`. Cover parity — for every verdict path assert (`isEligibleForWaitingList` == true iff `assertJoinEligible` is `{ ok: true }`), including: full group low→true, empty waiting list→true, 3-member list→true, 4-member list→false, not-full group→false, canceled→false, already enrolled→false, already on list→false, coachee null level→false, class null level→false, out-of-reach (±2)→false, within-reach (±1)→true, individual occupied slot→true (predicate is type-agnostic; the dashboard restricts to GROUP separately). Confirm the suite FAILS against the missing method
- [ ] T004 [P] [US1] Add tests in `backend/src/domain/services/CoacheeDashboardPolicy.test.ts` for the new waitlist-eligibility helpers (e.g. `isWaitlistEligible(cls, viewer)` + `filterWaitlistEligible(classes, viewer)`):
  - true for a full (4/4) ACTIVE GROUP class within reach, not enrolled, not on list, waiting list ≤ 3
  - false for each exclusion: INDIVIDUAL, CANCELED, not full (3/4), out-of-reach (level ±2), viewer with no level, class with no level, already enrolled, already on waiting list, waiting-list full (4/4)
  - mutually exclusive with `isJoinable` — for a given full class `isWaitlistEligible` is true and `isJoinable` is false; for a given open class the inverse (FR-003/US4-4)
  - `filterWaitlistEligible` returns only eligible classes, preserves ascending start-time input order (FR-016), returns `[]` for empty input
  - confirm the suite FAILS against the missing helpers

### Implementation

- [ ] T005 [US1] Implement `isEligibleForWaitingList(input: JoinEligibilityInput): boolean` in `backend/src/domain/services/WaitingListPolicy.ts` as `return this.assertJoinEligible(input).ok` — one decision path, zero reimplementation (single source of truth); make T003 pass with 100% branch coverage
- [ ] T006 [US1] Extend `backend/src/domain/services/CoacheeDashboardPolicy.ts`: add optional `waitingLists?: Array<{ coachee_id: string }>` to `PolicyClass` (defaults to `[]`, so existing tests compile unchanged); add `isWaitlistEligible(cls, viewer)` that returns false unless `class_type === "GROUP"` and otherwise builds a `JoinEligibilityInput` (enrollmentCount = `cls.enrollments.length`, waitingListCount = `cls.waitingLists.length`, isAlreadyEnrolled/isAlreadyOnWaitingList from membership vs `viewer.viewerId`, level sort orders) and delegates to `WaitingListPolicy.isEligibleForWaitingList` — import the policy (domain-to-domain, allowed); add `filterWaitlistEligible<T extends PolicyClass>(classes, viewer): T[]` preserving input order. Make T004 pass with 100% branch coverage over the new helpers

**Checkpoint**: Eligibility predicate is the single source of truth shared with the 013 join flow — domain phase complete

---

## Phase 4: Application — Extend GetCoacheeDashboard

**Purpose**: The dashboard use case computes `waitlistEligibleClasses` (10-day Madrid window, ascending) and returns it alongside the stable `nextClass`/`joinableClasses`/`activeWaitingListCount` contract (FR-002/FR-003/FR-015/FR-016).

### Tests (write FIRST, ensure they FAIL) ⚠️

- [ ] T007 [P] [US1] Extend `backend/src/__tests__/GetCoacheeDashboard.test.ts` (mocked `PrismaClient`): extend `classRow` with `waitingLists: []`; happy path — a full within-reach group with a free list slot lands in `waitlistEligibleClasses`; per-exclusion tests (enrolled, on-list, list-full 4, out-of-reach, not-full, CANCELED, INDIVIDUAL, viewer no level, class no level); mutual-exclusion assertion that a class appears in exactly one of `joinableClasses`/`waitlistEligibleClasses`; assert the training-class query include now carries `waitingLists` and that the result preserves ascending order; spy `policy.filterWaitlistEligible` is invoked. Confirm the suite FAILS (result type lacks the field / query lacks the include)
- [ ] (no separate task — DTO/Supertest live in Phase 5)

### Implementation

- [ ] T008 [US1] Extend `backend/src/application/use-cases/GetCoacheeDashboard.ts`: add `waitingLists: true` to the shared `CLASS_INCLUDE` (so candidate class rows carry their waiting lists) and add `waitlistEligibleClasses: DashboardJoinableClassRow[]` to `GetCoacheeDashboardResult`, computed after `joinableClasses` via `this.policy.filterWaitlistEligible(candidates, viewerContext)`. `nextClass`, `joinableClasses`, and `activeWaitingListCount` semantics unchanged (FR-015). Make T007 pass green

**Checkpoint**: Dashboard use case emits the discovery array with no contract regressions

---

## Phase 5: Infra/DTO — WaitlistEligibleClassDTO + Supertest Integration

**Purpose**: Expose `waitlistEligibleClasses` on the API and prove the extended endpoint end-to-end, including join/leave round-trips from the discovery surface (FR-002/FR-007/FR-008/FR-012/FR-014/FR-016).

### Tests (write FIRST, ensure they FAIL) ⚠️

- [ ] T009 [P] [US1] Extend `backend/src/__tests__/coachee.dashboard.int.test.ts` (Supertest, real DB — extend the existing scenarios with new classes/seats; Coachee level `levelOkId` sort_order 3, all classes at that level so reach is satisfied):
  - `waitlistEligibleClasses` is an Array; an in-reach full (4/4) group class with a free waitlist slot the viewer is NOT on appears with EXACTLY the documented fields `{ id, classType:"GROUP", startTime (parseable ISO), level:{id,name,color}, assignedCoach:{id,name}, enrollmentCount:4, capacity:4, isWithinReach:true, isOnWaitingList:false }` and reveals no other Coachee identities (assert no `position`, no coachee ids, no extra keys)
  - exclusions: a partially-full (3/4) group appears ONLY in `joinableClasses` (XOR, not in waitlist), an out-of-reach full group absent, an enrolled full group absent, a full group on which the viewer is already waitlisted absent, a full group with a 4/4 waiting list absent, a CANCELED group absent, an INDIVIDUAL full slot absent
  - entries are ordered by `startTime` ascending (FR-016); a Coachee with no level gets an empty `waitlistEligibleClasses`
  - confirm all new tests FAIL (endpoint does not return the array yet)
- [ ] T010 [P] [US2] Add the join-from-discovery round-trip to `backend/src/__tests__/coachee.dashboard.int.test.ts`: a coachee sees a full in-reach group in `waitlistEligibleClasses`, `POST /api/v1/classes/:id/waiting-list` → 201, then GET dashboard → class is GONE from `waitlistEligibleClasses` (list still full → also NOT in `joinableClasses`), `activeWaitingListCount` +1 (FR-008/FR-009/US2-1). Also assert the stale-refusal path: a second join attempt → 409 `ALREADY_ON_WAITING_LIST` (US2-6) and zero extra rows. Confirm FAIL
- [ ] T011 [P] [US3] Add the leave-rejoins-discovery round-trip to `backend/src/__tests__/coachee.dashboard.int.test.ts`: a coachee on a still-full, in-reach list with a free slot `DELETE /api/v1/classes/:id/waiting-list` → 200, then GET dashboard → the class is BACK in `waitlistEligibleClasses` with a working join path, and `activeWaitingListCount` -1 (FR-012/US3-1). Confirm FAIL

### Implementation

- [ ] T012 [US1] Extend `backend/src/infrastructure/dto/coacheeDashboardDto.ts`: add `WaitlistEligibleClassDTO` (`id`, `classType`, `startTime` ISO, `level: LevelRefDTO`, `assignedCoach: AssignedCoachDTO`, `enrollmentCount`, `capacity` = `GROUP_MAX_COACHEES`, `isWithinReach` computed via `viewerSort`/`isWithinReach`, `isOnWaitingList: false`) and map `result.waitlistEligibleClasses` into the `CoacheeDashboardDTO` return of `toCoacheeDashboardDTO`, leaving `nextClass`/`joinableClasses`/`activeWaitingListCount` mappings untouched (FR-015). `backend/src/infrastructure/routes/classes.ts` needs NO change — `GET /coachee/dashboard` already returns `toCoacheeDashboardDTO(result)`; verify with `git diff` that the route file stays untouched. Make T009/T010/T011 pass green

**Checkpoint**: Extended endpoint proven end-to-end incl. discovery→join→disappear and leave→reappear round-trips

---

## Phase 6: Frontend Types

**Purpose**: The frontend contract for the discovery payload (FR-002 shape; the client renders, never derives — Assumptions).

- [ ] T013 [P] [US1] Extend `frontend/src/domain/types/coachee.ts`: add `CoacheeWaitlistEligibleClass` interface (`id: string; classType: "GROUP"; startTime: string; level: CoacheeLevelRef; assignedCoach: CoacheeCoachRef; enrollmentCount: number; capacity: number; isWithinReach: boolean; isOnWaitingList: boolean`) and add `waitlistEligibleClasses: CoacheeWaitlistEligibleClass[]` to `CoacheeDashboard`. No `position`, no client business rules. **Verify**: `npm run typecheck` in `frontend/`

---

## Phase 7: Frontend Hook Fix — Dashboard Invalidation (US2 consistency bug)

**Purpose**: `useJoinWaitingList` must invalidate `["coachee","dashboard"]` on success (plus the existing keys) so the Discovery section, the Badge, and MyWaitingLists re-sync after a join without reload (FR-008/FR-009, US2-2 — mirrors `useLeaveWaitingList`). Fix = login 014, test-first.

### Tests (write FIRST, ensure they FAIL) ⚠️

- [ ] T014 [P] [US2] Write `frontend/src/infrastructure/hooks/useJoinWaitingList.test.ts` (node environment, `@tanstack/react-query` `QueryClient` works without a renderer — the repo has no jsdom/@testing-library and none may be added): seed `queryClient.setQueryData` for the keys `["classes"]`, `["waiting-lists"]`, `["coachee","dashboard"]`, call the invalidator exported from the hook, and assert each query is left in the invalidated state (`client.getQueryCache().find({ queryKey })?.state.isInvalidated === true`) — plus a regression guard that the `["coachee","dashboard"]` key is included. Confirm it FAILS (invalidator/constant missing)

### Implementation

- [ ] T015 [US2] Fix `frontend/src/infrastructure/hooks/useJoinWaitingList.ts`: export `WAITING_LIST_JOIN_INVALIDATION_KEYS = ["classes", "waiting-lists", ["coachee","dashboard"]]` (typed `QueryKey[]`) and an `invalidateWaitingListQueries(queryClient)` helper that invalidates all three; call it in `onSuccess` (keeping the existing `["classes"]`/`["waiting-lists"]` behavior — additive only). Make T014 pass green (deps: T014)

**Checkpoint**: A successful join refreshes `["coachee","dashboard"]` + `["classes"]` + `["waiting-lists"]`

---

## Phase 8: Frontend Discovery Surface

**Purpose**: "Waiting List Opportunities" section on the Coachee Home listing every `waitlistEligibleClasses` entry with a working Join action and a distinct empty state (FR-005/FR-006/FR-007/FR-008/FR-010/FR-011).

### Building blocks (test-first pure logic) ⚠️

- [ ] T016 [P] [US1] Create `frontend/src/domain/utils/waitingListOpportunities.ts` + `waitingListOpportunities.test.ts` with pure, DOM-free helpers: `waitingListOpportunitiesEmptyCopy()` returning `{ title, description }` for the discovery empty state whose copy is DISTINCT from the open-spot section's copy (joinable empty title is "No classes to join right now" — assert inequality so the two empty states can never blur, FR-006) and `waitingListOpportunitySummary(entry)` returning the row's primary label (type + gym-time date + level + coach + "4/4") for the aria-label/confirm dialog, using the existing `formatNextClassTime`/`gymDateTime` helpers — no position anywhere. Tests assert: empty copy differs from the open-spot copy, summary renders all fields, whitespace-only/prop edge cases

### Component

- [ ] T017 [US1] Create `frontend/src/ui/components/coachee/WaitingListOpportunities.tsx`: props `{ classes: CoacheeWaitlistEligibleClass[]; isLoading?: boolean; onRetry?: () => void }`; renders a `"Waiting List Opportunities"` header, one row per entry (type badge, `formatNextClassTime` date, level color-dot + name, assigned Coach, `${enrollmentCount}/${capacity}`), the distinct empty state from `waitingListOpportunitiesEmptyCopy()` (never an error, FR-006), a loading state (`isLoading`), and an error state with retry wired to `onRetry`. Mirrors the visual language of `JoinableClassList.tsx` but is a lighter purpose-built list (spec Assumption); `CoacheeClassCard`/`CoacheeClassList` stay unmounted. No unit test (frontend Vitest includes `.test.ts` only) — behavior proven via T016 helpers + Supertest round-trips + manual UI pass
- [ ] T018 [US2] Add the Join action to `frontend/src/ui/components/coachee/WaitingListOpportunities.tsx` (same file, sequential on T017): per-row "Join waiting list" button → confirmation dialog (class type/date/coach summary) → `useJoinWaitingList` (`mutateAsync(id)`); per-row pending state (button disabled, "Joining..."); on success `showToast("You joined the waiting list.", "success")` (cache invalidation from the T015 fix re-syncs the section/badge/MyWaitingLists automatically, FR-008); on failure close the dialog and `showToast(waitingListErrorMessage(extractErrorCode(error)), "error")` — every documented refusal code maps via the existing `waitingListErrorMessages` map, never `error.ref`, and the section re-syncs on the next fetch so an ineligible class disappears (FR-010/FR-011, US2-3/4/5/6). Double-tap race: pending state disables the button; the server enforces correctness anyway (US2-9)

### Wiring

- [ ] T019 [US1] Wire `<WaitingListOpportunities />` into `frontend/src/ui/pages/coachee/HomePage.tsx` directly BELOW the "Joinable Classes" section (spec Assumption), passing `classes={dashboard.waitlistEligibleClasses}` and `isLoading={dashboardQuery.isFetching && dashboard.waitlistEligibleClasses.length === 0}`, `onRetry={refetch}`; keep the rest of the Home layout unchanged (FR-013 — Home Refresh/pull-to-refresh already refetches the dashboard query, which now carries the discovery array)

**Checkpoint**: Discovery surface renders, joins, and re-syncs; distinct empty state in place

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Verification and governance gates that span the whole feature (Constitution §V, PR Process)

- [ ] T020 [P] Run the full backend gate in `backend/`: `npm run typecheck`, `npm run lint` (biome), `npm test` (vitest), and `npm audit --audit-level=high` (must stay 0); confirm 100% branch coverage for `WaitingListPolicy` and `CoacheeDashboardPolicy` (Constitution §II) and that no new dependencies were added
- [ ] T021 [P] Run the full frontend gate in `frontend/`: `npm run typecheck`, `npm run lint` (biome), `npm test` (vitest), and `npm audit --audit-level=high` (must stay 0)
- [ ] T022 Run the frontend production build in `frontend/`: `npm run build` (tsc + Vite PWA build) succeeds
- [ ] T023 Constitution compliance review before merge (Domain Purity §I — zero Prisma/Express/Zod in `src/domain/`; Test-First §II — red-green evidence + 100% branch; Security-by-Default §III — dashboard still `authenticate` + `requireRole(COACHEE)`, identity from JWT, no coachee identity leakage, standard error envelope; API Contract §IV — docs updated before code, `waitlistEligibleClasses` documented, no breaking changes to existing fields; Dependency Integrity §V — no new deps, audit clean); confirm `Complexity Tracking` remains empty (per plan, no deviations)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Docs (Phase 2)**: Depends on Setup - BLOCKS all production code (Constitution §IV, FR-017)
- **Domain (Phase 3)**: Depends on Docs - BLOCKS all backend stories
- **Application (Phase 4)**: Depends on Domain (uses `WaitingListPolicy.isEligibleForWaitingList` + `CoacheeDashboardPolicy.filterWaitlistEligible`)
- **Infra/DTO (Phase 5)**: Depends on Application (`GetCoacheeDashboardResult.waitlistEligibleClasses`); the Supertest tests T009/T010/T011 can be written in parallel once Phase 4 lands and only go green at T012
- **Frontend (Phases 6-8)**: Frontend types (T013) depend only on Docs's contract; hook fix (T014/T015) is independent of backend code (test drives it); component (T017/T018) and wiring (T019) depend on T013 + T015; helper (T016) is parallel-safe
- **Polish (Phase 9)**: Depends on all phases being complete

### User Story Dependencies

- **User Story 1 (P1, discover)**: Depends on Phases 2-6 (predicate → use case → DTO → Supertest → frontend types/component/wiring)
- **User Story 2 (P1, join-from-discovery)**: Depends on Phase 5's round-trip tests + Phase 7 hook fix + Phase 8 component action
- **User Story 3 (P2, consistency)**: Depends on Phase 5 leave round-trip + Phase 7 (join invalidation) and the existing 013 leave invalidation
- **User Story 4 (P2, server-authoritative)**: Proved by the shared-predicate design (Phase 3) + stale-refusal round-trips (Phase 5) + mapped refusal messages (Phase 8)

### Within Each Backend Phase

- Tests written and confirmed FAILING before implementation (Constitution §II Red-Green)
- Domain predicate (Phase 3) → application use case (Phase 4) → DTO/mapper (Phase 5) → Supertest green

### Parallel Opportunities

- T003 and T004 (domain tests) run in parallel; T005 then T006 are sequential on their own files
- T009, T010, T011 (Supertest additions to the same file `coachee.dashboard.int.test.ts`) must be coordinated/merged — the tests can be authored in parallel, but the file edits are sequential
- T013 (frontend types) and T014 (hook test) and T016 (helper + test) are all parallel-safe (distinct files)
- T014 → T015 sequential on `useJoinWaitingList.ts`
- T016 → T017 sequential (component consumes helper); T017 → T018 sequential on `WaitingListOpportunities.tsx`
- T020/T021/T022 (final gates) run in parallel; T023 last

---

## Implementation Strategy

1. Complete Phase 1 (Setup) → confirm baseline green
2. Complete Phase 2 (Docs) → dashboard contract documented before any code
3. Complete Phase 3 (Domain predicate) → single source of truth locked in with 100% branch coverage
4. Complete Phase 4 (Application) → use case emits the array, contract stable
5. Complete Phase 5 (DTO + Supertest) → endpoint proven incl. join/leave round-trips
6. Complete Phases 6-8 (Frontend) → types, hook invalidation fix, discovery surface, Home wiring
7. STOP and VALIDATE: run the Phase 5 Supertest round-trips + the frontend manual flow (discovery shows full in-reach group, Join → confirmation → removed + badge +1, Leave from MyWaitingLists → reappears)
8. Complete Phase 9 (Polish) → gates gate the merge

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps the task to the spec user story (US1 discover, US2 join-from-discovery, US3 membership consistency, US4 server-authoritative)
- Tests fail-before-production per Constitution §II; domain services target 100% branch coverage
- The endpoint stays `authenticate` + `requireRole(COACHEE)`; identity comes from the JWT only — Constitution §III
- The discovery eligibility predicate is the exact path `JoinWaitingList` uses (`assertJoinEligible`); no second implementation (US4-4, single source of truth)
- Error responses always use `{ error: { code, message, ref } }` with existing codes; the extended dashboard response keeps the single-resource shape (no `{ data, meta }` for this endpoint) — Constitution §IV
- No schema migrations, no new routes, no new dependencies expected; `CoacheeClassCard`/`CoacheeClassList` (013, currently unmounted) are untouched
- No position number is ever shown (simultaneous-notification model, PRD §6.4)
- Commit after each task or logical group; docs (Phase 2) must be committed before the first production-code commit (FR-017)