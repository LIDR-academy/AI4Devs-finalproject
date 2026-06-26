# Phase 1 Data Model: Gamification and Achievement System

## New Prisma models

### `UserPoints`

A single signed adjustment to a user's score. One row per point-affecting action (plus a
separate row for the 3-day bonus).

| Field | Type | Notes |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `userId` | `String` | Owner; FK to `User` |
| `delta` | `Int` | Signed: `+10`, `+5`, `−5`. Past-expiry consume writes no row |
| `reason` | `String` | One of `CONSUMED_BEFORE_EXPIRY`, `BONUS_3_DAYS`, `WASTED` |
| `referenceId` | `String?` | `ConsumptionEvent.id` that triggered the change (audit) |
| `occurredAt` | `DateTime @default(now())` | When the change happened |
| `user` | `User @relation(fields: [userId], references: [id])` | |

Indexes: `@@index([userId, occurredAt])` (history ordering + summary aggregation).

```prisma
model UserPoints {
  id          String   @id @default(uuid())
  userId      String
  delta       Int
  reason      String
  referenceId String?
  occurredAt  DateTime @default(now())
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@index([userId, occurredAt])
}
```

> Note: `onDelete: Cascade` matches `ConsumptionEvent`'s relation to `User`; deleting a user
> removes their gamification rows.

### `UserBadge`

A record that a user has earned a specific badge. At most one row per `(userId, code)`.

| Field | Type | Notes |
|---|---|---|
| `id` | `String @id @default(uuid())` | Primary key |
| `userId` | `String` | Owner; FK to `User` |
| `code` | `String` | Badge code (see Badge Catalog below) |
| `earnedAt` | `DateTime @default(now())` | When earned |
| `user` | `User @relation(fields: [userId], references: [id])` | |

Constraints: `@@unique([userId, code])` (idempotency — FR-012), `@@index([userId])`.

```prisma
model UserBadge {
  id       String   @id @default(uuid())
  userId   String
  code     String
  earnedAt DateTime @default(now())
  user     User     @relation(fields: [userId], references: [id], onDelete: Cascade)

  @@unique([userId, code])
  @@index([userId])
}
```

### `User` model — back-relations (modification)

Add to the existing `User` model:

```prisma
  userPoints UserPoints[]
  userBadges UserBadge[]
```

**Migration**: `npx prisma migrate dev --name add-gamification`.

## Existing model consumed (read-only)

### `ConsumptionEvent` (unchanged)

Source signal for all computation. Relevant fields:
`type` (`CONSUMED` | `WASTED`), `itemExpirationDate?`, `occurredAt`, `estimatedValueEur?`,
`userId`, `id`. Already indexed by `@@index([userId, occurredAt])` and `@@index([userId, type])`.

## Badge Catalog (static, not stored)

Defined in code (`back/src/modules/gamification/badge-catalog.ts` and a frontend mirror). Each
entry: `code`, `label`, `description`, and an `unlockCondition` string for the locked UI state.

| Code | Label | Unlock condition |
|---|---|---|
| `FIRST_SAVE` | First Save | Consume your first item before it expires |
| `SAVER_10` | Saver 10 | Consume 10 items before expiry |
| `SAVER_50` | Saver 50 | Consume 50 items before expiry |
| `SAVER_100` | Saver 100 | Consume 100 items before expiry |
| `MONEY_SAVER_10` | Money Saver | Save €10 worth of food from waste |
| `ZERO_WASTE_WEEK` | Zero Waste Week | Complete a full week (Mon–Sun) with no wasted items |

## Derived / computed values (not persisted)

| Value | Source | Rule |
|---|---|---|
| `totalPoints` (display) | `SUM(UserPoints.delta)` | Clamped to `max(0, sum)` for display (FR-007); raw history preserved |
| `totalValueSavedEur` | `SUM(estimatedValueEur)` over before-expiry CONSUMED events | Decimal sum |
| `totalValueWastedEur` | `SUM(estimatedValueEur)` over WASTED events | Decimal sum |
| `consumedBeforeExpiryCount` | `COUNT(UserPoints where reason = CONSUMED_BEFORE_EXPIRY)` | Drives milestone badges |
| `wastedCount` | `COUNT(ConsumptionEvent where type = WASTED)` | |
| `weeklyStreak` | `ConsumptionEvent` by week | Consecutive completed Mon–Sun weeks with ≥1 event and 0 waste (bounded walk) |

## Point computation rules (from spec FR-001…FR-004)

| Event | Condition | Rows written |
|---|---|---|
| CONSUMED | before expiry, ≥ 3 days to spare | `CONSUMED_BEFORE_EXPIRY` (+10) **and** `BONUS_3_DAYS` (+5) |
| CONSUMED | before expiry, < 3 days to spare | `CONSUMED_BEFORE_EXPIRY` (+10) |
| CONSUMED | on/after expiry, or no expiry date | none (0 points) |
| WASTED | any | `WASTED` (−5) |

"Before expiry" = `occurredAt < itemExpirationDate`. "≥ 3 days to spare" =
`itemExpirationDate − occurredAt ≥ 3 days`. Missing `itemExpirationDate` ⇒ treated as not before
expiry (edge case in spec).

## Badge award rules (evaluated after each points write; ZERO_WASTE_WEEK also weekly)

| Badge | Awarded when |
|---|---|
| `FIRST_SAVE` | `consumedBeforeExpiryCount == 1` |
| `SAVER_10` / `SAVER_50` / `SAVER_100` | `consumedBeforeExpiryCount >= 10 / 50 / 100` |
| `MONEY_SAVER_10` | `totalValueSavedEur >= 10` |
| `ZERO_WASTE_WEEK` | A completed Mon–Sun week had ≥ 1 event and 0 waste (weekly job) |

Each award is guarded by the `@@unique([userId, code])` constraint; a duplicate insert is caught
and treated as a no-op (FR-012, error-handling spec).
