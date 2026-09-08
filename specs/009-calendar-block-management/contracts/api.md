# API Contracts: Calendar Block Management

**Phase 1 output** — endpoint contracts implemented by this feature. These mirror `docs/api-specifications.md` (§Blocks) which remains the authoritative reference (one note: `GET /blocks` excludes canceled blocks and `blockType` uses enum casing). All endpoints live under `/api/v1/`. Errors always use the envelope `{ "error": { "code", "message", "ref" } }`.

## Shared shapes

**Block** — the DTO returned by list and create:

```json
{
  "id": "uuid",
  "blockType": "PERSONAL | GYM_WIDE",
  "createdBy": { "id": "uuid", "name": "string" },
  "coach": { "id": "uuid", "name": "string" } | null,
  "startTime": "ISO 8601",
  "endTime": "ISO 8601",
  "description": "string | null"
}
```

`coach` is present only for `PERSONAL` blocks; `GYM_WIDE` blocks have `coach: null` (the whole gym is blocked).

**Pagination meta**: `{ "page": 1, "limit": 20, "total": 5, "totalPages": 1 }`

---

## GET /blocks

Lists active calendar blocks for a date range, `blockType`-filterable. Used by the frontend to render blocked time next to classes.

- **Auth/Role**: Admin or Coach (`authenticate` + `requireRole(ADMIN, COACH)` — Coachee never reaches this endpoint)
- **Query Params**:
  - `start` (ISO 8601, **required**)
  - `end` (ISO 8601, **required**)
  - `blockType` (`PERSONAL | GYM_WIDE`, optional)
  - `page` (int, optional, default 1), `limit` (int, optional, default 20, max 100)
- **Success**: `200`
  ```json
  { "data": [ "<Block>" ], "meta": { "page": 1, "limit": 20, "total": 5, "totalPages": 1 } }
  ```
- **Errors**:
  - `400 VALIDATION_ERROR` — `start`/`end` missing or malformed, `start > end`, invalid `blockType`, non-UUID or out-of-range `page`/`limit`
- **Rules**: block is within range by **interval overlap** (`start_time < end AND end_time > start`); `status = ACTIVE` only (canceled blocks are never returned); ordered by `start_time ASC`. Admin and Coach see the same complete set (shared schedule).

---

## POST /blocks

Creates a time block (personal or gym-wide) and reserves the period on the external scheduling calendar.

- **Auth/Role**: Admin or Coach (`authenticate` + `requireRole(ADMIN, COACH)`). Gym-wide requires `ADMIN`; personal for a Coach targets self only.
- **Request Body**:
  ```json
  {
    "blockType": "PERSONAL | GYM_WIDE",
    "coachId": "uuid | null",
    "startDateTime": "ISO 8601",
    "endDateTime": "ISO 8601",
    "description": "string | null"
  }
  ```
  **Field rules** (`.strict()` schema):
  - `blockType`: required.
  - `coachId`: required for `PERSONAL` when the actor is an Admin (any target role must be `ADMIN`/`COACH` and `ACTIVE`); for a Coach it defaults to their own id and any other target is rejected.
  - `startDateTime`/`endDateTime`: required, ISO datetimes; both must align to hour boundaries (`:00`) and `endDateTime − startDateTime ≥ 1 hour`, `startDateTime < endDateTime`, `startDateTime` in the future.
  - `description`: optional, ≤ 500 chars.
- **Success**: `201` → single `<Block>`
- **Errors**:
  - `400 VALIDATION_ERROR` — schema/validation failure (incl. misaligned or too-short window, past start, empty body, extra fields)
  - `403 FORBIDDEN` — Coach creating a gym-wide block, or Coach creating a personal block on another Coach's calendar
  - `404 NOT_FOUND` — personal target coach does not exist or is not an active `ADMIN`/`COACH`
  - `409 OVERLAP_DETECTED` — overlaps an existing active class or block (personal: target Coach's classes/blocks + any gym-wide; gym-wide: any class/block)
  - `503 SERVICE_UNAVAILABLE` — calendar service unavailable (no DB change)
- **Side effects**: Google Calendar event created (`google_event_id` stored); `SecurityAuditLog` `block.create` SUCCESS (and DENIED on authorization rejection). No notifications.

---

## DELETE /blocks/:id

Soft-cancels a block (`status → CANCELED`), releasing its time and removing the external calendar event.

- **Auth/Role**: Admin or Coach. Resource rule: Admin cancels any block; Coach cancels only `PERSONAL` blocks they created.
- **Path Params**: `id` (UUID)
- **Success**: `200`
  ```json
  { "id": "uuid", "status": "CANCELED" }
  ```
- **Errors**:
  - `403 FORBIDDEN` — Coach trying to cancel a gym-wide block or a personal block they did not create
  - `404 NOT_FOUND` — block does not exist
  - `409 CONFLICT` — block already canceled
  - `503 SERVICE_UNAVAILABLE` — calendar deletion failed (no DB change)
- **Side effects**: external event removed; row retained with `status = CANCELED` and `google_event_id` cleared; excluded from `GET /blocks` and availability; `SecurityAuditLog` `block.cancel` SUCCESS (and DENIED on authorization rejection). No notifications.

---

## Role/permission matrix

| Action | Admin | Coach |
|--------|-------|-------|
| `GET /blocks` | all active blocks | all active blocks |
| `POST /blocks` personal | any active Coach | self only |
| `POST /blocks` gym-wide | allowed | `403` |
| `DELETE /blocks/:id` | any block | own `PERSONAL` only |