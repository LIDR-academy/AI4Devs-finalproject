# Research: Waiting List Join/Leave

**Phase 0 output** for `specs/013-waiting-list-join-leave/`. No `NEEDS CLARIFICATION` markers remain in the spec; the decisions below are design choices grounded in the existing codebase, the documented API contract, and the PRD.

## 1. Current state vs. spec (gap analysis)

| Spec requirement | Current state | Gap |
|---|---|---|
| `POST /classes/:id/waiting-list` (Coachee joins a waiting list) | No route exists; `docs/api-specifications.md` §Waiting Lists documents it; `ErrorCodes` already includes `WAITING_LIST_FULL`, `ALREADY_ON_WAITING_LIST` | ⚠️ implement the route + use case + domain policy |
| `DELETE /classes/:id/waiting-list` (Coachee leaves at any time) | No route exists | ⚠️ implement the route + use case |
| `GET /waiting-lists` (active lists, class details, no position) | No route exists; `GetCoacheeDashboard` already counts active waiting lists (`CoacheeDashboardPolicy.countActiveWaitingLists`) but returns no detail list | ⚠️ implement the route + use case + DTO |
| Join validates list-full / not-full / occupied / level-reach / enrolled / already-on-list | `EnrollmentPolicy` covers *enrollment* rules; `ReachCalculator.isWithinReach`, `CapacityValidator` (`GROUP_MAX_COACHEES`) exist as pure services | ✅ building blocks exist; waiting-list-specific rules must live in a new `WaitingListPolicy` |
| Max 4 per waiting list | `WaitingList` model: `@@unique([class_id, coachee_id])` (dedupe backstop), no count column | ✅ max enforced in policy over `waitingLists.length` + serializable tx (like FR-019 for enrollments) |
| Coachee identity from JWT, no body ID | `authenticate` middleware populates `req.user` | ✅ just don't read a body field |
| Error codes `WAITING_LIST_FULL` / `ALREADY_ON_WAITING_LIST` / `ALREADY_ENROLLED` / `LEVEL_MISMATCH` | `ConflictError(code)` already supports custom codes; all four codes pre-defined in `error-codes.ts` | ✅ trivial mapping |
| Frontend join/leave/list actions | `CoacheeClassCard` renders a static "Waiting list" label for full classes; `classCardState.ts` returns `waiting-list` action there; no list view; HomePage shows only a count badge (`WaitingListBadge`) | ⚠️ make the card action functional, add leave state, and build the list view |

## 2. Key design decisions

### D1 — `WaitingListPolicy` pure domain service (Constitution §I/II)
- **Decision**: new `src/domain/services/WaitingListPolicy.ts` exposing pure functions:
  - `assertJoinEligible({ classId-ish deps: classType, status, enrollmentCount, capacity, waitingListCount, isAlreadyEnrolled, isAlreadyOnWaitingList, coacheeLevelSortOrder, classLevelSortOrder })` → `WAITING_LIST_FULL`, `GROUP_NOT_FULL`, `SLOT_NOT_OCCUPIED`, `ALREADY_ENROLLED`, `ALREADY_ON_WAITING_LIST`, `LEVEL_MISMATCH`, `CANCELED_CLASS`, or `OK`.
  - `ownsEntry(actorId, entryCoacheeId)` — a Coachee may only remove their own waiting-list entry.
  - `hasOpenSpots(classType, enrollmentCount, capacity)` → open-spot flag for the list view (informational).
  - `notificationTypeForJoin()` → `9`; `notificationTypeForLeave()` → `10`.
- **Rationale**: the constitution mandates business rules in `src/domain/` with zero infrastructure imports and 100% branch coverage; `EnrollmentPolicy` (from 011) sets the precedent and this policy is its waiting-list counterpart.
- **Alternatives considered**: inline checks in the use case (rejected — violates §I and makes 100% branch coverage awkward); extending `EnrollmentPolicy` (rejected — separate concern, keeps names/stories explicit).

### D2 — Concurrency on the last waiting-list slot (FR-013)
- **Decision**: the join use case runs in a `prisma.$transaction(async (tx) => { ... }, { isolationLevel: "Serializable" })`: inside the tx it re-reads the class with its enrollments and waiting lists, runs `WaitingListPolicy.assertJoinEligible`, and only then creates the `WaitingList` row. Serializability guarantees that when two Coachees race for the 4th slot, one tx commits and the other's list-full check fails with `WAITING_LIST_FULL`. Write-conflicts (`P2034`) are caught and mapped to `WAITING_LIST_FULL`/retry-hint, mirroring `JoinTrainingClass`.
- **Rationale**: `@@unique([class_id, coachee_id])` prevents duplicate entries but cannot stop over-capacity; the constitution bans raw SQL (`SELECT ... FOR UPDATE`), so Prisma's transaction isolation is the only compliant way to make the count race-safe.
- **Alternatives considered**: raw `FOR UPDATE` (rejected — violates "no raw SQL"); READ COMMITTED reads (rejected — two concurrent reads of 3/4 both pass and overfill); a distributed lock (rejected — overkill for one gym).

### D3 — Eligibility conditions per class type
- **Decision**:
  - **Group**: joined only when the class is ACTIVE **and full** (`enrollmentCount >= GROUP_MAX_COACHEES`, i.e., 4/4). A group class that still has spots refuses the join with `VALIDATION_ERROR` (the Coachee should enroll normally) — this bounds the waiting list to genuinely full classes, matching PRD §5.
  - **Individual**: joined only when the class is ACTIVE **and occupied** (`enrollmentCount >= 1`). An unoccupied individual slot refuses with `VALIDATION_ERROR` — matches the gray-block contract (waiting list is for an occupied time slot).
  - **Both**: level reach (reuse `isWithinReach`), not already enrolled (`ALREADY_ENROLLED`), not already on the list (`ALREADY_ON_WAITING_LIST`), and list not full (`WAITING_LIST_FULL`).
  - Canceled classes refuse with `VALIDATION_ERROR` in all cases.
- **Rationale**: PRD §5 defines these exact conditions; the API contract documents `400 VALIDATION_ERROR` for canceled classes, and the inapplicable-state refusals (`GROUP_NOT_FULL`, `SLOT_NOT_OCCUPIED`) are surfaced as user-friendly `400 VALIDATION_ERROR` responses consistent with the enrollment story's treatment of individual self-join.
- **Alternatives considered**: allowing waiting-list joins on partially-full group classes (rejected — a spot is available, joining it is enrollment, not waiting); allowing joins on empty individual slots (rejected — nothing to wait for).

### D4 — Simultaneous-notification model: no positions, `hasOpenSpots` flag
- **Decision**: `GET /waiting-lists` returns each entry with class details and an informational `hasOpenSpots = hasOpenSpots(classType, enrollmentCount, capacity)`; it NEVER returns a position. The position is omitted because PRD §6.4 defines simultaneous notification with no priority, and the API contract explicitly excludes it.
- **Rationale**: matches `docs/api-specifications.md` §GET `/waiting-lists` exactly; the flag gives the Coachee a genuine "act now" signal while auto-claim remains EP-04.
- **Alternatives considered**: returning `position` (rejected — actively contradicts the simultaneous-notification model and the API contract); omitting `hasOpenSpots` (rejected — the contract documents it and it drives the UI indicator).

### D5 — Frontend card-state and error mapping (no client-side rule logic)
- **Decision**: extend the pure `classCardState.ts`:
  - `isOnWaitingList` → card shows a **"Leave waiting list"** action (leave flow of this feature), not the inert "Waiting list" label.
  - full group, within reach, not enrolled, not on list → **"Join waiting list"** (functional action → `POST /classes/:id/waiting-list`).
  - A second pure util `waitingListErrorMessages.ts` maps `error.code` → Coachee-friendly text (`WAITING_LIST_FULL`, `ALREADY_ON_WAITING_LIST`, `ALREADY_ENROLLED`, `LEVEL_MISMATCH`, `NOT_FOUND`, `FORBIDDEN`, `VALIDATION_ERROR`, fallback).
- **Rationale**: derive the action from server-provided `coacheeStatus`/`visibility` fields and keep rules testable as pure functions; a fixed code→message map yields deterministic, testable UX (mirrors `enrollmentErrorMessages`).
- **Alternatives considered**: re-deriving reach/capacity client-side (rejected — duplicates backend rules and drifts); echoing `error.message` verbatim (rejected — inconsistent with the mapped approach used for enrollment).

### D6 — Frontend scope boundary note
- **Decision**: this feature implements the waiting-list *capability and its reachable UI*: functional join/leave actions on the existing `CoacheeClassCard`, and a "My waiting lists" list view with details + Leave + `hasOpenSpots` indicator, wired from the Coachee Home page. The gray-block calendar interaction (tapping an occupied individual slot to join its waiting list) belongs to the coachee calendar-interaction storyline (US-3.4) and is OUT OF SCOPE here — the backend contract and tests fully cover individual-slot joins so US-3.4 can consume them later.
- **Rationale**: the spec assumption explicitly defers the gray-block/tap surface to US-3.4 while keeping join/leave/list capability in this feature; building the capability now with the calendar wire-up later avoids scope creep and keeps the backend contract complete.
- **Alternatives considered**: building the gray-block tap interaction in this feature (rejected — duplicates the US-3.4 story and expands frontend scope).

### D7 — Notification rows (record-only)
- **Decision**: on successful join the use case creates one `Notification` row for the Coachee (`notification_type = 9`); on successful leave, one row (`notification_type = 10`). FCM dispatch remains EP-04 / the notifications epic — rows are recorded now as an event log, matching the API contract note ("Notification #9/#10") and the 011 cancellation precedent.
- **Rationale**: the documented API contract lists these notifications; recording the row server-side keeps the notification feed consistent and lets the notifications service dispatch later without losing the event.
- **Alternatives considered**: no notification row (rejected — the contract documents it and the 011 pattern records rows now); dispatching FCM in this feature (rejected — explicitly EP-04).

## 3. Test & validation strategy

- **Red-Green** (Constitution §II): write `WaitingListPolicy.test.ts` first with every branch (group full→ok, group not full, individual occupied→ok, individual unoccupied, list full 4/4, already enrolled, already on list, level ok/out/no-level, canceled class, ownership yes/no, hasOpenSpots true/false for group+individual); confirm failing → implement → green. Target 100% branch coverage on the policy.
- `JoinWaitingList.test.ts` / `LeaveWaitingList.test.ts` / `ListWaitingLists.test.ts`: happy path + each error path (mock `PrismaClient`).
- `waiting-list.int.test.ts` (Supertest): one happy-path and one validation-error test for **each** documented error code of all three endpoints, plus a two-actor race test asserting exactly one `WAITING_LIST_FULL` (FR-013) under serializable isolation.
- Frontend: pure `classCardState.ts` (isOnWaitingList → leave action; full group in-reach → join-waiting-list action) and `waitingListErrorMessages.ts` unit tests; manual scenarios via `quickstart.md`.

## 4. Risks / mitigations

- **Last-slot race under serializable tx**: Prisma `Serializable` may retry/abort under contention — the use case catches `P2034` and maps it to `WAITING_LIST_FULL`, so a Coachee never silently fails. (Risk: perf at scale; single-gym volumes are trivial.)
- **Eligibility duplication between enrollment and waiting list**: `EnrollmentPolicy` handles enrollment, `WaitingListPolicy` handles waiting lists; each is tested independently and intentionally mirrors reach/capacity via shared `ReachCalculator`/`CapacityValidator` constants — no drift risk beyond shared primitives which are already covered by their own tests.
- **Frontend card-state regression**: changing `classCardState` semantics (`waiting` state → actionable leave) must not regress the 011 enroll/cancel states — covered by the existing + extended pure-function tests and the manual quickstart scenarios.
- **Timezone correctness**: not relevant to these endpoints (they operate on class ids/instants already stored as UTC); no new time math introduced.
- **No browser→Google API**: join/leave/list never touch Google Calendar; no regression risk added.