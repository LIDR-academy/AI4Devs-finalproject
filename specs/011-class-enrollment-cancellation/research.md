# Research: Class Enrollment & Cancellation

**Phase 0 output** for `specs/011-class-enrollment-cancellation/`. No `NEEDS CLARIFICATION` markers remain in the spec; the decisions below are design choices grounded in the existing codebase and the documented API contract.

## 1. Current state vs. spec (gap analysis)

| Spec requirement | Current state | Gap |
|---|---|---|
| `POST /classes/:id/enrollment` (Coachee joins group class) | `classes.ts:303` returns `501 NOT_IMPLEMENTED` | ⚠️ implement the handler + use case |
| `DELETE /classes/:id/enrollment` (Coachee cancels own attendance) | `classes.ts:318` returns `501 NOT_IMPLEMENTED` | ⚠️ implement the handler + use case |
| Join validates capacity / level reach / overlap / already-enrolled | `CreateTrainingClass` validates these for class creation; `ReachCalculator`, `OverlapChecker`, `CapacityValidator`, `ClassVisibility` exist as pure services | ✅ building blocks exist; must be reused from a new `EnrollmentPolicy` service |
| Coachee identity from JWT, no body ID | `authenticate` middleware populates `req.user` | ✅ just don't read a body field |
| Error codes CLASS_FULL / LEVEL_MISMATCH / OVERLAP_DETECTED / ALREADY_ENROLLED | `ConflictError(code)` already supports custom codes; `LEVEL_MISMATCH` and `OVERLAP_DETECTED` codes already used in `CreateTrainingClass` | ✅ trivial mapping |
| Frontend Join / Cancel / waiting-list-option actions on class cards | `CoacheeHomePage` is a static placeholder ("No available classes to join"); no card component exists | ⚠️ the spec assumed a card surface exists — it does not. A minimal `CoacheeClassList`/`CoacheeClassCard` is required to host the actions (full Coachee calendar is a separate storyline) |
| Confirmation dialogs + per-code user-friendly toasts | No existing dialog/toast pattern; `useCancelClass`/`CreateClassModal` show inline errors | ⚠️ build lightweight confirmation dialogs and an error-to-message map keyed on `error.code` |

## 2. Key design decisions

### D1 — `EnrollmentPolicy` pure domain service (Constitution §I/II)
- **Decision**: new `src/domain/services/EnrollmentPolicy.ts` exposing pure functions:
  - `assertGroupJoinEligible({ classType, status, level?, coacheeLevel?, enrollmentCount })` → returns one of the join-validation outcomes: `CLASS_FULL`, `LEVEL_MISMATCH`, `OVERLAP_DETECTED`, `ALREADY_ENROLLED`, `INDIVIDUAL_CLASS`, `CANCELED_CLASS`, or `OK`.
  - `ownership` — whether a coachee may cancel an enrollment (actor id == enrollment coachee id).
  - `openedSpotDetected(hasWaitingList)` → waiting-list opened-spot flag.
  - `coachNotificationTypeForCancellation(classType, hasWaitingList)` → `3` (individual), `4` (group + WL), `5` (group, no WL).
- **Rationale**: the constitution mandates business rules in `src/domain/` with zero infrastructure imports and 100% branch coverage; the existing `ClassCancellationPolicy` sets the precedent.
- **Alternatives considered**: inline checks in the use case (rejected — violates §I and makes 100% branch coverage awkward); extending `CreateTrainingClass` (rejected — that validates *creation*, this validates *a single Coachee joining an existing class*).

### D2 — Concurrency on the last free spot (FR-019)
- **Decision**: the join use case runs in a `prisma.$transaction(async (tx) => { ... }, { isolationLevel: "Serializable" })`: inside the tx it re-reads the class with its enrollment count, runs `EnrollmentPolicy.assertGroupJoinEligible`, and only then creates the `ClassEnrollment`. Serializability guarantees that when two Coachees race for the last spot, one tx commits the enrollment and the other's capacity check fails with `CLASS_FULL`.
- **Rationale**: `@@unique([class_id, coachee_id])` already prevents duplicates (ALREADY_ENROLLED at the DB level as a backstop), but it cannot stop over-capacity. The constitution bans raw SQL (no `SELECT ... FOR UPDATE`), so Prisma's transaction isolation level is the only constitution-compliant way to make the capacity check race-safe.
- **Alternatives considered**: `FOR UPDATE` lock via raw query (rejected — violates "no raw SQL"); relying on READ COMMITTED (rejected — two concurrent reads of 3/4 both pass and overfill the class); a distributed lock (rejected — overkill for a single gym).

### D3 — Cancellation side effects (waiting list + Coach notification)
- **Decision**: on a successful cancel the use case (in the same transaction): deletes the `ClassEnrollment`; computes `openedSpotDetected = waitingListCount > 0`; creates one `Notification` row for the assigned Coach (`notification_type` = 3/4/5 per `EnrollmentPolicy`); returns `{ message, waitingListProcessed, claimedByCoachee: null }`. Auto-promotion of waitlisted Coachees and FCM dispatch are EP-04, so `claimedByCoachee` is always `null` in this release.
- **Rationale**: matches `docs/api-specifications.md` §`DELETE /classes/:id/enrollment` response shape and mirrors the `CancelTrainingClass` precedent (rows created now, dispatching later). The freed spot is genuinely usable immediately by any other eligible Coachee.
- **Alternatives considered**: returning `claimedByCoachee` instantly by promoting the first waitlisted Coachee (rejected — automatic processing is explicitly EP-04, and PRD defines simultaneous notification + first-responder claiming); skipping the Coach notification row (rejected — inconsistent with the 008 cancellation pattern and the documented side effects).

### D4 — Overlap sourcing
- **Decision**: overlap is checked against the Coachee's **other enrolled ACTIVE classes only** (query: active classes overlapping the target 60-minute window whose enrollments include the coachee, excluding the target class), reusing `hasOverlap`. Gym-wide blocks are not an eligibility input because only already-scheduled classes are joinable.
- **Rationale**: the target class is active and already created under gym capacity rules; the only thing a new enrollment can conflict with is another class the same Coachee already occupies.
- **Alternatives considered**: importing the coachee into the gym-capacity/`canAddToGymSlot` calculation as in creation (rejected — the class slot already exists and was validated at creation; adding to it doesn't change slot usage).

### D5 — Frontend card-state derivation (no client-side rule logic)
- **Decision**: a pure util `domain/utils/classCardState.ts` maps the **server-provided** fields to the card action:
  - `visibility === "blue"` (or `coacheeStatus.isEnrolled`) → `Cancel`
  - `visibility === "green"` → `Join`
  - `visibility === "gray"` and group + full (`enrollmentCount >= capacity`) → `WAITING_LIST` (label option only; join flow is US-3.2)
  - group, within reach, not enrolled, has a spot → `Join`
  - individual / out-of-reach / canceled → no join action
- **Rationale**: the backend already computes `visibility` and `coacheeStatus` (from 008); deriving the action from authoritative server data keeps the rules testable as a pure function and avoids duplicating reach/capacity logic in the browser.
- **Alternatives considered**: re-deriving reach/capacity client-side (rejected — duplicates backend rules and drifts).

### D6 — Frontend scope boundary note
- **Decision**: this feature builds the minimal Coachee class-card surface needed to exercise Join/Cancel (a `CoacheeClassList` fed by `useListClasses`, hosted by `CoacheeHomePage`/`CoacheeCalendarPage`). The full Coachee calendar (colored weeks, gray busy blocks, waiting-list join tap) belongs to the Coachee self-service timeline and is explicitly out of scope.
- **Rationale**: the spec assumes the card surface exists; without a minimal one, the Join/Cancel actions have nowhere to render. Keeping it minimal prevents scope creep into the coachee-calendar storyline.

### D7 — Error-to-message mapping (FR-018)
- **Decision**: one `enrollmentErrorMessages` map keyed on backend `error.code` (`CLASS_FULL`, `LEVEL_MISMATCH`, `OVERLAP_DETECTED`, `ALREADY_ENROLLED`, `NOT_FOUND`, `FORBIDDEN`, `VALIDATION_ERROR`) producing Coachee-friendly Spanish/English text; unknown codes fall back to a generic message. Never surface `error.ref`/stack details.
- **Rationale**: the API contract guarantees stable codes; a fixed map yields deterministic, testable UX.
- **Alternatives considered**: echoing `error.message` verbatim (rejected — leaks implementation-shaped text; the docs explicitly reserve `message` for actionable user text but a mapped string is more consistent).

## 3. Test & validation strategy

- **Red-Green** (Constitution §II): write `EnrollmentPolicy.test.ts` first with every branch (capacity full/ok, reach ok/out, overlap yes/no, already enrolled, individual class, canceled class, ownership yes/no, opened-spot true/false, all 3 notification types); confirm failing → implement → green. Target 100% branch coverage on the policy.
- `JoinTrainingClass.test.ts` / `CancelEnrollment.test.ts`: happy path + each error path (mock `PrismaClient`).
- `classes.enrollment.int.test.ts` (Supertest): one happy-path and one validation-error test for **each** documented error code of both endpoints, plus a two-actor race test asserting exactly one `CLASS_FULL` (FR-019) under serializable isolation.
- Frontend: pure `classCardState.ts` unit tests (state → action matrix); manual scenarios via `quickstart.md`.

## 4. Risks / mitigations

- **Capacity race under serializable tx**: Prisma `Serializable` may retry/abort transactions under contention — the use case catches abort as `CLASS_FULL` conflict so a coachee never silently fails. (Risk: perf at scale; single-gym volumes are trivial.)
- **Stub replacement drift**: the two routes currently return `501`; replacing them must keep `requireRole(COACHEE)` and the documented response shapes — covered by the integration tests.
- **Frontend card surface assumption**: the spec assumed cards exist; the minimal list is in scope but the surrounding Coachee calendar stays out — documented in D6 to avoid scope creep during implementation.
- **Timezone correctness**: not relevant to these endpoints (they operate on class ids/instants already stored as UTC); no new time math introduced.
- **No browser→Google API**: join/cancel never touch Google Calendar; no regression risk added.