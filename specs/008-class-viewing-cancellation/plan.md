# Implementation Plan: Class Viewing & Cancellation

**Branch**: `008-class-viewing-cancellation` | **Date**: 2026-08-17 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/008-class-viewing-cancellation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

US-2.3 (COACHER-17). Coaches and Admins gain the ability to view and filter the class schedule by date range, class type, and assigned Coach; inspect class details including enrollment and waiting-list counts; and cancel classes — a single occurrence or an entire recurring series. Cancellation is a **soft-cancel**: the class keeps its row, its status becomes `CANCELED`, it stays visible (shown gray with a "Canceled" tag), its Google Calendar event is removed so the slot frees up, the action is audit-logged, and cancellation notifications for enrolled Coachees are created (dispatching deferred to EP-04).

The existing endpoints `GET /classes`, `GET /classes/:id`, and `DELETE /classes/:id` are reworked to match the documented contract in `docs/api-specifications.md` (date-range query, filters, pagination, role-scoped visibility, soft-cancel with `scope`). `DELETE /recurring-series/:id` (cancel the whole series at its root) and the Admin/Coach list/detail/cancel UI are new. No Prisma schema changes are required.

## Technical Context

**Language/Version**: Node.js 22 LTS + TypeScript (backend); React 18 + Vite + TypeScript (frontend)

**Primary Dependencies**: Backend — Express, Prisma, Zod, googleapis (Google Calendar via Service Account adapter). Frontend — React Router v6, TanStack React Query v5, TailwindCSS v4

**Storage**: PostgreSQL via Prisma (no schema changes; existing `TrainingClass`, `RecurrenceSeries`, `ClassEnrollment`, `WaitingList`, `Notification`, `SecurityAuditLog` models cover the feature)

**Testing**: Vitest + Supertest (backend unit/integration); Playwright (E2E)

**Target Platform**: Web application (SPA + REST API under `/api/v1/`)

**Project Type**: Web application (frontend + backend)

**Performance Goals**: Class list/detail responses p95 < 500 ms; the schedule list renders without perceptible blocking at expected volumes (dozens of classes/week)

**Constraints**:
- Class duration is ALWAYS 60 minutes (hard invariant) — `capacity = 4` (group) / `1` (individual)
- Gym capacity: max 2 individual + 1 group simultaneous (enforced at creation; not re-checked on cancel)
- Authorization: cancellation restricted to the assigned Coach or an Admin → `403` otherwise
- Error envelope `{ error: { code, message, ref } }`; list responses use `{ data, meta }`; single resources returned directly
- Times stored as UTC; wall-clock interpreted in `Europe/Madrid` (reuse `TimeZoneMath.ts` / `gymDateTime.ts`)
- All dependencies pinned to exact versions; no raw SQL; Google Calendar accessed only server-side

**Scale/Scope**: Single gym, a handful of Coaches, dozens of classes per week; no schema migration; no new external dependencies

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Gate | Status |
|---|-----------|------|--------|
| G1 | Domain Purity (NON-NEGOTIABLE) | Cancellation scope/authorization rules live in a pure domain service (`ClassCancellationPolicy`), with zero Prisma/Express/Zod imports in `src/domain/` | PASS |
| G2 | Test-First for Domain Logic | Acceptance scenarios are specified in `spec.md` (Given/When/Then). New domain service tests written and failing before production code; 100% branch coverage; every endpoint has happy-path + validation-error Supertest coverage | PASS |
| G3 | Security-by-Default | All endpoints keep `authenticate` + `requireRole` guards; Zod schemas use `.strict()`; `403` for unauthorized cancel; audit log on every cancel (success + denied); no stack traces | PASS |
| G4 | API Contract Consistency | List → `{ data, meta }`; single → resource; errors → `{ error: { code, message, ref } }`; `/api/v1/` prefix; endpoints already documented in `docs/api-specifications.md` | PASS |
| G5 | Dependency Integrity | No new dependencies; existing ones already pinned | PASS |

No gate violations. `Complexity Tracking` table intentionally empty.

## Project Structure

### Documentation (this feature)

```text
specs/008-class-viewing-cancellation/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output — key design decisions
├── data-model.md        # Phase 1 output — entity/state model
├── quickstart.md        # Phase 1 output — validation guide
├── contracts/           # Phase 1 output — API contracts
│   └── api.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

Existing hexagonal backend (reused, no new directories):

```text
backend/src/
├── config/container.ts          # DI — register new/updated use cases
├── application/use-cases/
│   ├── ListTrainingClasses.ts   # REWORK: date range + filters + pagination + role scope
│   ├── GetTrainingClass.ts      # NEW: detail (moved from inline route query)
│   ├── CancelTrainingClass.ts   # NEW: soft-cancel single/series + calendar + audit + notifications
│   └── CancelRecurringSeries.ts # NEW: root series cancel
├── domain/services/
│   └── ClassCancellationPolicy.ts  # NEW: pure domain rules (authorize, select instances)
├── infrastructure/
│   ├── dto/trainingClassDto.ts  # EXTEND: visibility, coacheeStatus, list meta
│   ├── routes/classes.ts        # REWORK routes to contract
│   └── logging/AuditLogger.ts   # reused
└── __tests__/                   # classes.test.ts, classes.int.test.ts, CancellationPolicy.test.ts, GetTrainingClass/CancelTrainingClass tests
```

Frontend (Admin + Coach views, reused routes):

```text
frontend/src/
├── domain/types/class.ts        # EXTEND: ListClassesParams, ListClassesResponse, visibility/coacheeStatus
├── infrastructure/repositories/classesRepository.ts  # EXTEND: list/get/cancel
├── infrastructure/hooks/
│   ├── useListClasses.ts        # NEW
│   ├── useClassDetail.ts        # NEW
│   └── useCancelClass.ts        # NEW
└── ui/
    ├── components/ClassList.tsx         # NEW: date-range + filters + paginated list
    ├── components/ClassDetailView.tsx   # NEW: detail + cancel action
    ├── components/CancelClassDialog.tsx # NEW: scope selection for recurring classes
    └── pages/admin/CalendarPage.tsx, TodayPage.tsx   # WIRE the new views (reused for coach)
```

**Structure Decision**: Follow the existing hexagonal layering exactly — no new top-level directories, no new packages. Backend work is a rework of two routes + two new use cases + one domain service; frontend work extends the existing repo/hooks pattern and wires the existing placeholder pages (`CalendarPage`, `TodayPage`) for both Admin and Coach roles. The standalone visual calendar is US-2.5 (out of scope); this feature delivers the list/detail/cancel UI only.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

_No violations — table intentionally empty._
