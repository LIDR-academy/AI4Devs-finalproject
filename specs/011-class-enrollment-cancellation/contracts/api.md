# API Contracts: Class Enrollment & Cancellation

**Phase 1 output** — endpoint contracts implemented by this feature. These mirror `docs/api-specifications.md` (§Classes — POST/DELETE `/classes/:id/enrollment`) which remains the authoritative reference. All endpoints live under `/api/v1/`. Errors always use the envelope `{ "error": { "code", "message", "ref" } }`.

The Coachee identity is never read from the request body — it is derived exclusively from the authenticated session (JWT).

---

## POST /classes/:id/enrollment

Joins the authenticated Coachee to an ACTIVE group class.

- **Auth/Role**: authenticated user with role `COACHEE` (`authenticate` + `requireRole(COACHEE)`); `status = ACTIVE`
- **Path Params**: `id` (UUID) — the class id
- **Request Body**: none
- **Success**: `201 Created`
  ```json
  {
    "id": "uuid",
    "classId": "uuid",
    "coacheeId": "uuid",
    "joinedAt": "2026-08-18T10:00:00.000Z"
  }
  ```
- **Business rules applied** (in this order, first failing rule short-circuits):
  1. class exists (`404 NOT_FOUND`)
  2. authenticated user is an ACTIVE Coachee (`403 FORBIDDEN` — via role guard)
  3. class status is `ACTIVE` (`400 VALIDATION_ERROR` if canceled)
  4. class type is `GROUP` (`400 VALIDATION_ERROR` — individual classes are assignment-only)
  5. not already enrolled (`409 ALREADY_ENROLLED`)
  6. coachee level within reach of class level, ±1 (`409 LEVEL_MISMATCH`)
  7. no overlap with any other enrolled ACTIVE class in the 60-minute window (`409 OVERLAP_DETECTED`)
  8. class has a free spot — `enrollmentCount < 4` (`409 CLASS_FULL`)
- **Race safety**: the read-check-create runs inside a single `Serializable` transaction; when two Coachees race for the last spot exactly one enrollment commits and the other receives `CLASS_FULL`.
- **Errors**:
  - `403 FORBIDDEN` — authenticated user is not a Coachee
  - `404 NOT_FOUND` — class does not exist
  - `400 VALIDATION_ERROR` — class type `individual`, or class status `canceled`
  - `409 CLASS_FULL` — class is at maximum capacity
  - `409 LEVEL_MISMATCH` — level outside reach (±1)
  - `409 OVERLAP_DETECTED` — coachee already has a class at this time
  - `409 ALREADY_ENROLLED` — coachee already enrolled
  - `401 UNAUTHORIZED` — missing/expired session; `400 VALIDATION_ERROR` — malformed UUID
- **Side effects**: `ClassEnrollment` row created; `SecurityAuditLog` written (`class.enroll` SUCCESS or DENIED).

---

## DELETE /classes/:id/enrollment

Cancels the authenticated Coachee's own attendance from a class they are enrolled in (a group class they joined, or an individual class assigned to them).

- **Auth/Role**: authenticated user with role `COACHEE` (`authenticate` + `requireRole(COACHEE)`); `status = ACTIVE`
- **Path Params**: `id` (UUID) — the class id
- **Request Body**: none
- **Success**: `200 OK`
  ```json
  {
    "message": "Enrollment canceled.",
    "waitingListProcessed": false,
    "claimedByCoachee": null
  }
  ```
  - `waitingListProcessed`: `true` when the class had a waiting list at cancel time (a spot opened; auto-processing is EP-04), `false` otherwise.
  - `claimedByCoachee`: always `null` in this release — automatic waiting-list promotion and FCM dispatch are EP-04.
- **Business rules applied**:
  1. class exists (`404 NOT_FOUND`)
  2. authenticated user is an ACTIVE Coachee (`403 FORBIDDEN` — via role guard)
  3. class status is `ACTIVE` (`400 VALIDATION_ERROR` if canceled)
  4. enrollment exists for `(class_id, coachee)` (`404 NOT_FOUND` if not enrolled)
  5. the enrollment being canceled belongs to the authenticated Coachee (JWT id) — always true given rule 4; enforced anyway
- **Rules / side effects**:
  - No penalties, fees, or restrictions (PRD §5)
  - `ClassEnrollment` row deleted; the spot is immediately free
  - `Notification` row created for the assigned Coach: type `3` (individual), `4` (group + waiting list), `5` (group, no waiting list)
  - `SecurityAuditLog` written (`class.cancel-enrollment` SUCCESS or DENIED)
- **Errors**:
  - `403 FORBIDDEN` — authenticated user is not a Coachee
  - `404 NOT_FOUND` — class does not exist, or the coachee is not enrolled
  - `400 VALIDATION_ERROR` — class status `canceled`
  - `401 UNAUTHORIZED` — missing/expired session

---

## Summary table

| Method | Path | Role | Success | Distinct errors |
|--------|------|------|---------|-----------------|
| POST | `/classes/:id/enrollment` | COACHEE (JWT id) | `201` enrollment object | `400 VALIDATION_ERROR` (individual / canceled), `403 FORBIDDEN`, `404 NOT_FOUND`, `409 CLASS_FULL`, `409 LEVEL_MISMATCH`, `409 OVERLAP_DETECTED`, `409 ALREADY_ENROLLED` |
| DELETE | `/classes/:id/enrollment` | COACHEE (JWT id, enrolled) | `200` cancel object | `400 VALIDATION_ERROR` (canceled), `403 FORBIDDEN`, `404 NOT_FOUND` (class or enrollment) |