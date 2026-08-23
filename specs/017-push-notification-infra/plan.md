# Implementation Plan: Push Notification Infrastructure

**Branch**: `017-push-notification-infra` | **Date**: 2026-08-21 | **Spec**: [spec.md](./spec.md)

**Input**: Feature specification from `/specs/017-push-notification-infra/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command. See `.specify/templates/plan-template.md` for the execution workflow.

## Summary

US-4.1 (COACHER-25, epic EP-04). Delivers the **plumbing layer** for all future notifications — no business triggers yet (those are US-4.2/4.3/4.4):

- **Domain ports** `NotificationSender`, `NotificationRepository`, `DeviceTokenRepository` in `src/domain/ports/` (provider-free, CalendarProvider-style interfaces) — zero FCM concepts leak into the domain (Constitution §I).
- **FCM adapter** (`FCMNotificationAdapter`) using Firebase Admin SDK (`messaging().send()` / `sendEachForMulticast()` — HTTP v1 protocol; legacy APIs are dead since 2024-06), initialized **optionally** exactly like `GoogleCalendarAdapter`: missing `FIREBASE_SERVICE_ACCOUNT_PATH` ⇒ adapter is `null` and the API starts fine (existing graceful-degradation pattern, `container.ts:61-73`).
- **Orchestration** `SendNotification` use case (application layer): persist first (spec FR-008), then fan out to every active device token; **never throws**, logs every delivery failure with recipient/type/cause (spec FR-010), deactivates tokens reported permanently invalid (`messaging/registration-token-not-registered`) (spec FR-011).
- **Endpoint** `POST /notifications/device-token` (the route file + 501 stubs already exist at `routes/notifications.ts`): JWT-authenticated, all three roles, strict Zod payload, idempotent upsert — same token re-registered updates ownership (latecomer-wins reassignment, spec FR-005). Contract added to `docs/api-specifications.md` **before** implementation (Constitution §IV).
- **Persistence**: `Notification` Prisma model **already exists** (schema lines 192-204: `notification_type Int 1-12` catalog, recipient, nullable class, content, `is_read`, timestamps) — reused unchanged. New migration adds `DeviceToken` (unique token, owner, platform, `is_active`) + `User.deviceTokens[]`.
- **Frontend**: Firebase JS SDK (modular, **lazy-imported** only inside the push module), permission asked once after login on an authenticated screen (decline ⇒ 30-day localStorage cooldown, app fully usable — spec FR-006), token posted to the new endpoint; `vite-plugin-pwa` **stays in `generateSW` mode** — push handling is added via `workbox.importScripts: ['/service-worker/push.js']`, a tiny native `push`/`notificationclick` listener pair that parses `event.data.json()` and calls `showNotification` (no gstatic CDN `importScripts`, nothing extra in the main bundle, CSP untouched — PRD §10 already allows `connect-src` FCM).
- **Out of scope** (later stories, per spec Assumptions): concrete triggers (#1–#12 wiring), in-app inbox UI, `GET /notifications` / `PATCH /notifications/:id/read` (stay 501 stubs until US-4.5), retry queue, iOS/native platforms.

## Technical Context

**Language/Version**: TypeScript 5.7 + Node.js 22 (ESM) backend; TypeScript 5.7 + React 18.3 + Vite 6 frontend.

**Primary Dependencies**: Express 4, Prisma 6.2.1, Zod 3.24, pino (all existing, unchanged). **New runtime deps (pinned EXACT per Constitution §V)**: `firebase-admin` (v13 line — current stable at implementation time, exact pin recorded in `package.json`) on the backend; `firebase` (v11/12 line, current stable, exact pin) on the frontend — page-side modules only (`firebase/app`, `firebase/messaging`), dynamically imported so it never enters the initial bundle.

**Storage**: PostgreSQL via Prisma. One migration (`add_device_tokens`): new `DeviceToken` model + back-relation on `User`. `Notification` model already exists and is reused verbatim.

**Testing**: Vitest + Supertest (backend: adapter unit tests with mocked `firebase-admin/messaging`, `SendNotification` orchestration/failure-isolation tests, route integration tests incl. validation-error case per Constitution §II); Vitest (frontend: `pushManager` flow logic with mocked firebase module + mocked repository; jsdom component test for the permission-prompt UX if rendered as a component).

**Target Platform**: Web (PWA installable, mobile-first Coachee experience); backend deployed on Render.

**Performance Goals**: Dispatch is fire-and-forget — triggering operations gain no user-visible latency beyond a negligible scheduling overhead (spec SC-008); delivery to active valid devices within 10 s under normal conditions (spec SC-004).

**Constraints**:
- **Failure isolation (NON-NEGOTIABLE, spec FR-010)**: `SendNotification` catches everything; callers get `void`. A provider outage cannot fail a booking/cancellation.
- Persist-before-dispatch ordering (spec FR-008): the durable record exists even if the provider call never happens.
- Adapter optionality mirrors calendar: unset env ⇒ `null` adapter ⇒ sends become logged no-ops (dev environments start clean, `docs/setup.md` behavior preserved).
- Strict Zod (`.strict()`) on the registration body; unknown fields rejected; invalid attempts logged as security events via `AuditLogger` (Constitution §III, spec FR-014).
- Secrets (`FIREBASE_SERVICE_ACCOUNT_PATH`, VAPID private material) env-only; Firebase web config values are public-by-design but still injected via `VITE_*` env vars, never hardcoded.
- Legacy `FCM_SERVER_KEY` env var **removed** (legacy FCM API shut down June 2024; HTTP v1 requires OAuth service-account auth — see research D2).
- Standard error envelope `{ error: { code, message, ref } }`; no stack traces (existing `error-handler.ts`).
- No raw SQL; Prisma parameterized access only.

**Scale/Scope**: Single gym, tens of users, a handful of devices per user. One new endpoint, two Prisma models touched (one new), one new SW script (~40 lines), one lazy frontend module. No UI screens built (permission prompt is browser-native + a thin in-app affordance hook).

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| # | Principle | Gate | Status |
|---|-----------|------|--------|
| G1 | Domain Purity (NON-NEGOTIABLE) | `NotificationSender`, `NotificationRepository`, `DeviceTokenRepository` ports + their DTO types are pure TS interfaces in `src/domain/ports/` (no FCM/Express/Zod/Prisma imports). FCM specifics confined to `infrastructure/adapters/notifications/FCMNotificationAdapter.ts`. | PASS |
| G2 | Test-First for Domain Logic | Spec has Given/When/Then scenarios. Tasks ordered red-first: adapter mapping tests, `SendNotification` persist-before-dispatch + never-throws + stale-token-deactivation branches (100% branch coverage), endpoint integration happy-path + validation-error via Supertest, frontend flow tests. | PASS |
| G3 | Security-by-Default | `authenticate` + `requireRole(UserRole.ADMIN, UserRole.COACH, UserRole.COACHEE)` middleware on the new endpoint; `.strict()` Zod body; invalid-payload attempts audited through `AuditLogger`; credentials via env only; standard envelope errors, no internals leaked. | PASS |
| G4 | API Contract Consistency | `POST /notifications/device-token` documented in `docs/api-specifications.md` (endpoint section + summary table) as an explicit early task before implementation; response shapes follow envelope rules; `/api/v1` prefix preserved. | PASS |
| G5 | Dependency Integrity | New deps `firebase-admin` / `firebase` pinned to exact versions; lockfile committed; PR gate `npm audit --audit-level=high`; no raw SQL introduced. | PASS |

No gate violations. `Complexity Tracking` table intentionally empty.

**Post-design re-check (after Phase 1)**: PASS — research D1–D8 kept provider code behind the domain ports (G1); the design adds no business rules outside domain/application layers (G1/G2); endpoint contract written to match `docs/api-specifications.md` conventions exactly (G4); the only new dependencies are the two Firebase packages, pinned exact, both officially maintained (G5); failure-isolation and audit-logging behaviors are explicit, testable branches (G3). No violations to justify.

## Project Structure

### Documentation (this feature)

```text
specs/017-push-notification-infra/
├── plan.md              # This file (/speckit.plan command output)
├── research.md          # Phase 0 output — key design decisions D1–D8
├── data-model.md        # Phase 1 output — Notification (existing) + DeviceToken (new)
├── quickstart.md        # Phase 1 output — end-to-end validation guide
├── contracts/           # Phase 1 output — API + push-payload/frontend contracts
│   ├── api.md
│   └── frontend-push.md
└── tasks.md             # Phase 2 output (/speckit.tasks command - NOT created by /speckit.plan)
```

### Source Code (repository root)

Web application (backend + frontend). Existing hexagonal layout reused; additions marked:

```text
backend/
├── prisma/
│   ├── schema.prisma                                  # EXTEND: DeviceToken model + User.deviceTokens[]
│   └── migrations/<ts>_add_device_tokens/             # NEW migration
└── src/
    ├── domain/ports/
    │   ├── NotificationSender.ts                      # NEW port: send(toDeviceTokens) — provider-free types
    │   ├── NotificationRepository.ts                  # NEW port: create/read-status persistence
    │   └── DeviceTokenRepository.ts                   # NEW port: upsert/list-active/deactivate
    ├── application/use-cases/
    │   └── SendNotification.ts                        # NEW orchestrator: persist → fan-out → log, never throws
    ├── infrastructure/
    │   ├── adapters/notifications/
    │   │   └── FCMNotificationAdapter.ts              # NEW: Admin SDK init from SA path; send/sendEachForMulticast;
    │   │                                              #      maps messaging/registration-token-not-registered → deactivate
    │   ├── persistence/
    │   │   ├── PrismaNotificationRepository.ts         # NEW
    │   │   └── PrismaDeviceTokenRepository.ts         # NEW
    │   ├── routes/
    │   │   └── notifications.ts                       # EXTEND: POST /notifications/device-token (GET/PATCH stay 501 stubs)
    │   └── dto/
    │       └── notificationSchemas.ts                 # NEW: Zod .strict() registration schema
    └── config/
        ├── env.ts                                     # EXTEND: +FIREBASE_SERVICE_ACCOUNT_PATH, −FCM_SERVER_KEY
        └── container.ts                               # EXTEND: optional fcm wiring (calendarProvider precedent)
```

```text
frontend/
├── public/
│   └── service-worker/
│       └── push.js                                    # NEW: native push + notificationclick handlers (event.data.json())
├── vite.config.ts                                     # EXTEND: workbox.importScripts: ["/service-worker/push.js"]
└── src/
    ├── domain/types/notification.ts                   # NEW: shared DTO types (device registration payload)
    ├── infrastructure/
    │   ├── notifications/
    │   │   ├── firebaseClient.ts                      # NEW: lazy init (dynamic import firebase/app+messaging), VAPID from env
    │   │   └── pushManager.ts                         # NEW: permission flow (post-login timing, 30-day decline cooldown),
    │   │                                              #      getToken → notificationsRepository.registerDeviceToken
    │   ├── repositories/
    │   │   └── notificationsRepository.ts             # NEW: registerDeviceToken() → POST /notifications/device-token
    │   └── hooks/
    │       └── usePushRegistration.ts                 # NEW: mount-once hook for the authenticated layout
    └── ui/components/layouts/                         # EXTEND: mount usePushRegistration in the authenticated layout
```

Tests colocated per existing convention (`backend/src/__tests__/`, `*.test.ts` beside sources on the frontend).

**Structure Decision**: Follow the established hexagonal layering exactly — ports in `src/domain/ports/`, orchestration in `src/application/use-cases/`, provider + persistence adapters under `src/infrastructure/`, DI wiring in `config/container.ts` using the proven optional-adapter pattern. Frontend follows its own layering: lazy infra module (`infrastructure/notifications/`), thin repository, presentation-free hook mounted by the layout. No new top-level packages; the only build-config change is one `workbox.importScripts` entry keeping `generateSW` intact.

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

_No violations — table intentionally empty._
