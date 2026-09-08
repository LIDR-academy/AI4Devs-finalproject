# Implementation Plan: Waiting List Automation

**Branch**: `018-waiting-list-automation` | **Date**: 2026-08-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/018-waiting-list-automation/spec.md`

## Summary

When a Coachee cancels enrollment from a group class with a waiting list, the system automatically notifies all waitlisted Coachees simultaneously and enables first-come-first-served spot claiming. The assigned Coach receives the appropriate notification (#4 if waiting list exists, #5 if not). A new domain service `ProcessWaitingListService` orchestrates the workflow behind domain ports, while a new `ClaimWaitingListSpot` use case handles the claim action. Notifications are dispatched through the existing `SendNotification` use case and `NotificationSender` port.

## Technical Context

**Language/Version**: TypeScript 5.6, Node.js 22 LTS

**Primary Dependencies**: Express, Prisma (ORM), Zod (validation), Vitest (testing), Biome (lint)

**Storage**: PostgreSQL (via Prisma)

**Testing**: Vitest (unit + integration), Supertest (API)

**Target Platform**: Linux server (backend), Web/PWA (frontend — no frontend changes in this feature)

**Project Type**: Web service (backend only — frontend notification delivery is handled by US-4.1 service worker)

**Performance Goals**: Cancellation response time with waiting list ≤ normal cancellation time + negligible overhead; notification dispatch completes within the cancellation transaction's processing budget

**Constraints**: Domain layer MUST have zero infrastructure imports (Constitution I); tests MUST be written first for domain logic (Constitution II); all API responses use standard envelope (Constitution IV)

**Scale/Scope**: Single gym scheduling app; max 4 waitlisted Coachees per class; max ~50 concurrent classes

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Domain Purity | ✅ PASS | `ProcessWaitingListService` will live in `src/domain/services/` with zero infrastructure imports; depends only on domain ports |
| II. Test-First | ✅ PASS | Domain service tests (Given/When/Then) will be written before implementation; 100% branch coverage target |
| III. Security-by-Default | ✅ PASS | Claim endpoint requires authenticated COACHEE role; no new endpoints bypass auth |
| IV. API Contract Consistency | ✅ PASS | No new endpoints; existing cancellation endpoint response is extended (additive) |
| V. Dependency Integrity | ✅ PASS | No new npm dependencies; all existing deps already pinned |

**No violations identified. No complexity tracking entries required.**

## Project Structure

### Documentation (this feature)

```text
specs/018-waiting-list-automation/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/src/
├── domain/
│   ├── entities/           # (reused) Coachee, Coach, Level
│   ├── ports/              # (reused + new) NotificationSender, NotificationRepository, DeviceTokenRepository
│   └── services/
│       ├── WaitingListPolicy.ts       # (extend) add notification types #1, #4, #5, #6
│       └── ProcessWaitingListService.ts  # (new) domain service for waiting-list automation
├── application/
│   └── use-cases/
│       ├── CancelEnrollment.ts    # (modify) invoke ProcessWaitingListService after cancellation
│       ├── ClaimWaitingListSpot.ts  # (new) use case for waitlisted Coachee claiming a spot
│       └── SendNotification.ts    # (reused) dispatches notifications through ports
├── infrastructure/
│   ├── adapters/             # (reused) Prisma repos, FCM sender
│   └── routes/               # (modify) add POST /classes/:id/waiting-list/claim route
└── config/
    └── container.ts          # (modify) register ProcessWaitingListService + ClaimWaitingListSpot
```

**Structure Decision**: Single backend project with Hexagonal Architecture. The new domain service and use case fit the existing layered structure. No new projects or packages needed.

## Complexity Tracking

> No constitution violations to justify.
