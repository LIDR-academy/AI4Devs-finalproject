# Research: Class Viewing & Cancellation

**Phase 0 output** — resolves the design questions raised by the Technical Context and spec. Each entry follows Decision / Rationale / Alternatives considered.

## R1. Cancel = soft-cancel (mark `CANCELED`), never hard-delete

- **Decision**: `DELETE /classes/:id` sets `status = CANCELED` (keeps the row, returns `200`). The current implementation hard-deletes the row (returns `204`) and is reworked.
- **Rationale**: FR-012 requires canceled classes to remain visible (gray with a "Canceled" tag) and SC-005 requires past occurrences to be preserved when a series is canceled. Soft-cancel preserves the audit/history trail and matches the documented contract (`docs/api-specifications.md` §DELETE /classes/:id returns `{ id, status: "canceled", canceledInstances }`).
- **Alternatives considered**: hard delete (rejected — contradicts FR-012 and SC-005; loses history); a dedicated `deleted_at` tombstone (rejected — `ClassStatus.CANCELED` already exists in the Prisma schema and is the documented contract).

## R2. Google Calendar sync on cancellation = delete the event

- **Decision**: For every canceled instance, `CalendarProvider.deleteEvent(google_event_id)` removes the event from the scheduling calendar, freeing the slot.
- **Rationale**: The calendar is the availability single source of truth (Constitution §Performance/UX #1). A canceled class must not keep its slot blocked, otherwise available-slots math stays wrong. Deletion is idempotent by `google_event_id`.
- **Alternatives considered**: marking the event as "canceled" in the calendar (rejected — an event kept on the calendar still blocks the slot and pollutes the coach's real calendar); leaving the event (rejected — violates SC-006).

## R3. Calendar-first ordering with explicit failure handling

- **Decision**: Delete calendar event(s) **first**; if the calendar call fails, abort with `503 SERVICE_UNAVAILABLE` before any DB mutation (fully consistent: no DB change). Only after all event deletions succeed does the DB transaction mark the instance(s) canceled and persist notifications/audit. If the DB write fails after event deletion (rare — a single update on an existing row), the `google_event_id` is cleared in the same handling path and a critical audit entry is written; a follow-up reconcile on read clears dangling event IDs.
- **Rationale**: Matches the existing `DeleteTrainingClass` convention (calendar then DB), and satisfies the spec edge case "external scheduling calendar temporarily unavailable → infrastructure error with clear message, not silent corruption". Failing before DB mutation means the DB and calendar never diverge on the common path.
- **Alternatives considered**: DB-first then calendar (rejected — a calendar failure would leave an active class whose slot was freed, or a canceled class whose slot stays blocked); compensating rollback re-create event (rejected — more complexity than warranted; creation rollback pattern already exists in `CreateTrainingClass` but re-creating events on cancel failure is fragile).

## R4. Series cancellation scope ("future only", count of newly canceled)

- **Decision**: `scope=series` (and `DELETE /recurring-series/:id`) cancels the target instance plus every **future** instance of the series with `start_time >= now` and `status = ACTIVE`. Instances already canceled are skipped. Past instances (`start_time < now`) are never touched. The response reports the number of instances actually newly canceled (`canceledInstances` / `canceledInstanceCount`).
- **Rationale**: FR-010, SC-005, and the contract. Skipping already-canceled instances prevents double-cancel conflicts (FR-014) and keeps counts accurate.
- **Alternatives considered**: cancel every instance including past (rejected — rewriting the past is prohibited by the contract and PRD); cancel all future regardless of current status (rejected — produces misleading counts and redundant work).

## R5. Authorization = assigned Coach or Admin (resource-level check)

- **Decision**: Middleware first enforces role (`requireRole(ADMIN, COACH)`), then the use case enforces the resource-level rule: actor is Admin **or** actor is the class's `assigned_coach_id`. Any other user → `403 FORBIDDEN`.
- **Rationale**: Constitution §III (authN/authZ at middleware level for role), PRD §3 ("Coach can cancel own or assigned classes; Admin can cancel any class"). The assigned-coach rule is a business rule, so it lives in the domain service `ClassCancellationPolicy` (Constitution §I).
- **Alternatives considered**: role-only check (rejected — lets any Coach cancel any class, violating PRD §3 and FR-011); authorization only in the route handler (rejected — must be testable as a business rule).

## R6. Notifications = create rows now, dispatch in EP-04

- **Decision**: On successful cancellation, create a `Notification` row (`notification_type = 7`, recipient = each enrolled Coachee, `class_id`) for every canceled instance. FCM/push dispatching is out of scope (EP-04). Waiting-list promotion (`notification_type = 1`) is deferred with waiting-list processing (EP-04 per PRD §6.3).
- **Rationale**: FR-017 ("prepare the cancellation notification; actual dispatching deferred") and the existing `Notification` model. Creating rows is the "wired but not dispatched" state described in the user story.
- **Alternatives considered**: skip notifications entirely (rejected — FR-017 and the AC "Cancellation notifications wired"); write to a separate outbox table (rejected — the `Notification` model already exists and carries `notification_type`).

## R7. Coachee visibility in the read endpoints (contract compliance)

- **Decision**: `GET /classes` is reachable by any authenticated role. Admin/Coach see all classes (no `visibility`). Coachee sees only: own enrolled classes (`blue`), within-reach group classes with open spots (`green`), and everything else as busy blocks (`gray`), receiving a `visibility` field per class. `GET /classes/:id` adds `coacheeStatus { isEnrolled, isOnWaitingList, isWithinReach }` for the Coachee role and only exposes coachee names on own classes.
- **Rationale**: The contract (`docs/api-specifications.md` §GET /classes, §GET /classes/:id) and FR-005/FR-006. The full Coachee calendar UX is US-3.x; this feature only implements the server-side scoping so the contract holds.
- **Alternatives considered**: Admin/Coach-only list (rejected — contradicts the published contract's "Any" role); frontend-only hiding (rejected — FR-005 and Constitution §III forbid trusting the client).

## R8. Read rework and breaking-change posture

- **Decision**: The existing `GET /classes` (no params, no pagination), `GET /classes/:id` (no `coacheeStatus`), and `DELETE /classes/:id` (hard delete, `204`) are reworked to the contract in the same release as the consuming frontend. No API version bump.
- **Rationale**: The documented contract was always the target; only the internal SPA consumes these endpoints, and it ships in this feature. Constitution §IV allows this with the contract pre-documented (it is, in `docs/api-specifications.md`).
- **Alternatives considered**: version-bumping (`/api/v2`) (rejected — pre-1.0 internal API, single consumer updated in the same change); additive-only endpoints (rejected — would leave the wrong behavior in place).

## R9. Domain service shape — `ClassCancellationPolicy`

- **Decision**: A new pure domain service, `src/domain/services/ClassCancellationPolicy.ts`, exposes:
  - `canCancel(actor, assignedCoachId): boolean` — actor.role === ADMIN || actor.id === assignedCoachId
  - `selectInstancesToCancel(instances, targetId, scope, now): { targetIds: string[] }` — single → `[targetId]`; series → future ACTIVE instances of the series (target included)
  - `notificationTypeForCancellation(): 7` — encapsulates the notification-type mapping for canceled classes
  - Zero infrastructure imports; all parameters primitive/plain shapes.
- **Rationale**: Constitution §I (business rules in domain, not use cases) and §II (100% branch coverage on pure functions). Keeps the two rules independently testable.
- **Alternatives considered**: inline logic in the use cases (rejected — violates domain purity + makes branch coverage unverifiable); reusing `CoachService`/`CoacheeService` (rejected — class cancellation is not coach/coachee lifecycle).
