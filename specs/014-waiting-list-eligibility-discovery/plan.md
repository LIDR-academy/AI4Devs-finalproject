# Implementation Plan: Waiting List Eligibility Discovery

**Branch**: `014-waiting-list-eligibility-discovery` | **Date**: 2026-08-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/014-waiting-list-eligibility-discovery/spec.md`

## Summary

US-3.4/3.5 (COACHER-N). Coachees can see the full group classes they are eligible to join a waiting list for, and act on them from the Home screen. The 013 join/leave/list backend is complete; this feature adds the missing *discovery signal* and the *discovery surface*:

1. **Backend signal** — extend `GET /coachee/dashboard` with a new `waitlistEligibleClasses[]` array. Each entry: `id`, `classType` (`GROUP`), `startTime`, `level`, `assignedCoach`, `enrollmentCount`, `capacity`, `isWithinReach`, `isOnWaitingList`. Computed server-side in domain services using **exactly the same decision rule as `POST /classes/:id/waiting-list`** (single source of truth, FR-001/US4-4.4), over the same 10-day Madrid window as the existing open-spot `joinableClasses`, mutually exclusive with it (FR-003), ordered by `startTime` ascending (FR-016), no pagination.
2. **Frontend discovery surface** — a "Waiting List Opportunities" section on the Coachee Home page listing every eligible class with type/date/level/Coach/enrollment count and a working **"Join waiting list"** action backed by the existing `POST /classes/:id/waiting-list`, plus a distinct empty state (FR-005/FR-006/FR-007).
3. **Consistency fix** — `useJoinWaitingList` must also invalidate `["coachee","dashboard"]` so the Badge, discovery section, and MyWaitingLists re-sync after a join without reload (FR-008/FR-009, US2-2).

No new join logic, no schema changes, no client-side business rules, no changes to the calendar/visibility model (FR-015). Docs (`docs/api-specifications.md`) updated for the extended dashboard contract before implementation (FR-017).

## Technical Context

**Language/Version**: Node.js 22 LTS + TypeScript (backend); React 18 + Vite + TypeScript (frontend)

**Primary Dependencies**: Backend — Express, Prisma, Zod (all pinned). Frontend — React Router v6, TanStack React Query v5, TailwindCSS v4

**Storage**: PostgreSQL via Prisma — **no schema changes or migrations**. Reuses `TrainingClass`, `Level`, `User`, `ClassEnrollment`, `WaitingList` (all existing).

**Testing**: Vitest 4.1.11 + Supertest (backend unit/integration); Vitest (frontend). All gates: `biome check` → `tsc --noEmit` → `vitest run` → `npm audit --audit-level=high` (currently 0).

**Target Platform**: Web application (SPA + REST API under `/api/v1/`)

**Project Type**: Web application (frontend + backend, hexagonal backend)

**Performance Goals**: The dashboard payload grows by the discovery window's eligible classes (single gym, dozens/week); renders instantly at expected volumes.

**Constraints**:
- Discovery eligibility MUST use the same decision logic as the join endpoint: ACTIVE + GROUP + full (`enrollmentCount >= capacity`=4) + within reach (level ±1) + not already enrolled + not already on the waiting list + waiting list has a free slot (count < 4). Reuse the reach logic and `WaitingListPolicy` rules — do NOT re-implement.
- Discovery and open-spot joinable windows are the SAME 10-day Madrid wall-clock window; a class is open-spot-joinable XOR waitlist-eligible at any instant.
- Only the authenticated Coachee's own dashboard; response must not leak other coachee identities.
- No position numbers; no auto-enrollment (EP-04 deferred); leave is free and notifies no one (inherited from 013).
- Error envelope `{ error: { code, message, ref } }`; refusals surface specific user-facing messages (`waitingListErrorMessages` map) — never internal details.
- Domain purity: any new predicate lives in `src/domain/` with zero Prisma/Express/Zod imports.
- UI copy in English, consistent with the existing "Joinable Classes" section.
- Frontend MUST NOT derive eligibility; it renders the server-computed `waitlistEligibleClasses` and consumes `coacheeStatus`/server signals only.

**Scale/Scope**: Single gym; one endpoint extended + one Home section + join/leave re-sync; no migration, no new dependencies.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Gate | Status |
|---|-----------|------|--------|
| G1 | Domain Purity (NON-NEGOTIABLE) | Eligibility predicate in `src/domain/services/` (extend `WaitingListPolicy` or `CoacheeDashboardPolicy`) — pure TS, reuses existing reach/capacity/fullness rules; zero Prisma/Express/Zod in `src/domain/` | PASS |
| G2 | Test-First for Domain Logic | Spec already contains Given/When/Then (US1-4). New domain predicate tests written red first with 100% branch coverage; dashboard use-case happy + refusal-path tests; Supertest for the extended endpoint + join/leave round-trip; frontend unit tests for new render/mutation behavior | PASS |
| G3 | Security-by-Default | Extended endpoint stays `authenticate` + `requireRole(COACHEE)`; data scoped to JWT identity; no other-coachee data exposed; refusals keep the standard error envelope; no stack traces | PASS |
| G4 | API Contract Consistency | `GET /coachee/dashboard` extended per updated `docs/api-specifications.md`; array shape consistent with existing `joinableClasses`; error codes unchanged | PASS |
| G5 | Dependency Integrity | No new dependencies; existing ones pinned (vitest already bumped to 4.1.11) | PASS |

No gate violations. No new dependencies added for this feature.

## Project Structure

### Documentation (this feature)

```text
specs/014-waiting-list-eligibility-discovery/
├── plan.md              # This file
├── spec.md              # Feature specification (approved)
├── tasks.md             # /speckit.tasks output (NOT created by plan)
└── contracts/           # (phase-1 outputs, optional)
```

### Source Code (repository root)

Existing hexagonal backend + existing frontend patterns (reused):

```text
backend/src/
├── application/use-cases/
│   └── GetCoacheeDashboard.ts               # EXTEND: load waitingLists (with counts) for the coachee; compute waitlistEligibleClasses via the shared predicate; include in result
├── domain/services/
│   ├── WaitingListPolicy.ts                 # EXTEND: expose a reusable eligibility predicate `isEligibleForWaitingList` (or reuse assertJoinEligible as a pure check returning a boolean) — single source of truth with the join flow
│   └── CoacheeDashboardPolicy.ts            # EXTEND: `waitlistEligibleWindow` shares the existing joinableWindow constants; helper to filter/order eligible classes
├── infrastructure/
│   ├── dto/coacheeDashboardDto.ts           # EXTEND: WaitlistEligibleClassDTO { id, classType, startTime, level, assignedCoach, enrollmentCount, capacity, isWithinReach, isOnWaitingList } + dashboard mapper
│   ├── dto/waitingListDto.ts                # (unchanged — reuse shape conventions)
│   └── routes/classes.ts                    # EXTEND: dashboard route response includes waitlistEligibleClasses
└── __tests__/
    ├── WaitingListPolicy.test.ts            # EXTEND: eligibility predicate tests (100% branch)
    ├── CoacheeDashboardPolicy.test.ts       # EXTEND: filter/order/window tests (or new file)
    ├── GetCoacheeDashboard.test.ts          # EXTEND: happy + exclusion-path tests (enrolled, on-list, full-list, out-of-reach, not-full, canceled, individual)
    └── coachee-dashboard.int.test.ts        # EXTEND/NEW: Supertest — extended dashboard shape, mutual exclusivity with joinableClasses, join-from-discovery round-trip
```

Frontend (Coachee Home discovery surface):

```text
frontend/src/
├── domain/types/
│   ├── coachee.ts                           # EXTEND: CoacheeDashboard gains waitlistEligibleClasses: WaitlistEligibleClass[]; new WaitlistEligibleClass interface
│   └── waitingList.ts                       # (unchanged)
├── infrastructure/hooks/
│   └── useJoinWaitingList.ts                # FIX: invalidate ["coachee","dashboard"] in onSuccess (in addition to ["classes"], ["waiting-lists"])
├── ui/
│   ├── components/coachee/                    # NEW: WaitingListOpportunities.tsx — section rendering dashboard.waitlistEligibleClasses
│   │   └── WaitingListOpportunities.tsx       #   each row: type/date/level/coach/enrollment + "Join waiting list" button → confirm dialog → useJoinWaitingList → toast on error; distinct empty state
│   └── pages/coachee/HomePage.tsx           # WIRE: render <WaitingListOpportunities /> after the "Joinable Classes" section
└── (repository/use-case plumbing unchanged — dashboard already fetched via useCoacheeDashboard → repositories/classesRepository.getCoacheeDashboard)
```

No new routes, no new top-level directories, no new packages. `CoacheeClassCard`/`CoacheeClassList` (built in 013, currently unmounted) remain for a later calendar story; the Home discovery list is a lighter, purpose-built section component (spec Assumption line).

## Implementation Order (draft — finalized in tasks.md)

1. **Domain** — extend `WaitingListPolicy` with a pure, boolean eligibility predicate reused by the join use case and the dashboard; extend `CoacheeDashboardPolicy` for filtering/ordering over the shared 10-day window. Write failing tests first (100% branch).
2. **Application** — extend `GetCoacheeDashboard` to load `waitingLists` + `_count` and compute `waitlistEligibleClasses`. Tests: happy + every exclusion path.
3. **Infra/DTO** — `WaitlistEligibleClassDTO` + dashboard mapper + route response. Supertest integration: shape, exclusivity, and join-from-discovery round-trip.
4. **Docs** — update `docs/api-specifications.md` dashboard contract (before code, Constitution IV).
5. **Frontend types** — extend `CoacheeDashboard`/`WaitlistEligibleClass`.
6. **Frontend hook fix** — `useJoinWaitingList` invalidates `["coachee","dashboard"]`.
7. **Frontend component** — `WaitingListOpportunities.tsx` + wire into `HomePage`; distinct empty state; confirm + pending + error-with-mapped-message; unit tests.
8. **Verification** — backend + frontend gates (`lint`, `typecheck`, `test`), `npm audit --audit-level=high` (0), prod build.

## Risks / Verification

- **Single source of truth** — the eligibility predicate must be the same path `JoinWaitingList` uses; regression risk if duplication creeps in. Mitigation: predicate lives in `WaitingListPolicy` and join use case delegates to it; tests assert parity.
- **Dashboard contract stability** — `nextClass`, `joinableClasses`, `activeWaitingListCount` unchanged (FR-015); existing dashboard tests must keep passing.
- **Stale-data refusals** — surface is a hint; join endpoint is truth. Frontend must map every refusal code and refetch (invalidation) so the section re-derives. Covered by US2-3/4/5/6 and US4.
- **Watch regressions** — `useJoinWaitingList` invalidation change affects the 013 badge/list flows (now also refetching dashboard — safe, additive).