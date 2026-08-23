# Quickstart: Coachee Calendar Interactions (US-3.4)

**Phase 1 output** — runnable validation scenarios that prove the calendar join/cancel/waitlist interactions work end-to-end. Contracts: [api.md](./contracts/api.md), [ui.md](./contracts/ui.md). Entities/state: [data-model.md](./data-model.md). Implementation details live in `tasks.md` / the implementation phase, not here.

## Prerequisites

- PostgreSQL running (`docker compose up`) and backend DB migrated/seeded: from `backend/` run `npm run db:generate && npm run db:migrate && npm run db:seed`
- Coachee(s), Coach(es), and 5 levels seeded; enough classes to produce blue, green, gray, and canceled cards in one week
- Backend dev server: `npm run dev` (port 3001)
- Frontend dev server: `npm run dev` (port 5173, proxies `/api` → 3001)

> Backend is complete and tested (US-3.3/3.1 endpoints). These scenarios validate the **frontend calendar UX** on top of it.

## Frontend validation (manual — log in as a Coachee, open **Calendar**)

**Scenario 1 — relevant blue/green/gray cards render; irrelevant classes are hidden**

1. Ensure the week has: an own class (blue), a joinable group class (green), a full group class within the Coachee's reach (gray), and a canceled class.
2. Also ensure the week has classes **not** relevant to the Coachee — another Coachee's individual class and an out-of-reach group class.
3. Open Calendar. Expect: blue/green/gray dots on the day strip; blue, green, and reachable-full-group cards render; gray cards titled **Busy** with no other Coachee's name or private detail; **no busy block** appears for the other Coachee's individual class or the out-of-reach group class; canceled cards informational with a Canceled tag and no action.

**Scenario 2 — cancel an own class (blue) behind a confirmation**

1. Tap a blue card → detail modal shows type, time, level, Coach.
2. Choose **Cancel** → a confirmation dialog appears; tap **dismiss** → nothing changes.
3. Tap the card again → **Cancel** → **confirm** → the card flips off blue immediately (optimistic), then a "You left the class." toast; after refresh the card is green (if still joinable) or gray.

**Scenario 3 — join a class (green) behind a confirmation**

1. Tap a green card → modal shows level, Coach, and spots available.
2. Confirm **Join** → the card flips to blue immediately; "You joined the class." toast.
3. Force an error (race a join to a just-filled class) → the card reverts to green and an error toast (e.g., "Class is full.") shows; no half-updated state.

**Scenario 4 — join a full group class's waiting list (gray, eligible)**

1. Tap a gray card for a **full group class within reach** → modal shows class time, type, level, Coach; a **Join waiting list** action; confirm → card shows on-waiting-list state immediately; "You joined the waiting list." toast.
2. Tap the same card again → it offers **Leave waiting list** (not join); confirm → on-waiting-list state clears; "You left the waiting list." toast.

**Scenario 5 — irrelevant classes show no busy block**

1. Confirm that another Coachee's **individual** class and an **out-of-reach group** class never render as busy cards — they are filtered out of the calendar entirely (spec FR-002).

**Scenario 6 — canceled class is informational**

1. Tap a canceled card → info only, no action buttons.

**Scenario 7 — rollback on network failure**

1. Stop the backend (or lose network), then confirm a Join/Cancel/Waitlist action → the calendar reverts to its pre-action cards and an error toast appears; restart the backend and Refresh to confirm server state is unchanged.

**Scenario 8 — session expiry**

1. Expire the session, then attempt an action → the action is refused, the calendar stays in its last known-good state(visible), and the app routes to sign-in (existing AuthContext behavior).

**Scenario 9 — rapid taps**

1. Double-tap a green card's Join confirm rapidly → exactly one enrollment is created (button disabled while pending); no duplicate.

## Automated checks

```
frontend: npm run typecheck && npm run lint && npm test
backend:  npm run typecheck && npm run lint && npm test   # unchanged, must stay green
```

Expected: `calendarInteraction.test.ts` at 100% branch coverage (action derivation + all optimistic transitions); `optimisticClassMutation.test.ts` proves snapshot + rollback over seeded `["classes"]` caches; `ClassInteractionModal.test.tsx` (jsdom) covers green-join confirm, blue-cancel confirm, eligible-gray waitlist join/leave with details, and error rollback; extended `coacheeWeekView.test.ts` includes gray-relevant (within-reach full group) vs. not-relevant (individual/out-of-reach) busy predicates; existing frontend test files and the full backend suite still pass.

## Confirm no regression (Home)

Because `useJoinClass`/`useCancelEnrollment`/`useJoinWaitingList`/`useLeaveWaitingList` are shared with Home, after enabling optimistic rollback re-check Home: join/cancel/waitlist still show success toasts, still invalidate the same queries, and errors still map to the same messages (the `useJoinWaitingList.test.ts` hook test and Home manual scenarios stay green).