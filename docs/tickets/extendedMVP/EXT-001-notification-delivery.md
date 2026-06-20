# EXT-001 — Real Notification Delivery (Email + Web Push)

## Metadata
- **Type:** Full-Stack (Backend + Infrastructure)
- **Priority:** P1
- **Phase:** 1 — GA Readiness (implement first, before other P1 work)
- **PRD Reference:** [P1-001](../../product/5_Extended-Non-MVP-PRD.md#p1-001-real-notification-delivery-email-and-mobile-push)
- **Effort:** Medium
- **Depends on:** TKT-005 (SNS backend — done)

---

## User Story

As a user, I want to receive a real email or push notification when my food is about to expire, so that I take action before it is too late.

---

## Context

The MVP backend (TKT-005) already:
- Runs a scheduled cron job that identifies items expiring within 2 days.
- Emits an SNS event per eligible user.
- Stores `NotificationPreference` per user (expiry alerts on/off).

What is missing:
- No actual delivery of the SNS event to the user's email or browser.
- No `web-push` subscription registration endpoint.
- No SES (or SMTP) delivery adapter wired into the notification pipeline.

The gap is the last mile: SNS fires but nothing consumes it to deliver to the user.

---

## Affected Slices

| Slice | Path | Change |
|---|---|---|
| Backend — integrations | `back/src/integrations/aws-ses/` | New SES adapter |
| Backend — integrations | `back/src/integrations/web-push/` | New web-push adapter |
| Backend — module | `back/src/modules/notifications/` | Wire delivery adapters, add delivery log |
| Prisma schema | `back/prisma/schema.prisma` | Add `NotificationLog` model |
| Frontend | `front/src/features/notifications/` | Web push subscription registration |
| Frontend | `front/src/routes/settings.tsx` | Opt-in to push permission |

---

## API Contracts

```
POST /api/notifications/push-subscription
Body: { endpoint: string, keys: { p256dh: string, auth: string } }
Response: 201 { id: string }

DELETE /api/notifications/push-subscription
Response: 204
```

The expiry notification trigger endpoint and preferences already exist from TKT-005 — no changes to those contracts.

---

## Data Model Changes

```prisma
model NotificationLog {
  id          String   @id @default(uuid())
  userId      String
  type        String   // "EXPIRY" | "BADGE" | etc.
  channel     String   // "EMAIL" | "WEB_PUSH"
  status      String   // "SENT" | "FAILED" | "SKIPPED"
  failReason  String?
  sentAt      DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])

  @@index([userId, sentAt])
}

model PushSubscription {
  id        String   @id @default(uuid())
  userId    String   @unique
  endpoint  String
  p256dh    String
  auth      String
  createdAt DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])
}
```

---

## Technical Implementation Tasks

Follow TDD: write the failing test for each unit before implementing.

1. **Prisma migration** — add `NotificationLog` and `PushSubscription` tables. Run `npx prisma migrate dev`.

2. **SES adapter** (`back/src/integrations/aws-ses/ses.service.ts`)
   - Inject `@aws-sdk/client-ses`.
   - `sendEmail(to, subject, htmlBody): Promise<void>` — throws on failure.
   - Unit test with `SESClient` mock: assert `SendEmailCommand` is called with correct params.

3. **Web push adapter** (`back/src/integrations/web-push/web-push.service.ts`)
   - Use `web-push` npm package.
   - `sendNotification(subscription, payload): Promise<void>`.
   - VAPID keys loaded from env (`VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY`, `VAPID_SUBJECT`).
   - Unit test: mock `webpush.sendNotification`, assert called with correct subscription.

4. **Push subscription endpoint** (`back/src/modules/notifications/notifications.controller.ts`)
   - `POST /notifications/push-subscription` — saves `PushSubscription` for the authenticated user.
   - `DELETE /notifications/push-subscription` — removes it.
   - Integration test: register subscription, verify DB row; delete, verify removed.

5. **Notification delivery service** (`back/src/modules/notifications/notification-delivery.service.ts`)
   - `deliverExpiry(userId, items): Promise<void>`
     1. Check `NotificationPreference.expiryEnabled` (skip if false).
     2. Render email template (`items` list with names and expiry dates).
     3. Call `SesService.sendEmail`.
     4. If `PushSubscription` exists, call `WebPushService.sendNotification`.
     5. Write `NotificationLog` row for each channel with status.
   - Deduplication: skip if a `NotificationLog` with same `userId`, `type`, and `sentAt` within 24 h already exists.
   - Unit tests: mock both adapters and DB; verify deduplication logic; verify preference skip.

6. **Wire delivery into the cron job** (`back/src/modules/notifications/notifications.service.ts`)
   - Replace the existing no-op SNS publish with `NotificationDeliveryService.deliverExpiry`.
   - Keep the SNS publish as an additional fan-out call (do not remove it — preserves future extensibility).
   - Integration test: seed items expiring tomorrow, trigger cron, assert `NotificationLog` rows created.

7. **Frontend — push subscription** (`front/src/features/notifications/push-subscription.ts`)
   - `requestPushPermission(): Promise<void>` — calls `Notification.requestPermission()`, subscribes via `serviceWorkerRegistration.pushManager.subscribe`, posts subscription to backend.
   - Call this from the Settings page when user enables expiry alerts.

8. **Service worker** (`front/public/sw.js`)
   - Handle `push` event: show notification with `self.registration.showNotification`.

9. **Environment variables** — add to `.env.example`:
   ```
   AWS_SES_FROM_EMAIL=noreply@realsavefooding.com
   VAPID_PUBLIC_KEY=
   VAPID_PRIVATE_KEY=
   VAPID_SUBJECT=mailto:admin@realsavefooding.com
   ```

---

## Error Handling

- SES delivery failure → log `NotificationLog` with `status: FAILED`, `failReason`, do not throw (fire-and-forget per user).
- Web push 410 (subscription expired) → delete `PushSubscription` row silently.
- Missing `PushSubscription` → skip web push channel, still attempt email.

---

## Security

- VAPID keys must be in env vars, never in source.
- `PushSubscription.auth` and `p256dh` are sensitive; store in DB but never return to client.
- SES sender domain must be verified in AWS Console before sending.
- Notification payload must not include item prices or full notes (minimise PII in push payloads).

---

## Testing Requirements

| Test type | Coverage target |
|---|---|
| Unit — SES adapter | sendEmail called, failure captured |
| Unit — web-push adapter | sendNotification called, 410 handled |
| Unit — delivery service | deduplication, preference skip, both channels |
| Integration — push subscription endpoint | save + delete |
| Integration — cron trigger | NotificationLog rows after run |
| E2E (manual) | Receive email in dev with SES sandbox |

---

## Acceptance Criteria

1. User with expiry alerts enabled and a registered email receives an email when an item enters the 2-day window.
2. User who opted into push and has a registered `PushSubscription` receives a browser push.
3. User with alerts disabled receives nothing.
4. No duplicate email is sent for the same item within 24 hours.
5. Failed deliveries are recorded in `NotificationLog` with `status: FAILED` and a reason.
6. `POST /api/notifications/push-subscription` returns 201 and persists the subscription.

---

## Non-Goals

- Native mobile push (APNs/FCM) — deferred to [6_Future-Capabilities.md](../../product/6_Future-Capabilities.md).
- Notification history UI — already exists from TKT-005; no changes needed.
- Rich HTML email templates with images — plain text with item list is sufficient for this ticket.

---

## Open Questions

1. Should we use SES directly or route through SNS → SES subscription? (Recommendation: direct SES for email to keep delivery latency low and logging straightforward.)
2. What is the SES daily send limit in the AWS account? Confirm sandbox vs production SES mode.

---

## Readiness Check

- [x] Clear actor and value
- [x] Testable acceptance criteria
- [x] Scope is small enough for one delivery cycle
- [x] Dependencies identified (TKT-005 done, SES sandbox access needed)
