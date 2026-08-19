# Quickstart: Coachee Dashboard & Calendar (US-3.2)

**Phase 1 output** — runnable validation scenarios that prove the Home dashboard and the color-coded calendar work end-to-end. Contracts: [api.md](./contracts/api.md), [ui.md](./contracts/ui.md). Entities/state: [data-model.md](./data-model.md). Implementation details live in `tasks.md` / the implementation phase, not here.

## Prerequisites

- PostgreSQL running (`docker compose up`) and backend DB migrated/seeded: from `backend/` run `npm run db:generate && npm run db:migrate && npm run db:seed`
- A Coachee account exists with a level, plus at least one Coach (to create classes) and a second Coachee (to create other/busy entries)
- Backend dev server: `npm run dev` (port 3001)
- Frontend dev server: `npm run dev` (port 5173, proxies `/api` → 3001)

## Backend validation (curl)

Authenticate as a Coachee first; every request below sends `Authorization: Bearer <coachee JWT>`.

**Setup**: as a Coach/Admin, create:
- a **group** class the Coachee can join (in-reach level, free spots) within the next 10 days,
- a **group** class outside the Coachee's level reach (2+ levels away),
- an **individual** class assigned to a *different* Coachee (shows as gray/busy for our Coachee),
- an **individual** class assigned to our Coachee (shows as blue, and becomes `nextClass` if it is the soonest future).

**Scenario 1 — dashboard happy path**

```
GET /api/v1/coachee/dashboard
```

Expect `200` with:
- `nextClass`: the soonest future enrolled ACTIVE class (or `null` if none), with `status: "ACTIVE"`,
- `joinableClasses`: only `GROUP` classes, within the 10-day window, in-reach, open spot, not enrolled (each with `isWithinReach: true`, `hasOpenSpots: true`),
- `activeWaitingListCount`: matches the real count (seeded waiting-list rows on ACTIVE classes).

| Attempt | Expect |
|---|---|
| GET with a Coach/Admin token | `403` `FORBIDDEN` |
| GET with no token / expired token | `401` `UNAUTHORIZED` |
| Coachee with **no scheduled classes** | `200` with `nextClass: null` |
| Coachee with **no joinable classes** | `200` with `joinableClasses: []` |
| Coachee with **no waiting lists** | `200` with `activeWaitingListCount: 0` |

**Scenario 2 — calendar data already server-colored**

```
GET /api/v1/classes?start=<weekStart>&end=<weekEnd>
```

As the Coachee, expect each class to carry a `visibility` value matching its real state:
- own enrolled classes → `"blue"`,
- within-reach group with open spot, not joined → `"green"`,
- other Coachees' individual classes, out-of-reach group classes, and full group classes → `"gray"` (and `enrolledCoachees` empty for gray).

## Frontend validation (manual)

1. **Log in as a Coachee** → redirected to Home. The Home screen shows:
   - the **Next Class** card with the correct date/time (or "No upcoming classes" when none),
   - the **Joinable Classes** list (10-day window, Join buttons on in-reach open-spot group classes),
   - the **Active waiting lists** badge when count > 0 (absent when 0).
2. **States**: with a slow/throttled network confirm the loading indicators; with the backend stopped confirm the error state + retry works; with no data at all confirm both empty states.
3. **Pull-to-refresh (mobile)**: on a narrow viewport, pull down at the top of Home → spinner → refetch. Join a class from another tab, pull-to-refresh, and verify the joined class disappears from the joinable list.
4. **Calendar tab** → day strip + card list for the current week (prev/next navigation). Verify:
   - a **colored dot** under each day number that has any class that day (enrolled or not), colored by visibility,
   - tapping a day shows only that day's cards — **blue** (enrolled, **Cancel enrollment**) and **green** (joinable, **Enroll** button),
   - today is pre-selected, and a selected day with nothing on it shows "No classes on this day.",
   - gray/busy entries are **not** shown as cards (no names ever revealed),
   - canceled classes render as cards with a gray "Canceled" marker and no action,
   - empty week → empty state; backend stopped → error state + retry; pull-to-refresh updates after a class changes elsewhere.
5. **Non-Coachee access**: log in as a Coach/Admin and confirm `/coachee/*` routes are not reachable (they are gated by `ProtectedRoute`).

## Automated checks

```
backend: npm run typecheck && npm run lint && npm test
frontend: npm run typecheck && npm run lint && npm test
```

Expected: `CoacheeDashboardPolicy.test.ts` at 100% branch coverage; Supertest coverage of every Scenario 1/2 case; frontend `coacheeCalendarEvents.ts` (visibility→color matrix, canceled→gray, gray title masking) and `nextClassInfo.ts` helpers unit-tested.