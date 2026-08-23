# Quickstart: Calendar Block Management

**Phase 1 output** — runnable validation scenarios that prove the feature works end-to-end. Contract details: [contracts/api.md](./contracts/api.md). Data/entity details: [data-model.md](./data-model.md).

## Prerequisites

- Docker Compose stack up (PostgreSQL): `docker compose up -d`
- Backend env configured (`.env` per `.env.example`), Google Calendar Service Account credentials available for the sync scenarios
- Migration applied: `npm run db:generate && npm run db:migrate && npm run db:seed`
- Backend running: `npm run dev` (port 3001); Frontend running: `npm run dev` (port 5173, proxies `/api` to 3001)

## Automated validation (backend)

Run once: `npm test` (backend) — must stay green with the new tests:

- `BlockPolicy.test.ts` — domain rules (100% branch coverage): window matrix (aligned/misaligned, < 1h, start ≥ end, past start), personal create matrix (Admin any / Coach self / Coach other → denied), gym-wide create (Admin / Coach → denied), cancel matrix (Admin any / Coach own personal / Coach other's personal / Coach gym-wide → denied).
- `blocks.test.ts` (API) — for each endpoint: one happy-path + one validation-error test:
  - `GET /blocks` — valid range returns `{ data, meta }` with only ACTIVE blocks in the window; missing/inverted range → `400`; `blockType` filter; Coach sees the same set as Admin.
  - `POST /blocks` — `201` personal (Coach self, and Admin → another coach); `201` gym-wide (Admin); `400` misaligned/short/past window; `403` Coach gym-wide; `403` Coach blocking another coach; `404` inactive/nonexistent target; `409` overlap with a class; `409` overlap with another block.
  - `DELETE /blocks/:id` — `200 { id, status: "CANCELED" }`; `403` Coach canceling another's personal or a gym-wide block; `404`; `409` already canceled.
- `blocks.int.test.ts` (with credentials) — a created block's Google event exists on the calendar and disappears after cancel.
- Extended `GetAvailableSlots.test.ts` — block stubs carry `status`; only ACTIVE blocks exclude slots.

## Manual API validation

All calls as Admin/Coach via dev-bypass or a JWT (see `backend/src/__tests__/classes.test.ts` for token helpers).

1. **Create a personal block** (Coach, hour-aligned, ≥ 1h)
   ```bash
   curl -s -X POST "http://localhost:3001/api/v1/blocks" \
     -H "Content-Type: application/json" \
     -d '{"blockType":"PERSONAL","coachId":"<coachId>","startDateTime":"2026-08-24T09:00:00Z","endDateTime":"2026-08-24T11:00:00Z","description":"Doctor"}'
   ```
   → `201`; body has `blockType: "PERSONAL"`, `coach` filled, `startTime`/`endTime` set.

2. **Create a gym-wide block** (Admin)
   ```bash
   curl -s -X POST "http://localhost:3001/api/v1/blocks" \
     -H "Content-Type: application/json" \
     -d '{"blockType":"GYM_WIDE","startDateTime":"2026-08-25T15:00:00Z","endDateTime":"2026-08-25T16:00:00Z"}'
   ```
   → `201`; `coach: null`.

3. **Overlap rejected**
   ```bash
   curl -s -X POST "http://localhost:3001/api/v1/blocks" -H "Content-Type: application/json" \
     -d '{"blockType":"GYM_WIDE","startDateTime":"2026-08-25T15:00:00Z","endDateTime":"2026-08-25T16:00:00Z"}'
   ```
   → `409` `{ error: { code: "OVERLAP_DETECTED", ... } }`.

4. **List with range + filter**
   ```bash
   curl -s "http://localhost:3001/api/v1/blocks?start=2026-08-24T00:00:00Z&end=2026-08-25T23:59:59Z&blockType=PERSONAL"
   ```
   → `200`; only ACTIVE personal blocks overlapping the window; `meta.total` matches.

5. **Cancel a block**
   ```bash
   curl -s -X DELETE "http://localhost:3001/api/v1/blocks/<id>"
   ```
   → `200` `{ id, status: "CANCELED" }`; re-request `GET /blocks` → the block is gone; the same DELETE again → `409`.

6. **Unauthorized cancel** (Coach JWT on a gym-wide block) → `403`.

7. **Availability reflects blocks** — `GET /api/v1/classes/available-slots?date=2026-08-24&coachId=<coachId>&classType=INDIVIDUAL` excludes 09:00 and 10:00 slots while the block is ACTIVE; after cancel they return.

8. **Audit**: after a create/cancel, `security_audit_log` contains `action='block.create'`/`'block.cancel'` with matching `outcome`; zero `notifications` rows are produced for any block action.

## Manual UI validation (frontend)

1. Log in as an Admin → `/admin/calendar`; repeat as a Coach (`/coach/calendar`).
2. **Create a block**: click **Add Block** → pick type (Personal / Gym-wide); Coach's Personal targets self (no coach picker); Admin sees the active-coach dropdown; pick hour-aligned start/end (≥ 1h) → Save.
3. **Overlap feedback**: try a personal block over a slot where the Coach has a class → inline error; the modal stays open.
4. **Calendar rendering**: blocks appear as distinct (gray/dark) bars alongside classes in the week view; past canceled blocks do not render.
5. **Cancel**: click a block → detail view → Cancel (shown for Admin on any block; for Coach only on own personal blocks); the bar disappears and the slot becomes available in the Add Class modal.
6. **Negative checks**: a Coachee account cannot reach Add Block or the block list (server enforces auth/role).

## Success-criteria mapping

| Scenario | Success criterion |
|----------|-------------------|
| Personal + gym-wide create → 201, visible + synced | SC-001 |
| Overlap with class/block → 409 | SC-002 |
| Coach gym-wide / others' personal / others' cancel → 403 | SC-003 |
| Cancel within 30s → slot freed + event removed (int test) | SC-004 |
| Range + filter accuracy | SC-005 |
| Available-slots excludes active blocks, includes canceled | SC-006 |
| Zero notifications for any block action | SC-007 |