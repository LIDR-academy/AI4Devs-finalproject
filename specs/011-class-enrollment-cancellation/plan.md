# Implementation Plan: Class Enrollment & Cancellation

**Branch**: `011-class-enrollment-cancellation` | **Date**: 2026-08-18 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/011-class-enrollment-cancellation/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

US-3.1 (COACHER-21). Coachees self-join and cancel group classes so they can manage their own attendance. The two enrollment endpoints already exist as `501 NOT_IMPLEMENTED` stubs in `backend/src/infrastructure/routes/classes.ts`; this feature implements them:

- `POST /classes/:id/enrollment` — Coachee joins an ACTIVE group class; validates capacity (max 4), level reach (±1), no overlap with another enrolled class, and not-already-enrolled; Coachee identity comes from the JWT, never the body. Rejects `CLASS_FULL`, `LEVEL_MISMATCH`, `OVERLAP_DETECTED`, `ALREADY_ENROLLED`, and validation rejections for individual/canceled classes.
- `DELETE /classes/:id/enrollment` — the enrolled Coachee cancels their own attendance (group join or assigned individual) with no penalties; the `ClassEnrollment` row is deleted, the freed spot is detected for waiting-list processing (auto-processing remains EP-04), and the assigned Coach gets a recorded notification row (types 3/4/5).

All join/cancellation business rules live in a new pure domain service `EnrollmentPolicy` (Constitution §I/II). No Prisma schema changes, no new dependencies. Frontend: repository + hooks for the two endpoints, plus a reusable Coachee `ClassCard` surface with Join / Cancel / waiting-list-option actions, confirmation dialogs, and per-error-code user-friendly toasts wired into the existing `CoacheeHomePage`.

## Technical Context

**Language/Version**: Node.js 22 LTS + TypeScript (backend); React 18 + Vite + TypeScript (frontend)

**Primary Dependencies**: Backend — Express, Prisma, Zod (all pinned). Frontend — React Router v6, TanStack React Query v5, TailwindCSS v4

**Storage**: PostgreSQL via Prisma — **no schema changes or migrations**. `ClassEnrollment` (`class_id`, `coachee_id`, `joined_at`, `@@unique([class_id, coachee_id])`) already models the feature; `WaitingList`, `Notification`, `SecurityAuditLog`, `TrainingClass`, `Level`, `User` are all existing models

**Testing**: Vitest + Supertest (backend unit/integration); Vitest (frontend). No Playwright config present today

**Target Platform**: Web application (SPA + REST API under `/api/v1/`)

**Project Type**: Web application (frontend + backend, hexagonal backend)

**Performance Goals**: Join and cancel complete and reflect on the class card within 1 second; class list rendering stays responsive at expected volumes (dozens of classes/week)

**Constraints**:
- Class duration is ALWAYS 60 minutes (hard invariant). Group capacity = 4 (`GROUP_MAX_COACHEES`); individual = 1
- Level reach = coachee level, one above, or one below (`ReachCalculator.isWithinReach`)
- Coachee cannot be in two classes at the same time (reuse `OverlapChecker.hasOverlap`)
- Coachee identity MUST come from the authenticated session (JWT) — no coachee ID in the request body
- Both endpoints guarded by `authenticate` + `requireRole(UserRole.COACHEE)`; non-Coachee → `403 FORBIDDEN`
- Error envelope `{ error: { code, message, ref } }`; Zod request schemas use `.strict()`; no stack traces
- Domain purity (Constitution §I): capacity/overlap/reach/already-enrolled/individual-rejection rules live in `src/domain/services/EnrollmentPolicy.ts` — zero Prisma/Express/Zod imports in `src/domain/`
- Security event logging: every successful AND denied join/cancel writes a `SecurityAuditLog` row (actor, action, class, outcome)
- Times stored as UTC instants; wall-clock in `Europe/Madrid` (existing helpers; not directly used by these endpoints since they operate on class ids)
- No waiting-list auto-promotion, no FCM dispatch (both EP-04); this release detects the opened spot and records the Coach notification rows only
- All dependencies pinned; no raw SQL (Prisma parameterized queries only)

**Scale/Scope**: Single gym, dozens of classes/week; endpoints implemented, tests, and the Coachee class-card actions surface; no migration, no new external dependencies

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Gate | Status |
|---|-----------|------|--------|
| G1 | Domain Purity (NON-NEGOTIABLE) | New `EnrollmentPolicy` domain service encapsulates capacity-full, level-reach, overlap, already-enrolled, individual/canceled rejection and cancel-ownership rules — pure TypeScript, zero Prisma/Express/Zod imports in `src/domain/` | PASS |
| G2 | Test-First for Domain Logic | Acceptance scenarios already specified in `spec.md` (Given/When/Then). `EnrollmentPolicy.test.ts` written and failing before production code; 100% branch coverage on the policy; both endpoints have happy-path + each validation-error Supertest test; race-condition (FR-019) covered by an integration test | PASS |
| G3 | Security-by-Default | Both endpoints `authenticate` + `requireRole(COACHEE)`; JWT-derived identity only; `.strict()` Zod; `403` for non-Coachee; `SecurityAuditLog` on every success and denial; no stack traces; error contract respected | PASS |
| G4 | API Contract Consistency | Responses follow `docs/api-specifications.md` §`POST/DELETE /classes/:id/enrollment`; error codes `CLASS_FULL`, `LEVEL_MISMATCH`, `OVERLAP_DETECTED`, `ALREADY_ENROLLED`, `FORBIDDEN`, `NOT_FOUND`, `VALIDATION_ERROR`; single-resource responses returned directly; errors use the standard envelope | PASS |
| G5 | Dependency Integrity | No new dependencies; existing ones already pinned to exact versions | PASS |

No gate violations. `Complexity Tracking` table intentionally empty.

## Project Structure

### Documentation (this feature)

```text
specs/011-class-enrollment-cancellation/
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
├── config/container.ts                       # DI — register JoinTrainingClass + CancelEnrollment (+ EnrollmentPolicy)
├── application/use-cases/
│   ├── JoinTrainingClass.ts                  # NEW: POST /classes/:id/enrollment flow
│   └── CancelEnrollment.ts                   # NEW: DELETE /classes/:id/enrollment flow
├── domain/services/
│   └── EnrollmentPolicy.ts                   # NEW: pure domain rules (join validation, cancel ownership, notification type, opened-spot detect)
├── infrastructure/
│   ├── routes/classes.ts                     # REPLACE the two 501 stubs with real handlers
│   └── logging/AuditLogger.ts                # reused
└── __tests__/
    ├── EnrollmentPolicy.test.ts              # NEW (Red-Green, 100% branch)
    ├── JoinTrainingClass.test.ts             # NEW
    ├── CancelEnrollment.test.ts              # NEW
    ├── classes.enrollment.int.test.ts        # NEW: Supertest both endpoints (happy + every error)
    └── (existing classes.test.ts etc. unchanged)
```

Frontend (Coachee surface, wired into existing pages):

```text
frontend/src/
├── domain/types/class.ts                     # EXTEND: EnrollResponse, CancelEnrollmentResponse
├── domain/utils/                              # NEW: classCardState.ts — pure mapping from visibility/coacheeStatus/capacity to card action
├── infrastructure/repositories/classesRepository.ts  # EXTEND: join(id), cancelEnrollment(id)
├── infrastructure/hooks/
│   ├── useJoinClass.ts                       # NEW
│   └── useCancelEnrollment.ts                # NEW
│   └── (useListClasses / useClassDetail reused)
└── ui/
    ├── components/CoacheeClassCard.tsx       # NEW: Join/Cancel/waiting-list action per state + confirmation
    ├── components/EnrollmentActions.tsx      # NEW (optional split): the action buttons + dialogs
    ├── components/CoacheeClassList.tsx       # NEW: minimal list hosting the cards (HomePage/CalendarPage)
    └── pages/coachee/HomePage.tsx            # WIRE real card list into "Joinable Classes" area
```

**Structure Decision**: Follow the existing hexagonal layering and the existing repo/hooks/component patterns exactly — no new top-level directories, no new packages. Backend work replaces two stubbed routes and adds two use cases plus one pure domain service; frontend work adds two repository methods, two hooks, and a small Coachee card surface. The full Coachee calendar view (colored blocks, waiting-list join flow) belongs to the Coachee self-service timeline and is out of scope here; only the card surface required to host Join/Cancel actions is built.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

_No violations — table intentionally empty._