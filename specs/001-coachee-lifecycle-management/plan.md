# Implementation Plan: Coachee Lifecycle Management

**Branch**: `001-coachee-lifecycle-management` | **Date**: 2026-07-13 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/001-coachee-lifecycle-management/spec.md`

## Summary

Admin users can add, view, update, filter, and manage Coachee profiles (create, list with pagination/filters, view detail, partial update, activate/deactivate, change level). Coachees are `User` records with `role = COACHEE`. All coachee endpoints except `POST /coachees` and `PATCH /coachees/:id/status` are also accessible to Coaches. Financial data is never exposed.

## Technical Context

**Language/Version**: TypeScript (Node.js 22 LTS)

**Primary Dependencies**: Express, Prisma, Zod, bcrypt, jsonwebtoken

**Storage**: PostgreSQL (via Prisma ORM)

**Testing**: Vitest + Supertest (integration), Vitest (unit)

**Target Platform**: Linux server (backend API), web browsers (frontend SPA)

**Project Type**: Web application (REST API + React SPA)

**Performance Goals**: List endpoint responds within 2 seconds for up to 10,000 coachees

**Constraints**: Hexagonal architecture — domain layer MUST NOT import Express/Prisma/Zod; `requireRole('ADMIN')` guard on Admin-only endpoints; standard error envelope `{ error: { code, message, ref } }`; API prefix `/api/v1/`

**Scale/Scope**: This feature — 6 REST endpoints for Coachee CRUD + lifecycle management

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Assessment | Status |
|-----------|-----------|--------|
| **I. Domain Purity** | Coachee domain entity + domain service in `src/domain/`. No Express/Prisma/Zod imports. | ✅ PASS |
| **II. Test-First** | Spec already has Given/When/Then. Tests must be written before implementation (Red-Green-Refactor). 100% branch coverage on domain service. Each endpoint needs happy-path + validation-error via Supertest. | ✅ PASS |
| **III. Security-by-Default** | `requireRole('ADMIN')` on POST and PATCH status. `requireRole('ADMIN', 'COACH')` on GET, GET/:id, PUT, PATCH level. JWT auth on all. No financial data exposed. | ✅ PASS |
| **IV. API Contract Consistency** | Standard envelopes: list returns `{ data: [...], meta: {...} }`, single resources returned directly, errors use `{ error: { code, message, ref } }`. All under `/api/v1/`. Must be documented in `docs/api-specifications.md` (done). | ✅ PASS |
| **V. Dependency Integrity** | All deps pinned. No raw SQL (Prisma parameterized). Lockfile committed. | ✅ PASS |
| **Security: Error handling** | No stack traces, no info leakage, standard error codes. | ✅ PASS |
| **Security: Event logging** | Coachee creation, update, status change, level change MUST be logged with actor ID, action, resource, outcome. | ✅ PASS |
| **Performance: Gym capacity** | Not applicable (no class scheduling in this feature). | N/A |

**Gate decision**: ✅ PASS — No violations. Proceed to Phase 0.

## Project Structure

### Documentation (this feature)

```text
specs/001-coachee-lifecycle-management/
├── spec.md              # Feature specification
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── config/
│   │   └── container.ts          # DI container (wires use cases → repos)
│   ├── domain/
│   │   ├── entities/
│   │   │   ├── Coachee.ts        # Pure TS entity — Coachee domain object
│   │   │   └── Level.ts          # Pure TS entity — Level value object / ref
│   │   ├── ports/
│   │   │   └── CoacheeRepository.ts  # Repository interface (port)
│   │   └── services/
│   │       └── CoacheeService.ts     # Domain service — business rules
│   ├── application/
│   │   └── use-cases/
│   │       ├── CreateCoachee.ts       # Orchestrates creation
│   │       ├── ListCoachees.ts        # Orchestrates list + pagination
│   │       ├── GetCoachee.ts          # Orchestrates single fetch
│   │       ├── UpdateCoachee.ts       # Orchestrates partial update
│   │       ├── UpdateCoacheeStatus.ts # Orchestrates activate/deactivate
│   │       └── UpdateCoacheeLevel.ts  # Orchestrates level change + notification
│   └── infrastructure/
│       ├── persistence/
│       │   └── PrismaCoacheeRepository.ts  # Prisma adapter (implements port)
│       └── routes/
│           └── coachees.ts               # Route handlers (update existing stubs)
├── prisma/
│   └── schema.prisma                    # Already complete with User model
└── src/__tests__/                        # Integration tests
    └── coachees.test.ts

frontend/
└── src/
    └── pages/
        └── admin/
            ├── CoacheesPage.tsx          # List + filters (update placeholder)
            ├── CoacheeDetailPage.tsx     # Profile detail + edit
            └── CreateCoacheePage.tsx     # Creation form
```

**Structure Decision**: Backend hexagonal architecture with domain/application/infrastructure layers. Frontend React pages under admin/ for the admin-facing views. Coachee management is purely Admin/Coach-facing — no new Coachee-role pages needed.

## Complexity Tracking

No constitution violations — no complexity tracking needed.

---

## Phase 0: Outline & Research

### Unknowns

No NEEDS CLARIFICATION items — the feature spec, API contract, and constitution are fully explicit for this feature. All technical decisions are determined by the existing project conventions:

| Aspect | Decision | Source |
|--------|----------|--------|
| Coachee = User with role COACHEE | Yes — Prisma schema already models this | `schema.prisma` |
| Auth/role guards | `requireRole('ADMIN')` on POST + PATCH status; `requireRole('ADMIN', 'COACH')` on others | `docs/api-specifications.md` |
| Password on creation | Auto-generated random password, hashed with bcrypt cost 12 | API spec ambiguity note |
| Notification on level change | Notification #11 via notification system (EP-04) | `docs/api-specifications.md` |
| Financial data exclusion | Never include bank_account, ssn, dni in responses | FR-011 + API spec |

No research needed — proceed directly to Phase 1.

## Phase 1: Design & Contracts

### Data Model → [data-model.md](./data-model.md)

### Interface Contracts → [contracts/](./contracts/)

### Quickstart Guide → [quickstart.md](./quickstart.md)
