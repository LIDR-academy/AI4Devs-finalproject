# Data Model: Class Enrollment & Cancellation

**Phase 1 output** — entities consumed by this feature. **No Prisma schema changes or migrations are required**: all entities below already exist in `backend/prisma/schema.prisma`.

## Entities

### ClassEnrollment

Existing model — the only entity **written (create/delete)** by this feature.

| Field | Type | Notes |
|-------|------|-------|
| `id` | UUID | PK |
| `class_id` | UUID | FK → `TrainingClass` |
| `coachee_id` | UUID | FK → `User` (role COACHEE) |
| `joined_at` | DateTime | default now |
| `@@unique([class_id, coachee_id])` | — | DB backstop for `ALREADY_ENROLLED` |

**Lifecycle in this feature**: created on a successful Coachee join; deleted on the enrolled Coachee's cancellation. Cancellation never deletes the `TrainingClass`, only the enrollment row. For group classes a new enrollment increments the class's enrollment count by exactly one; a cancellation decrements it.

### TrainingClass (read-only)

Existing model. Fields consumed: `id`, `class_type` (`INDIVIDUAL`/`GROUP`), `level_id` (group only), `start_time` (UTC, drives overlap math), `duration_minutes` (always 60 — the overlap window), `status` (`ACTIVE`/`CANCELED`), `assigned_coach_id` (recipient of cancellation notification rows), `enrollments` (count + membership).

- **Join eligibility precondition**: `status = ACTIVE` and `class_type = GROUP`; individual classes are assignment-only (refused with `VALIDATION_ERROR`).

### Level (read-only)

Existing model. `Level.sort_order` feeds `ReachCalculator.isWithinReach(coacheeSortOrder, classSortOrder)` (±1). A Coachee has `level_id`; a group class has `level_id`. A Coachee without a level is out of reach for every class (`LEVEL_MISMATCH`).

### User (read-only)

Existing model. Only the authenticated `COACHEE` with `status = ACTIVE` may join/cancel; the Coachee is identified exclusively from the JWT (`req.user.id`) — never from a request body field. The assigned Coach (`assigned_coach_id`) is the recipient of the cancellation notification row.

### WaitingList (read-only)

Existing model. Used only to detect an opened spot on cancellation: `openedSpotDetected = waitingLists.length > 0`. Records in the waiting list are **not** promoted in this release (EP-04).

### Notification (written by cancellation)

Existing model (`notification_type`, `recipient_id`, `class_id`, `content`, ...). On a successful cancellation this feature creates **one row for the assigned Coach**:
- `3` — Coachee canceled an assigned **individual** class
- `4` — Coachee canceled a **group** class that **has** a waiting list
- `5` — Coachee canceled a **group** class with **no** waiting list

FCM dispatch: the assigned Coach receives a push for every cancellation row (types `3`/`4`/`5`). Type `4` (waiting-list group) is pushed by `ProcessWaitingListService` after the transaction commits (see `processSpotOpened`); types `3`/`5` are pushed by `CancelEnrollment` after the transaction commits, via `deviceTokenRepo.listActiveTokens` + `notificationSender.send` — the same path used by `SendNotification` (push data carries `notificationId`, `type`, `classId`; permanently failed tokens are deactivated). Push delivery is best-effort: a delivery failure never fails the cancellation.

### SecurityAuditLog (written)

Existing model (`actor_id`, `action`, `resource`, `resource_id`, `outcome`). This feature writes:
- `action = "class.enroll"`, `resource = "ClassEnrollment"`, `resource_id = <class id>`, `outcome = "SUCCESS"` (successful join)
- `action = "class.enroll"`, `resource = "ClassEnrollment"`, `resource_id = <class id>`, `outcome = "DENIED"` (refused join)
- `action = "class.cancel-enrollment"`, `resource = "ClassEnrollment"`, `resource_id = <class id>`, `outcome = "SUCCESS"` (successful cancellation)
- `action = "class.cancel-enrollment"`, `resource = "ClassEnrollment"`, `resource_id = <class id>`, `outcome = "DENIED"` (refused cancellation / non-Coachee)

## Derived values (computed, not stored)

| Value | Rule |
|-------|------|
| `capacity` (group) | `4` (`GROUP_MAX_COACHEES`); `1` for individual |
| `classIsFull` | `enrollments.length >= capacity` (group) |
| `withinReach` | `isWithinReach(coacheeLevel.sort_order, classLevel.sort_order)` — ±1 |
| `overlap` | `hasOverlap([coachee's other enrolled ACTIVE classes], target 60-min window)` |
| `alreadyEnrolled` | an enrollment row exists for `(class_id, coachee_id)` |
| `openedSpotDetected` | `waitingLists.length > 0` on cancellation |
| notification type | `3`/`4`/`5` per `EnrollmentPolicy.coachNotificationTypeForCancellation` |

## State transitions

```text
              POST /classes/:id/enrollment (Coachee, group, ACTIVE, rules pass)
None ───────────────────────────────────────────────────────► Enrolled
                                                               │
                                                               │ DELETE /classes/:id/enrollment (the enrolled Coachee only)
                                                               ▼
                                                             None (row deleted; spot freed; Coach notified row)
```

- No penalty or restriction is ever applied on cancellation.
- A join/cancel attempt against a `CANCELED` class is refused (`VALIDATION_ERROR`, no change).
- The `TrainingClass` status itself is never modified by this feature.

## Relationships at a glance

```text
User (coachee) ──< ClassEnrollment >── TrainingClass >── user (assigned coach)
TrainingClass ──< WaitingList >── User (coachee)
TrainingClass ──< Notification (type 3/4/5) >── User (assigned coach)
User (actor) ──< SecurityAuditLog
```