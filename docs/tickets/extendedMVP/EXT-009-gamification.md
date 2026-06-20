# EXT-009 — Gamification and Achievement System

## Metadata
- **Type:** Full-Stack (Backend + Frontend)
- **Priority:** P2
- **Phase:** 2 — Growth
- **PRD Reference:** [P2-005](../../product/5_Extended-Non-MVP-PRD.md#p2-005-gamification-and-achievement-system)
- **Effort:** Medium
- **Depends on:** TKT-009 (consumption events — done), EXT-001 (notification delivery — for badge push)

---

## User Story

As a user, I want to earn points and see badges for reducing food waste, so that I stay motivated and build better habits over time.

---

## Context

The MVP already records every `ConsumptionEvent` with type (`CONSUMED` or `WASTED`), estimated value, and timestamp. This gives the gamification layer a rich signal to work with.

Scoring model:
- **+10 points** for each item consumed before expiry.
- **+5 points** bonus if consumed with ≥ 3 days to spare.
- **0 points** for items consumed past expiry (still counts as consumed, just no points).
- **−5 points** for each item wasted.

Badges:
- `FIRST_SAVE` — first item consumed before expiry.
- `ZERO_WASTE_WEEK` — no wasted items in a calendar week (Mon–Sun).
- `SAVER_10` / `SAVER_50` / `SAVER_100` — milestone: 10 / 50 / 100 items consumed before expiry.
- `MONEY_SAVER_10` — cumulative value saved (not wasted) ≥ €10.

---

## Affected Slices

| Slice | Path | Change |
|---|---|---|
| Prisma schema | `back/prisma/schema.prisma` | Add `UserPoints`, `UserBadge` models |
| Backend — module | `back/src/modules/gamification/` | New NestJS module |
| Backend — module | `back/src/modules/pantry/` | Hook into consumption event creation |
| Backend — app | `back/src/app.module.ts` | Register `GamificationModule` |
| Frontend — routes | `front/src/routes/achievements.tsx` | New achievements/points page |
| Frontend — features | `front/src/features/gamification/` | API bindings + types |
| Frontend — dashboard | `front/src/routes/dashboard.tsx` | Add points summary widget |

---

## API Contracts

```
GET /api/gamification/summary
Response: {
  totalPoints: number
  totalValueSavedEur: number
  totalValueWastedEur: number
  consumedBeforeExpiryCount: number
  wastedCount: number
  badges: Array<{
    id: string
    code: string       // "ZERO_WASTE_WEEK" | "FIRST_SAVE" | ...
    earnedAt: string
    label: string
    description: string
  }>
  weeklyStreak: number    // consecutive zero-waste weeks
}

GET /api/gamification/history?limit=20&offset=0
Response: {
  events: Array<{
    id: string
    type: "POINTS_EARNED" | "POINTS_DEDUCTED" | "BADGE_EARNED"
    points: number | null
    badgeCode: string | null
    reason: string
    occurredAt: string
  }>
  total: number
}
```

---

## Data Model Changes

```prisma
model UserPoints {
  id          String   @id @default(uuid())
  userId      String
  delta       Int      // positive = earned, negative = deducted
  reason      String   // "CONSUMED_BEFORE_EXPIRY" | "WASTED" | "BONUS_3_DAYS" etc.
  referenceId String?  // ConsumptionEvent.id that triggered this
  occurredAt  DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id])

  @@index([userId, occurredAt])
}

model UserBadge {
  id        String   @id @default(uuid())
  userId    String
  code      String   // "FIRST_SAVE" | "ZERO_WASTE_WEEK" | ...
  earnedAt  DateTime @default(now())
  user      User     @relation(fields: [userId], references: [id])

  @@unique([userId, code])   // each badge earned once
  @@index([userId])
}
```

Migration: `npx prisma migrate dev --name add-gamification`.

---

## Technical Implementation Tasks

Follow TDD: write failing tests before implementing.

1. **Prisma migration** — add `UserPoints` and `UserBadge` models, run migration.

2. **Points engine** (`back/src/modules/gamification/points.service.ts`)
   - `processConsumptionEvent(event: ConsumptionEvent): Promise<void>`
     - If `event.type === CONSUMED`:
       - Check `event.itemExpirationDate` vs `event.occurredAt`.
       - If consumed before expiry: `+10` points; if ≥ 3 days to spare: additional `+5`.
       - If consumed past expiry: `0` points.
     - If `event.type === WASTED`: `−5` points.
     - Write `UserPoints` row.
     - After writing points, call `BadgeService.evaluateBadges(userId)`.
   - Unit tests: each combination (before expiry / on time / past / wasted), verify correct delta written.

3. **Badge service** (`back/src/modules/gamification/badge.service.ts`)
   - `evaluateBadges(userId): Promise<void>` — checks all badge conditions and awards new ones:
     - `FIRST_SAVE`: consumed count = 1.
     - `SAVER_10/50/100`: consumed count = 10/50/100 (query `UserPoints` SUM).
     - `MONEY_SAVER_10`: sum of `estimatedValueEur` on CONSUMED events ≥ 10.
     - `ZERO_WASTE_WEEK`: no WASTED events in the current Mon–Sun week (run weekly on cron too).
   - Each check: if condition met and no existing `UserBadge` row → insert, fire notification.
   - Unit tests: mock UserPoints queries, verify badge created on threshold, not duplicated.

4. **Gamification service** (`back/src/modules/gamification/gamification.service.ts`)
   - `getSummary(userId): Promise<GamificationSummary>` — aggregate points, badges, weekly streak.
   - `getHistory(userId, limit, offset): Promise<PointsHistoryPage>`.
   - Unit tests: verify summary aggregation with seed data.

5. **Gamification controller** (`back/src/modules/gamification/gamification.controller.ts`)
   - `GET /gamification/summary` → `getSummary`.
   - `GET /gamification/history` → `getHistory`.
   - Unit tests: 200 responses, pagination params forwarded.

6. **GamificationModule** — register all services and controller.

7. **Hook into consumption event creation** (`back/src/modules/pantry/pantry.service.ts`)
   - After `ConsumptionEvent` is created successfully (in `registerItemEvent`), call `PointsService.processConsumptionEvent(event)`.
   - Fire-and-forget: wrap in `try/catch`, log any error but do not fail the consume operation.
   - Unit test: verify `processConsumptionEvent` called after successful event; not called on failure.

8. **Weekly cron for ZERO_WASTE_WEEK** (`back/src/modules/gamification/gamification-cron.service.ts`)
   - Runs Sunday 23:55 UTC.
   - For each user with at least one event in the past week: evaluate `ZERO_WASTE_WEEK` badge.

9. **Frontend — API bindings** (`front/src/features/gamification/gamification.api.ts`)
   - `getGamificationSummary(): Promise<GamificationSummary>`
   - `getPointsHistory(limit, offset): Promise<PointsHistoryPage>`

10. **Achievements route** (`front/src/routes/achievements.tsx`)
    - Shows total points, value saved (€), badges grid (earned = full colour, locked = grey with requirement hint).
    - Points history list (paginated, 20 per page).
    - Vitest: renders badges, shows points total, renders history list.

11. **Dashboard widget** (`front/src/routes/dashboard.tsx` or `front/src/components/PointsSummaryWidget.tsx`)
    - Small card showing total points, most recent badge, weekly streak.

---

## Badge Push Notification

When a badge is earned, send a push notification via `NotificationDeliveryService` (EXT-001):
- Title: "You earned a badge!"
- Body: `{badge.label} — {badge.description}`

If EXT-001 is not yet deployed, log the badge award only (no notification). Do not block badge persistence on notification delivery.

---

## Error Handling

- `processConsumptionEvent` failure must not fail the consume API call — wrap in `try/catch`.
- `BadgeService.evaluateBadges` failure is logged as warning — partial badge evaluation is acceptable.
- If `UserBadge` unique constraint fires (badge already earned), treat as no-op (expected behavior on retry).

---

## Security

- All gamification endpoints are JWT-protected.
- Points and badges are scoped to `userId` extracted from JWT — no user can query or modify another user's gamification state.
- `UserPoints.referenceId` stores the `ConsumptionEvent.id` for auditability; the event itself is never exposed through the gamification endpoint.

---

## Testing Requirements

| Test type | Coverage |
|---|---|
| Unit — points engine | all consume/waste combinations, bonus threshold |
| Unit — badge service | each badge condition, idempotent on repeat |
| Unit — gamification service | summary aggregation, history pagination |
| Unit — pantry service hook | processConsumptionEvent called; error does not fail consume |
| Vitest — achievements route | renders badges, shows correct points |
| Integration | consume item, verify UserPoints row and badge created |

---

## Acceptance Criteria

1. Consuming an item before its expiry date awards +10 points (visible immediately in the dashboard widget).
2. Consuming with ≥ 3 days to spare adds an additional +5 bonus.
3. Wasting an item deducts 5 points.
4. The `FIRST_SAVE` badge is awarded on the user's first consume-before-expiry event and is not awarded again.
5. The `ZERO_WASTE_WEEK` badge is awarded at the end of any week with no wasted items.
6. The achievements page shows earned badges in full colour and locked badges in grey with the unlock condition.
7. Points and badge computation never fail the consume API — errors are logged and silently swallowed.

---

## Non-Goals

- Cross-user leaderboard (deferred to [6_Future-Capabilities.md](../../product/6_Future-Capabilities.md)).
- CO₂ equivalent calculation (complex; deferred to future enhancement).
- Points decay over time.
- Points redemption / rewards.

---

## Open Questions

1. Should points be shown per item in the pantry list (e.g. "+10 pts" badge)? (Recommendation: no, keep pantry list clean; points only visible in dashboard widget and achievements page.)
2. Should negative total points be displayed as 0 or as negative? (Recommendation: clamp to 0 in the UI — users should not feel punished beyond zero.)

---

## Readiness Check

- [x] Clear actor and value
- [x] Testable acceptance criteria
- [x] Scope is a self-contained new module with a hook into existing pantry flow
- [x] Dependencies identified (TKT-009 done; EXT-001 optional for badge push)
