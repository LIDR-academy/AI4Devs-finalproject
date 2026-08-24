# Implementation Plan: Class Lifecycle Notifications

**Branch**: `019-class-lifecycle-notifications` | **Date**: 2026-08-24 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/019-class-lifecycle-notifications/spec.md`

## Summary

Implement class lifecycle notifications (#2, #8, #12) and ensure existing notifications (#3, #7) use the full push + in-app delivery infrastructure with rendered content. The feature introduces a new `ClassLifecycleNotificationService` domain service that evaluates notification triggers for class creation, assignment, and cancellation events, determines eligible recipients, and dispatches notifications through the notification port. All notification content is rendered server-side with class type, date/time, level name, and Coach/Coachee names.

## Technical Context

**Language/Version**: TypeScript 22 LTS (Node.js)

**Primary Dependencies**: Express, Prisma, Firebase Admin SDK (FCM), Zod

**Storage**: PostgreSQL (via Prisma ORM)

**Testing**: Vitest (unit/integration), Supertest (API integration)

**Target Platform**: Linux server (backend), PWA (frontend)

**Project Type**: Web service (backend API + frontend PWA)

**Performance Goals**: Notification dispatch must not delay triggering operations; push delivery isolated via try/catch

**Constraints**: Domain layer must have zero infrastructure dependencies (Constitution I); notifications must be persisted before push delivery (FR-014); push failures must never propagate to triggering operations (FR-015, FR-016)

**Scale/Scope**: Gym scheduling app with 3 roles (Admin, Coach, Coachee); ~50-200 users; classes are 60-minute sessions

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Domain Purity | ✅ PASS | `ClassLifecycleNotificationService` will be a pure domain service depending only on ports (`NotificationRepository`, `UserRepository`, `ClassRepository`, `EnrollmentRepository`, `DeviceTokenRepository`, `NotificationSender`). No Prisma/Express/Zod imports. |
| II. Test-First | ✅ PASS | Spec provides Given/When/Then scenarios for all 5 user stories. Domain service tests will be written first (100% branch coverage). |
| III. Security-by-Default | ✅ PASS | No new API endpoints. Notifications are dispatched server-side only. No secrets in content. |
| IV. API Contract Consistency | ✅ PASS | No new API endpoints. Existing notification API unchanged. |
| V. Dependency Integrity | ✅ PASS | No new npm dependencies. Uses existing ports and adapters. |

**No violations detected. Complexity Tracking section not required.**

## Project Structure

### Documentation (this feature)

```text
specs/019-class-lifecycle-notifications/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks)
```

### Source Code (repository root)

```text
backend/
├── src/
│   ├── domain/
│   │   ├── services/
│   │   │   ├── ClassLifecycleNotificationPolicy.ts    # NEW - pure policy for notification type selection
│   │   │   └── ClassLifecycleNotificationService.ts   # NEW - domain service orchestrator
│   │   └── ports/
│   │       ├── NotificationRepository.ts              # EXISTING - reuse
│   │       ├── NotificationSender.ts                  # EXISTING - reuse
│   │       ├── UserRepository.ts                      # EXISTING - reuse
│   │       ├── ClassRepository.ts                     # EXISTING - reuse (may need new query)
│   │       ├── EnrollmentRepository.ts                # EXISTING - reuse (may need new query)
│   │       └── DeviceTokenRepository.ts               # EXISTING - reuse
│   ├── application/
│   │   └── use-cases/
│   │       ├── CreateTrainingClass.ts                 # MODIFY - hook notification dispatch after class creation
│   │       ├── CancelTrainingClass.ts                 # MODIFY - ensure notification #7 uses SendNotification
│   │       ├── CancelRecurringSeries.ts               # MODIFY - ensure notification #7 uses SendNotification
│   │       ├── CancelEnrollment.ts                    # MODIFY - ensure notification #3 uses SendNotification
│   │       └── AssignCoachToClass.ts                  # NEW or MODIFY - hook notification #12 on coach assignment
│   ├── infrastructure/
│   │   ├── persistence/
│   │   │   ├── PrismaNotificationRepository.ts        # EXISTING - reuse
│   │   │   └── PrismaDeviceTokenRepository.ts         # EXISTING - reuse
│   │   └── adapters/
│   │       └── notifications/
│   │           └── FCMNotificationAdapter.ts           # EXISTING - reuse
│   └── config/
│       └── container.ts                               # MODIFY - wire ClassLifecycleNotificationService
tests/
├── unit/
│   └── domain/
│       └── services/
│           ├── ClassLifecycleNotificationPolicy.test.ts  # NEW
│           └── ClassLifecycleNotificationService.test.ts # NEW
├── integration/
│   └── class-lifecycle-notifications.test.ts             # NEW
└── __tests__/
    └── ...                                                # Existing tests unchanged
```

**Structure Decision**: Single backend project (Option 1). The feature adds domain services, modifies existing use cases, and reuses existing infrastructure adapters. No new API endpoints are introduced.

## Complexity Tracking

No constitution violations detected. This section is empty.
