# API Contract: Notifications (017 additions)

> Source of truth: `docs/api-specifications.md`. The `POST /notifications/device-token`
> section below MUST be copied into that document **before** implementation begins
> (Constitution §IV). Existing documented endpoints `GET /notifications` and
> `PATCH /notifications/:id/read` remain **501 stubs** until US-4.5.

## POST /notifications/device-token

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
  - Latecomer-wins ownership: the same physical device registering under account B silently moves the credential from account A (spec FR-005).
  - Re-registration of an inactive (stale-deactivated) token reactivates it.
  - Invalid-payload attempts are logged as security events (actor, action, outcome) via `AuditLogger`.
  - No push dispatch is triggered by this endpoint; registration only affects future fan-outs.

---

## Endpoint Summary addition (for docs/api-specifications.md table)

| Method | Path | Role | Short Description |
|--------|------|------|-------------------|
| POST | `/notifications/device-token` | Any | Register/re-register this device's push token |

## Non-goals this story

- `GET /notifications`, `PATCH /notifications/:id/read` → unchanged 501 stubs (US-4.5).
- No trigger endpoints change behavior yet; `SendNotification` ships unexercised by business flows (US-4.2+ wire it in).
