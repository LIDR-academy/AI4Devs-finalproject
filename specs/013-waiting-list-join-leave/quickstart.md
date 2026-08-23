# Quickstart: Waiting List Join/Leave (US-3.3)

**Phase 1 output** — runnable validation scenarios that prove coachee waiting-list join, leave, and listing work end-to-end. Contracts: [api.md](./contracts/api.md), [ui.md](./contracts/ui.md). Entities/state: [data-model.md](./data-model.md). Implementation details live in `tasks.md` / the implementation phase, not here.

## Prerequisites

- PostgreSQL running (`docker compose up`) and backend DB migrated/seeded: from `backend/` run `npm run db:generate && npm run db:migrate && npm run db:seed`
- A Coachee account exists with a level, and at least one Coach (used to create classes)
- Backend dev server: `npm run dev` (port 3001)
- Frontend dev server: `npm run dev` (port 5173, proxies `/api` → 3001)

## Backend validation (curl)

Authenticate as a Coachee first; every request below sends `Authorization: Bearer <coachee JWT>`.

Create a **full group** class (4/4) as a Coach/Admin (in-reach level, valid `startDateTime`, 4 enrolled Coachees):

```
POST /api/v1/classes
{ "classType": "GROUP", "coacheeIds": ["<c1>","<c2>","<c3>","<c4>"], "levelId": "<in-reach-level>", "startDateTime": "<ISO +01:00>", "assignedCoachId": "<coach>" }
```

**Scenario 1 — join a full group class waiting list (happy path)**

```
POST /api/v1/classes/<classId>/waiting-list
```
Expect `201` and body `{ id, classId, coacheeId, joinedAt }`. `GET /api/v1/classes/<classId>` now shows `coacheeStatus.isOnWaitingList = true` and `waitingListCount = 1`.

**Scenario 2 — join errors are specific**

| Attempt | Expect |
|---|---|
| Join again the same class | `409` `ALREADY_ON_WAITING_LIST` |
| Join a class at 4/4 already enrolled in | `409` `ALREADY_ENROLLED` |
| Join with a non-Coachee token | `403` `FORBIDDEN` |
| Join a nonexistent id | `404` `NOT_FOUND` |
| Join an out-of-reach level class | `409` `LEVEL_MISMATCH` |
| Join a class whose list already has 4 members (add 3 more coachees first) | `409` `WAITING_LIST_FULL` |
| Join a group class that still has a free spot (not full, e.g. 3/4) | `400` `VALIDATION_ERROR` |
| Join an individual class with an unoccupied slot | `400` `VALIDATION_ERROR` |
| Join a `CANCELED` class | `400` `VALIDATION_ERROR` |

**Scenario 3 — occupy an individual slot, then join its waiting list**

As a Coach/Admin create an **individual** class with one assigned Coachee (occupied slot). As a *different* Coachee:

```
POST /api/v1/classes/<individualClassId>/waiting-list
```
Expect `201`. This validates the individual-slot join path used later by the gray-block calendar interaction (US-3.4).

**Scenario 4 — leave a waiting list**

```
DELETE /api/v1/classes/<classId>/waiting-list
```
Expect `200` and `{ "message": "Removed from waiting list." }`. The entry is gone and `waitingListCount` drops by one.

| Attempt | Expect |
|---|---|
| Leave a list you're not on | `404` `NOT_FOUND` |
| Leave with a non-Coachee token | `403` `FORBIDDEN` |

**Scenario 5 — list active waiting lists**

Join ≥ 2 waiting lists (mix a full group class and an occupied individual slot), then:

```
GET /api/v1/waiting-lists
```
Expect `200` with `data` array: each entry has `class` details (type, startTime, level, assignedCoach), `joinedAt`, and `hasOpenSpots`; **no position field anywhere**. After the occupying Coachee cancels an individual slot, the list refetched shows `hasOpenSpots: true` for that entry.

**Scenario 6 — last-slot race (FR-013)** With a waiting list at 3/4, fire two `POST .../waiting-list` requests with **different** Coachee tokens concurrently. Expect exactly one `201` and one `409 WAITING_LIST_FULL`.

## Frontend validation (manual)

1. Log in as a Coachee and open **Home**.
2. A full group class card shows **Join waiting list** (not a static label).
3. Tap it → confirmation dialog → confirm → the card flips to **Leave waiting list** without a page reload, and the Home "waiting list" count increments.
4. Open **My waiting lists**: entries show class type, level, date/time, Coach, and the opened-spot badge when applicable — no position number is shown.
5. Tap **Leave** on an entry → confirmation → the entry disappears and the count decrements.
6. A full class card the Coachee is already on shows **Leave waiting list** directly.
7. Force an error (e.g., race a join to a full list) → the card shows the mapped toast (e.g., "The waiting list is full.") and stays unchanged.

## Automated checks

```
backend: npm run typecheck && npm run lint && npm test
frontend: npm run typecheck && npm run lint && npm test
```

Expected: `WaitingListPolicy.test.ts` at 100% branch coverage; Supertest coverage of every error code in Scenarios 2/4/5; the concurrent race test passes exactly-once semantics; frontend pure-util tests for the extended `classCardState` (waiting-list join / leave actions) and `waitingListErrorMessages`.