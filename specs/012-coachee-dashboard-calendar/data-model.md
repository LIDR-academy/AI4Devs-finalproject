# Data Model: Coachee Dashboard & Calendar

**Phase 1 output** — entities consumed by this feature. **No Prisma schema changes or migrations are required**: all entities below already exist in `backend/prisma/schema.prisma`. The dashboard is a read-only aggregation over existing tables; the frontend consumes only DTOs.

## Entities

### User / Coachee (read-only)

Existing model. The authenticated `COACHEE` is identified exclusively from the JWT (`req.user.id`) — never from a request body. The coachee's `level_id → Level.sort_order` is the reach input for the joinable filter (a coachee without a level is out of reach for every class).

### Level (read-only)

Existing model. `Level.sort_order` feeds `ReachCalculator.isWithinReach(coacheeSortOrder, classSortOrder)` (±1). Also supplies `name`/`color` for the Home next-class card, joinable list, and calendar titles.

### TrainingClass (read-only)

Existing model. Fields consumed: `id`, `class_type` (`INDIVIDUAL`/`GROUP`), `status` (`ACTIVE`/`CANCELED`), `start_time` (UTC instant; compared against the gym-wall-clock 10-day window), `level_id` (group), `assigned_coach_id`, `enrollments` (count + membership), `waitingLists`.

- **Next-class precondition**: `status = ACTIVE` and the coachee is enrolled and `start_time >= now`.
- **Joinable precondition**: `status = ACTIVE`, `class_type = GROUP`, within reach, open spot (`enrollments < 4`), not already enrolled, and `start_time` inside `[start of today (Madrid), start of today + 10 wall-clock days]`.

### ClassEnrollment (read-only)

Existing model (`@@unique([class_id, coachee_id])`). Its rows combined with `TrainingClass` determine the "next scheduled class" and which classes are the coachee's own (calendar **blue** — delegated to the existing `classifyVisibility` via `GET /classes`).

### WaitingList (read-only)

Existing model. Rows where `coachee_id` = viewer and `class.status = ACTIVE` count toward `activeWaitingListCount`. Rows whose class is `CANCELED` are excluded.

### SecurityAuditLog (invariant, no writes)

Read-only feature — no new audit log writes. (The endpoint is a read; the constitution's audited actions — auth, class create/cancel, waiting-list join/leave, role/level change, financial data — are not performed here.)

## Derived values (computed, not stored)

| Value | Rule |
|-------|------|
| `joinableWindowStart` | `zonedDateTimeToUtc(today(Madrid), "00:00")` — start of today in `Europe/Madrid` |
| `joinableWindowEnd` | `addWallClockDays(joinableWindowStart, 10)` — inclusive 10th day |
| `nextClass` | soonest `start_time` among enrolled `ACTIVE` classes with `start_time >= now`, else `null` |
| `joinable` | `GROUP` + `ACTIVE` + within window + `isWithinReach` + `enrollments < 4` + not enrolled |
| `isWithinReach` | `isWithinReach(coachee.sort_order, classLevel.sort_order)` — ±1 |
| `activeWaitingListCount` | count of viewer's `WaitingList` rows with `class.status = ACTIVE` |
| `visibility` (calendar, server) | `classifyVisibility` — `blue` (own) / `green` (joinable) / `gray` (other/full/out-of-reach) — already returned by `GET /classes` |

## State transitions

There are none in this feature: no entity is created, updated, or deleted. The views are **projections** of existing state:

```text
ClassEnrollment[coachee, class] + TrainingClass[start_time >= now, ACTIVE]  ──►  nextClass (or null)
TrainingClass[GROUP, ACTIVE, in-window] + Level reach + spots + not enrolled ──►  joinableClasses[]
WaitingList[coachee] + TrainingClass[ACTIVE]                                ──►  activeWaitingListCount
TrainingClass + visibility (classifyVisibility)                            ──►  calendar blue/green/gray
```

After any state change elsewhere (join, cancel, waiting-list join/leave, Coach cancellation, level change), the views reflect it on the next fetch or pull-to-refresh — no cached copy in the server, no client-side recomputation of rules.

## Relationships at a glance

```text
User (coachee) ──< ClassEnrollment >── TrainingClass >── Level
User (coachee) ──< WaitingList >────── TrainingClass >── User (assigned coach)
User (coachee) ──level──> Level ──(reach ±1)── TrainingClass.level
GET /coachee/dashboard    ──> nextClass + joinableClasses + activeWaitingListCount
GET /classes (as Coachee) ──> TrainingClass[] with visibility ∈ { blue, green, gray }
```