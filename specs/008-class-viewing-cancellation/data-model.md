# Data Model: Class Viewing & Cancellation

**Phase 1 output** — entities consumed by this feature. **No Prisma schema changes or migrations are required**: all entities below already exist in `backend/prisma/schema.prisma`.

## Entities

### TrainingClass (Class occurrence)

Existing model, fields relevant to this feature:

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `class_type` | `ClassType` | `INDIVIDUAL` \| `GROUP` |
| `assigned_coach_id` | UUID | FK → `User`; the only non-Admin allowed to cancel |
| `level_id` | UUID? | group classes only |
| `start_time` | DateTime (UTC) | drives date-range queries |
| `duration_minutes` | Int | always 60 |
| `status` | `ClassStatus` | `ACTIVE` \| `CANCELED` |
| `description` | String? | |
| `recurrence_series_id` | UUID? | null for one-off classes |
| `google_event_id` | String? | set at creation; deleted event on cancel |
| `created_by` | UUID | FK → `User` |
| `enrollments` / `waitingLists` | relations | 1-to-many |

**State transition**: `ACTIVE → CANCELED` (terminal). No reverse transition; no other transitions in this feature. Cancellation never deletes the row.

### RecurrenceSeries

Existing model (`id`, `class_type`, `level_id`, `coach_id`, `day_of_week`, `start_time`, `start_date`, `created_by`). Grouping of weekly occurrences via `TrainingClass.recurrence_series_id`. **No status column** — a "canceled series" is expressed by its future instances being `CANCELED`.

### ClassEnrollment

Existing model (`class_id`, `coachee_id`, `joined_at`, `@@unique([class_id, coachee_id])`). Source of the enrolled-coachee list, `enrollmentCount`, capacity math, and the recipients of cancellation notifications.

### WaitingList

Existing model (`class_id`, `coachee_id`, `joined_at`, `@@unique([class_id, coachee_id])`). Source of `hasWaitingList` / `waitingListCount`. Not modified by this feature (promotion deferred to EP-04).

### User

Existing model. Roles consumed: `ADMIN` (can cancel any class), `COACH` (can cancel own/assigned classes), `COACHEE` (read-scoped visibility only). `status = ACTIVE` is a precondition for being an assigned coach.

### Level

Existing model (`sort_order`). Used for group-class display and Coachee `visibility` (within-reach calculation via `ReachCalculator`).

### Notification

Existing model (`notification_type`, `recipient_id`, `class_id`, `content`, `is_read`, `sent_at`). This feature **creates** rows of type `7` ("La clase de [nivel] del [fecha/hora] ha sido cancelada.") for each enrolled Coachee of a canceled instance. Dispatching (FCM) is EP-04.

### SecurityAuditLog

Existing model (`actor_id`, `action`, `resource`, `resource_id`, `outcome`). This feature writes:
- `action = "class.cancel"`, `resource = "TrainingClass"`, `resource_id = <class id>`, `outcome = "SUCCESS"` (on successful cancel)
- `action = "class.cancel"`, `resource = "TrainingClass"`, `resource_id = <class id>`, `outcome = "DENIED"` (on authorization rejection)

## Derived values (computed, not stored)

| Value | Rule |
|-------|------|
| `capacity` | `4` for group, `1` for individual |
| `enrollmentCount` | `enrollments.length` |
| `hasWaitingList` / `waitingListCount` | `waitingLists.length > 0` / `length` |
| `isRecurring` | `recurrence_series_id != null` |
| `canceledInstances` (series cancel) | count of future `ACTIVE` instances newly set to `CANCELED` (target included, already-canceled skipped) |

## Relationships at a glance

```text
User ──assignedCoach──< TrainingClass >──recurrenceSeries── RecurrenceSeries
User ──createdBy──────< TrainingClass >
TrainingClass ──< ClassEnrollment >── User (coachee)
TrainingClass ──< WaitingList >── User (coachee)
TrainingClass ──< Notification (type 7) ── User (coachee)
```
