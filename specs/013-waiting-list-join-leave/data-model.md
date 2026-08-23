# Data Model: Waiting List Join/Leave

**Phase 1 output** — entities consumed by this feature. **No Prisma schema changes or migrations are required**: all entities below already exist in `backend/prisma/schema.prisma`.

## Entities

### WaitingList

Existing model (`backend/prisma/schema.prisma:133`) — the only entity **written (create/delete)** by this feature.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `class_id` | UUID | FK → `TrainingClass` |
| `coachee_id` | UUID | FK → `User` (role COACHEE) |
| `joined_at` | DateTime | default now |
| `@@unique([class_id, coachee_id])` | — | DB backstop for `ALREADY_ON_WAITING_LIST` |

**Lifecycle in this feature**: created on a successful Coachee join; deleted on the Coachee's voluntary leave. Max 4 entries per class is enforced by the domain policy over `waitingLists.length` (inside a `Serializable` transaction), not by the DB.

### TrainingClass (read-only)

Existing model. Fields consumed: `id`, `class_type` (`INDIVIDUAL`/`GROUP`), `level_id` (drives reach), `start_time`, `duration_minutes` (always 60), `status` (`ACTIVE`/`CANCELED`), `assigned_coach_id` (displayed on the list view), `enrollments` (count + membership → occupancy), `waitingLists` (count → list fullness).

- **Join eligibility preconditions by type**:
  - Group: `status = ACTIVE` and `enrollments.length >= 4` (full).
  - Individual: `status = ACTIVE` and `enrollments.length >= 1` (occupied slot).
  - Both: not already enrolled, not already on the list, within level reach.

### Level (read-only)

Existing model. `Level.sort_order` feeds `isWithinReach(coacheeSortOrder, classSortOrder)` (±1). A Coachee without a level is out of reach for every class (`LEVEL_MISMATCH`).

### User (read-only)

Existing model. Only the authenticated active `COACHEE` may join/leave/view; the Coachee is identified exclusively from the JWT (`req.user.id`) — never from a request body field. The owner check for leave compares the JWT id against the entry's `coachee_id`.

### ClassEnrollment (read-only)

Existing model. `ClassEnrollment` rows determine occupancy: `enrollmentCount = class.enrollments.length`. The `alreadyEnrolled` rule for waiting lists reuses this membership: an enrollment row for `(class_id, coachee_id)` blocks joining that class's waiting list. Individual capacity is **1** (occupied when `length >= 1`); group capacity is **4** (`GROUP_MAX_COACHEES`).

### Notification (written by join/leave)

Existing model (`notification_type`, `recipient_id`, `class_id`, `content`, ...). This feature records rows for the acting Coachee (record-only; FCM dispatch is EP-04 / notifications epic):
- `9` — Coachee joined a waiting list ("Te has apuntado a la waiting list...")
- `10` — Coachee left a waiting list ("Has salido de la waiting list...")

### SecurityAuditLog (written)

Existing model (`actor_id`, `action`, `resource`, `resource_id`, `outcome`). This feature writes:
- `action = "waiting-list.join"`, `resource = "WaitingList"`, `resource_id = <class id>`, `outcome = "SUCCESS"` (successful join)
- `action = "waiting-list.join"`, `resource = "WaitingList"`, `resource_id = <class id>`, `outcome = "DENIED"` (refused join)
- `action = "waiting-list.leave"`, `resource = "WaitingList"`, `resource_id = <class id>`, `outcome = "SUCCESS"` (successful leave)
- `action = "waiting-list.leave"`, `resource = "WaitingList"`, `resource_id = <class id>`, `outcome = "DENIED"` (refused leave / non-owner)

## Derived values (computed, not stored)

| Value | Rule |
|-------|------|
| `capacity` (group) | `4` (`GROUP_MAX_COACHEES`); `1` for individual |
| `groupIsFull` | `enrollments.length >= 4` (group) |
| `individualSlotOccupied` | `enrollments.length >= 1` |
| `waitingListFull` | `waitingLists.length >= 4` |
| `withinReach` | `isWithinReach(coacheeLevel.sort_order, classLevel.sort_order)` — ±1 |
| `alreadyEnrolled` | an enrollment row exists for `(class_id, coachee_id)` |
| `alreadyOnWaitingList` | a waiting-list row exists for `(class_id, coachee_id)` |
| `hasOpenSpots` | group: `enrollments.length < 4`; individual: `enrollments.length < 1` (list-view informational flag) |
| notification type | `9` on join, `10` on leave (`WaitingListPolicy`) |

## State transitions

```text
                      POST /classes/:id/waiting-list (Coachee, ACTIVE, eligibility passes)
None ─────────────────────────────────────────────────────────────► On waiting list (1..4 per class)
                                                                     │
                                                                     │ DELETE /classes/:id/waiting-list (the waitlisted Coachee only)
                                                                     ▼
                                                                   None (row deleted; slot freed; notification #10 recorded)
```

- No penalty or restriction is ever applied on leaving; leaving notifies nobody outside the acting Coachee.
- A join/leave attempt against a `CANCELED` class is refused (`VALIDATION_ERROR`, no change).
- Join attempts against a not-full group class or an unoccupied individual slot are refused (`VALIDATION_ERROR`, no change).
- Being on a waiting list NEVER auto-enrolls the Coachee in this release (EP-04); a `hasOpenSpots` indicator is informational only.
- The `TrainingClass` status and enrollment rows are never modified by this feature.

## Relationships at a glance

```text
User (coachee) ──< WaitingList >── TrainingClass
TrainingClass ──< ClassEnrollment >── User (coachee)      (occupancy for the occupied/full rules)
User (coachee) ──< Notification (type 9/10)               (record-only)
User (actor) ──< SecurityAuditLog
```