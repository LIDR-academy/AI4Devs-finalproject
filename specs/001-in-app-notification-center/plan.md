# Implementation Plan: In-App Notification Center

**Branch**: `001-in-app-notification-center` | **Date**: 2026-08-24 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `/specs/001-in-app-notification-center/spec.md`

## Summary

Implement an in-app notification center that allows all users to view and manage notifications via a header bell icon. Admins and Coaches see today's notifications in a dropdown panel; Coachees access a full chronological history screen. The backend already has stub endpoints (501) and a Prisma Notification model, so the primary work is wiring up the existing persistence layer to real endpoints and building the frontend UI.

## Technical Context

**Language/Version**: TypeScript 5.7 (backend + frontend)

**Primary Dependencies**: Express 4.21, Prisma 6.2, React 18, TanStack React Query 5, Zod 3.24, Firebase Admin 14.3

**Storage**: PostgreSQL via Prisma ORM

**Testing**: Vitest (unit/integration), Supertest (API integration)

**Target Platform**: Web (PWA for Coachee), Node.js backend

**Project Type**: Web application (frontend + backend)

**Performance Goals**: GET /notifications < 200ms p95, badge updates < 2s

**Constraints**: 100 req/min rate limit, JWT auth on all endpoints, mobile-first for Coachee

**Scale/Scope**: ~500 notifications per user, 100 concurrent users, 3 user roles

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Principle | Status | Notes |
|-----------|--------|-------|
| I. Domain Purity | ✅ PASS | Notification domain logic (read status, reach calculation) stays in domain layer. No Express/Prisma imports in domain. |
| II. Test-First | ✅ PASS | Notification read/list use cases will have Given/When/Then scenarios. API endpoints will have happy-path + validation-error tests. |
| III. Security-by-Default | ✅ PASS | GET /notifications and PATCH /notifications/:id/read require JWT + role guard. No new public endpoints. |
| IV. API Contract Consistency | ✅ PASS | GET /notifications returns `{ data: [...], meta: {...} }`, PATCH returns single resource. Error format: `{ error: { code, message, ref } }`. Endpoints under `/api/v1/`. |
| V. Dependency Integrity | ✅ PASS | No new npm dependencies required. Existing packages cover all needs. |

**No violations found. No complexity tracking required.**

## Project Structure

### Documentation (this feature)

```text
specs/001-in-app-notification-center/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api-v1-notifications.md
└── tasks.md             # Phase 2 output (via /speckit.tasks)
```

### Source Code (repository root)

```text
backend/src/
├── domain/
│   ├── entities/Notification.ts          # NEW - Notification entity
│   └── ports/NotificationRepository.ts   # EXTEND - add findById, list, markAsRead
├── application/use-cases/
│   ├── ListNotifications.ts              # NEW - list with filters/pagination
│   ├── GetNotificationById.ts            # NEW - single notification
│   └── MarkNotificationAsRead.ts         # NEW - mark read
├── infrastructure/
│   ├── persistence/PrismaNotificationRepository.ts  # EXTEND - implement new methods
│   ├── routes/notifications.ts           # REPLACE - implement real endpoints
│   └── dto/notificationSchemas.ts        # EXTEND - add list/read Zod schemas
└── config/container.ts                   # EXTEND - wire new use cases

frontend/src/
├── domain/
│   ├── types/notification.ts             # EXTEND - add Notification interface, list response types
│   └── usecases/                         # NEW - use case functions
│       ├── listNotifications.ts
│       └── markNotificationAsRead.ts
├── infrastructure/
│   ├── repositories/notificationsRepository.ts  # EXTEND - add list, markAsRead API calls
│   └── hooks/
│       ├── useNotifications.ts           # NEW - TanStack Query hook for list
│       ├── useMarkNotificationAsRead.ts  # NEW - mutation hook
│       └── useUnreadCount.ts             # NEW - polling hook for badge
├── ui/
│   ├── components/NotificationBell.tsx   # REPLACE - wire to real data
│   └── pages/coachee/NotificationsPage.tsx  # REPLACE - implement real list
```

**Structure Decision**: Existing hexagonal architecture maintained. New code follows established patterns: domain ports → Prisma adapters → use cases → routes → frontend hooks → UI components.

## Complexity Tracking

No constitution violations to justify.
