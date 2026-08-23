# Data Model: Calendar Block Management

**Phase 1 output** — entities consumed by this feature. One **additive migration** is required: `Block` gains a `status` column.

## Entities

### Block

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `block_type` | `BlockType` | `PERSONAL` \| `GYM_WIDE` |
| `created_by` | UUID | FK → `User`; the actor who created the block |
| `coach_id` | UUID? | FK → `User`; present for `PERSONAL`, null for `GYM_WIDE` |
| `status` | `ClassStatus` | **NEW**: `ACTIVE` \| `CANCELED`, `@default(ACTIVE)` (additive migration; existing rows backfill ACTIVE) |
| `start_time` | DateTime (UTC) | hour-aligned instant |
| `end_time` | DateTime (UTC) | hour-aligned instant; ≥ 60 min after `start_time` |
| `description` | String? | free-form note (privacy-scoped per PRD §12) |
| `google_event_id` | String? | set at creation; cleared on cancel |
| `created_at` | DateTime | |
| `updated_at` | DateTime | |

**State transition**: `ACTIVE → CANCELED` (terminal, soft-cancel). No reverse transition; cancellation never deletes the row; `google_event_id` is nulled on cancel. Canceled blocks are excluded from `GET /blocks`, from `GetAvailableSlots`, and from `CreateTrainingClass.loadSlotContext` overlap checks.

### User

Existing model. Roles consumed: `ADMIN` (creates any personal block or any gym-wide block; cancels any block), `COACH` (creates only personal blocks targeting self; cancels only own `PERSONAL` blocks). Target coaches for personal blocks must be `ADMIN`/`COACH` and `status = ACTIVE`. Relations already present: `createdBlocks` (`BlockCreator`), `coachBlocks` (`BlockedCoach`).

### TrainingClass

Existing model. Consumed read-only for overlap checks: ACTIVE classes assigned to the blocked Coach (personal blocks) or any ACTIVE class (gym-wide blocks) that overlaps the block window.

### SecurityAuditLog

Existing model. This feature writes:
- `action = "block.create"`, `resource = "BLOCK"`, `resource_id = <block id>`, `outcome = "SUCCESS" | "DENIED"` (success / authorization rejection)
- `action = "block.cancel"`, `resource = "BLOCK"`, `resource_id = <block id>`, `outcome = "SUCCESS" | "DENIED"`

No `Notification` rows are ever created for blocks (FR-015).

## Derived values (computed, not stored)

| Value | Rule |
|-------|------|
| `isCanceled` | `status === "CANCELED"` |
| `duration` | `end_time - start_time` (must be ≥ 1 hour at creation) |
| `alignedToHourBoundaries` | both instants have `getUTCMinutes() === 0 && getUTCSeconds() === 0` |
| `scopeOfOverlap` (create) | personal → classes of `coach_id` + `PERSONAL` blocks of `coach_id` + any `GYM_WIDE`; gym-wide → any active class + any active block |

## Relationships at a glance

```text
User ──createdBlock──< Block >──coachedBy── User (target coach, PERSONAL only)
Block ──overlaps── TrainingClass        (checked at creation only)
Block ──excludedFrom── GetAvailableSlots / CreateTrainingClass (when CANCELED)
```

## Migration

Additive: `ALTER TABLE "Block" ADD COLUMN "status" "ClassStatus" NOT NULL DEFAULT 'ACTIVE';` — existing `Block` rows (if any) become `ACTIVE`. Run `npm run db:generate && npm run db:migrate`. The ERD in `docs/system-architecture.md` is updated to include the `status` field.