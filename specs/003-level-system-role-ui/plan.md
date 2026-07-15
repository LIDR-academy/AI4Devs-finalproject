# Implementation Plan: Level System & Role-Based UI

**Branch**: `003-level-system-role-ui` | **Date**: 2026-07-15 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/003-level-system-role-ui/spec.md`

## Summary

Level system (5 immutable seeded levels, Admin/Coach can assign to Coachees with audit logging) + Role-based UI (Admin sidebar, Coach sidebar without Coaches, Coachee bottom nav, responsive, unauthorized redirects, notification bell placeholder). Majority of backend (Level entity, Prisma model, seed, GET /levels, PATCH /coachees/:id/level, UpdateCoacheeLevel use case) and frontend (all 3 layouts, routing, ProtectedRoute, level assignment UI in AdminCoacheeDetailPage) are already implemented. Remaining gaps: AuditLogger integration in UpdateCoacheeLevel, missing Coach coachee detail page, CoachCoacheesPage navigation bug, Coachee level display on HomePage, missing tests for levels.

## Technical Context

**Language/Version**: TypeScript (Node.js 22 LTS)

**Primary Dependencies**: Express, Prisma, React 18, Vite, TanStack React Query v5, React Router v6, TailwindCSS v4

**Storage**: PostgreSQL via Prisma ORM

**Testing**: Vitest + Supertest (backend integration), Vitest (unit)

**Target Platform**: Web (desktop for Admin/Coach, mobile-first for Coachee)

**Project Type**: Web application (backend + frontend)

**Performance Goals**: Level change reflected in Coachee UI within 2s; unauthorized redirect under 1s (from spec SC-003, SC-007)

**Constraints**: Constitution: no raw SQL, security-by-default (requireRole guards), all error responses use `{ error: { code, message, ref } }`, class durations always 60 minutes, fixed 5 immutable levels

**Scale/Scope**: 5 fixed levels, 3 roles (Admin/Coach/Coachee)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Domain purity (zero infra deps in domain) | ✅ Pass | Level entity is pure, no Prisma/Express imports |
| Test-first domain logic | ⚠️ Gap | UpdateCoacheeLevel use case exists with tests, but audit logging integration not tested |
| Security-by-default | ✅ Pass | All endpoints use authenticate + requireRole guards |
| API contract consistency | ✅ Pass | All responses use standard envelope or direct resource; PATCH /coachees/:id/level returns `{ id, level: { id } }` |
| Dependency integrity | ✅ Pass | No new dependencies needed |
| Audit logging for role/level changes | ⚠️ Gap | UpdateCoacheeLevel uses logger.info but does not call AuditLogger.log() to write to SecurityAuditLog |
| Level immutability | ✅ Pass | No create/update/delete routes for levels; FR-001 explicitly states immutable |
| Coach scope = all Coachees | ✅ Pass | PATCH /coachees/:id/level uses `requireRole(ADMIN, COACH)` — no ownership filter |

**Violations**: None. Only gaps — audit logging integration (minor).

## Complexity Tracking

No constitutional violations to justify. All work fits within existing project structure.

## Project Structure

### Documentation (this feature)

```text
specs/003-level-system-role-ui/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── application/use-cases/
│   │   └── UpdateCoacheeLevel.ts         # Inject AuditLogger
│   └── __tests__/
│       └── coachees.test.ts              # Add level tests

frontend/
├── src/
│   ├── ui/pages/
│   │   ├── admin/
│   │   │   └── CoacheeDetailPage.tsx     # Already complete
│   │   ├── coach/
│   │   │   ├── CoacheesPage.tsx          # Fix navigation bug
│   │   │   └── CoacheeDetailPage.tsx     # New: coach coachee detail with level assignment
│   │   └── coachee/
│   │       └── HomePage.tsx              # Add level display
│   ├── ui/components/layouts/
│   │   ├── AdminLayout.tsx               # Already complete
│   │   ├── CoachLayout.tsx               # Already complete
│   │   └── CoacheeLayout.tsx             # Already complete
│   └── infrastructure/routes/
│       └── App.tsx                       # Add coach coachee detail route
```

**Structure Decision**: Web application (backend + frontend). Follows existing hexagonal architecture in `backend/src/` with domain, application, infrastructure layers. Frontend follows existing patterns with `ui/pages/`, `ui/components/`, `infrastructure/hooks/`, `infrastructure/routes/`.
