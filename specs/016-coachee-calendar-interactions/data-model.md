# Data Model: Coachee Calendar Interactions

**Phase 1 output** — data consumed by this feature. **No Prisma schema changes, no migrations**: the frontend reads the existing class/enrollment/waiting-list DTOs and writes nothing directly (all state changes happen through the four documented backend mutation endpoints).

## Entities (consumed, read-only from the frontend's perspective)

### TrainingClass (via `GET /classes`, list — the week window)

Existing model, returned as the `TrainingClassDTO` with these fields consumed by the calendar:

| Field | Role in this feature |
|-------|----------------------|
| `id` | mutation target (POST/DELETE enrollment & waiting-list) |
| `classType` (`INDIVIDUAL`/`GROUP`) | busy-vs-joinable distinction; individual slots are assignment-only for the viewer |
| `status` (`ACTIVE`/`CANCELED`) | canceled → informational card, no action |
| `startTime` | card/modal time (ISO instant; rendered in gym timezone) |
| `assignedCoach.name` | modal detail |
| `level.name`/`color` | modal detail (group) |
| `enrollmentCount`, `capacity` | green-entry `spotsAvailable`; group-full busy detection |
| `waitingListCount` | waitlist modal detail |
| `visibility` (`blue`/`green`/`gray`) | primary card classification (list endpoint) |
| `coacheeStatus` | **not present on the list endpoint** — see note below |

**Note (D1)**: `GET /classes` returns `visibility` but NOT `coacheeStatus`. The modal fetches `GET /classes/:id` (`useClassDetail`, `coacheeStatus`) to decide waitlist eligibility.

### TrainingClass detail (via `GET /classes/:id` — opened when the modal opens)

Adds the field that decides gray-slot waitlist eligibility:

- `coacheeStatus.isWithinReach` — the reach rule (±1, server-computed) that makes a full group slot waitlist-eligible.
- `coacheeStatus.isOnWaitingList` — whether to offer **leave** instead of **join**.
- `coacheeStatus.isEnrolled` — redundancy/confirmation for blue entries.

### ClassEnrollment / WaitingList (mutation targets — never read directly by this feature)

Unchanged. The calendar never constructs these; it calls the four endpoints:
- `POST /classes/:id/enrollment` (join), `DELETE /classes/:id/enrollment` (cancel),
- `POST /classes/:id/waiting-list` (waitlist join), `DELETE /classes/:id/waiting-list` (waitlist leave).

## Derived values (computed client-side for display — pure helpers, no backend rule duplication)

| Value | Rule |
|-------|------|
| `isCalendarCard` | a class renders when it is blue (enrolled), green (joinable), or gray busy when it is a full group within the Coachee's reach (waitlist-eligible); occupied individual slots and out-of-reach groups are filtered out — `isCalendarClass(cls, coacheeLevelSortOrder)` |
| `busy` | `visibility === "gray"` (or canceled) → card titled "Busy", gray tone, no private details |
| `spotsAvailable` | `capacity - enrollmentCount` (green entries only) |
| action kind | `deriveCalendarInteraction({ classType, status, visibility, coacheeStatus, enrollmentCount, capacity })` → `cancel` / `join` / `waitlist-join` / `waitlist-leave` / `info` |
| optimistic post-action state | `applyOptimisticClassUpdate(cls, action)` → new visibility + `coacheeStatus` + counts for the in-flight card |

The decision *which* gray slots are waitlist-eligible remains entirely server-owned (`coacheeStatus.isWithinReach` from `GET /classes/:id`); the frontend's busy-block filter (`isCalendarClass`) matches that reach rule client-side from the class `level.sortOrder` and the Coachee's own level so only relevant busy entries appear.

## State transitions (optimistic, client cache only)

The server is the source of truth; the calendar cache is optimistically updated and reconciled by rollback + invalidation:

```text
join          : green ──► blue            (isEnrolled=true, enrollmentCount+1)
cancel        : blue  ──► green|gray      (isEnrolled=false, enrollmentCount-1; gray if individual or out-of-reach-after)
waitlist-join : gray  ──► gray+on-list    (isOnWaitingList=true, waitingListCount+1)
waitlist-leave: gray  ──► gray off-list   (isOnWaitingList=false, waitingListCount-1)
error path    : any   ──► exact pre-action snapshot (rollback)
```

After success, `invalidateQueries(["classes"] / ["waiting-lists"] / ["coachee","dashboard"])` refetches server truth and reconciles (spec FR-015).

## Relationships at a glance

```text
GET /classes (as Coachee)        ──► TrainingClass[] with visibility { blue, green, gray }
GET /classes/:id (as Coachee)    ──► TrainingClass + coacheeStatus { isEnrolled, isOnWaitingList, isWithinReach }
gym calendar week (day-strip + cards) ──> one ClassInteractionModal per tapped card
modal action ──► POST|DELETE /classes/:id/enrollment   (join | cancel)
modal action ──► POST|DELETE /classes/:id/waiting-list (waitlist join | leave)
```