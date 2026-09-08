# Quickstart: Class Enrollment & Cancellation (US-3.1)

**Phase 1 output** — runnable validation scenarios that prove coachee self-join and self-cancel work end-to-end. Contracts: [api.md](./contracts/api.md), [ui.md](./contracts/ui.md). Entities/state: [data-model.md](./data-model.md). Implementation details live in `tasks.md` / the implementation phase, not here.

## Prerequisites

- PostgreSQL running (`docker compose up`) and backend DB migrated/seeded: from `backend/` run `npm run db:generate && npm run db:migrate && npm run db:seed`
- A Coachee account exists with a level, and at least one Coach (used to create classes)
- Backend dev server: `npm run dev` (port 3001)
- Frontend dev server: `npm run dev` (port 5173, proxies `/api` → 3001)

## Backend validation (curl)

Authenticate as a Coachee first; every request below sends `Authorization: Bearer <coachee JWT>`.

Create a **group** class as a Coach/Admin (free spot, in-reach level, no conflicts, valid `startDateTime`):

```
POST /api/v1/classes
{ "classType": "GROUP", "coacheeIds": ["<coacheeA>","<coacheeB>","<coacheeC>"], "levelId": "<level>", "startDateTime": "<ISO +01:00>", "assignedCoachId": "<coach>" }
```

**Scenario 1 — join a group class (happy path)**

```
POST /api/v1/classes/<classId>/enrollment
```
Expect `201` and body `{ id, classId, coacheeId, joinedAt }`. In the class list, the class now shows `enrollmentCount` +1 and `coacheeStatus.isEnrolled = true`.

**Scenario 2 — errors are specific**

| Attempt | Expect |
|---|---|
| Join an `INDIVIDUAL` class | `400` `VALIDATION_ERROR` |
| Join a `CANCELED` class | `400` `VALIDATION_ERROR` |
| Join the same class again | `409` `ALREADY_ENROLLED` |
| Join with a non-Coachee token | `403` `FORBIDDEN` |
| Join a nonexistent id | `404` `NOT_FOUND` |
| Join a full class (4/4, enroll a 5th coachee via groups of 3-4 seeds) | `409` `CLASS_FULL` |
| Join an out-of-reach level class (2+ levels away) | `409` `LEVEL_MISMATCH` |
| Join at a time the coachee already has another class | `409` `OVERLAP_DETECTED` |

**Scenario 3 — cancel own attendance**

```
DELETE /api/v1/classes/<classId>/enrollment
```
Expect `200` and `{ "message": "Enrollment canceled.", "waitingListProcessed": false, "claimedByCoachee": null }`. The enrollment row is gone and `enrollmentCount` drops by one.

| Attempt | Expect |
|---|---|
| Cancel a class you're not enrolled in | `404` `NOT_FOUND` |
| Cancel a `CANCELED` class | `400` `VALIDATION_ERROR` |
| Cancel with a non-Coachee token | `403` `FORBIDDEN` |

**Scenario 4 — last-spot race (FR-019)** With a group class at 3/4, fire two `POST .../enrollment` requests with **different** Coachee tokens concurrently. Expect exactly one `201` and one `409 CLASS_FULL`.

## Frontend validation (manual)

1. Log in as a Coachee and open **Home**.
2. The "Joinable Classes" area lists group classes with free spots → each shows a **Join** button.
3. Tap Join on a class with a free spot → confirmation dialog → confirm → the card flips to **Cancel** without a page reload.
4. For a class the Coachee is enrolled in, the card shows **Cancel**; cancel via the confirmation dialog → the card flips back to Join (or *Waiting list* if the class became full).
5. A full group class card shows the **Waiting list** option instead of Join (join flow itself is US-3.2).
6. Force an error (e.g., join a class raced to full) → the card shows the mapped toast (e.g., "Class is full.") and stays unchanged.

## Automated checks

```
backend: npm run typecheck && npm run lint && npm test
frontend: npm run typecheck && npm run lint && npm test
```

Expected: `EnrollmentPolicy.test.ts` at 100% branch coverage; Supertest coverage of every error code in Scenario 2/3; the concurrent race test passes exactly-once semantics.