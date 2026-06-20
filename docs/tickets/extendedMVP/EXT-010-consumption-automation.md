# EXT-010 — Consumption Automation for Long-Expired Items

## Metadata
- **Type:** Full-Stack (Backend + Frontend)
- **Priority:** P2
- **Phase:** 2 — Growth
- **PRD Reference:** [P2-006](../../product/5_Extended-Non-MVP-PRD.md#p2-006-consumption-automation-for-long-expired-items)
- **Effort:** Medium
- **Depends on:** TKT-009 (consumption events — done), EXT-001 (notification delivery — for digest push)

---

## User Story

As a user, I want the system to automatically clean up pantry items that are clearly past their expiry date, so that my pantry stays accurate without me having to manually visit every old item.

---

## Context

The MVP waste-suggestion flow (TKT-009) already:
- Warns the user when marking an item expired >7 days as wasted.
- Requires explicit user confirmation.

What it does NOT do: proactively notify the user about accumulated ghost items (expired but never acted on), or automatically clean them up after a grace period.

This ticket adds:
1. A **daily scheduled job** that identifies items expired beyond a threshold (default: 14 days).
2. A **digest notification** sent to the user listing the candidate items.
3. A **bulk-review UI** where the user can confirm waste or dismiss items.
4. An **auto-waste** mechanism: if no action is taken within 7 days of the digest, the system auto-marks items as `WASTED` with method `AUTO_EXPIRED`.
5. A **user setting** to disable auto-expiry entirely.

---

## Affected Slices

| Slice | Path | Change |
|---|---|---|
| Prisma schema | `back/prisma/schema.prisma` | Add `AutoExpiryDigest` model; update `ConsumptionEvent` method enum |
| Backend — module | `back/src/modules/pantry/` | New scheduled job + bulk-waste endpoint |
| Backend — module | `back/src/modules/notifications/` | Trigger digest notification |
| Frontend — routes | `front/src/routes/pantry.tsx` | Add "Expired items" banner + bulk review |
| Frontend — routes | `front/src/routes/settings.tsx` | Add auto-expiry toggle |
| Frontend — features | `front/src/features/pantry/pantry.api.ts` | Add bulk-waste + dismiss API calls |

---

## API Contracts

```
GET /api/pantry/items/expired-candidates
Response: {
  items: Array<{
    id: string
    name: string
    expirationDate: string
    daysExpired: number
    estimatedValueEur: number | null
  }>
  digestId: string | null    // current pending digest ID, if any
}

POST /api/pantry/items/bulk-waste
Body: { itemIds: string[] }
Response: {
  wastedCount: number
  events: Array<{ id: string; itemId: string }>
}

POST /api/pantry/items/bulk-dismiss-expired
Body: { itemIds: string[] }   // removes from digest without wasting (user keeps item)
Response: { dismissedCount: number }

PATCH /api/settings/auto-expiry
Body: { enabled: boolean; thresholdDays?: number }
Response: { enabled: boolean; thresholdDays: number }

GET /api/settings/auto-expiry
Response: { enabled: boolean; thresholdDays: number }
```

---

## Data Model Changes

```prisma
// Extend NotificationPreference (already exists)
// Add auto-expiry fields:
model NotificationPreference {
  // ... existing fields ...
  autoExpiryEnabled      Boolean  @default(true)
  autoExpiryThresholdDays Int     @default(14)
}

model AutoExpiryDigest {
  id          String   @id @default(uuid())
  userId      String
  sentAt      DateTime @default(now())
  resolvedAt  DateTime?
  status      String   // "PENDING" | "USER_RESOLVED" | "AUTO_RESOLVED"
  user        User     @relation(fields: [userId], references: [id])

  @@index([userId, status])
}

// Extend ConsumptionEvent.method to add AUTO_EXPIRED
// In schema, update the method field default or add a string enum check
```

The `ConsumptionEvent` already has a `type` field. We add `method` (if not already present) or extend notes to indicate `AUTO_EXPIRED`.

> **Note:** Check `back/prisma/schema.prisma` before migration — `ConsumptionEvent` may already have a method/source field from TKT-014. Align with existing field if it exists.

Migration: `npx prisma migrate dev --name add-auto-expiry-digest`.

---

## Technical Implementation Tasks

Follow TDD: write failing tests before implementing.

1. **Update `NotificationPreference` migration** — add `autoExpiryEnabled` (default true) and `autoExpiryThresholdDays` (default 14). Existing rows get the default values (no data loss).

2. **Auto-expiry settings endpoints** (`back/src/modules/notifications/notifications.controller.ts`)
   - `GET /settings/auto-expiry` — read `autoExpiryEnabled` and `autoExpiryThresholdDays` from `NotificationPreference`.
   - `PATCH /settings/auto-expiry` — update both fields.
   - Unit tests: 200 responses, validation (thresholdDays 7–60 range).

3. **Expired candidates query** (`back/src/modules/pantry/pantry.service.ts`)
   - `getExpiredCandidates(userId): Promise<ExpiredCandidate[]>`
     - Query `PantryItem` where `status = ACTIVE` and `expirationDate < now() - threshold days`.
     - Exclude items already covered by a `PENDING` `AutoExpiryDigest` within the last 7 days.
   - Unit tests: verify threshold filter, verify exclusion of recently digested items.

4. **Expired candidates endpoint** (`back/src/modules/pantry/pantry.controller.ts`)
   - `GET /pantry/items/expired-candidates` — calls `getExpiredCandidates`, returns with active `digestId`.

5. **Bulk-waste endpoint** (`back/src/modules/pantry/pantry.controller.ts`)
   - `POST /pantry/items/bulk-waste` — validates all `itemIds` belong to the user, calls `registerItemEvent(id, WASTED)` for each in a transaction, resolves the active `AutoExpiryDigest`.
   - Unit tests: verify all items consumed, transaction rollback on partial failure, digest resolved.

6. **Bulk-dismiss endpoint**
   - `POST /pantry/items/bulk-dismiss-expired` — marks items as dismissed in the digest (does not waste them), resolves digest with `USER_RESOLVED`.
   - This keeps the items in the pantry with their current state.

7. **Daily scheduled job** (`back/src/modules/pantry/auto-expiry-cron.service.ts`)
   - Runs daily at 08:00 UTC.
   - For each user with `autoExpiryEnabled = true`:
     - Call `getExpiredCandidates(userId)`.
     - If candidates exist and no `PENDING` digest in last 7 days:
       - Create `AutoExpiryDigest` with `status = PENDING`.
       - Call `NotificationDeliveryService.deliverDigest(userId, candidates)`.
   - Unit tests: mock notification and DB, verify digest created for eligible users, not for users with disabled auto-expiry.

8. **Auto-resolve job** (can be part of the same cron or a separate weekly job)
   - For each `AutoExpiryDigest` with `status = PENDING` and `sentAt < now() - 7 days`:
     - Auto-waste all original candidate items (re-query them).
     - Mark each with `ConsumptionEvent.notes = 'AUTO_EXPIRED'` or `method = 'AUTO_EXPIRED'`.
     - Update digest `status = AUTO_RESOLVED`, `resolvedAt = now()`.
   - Unit tests: verify auto-waste fires after 7-day grace, not before.

9. **Notification delivery** (`back/src/modules/notifications/notification-delivery.service.ts`)
   - New method: `deliverDigest(userId, items)` — sends email or push listing expired candidates with "Review now" link.
   - Degrade gracefully if EXT-001 is not yet live: log the digest but don't fail.

10. **Frontend — expired items banner** (`front/src/routes/pantry.tsx`)
    - On mount, call `GET /pantry/items/expired-candidates`.
    - If candidates exist: show a dismissible banner at the top of the pantry list: "X items may be expired — review now".
    - Banner links to a modal/sheet showing the candidate items.

11. **Bulk review modal** (new component `front/src/components/ExpiredItemsReview.tsx`)
    - Lists expired candidates with name, days expired, estimated value.
    - "Mark all as wasted" button → `POST /pantry/items/bulk-waste`.
    - Per-item: "Keep" button → dismisses that item from the list.
    - "Dismiss all" → `POST /pantry/items/bulk-dismiss-expired`.
    - Success: banner hides, pantry list refreshes.
    - Vitest: renders candidates, bulk-waste calls API, dismiss calls API.

12. **Settings toggle** (`front/src/routes/settings.tsx`)
    - New toggle: "Auto-expire stale items" with description "Items expired for more than X days will be automatically marked as wasted."
    - Threshold input (number, 7–60 days range).
    - Calls `PATCH /settings/auto-expiry`.
    - Vitest: toggle on/off triggers PATCH, threshold saves.

---

## Error Handling

- Partial failure in `bulk-waste` (one item fails): transaction rolls back; return 500 with a list of failed items so the UI can show which ones need manual action.
- Auto-resolve job failure for a specific user: log error, continue to next user (don't abort the whole batch).
- If `EXT-001` is not live, skip the push/email notification but still create the `AutoExpiryDigest` — the expired items banner on the frontend is the fallback UX.

---

## Security

- `bulk-waste` and `bulk-dismiss` validate that every `itemId` in the request belongs to the authenticated user's household — no cross-user waste.
- `AutoExpiryDigest` is user-scoped; no endpoint exposes another user's digests.
- Auto-resolve job runs under a system context (no user JWT) — all DB operations are explicitly scoped by `userId` from the digest record.

---

## Testing Requirements

| Test type | Coverage |
|---|---|
| Unit — expired candidates query | threshold filter, recent digest exclusion |
| Unit — bulk-waste | transaction, digest resolution |
| Unit — auto-resolve cron | 7-day grace, auto-waste fires, status updated |
| Unit — daily digest cron | eligible users get digest, disabled users skipped |
| Vitest — pantry banner | shows when candidates exist, hides after resolve |
| Vitest — review modal | renders items, bulk-waste, dismiss |
| Integration | seed expired item, trigger cron, verify digest created; trigger auto-resolve cron, verify item wasted |

---

## Acceptance Criteria

1. A pantry item expired for more than 14 days (default threshold) appears in `GET /pantry/items/expired-candidates`.
2. The pantry page shows a banner when expired candidates exist; the banner hides after the user resolves all candidates.
3. "Mark all as wasted" creates WASTED events for all candidates and removes them from the pantry.
4. "Dismiss all" keeps items in the pantry and hides the banner for 7 days.
5. If the user takes no action within 7 days of the digest, items are automatically wasted with `notes = 'AUTO_EXPIRED'`.
6. Users with `autoExpiryEnabled = false` in settings never receive a digest and items are never auto-wasted.

---

## Non-Goals

- Per-item auto-expiry threshold (different thresholds per category) — global threshold only.
- Undo of auto-waste — use the existing re-add flow (EXT from TKT-014 re-add feature) if the user wants the item back.
- ML-based expiry prediction to improve the threshold — pure threshold approach only.

---

## Open Questions

1. Should "dismiss all" hide the banner for 7 days or permanently? (Recommendation: 7 days — if items are still in the pantry and still expired, they should resurface.)
2. Should the auto-resolve job email a summary ("3 items were automatically marked as wasted") after it runs? (Recommendation: yes, if EXT-001 is live — use `deliverDigest` with a summary variant.)

---

## Readiness Check

- [x] Clear actor and value
- [x] Testable acceptance criteria
- [x] Scope is a contained new job + UI banner + review modal
- [x] Dependencies identified (TKT-009 done; EXT-001 optional for notification delivery)
