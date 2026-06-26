# Phase 1 Data Model: Consumption Automation for Long-Expired Items

Source of truth is `back/prisma/schema.prisma`; this document describes the additions and how they
map to the spec entities. See [research.md](./research.md) for the reconciliation rationale.

## New model: `AutoExpiryDigest`

Represents one batch of stale candidates surfaced to a user at a point in time (spec entity
**Auto-Expiry Digest**).

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String @id @default(uuid())` | Primary key. |
| `userId` | `String` | Owner; FK to `User`. |
| `sentAt` | `DateTime @default(now())` | When the digest was created/notified. Drives the 7-day grace. |
| `resolvedAt` | `DateTime?` | Set when status leaves `PENDING`. Drives 7-day dismiss suppression. |
| `status` | `String` | `"PENDING"` \| `"USER_RESOLVED"` \| `"AUTO_RESOLVED"`. |
| `user` | `User @relation(...)` | `onDelete: Cascade`. |

**Indexes**: `@@index([userId, status])` (look up a user's pending digest),
`@@index([status, sentAt])` (auto-resolve scan for `PENDING` older than grace).

**State transitions**:

```text
            create (daily pass, candidates exist, no recent digest)
                              │
                              ▼
                          PENDING ──── bulk-waste / bulk-dismiss ────▶ USER_RESOLVED
                              │                                          (resolvedAt = now)
                              │ sentAt < now - 7d (auto-resolve pass)
                              ▼
                        AUTO_RESOLVED
                        (resolvedAt = now; candidates auto-wasted)
```

A user has **at most one** `PENDING` digest at a time (enforced by the daily pass's "no PENDING
digest" guard, not a DB constraint).

**Validation / invariants**:

- `status` is always one of the three literals (enforced in code; stored as `String` per R2/R3
  lightweight-string convention).
- `resolvedAt` is non-null iff `status != PENDING`.
- Only the daily pass creates digests; only bulk endpoints and the auto-resolve pass transition them.

## Modified model: `NotificationPreference`

Adds the per-user **Automatic-Expiry Setting** (spec entity).

| New field | Type | Notes |
|-----------|------|-------|
| `autoExpiryEnabled` | `Boolean @default(true)` | FR-011. Default on (FR-018). |
| `autoExpiryThresholdDays` | `Int @default(14)` | FR-012. Must be 7–60 (validated in DTO, not DB). |

Existing rows receive defaults automatically via Prisma column defaults — no backfill (FR-018).
`@unique userId` already present; one row per user.

## Modified model: `ConsumptionEvent`

Adds the **Waste Record** automatic-expiry tag (spec entity).

| New field | Type | Notes |
|-----------|------|-------|
| `method` | `String?` | `null` = user-initiated (manual consume/waste/bulk). `"AUTO_EXPIRED"` = auto-resolve pass. SC-005. |

No change to existing fields. Manual paths (`registerEvent`, bulk-waste) leave `method` `null`; only
`runAutoResolvePass` sets `"AUTO_EXPIRED"`. Optionally indexed via existing `@@index([userId, type])`;
no new index required (auto-expired filtering is low-volume / history-only).

## Read-only model: `PantryItem` (no schema change)

"Stale Candidate" (spec entity) is **derived**, not stored:

```text
stale candidate  ⇔  PantryItem row where expirationDate != null
                     AND expirationDate < (now - autoExpiryThresholdDays days)
```

Derived per-candidate fields returned to the client:

| Field | Derivation |
|-------|------------|
| `id` | `PantryItem.id` |
| `name` | `PantryItem.name` |
| `expirationDate` | `PantryItem.expirationDate` |
| `daysExpired` | `floor((now - expirationDate) / 1 day)` |
| `estimatedValueEur` | from `PantryItem.pricePaid` (same `computeEstimatedValue` basis used by `registerEvent`); `null` when no price |

## Relationship overview

```text
User 1──* AutoExpiryDigest        (new)
User 1──1 NotificationPreference  (existing; +autoExpiry fields)
User 1──* PantryItem              (existing; read-only source of candidates)
User 1──* ConsumptionEvent        (existing; +method tag; written by bulk-waste & auto-resolve)
PantryItem 1──* ConsumptionEvent  (existing; bulk-waste creates event + deletes item, per registerEvent)
```

## Migration

`npx prisma migrate dev --name add_auto_expiry` generating:

- `CREATE TABLE "AutoExpiryDigest"` + two indexes.
- `ALTER TABLE "NotificationPreference" ADD COLUMN "autoExpiryEnabled" / "autoExpiryThresholdDays"`
  with defaults (safe for existing rows).
- `ALTER TABLE "ConsumptionEvent" ADD COLUMN "method"` nullable (safe for existing rows).

No destructive changes; all additions are backward-compatible.
