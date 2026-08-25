# Research: Push Notification Infrastructure (017)

**Feature**: specs/017-push-notification-infra | **Date**: 2026-08-21 | **Status**: Complete — no NEEDS CLARIFICATION remaining

Research questions derived from the spec + Technical Context; each resolved with web-validated sources where noted.

## D1: Server-side FCM integration — Admin SDK vs raw HTTP v1

**Decision**: Use the official `firebase-admin` Node SDK (`getMessaging().send()` per token, `sendEachForMulticast()` for fan-out). The SDK speaks the **HTTP v1 protocol** under the hood — which is exactly what issue COACHER-25 means by "(Firebase Admin SDK, HTTP v1 API)".

**Rationale**:
- The legacy FCM APIs (`sendToDevice`, `sendAll`, legacy server key auth) were shut down **June 2024**; `messaging().send()`/`sendEach()` are the supported path (firebase-admin-node discussion #2518; Firebase docs "Send messages with the Firebase Admin SDK", retrieved 2026-08).
- The SDK owns the OAuth2 lifecycle (service-account JWT → short-lived access token → automatic refresh) that raw HTTP v1 would force us to reimplement.
- Error taxonomy is standardized (`messaging/registration-token-not-registered`, `messaging/unavailable`, …) which maps cleanly onto our failure-isolation and token-deactivation rules (spec FR-010/FR-011).

**Alternatives considered**:
- *Raw HTTP v1 via `googleapis` JWT client* (googleapis already a dep): rejected — reinvents request/error handling and OAuth refresh for zero functional gain.
- *`web-push` library with plain VAPID (no Firebase)*: rejected — COACHER-25 explicitly mandates FCM; also loses FCM console delivery metrics later.

## D2: Credentials & graceful degradation

**Decision**: New optional env var `FIREBASE_SERVICE_ACCOUNT_PATH` (path to the Firebase service-account JSON key file, mirroring `GOOGLE_CALENDAR_SA_KEY_PATH`). Remove the dead `FCM_SERVER_KEY` from `env.ts`. `FCMNotificationAdapter` is instantiated in `container.ts` only when the var is set; otherwise it is `null` and `SendNotification` degrades to persist-and-log-only. Update `docs/setup.md`.

**Rationale**: Replicates the proven `calendarProvider` pattern (`container.ts:61-73`) so dev environments start clean without Firebase config ("the API starts fine without them" — docs/setup.md:64). Firebase's own guidance prefers file-based service-account credentials outside Google-hosted environments (Firebase HTTP v1 auth docs, retrieved 2026-08).

**Alternatives considered**:
- *Inline JSON secret env var* (`FIREBASE_SERVICE_ACCOUNT_JSON=`): rejected — multiline secrets are awkward on Render and easy to leak into logs.
- *Hard requirement of credentials at boot*: rejected — breaks local/test startup and violates the established degradation precedent.

## D3: Web client token acquisition

**Decision**: Frontend uses the modular Firebase JS SDK (`firebase/app` + `firebase/messaging`) — `getToken(messaging, { vapidKey, serviceWorkerRegistration })` against the app's main PWA service worker registration. The module is **dynamically imported** inside `infrastructure/notifications/firebaseClient.ts`, so nothing Firebase enters the initial bundle or loads for users who never opt in.

**Rationale**: FCM web push requires an FCM registration token bound to a service worker + VAPID key; the JS SDK is the only supported way to mint those tokens. Dynamic import keeps Lighthouse/Tailwind bundle budgets untouched.

**Alternatives considered**:
- *Raw Push API `pushManager.subscribe()`*: rejected — produces a subscription URL endpoint, not an FCM token; incompatible with the mandated Admin-SDK send path.
- *Static firebase import at app bootstrap*: rejected — ~100+ KB in the main chunk for a feature most sessions use once.

## D4: Service worker strategy — keep generateSW, add push.js via importScripts

**Decision**: Keep `vite-plugin-pwa` in its current `generateSW` mode and add push handling through `workbox.importScripts: ["/service-worker/push.js"]`. `public/service-worker/push.js` is a dependency-free script registering two native listeners:

1. `push`: parse `event.data.json()` → `{ notification: { title, body }, data?: { link, ... } }` → `self.registration.showNotification(title, { body, icon, data })`.
2. `notificationclick`: close the notification, focus an existing app window if present, else `clients.openWindow(data.link ?? "/")`.

**Rationale**: Confirmed working pattern from the vite-pwa maintainers' thread (vite-pwa/docs issue #132): "to get push notifications working you need… a separate file imported into the main service worker" via `workbox.importScripts`. Because the backend sends standard `notification` payloads, the SW needs **no Firebase code at all** — so we avoid the gstatic CDN `importScripts('https://www.gstatic.com/firebasejs/...')` used in the classic `firebase-messaging-sw.js`, keeping CSP clean and the SW self-contained/offline-safe.

**Alternatives considered**:
- *Switch plugin to `injectManifest` custom SW*: rejected — build-config refactor (custom precache wiring, workbox dev-deps) for identical runtime behavior; can revisit if the SW grows logic.
- *Separate `firebase-messaging-sw.js` registered at root scope alongside the PWA SW*: rejected — one scope = one active worker; the registrations fight each other.
- *Rely on browser auto-display of `notification` pushes without a handler*: rejected — loses click-to-open behavior and is inconsistent across browsers.

## D5: Orchestration & failure isolation (SendNotification)

**Decision**: One application-layer use case, `SendNotification` (application/use-cases/SendNotification.ts — repo convention; the PRD's name "SendNotificationService" refers to this class):

```
send(input { recipientId, type 1–12, content, classId? }):
  notification := notificationRepository.create(...)        // FR-008: persist FIRST
  tokens       := deviceTokenRepository.listActive(recipientId)
  results      := tokens.length ? notificationSender.send(content, tokens) : []
  deactivate   := results.permanentlyInvalidTokens           // FR-011
  log          := pino warn/error per failed token {recipientId, type, cause}   // FR-010
  return void                                               // NEVER throws to caller
```

Callers (future US-4.2+ triggers) invoke it fire-and-forget after their own transaction commits; even a synchronous throw inside `send()` is caught internally. Provider outage ⇒ notifications pile up as persisted records with logged dispatch failures; business operations unaffected.

**Rationale**: Satisfies spec FR-008 ordering, FR-010 isolation, FR-011 hygiene in one testable unit with 100% branch coverage achievable (Constitution §II). `sendEachForMulticast` returns per-token success/failure results, enabling partial-failure handling (spec edge case: one device down ≠ others blocked).

**Alternatives considered**:
- *Await dispatch inline in each future trigger*: rejected — couples latency + error surface into every booking flow (violates SC-008/FR-010 by construction).
- *Queue/table-based retry worker*: rejected for this story (spec Assumption: retry policy deferred); design leaves room since failures are already logged with full context.

## D6: Data model

**Decision**: Reuse the existing `Notification` Prisma model verbatim (schema.prisma:192-204 — `notification_type Int` holds catalog #1–#12 from PRD §7; single `content String`; `is_read Boolean @default(false)`). Add one model:

```prisma
enum DevicePlatform { WEB }

model DeviceToken {
  id         String         @id @default(uuid()) @db.Uuid
  token      String         @unique
  user_id    String         @db.Uuid
  platform   DevicePlatform @default(WEB)
  is_active  Boolean        @default(true)
  created_at DateTime       @default(now())
  updated_at DateTime       @updatedAt
  user User @relation(fields: [user_id], references: [id])
}
// + DeviceToken[] deviceTokens on User
```

Registration semantics: upsert by unique `token` — exists ⇒ update `user_id` (latecomer-wins reassignment), set `is_active = true`; else create. Migration `<timestamp>_add_device_tokens`.

**Rationale**: The existing model already satisfies the AC "type, recipient, read status stored in PostgreSQL"; inventing a second shape would churn the documented US-4.5 contract (`GET /notifications` returns `notificationType`, `content`, `isRead`). Unique-token upsert gives idempotency (SC-007) and cross-account reassignment (FR-005) in one DB constraint.

**Alternatives considered**:
- *Composite unique `[user_id, token]`*: rejected — same token under two users violates the one-credential-one-owner assumption (latecomer wins).
- *Prisma enum for notification_type*: rejected — schema change beyond story scope; domain-level validation (1–12) suffices; int matches the shipped US-4.5 contract.

## D7: Device-token registration endpoint

**Decision**: `POST /api/v1/notifications/device-token`, mounted in the existing stubbed `routes/notifications.ts`. Middleware chain: `authenticate` → `requireRole(UserRole.ADMIN, UserRole.COACH, UserRole.COACHEE)` → `validate(zodSchema.strict())`. Body `{ token: string(min 32, max 4096), platform: enum("WEB").default("WEB") }`. Success `200 OK` returns the resource directly (`{ id, platform, createdAt }` — upsert makes 200 always correct, no create/update split). Errors: 401 / 403 / 400 `VALIDATION_ERROR` via existing middleware; contract added to `docs/api-specifications.md` (section + summary table) as an implementation-blocking task (Constitution §IV).

**Rationale**: Matches every documented endpoint convention reviewed (docs/api-specifications.md style, envelope errors, role guards); `.strict()` satisfies Constitution §III; token length bounds reject garbage cheaply before touching storage.

**Alternatives considered**:
- *PUT semantics / 201-vs-200 distinction*: rejected — upsert is intentionally idempotent; distinguishing create/update leaks internals for zero client value.
- *Token in Authorization-style header*: rejected — device tokens are long-lived data, not credentials of the session; body + DB storage is the documented pattern.

## D8: Permission-request timing & frontend flow

**Decision**: `usePushRegistration` mounts once in the authenticated layout. Flow per session: skip entirely if unsupported/`denied`-at-OS-level or VAPID env missing; if permission `default` AND no active decline within cooldown (localStorage `pushDeclinedAt`, **30 days**) AND this is ≥1 navigation past login (not first paint), show a small in-app affordance explaining value ("Recibe avisos de huecos y cambios de clase") whose button calls `Notification.requestPermission()`. On grant: dynamic-import firebase client, `getToken`, POST device token; swallow+log all errors (registration failure must never break the UI — mirrors FR-010 spirit client-side). Decline sets the cooldown stamp. Foreground messages (`onMessage`) are logged only — no duplicate OS toast while the user has the app open; OS notifications appear when closed/backgrounded (D4 handler).

**Rationale**: Directly implements spec FR-006 ("deliberate contextual moment, not first cold load"), acceptance scenarios US1.1–US1.5, and edge cases (OS-blocked, re-offer via own UI). localStorage cooldown avoids nagging while allowing recovery from early mis-clicks.

**Alternatives considered**:
- *Prompt immediately post-login*: rejected — cold-context prompts convert poorly and violate the spec's explicit timing rule.
- *Settings page toggle built now*: deferred — minimal viable affordance this story; full settings UX belongs with the US-4.5 inbox work.

## Dependency pins (implementation-time)

Pin EXACT versions at task execution (`npm view <pkg> version` then install without range): `firebase-admin` (v13 line), `firebase` (latest stable v11/v12 line). Both officially maintained; audit gate applies at PR.
