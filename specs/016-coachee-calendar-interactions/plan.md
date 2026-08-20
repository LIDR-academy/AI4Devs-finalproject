# Implementation Plan: Coachee Calendar Interactions

**Branch**: `016-coachee-calendar-interactions` | **Date**: 2026-08-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/016-coachee-calendar-interactions/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

US-3.4 (COACHER-24). Coachees join, cancel, and waitlist classes directly from the calendar so they can manage everything from one view. **Backend is complete and tested** (enrollment join/cancel, waiting-list join/leave, class visibility blue/green/gray, `WaitingListPolicy`); this feature delivers the **frontend calendar-interaction UX only**:

- Render blue, green, and relevant gray "Busy" classes in the coachee 1-week calendar (currently dropped client-side by `isCoacheeRelevant`), plus informational canceled entries — no private details of other Coachees; busy blocks never appear for classes not relevant to the Coachee (occupied individual slots, out-of-reach groups are filtered out).
- Tap-to-open interaction modal with class details (type, time, level, Coach, spots for green entries): blue → cancel, green → join, gray → waiting-list join/leave (only for reachable full group classes).
- **Confirmation dialog before every action** — the current `CoacheeCalendarView.ClassCard` Enroll/Cancel buttons (`CoacheeCalendarView.tsx:264-282`) fire immediately.
- **Optimistic calendar updates with rollback on error** — the four mutation hooks (`useJoinClass`, `useCancelEnrollment`, `useJoinWaitingList`, `useLeaveWaitingList`) currently only invalidate on `onSuccess`; add `onMutate`/`setQueryData` + `onError` rollback via a shared pure state-apply helper.
- Error feedback (toasts) in all new modal flows reusing `enrollmentErrorMessage` / `waitingListErrorMessage`.
- Frontend component + hook tests for the modal flows and optimistic-update/rollback behavior (`vitest` currently runs only `node`-env `.test.ts` — the plan adds `jsdom` + Testing Library for `.test.tsx` component tests).

One structural note resolved in research (D1): `GET /classes` (list) returns only `visibility` — the eligible-gray decision needs `coacheeStatus.isWithinReach`/`isOnWaitingList`, which only `GET /classes/:id` returns. The modal therefore fetches class detail on open (existing `useClassDetail`) to decide waitlist eligibility. Separately, the busy-block *filter* (which gray cards render at all) matches the server reach rule client-side from the class `level.sortOrder` and the Coachee's own level (`useMe`/`useLevels`) so irrelevant busy entries never appear — **zero backend changes**, preserving the story's "backend done" boundary.

## Technical Context

**Language/Version**: TypeScript 5.7 + React 18.3.1 + Vite 6 (frontend). Vitest 4.1.10 (tests).

**Primary Dependencies**: TanStack React Query 5 (`@tanstack/react-query`), TailwindCSS v4, React Router v6, `temporal-polyfill` — all existing and unchanged. **New devDependencies (tests only, pinned exact per Constitution §V):** `jsdom`, `@testing-library/react`, `@testing-library/dom`, `@testing-library/user-event`, `@testing-library/jest-dom`.

**Storage**: None — no Prisma schema changes, no migrations. The frontend reads existing DTOs: `GET /classes` (list with `visibility`, `enrollmentCount`, `capacity`, `waitingListCount`) and `GET /classes/:id` (`coacheeStatus: { isEnrolled, isOnWaitingList, isWithinReach }`).

**Testing**: Vitest — pure-logic unit tests (`.test.ts`, `node` env), mutation-hook tests (`.test.ts`, `node` env, real `QueryClient` like `useJoinWaitingList.test.ts`), and new component tests (`.test.tsx`, per-file `@vitest-environment jsdom` + Testing Library). Vitest `include` widened to `src/**/*.test.{ts,tsx}`.

**Target Platform**: Web application (React SPA consuming the REST API).

**Project Type**: Frontend of a web application (hexagonal boundary on the backend; frontend keeps domain/utils pure).

**Performance Goals**: Optimistic calendar updates reflect within the same frame (<100ms perceived) — no waiting on the server round-trip; the interaction modal opens instantly from list data with eligibility computed in the background from the detail fetch.

**Constraints**:
- **No backend changes, no new API endpoints** — the story's backend is done; the calendar consumes `GET /classes` + `GET /classes/:id` + the four mutation endpoints (`POST/DELETE /classes/:id/enrollment`, `POST/DELETE /classes/:id/waiting-list`).
- **Every in-calendar action requires an explicit confirmation dialog** before the mutation fires (spec FR-010).
- **Eligibility for the gray-block waitlist** is decided from the class detail's `coacheeStatus.isWithinReach` (group full within reach). The calendar never renders a busy block for a class the Coachee cannot waitlist: `isCalendarClass(cls, coacheeLevelSortOrder)` keeps gray only for group classes within ±1 level (occupied individual slots and out-of-reach groups are dropped client-side). If the backend still rejects at confirm time, its error is surfaced verbatim via `waitingListErrorMessage` (spec FR-002/FR-009/FR-018).
- When already on a slot's waiting list, the dialog offers **"Leave waiting list"** instead of join (spec FR-008).
- Optimistic transitions: join → blue; cancel → green/gray; waitlist join → on-waiting-list state; waitlist leave → off state. Failure → rollback to the exact pre-action snapshot + friendly toast; no half-updated calendar (spec FR-012/FR-013).
- Duplicate/conflicting actions on the same entry are prevented while an action is in flight (spec FR-014); optimistic state and server-confirmed state reconcile on the follow-up invalidation (spec FR-015).
- The calendar keeps the existing **day-strip + card list** layout; migrating to the schedule-x time-grid is explicitly out of scope (issue).
- Gray busy entries never expose another Coachee's identity or private details (spec FR-002).
- Mobile-first; pull-to-refresh unchanged.
- Session expiry mid-action → mutation is refused, no data change, calendar stays in its last known-good state (spec FR-016).
- No raw SQL, no secrets in code, all new deps pinned to exact versions.

**Scale/Scope**: Single gym, one Coachee calendar screen with five interactions (join, cancel, waiting-list join, waiting-list leave, busy/slot info); no backend, no migrations, no new runtime dependencies.

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Gate | Status |
|---|-----------|------|--------|
| G1 | Domain Purity (NON-NEGOTIABLE) | All new decision/transform logic lives in pure TypeScript under `frontend/src/domain/utils/` (optimistic state apply, calendar interaction derivation, error maps). Zero React/Query/DOM imports in `domain/`. The hooks only wire pure helpers to the cache (adapter). | PASS |
| G2 | Test-First for Domain Logic | Acceptance scenarios already specified in `spec.md` (Given/When/Then). New pure helpers (`calendarInteraction.ts`, optimistic apply) get failing unit tests first; mutation hooks get `QueryClient`-based rollback tests; component tests cover the modal flows (open, detail, confirm, submit, optimistic, rollback) via Testing Library. | PASS |
| G3 | Security-by-Default | No new endpoints; existing auth/role guards and 401/403 handling are reused untouched. No secrets, no stack traces (`extractErrorCode` + fixed message maps only). Gray entries render no other Coachee's identity. Session-expiry handling keeps cache consistent. | PASS |
| G4 | API Contract Consistency | Consumes only documented endpoints (`GET /classes`, `GET /classes/:id`, `POST/DELETE /classes/:id/enrollment`, `POST/DELETE /classes/:id/waiting-list`) exactly per `docs/api-specifications.md`. No response shape changes; `{ error: { code, message, ref } }` envelope already parsed by `extractErrorCode`. | PASS |
| G5 | Dependency Integrity | New devDependencies pinned to exact versions; no raw SQL (n/a); lockfile committed. | PASS |

No gate violations. `Complexity Tracking` table intentionally empty.

**Post-design re-check (after Phase 1)**: PASS — research (D1–D7) confirmed all rules stay server-owned or pure-client; the only new deps are pinned devDependencies for component tests (`jsdom`, Testing Library); the modal decision logic is a pure `domain/utils` module (G1/G2 re-checked green); no endpoint, response shape, or middleware changes (G3/G4 re-checked green); no lockfile/audit risk introduced (G5). No violations to justify in `Complexity Tracking`.

## Project Structure

### Documentation (this feature)

```text
specs/016-coachee-calendar-interactions/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output — key design decisions
├── data-model.md        # Phase 1 output — entities/state consumed
├── quickstart.md        # Phase 1 output — validation guide
├── contracts/           # Phase 1 output — UI + API contracts
│   ├── ui.md
│   └── api.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

Frontend-only feature. Existing structure reused; no new directories:

```text
frontend/src/
├── domain/types/class.ts                          # unchanged (visibility?, coacheeStatus?, enrollmentCount, capacity, waitingListCount already present)
├── domain/utils/
│   ├── calendarInteraction.ts                     # NEW (pure): deriveCalendarInteraction (card→modal action) + applyOptimisticClassUpdate (join/cancel/waitlist-join/waitlist-leave)
│   ├── coacheeWeekView.ts                         # EXTEND: isCalendarClass keeps blue/green and gray only for group classes within ±1 level (relevant busy); splits out isWithinReach + isRelevantBusyClass pure helpers
│   ├── enrollmentErrorMessages.ts + waitingListErrorMessages.ts   # reused
│   └── apiError.ts                                # reused (extractErrorCode)
├── infrastructure/hooks/
│   ├── optimisticClassMutation.ts                 # NEW (pure adapter): build onMutate (snapshot + applyOptimisticClassUpdate to all ["classes"]-prefixed queries) / onError (restore snapshot) for the four mutation hooks
│   ├── useJoinClass.ts                            # EXTEND: add optimistic onMutate + onError rollback (keep invalidations)
│   ├── useCancelEnrollment.ts                     # EXTEND: add optimistic onMutate + onError rollback
│   ├── useJoinWaitingList.ts                      # EXTEND: add optimistic onMutate + onError rollback
│   ├── useLeaveWaitingList.ts                     # EXTEND: add optimistic onMutate + onError rollback
│   └── useClassDetail.ts                          # reused (modal eligibility fetch)
├── ui/components/coachee/
│   ├── CoacheeCalendarView.tsx                    # EXTEND: render gray/canceled busy cards only when relevant (isCalendarClass + coachee level sort order); ClassCard tap opens the interaction modal (replace inline Enroll/Cancel buttons)
│   ├── ClassInteractionModal.tsx                  # NEW: detail modal (type/time/level/coach/spots) + eligibility + embedded confirmation step + toasts
│   └── ViewState.tsx                              # reused (loading/empty/error)
└── tests (in-place, colocated):
    ├── domain/utils/calendarInteraction.test.ts   # NEW — pure decision + optimistic-transition unit tests
    ├── domain/utils/coacheeWeekView.test.ts       # EXTEND — gray predicate tests
    ├── infrastructure/hooks/optimisticClassMutation.test.ts  # NEW — snapshot/rollback with real QueryClient
    └── ui/components/coachee/ClassInteractionModal.test.tsx  # NEW — component tests (jsdom) for modal flows
```

Supporting test-config change (test-only, pinned dev deps):

```text
frontend/vitest.config.ts                         # EXTEND include: ["src/**/*.test.{ts,tsx}"]
frontend/package.json                             # ADD pinned devDeps: jsdom, @testing-library/react, @testing-library/dom, @testing-library/user-event, @testing-library/jest-dom
```

**Structure Decision**: Follow the existing frontend layering exactly — pure rules in `domain/utils/`, adapters in `infrastructure/hooks/` (React Query), presentation in `ui/components/coachee/`. No new top-level directories or packages: one new pure util module, one new hook helper module, one new modal component, and one file of configuration changes. The optimistic-update pattern is centralized in `optimisticClassMutation.ts` so all four mutation hooks (calendar and Home both consume `useJoinClass`/`useCancelEnrollment`/`useJoinWaitingList`/`useLeaveWaitingList`) get rollback-safe behavior without duplicating code.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

_No violations — table intentionally empty._