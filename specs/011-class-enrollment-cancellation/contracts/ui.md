# UI Contracts: Coachee Class Card (Enrollment & Cancellation)

**Phase 1 output** — the Coachee-facing surface that hosts the Join/Cancel actions. It consumes the class data from the existing `GET /classes` / `GET /classes/:id` endpoints (server-computed `visibility` + `coacheeStatus`). No client-side copy of the business rules.

## 1. Card action derivation (pure, unit-tested)

Inputs: `classType`, `status`, `enrollmentCount`, `capacity`, `visibility?`, `coacheeStatus?`.

| Condition (server-provided) | Card action |
|---|---|
| `status === "CANCELED"` | no action (gray, "Canceled" tag) |
| `classType === "INDIVIDUAL"` | no join action (assignment-only) |
| `visibility === "blue"` or `coacheeStatus?.isEnrolled` | `Cancel` |
| `coacheeStatus?.isOnWaitingList` | waiting-list state (leave is US-3.2; not this feature) |
| group, `enrollmentCount >= capacity` (full) | `Waiting list` — replaces `Join` (FR-016) |
| group, within reach (green), has spot, not enrolled | `Join` |
| group, out of reach (gray with reason) | informative "out of reach" state, no action |

## 2. Component structure

- **`CoacheeClassCard`** — renders one class: type label, level name (group), start time (gym timezone `Europe/Madrid`), Coach name, enrollment count vs capacity, and the action area.
- **`EnrollmentActions`** — the action area: `Join` / `Cancel` / `Waiting list` label. "Join" and "Cancel" open a confirmation dialog.
- **`CoacheeClassList`** — fetches `useListClasses` over the visible window and renders the cards in chronological order; empty state when none.

## 3. Flows

- **Join**: tap `Join` → confirmation dialog → `POST /classes/:id/enrollment` → on `201` update the query cache so the card flips to `Cancel` (no full reload); on error show the mapped toast and keep the card unchanged.
- **Cancel**: tap `Cancel` → confirmation dialog → `DELETE /classes/:id/enrollment` → on `200` update the cache so the card flips to `Join` (or `Waiting list` if the class is now full); on error show the mapped toast.
- **Waiting list** option: informational affordance only in this release — the join-waiting-list flow is US-3.2.

## 4. Error-to-message mapping (FR-018)

| `error.code` | Coachee-facing message |
|---|---|
| `CLASS_FULL` | "Class is full." / "Clase completa." |
| `LEVEL_MISMATCH` | "Level mismatch — this class requires a different level." |
| `OVERLAP_DETECTED` | "You already have a class at this time." |
| `ALREADY_ENROLLED` | "You are already enrolled in this class." |
| `NOT_FOUND` | "The class or enrollment was not found." |
| `FORBIDDEN` | "You don't have permission to do that." |
| `VALIDATION_ERROR` | Generic validation message for the action. |
| unknown / network | Generic "Something went wrong, please try again." |

Messages render as dismissal toasts; never surface `error.ref`. Implementation language is a product decision for the tasks phase (codebase text is Spanish-leaning; exact copy chosen during implementation).