# Feature Specification: Push Notification Infrastructure

**Feature Branch**: `017-push-notification-infra`

**Created**: 2026-08-21

**Status**: Draft

**Input**: User description: "Let's start implementing push notifications. Here's the first task we need to do https://linear.app/ai4devs/issue/COACHER-25/us-41-push-notification-infrastructure" — US-4.1: Push Notification Infrastructure (COACHER-25). As a system, I want to send push notifications via Firebase Cloud Messaging, so that users receive real-time alerts on their devices. Acceptance criteria from the issue: notification-sending capability decoupled behind a domain-level port; an adapter implementing that port with the chosen push provider; a device-token registration endpoint for the frontend; a background worker configured to receive and display push events when the app is not open; notification permission requested at an appropriate time; failed deliveries logged without failing the triggering operation; notification content stored in PostgreSQL with type, recipient, and read status.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - A user turns on notifications and registers their device (Priority: P1)

A signed-in user is offered push notifications at a natural moment — after they are already using the app and can understand the value, never as an interrupting prompt on first cold load. If they accept, their device is registered silently in the background so future alerts reach it; if they decline, nothing breaks: every feature of the app keeps working exactly as before, and they may be offered the choice again later at another sensible moment. Registration is invisible when it succeeds — the user is not taken out of their flow and does not need to fill anything in.

**Why this priority**: Without device registration there is no destination for any alert — this is the foundation every other notification story stands on. It must exist before any notification can ever be delivered.

**Independent Test**: Can be fully tested by signing in, being asked for notification permission at the right moment, accepting, and verifying the device becomes registered without further input; then repeating with "decline" and verifying all app features still work — it delivers registered, reachable devices on its own.

**Acceptance Scenarios**:

1. **Given** a signed-in user actively using the app, **When** the moment chosen for asking arrives (a contextual moment, not first cold load), **Then** they are offered notification permission once, with clear context for why.
2. **Given** the user accepts the permission request, **When** the grant completes, **Then** their current device is registered with the system automatically, with no additional user input or navigation.
3. **Given** the user declines the permission request, **When** they continue using the app, **Then** every screen and action works exactly as before and no repeated nagging occurs within the same session.
4. **Given** a user who previously declined, **When** a later appropriate moment arrives in a future session, **Then** they may be offered the choice again through the app's own UI (not a raw OS dialog that can no longer appear).
5. **Given** an unauthenticated visitor, **When** any attempt is made to register a device, **Then** registration is refused and no data is stored.

---

### User Story 2 - The system delivers an alert to all of a user's devices (Priority: P1)

When the system has something to tell a user, it records the alert — what kind it is, who it is for, and whether it has been seen — and delivers it to every device that user has registered. The alert appears even when the app is closed or running in the background: the device wakes, shows the message, and tapping it brings the user into the app. If one of the user's devices cannot be reached (switched off, uninstalled), delivery to their other devices still happens.

**Why this priority**: Persisting and delivering is the heart of the story — the issue's core promise is that stored, typed alerts reliably reach the right user on their devices in real time.

**Independent Test**: Can be fully tested by registering two devices for one user, triggering an alert for them, and verifying the alert record exists with type, recipient, and unread state, and that both devices surface it while the app is closed — it delivers working end-to-end alerts on its own.

**Acceptance Scenarios**:

1. **Given** a business event that warrants notifying a user, **When** the system handles it, **Then** an alert record is created first — carrying its type, the intended recipient, and an unread state — before any delivery is attempted.
2. **Given** a user with multiple registered devices, **When** an alert is dispatched for them, **Then** delivery is attempted to every one of their registered devices, and one device failing does not prevent the others receiving it.
3. **Given** the app is closed or in the background on a registered device, **When** an alert arrives, **Then** the device displays the notification, and activating it opens the app.
4. **Given** an alert that was persisted, **When** it is inspected afterwards, **Then** its type, recipient, and read/unread state accurately reflect what happened.
5. **Given** an event that warrants notifying several different users, **When** the system processes it, **Then** each recipient gets their own alert record addressed to them individually.

---

### User Story 3 - A failed notification never breaks the user's operation (Priority: P1)

Whatever triggered an alert — a class cancellation, an enrollment, any future notification-worthy event — the success of that operation never depends on the notification going through. If the push provider is down, slow, or rejects a message, the user who performed the action still gets a normal successful response, the operation's result stands, and the delivery failure is logged with enough context (recipient, type, reason) for an operator to investigate afterwards. Notification problems are invisible to end users and never corrupt data.

**Why this priority**: This is the safety property that makes it acceptable to bolt notifications onto live business flows. Without it, a provider outage would break class bookings and cancellations — unacceptable for a scheduling app.

**Independent Test**: Can be fully tested by forcing the delivery channel to fail, performing a business operation that should notify someone, and verifying the operation still succeeds completely while a detailed failure log entry appears — it proves graceful degradation on its own.

**Acceptance Scenarios**:

1. **Given** the push delivery provider is unreachable or erroring, **When** a business operation triggers a notification, **Then** the operation completes successfully with its normal response.
2. **Given** a delivery attempt that fails for any reason, **When** the failure occurs, **Then** a log entry records the intended recipient, the notification type, and the failure reason, without exposing secrets.
3. **Given** a failing delivery, **When** the triggering operation responds to the user, **Then** the response shows no error related to notifications and takes no noticeably longer than usual because of the failed send.
4. **Given** several recipients where some deliveries fail and others succeed, **When** dispatch finishes, **Then** the successful ones were delivered, the failed ones logged, and no recipient's record was lost or duplicated.

---

### User Story 4 - Delivery stays healthy over time (Priority: P2)

Devices change: apps get reinstalled, browsers reset their credentials, users sign out on shared machines. The system keeps its registry of reachable devices honest — credentials that the provider permanently rejects are marked inactive so they stop being attempted, re-registration of the same device updates rather than duplicates, and a device used by a different account later is reassigned to that account. All provider access stays behind the system's own boundary, so the delivery mechanism could be replaced without rewriting business logic, and provider credentials are injected purely through environment configuration.

**Why this priority**: Correctness over weeks of real usage, clean architecture, and secret handling matter, but the feature works end-to-end without them; they harden and future-proof it.

**Independent Test**: Can be fully tested by re-registering a device (verifying no duplicate), simulating a permanently-rejected credential (verifying it is deactivated), and reviewing configuration to confirm no credentials are hardcoded — it delivers a self-maintaining registry on its own.

**Acceptance Scenarios**:

1. **Given** a device already registered, **When** it registers again, **Then** the existing entry is updated rather than duplicated.
2. **Given** a device whose credential was last registered to account A, **When** account B signs in and registers on that same device, **Then** the credential is now associated with account B and no longer with A.
3. **Given** the provider reports a device credential as permanently invalid (e.g., app uninstalled), **When** dispatch encounters it, **Then** the credential is deactivated so future sends skip it, and the change is logged.
4. **Given** the codebase, **When** reviewed, **Then** all logic that wants to send a notification depends only on a domain-owned sending interface, with the specific provider confined to one adapter outside the domain layer.
5. **Given** deployment configuration, **When** inspected, **Then** provider credentials come only from environment variables and never appear in code, tests' fixtures committed to the repo, or logs.

---

### Edge Cases

- What happens when the user blocks notifications at the browser/OS level entirely? The app detects it, treats it like a decline, remains fully functional, and offers guidance through its own UI about how to re-enable notifications in settings.
- What happens when registration is attempted twice simultaneously (double-tap / flaky network retry)? The second attempt is absorbed idempotently — one active registration per device credential, no duplicates, no errors shown to the user.
- What happens when a notification's recipient has zero registered devices? The alert record is still created and marked accordingly; dispatch simply has nowhere to send, which is not treated as an error beyond a routine log line.
- What happens when the provider accepts a message but the device never shows it (device off)? From the system's perspective the hand-off succeeded; no per-device read receipts are tracked in this story.
- What happens when a stale token belongs to a user who was deactivated? Their registrations become unreachable; dispatch skips them without counting it as a business failure.
- What happens when the push service responds slowly? The send runs without blocking the triggering operation's user-facing response beyond a negligible, bounded overhead.
- What happens when a malformed or suspicious token payload is submitted? It is rejected with the standard validation error before touching storage, and the attempt is logged as a security event.
- What happens when two alerts fire for the same event and user (retry of a job, double submit)? The design favors at-least-once delivery; a rare duplicate push is preferable to a lost one, and deduplication is left to future inbox work.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST expose notification sending to business logic exclusively through a domain-layer sending interface (port) that references no delivery-provider concepts; the concrete provider implementation MUST live outside the domain layer behind that interface.
- **FR-002**: An adapter implementing the domain port MUST deliver messages through the project's chosen push provider, and MUST be the only place aware of that provider's specifics.
- **FR-003**: An authenticated endpoint under `/api/v1/` MUST let any signed-in role register the current device's push credential, associating it with the authenticated account.
- **FR-004**: Device registration MUST validate the submitted payload strictly (rejecting unknown fields and malformed credentials) and MUST respond using the standard API envelope, including standard errors for unauthenticated, invalid-payload, and validation-failure cases.
- **FR-005**: Re-registering a credential that already exists MUST update the existing record (idempotent); a credential presented by a different account than the one it was last registered to MUST be reassigned to the newly authenticated account.
- **FR-006**: The frontend MUST request notification permission only at a deliberate, contextual moment (not on first cold load), MUST present the request with understandable context, and MUST keep every feature fully functional when permission is denied or unavailable.
- **FR-007**: A background service worker MUST receive incoming push events and display them as system notifications when the app is closed or in the background, and activating such a notification MUST open/focus the app.
- **FR-008**: Every notification the system intends to send MUST first be persisted containing at minimum: its type, its recipient, and its read status (unread when created).
- **FR-009**: Dispatch MUST attempt delivery to every active device registration belonging to the recipient, continuing across individual device failures.
- **FR-010**: Any delivery failure MUST be logged with recipient, notification type, and cause, and MUST NOT propagate as an error to the operation that triggered the notification nor delay its response materially.
- **FR-011**: When the provider reports a device credential as permanently invalid, the system MUST deactivate that registration so subsequent dispatches skip it.
- **FR-012**: Provider credentials and all related secrets MUST be supplied exclusively via environment variables, MUST never be committed, and MUST never appear in responses, client code, or logs.
- **FR-013**: All notification-related endpoints MUST enforce authentication and role authorization at the middleware level, consistent with Security-by-Default; device registration MUST accept all three roles.
- **FR-014**: Registration attempts with invalid payloads MUST be logged as security events (actor, action, outcome).

### Key Entities *(include if feature involves data)*

- **DeviceRegistration**: One device's push credential bound to one account — the credential value (unique), owning user, platform/context info, active/inactive state, and timestamps; deactivation makes it skipped during dispatch but preserves history.
- **Notification**: One alert addressed to one recipient — its type, recipient, title/body content, read status (unread at creation, with timestamp semantics for later read-marking), and creation time; it is the durable record that exists independently of delivery success.
- **User (reused)**: Any Admin, Coach, or Coachee account; the recipient of notifications and owner of device registrations, identified from the authenticated session.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A signed-in user can go from "asked" to "device registered" in under 30 seconds with zero additional forms or navigation, entirely within their current flow.
- **SC-002**: 100% of users who decline notifications experience zero functional differences in the app — verified by exercising every core flow with permissions denied.
- **SC-003**: 100% of generated notifications exist as persisted records with type, recipient, and unread initial state before any delivery attempt is made.
- **SC-004**: Under normal operating conditions, at least 99% of dispatches to active, valid device registrations reach the device within 10 seconds of the triggering event.
- **SC-005**: 100% of delivery failures produce a log entry identifying recipient, notification type, and cause, while 100% of the triggering operations still complete with their normal successful response.
- **SC-006**: A user with N ≥ 2 registered, active devices receives an alert on all N devices for every notification addressed to them.
- **SC-007**: After a provider reports a credential invalid, 100% of subsequent dispatches skip that credential, and the registry contains no duplicate entries after repeated re-registrations of the same device.
- **SC-008**: Business operations unaffected scope check: adding a notification trigger to an existing flow changes that flow's user-visible response time by no more than a negligible overhead under normal conditions.

## Assumptions

- The delivery provider is Firebase Cloud Messaging (FCM), per the source issue COACHER-25 ("Push Notification Infrastructure… via Firebase Cloud Messaging"); the spec deliberately describes capabilities provider-neutrally, with the choice documented here.
- This story ships the infrastructure only: the port + adapter, registration endpoint, persistence model, service-worker reception, and permission UX plumbing. Concrete triggers (which events notify whom, with which wording) and any in-app notification inbox/read-marking UI belong to later stories; read status is stored now but no read-marking interface is delivered here.
- Target platform is the web/PWA app (the Coachee experience is a mobile-first PWA per project requirements). Native mobile app support is out of scope.
- "Appropriate time" for the permission prompt means after the user is authenticated and engaged (for example, following a successful sign-in interaction or first meaningful use of a relevant screen), configurable in the frontend; the exact placement is finalized in planning.
- One device credential maps to at most one account at any time; latecomer wins (last registration claims the credential), matching common push-token ownership practice.
- Delivery semantics are at-least-once: rare duplicate pushes are acceptable; guaranteed exactly-once and per-device delivery receipts are out of scope.
- No automatic retry queue in this story: a failed send is logged, not retried (retry policy, if needed, is a later decision).
- The domain port and adapter split follows Constitution Principle I (Domain Purity); the persistence store for notifications is PostgreSQL per the issue's acceptance criteria.
