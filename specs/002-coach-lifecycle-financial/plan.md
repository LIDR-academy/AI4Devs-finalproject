# Implementation Plan: Coach Lifecycle & Financial Data

**Branch**: `002-coach-lifecycle-financial` | **Date**: 2026-07-15 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/002-coach-lifecycle-financial/spec.md`

## Summary

Admin can create, list, view, update, activate/deactivate Coaches, with encrypted financial data (bank account, SSN, DNI) stored via AES-256-GCM. Financial data is isolated to a dedicated `GET /coaches/:id/financial` endpoint with audit logging.

## Technical Context

**Language/Version**: Node.js 22 LTS (TypeScript 5.7)

**Primary Dependencies**: Express 4.x, Prisma ORM, PostgreSQL 16, React 18, TanStack React Query 5, Axios

**Storage**: PostgreSQL (via Prisma ORM — parameterized queries only, no raw SQL)

**Testing**: Vitest + Supertest (unit/integration), Playwright (E2E), Biome (lint/format)

**Target Platform**: Web — backend REST API (`/api/v1/`), React SPA frontend

**Project Type**: Web application (backend + frontend) following Hexagonal Architecture (Ports & Adapters)

**Performance Goals**: Coach list paginated response < 2s for up to 1,000 coaches; financial endpoint response < 1s

**Constraints**: Financial data at rest MUST be encrypted; financial data MUST NOT appear in list/profile endpoints; financial endpoint access MUST be audited; class duration ALWAYS 60 minutes; gym capacity max 2 individual + 1 group simultaneous

**Scale/Scope**: Single-gym operation; 3 roles (Admin, Coach, Coachee)

## Constitution Check

*GATE: Passes — Constitution v1.0.0 loaded. All principles respected: Domain Purity (I), Test-First (II), Security-by-Default (III), API Contract Consistency (IV), Dependency Integrity (V). No violations.*

## Project Structure

### Documentation (this feature)

```text
specs/002-coach-lifecycle-financial/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
├── checklists/          # Spec quality checklists
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── domain/
│   │   ├── entities/
│   │   │   └── Coach.ts             # Coach domain entity
│   │   ├── ports/
│   │   │   ├── CoachRepository.ts   # Repository interface
│   │   │   └── EncryptionService.ts # Encryption interface
│   │   └── services/
│   │       └── CoachService.ts      # Domain business logic
│   ├── application/
│   │   └── usecases/
│   │       ├── CreateCoach.ts
│   │       ├── FindCoaches.ts
│   │       ├── GetCoachById.ts
│   │       ├── UpdateCoach.ts
│   │       ├── ToggleCoachStatus.ts
│   │       └── GetCoachFinancialData.ts
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   └── PrismaCoachRepository.ts
│   │   ├── encryption/
│   │   │   └── Aes256GcmEncryptionService.ts
│   │   ├── auth/
│   │   │   └── AuthMiddleware.ts
│   │   ├── routes/
│   │   │   └── coaches.ts
│   │   └── logging/
│   │       └── AuditLogger.ts
│   ├── config/
│   │   └── container.ts             # DI wiring
│   └── __tests__/
│       ├── coaches.test.ts          # Integration tests
│       └── encryption.test.ts       # Encryption unit tests

frontend/
├── src/
│   ├── domain/
│   │   ├── types/
│   │   │   └── coach.ts
│   │   └── usecases/
│   │       ├── findCoaches.ts
│   │       ├── createCoach.ts
│   │       ├── getCoachById.ts
│   │       ├── updateCoach.ts
│   │       ├── toggleCoachStatus.ts
│   │       └── getCoachFinancialData.ts
│   ├── infrastructure/
│   │   ├── repositories/
│   │   │   └── coachesRepository.ts
│   │   └── hooks/
│   │       ├── useFindCoaches.ts
│   │       ├── useCreateCoach.ts
│   │       ├── useCoach.ts
│   │       ├── useUpdateCoach.ts
│   │       └── useToggleCoachStatus.ts
│   └── ui/
│       └── pages/
│           └── admin/
│               ├── CoachesPage.tsx
│               ├── CoachDetailPage.tsx
│               └── CoachFinancialDataPage.tsx
```

**Structure Decision**: Follows established Hexagonal Architecture (backend) and 3-layer Ports & Adapters (frontend) patterns from existing coachee implementation.

## Complexity Tracking

> No Constitution violations to justify.
