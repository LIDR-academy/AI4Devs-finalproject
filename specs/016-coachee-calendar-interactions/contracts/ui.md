# UI Contracts: Coachee Calendar Interactions

**Phase 1 output** — the Coachee-facing calendar surfaces for join/cancel/waitlist. The calendar keeps the existing **day-strip + card list** layout (the schedule-x time-grid migration is out of scope). Every action happens from the calendar alone — no navigation to Home required (spec FR-017).

## 1. Card rendering (pure predicate — `coacheeWeekView.ts`, extended)

Every class returned in the week window renders as a card — except busy (gray) classes that are not relevant or related to the Coachee. `isCalendarClass` filters to blue/green plus gray busy only when the class is a group within ±1 level of the Coachee's level (waitlist-eligible, e.g. a full group). Occupied individual slots and out-of-reach group classes are dropped client-side and never render as busy blocks.

| Card inputs (server-provided) | Card presentation | Interaction on tap |
|---|---|---|
| `visibility === "blue"` | blue dot, own-class title, Coach, time | detail modal → **Cancel** (confirm) |
| `visibility === "green"` | green dot, title, Coach, time, `spotsAvailable` | detail modal → **Join** (confirm) |
| `visibility === "gray"` (group within reach only) | gray dot, "Busy" title, Coach-neutral, time, **no private details** | detail modal → **Join/Leave waiting list** (eligible by construction) |
| `status === "CANCELED"` | gray tone, "Busy/Canceled" tag, no action | info modal (canceled) or none |

Waitlist eligibility is decided from the detail `coacheeStatus` (D1): a gray slot offers waitlist-join when `isWithinReach` AND group full; already on the list → waitlist-leave; otherwise info-only.

## 2. `ClassInteractionModal` (new component)

Opened by tapping any card. Two-step flow (**detail → action → confirmation dialog before any mutation**, spec FR-010):

- **Details step**: class type, time (gym timezone), level (group), Coach; green entries also show `spotsAvailable`.
- **Action step**: the primary action derived by `deriveCalendarInteraction`:
  - blue → **Cancel**
  - green → **Join**
  - gray eligible → **Join waiting list** (or **Leave waiting list** when already on it, spec FR-008)
- **Confirmation step**: explicit confirm dialog with per-action copy (mirrors the established Home `dialogCopy`), shown before the mutation fires. Dismiss/cancel → no change (spec FR-011).
- Success → toast ("You joined the class.", "You left the class.", "You joined the waiting list.", "You left the waiting list.").
- Failure → rollback + mapped error toast via `enrollmentErrorMessage` (join/cancel) or `waitingListErrorMessage` (waitlist join/leave) — no `error.ref`, no stack traces (spec FR-013/FR-018).

The modal is locked while a mutation is pending to prevent duplicate/conflicting actions (spec FR-014).

## 3. Optimistic calendar updates (all four mutation hooks)

| Action | Optimistic card change (before server responds) | On server failure |
|---|---|---|
| join | green → blue; `isEnrolled=true`; `enrollmentCount+1` | rollback to exact pre-action snapshot + error toast |
| cancel | blue → green (if still joinable) or gray; `isEnrolled=false`; `enrollmentCount-1` | rollback + error toast |
| waitlist join | gray stays gray; `isOnWaitingList=true`; `waitingListCount+1` | rollback + error toast |
| waitlist leave | gray stays gray; `isOnWaitingList=false`; `waitingListCount-1` | rollback + error toast |

After success, the existing invalidations refetch server truth (`["classes"]`, `["waiting-lists"]`, `["coachee","dashboard"]`), so Home and the calendar converge (spec FR-015).

## 4. Error-to-message mapping (reused)

| `error.code` | Surface |
|---|---|
| `CLASS_FULL` / `OVERLAP_DETECTED` / `ALREADY_ENROLLED` | `enrollmentErrorMessage` |
| `WAITING_LIST_FULL` / `ALREADY_ON_WAITING_LIST` / `LEVEL_MISMATCH` | `waitingListErrorMessage` |
| `FORBIDDEN` / `NOT_FOUND` / `VALIDATION_ERROR` | the respective map's message |
| unknown / network / expired session | map fallback → session handled by `AuthContext` re-login |

## 5. Out of scope

- No backend or API changes; no schedule-x time-grid migration; no changes to Home cards beyond the shared hooks gaining optimistic rollback (behavioral improvement, not a layout change).