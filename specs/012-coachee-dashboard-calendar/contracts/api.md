# API Contracts: Coachee Dashboard & Calendar

**Phase 1 output** — the endpoint contract this feature implements. It mirrors `docs/api-specifications.md` (§Classes — `GET /coachee/dashboard`) which remains the authoritative reference. All endpoints live under `/api/v1/`. Errors always use the envelope `{ "error": { "code", "message", "ref" } }`.

The Coachee identity is never read from the request — it is derived exclusively from the authenticated session (JWT).

---

## GET /coachee/dashboard

Returns the authenticated Coachee's Home-screen data: their next scheduled class, the 10-day joinable group-class list, and the active waiting-list count.

- **Auth/Role**: authenticated user with role `COACHEE` (`authenticate` + `requireRole(COACHEE)`); `status = ACTIVE`
- **Path Params**: none
- **Query Params**: none
- **Request Body**: none
- **Success**: `200 OK`
  ```json
  {
    "nextClass": {
      "id": "uuid",
      "classType": "GROUP | INDIVIDUAL",
      "startTime": "string (ISO 8601)",
      "assignedCoach": { "id": "uuid", "name": "string" },
      "level": { "id": "uuid", "name": "string", "color": "string" } | null,
      "status": "ACTIVE"
    } | null,
    "joinableClasses": [
      {
        "id": "uuid",
        "classType": "GROUP",
        "startTime": "string (ISO 8601)",
        "level": { "id": "uuid", "name": "string", "color": "string" },
        "assignedCoach": { "id": "uuid", "name": "string" },
        "enrollmentCount": 2,
        "capacity": 4,
        "isWithinReach": true,
        "hasOpenSpots": true
      }
    ],
    "activeWaitingListCount": 2
  }
  ```
  - `nextClass` is `null` when the Coachee has no upcoming scheduled classes (Home shows "No upcoming classes").
  - `joinableClasses` only contains `GROUP` classes; every entry has `classType: "GROUP"`.
  - Single resource returned directly — no `data`/`meta` wrapper.

- **Business rules applied**:
  1. **Next class**: the soonest future `ACTIVE` class the Coachee is enrolled in (`start_time >= now`, individual or group); `null` if none.
  2. **Joinable classes**: `GROUP` + `ACTIVE` classes whose `start_time` falls inside the 10-day window = `[start of today (Europe/Madrid), start of today + 10 wall-clock days]` (inclusive), that are within the Coachee's level reach (±1), have at least one open spot (`enrollmentCount < 4`), and are not already enrolled.
  3. **Active waiting-list count**: count of the Coachee's `WaitingList` entries whose class `status = ACTIVE`; `0` when none.

- **Errors**:
  - `401 UNAUTHORIZED` — missing/expired session
  - `403 FORBIDDEN` — authenticated user is not an active Coachee
  - `503 SERVICE_UNAVAILABLE` — server/dependency failure (existing convention for dependent-service failures)

- **Side effects**: none (read-only; no audit-log write, no data mutation).

- **Contract notes for implementers**:
  - `nextClass.status` is `"ACTIVE"` (uppercase), matching the `ClassStatus` enum used by every other endpoint. `docs/api-specifications.md` currently shows lowercase `"active"` for this field only — corrected to `"ACTIVE"` during implementation (doc-only consistency edit).
  - Do not map enrollment details into this response: other Coachees' names must never leak. Individual classes the Coachee is not enrolled in are not part of this payload (they appear as gray/busy on the calendar, with names already masked by the `GET /classes` DTO).
  - The calendar itself needs no new endpoint: it reuses `GET /classes` (Coachee view) which already returns `visibility: "blue" | "green" | "gray"` per class.

---

## Summary table

| Method | Path | Role | Success | Distinct errors |
|--------|------|------|---------|-----------------|
| GET | `/coachee/dashboard` | COACHEE (JWT id) | `200` `{ nextClass, joinableClasses, activeWaitingListCount }` | `401 UNAUTHORIZED`, `403 FORBIDDEN`, `503 SERVICE_UNAVAILABLE` |