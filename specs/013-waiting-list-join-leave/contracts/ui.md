# UI Contracts: Coachee Waiting List (Join/Leave/View)

**Phase 1 output** — the Coachee-facing surfaces that exercise waiting-list join/leave/list. The join/leave actions consume class data from the existing `GET /classes` endpoints (server-computed `coacheeStatus.isOnWaitingList`, `visibility`, `enrollmentCount`, `capacity`); the list view consumes `GET /waiting-lists`. No client-side copy of the business rules.

## 1. Card action derivation (pure, unit-tested — `classCardState.ts` extended)

Inputs: `classType`, `status`, `enrollmentCount`, `capacity`, `visibility?`, `coacheeStatus?`.

| Condition (server-provided) | Card action |
|---|---|
| `status === "CANCELED"` | no action (gray, "Canceled" tag) |
| `classType === "INDIVIDUAL"` | no join action (assignment-only) |
| `visibility === "blue"` / `coacheeStatus?.isEnrolled` | `Cancel` (011 — unchanged) |
| `coacheeStatus?.isOnWaitingList` | **`Leave waiting list`** (this feature) |
| group, `enrollmentCount >= capacity` (full), in reach, not enrolled, not on list | **`Join waiting list`** (functional — this feature; was a static label in 011) |
| group, within reach, has spot, not enrolled | `Join` (011 — unchanged) |
| group, full or not, out of reach | informative "out of reach" state, no action |
| group, full but already on list | `Leave waiting list` (via `isOnWaitingList` rule above) |

## 2. Components

- **`CoacheeClassCard`** (extended) — the action area now includes:
  - `Join waiting list` → opens a confirmation dialog → `POST /classes/:id/waiting-list` → on `201` invalidate `["classes"]`/`["waiting-lists"]`/`["coachee","dashboard"]` so the card flips to `Leave waiting list`; on error a mapped toast.
  - `Leave waiting list` → opens a confirmation dialog → `DELETE /classes/:id/waiting-list` → on `200` invalidate the same keys so the card flips back to `Join waiting list` (if still full) or `Join` (if a spot opened); on error a mapped toast.
  - Both actions keep the no-full-page-reload behavior from 011 (query-cache invalidation via React Query).
- **`MyWaitingLists`** (new list view) — fetches `useMyWaitingLists()` and renders each entry:
  - class type label, level name + color (group), start time (gym timezone `Europe/Madrid`), Coach name
  - `hasOpenSpots` → "Spot recently opened" info badge (informational only)
  - a `Leave` button → confirmation → `DELETE /classes/:id/waiting-list` → refresh the list
  - empty state ("You are not on any waiting list") and loading/error states
  - **No position number is ever rendered**.
- **`CoacheeHomePage`** (wired) — hosts the `MyWaitingLists` view (linked from the `WaitingListBadge` count, per US-3.2's badge, or rendered inline when nonzero).

## 3. Error-to-message mapping (`waitingListErrorMessages.ts`, pure)

| `error.code` | Coachee-facing message |
|---|---|
| `WAITING_LIST_FULL` | "The waiting list is full." / "La lista de espera está llena." |
| `ALREADY_ON_WAITING_LIST` | "You are already on the waiting list for this class." |
| `ALREADY_ENROLLED` | "You are already enrolled in this class." |
| `LEVEL_MISMATCH` | "Level mismatch — this class requires a different level." |
| `NOT_FOUND` | "The class or waiting list was not found." |
| `FORBIDDEN` | "You don't have permission to do that." |
| `VALIDATION_ERROR` | "This class is not available for a waiting list right now." |
| unknown / network | "Something went wrong, please try again." |

Messages render as dismissal toasts; never surface `error.ref`. Implementation language is a product decision for the tasks phase (codebase text is Spanish-leaning; exact copy chosen during implementation).

## 4. Out of scope (deferred to US-3.4)

Tapping a gray occupied individual block on the calendar to join its waiting list is covered by the coachee calendar-interaction storyline; the backend contract and tests fully support individual-slot joins so that surface can wire up later.