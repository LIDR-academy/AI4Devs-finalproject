# API Contracts: Waiting List Join/Leave

**Phase 1 output** — endpoint contracts implemented by this feature. These mirror `docs/api-specifications.md` (§Waiting Lists) which remains the authoritative reference. All endpoints live under `/api/v1/`. Errors always use the envelope `{ "error": { "code", "message", "ref" } }`.

The Coachee identity is never read from the request body — it is derived exclusively from the authenticated session (JWT).

---

## POST /classes/:id/waiting-list

Adds the authenticated Coachee to a class's waiting list.

- **Auth/Role**: authenticated user with role `COACHEE` (`authenticate` + `requireRole(COACHEE)`); `status = ACTIVE`
- **Path Params**: `id` (UUID) — the class id
- **Request Body**: none
- **Success**: `201 Created`
  ```json
  {
    "id": "uuid",
    "classId": "uuid",
    "coacheeId": "uuid",
    "joinedAt": "2026-08-19T10:00:00.000Z"
  }
  ```
- **Business rules applied** (in this order, first failing rule short-circuits):
  1. class exists (`404 NOT_FOUND`)
  2. authenticated user is an ACTIVE Coachee (`403 FORBIDDEN` — via role guard)
  3. class status is `ACTIVE` (`400 VALIDATION_ERROR` if canceled)
  4. not already enrolled (`409 ALREADY_ENROLLED`)
  5. not already on the waiting list (`409 ALREADY_ON_WAITING_LIST`)
  6. coachee level within reach of class level, ±1 (`409 LEVEL_MISMATCH`)
  7. applicable class state (`400 VALIDATION_ERROR` if: group class is not full — join it instead; or individual slot is not occupied)
  8. waiting list has a free slot — fewer than 4 entries (`409 WAITING_LIST_FULL`)
- **Eligibility by class type**:
  - **Group**: ACTIVE **and full** (`enrollmentCount >= 4`).
  - **Individual**: ACTIVE **and occupied** (`enrollmentCount >= 1`).
- **Race safety**: the read-check-create runs inside a single `Serializable` transaction; when two Coachees race for the 4th slot exactly one entry commits and the other receives `WAITING_LIST_FULL`.
- **Errors**:
  - `403 FORBIDDEN` — authenticated user is not a Coachee
  - `404 NOT_FOUND` — class does not exist
  - `400 VALIDATION_ERROR` — class status `canceled`, group class not full, or individual slot not occupied
  - `409 LEVEL_MISMATCH` — level outside reach (±1)
  - `409 ALREADY_ENROLLED` — coachee already enrolled
  - `409 ALREADY_ON_WAITING_LIST` — coachee already on this waiting list
  - `409 WAITING_LIST_FULL` — waiting list has reached its maximum size (4)
  - `401 UNAUTHORIZED` — missing/expired session; `400 VALIDATION_ERROR` — malformed UUID
- **Side effects**: `WaitingList` row created; `Notification` row (type 9) recorded for the Coachee; `SecurityAuditLog` written (`waiting-list.join` SUCCESS or DENIED).

---

## DELETE /classes/:id/waiting-list

Voluntarily removes the authenticated Coachee from a class's waiting list.

- **Auth/Role**: authenticated user with role `COACHEE` (`authenticate` + `requireRole(COACHEE)`); must be the waitlisted Coachee
- **Path Params**: `id` (UUID) — the class id
- **Request Body**: none
- **Success**: `200 OK`
  ```json
  { "message": "Removed from waiting list." }
  ```
- **Business rules applied**:
  1. class exists (`404 NOT_FOUND`)
  2. authenticated user is an ACTIVE Coachee (`403 FORBIDDEN` — via role guard)
  3. waiting-list entry exists for `(class_id, coachee)` (`404 NOT_FOUND` if not on the list)
  4. the entry being removed belongs to the authenticated Coachee (JWT id) — always true given rule 3; enforced anyway
- **Rules / side effects**:
  - Leave is allowed at any time, on any class status the entry refers to (the entry is simply removed)
  - No penalties, fees, or restrictions (PRD §5); no Coach is notified
  - `WaitingList` row deleted; the slot is immediately free for other Coachees
  - `Notification` row (type 10) recorded for the Coachee
  - `SecurityAuditLog` written (`waiting-list.leave` SUCCESS or DENIED)
- **Errors**:
  - `403 FORBIDDEN` — authenticated user is not a Coachee (or non-owner removal attempt)
  - `404 NOT_FOUND` — class does not exist, or the coachee is not on the waiting list
  - `401 UNAUTHORIZED` — missing/expired session

---

## GET /waiting-lists

Returns all active waiting lists the authenticated Coachee is on, with class details and an informational open-spot flag. Position is never returned.

- **Auth/Role**: authenticated user with role `COACHEE` (`authenticate` + `requireRole(COACHEE)`)
- **Query Params**: `page` (int, default 1), `limit` (int, default 20)
- **Request Body**: none
- **Success**: `200 OK`
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "class": {
          "id": "uuid",
          "classType": "individual | group",
          "startTime": "2026-08-19T10:00:00.000Z",
          "level": { "name": "string", "color": "string" } | null,
          "assignedCoach": { "name": "string" }
        },
        "joinedAt": "2026-08-18T10:00:00.000Z",
        "hasOpenSpots": false
      }
    ],
    "meta": { "page": 1, "limit": 20, "total": 3, "totalPages": 1 }
  }
  ```
  - `hasOpenSpots`: `true` when the class currently has a free spot (group: `enrollments < 4`; individual: `enrollments < 1`). Informational only — the Coachee must take an action to claim the spot; auto-claim is EP-04.
- **Business rules applied**:
  - Only entries whose class `status = ACTIVE` are returned (`filterActive`).
  - No position is returned: notification is simultaneous and position does not guarantee priority (PRD §6.4).
  - No limit on how many distinct waiting lists a Coachee can hold.
- **Errors**:
  - `403 FORBIDDEN` — authenticated user is not a Coachee
  - `401 UNAUTHORIZED` — missing/expired session

---

## Summary table

| Method | Path | Role | Success | Distinct errors |
|--------|------|------|---------|-----------------|
| POST | `/classes/:id/waiting-list` | COACHEE (JWT id) | `201` waiting-list object | `403 FORBIDDEN`, `404 NOT_FOUND`, `400 VALIDATION_ERROR` (canceled / group not full / slot not occupied), `409 LEVEL_MISMATCH`, `409 ALREADY_ENROLLED`, `409 ALREADY_ON_WAITING_LIST`, `409 WAITING_LIST_FULL` |
| DELETE | `/classes/:id/waiting-list` | COACHEE (JWT id, owner) | `200` message | `403 FORBIDDEN`, `404 NOT_FOUND` (class or entry) |
| GET | `/waiting-lists` | COACHEE | `200` `{ data, meta }` | `403 FORBIDDEN` |