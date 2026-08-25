# API Contracts: Coachee Calendar Interactions

**Phase 1 output** — the endpoints this feature consumes. **No new or changed endpoints.** These mirror `docs/api-specifications.md` which remains the authoritative reference. All live under `/api/v1/`; errors use `{ "error": { "code", "message", "ref" } }`. The Coachee's identity is always derived from the JWT — never from a request body.

---

## GET /classes (list — the calendar week window)

- **Auth/Role**: authenticated Coachee.
- **Query Params**: `start`, `end` (ISO 8601; the calendar sends the week window in UTC), `page=1`, `limit=100`.
- **Used for**: rendering every calendar card — blue (own), green (joinable), gray busy only when it is a full group within the Coachee's reach (waitlist-eligible); occupied individual slots and out-of-reach groups are dropped client-side. Canceled classes render as informational.
- **Key fields consumed**: `visibility` (`blue|green|gray`), `status`, `classType`, `startTime`, `assignedCoach.name`, `level` (with `sortOrder`), `enrollmentCount`, `capacity`, `waitingListCount`.
- **Provenance note**: this endpoint returns `visibility` only — it does NOT return `coacheeStatus`. The Coachee's level reach (±1) is resolved for the busy-block filter from the class `level.sortOrder` and the Coachee's own level (`useMe`/`useLevels`), matching the server's `isWithinReach`; the modal's waitlist eligibility is resolved via `GET /classes/:id` (below), not from the list.

---

## GET /classes/:id (detail — opened with the interaction modal)

- **Auth/Role**: authenticated Coachee.
- **Used for**: the modal's eligibility decision. Returns `coacheeStatus`:
  ```json
  { "coacheeStatus": { "isEnrolled": false, "isOnWaitingList": false, "isWithinReach": true } }
  ```
- **Decision rule** (server-owned; the UI only presents it):
  - gray + `isWithinReach: true` + group full (`enrollmentCount >= capacity`, e.g. 4/4) → **waitlist-join**
  - `isOnWaitingList: true` → **waitlist-leave** instead of join
  - any other gray (out-of-reach group, occupied individual) → **not rendered** in the calendar at all (client-side busy-block filter); `LEVEL_MISMATCH` is the backend fallback if ever reached
- **Errors**: `404 NOT_FOUND` (nonexistent class), `401` (session).

---

## POST /classes/:id/enrollment — join a green class

- **Auth/Role**: authenticated Coachee (`requireRole(COACHEE)`).
- **Body**: none.
- **Success**: `201` `{ id, classId, coacheeId, joinedAt }`.
- **Errors surfaced by the calendar**: `409 CLASS_FULL`, `409 LEVEL_MISMATCH`, `409 OVERLAP_DETECTED`, `409 ALREADY_ENROLLED`, `400 VALIDATION_ERROR` (individual/canceled), `403 FORBIDDEN`, `404 NOT_FOUND`.
- **Optimistic calendar transition (client-only)**: green → blue.

---

## DELETE /classes/:id/enrollment — cancel a blue class

- **Auth/Role**: authenticated Coachee (the enrolled coachee).
- **Body**: none.
- **Success**: `200` `{ message, waitingListProcessed, claimedByCoachee }`.
- **Errors surfaced by the calendar**: `403 FORBIDDEN`, `404 NOT_FOUND`, `400 VALIDATION_ERROR`.
- **Optimistic calendar transition (client-only)**: blue → green (still joinable) or gray (no longer viewable as theirs).

---

## POST /classes/:id/waiting-list — join a gray-slot waiting list

- **Auth/Role**: authenticated Coachee (`requireRole(COACHEE)`).
- **Body**: none.
- **Eligible when (backend `WaitingListPolicy`, surfaced only when `coacheeStatus.isWithinReach`)**: group class full (4/4), not already enrolled, not already on the list, list under 4.
- **Success**: `201` `{ id, classId, coacheeId, joinedAt }`.
- **Errors surfaced by the calendar**: `409 WAITING_LIST_FULL`, `409 ALREADY_ON_WAITING_LIST`, `409 ALREADY_ENROLLED`, `409 LEVEL_MISMATCH`, `400 VALIDATION_ERROR` (group not full / canceled), `403`, `404`.
- **Optimistic calendar transition (client-only)**: gray stays gray; `isOnWaitingList=true`, `waitingListCount+1`.

---

## DELETE /classes/:id/waiting-list — leave a gray-slot waiting list

- **Auth/Role**: authenticated Coachee (`requireRole(COACHEE)`), the waitlisted Coachee.
- **Body**: none.
- **Success**: `200` `{ "message": "Removed from waiting list." }`.
- **Errors surfaced by the calendar**: `403 FORBIDDEN`, `404 NOT_FOUND` (class or no entry), `401`.
- **Optimistic calendar transition (client-only)**: gray stays gray; `isOnWaitingList=false`, `waitingListCount-1`.

---

## Summary table

| Method | Path | Used for | Success |
|--------|------|----------|---------|
| GET | `/classes?start&end&page&limit` | render the week (blue/green/gray/canceled cards) | `200` `{ data, meta }` |
| GET | `/classes/:id` | modal detail + `coacheeStatus` (waitlist eligibility) | `200` class + `coacheeStatus` |
| POST | `/classes/:id/enrollment` | join a green class | `201` |
| DELETE | `/classes/:id/enrollment` | cancel a blue class | `200` |
| POST | `/classes/:id/waiting-list` | join a gray-slot waiting list | `201` |
| DELETE | `/classes/:id/waiting-list` | leave a gray-slot waiting list | `200` |