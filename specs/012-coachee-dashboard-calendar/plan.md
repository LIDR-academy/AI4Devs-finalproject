# Implementation Plan: Coachee Dashboard & Calendar

**Branch**: `012-coachee-dashboard-calendar` | **Date**: 2026-08-19 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/012-coachee-dashboard-calendar/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

US-3.2 (COACHER-22). Coachees get a personalized Home screen and a color-coded 1-week calendar so they can see their schedule and discover joinable classes. Two pieces:

- **Backend — implement `GET /coachee/dashboard`** (currently a `501 NOT_IMPLEMENTED` stub at `backend/src/infrastructure/routes/classes.ts:347`). The endpoint already has a documented contract in `docs/api-specifications.md`; it returns `{ nextClass, joinableClasses, activeWaitingListCount }`. A new pure domain service `CoacheeDashboardPolicy` computes the next class (soonest future enrolled ACTIVE class), the joinable list (ACTIVE group classes within the next-10-day window that are within reach ±1, have an open spot, and are not already enrolled), and the active waiting-list count. The Coachee identity comes from the JWT, never the body. No schema changes, no new dependencies.
- **Frontend — build the two real Coachee views**: a Home screen (next class or "No upcoming classes", a 10-day joinable-classes list with Join actions, and an active waiting-list count) and a Calendar view (1-week, color-coded **blue** = own, **green** = joinable, **gray** = other/busy via the server-provided `visibility` field already returned by `GET /classes`). Both get loading / empty / error states and mobile pull-to-refresh. The Join/Cancel actions reuse the existing `useJoinClass`/`useCancelEnrollment` hooks (US-3.1); waiting-list join/leave execution remains US-3.3 (surfaced only as an affordance here).

Join/cancel and calendar details are read-only for the server: the dashboard endpoint queries existing `ClassEnrollment`/`WaitingList`/`TrainingClass`/`User`/`Level` rows; the calendar reuses the existing `GET /classes` data with the existing `classifyVisibility` service (blue/green/gray), which the frontend already receives as `visibility` on each class.

## Technical Context

**Language/Version**: Node.js 22 LTS + TypeScript (backend); React 18 + Vite + TypeScript (frontend)

**Primary Dependencies**: Backend — Express, Prisma, Zod (all pinned). Frontend — React Router v6, TanStack React Query v5, TailwindCSS v4, `@schedule-x/calendar` + `@schedule-x/react` + `@schedule-x/events-service` + `temporal-polyfill` (already used by the admin/coach `ClassCalendar`)

**Storage**: PostgreSQL via Prisma — **no schema changes or migrations**. All needed models exist: `User` (coachee+level), `Level` (`sort_order` — reach input), `TrainingClass` (`class_type`, `status`, `start_time`, `level_id`, `enrollments`, `waitingLists`), `ClassEnrollment` (`@@unique([class_id, coachee_id])`), `WaitingList`, `SecurityAuditLog`

**Testing**: Vitest + Supertest (backend unit/integration); Vitest (frontend). Following the constitution: new domain service tests written Red-Green with 100% branch coverage; dashboard endpoint gets a Supertest happy-path + every error path

**Target Platform**: Web application (SPA + REST API under `/api/v1/`), mobile-first PWA (Coachee experience)

**Project Type**: Web application (frontend + backend, hexagonal backend)

**Performance Goals**: Dashboard and calendar render and reflect data within 1 second under normal conditions; loading→ready transitions feel instant; counts/colors derive server-side (no client recomputation)

**Constraints**:
- Class duration is ALWAYS 60 minutes; group capacity = 4 (`GROUP_MAX_COACHEES`); individual = 1
- Level reach = coachee level, one above, or one below (`ReachCalculator.isWithinReach`); a coachee without a level is out of reach for every class
- Dashboard identity MUST come from the authenticated session (JWT); non-Coachee → `403 FORBIDDEN`
- Calendar colors are the server-computed `visibility` (`blue`/`green`/`gray`, from `ClassVisibility.classifyVisibility`); the frontend MUST NOT re-derive reach/capacity
- Gray entries MUST NOT expose other Coachees' names/details (enforce the same reveal rules the DTO mapper already applies)
- Joinable window = start of today in `Europe/Madrid` through the 10th day inclusive (spec Assumption); the next class = soonest future enrolled ACTIVE class
- Active waiting-list count = coachee's `WaitingList` rows whose class `status = ACTIVE`
- Error envelope `{ error: { code, message, ref } }`; no stack traces
- Domain purity (Constitution §I): dashboard derivation rules live in `src/domain/services/CoacheeDashboardPolicy.ts` — zero Prisma/Express/Zod imports in `src/domain/`
- `docs/api-specifications.md` §`GET /coachee/dashboard` is authoritative; the one inconsistency found (`"status": "active"` lowercase vs `ACTIVE` everywhere else) is corrected in the doc during implementation
- All dependencies pinned; no raw SQL (Prisma parameterized queries only)

**Scale/Scope**: Single gym, dozens of classes/week. Backend endpoint implemented + tested; frontend Home + Calendar views implemented with states and pull-to-refresh. Waiting-list join/leave execution (US-3.3) is out of scope — only surfaced as an affordance. Week navigation on the calendar is out of scope (current week only, per spec Assumption).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Gate | Status |
|---|-----------|------|--------|
| G1 | Domain Purity (NON-NEGOTIABLE) | New `CoacheeDashboardPolicy` domain service owns the derivation rules (next-class selection, joinable filter via reach/is-full/enrolled, active waiting-list count) — pure TypeScript reusing `ReachCalculator.isWithinReach`; zero Prisma/Express/Zod imports in `src/domain/` | PASS |
| G2 | Test-First for Domain Logic | Acceptance scenarios specified in `spec.md` (Given/When/Then). `CoacheeDashboardPolicy.test.ts` written and failing before production code; 100% branch coverage on the policy; `GetCoacheeDashboard.test.ts` (happy + error paths); Supertest for `GET /coachee/dashboard` (happy, no-next-class, no-joinable, 403 non-Coachee). Frontend pure utils (`coacheeCalendarEvents`, dashboard derivations) unit-tested | PASS |
| G3 | Security-by-Default | `GET /coachee/dashboard` guarded `authenticate` + `requireRole(COACHEE)`; JWT-derived identity only; gray calendar entries masked (no other Coachee names/details); `403` for non-Coachee; no stack traces | PASS |
| G4 | API Contract Consistency | Response matches `docs/api-specifications.md` §`GET /coachee/dashboard` (`{ nextClass, joinableClasses, activeWaitingListCount }`, single-resource returned directly); errors use the standard envelope; doc `status` casing aligned to `ACTIVE`; endpoint under `/api/v1/` | PASS |
| G5 | Dependency Integrity | No new dependencies; existing ones already pinned to exact versions | PASS |

No gate violations. `Complexity Tracking` table intentionally empty.

## Project Structure

### Documentation (this feature)

```text
specs/012-coachee-dashboard-calendar/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output — key design decisions
├── data-model.md        # Phase 1 output — entity/state model
├── quickstart.md        # Phase 1 output — validation guide
├── contracts/           # Phase 1 output — API + UI contracts
│   ├── api.md
│   └── ui.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

Existing hexagonal backend (reused) + existing frontend patterns (reused):

```text
backend/src/
├── config/container.ts                       # DI — register GetCoacheeDashboard (+ CoacheeDashboardPolicy)
├── application/use-cases/
│   └── GetCoacheeDashboard.ts                # NEW: GET /coachee/dashboard flow (queries + policy)
├── domain/services/
│   └── CoacheeDashboardPolicy.ts             # NEW: pure derivation rules (next class, joinable filter, waiting-list count)
├── infrastructure/
│   ├── routes/classes.ts                     # REPLACE the 501 /coachee/dashboard stub with a real handler
│   ├── dto/coacheeDashboardDto.ts            # NEW: response mapper matching the documented contract
│   └── (AuditLogger, error-codes, middleware — reused)
└── __tests__/
    ├── CoacheeDashboardPolicy.test.ts        # NEW (Red-Green, 100% branch)
    ├── GetCoacheeDashboard.test.ts           # NEW
    ├── coachee.dashboard.int.test.ts         # NEW: Supertest (happy + error paths)
    └── (existing classes.int.test.ts etc. unchanged)
```

Frontend (Coachee views, wired into existing pages):

```text
frontend/src/
├── domain/types/coachee.ts                   # EXTEND: CoacheeDashboard, NextClass, JoinableClass
├── domain/utils/
│   ├── coacheeCalendarEvents.ts              # NEW: pure mapping TrainingClass(+visibility) → event color/title
│   ├── nextClassInfo.ts                      # NEW: pure formatting/derivation helpers for the Home sections
│   └── (classCalendarEvents.ts / classCardState.ts reused)
├── infrastructure/repositories/classesRepository.ts  # EXTEND: getCoacheeDashboard()
├── infrastructure/hooks/
│   ├── useCoacheeDashboard.ts                # NEW
│   ├── usePullToRefresh.ts                   # NEW: touch-based pull-to-refresh (mobile), calls refetch
│   └── (useListClasses / useJoinClass / useCancelEnrollment reused)
└── ui/
    ├── components/coachee/
    │   ├── NextClassCard.tsx                 # NEW: next class or "No upcoming classes" empty state
    │   ├── JoinableClassList.tsx             # NEW: 10-day joinable list with Join actions + empty state
    │   ├── WaitingListBadge.tsx              # NEW: active waiting-list count (hidden when 0)
    │   ├── CoacheeCalendarView.tsx           # NEW: 1-week visibility-colored view (desktop week + mobile)
    │   └── CoacheeClassDetailModal.tsx       # NEW: tap surface — Join/Cancel per state + waiting-list affordance
    └── pages/coachee/
        ├── HomePage.tsx                      # REPLACE placeholder with real dashboard + states + pull-to-refresh
        └── CalendarPage.tsx                  # REPLACE placeholder with CoacheeCalendarView + states + pull-to-refresh
```

**Structure Decision**: Follow the existing hexagonal layering and the existing repo/hooks/component patterns exactly — no new top-level directories, no new packages. Backend work replaces one stubbed route and adds one use case plus one pure domain service and one DTO mapper; frontend work adds one repository method, one query hook, one pull-to-refresh hook, a small set of Coachee components, and replaces the two placeholder pages. The calendar view reuses the existing `@schedule-x` week pattern from `ClassCalendar` but with coachee-specific visibility colors and no admin/coach filters.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

_No violations — table intentionally empty._