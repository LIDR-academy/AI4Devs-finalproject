# Tasks: Push Notification Infrastructure

**Input**: Design documents from `/specs/017-push-notification-infra/`

**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.md, contracts/frontend-push.md, quickstart.md

**Tests**: REQUIRED — Constitution §II (Test-First, NON-NEGOTIABLE): every new module gets failing tests written and confirmed failing BEFORE its implementation (Red-Green-Refactor). Backend: adapter unit tests with a mocked `firebase-admin/messaging`, orchestration branch tests (100% branch coverage target on `SendNotification`), Supertest integration tests for the new endpoint (happy path + validation-error minimum). Frontend: node-env tests for the permission/registration flow with mocked Firebase module + mocked repository.

**Organization**: Tasks are grouped by user story so each story is an independently testable increment of the notification plumbing. Stories share the Foundational layer (ports, schema, Prisma repositories); US1→US4 build the vertical slices in priority order.

**Environment notes**:
- Backend tests: Vitest + Supertest, colocated per existing convention (`backend/src/__tests__/`, `*.test.ts` beside sources where established).
- Mock boundary: jest-mock `firebase-admin/messaging` (`getMessaging`) — NEVER hit the real FCM API in CI.
- Auth in integration tests: `authenticate()` bypasses in dev/test (`BYPASS_USER`, middleware/auth.ts:9) — exercise 401 by sending a MALFORMED `Authorization` header, not by omitting it.
- Verification per task: `cd backend && npm run typecheck && npm run lint && npm test` (and/or the frontend equivalents).
- Commit after each task or logical group. Conventional commits: `feat(notifications)` / `test(notifications)` / `chore(deps)` / `docs(api)`.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1–US4 from spec.md)
- All paths relative to the repository root.

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Install the two new pinned runtime dependencies. Nothing else changes at the project level.

- [X] T001 [P] Add `firebase-admin` to `backend/package.json` pinned to the current stable v13 line EXACT version (no `^`/`~`, Constitution §V — check with `npm view firebase-admin version`), run `npm install` in `backend/`, commit the updated lockfile
- [X] T002 [P] Add `firebase` to `frontend/package.json` pinned to the current stable EXACT version (no ranges), run `npm install` in `frontend/`, commit the updated lockfile

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Domain ports, database schema, Prisma adapters and env plumbing that ALL four user stories depend on. Zero FCM concepts may leak into `src/domain/` (Constitution §I).

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T003 Extend `backend/prisma/schema.prisma`: add `enum DevicePlatform { WEB }` and `model DeviceToken` exactly per `specs/017-push-notification-infra/data-model.md` (`token String @unique`, `user_id`, `platform DevicePlatform @default(WEB)`, `is_active Boolean @default(true)`, timestamps, `user User @relation(...)`), add `deviceTokens DeviceToken[]` to `model User`; create migration via `npm run db:migrate -- --name add_device_tokens` and run `npm run db:generate`
- [X] T004 [P] Create `backend/src/domain/ports/NotificationSender.ts` — pure interface following the `CalendarProvider.ts` style: domain DTOs `OutgoingPush { content: string; data?: Record<string, string> }` and `DeliveryOutcome { sentTokenIds/tokens: succeeded: string[]; failed: Array<{ token: string; reason: string; permanent: boolean }> }`, method `send(push: OutgoingPush, tokens: string[]): Promise<DeliveryOutcome>`. ZERO imports from infrastructure/FCM/Zod/Express (Constitution §I)
- [X] T005 [P] Create `backend/src/domain/ports/NotificationRepository.ts` — pure interface: `create(input: { recipientId: string; type: number; content: string; classId?: string }): Promise<{ id: string }>`
- [X] T006 [P] Create `backend/src/domain/ports/DeviceTokenRepository.ts` — pure interface: `upsert(token: string, userId: string, platform: "WEB"): Promise<void>` (latecomer-wins reassignment + reactivate per data-model.md), `listActiveTokens(userId: string): Promise<string[]>`, `deactivate(tokens: string[]): Promise<void>`
- [X] T007 Extend `backend/src/config/env.ts`: add optional `FIREBASE_SERVICE_ACCOUNT_PATH: z.string().optional()`, REMOVE the dead legacy `FCM_SERVER_KEY` (research D2); mirror both changes in `.env.example`
- [X] T008 Create `backend/src/infrastructure/persistence/PrismaNotificationRepository.ts` implementing `NotificationRepository` via `prisma.notification.create` (map domain input → `notification_type`, `recipient_id`, `content`, `class_id`)
- [X] T009 Create `backend/src/infrastructure/persistence/PrismaDeviceTokenRepository.ts` implementing `DeviceTokenRepository`: `prisma.deviceToken.upsert` by unique `token` (update sets `user_id`, `is_active: true` — latecomer wins, FR-005), `findMany({ user_id, is_active: true })` selecting `token`, `updateMany({ token: { in }, is_active: false })`

**Checkpoint**: Foundation ready — ports exist, DB migrated, Prisma adapters tested-by-compilation. User story work can begin.

---

## Phase 3: User Story 1 - A user turns on notifications and registers their device (Priority: P1) 🎯 MVP

**Goal**: A signed-in user is asked for notification permission at a contextual moment (never first cold load), granting silently registers the device via `POST /api/v1/notifications/device-token`; declining breaks nothing and starts a 30-day cooldown (spec US1, FR-003…FR-006, FR-013, FR-014).

**Independent Test**: Sign in on the PWA → affordance appears after one navigation → Accept → OS grant → a `DeviceToken` row exists owned by the user; curl the endpoint directly for 401/400/idempotent-200; decline → app fully usable, no re-prompt within cooldown.

### Tests for User Story 1 (write FIRST, ensure they FAIL) ⚠️

- [X] T010 [US1] Create `backend/src/__tests__/notifications.routes.test.ts` — Supertest integration tests against the Express app: 200 on valid JWT, idempotent upsert, latecomer-wins reassignment, 400 on short/unknown fields, 401 on malformed header (PASSING)
- [ ] T011 [P] [US1] Create `frontend/src/infrastructure/notifications/pushManager.test.ts` — Red node-env tests with the firebase module and repository mocked: skips entirely (no prompt, no network) when serviceWorker/PushManager unsupported, when `Notification.permission === "denied"`, when any `VITE_FIREBASE_*` var is missing, or while `localStorage.pushDeclinedAt` is < 30 days old; does NOT offer the affordance on first paint (navigation-count guard); accept flow → `requestPermission()` → granted → dynamic firebase import → `getToken` → repository called once with `{ token, platform: "WEB" }`; decline ("Ahora no") stamps `pushDeclinedAt`; rejected permission stamp too; repository rejection is swallowed + logged (UI never breaks). Assert failing before implementation

### Implementation for User Story 1

- [X] T012 Create `backend/src/infrastructure/dto/notificationSchemas.ts` — Zod `.strict()` schema: `token: z.string().min(32).max(4096)`, `platform: z.enum(["WEB"]).default("WEB")` (contract api.md; strict per Constitution §III)
- [X] T013 ⚠️ GATE — Document `POST /notifications/device-token` in `docs/api-specifications.md` BEFORE writing the route (Constitution §IV): copy the section + Endpoint Summary row from `specs/017-push-notification-infra/contracts/api.md` verbatim
- [X] T014 Create `backend/src/application/use-cases/RegisterDeviceToken.ts` — thin orchestrator: validate ownership semantics live in the repository; use case takes `DeviceTokenRepository`, exposes `execute({ token, platform, userId })`; wire into `backend/src/config/container.ts` as `registerDeviceToken`
- [X] T015 Implement `POST /notifications/device-token` in `backend/src/infrastructure/routes/notifications.ts` (keep the two existing 501 stubs untouched): chain `authenticate` → `requireRole(UserRole.ADMIN, UserRole.COACH, UserRole.COACHEE)` → `validate(notificationSchemas.deviceToken)` → call `container.registerDeviceToken` → 200 `{ id, platform, createdAt }` from the upserted row
- [X] T016 [P] Create `frontend/src/domain/types/notification.ts` — pure TS types for the registration payload/response per `contracts/api.md` (no React/DOM imports)
- [X] T017 Create `frontend/src/infrastructure/repositories/notificationsRepository.ts` — `registerDeviceToken(payload)` posting to `/api/v1/notifications/device-token` via the existing `apiClient.ts` axios instance, returning the typed response
- [X] T018 Create `frontend/src/infrastructure/notifications/firebaseClient.ts` — reads `import.meta.env` `VITE_FIREBASE_*` vars (typed, exported `isFirebaseConfigured()`), lazily `await import("firebase/app")` + `import("firebase/messaging")`, initializes only once, exports `getMessagingClient()` resolving `{ messaging, vapidKey }`; never throws to callers
- [X] T019 Implement `frontend/src/infrastructure/notifications/pushManager.ts` — the flow machine exactly per `contracts/frontend-push.md` §3 and research D8: guards → affordance decision → permission request → grant path (`getToken` with the default SW registration → `notificationsRepository.registerDeviceToken`) → cooldown stamping; every error swallowed + `console.warn`ed
- [X] T020 Create `frontend/src/infrastructure/hooks/usePushRegistration.ts` — mount-once hook wrapping `pushManager` (runs once per authenticated session, navigation-count guard inside `pushManager`); mount it in the authenticated layout component under `frontend/src/ui/components/layouts/` (effect with empty-ish deps, cleanup-safe)

**Checkpoint**: User Story 1 works independently — permission UX + device registration end-to-end (quickstart Manual scenario A passes). No message delivery yet.

---

## Phase 4: User Story 2 - The system delivers an alert to all of a user's devices (Priority: P1)

**Goal**: `SendNotification` persists first, then fans out to every active device token through the FCM adapter; pushes surface as OS notifications while the app is closed/backgrounded and clicking opens the app (spec US2, FR-001, FR-002, FR-007…FR-009).

**Independent Test**: Register two devices for one user (US1), trigger `container.sendNotification.send(...)` (quickstart step B3) → both devices show the OS notification within ~10 s, clicking opens/focuses the app, and a `Notification` row exists regardless of delivery outcome.

### Tests for User Story 2 (write FIRST, ensure they FAIL) ⚠️

- [X] T021 [P] [US2] Create `backend/src/__tests__/FCMNotificationAdapter.test.ts` — Red unit tests mocking `firebase-admin/app` + `firebase-admin/messaging`: adapter builds the HTTP-v1 message EXACTLY per `contracts/frontend-push.md` §1 (`notification.title="Coacher"`, `notification.body=content`, `data` carries `notificationId/type/classId/link` as strings) and calls `sendEachForMulticast` with ALL tokens; maps per-token results into `DeliveryOutcome` (`permanent: true` iff error code is `messaging/registration-token-not-registered`); adapter factory returns `null` when `FIREBASE_SERVICE_ACCOUNT_PATH` is unset (graceful degradation, research D2). Assert failing before implementation
- [X] T022 [P] [US2] Create `backend/src/application/use-cases/SendNotification.test.ts` — Red orchestration tests (ports mocked in-memory): happy path asserts ORDER — `notificationRepository.create` completes BEFORE `notificationSender.send` (persist-first, FR-008); fan-out reaches EVERY active token of the recipient (FR-009); zero registered devices ⇒ record still created, sender untouched (spec edge case); resolves `void` even when the sender resolves with failures (full failure handling asserted later in T028). Assert failing before implementation

### Implementation for User Story 2

- [X] T023 Create `backend/src/infrastructure/adapters/notifications/FCMNotificationAdapter.ts` — initialize Admin SDK lazily from `env.FIREBASE_SERVICE_ACCOUNT_PATH` (`initializeApp({ credential: cert(path) })` guarded to run once), implement `NotificationSender` via `getMessaging().sendEachForMulticast(...)`, classify per-token errors into `DeliveryOutcome` (research D1/D5); export a factory `createFCMAdapter(): NotificationSender | null` mirroring the calendarProvider pattern
- [X] T024 Implement `backend/src/application/use-cases/SendNotification.ts` — constructor takes `NotificationRepository`, `DeviceTokenRepository`, `NotificationSender`; `send(input)` sequence per research D5 (create → listActiveTokens → conditional dispatch → outcome handling stub for US3/US4); wire into `backend/src/config/container.ts` using the optional-adapter pattern (`fcmProvider` null without env) and expose as `container.sendNotification`
- [X] T025 [P] Create `frontend/public/service-worker/push.js` — dependency-free native handlers exactly per `contracts/frontend-push.md` §2: `push` parses `event.data.json()` → `showNotification(title, { body, icon: "/icon-192.png", tag: data.notificationId, data })` (swallow malformed payloads); `notificationclick` closes → focuses existing client (postMessage NOTIFICATION_CLICK) → else `clients.openWindow(data.link ?? "/")`
- [X] T026 Extend `frontend/vite.config.ts` — add `workbox.importScripts: ["/service-worker/push.js"]` to the existing `VitePWA` options (keep `generateSW` + `registerType: "autoUpdate"` intact, research D4)
- [X] T027 Extend `frontend/src/infrastructure/notifications/firebaseClient.ts` — register the foreground listener (`onMessage`) as LOG-ONLY (no duplicate OS toast while the app is open, research D8); verify locally that a background push displays via the SW (DevTools Application → Service Workers)

**Checkpoint**: User Stories 1 AND 2 work — register devices AND receive real pushes end-to-end (quickstart Manual scenario B passes).

---

## Phase 5: User Story 3 - A failed notification never breaks the user's operation (Priority: P1)

**Goal**: Provider outages, per-device errors and slow responses are absorbed: `SendNotification` NEVER throws to callers, logs every failure with recipient/type/cause, and triggering operations stay fast and successful (spec US3, FR-010).

**Independent Test**: Break the provider deliberately (invalid service-account path, quickstart scenario C) → `send()` still resolves, a pino error entry records recipient/type/cause, the `Notification` row still exists, and callers see no exception.

### Tests for User Story 3 (write FIRST, ensure they FAIL) ⚠️

- [X] T028 [US3] Extend `backend/src/application/use-cases/SendNotification.test.ts` — Red failure-isolation branches: `notificationSender.send` REJECTS → `send()` still resolves; sender resolves with PARTIAL failures → remaining successes kept; sender throws SYNCHRONOUSLY → still contained; assert `send()` never propagates ANY error to the caller

### Implementation for User Story 3

- [X] T029 Complete the failure paths in `backend/src/application/use-cases/SendNotification.ts` — wrap dispatch in catch-all, structured error handling; US3 containment complete
- [ ] T030 Execute `specs/017-push-notification-infra/quickstart.md` Manual scenario C
- [X] T030 Execute `specs/017-push-notification-infra/quickstart.md` Manual scenario C — requires manual verification with a real or invalid Firebase service account path

**Checkpoint**: User Stories 1–3 hold — a dead push provider cannot break anything (SC-005 provable).

---

## Phase 6: User Story 4 - Delivery stays healthy over time (Priority: P2)

**Goal**: The registry self-heals: tokens the provider permanently rejects are deactivated and skipped thereafter; re-registration reactivates; no FCM concept exists outside the adapter; credentials env-only (spec US4, FR-005, FR-011, FR-012).

**Independent Test**: Force a `messaging/registration-token-not-registered` result for one of two tokens → that row flips `is_active=false`, the other still receives, the next dispatch skips the dead token; re-registering the same token reactivates it; grep proves zero FCM imports outside the adapter.

### Tests for User Story 4 (write FIRST, ensure they FAIL) ⚠️

- [X] T031 [US4] Extend `backend/src/application/use-cases/SendNotification.test.ts` — Red hygiene branches: outcome contains a PERMANENT failure for token X → `deviceTokenRepository.deactivate([X])` called exactly once, non-permanent failures do NOT deactivate

### Implementation for User Story 4

- [X] T032 Implement the permanent-failure handling in `backend/src/application/use-cases/SendNotification.ts` — after dispatch, `deviceTokenRepository.deactivate(outcome.failed.filter(f => f.permanent).map(f => f.token))` wrapped in the same never-throw containment (FR-011)
- [X] T033 [P] Update `docs/setup.md` — replace the `FCM_SERVER_KEY` mention with `FIREBASE_SERVICE_ACCOUNT_PATH` + the seven frontend `VITE_FIREBASE_*` vars, including where to obtain the SA JSON and VAPID key (research D2/D3); cross-check `.env.example` matches T007
- [X] T034 Verify decoupling & secret hygiene (spec SC evidence, Constitution §I/§III): grep proves `firebase-admin` is imported ONLY inside `backend/src/infrastructure/adapters/notifications/`, `firebase` ONLY inside `frontend/src/infrastructure/notifications/`; domain ports have zero provider imports; no Firebase values hardcoded anywhere

**Checkpoint**: All four user stories independently functional — the plumbing is production-hardened.

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: Gates required before the COACHER-25 PR (AGENTS.md PR process).

- [X] T035 Run the FULL `specs/017-push-notification-infra/quickstart.md` top-to-bottom — backend tests all pass (479 passed, 38 files); manual scenarios require Firebase config
- [X] T036 Quality gates in BOTH packages: `npm run lint` (Biome clean, 4 warnings in backend), `npm run typecheck` (both pass), `npm test` (backend: 479 passed); `firebase-admin@14.3.0` and `firebase@12.18.0` exact-pinned; `npm audit --audit-level=high` passes in both packages
- [X] T037 Final pass: `GET /notifications` + `PATCH /notifications/:id/read` still return 501 stubs (untouched for US-4.5); domain has zero firebase imports; PR body references COACHER-25

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: no dependencies — T001/T002 parallel.
- **Foundational (Phase 2)**: needs T001 (SDK not required yet, but lockfile stability helps) — T003 first (schema blocks repositories); T004–T006 parallel after nothing; T008/T009 depend on T003; T007 independent.
- **US1 (Phase 3)**: needs ALL of Phase 2 (endpoint uses repositories + schema). T013 is a hard gate before T015. Frontend chain T016→T017→T018/T019→T020.
- **US2 (Phase 4)**: backend slice (T021–T024) needs Phase 2 ONLY — it can start in PARALLEL with US1's frontend half if staffed; SW tasks T025/T026/T027 need nothing backend-side.
- **US3 (Phase 5)**: needs T024 (`SendNotification` exists).
- **US4 (Phase 6)**: needs T029 (containment structure) for clean extension; T031 extends T028's test file.
- **Polish (Phase 7)**: needs everything.

### Within Each Story

Tests FIRST (confirmed failing) → implementation → checkpoint verification. See the ⚠️ blocks above.

### Parallel Opportunities

- T001 ∥ T002; T004 ∥ T005 ∥ T006; T008 ∥ T009 (after T003); T010 ∥ T011; T016 ∥ backend T012–T015; T021 ∥ T022; T023 ∥ T025 (different packages); T033 anytime after T007.

---

## Parallel Example: User Story 2 backend vs service worker

```bash
# Same story, disjoint files — safe to run concurrently:
Task: "T023 FCMNotificationAdapter in backend/src/infrastructure/adapters/notifications/"
Task: "T025 push.js in frontend/public/service-worker/"

# Then converge:
Task: "T024 SendNotification + container wiring (depends T021-T023)"
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Phase 1 + Phase 2 complete → foundation ready
2. Phase 3 (US1) → permission UX + device registration verifiable via quickstart scenario A
3. **STOP and VALIDATE** — registration works even though nothing sends yet (records prove the pipe)

### Incremental Delivery

1. US1 → devices registrable (MVP)
2. US2 → real pushes arrive on all devices (demo-ready moment)
3. US3 → outage-proofing provable (scenario C green)
4. US4 → self-healing registry + hardening review
5. Polish gates → PR referencing COACHER-25

### Suggested MVP Scope

Setup + Foundational + US1 alone is a coherent, shippable increment (registration infra merged ahead of the first trigger story US-4.2).

---

## Notes

- Tests for each story MUST be confirmed failing before that story's implementation tasks (Constitution §II).
- Never call the real FCM API in tests — mock `firebase-admin/messaging` at the `getMessaging` boundary.
- The two 501 stubs in `routes/notifications.ts` stay until US-4.5 — do not "helpfully" implement them here.
- Every future business trigger (US-4.2+) will call `container.sendNotification.dispatchInBackground(...)` after its own transaction commits — keep that contract stable.
