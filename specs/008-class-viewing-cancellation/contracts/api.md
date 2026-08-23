# API Contracts: Class Viewing & Cancellation

**Phase 1 output** — endpoint contracts implemented by this feature. These mirror `docs/api-specifications.md` (§Classes) which remains the authoritative reference. All endpoints live under `/api/v1/`. Errors always use the envelope `{ "error": { "code", "message", "ref" } }`.

## Shared shapes

**TrainingClass (list item / detail)** — the DTO returned by list and detail endpoints:

```json
{
  "id": "uuid",
  "classType": "INDIVIDUAL | GROUP",
  "assignedCoach": { "id": "uuid", "name": "string" },
  "level": { "id": "uuid", "name": "string", "color": "string", "sortOrder": 1 } | null,
  "startTime": "ISO 8601",
  "durationMinutes": 60,
  "status": "ACTIVE | CANCELED",
  "description": "string | null",
  "enrolledCoachees": [ { "id": "uuid", "name": "string" } ],
  "enrollmentCount": 3,
  "capacity": 4,
  "hasWaitingList": false,
  "waitingListCount": 0,
  "isRecurring": false,
  "recurrenceSeriesId": "uuid | null",
  "visibility": "blue | green | gray"
}
```

`visibility` is present **only** for the `COACHEE` role. Admin/Coach responses omit it.

**Pagination meta**: `{ "page": 1, "limit": 20, "total": 42, "totalPages": 3 }`

---

## GET /classes

Lists classes within a required date range, with optional filters. Any authenticated role; visibility scoped server-side.

- **Auth/Role**: any authenticated user (`authenticate`; no `requireRole` — role-scoping is handled inside the use case)
- **Query Params**:
  - `start` (ISO 8601, **required**)
  - `end` (ISO 8601, **required**)
  - `classType` (`INDIVIDUAL | GROUP`, optional)
  - `coachId` (UUID, optional)
  - `page` (int, optional, default 1), `limit` (int, optional, default 20, max 100)
- **Success**: `200`
  ```json
  { "data": [ "<TrainingClass>" ], "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 } }
  ```
- **Errors**:
  - `400 VALIDATION_ERROR` — `start`/`end` missing, malformed, or `start > end`
  - `400 VALIDATION_ERROR` — `classType` not in `{INDIVIDUAL, GROUP}` or `coachId` not a valid UUID
- **Rules**: classes where `start_time ∈ [start, end]`, ordered by `start_time ASC`. Admin/Coach: all classes. Coachee: own classes (`blue`), within-reach group classes with open spots (`green`), everything else gray (`gray`); individual classes of others exposed as gray busy blocks without detail.

---

## GET /classes/:id

Full detail of a single class, including enrollment and waiting-list counts.

- **Auth/Role**: any authenticated role
- **Path Params**: `id` (UUID)
- **Success**: `200` → single `<TrainingClass>` plus, for the `COACHEE` role:
  ```json
  "coacheeStatus": { "isEnrolled": false, "isOnWaitingList": true, "isWithinReach": true }
  ```
- **Errors**: `404 NOT_FOUND`
- **Rules**: Admin/Coach see full coachee names; Coachee sees coachee names only for classes they are enrolled in (others appear as gray blocks / limited detail).

---

## DELETE /classes/:id

Soft-cancels a class (status → `CANCELED`). The `scope` param selects single vs. whole-series.

- **Auth/Role**: Admin or Coach (role guard), then resource-level check (assigned Coach or Admin)
- **Path Params**: `id` (UUID)
- **Query Params**: `scope` (`single` default | `series`)
- **Success**: `200`
  ```json
  { "id": "uuid", "status": "CANCELED", "canceledInstances": 1 | null }
  ```
  `canceledInstances` is populated only when `scope=series` (count of future instances newly canceled, target included, already-canceled skipped). `null` for `scope=single`.
- **Errors**:
  - `403 FORBIDDEN` — actor is not the assigned Coach and not an Admin
  - `404 NOT_FOUND` — class does not exist
  - `409 CONFLICT` — class already canceled
  - `503 SERVICE_UNAVAILABLE` — Google Calendar deletion failed (no DB change)
- **Side effects**: Google Calendar event removed (frees slot); `Notification` rows (type 7) created for each enrolled Coachee of each canceled instance; `SecurityAuditLog` entries written (success, and denied attempts).

---

## DELETE /recurring-series/:id

Cancels an entire recurring series at its root: marks all future `ACTIVE` instances `CANCELED`; past instances untouched.

- **Auth/Role**: Admin, or Coach who created the series **or** is its assigned coach
- **Path Params**: `id` (UUID) — the series ID
- **Success**: `200`
  ```json
  { "seriesId": "uuid", "canceledInstanceCount": 5, "status": "CANCELED" }
  ```
- **Errors**: `403 FORBIDDEN`, `404 NOT_FOUND`, `503 SERVICE_UNAVAILABLE`
- **Side effects**: same as `DELETE /classes/:id?scope=series` (events removed, notifications type 7, audit log).

---

## Coachee visibility rules (server-determined)

| Condition (Coachee viewer) | `visibility` |
|----------------------------|--------------|
| Enrolled in the class | `blue` |
| Group class within reach (level ±1 via `ReachCalculator`) with at least one open spot | `green` |
| Everything else (other individual classes, out-of-reach, full classes, canceled) | `gray` |
