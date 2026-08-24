# API Specifications — Personal Training Management Platform

This document defines every REST API endpoint required to implement the full functionality of the Personal Training Management Platform, as derived from the PRD and System Architecture documents. It is the structural precursor to a formal OpenAPI 3.1 specification — all entries follow an identical template for clean conversion. Endpoints are grouped by resource domain under versioned base path `/api/v1/`.

---

## Table of Contents

- [Global Conventions](#global-conventions)
- [Auth](#auth)
- [Classes](#classes)
- [Blocks](#blocks)
- [Waiting Lists](#waiting-lists)
- [Coachees](#coachees)
- [Coaches](#coaches)
- [Notifications](#notifications)
- [Health](#health)
- [Endpoint Summary](#endpoint-summary)

---

## Global Conventions

### Base Path

```
/api/v1
```

### Authentication Header

```
Authorization: Bearer <access_token>
```

Access tokens are short-lived JWTs (15 min TTL). Refresh tokens (7 day TTL) are exchanged via the dedicated refresh endpoint. Every endpoint except `POST /auth/login` and `GET /health` requires a valid JWT.

### Standard Error Envelope

All error responses follow this shape:

```json
{
  "error": {
    "code": "ERROR_CODE",
    "message": "Human-readable description.",
    "ref": "uuid-ref-id"
  }
}
```

- `ref` is a unique server-side identifier that maps to the error log. Stack traces, internal paths, and database error messages are never exposed.
- Domain violations (capacity, overlap, level mismatch, waiting list full) return structured 4xx responses with actionable `message` values.
- External dependency failures (Google Calendar, FCM, database) return `503 Service Unavailable`.
- Authentication failures return a consistent `"Invalid credentials"` message — no email enumeration.

### Standard Error Codes Map

| HTTP | Code | When |
|------|------|------|
| 400 | `VALIDATION_ERROR` | Request body fails Zod schema validation |
| 401 | `UNAUTHORIZED` | Missing, expired, or invalid access token |
| 403 | `FORBIDDEN` | Token valid but role lacks permission |
| 404 | `NOT_FOUND` | Resource does not exist |
| 409 | `CAPACITY_EXCEEDED` | Gym capacity limit reached (2 individual + 1 group) |
| 409 | `CLASS_FULL` | Class is at maximum capacity |
| 409 | `OVERLAP_DETECTED` | Coachee or Coach has overlapping schedule |
| 409 | `LEVEL_MISMATCH` | Coachee level is outside reach of class |
| 409 | `WAITING_LIST_FULL` | Waiting list has reached its maximum size (4) |
| 409 | `ALREADY_ENROLLED` | Coachee is already enrolled in the class |
| 409 | `ALREADY_ON_WAITING_LIST` | Coachee is already on the waiting list |
| 503 | `SERVICE_UNAVAILABLE` | External dependency failure (Google Calendar, FCM, DB) |

### Pagination & Filtering Conventions

- List endpoints support pagination via `?page=1&limit=20` (default: page 1, limit 20).
- All responses from paginated endpoints include `{ data: [...], meta: { page, limit, total, totalPages } }`.
- Filter parameters are passed as query string keys; multi-select filters use comma-separated values (e.g., `?status=active,inactive`).
- No sensitive identifiers (user IDs, class IDs) are ever passed as query parameters — only in path or request body, per PRD Section 10.3.
- Date/time values use ISO 8601 format (`YYYY-MM-DDTHH:mm:ssZ`).
- UUIDs are used for all resource identifiers.

---

## Auth

### POST /auth/login

- **Description:** Authenticates a user with email and password. Returns access and refresh tokens plus basic user profile.
- **Auth/Role:** None (unauthenticated).
- **Path Params:** None.
- **Query Params:** None.
- **Request Body:**
  ```json
  {
    "email": "string (email format)",
    "password": "string"
  }
  ```
- **Success Response:** `200 OK`
  ```json
  {
    "accessToken": "string (JWT, 15 min)",
    "refreshToken": "string (opaque, 7 day)",
    "user": {
      "id": "uuid",
      "email": "string",
      "name": "string",
      "role": "admin | coach | coachee",
      "status": "active | inactive",
      "mustChangePassword": false
    }
  }
  ```
- **Error Responses:**
  - `400 VALIDATION_ERROR` — malformed email or missing fields.
  - `401 UNAUTHORIZED` — invalid credentials (consistent message, no email enumeration).
  - `403 FORBIDDEN` — user status is `inactive`.
  - `429 TOO_MANY_REQUESTS` — rate limit (10 req/min per IP) exceeded.
- **Business Rules Applied:**
  - Rate-limited to 10 req/min per IP (PRD Section 10.3).
  - Inactive users are denied access.
  - Password verified with bcrypt cost factor 12 (PRD Section 10.1).

---

### POST /auth/refresh

- **Description:** Exchanges a valid refresh token for a new access token and refresh token pair. The previous refresh token is invalidated server-side.
- **Auth/Role:** None (uses refresh token in body).
- **Path Params:** None.
- **Query Params:** None.
- **Request Body:**
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **Success Response:** `200 OK`
  ```json
  {
    "accessToken": "string (JWT, 15 min)",
    "refreshToken": "string (opaque, 7 day)",
    "user": {
      "id": "uuid",
      "email": "string",
      "name": "string",
      "role": "admin | coach | coachee",
      "status": "active | inactive",
      "mustChangePassword": false
    }
  }
  ```
- **Error Responses:**
  - `400 VALIDATION_ERROR` — missing refresh token.
  - `401 UNAUTHORIZED` — invalid, expired, or revoked refresh token.
- **Business Rules Applied:**
  - Refresh tokens are stored server-side (hashed) and invalidated on use (PRD Section 10.1 — rotation deferred to v1.1, but old token is invalidated on refresh).
  - Refresh tokens are invalidated on password change or explicit logout.

---

### POST /auth/logout

- **Description:** Revokes the provided refresh token server-side, ending the session.
- **Auth/Role:** Authenticated (any role).
- **Path Params:** None.
- **Query Params:** None.
- **Request Body:**
  ```json
  {
    "refreshToken": "string"
  }
  ```
- **Success Response:** `204 No Content`
- **Error Responses:**
  - `400 VALIDATION_ERROR` — missing refresh token.
  - `401 UNAUTHORIZED` — invalid or missing access token.
- **Business Rules Applied:**
  - Token is revoked from server-side store; subsequent refresh attempts with the same token fail.
  - Access token remains valid until its natural expiry (15 min).

---

### POST /auth/change-password

- **Description:** Allows an authenticated user to change their password. Requires current password verification. After a successful change, the `mustChangePassword` flag is set to `false`.
- **Auth/Role:** Authenticated (any role).
- **Path Params:** None.
- **Query Params:** None.
- **Request Body:**
  ```json
  {
    "currentPassword": "string",
    "newPassword": "string (min 6 characters)"
  }
  ```
- **Success Response:** `200 OK`
  ```json
  {
    "message": "Password changed successfully"
  }
  ```
- **Error Responses:**
  - `400 VALIDATION_ERROR` — missing fields, new password too short, or new password and confirmation mismatch.
  - `401 UNAUTHORIZED` — invalid or missing access token.
  - `401 UNAUTHORIZED` — current password is incorrect.
- **Business Rules Applied:**
  - Current password is verified against the stored bcrypt hash.
  - New password is hashed with bcrypt cost factor 12 before storage.
  - On success, `must_change_password` is set to `false`.
  - Rate-limited as part of standard API rate limiting.

---

## Classes

### GET /classes

- **Description:** Lists classes within a date range, with optional filters. Role-based visibility is applied server-side: Admin/Coach see all classes; Coachee sees only classes they are enrolled in, group classes within reach (with visibility flags), and gray busy blocks for non-visible classes.
- **Auth/Role:** Authenticated (any role — visibility scoped by role).
- **Path Params:** None.
- **Query Params:**
  - `start` (string, ISO 8601, required) — start of date range.
  - `end` (string, ISO 8601, required) — end of date range.
  - `classType` (string, optional) — filter: `individual`, `group`.
  - `coachId` (uuid, optional) — filter by assigned coach.
  - `page` (int, optional, default 1).
  - `limit` (int, optional, default 20).
- **Request Body:** None.
- **Success Response:** `200 OK`
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "classType": "individual | group",
        "assignedCoach": { "id": "uuid", "name": "string" },
        "level": { "id": "uuid", "name": "string", "color": "string", "sortOrder": 1 } | null,
        "startTime": "string (ISO 8601)",
        "durationMinutes": 60,
        "status": "active | canceled",
        "description": "string",
        "enrolledCoachees": [
          { "id": "uuid", "name": "string" }
        ],
        "enrollmentCount": 3,
        "capacity": 4,
        "hasWaitingList": false,
        "waitingListCount": 0,
        "isRecurring": false,
        "recurrenceSeriesId": "uuid | null",
        "visibility": "blue | green | gray"   // Coachee role only; server-determined
      }
    ],
    "meta": { "page": 1, "limit": 20, "total": 42, "totalPages": 3 }
  }
  ```
- **Error Responses:**
  - `400 VALIDATION_ERROR` — missing or invalid date range.
- **Business Rules Applied:**
  - Coachee visibility logic (PRD Section 6.4): own classes = blue; joinable within-reach group classes with open spots = green; all others = gray.
  - Individual classes of other coachees are shown as gray busy blocks with no detail.
  - Coachee receives a `visibility` field per class; Admin/Coach see all classes without this field.
  - Duration is always 60 minutes (PRD Section 5 — fixed).

---

### POST /classes

- **Description:** Creates a new class (individual or group) or a weekly recurring series. Validates gym capacity, overlap, level reach, and coachee assignment rules before persisting. Creates a corresponding event in Google Calendar via the Service Account adapter.
- **Auth/Role:** Authenticated (Admin or Coach).
- **Path Params:** None.
- **Query Params:** None.
- **Request Body:**
  ```json
  {
    "classType": "individual | group",
    "assignedCoachId": "uuid",
    "coacheeIds": ["uuid", ...],
    "levelId": "uuid | null",
    "startDateTime": "string (ISO 8601)",
    "description": "string",
    "recurrence": {
      "enabled": false,
      "dayOfWeek": 1,
      "startDate": "string (ISO 8601 date)"
    }
  }
  ```
  **Field rules:**
  - `classType`: required.
  - `assignedCoachId`: required for individual and group; hidden when classType is block.
  - `coacheeIds`: exactly 1 for individual; min 3, max 4 for group.
  - `levelId`: required for group; null for individual.
  - `recurrence.enabled`: if true, creates a `RecurrenceSeries` and generates recurring class instances.
  - `recurrence.dayOfWeek`: 0=Sunday, 1=Monday, ... 6=Saturday. Required if `recurrence.enabled` is true.
  - `recurrence.startDate`: first occurrence date. Required if `recurrence.enabled` is true.
  - `startDateTime`: ISO 8601 instant (e.g., `2026-08-17T13:00:00.000Z` or with offset). The frontend interprets the user-entered wall-clock time in the gym timezone (`Europe/Madrid`), so a class entered as 15:00 in the UI is sent as 13:00Z in summer (CEST) or 14:00Z in winter (CET).
- **Success Response:** `201 Created`
  ```json
  {
    "seriesId": "uuid | null",
    "recurrence": {
      "enabled": false
    },
    "instances": [
      {
        "id": "uuid",
        "classType": "individual | group",
        "assignedCoach": { "id": "uuid", "name": "string" },
        "level": { "id": "uuid", "name": "string", "color": "string" } | null,
        "startTime": "string (ISO 8601)",
        "durationMinutes": 60,
        "status": "active",
        "description": "string",
        "enrolledCoachees": [ { "id": "uuid", "name": "string" } ]
      }
    ]
  }
  ```
  When `recurrence.enabled` is true, `seriesId` is the created series ID and `instances` contains the generated weekly instances (12 by default). When disabled, `seriesId` is null and `instances` contains a single class.
- **Error Responses:**
  - `400 VALIDATION_ERROR` — schema validation failure (wrong coachee count for type, missing level for group, etc.).
  - `403 FORBIDDEN` — Coachee role cannot create classes.
  - `409 CAPACITY_EXCEEDED` — gym capacity would be exceeded (2 individual + 1 group per hour).
  - `409 OVERLAP_DETECTED` — coachee or assigned coach has an overlapping class or block.
  - `409 LEVEL_MISMATCH` — one or more coachees are outside the class's level reach (their level is more than one step away from the class level).
  - `404 NOT_FOUND` — referenced coach ID or coachee ID does not exist.
  - `503 SERVICE_UNAVAILABLE` — Google Calendar API error (event creation failed).
- **Business Rules Applied:**
  - Gym capacity: at most 2 individual + 1 group simultaneously (PRD Section 5).
  - Duration fixed at 60 minutes (PRD Section 5).
  - Overlap check: coachee cannot be in two overlapping classes; coach cannot have overlapping assignments (PRD Section 5).
  - Level reach: coachee's level must match class level, one above, or one below (PRD Section 5).
  - Recurrence: generates weekly instances for the same day/time with same level, coach, and type (PRD Section 5).
  - Notification #2 sent to all coachees within reach of the class level when a group class with open spots is created.
  - Notification #8 sent to the assigned coachee when an individual class is created.
  - Notification #12 sent to assigned coach if a different coach from the creator is selected.
  - Google Calendar event title: individual classes use the coachee name + level (e.g., "Juan Pérez - Intermedio"), group classes use "Group class" + level (e.g., "Group class - Intermedio"); the event description includes the assigned coach name, recurrence status, user-added notes, and (for group classes) the enrolled coachees (PRD Section 10.4).

---

### GET /classes/:id

- **Description:** Returns full details of a single class, including enrollment and waiting list information. Coachee gets reach and enrollment status.
- **Auth/Role:** Authenticated (any role — visibility scoped by role).
- **Path Params:**
  - `id` (uuid) — class ID.
- **Query Params:** None.
- **Request Body:** None.
- **Success Response:** `200 OK`
  ```json
  {
    "id": "uuid",
    "classType": "individual | group",
    "assignedCoach": { "id": "uuid", "name": "string" },
    "level": { "id": "uuid", "name": "string", "color": "string", "sortOrder": 1 } | null,
    "startTime": "string (ISO 8601)",
    "durationMinutes": 60,
    "status": "active | canceled",
    "description": "string",
    "enrolledCoachees": [ { "id": "uuid", "name": "string" } ],
    "enrollmentCount": 3,
    "capacity": 4,
    "hasWaitingList": true,
    "waitingListCount": 2,
    "waitingListCoachees": [ { "id": "uuid", "name": "string" } ],
    "recurrenceSeriesId": "uuid | null",
    "coacheeStatus": {                // Present only when role = coachee
      "isEnrolled": false,
      "isOnWaitingList": true,
      "isWithinReach": true
    }
  }
  ```
- **Error Responses:**
  - `404 NOT_FOUND` — class does not exist.
- **Business Rules Applied:**
  - Coachee role sees `coacheeStatus` with reach calculation, enrollment, and waiting list status.
  - Admin/Coach role sees full coachee names (enrolled + waiting list); Coachee role sees only coachee names for their own classes.
  - `waitingListCoachees` follows the same privacy rule as `enrolledCoachees`: names are revealed for Admin/Coach, and for Coachee only when the viewer is enrolled or the class is highlighted to them. It is ordered by oldest join first. On list endpoints (which do not load member names) it is `[]` while `waitingListCount` remains accurate.

---

### DELETE /classes/:id

- **Description:** Cancels a class. If the class is part of a recurring series, the `scope` query parameter determines whether only this instance or all future instances are canceled. Triggers notifications to enrolled coachees and processes the waiting list.
- **Auth/Role:** Authenticated (Admin or Coach — only the assigned Coach or an Admin can cancel).
- **Path Params:**
  - `id` (uuid) — class ID.
- **Query Params:**
  - `scope` (string, optional, default `"single"`) — `"single"` (cancel this instance only) or `"series"` (cancel all future instances in the recurring series).
- **Request Body:** None.
- **Success Response:** `200 OK`
  ```json
  {
    "id": "uuid",
    "status": "canceled",
    "canceledInstances": 1 | null
  }
  ```
  When `scope=series`, returns `canceledInstances` with the count of remaining future instances that were canceled.
- **Error Responses:**
  - `403 FORBIDDEN` — coach is not the assigned coach and not an Admin.
  - `404 NOT_FOUND` — class does not exist.
  - `409 CONFLICT` — class is already canceled.
- **Business Rules Applied:**
  - Coach can cancel own or assigned classes; Admin can cancel any class (PRD Section 3).
  - All enrolled coachees receive notification #7 (class canceled).
  - If the class had a waiting list, notification #1 is sent to all waitlisted coachees simultaneously (spots open).
  - Group coachee cancellation with waiting list → Coach notified (#4); without waiting list → Coach notified (#5). (#4 and #5 are mutually exclusive — PRD Section 7.)
  - The canceled class is marked as `"canceled"` and shown in gray in the calendar (PRD Section 5).
  - When `scope=series`, all future instances of the `RecurrenceSeries` are also canceled.
  - Google Calendar event is updated/removed via adapter.

---

### DELETE /recurring-series/:id

- **Description:** Cancels an entire recurring series and all its future class instances. Past instances are not affected.
- **Auth/Role:** Authenticated (Admin or Coach who created or is assigned to the series).
- **Path Params:**
  - `id` (uuid) — recurrence series ID.
- **Query Params:** None.
- **Request Body:** None.
- **Success Response:** `200 OK`
  ```json
  {
    "seriesId": "uuid",
    "canceledInstanceCount": 5,
    "status": "canceled"
  }
  ```
- **Error Responses:**
  - `403 FORBIDDEN` — not the series creator or an Admin.
  - `404 NOT_FOUND` — series does not exist.
- **Business Rules Applied:**
  - Past class instances (those with `startTime` before now) remain unchanged.
  - All future instances are marked as `"canceled"`. Each triggers notification #7 individually.
  - This is an alternative to `DELETE /classes/:id?scope=series` and provides a single operation for canceling the entire series at its root.

---

### POST /classes/:id/enrollment

- **Description:** A coachee joins a group class. Validates capacity, level reach, and overlap before enrolling. (Individual class enrollment is done by the Coach at creation time, not by the coachee.)
- **Auth/Role:** Authenticated (Coachee).
- **Path Params:**
  - `id` (uuid) — class ID.
- **Query Params:** None.
- **Request Body:** None (coachee identity is derived from JWT).
- **Success Response:** `201 Created`
  ```json
  {
    "id": "uuid",
    "classId": "uuid",
    "coacheeId": "uuid",
    "joinedAt": "string (ISO 8601)"
  }
  ```
- **Error Responses:**
  - `403 FORBIDDEN` — authenticated user is not a Coachee.
  - `404 NOT_FOUND` — class does not exist.
  - `409 CLASS_FULL` — class is at maximum capacity (4/4 for group).
  - `409 LEVEL_MISMATCH` — coachee's level is outside the class's reach.
  - `409 OVERLAP_DETECTED` — coachee already has a class (individual or group) at this time.
  - `409 ALREADY_ENROLLED` — coachee is already enrolled.
  - `400 VALIDATION_ERROR` — class type is `individual` (coachees cannot self-enroll in individual classes).
  - `400 VALIDATION_ERROR` — class status is `canceled`.
- **Business Rules Applied:**
  - Only group classes can be self-joined by coachees (PRD Section 6.4).
  - Capacity check: max 4 coachees for group classes (PRD Section 5).
  - Level reach: must match class level, one above, or one below (PRD Section 5).
  - Overlap check: coachee cannot be in two classes at the same time (PRD Section 5).
  - If class becomes full after enrollment, the join button is replaced with "Join waiting list" on subsequent visits.

---

### DELETE /classes/:id/enrollment

- **Description:** A coachee cancels their own attendance from a group class (or their assigned individual class). Triggers waiting list processing and appropriate notifications.
- **Auth/Role:** Authenticated (Coachee — the enrolled coachee).
- **Path Params:**
  - `id` (uuid) — class ID.
- **Query Params:** None.
- **Request Body:** None (coachee identity derived from JWT).
- **Success Response:** `200 OK`
  ```json
  {
    "message": "Enrollment canceled.",
    "waitingListProcessed": true,
    "claimedByCoachee": "uuid | null",
    "notificationsSent": 1,
    "waitingListMembersNotified": 2
  }
  ```
- **Error Responses:**
  - `403 FORBIDDEN` — not the enrolled coachee.
  - `404 NOT_FOUND` — class does not exist or coachee is not enrolled.
  - `400 VALIDATION_ERROR` — class status is `canceled`.
- **Business Rules Applied:**
  - No penalties or restrictions on cancellation (PRD Section 5).
  - **Individual class cancellation** (notification #3): assigned Coach is notified.
  - **Group class cancellation with waiting list** (notification #4): Coach is notified with waiting list count. All waitlisted coachees are notified simultaneously (#1).
  - **Group class cancellation without waiting list** (notification #5): Coach is notified that the spot is free.
  - Spot is claimed first-come, first-served — no hold time (PRD Section 5).
  - If there is a waiting list, `waitingListProcessed` is true and `claimedByCoachee` shows the ID of the coachee who claimed the spot (if any).
  - `notificationsSent` is the total number of notifications dispatched (coach + waitlisted coachees).
  - `waitingListMembersNotified` is the number of waitlisted coachees notified about the opened spot.

---

### GET /classes/available-slots

- **Description:** Queries Google Calendar free/busy via the Service Account and returns available time slots for a given date and coach. Used by the Add Class modal to surface available scheduling options.
- **Auth/Role:** Authenticated (Admin or Coach).
- **Path Params:** None.
- **Query Params:**
  - `date` (string, ISO 8601 date, required) — the date to check.
  - `coachId` (uuid, required) — the coach whose calendar is checked for availability.
  - `classType` (string, required) — `individual` or `group`, to account for gym capacity limits.
- **Request Body:** None.
- **Success Response:** `200 OK`
  ```json
  {
    "date": "2026-07-01",
    "coachId": "uuid",
    "availableSlots": [
      { "start": "08:00", "end": "09:00", "capacityAvailable": "individual | group | both" },
      { "start": "09:00", "end": "10:00", "capacityAvailable": "individual | group | both" }
    ]
  }
  ```
  `capacityAvailable` indicates what the slot can accommodate given gym-level capacity (max 2 individual + 1 group per hour).
  `start`/`end` are Madrid wall-clock hours (`Europe/Madrid`); the backend enumerates slots by gym-local hour and converts them to absolute instants internally for free/busy and overlap checks (DST-aware).
- **Error Responses:**
  - `400 VALIDATION_ERROR` — missing required query params.
  - `503 SERVICE_UNAVAILABLE` — Google Calendar free/busy API error.
- **Business Rules Applied:**
  - Google Calendar free/busy is queried server-side only (PRD Section 8, Architecture Section 3).
  - Result accounts for existing classes, personal blocks, and gym-wide blocks.
  - Gym capacity (2 individual + 1 group per hour) is factored into availability.

---

### GET /classes/assignable-coaches

- **Description:** Returns the list of users that may be assigned as the coach of a class (active Admins and active Coaches, since Admins also act as coaches). Used to populate the Assigned Coach selector in the Add Class modal.
- **Auth/Role:** Authenticated (Admin or Coach).
- **Path Params:** None.
- **Query Params:** None.
- **Request Body:** None.
- **Success Response:** `200 OK`
  ```json
  {
    "data": [
      { "id": "uuid", "name": "string" }
    ]
  }
  ```
- **Error Responses:**
  - `403 FORBIDDEN` — caller is not an Admin or Coach.

---

### GET /coachee/dashboard

- **Description:** Returns the coachee's next scheduled class, a list of upcoming joinable group classes within a 10-day window, and a list of full group classes the coachee can join a waiting list for. This powers the Coachee Home screen.
- **Auth/Role:** Authenticated (Coachee).
- **Path Params:** None.
- **Query Params:** None.
- **Request Body:** None.
- **Success Response:** `200 OK`
  ```json
  {
    "nextClass": {
      "id": "uuid",
      "classType": "individual | group",
      "startTime": "string (ISO 8601)",
      "assignedCoach": { "id": "uuid", "name": "string" },
      "level": { "id": "uuid", "name": "string", "color": "string" } | null,
      "status": "ACTIVE"
    } | null,
    "joinableClasses": [
      {
        "id": "uuid",
        "classType": "group",
        "startTime": "string (ISO 8601)",
        "level": { "id": "uuid", "name": "string", "color": "string" },
        "assignedCoach": { "id": "uuid", "name": "string" },
        "enrollmentCount": 2,
        "capacity": 4,
        "isWithinReach": true,
        "hasOpenSpots": true
      }
    ],
    "waitlistEligibleClasses": [
      {
        "id": "uuid",
        "classType": "group",
        "startTime": "string (ISO 8601)",
        "level": { "id": "uuid", "name": "string", "color": "string" },
        "assignedCoach": { "id": "uuid", "name": "string" },
        "enrollmentCount": 4,
        "capacity": 4,
        "isWithinReach": true,
        "isOnWaitingList": false
      }
    ],
    "activeWaitingListCount": 2
  }
  ```
  `nextClass` is null if the coachee has no upcoming scheduled classes.
- **Error Responses:**
  - `403 FORBIDDEN` — authenticated user is not a Coachee.
- **Business Rules Applied:**
  - 10-day window (Madrid wall-clock) for upcoming joinable and waitlist-eligible group classes (PRD Section 6.4).
  - Only group classes within the coachee's reach with at least one open spot are included in `joinableClasses` (PRD Section 6.4).
  - `waitlistEligibleClasses` contains ACTIVE group classes that are full (enrollmentCount === capacity), within reach, not enrollable (no open spots → mutually exclusive with `joinableClasses`), where the coachee is neither enrolled nor already on the waiting list, and whose waiting list has fewer than 4 entries. Ordered ascending by `startTime`.
  - `isOnWaitingList` is always `false` for entries in `waitlistEligibleClasses` (a class only appears when the coachee is not on its list yet).
  - Next class is the soonest future class the coachee is enrolled in.

---

## Blocks

### GET /blocks

- **Description:** Lists calendar blocks within a date range. Used by the frontend to render blocked time on the calendar alongside classes.
- **Auth/Role:** Authenticated (Admin or Coach).
- **Path Params:** None.
- **Query Params:**
  - `start` (string, ISO 8601, required) — start of date range.
  - `end` (string, ISO 8601, required) — end of date range.
  - `blockType` (string, optional) — filter: `personal`/`gym-wide`.
  - `page` (int, optional, default 1), `limit` (int, optional, default 20, max 100).
- **Request Body:** None.
- **Success Response:** `200 OK`
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "blockType": "PERSONAL | GYM_WIDE",
        "createdBy": { "id": "uuid", "name": "string" },
        "coach": { "id": "uuid", "name": "string" } | null,
        "startTime": "string (ISO 8601)",
        "endTime": "string (ISO 8601)",
        "description": "string"
      }
    ],
    "meta": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
  }
  ```
- **Error Responses:**
  - `400 VALIDATION_ERROR` — missing or invalid date range, inverted range (`start > end`), invalid `blockType`, non-integer or out-of-range `page`/`limit`.
- **Business Rules Applied:**
  - Personal blocks are assigned to a specific coach (coach field present); gym-wide blocks have no coach field (null).
  - `GET /blocks` excludes canceled blocks — only `ACTIVE` blocks are returned (interval overlap: `start_time < end AND end_time > start`, ordered by start time).
  - `blockType` is serialized as enum values (`PERSONAL`/`GYM_WIDE`).

---

### POST /blocks

- **Description:** Creates a time block. Two types: `personal` (blocks the creating Coach or Admin's own calendar — or a specified coach's calendar if Admin) and `gym-wide` (blocks the entire gym — Admin only). Creates a corresponding event in Google Calendar.
- **Auth/Role:** Authenticated (Admin or Coach). Gym-wide blocks require Admin role.
- **Path Params:** None.
- **Query Params:** None.
- **Request Body:**
  ```json
  {
    "blockType": "personal | gym-wide",
    "coachId": "uuid | null",
    "startDateTime": "string (ISO 8601)",
    "endDateTime": "string (ISO 8601)",
    "description": "string"
  }
  ```
  **Field rules:**
  - `blockType`: required. Serialized as enum values `PERSONAL | GYM_WIDE`.
  - `coachId`: required when `blockType` is `personal` (the coach whose calendar is blocked). For Admin creating a personal block, this can be any coach; for Coach creating a personal block, this defaults to their own ID (or is set to self).
  - `startDateTime`/`endDateTime`: required, must be aligned to hour boundaries (blocks are 1-hour minimum).
  - `description`: optional.
- **Success Response:** `201 Created`
  ```json
  {
    "id": "uuid",
    "blockType": "personal | gym-wide",
    "createdBy": { "id": "uuid", "name": "string" },
    "coach": { "id": "uuid", "name": "string" } | null,
    "startTime": "string (ISO 8601)",
    "endTime": "string (ISO 8601)",
    "description": "string"
  }
  ```
- **Error Responses:**
  - `400 VALIDATION_ERROR` — schema validation failure.
  - `403 FORBIDDEN` — Coach role cannot create gym-wide blocks.
  - `409 OVERLAP_DETECTED` — the blocked time overlaps with an existing class or block for the coach or gym.
  - `503 SERVICE_UNAVAILABLE` — Google Calendar API error.
- **Business Rules Applied:**
  - Gym-wide blocks block all classes for the entire gym during the specified time (PRD Section 5).
  - Personal blocks prevent class assignment to the specified coach (PRD Section 5).
  - No notifications are required for blocks (PRD Section 9, Resolved).
  - Google Calendar event created for the block.
  - UI note: the Add Class modal offers Individual / Group / Block; blocks are created through the modal's Block option (there is no standalone Add Block modal or button).

---

### DELETE /blocks/:id

- **Description:** Soft-cancels a block (`status → CANCELED`). Removes the corresponding Google Calendar event and clears `google_event_id`. The record is retained but excluded from `GET /blocks` and availability.
- **Auth/Role:** Authenticated (Admin or Coach). Admin can cancel any block; Coach can cancel only `PERSONAL` blocks they created.
- **Path Params:**
  - `id` (uuid) — block ID.
- **Query Params:** None.
- **Request Body:** None.
- **Success Response:** `200 OK`
  ```json
  { "id": "uuid", "status": "CANCELED" }
  ```
- **Error Responses:**
  - `403 FORBIDDEN` — not the block creator and not an Admin.
  - `404 NOT_FOUND` — block does not exist.
  - `409 CONFLICT` — block is already canceled.
  - `503 SERVICE_UNAVAILABLE` — Google Calendar API error (no DB change).
- **Business Rules Applied:**
  - Admin can cancel any block; Coach can only cancel their own personal blocks.
  - No notifications are sent for block cancellation (PRD Section 9, Resolved).
  - Audited: `block.cancel` SUCCESS (and DENIED on authorization rejection).

---

## Waiting Lists

### POST /classes/:id/waiting-list

- **Description:** Adds the authenticated coachee to the waiting list for a class. Applicable to both group classes (when full) and individual class time slots (via gray busy block on calendar). Validates that the class exists, has a waiting list slot available, and the coachee is not already enrolled or on the list.
- **Auth/Role:** Authenticated (Coachee).
- **Path Params:**
  - `id` (uuid) — class ID.
- **Query Params:** None.
- **Request Body:** None (coachee identity derived from JWT).
- **Success Response:** `201 Created`
  ```json
  {
    "id": "uuid",
    "classId": "uuid",
    "coacheeId": "uuid",
    "joinedAt": "string (ISO 8601)"
  }
  ```
- **Error Responses:**
  - `403 FORBIDDEN` — authenticated user is not a Coachee.
  - `404 NOT_FOUND` — class does not exist.
  - `409 WAITING_LIST_FULL` — waiting list has reached its maximum size (4).
  - `409 ALREADY_ON_WAITING_LIST` — coachee is already on this waiting list.
  - `409 ALREADY_ENROLLED` — coachee is already enrolled in this class.
  - `409 LEVEL_MISMATCH` — coachee's level is outside the class's reach (waiting list is only available for classes within reach).
  - `400 VALIDATION_ERROR` — class status is `canceled`.
- **Business Rules Applied:**
  - Waiting list max size: 4 coachees (PRD Section 5).
  - No limit on the number of waiting lists a coachee can be on simultaneously (PRD Section 5).
  - For group classes: only available when class is full (4/4) (PRD Section 5).
  - For individual classes: available when the time slot is already occupied (PRD Section 5).
  - Notification #9 sent to the joining coachee: "Te has apuntado a la waiting list...".

---

### DELETE /classes/:id/waiting-list

- **Description:** Voluntarily removes the authenticated coachee from a class's waiting list.
- **Auth/Role:** Authenticated (Coachee — the waitlisted coachee).
- **Path Params:**
  - `id` (uuid) — class ID.
- **Query Params:** None.
- **Request Body:** None (coachee identity derived from JWT).
- **Success Response:** `200 OK`
  ```json
  { "message": "Removed from waiting list." }
  ```
- **Error Responses:**
  - `403 FORBIDDEN` — not the waitlisted coachee.
  - `404 NOT_FOUND` — class does not exist or coachee is not on the waiting list.
- **Business Rules Applied:**
  - Coachee may leave any waiting list at any time (PRD Section 5).
  - No notification is sent to the Coach (PRD Section 6.4).
  - Notification #10 sent to the leaving coachee: "Has salido de la waiting list...".

---

### POST /classes/:id/waiting-list/claim

- **Description:** Claims an opened spot on a first-come-first-served basis. The first waitlisted coachee to call this endpoint after a spot opens is enrolled. Uses a serializable transaction to enforce FCFS under concurrent requests. Subsequent claimants receive a conflict error.
- **Auth/Role:** Authenticated (Coachee — must be on the waiting list).
- **Path Params:**
  - `id` (uuid) — class ID.
- **Query Params:** None.
- **Request Body:** None (coachee identity derived from JWT).
- **Success Response:** `201 Created`
  ```json
  {
    "data": {
      "message": "You joined this class from the waiting list.",
      "enrollmentId": "uuid",
      "classId": "uuid",
      "coacheeId": "uuid",
      "joinedAt": "2026-08-25T10:00:00.000Z"
    }
  }
  ```
- **Error Responses:**
  - `403 FORBIDDEN` — authenticated user is not a Coachee.
  - `404 NOT_FOUND` — class does not exist.
  - `409 NOT_ON_WAITING_LIST` — coachee is not on the waiting list for this class.
  - `409 ALREADY_ENROLLED` — coachee is already enrolled in this class.
  - `409 SPOT_TAKEN` — class is already at capacity (another coachee claimed first).
  - `400 VALIDATION_ERROR` — class status is `canceled`.
- **Business Rules Applied:**
  - FCFS enforced via PostgreSQL serializable transaction — concurrent claim attempts result in at most one success (PRD Section 5).
  - Class must be ACTIVE (not canceled).
  - Class must have capacity (enrollment count < 4).
  - Coachee must have an existing waiting list entry for the class.
  - Notification #9 sent to the claiming coachee.
  - Notification #6 sent to the assigned coach.
  - Waiting list entry is removed upon successful claim.

---

### GET /waiting-lists

- **Description:** Returns all active waiting lists the authenticated coachee is on. Includes class name, date/time, and status.
- **Auth/Role:** Authenticated (Coachee).
- **Path Params:** None.
- **Query Params:** None.
- **Request Body:** None.
- **Success Response:** `200 OK`
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "class": {
          "id": "uuid",
          "classType": "individual | group",
          "startTime": "string (ISO 8601)",
          "level": { "name": "string", "color": "string" } | null,
          "assignedCoach": { "name": "string" }
        },
        "joinedAt": "string (ISO 8601)",
        "hasOpenSpots": false
      }
    ],
    "meta": { "page": 1, "limit": 20, "total": 3, "totalPages": 1 }
  }
  ```
  `hasOpenSpots` indicates whether at least one spot is currently available in the class (for informational display — the coachee must take action to claim a spot).
- **Error Responses:**
  - `403 FORBIDDEN` — authenticated user is not a Coachee.
- **Business Rules Applied:**
  - Only active classes with an existing waiting list entry are returned.
  - Position is not returned because notification is simultaneous and position does not guarantee priority (PRD Section 6.4).

---

## Coachees

### GET /coachees

- **Description:** Lists coachees with optional filtering by status and level. Admin and Coach roles can access this list.
- **Auth/Role:** Authenticated (Admin or Coach).
- **Path Params:** None.
- **Query Params:**
  - `status` (string, optional, comma-separated) — `active`, `inactive`.
  - `levelId` (string, optional, comma-separated) — filter by level IDs.
  - `page` (int, optional, default 1).
  - `limit` (int, optional, default 20).
- **Request Body:** None.
- **Success Response:** `200 OK`
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "name": "string",
        "email": "string",
        "phone": "string",
        "classTypePreference": "individual | group | both | null",
        "status": "active | inactive",
        "level": { "id": "uuid", "name": "string", "color": "string" } | null,
        "createdAt": "string (ISO 8601)"
      }
    ],
    "meta": { "page": 1, "limit": 20, "total": 25, "totalPages": 2 }
  }
  ```
  Coach financial fields (bank_account, ssn, dni) are never included in this response (PRD Section 10.3 — response minimisation).
- **Error Responses:**
  - `403 FORBIDDEN` — Coachee role cannot access this endpoint.
- **Business Rules Applied:**
  - Multi-select filters for status and level (PRD Section 6.2).
  - Financial data is excluded from list endpoints (PRD Section 10.3).

---

### POST /coachees

- **Description:** Creates a new coachee user. Sets the initial level and class type preference. Records the current date as creation timestamp.
- **Auth/Role:** Authenticated (Admin only — PRD Section 6.2).
- **Path Params:** None.
- **Query Params:** None.
- **Request Body:**
  ```json
  {
    "name": "string",
    "email": "string (email format)",
    "phone": "string",
    "classTypePreference": "individual | group | both",
    "levelId": "uuid",
    "additionalInfo": "string | null"
  }
  ```
  The coachee's phone number is used as their initial password (hashed with bcrypt cost factor 12 before storage).
- **Success Response:** `201 Created`
  ```json
  {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "phone": "string",
    "classTypePreference": "individual | group | both",
    "status": "active",
    "level": { "id": "uuid", "name": "string", "color": "string" },
    "createdAt": "string (ISO 8601)"
  }
  ```
  Password is not included in the response (PRD Section 10.1).
- **Error Responses:**
  - `400 VALIDATION_ERROR` — schema validation failure.
  - `403 FORBIDDEN` — not an Admin.
  - `409 CONFLICT` — email already exists.
- **Business Rules Applied:**
  - Admin-only action (PRD Section 6.2).
  - Phone is required — the coachee's phone number is used as their initial password, hashed with bcrypt cost factor 12 before storage (PRD Section 10.1).
  - Newly created coachees have `must_change_password = true`, requiring a password change on first login.

---

### GET /coachees/:id

- **Description:** Returns full details of a single coachee.
- **Auth/Role:** Authenticated (Admin or Coach).
- **Path Params:**
  - `id` (uuid) — coachee ID.
- **Query Params:** None.
- **Request Body:** None.
- **Success Response:** `200 OK`
  ```json
  {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "phone": "string",
    "classTypePreference": "individual | group | both | null",
    "status": "active | inactive",
    "level": { "id": "uuid", "name": "string", "color": "string" } | null,
    "additionalInfo": "string | null",
    "createdAt": "string (ISO 8601)",
    "updatedAt": "string (ISO 8601)"
  }
  ```
- **Error Responses:**
  - `403 FORBIDDEN` — Coachee role cannot access.
  - `404 NOT_FOUND` — coachee does not exist.

---

### PUT /coachees/:id

- **Description:** Updates a coachee's profile fields. Partial updates are allowed (only provided fields are changed).
- **Auth/Role:** Authenticated (Admin or Coach).
- **Path Params:**
  - `id` (uuid) — coachee ID.
- **Query Params:** None.
- **Request Body:**
  ```json
  {
    "name": "string | null",
    "email": "string (email) | null",
    "phone": "string | null",
    "classTypePreference": "individual | group | both | null",
    "additionalInfo": "string | null"
  }
  ```
  All fields are optional; only provided fields are updated.
- **Success Response:** `200 OK` — returns the updated coachee object (same shape as `GET /coachees/:id`).
- **Error Responses:**
  - `400 VALIDATION_ERROR` — schema validation failure.
  - `403 FORBIDDEN` — Coachee role cannot access.
  - `404 NOT_FOUND` — coachee does not exist.
  - `409 CONFLICT` — email already in use by another user.

---

### PATCH /coachees/:id/status

- **Description:** Activates or deactivates a coachee. An inactive coachee cannot log in or be enrolled in new classes.
- **Auth/Role:** Authenticated (Admin only — PRD Section 3).
- **Path Params:**
  - `id` (uuid) — coachee ID.
- **Query Params:** None.
- **Request Body:**
  ```json
  {
    "status": "active | inactive"
  }
  ```
- **Success Response:** `200 OK`
  ```json
  { "id": "uuid", "status": "active | inactive" }
  ```
- **Error Responses:**
  - `400 VALIDATION_ERROR` — invalid status value.
  - `403 FORBIDDEN` — not an Admin.
  - `404 NOT_FOUND` — coachee does not exist.
- **Business Rules Applied:**
  - Admin-only action (PRD Section 3).
  - Inactive coachees cannot authenticate (enforced at login).

---

### PATCH /coachees/:id/level

- **Description:** Changes the level assigned to a coachee. Level can be changed at any time.
- **Auth/Role:** Authenticated (Admin or Coach — PRD Section 5).
- **Path Params:**
  - `id` (uuid) — coachee ID.
- **Query Params:** None.
- **Request Body:**
  ```json
  { "levelId": "uuid" }
  ```
- **Success Response:** `200 OK`
  ```json
  {
    "id": "uuid",
    "level": { "id": "uuid", "name": "string", "color": "string", "sortOrder": 1 }
  }
  ```
- **Error Responses:**
  - `400 VALIDATION_ERROR` — invalid level ID.
  - `403 FORBIDDEN` — Coachee role cannot change levels.
  - `404 NOT_FOUND` — coachee or level does not exist.
- **Business Rules Applied:**
  - Levels can be changed at any time by a Coach or Admin (PRD Section 5).
  - Notification #11 is sent to the affected coachee: "Tu nivel ha sido actualizado a [nuevo nivel]".

---

## Coaches

### GET /coaches

- **Description:** Lists all coaches with basic profile fields. Financial data (bank account, SSN, DNI) is **never** included in this list response (PRD Section 10.3 — response minimisation).
- **Auth/Role:** Authenticated (Admin only — PRD Section 6.3).
- **Path Params:** None.
- **Query Params:**
  - `status` (string, optional, comma-separated) — `active`, `inactive`.
  - `page` (int, optional, default 1).
  - `limit` (int, optional, default 20).
- **Request Body:** None.
- **Success Response:** `200 OK`
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "name": "string",
        "email": "string",
        "phone": "string",
        "status": "active | inactive",
        "createdAt": "string (ISO 8601)"
      }
    ],
    "meta": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 }
  }
  ```
- **Error Responses:**
  - `403 FORBIDDEN` — not an Admin.
- **Business Rules Applied:**
  - Admin-only page (PRD Section 6.3).
  - Financial fields are excluded from all list and detail endpoints (PRD Section 10.3). Available only via `GET /coaches/:id/financial`.

---

### POST /coaches

- **Description:** Creates a new coach user with profile and financial data. Financial data (bank account, SSN, DNI) is encrypted at the application layer with AES-256-GCM before storage (PRD Section 10.4).
- **Auth/Role:** Authenticated (Admin only — PRD Section 6.3).
- **Path Params:** None.
- **Query Params:** None.
- **Request Body:**
  ```json
  {
    "name": "string",
    "email": "string (email)",
    "phone": "string",
    "bankAccount": "string",
    "ssn": "string",
    "dni": "string",
    "additionalInfo": "string | null"
  }
  ```
- **Success Response:** `201 Created`
  ```json
  {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "phone": "string",
    "status": "active",
    "createdAt": "string (ISO 8601)"
  }
  ```
  Financial fields are **not** included in the response (PRD Section 10.3).
- **Error Responses:**
  - `400 VALIDATION_ERROR` — schema validation failure.
  - `403 FORBIDDEN` — not an Admin.
  - `409 CONFLICT` — email already exists.
- **Business Rules Applied:**
  - Admin-only action (PRD Section 6.3).
  - Financial data encrypted at application layer with AES-256-GCM (PRD Section 10.4).
  - Password handling: same ambiguity as coachee creation — temporary password or invitation flow expected but undefined in the PRD.

---

### GET /coaches/:id

- **Description:** Returns a single coach's profile (non-financial fields only).
- **Auth/Role:** Authenticated (Admin only).
- **Path Params:**
  - `id` (uuid) — coach ID.
- **Query Params:** None.
- **Request Body:** None.
- **Success Response:** `200 OK`
  ```json
  {
    "id": "uuid",
    "name": "string",
    "email": "string",
    "phone": "string",
    "status": "active | inactive",
    "additionalInfo": "string | null",
    "createdAt": "string (ISO 8601)",
    "updatedAt": "string (ISO 8601)"
  }
  ```
- **Error Responses:**
  - `403 FORBIDDEN` — not an Admin.
  - `404 NOT_FOUND` — coach does not exist.

---

### PUT /coaches/:id

- **Description:** Updates a coach's profile fields (non-financial). Partial update.
- **Auth/Role:** Authenticated (Admin only).
- **Path Params:**
  - `id` (uuid) — coach ID.
- **Query Params:** None.
- **Request Body:**
  ```json
  {
    "name": "string | null",
    "email": "string (email) | null",
    "phone": "string | null",
    "additionalInfo": "string | null"
  }
  ```
- **Success Response:** `200 OK` — returns updated coach object.
- **Error Responses:**
  - `400 VALIDATION_ERROR` — schema validation failure.
  - `403 FORBIDDEN` — not an Admin.
  - `404 NOT_FOUND` — coach does not exist.
  - `409 CONFLICT` — email already in use.

---

### PATCH /coaches/:id/status

- **Description:** Activates or deactivates a coach. An inactive coach cannot log in or be assigned to new classes.
- **Auth/Role:** Authenticated (Admin only — PRD Section 6.3).
- **Path Params:**
  - `id` (uuid) — coach ID.
- **Query Params:** None.
- **Request Body:**
  ```json
  { "status": "active | inactive" }
  ```
- **Success Response:** `200 OK`
  ```json
  { "id": "uuid", "status": "active | inactive" }
  ```
- **Error Responses:**
  - `400 VALIDATION_ERROR` — invalid status.
  - `403 FORBIDDEN` — not an Admin.
  - `404 NOT_FOUND` — coach does not exist.

---

### GET /coaches/:id/financial

- **Description:** Returns the coach's financial data (bank account, SSN, DNI). This is a **dedicated, isolated endpoint** that is never included in list or general detail responses, per PRD Section 10.3 (response minimisation). Access is logged as a security event (PRD Section 10.8).
- **Auth/Role:** Authenticated (Admin only — PRD Section 10.3).
- **Path Params:**
  - `id` (uuid) — coach ID.
- **Query Params:** None.
- **Request Body:** None.
- **Success Response:** `200 OK`
  ```json
  {
    "id": "uuid",
    "bankAccount": "string",
    "ssn": "string",
    "dni": "string"
  }
  ```
- **Error Responses:**
  - `403 FORBIDDEN` — not an Admin.
  - `404 NOT_FOUND` — coach does not exist.
- **Business Rules Applied:**
  - Admin-only access — this is the most sensitive endpoint in the system (PRD Section 10.3).
  - Data is decrypted from AES-256-GCM encrypted storage before response (PRD Section 10.4).
  - Every access is logged to the security event log with actor ID, action, resource, and outcome (PRD Section 10.8).

---

## Notifications

### GET /notifications

- **Description:** Returns notifications for the authenticated user. Role-based visibility: Admin and Coach see only the current day's notifications; Coachee sees full chronological history (PRD Section 7).
- **Auth/Role:** Authenticated (any role — visibility scoped by role).
- **Path Params:** None.
- **Query Params:**
  - `page` (int, optional, default 1).
  - `limit` (int, optional, default 20).
  - `unreadOnly` (boolean, optional, default false).
- **Request Body:** None.
- **Success Response:** `200 OK`
  ```json
  {
    "data": [
      {
        "id": "uuid",
        "notificationType": 1,
        "content": "string (rendered push text)",
        "classId": "uuid | null",
        "isRead": false,
        "sentAt": "string (ISO 8601)"
      }
    ],
    "meta": { "page": 1, "limit": 20, "total": 8, "totalPages": 1 }
  }
  ```
- **Error Responses:** None beyond standard auth errors.
- **Business Rules Applied:**
  - Admin/Coach: only notifications where `sentAt` is within the current calendar day (PRD Section 7).
  - Coachee: full history, ordered by `sentAt` descending.
  - Notifications are generated server-side by domain services (ProcessWaitingListService, SendNotificationService) and sent via FCM push as well (PRD Section 7, Architecture Section 4).

---

### POST /notifications/device-token

- **Description:** Registers (or re-registers) the calling user's push notification device credential. Idempotent: if the token already exists it is updated — reassigned to the currently authenticated account and marked active; otherwise created.
- **Auth/Role:** Authenticated (any role: ADMIN, COACH, COACHEE).
- **Path Params:** None.
- **Query Params:** None.
- **Request Body:**
  ```json
  { "token": "string (FCM registration token, length 32–4096)", "platform": "WEB" }
  ```
  - `platform` optional, default `"WEB"`. Unknown/extra fields rejected (`VALIDATION_ERROR`).
- **Success Response:** `200 OK` (always 200 — upsert is idempotent by design)
  ```json
  { "id": "uuid", "platform": "WEB", "createdAt": "2026-08-21T10:00:00.000Z" }
  ```
- **Error Responses:**
  - `400 VALIDATION_ERROR` — missing/short/long token or unexpected fields (`{ error: { code, message, ref } }`).
  - `401 UNAUTHORIZED` — missing/expired JWT.
  - `403 FORBIDDEN` — role outside ADMIN/COACH/COACHEE (not reachable with current role set; kept for consistency).
- **Business Rules Applied:**
  - Latecomer-wins ownership: the same physical device registering under account B silently moves the credential from account A.
  - Re-registration of an inactive (stale-deactivated) token reactivates it.
  - Invalid-payload attempts are logged as security events (actor, action, outcome) via `AuditLogger`.
  - No push dispatch is triggered by this endpoint; registration only affects future fan-outs.

---

### PATCH /notifications/:id/read

- **Description:** Marks a single notification as read.
- **Auth/Role:** Authenticated (any role — only the notification's recipient can mark it as read).
- **Path Params:**
  - `id` (uuid) — notification ID.
- **Query Params:** None.
- **Request Body:** None.
- **Success Response:** `200 OK`
  ```json
  { "id": "uuid", "isRead": true }
  ```
- **Error Responses:**
  - `403 FORBIDDEN` — not the notification's recipient.
  - `404 NOT_FOUND` — notification does not exist.
- **Business Rules Applied:**
  - Only the recipient can mark a notification as read.

---

## Health

### GET /health

- **Description:** Minimal health check endpoint. Returns 200 OK with no internal state. Used by Docker health checks and Render monitoring (PRD Section 10.6). No authentication required.
- **Auth/Role:** None.
- **Path Params:** None.
- **Query Params:** None.
- **Request Body:** None.
- **Success Response:** `200 OK`
  ```json
  { "status": "ok" }
  ```
- **Error Responses:**
  - `503 SERVICE_UNAVAILABLE` — database or critical external dependency is unreachable (checked by the health check logic).
- **Business Rules Applied:**
  - No authentication (PRD Section 10.3).
  - No internal state exposed (PRD Section 10.6).

---

## Notification Types Reference

| # | Trigger | Recipient(s) | Content |
|---|---------|-------------|---------|
| 1 | Spot(s) open in a class with a waiting list | All Coachees on that waiting list | "¡Hay hueco(s) libre(s) en [clase/nivel]! Corre a reservarlo." |
| 2 | Coach creates individual class | Assigned Coachee | — |
| 3 | Coachee cancels individual class | Assigned Coach | — |
| 4 | Coachee cancels group class — waiting list exists | Assigned Coach | "[Coachee] canceló. Se ha notificado a [N] coache(s) en waiting list." |
| 5 | Coachee cancels group class — no waiting list | Assigned Coach | "[Coachee] canceló. El hueco está libre." |
| 6 | Waitlisted Coachee claims a spot | Assigned Coach | "A waitlisted Coachee has claimed the spot in this class." |
| 7 | Coach creates group class | Assigned Coach | — |
| 8 | Coachee joins a group class | Assigned Coach | — |
| 9 | Coachee joins a waiting list / Coachee claims from waiting list | The Coachee who joined/claimed | "Te has apuntado a la waiting list de [clase/hora]. Te avisaremos cuando haya hueco." / "You joined this class from the waiting list." |
| 10 | Coachee leaves a waiting list voluntarily | The Coachee who left | "Has salido de la waiting list de [clase/hora]" |

- Notifications #4 and #5 are mutually exclusive: the system checks whether a waiting list exists and sends the appropriate variant.
- Notification #1 is not sent if a spot opens but the waiting list is empty; instead, the Coach is notified (#4 or #5 depending on context).
- All waitlisted coachees are notified **simultaneously** (no sequential fan-out).

---

## Endpoint Summary

| Method | Path | Role | Short Description |
|--------|------|------|-------------------|
| POST | `/auth/login` | None | Authenticate and receive tokens |
| POST | `/auth/refresh` | None | Refresh access token |
| POST | `/auth/change-password` | Any | Change password (also clears mustChangePassword flag) |
| POST | `/auth/logout` | Any | Revoke refresh token |
| GET | `/classes` | Any | List classes in date range (role-filtered) |
| POST | `/classes` | Admin, Coach | Create class or recurring series |
| GET | `/classes/:id` | Any | Get class details |
| DELETE | `/classes/:id` | Admin, Coach | Cancel class (single instance or series) |
| DELETE | `/recurring-series/:id` | Admin, Coach | Cancel entire recurring series |
| POST | `/classes/:id/enrollment` | Coachee | Join a group class |
| DELETE | `/classes/:id/enrollment` | Coachee | Cancel own class attendance |
| GET | `/classes/available-slots` | Admin, Coach | Get available time slots |
| GET | `/classes/assignable-coaches` | Admin, Coach | List active Admins and Coaches assignable to a class |
| GET | `/coachee/dashboard` | Coachee | Home screen data (next class, joinable classes, waiting-list opportunities) |
| GET | `/blocks` | Admin, Coach | List blocks in date range |
| POST | `/blocks` | Admin, Coach | Create a block |
| DELETE | `/blocks/:id` | Admin, Coach | Cancel a block |
| POST | `/classes/:id/waiting-list` | Coachee | Join waiting list |
| DELETE | `/classes/:id/waiting-list` | Coachee | Leave waiting list |
| POST | `/classes/:id/waiting-list/claim` | Coachee | Claim spot from waiting list (FCFS) |
| GET | `/waiting-lists` | Coachee | List my active waiting lists |
| GET | `/coachees` | Admin, Coach | List coachees (with filters) |
| POST | `/coachees` | Admin | Create coachee |
| GET | `/coachees/:id` | Admin, Coach | Get coachee details |
| PUT | `/coachees/:id` | Admin, Coach | Update coachee |
| PATCH | `/coachees/:id/status` | Admin | Activate/deactivate coachee |
| PATCH | `/coachees/:id/level` | Admin, Coach | Change coachee level |
| GET | `/coaches` | Admin | List coaches |
| POST | `/coaches` | Admin | Create coach |
| GET | `/coaches/:id` | Admin | Get coach details |
| PUT | `/coaches/:id` | Admin | Update coach |
| PATCH | `/coaches/:id/status` | Admin | Activate/deactivate coach |
| GET | `/coaches/:id/financial` | Admin | Get coach financial data |
| GET | `/notifications` | Any | List notifications (role-scoped) |
| POST | `/notifications/device-token` | Any | Register/re-register this device's push token |
| PATCH | `/notifications/:id/read` | Any | Mark notification as read |
| GET | `/health` | None | Health check |
