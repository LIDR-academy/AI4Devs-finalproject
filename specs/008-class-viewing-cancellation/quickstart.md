# Quickstart: Class Viewing & Cancellation

**Phase 1 output** — runnable validation scenarios that prove the feature works end-to-end. Contract details: [contracts/api.md](./contracts/api.md). Data/entity details: [data-model.md](./data-model.md).

## Prerequisites

- Docker Compose stack up (PostgreSQL): `docker compose up -d`
- Backend env configured (`.env` per `.env.example`), Google Calendar Service Account credentials available for the sync scenarios
- `npm run db:generate && npm run db:migrate && npm run db:seed`
- Backend running: `npm run dev` (port 3001); Frontend running: `npm run dev` (port 5173, proxies `/api` to 3001)

## Automated validation (backend)

Run once: `npm test` (backend) — must stay green with the new tests:

- `ClassCancellationPolicy.test.ts` — domain rules (100% branch coverage): authorization matrix (Admin / assigned Coach / other Coach / Coachee), single vs. series instance selection, already-canceled skips, past-instance protection, notification-type mapping.
- `classes.test.ts` (API) — for each endpoint: one happy-path + one validation-error test:
  - `GET /classes` — valid range returns `{ data, meta }`; missing/inverted range → `400`; unknown role scoping.
  - `GET /classes/:id` — 200 with counts; 404.
  - `DELETE /classes/:id` — 200 soft-cancel (status `CANCELED`); `403` non-assigned coach/coachee; `404`; `409` double-cancel; `?scope=series` count.
  - `DELETE /recurring-series/:id` — 200 with `canceledInstanceCount`; past instances untouched; `403`; `404`.
- `classes.int.test.ts` (with credentials) — created class's `google_event_id` event is deleted from Google Calendar on cancel.

## Manual API validation

All calls as Admin/Coach via dev-bypass or a JWT (see `backend/src/__tests__/classes.test.ts` for token helpers).

1. **List with filters**
   ```bash
   curl -s "http://localhost:3001/api/v1/classes?start=2026-08-17T00:00:00Z&end=2026-08-23T23:59:59Z&classType=GROUP" 
   ```
   → `200`; `data` contains only group classes inside the window; `meta.total` matches.

2. **Detail with counts**
   ```bash
   curl -s "http://localhost:3001/api/v1/classes/<id>"
   ```
   → `200`; `enrollmentCount`, `capacity`, `hasWaitingList`, `waitingListCount` correct.

3. **Cancel single occurrence**
   ```bash
   curl -s -X DELETE "http://localhost:3001/api/v1/classes/<id>?scope=single"
   ```
   → `200` `{ id, status: "CANCELED", canceledInstances: null }`; re-request detail → `status: "CANCELED"`; the class stays in `GET /classes`.

4. **Cancel whole series**
   ```bash
   curl -s -X DELETE "http://localhost:3001/api/v1/classes/<seriesInstanceId>?scope=series"
   ```
   → `200` with `canceledInstances` = number of remaining future instances; past instances (if any) remain `ACTIVE`.

5. **Unauthorized cancel** (Coachee token)
   ```bash
   curl -s -X DELETE "http://localhost:3001/api/v1/classes/<id>" -H "Authorization: Bearer <coacheeJWT>"
   ```
   → `403` `{ error: { code: "FORBIDDEN", ... } }`.

6. **Double cancel** → second call returns `409`.

7. **Series root cancel**
   ```bash
   curl -s -X DELETE "http://localhost:3001/api/v1/recurring-series/<seriesId>"
   ```
   → `200` `{ seriesId, canceledInstanceCount, status: "CANCELED" }`.

8. **Audit + notifications**: after a cancel, `security_audit_log` contains `action='class.cancel'`, `outcome='SUCCESS'`; `notifications` contains one row `notification_type=7` per enrolled coachee.

## Manual UI validation (frontend)

1. Log in as an Admin → `/admin/today` and `/admin/calendar`; repeat as a Coach (`/coach/today`, `/coach/calendar`).
2. **List**: pick a date range and apply `classType` / `assignedCoach` filters → the list shows only matching classes, paginated when long.
3. **Detail**: open a class → shows type, coach, level (group), time, description, enrolled coachees, enrollment count vs. capacity, waiting-list count, recurring badge.
4. **Cancel single**: open a non-recurring class → Cancel → confirm → class turns gray with a "Canceled" tag and remains listed.
5. **Cancel scope**: open a recurring class → Cancel → choose "this occurrence only" vs. "entire series" → after confirming the series choice, all remaining occurrences show canceled.
6. **Negative checks**: a Coachee account cannot reach the cancel action (server enforces `403`); a Coach who is not assigned to a class sees no cancel action and any manual call returns `403`.

## Success-criteria mapping

| Scenario | Success criterion |
|----------|-------------------|
| Range/filter accuracy checks | SC-001, SC-002 |
| Cancel single + immediate gray display | SC-003 |
| Coachee / non-assigned-coach rejection | SC-004 |
| `scope=series` leaves past intact | SC-005 |
| Google Calendar event gone after cancel (int test) | SC-006 |
| Detail counts match stored state | SC-007 |
