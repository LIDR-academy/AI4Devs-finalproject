# Research: Calendar Block Management

**Phase 0 output** — resolves the design questions raised by the Technical Context and spec. Each entry follows Decision / Rationale / Alternatives considered. All NEEDS CLARIFICATION entries from the plan's Technical Context were resolved through the spec + the confirmed clarification (soft-cancel, Option A) + the existing codebase inventory.

## R1. Soft-cancel requires a `status` column on `Block` — reuse the `ClassStatus` enum

- **Decision**: Add `status ClassStatus @default(ACTIVE)` to the `Block` model (additive migration; existing rows backfill to `ACTIVE`). Cancellation is `ACTIVE → CANCELED` (terminal); the row is kept, `google_event_id` is cleared, and canceled blocks are excluded from `GET /blocks`, available-slots, and class-creation overlap checks.
- **Rationale**: FR-012/FR-018 and the clarified soft-cancel decision (Session 2026-08-18, Option A). `ClassStatus` already carries exactly the needed values (`ACTIVE`, `CANCELED`) and is the same semantic used by `TrainingClass` (008 feature reuses it too) — no new enum, minimal churn. The clause in the plan gate G2 that blocks are excluded from availability and class creation is enforced by adding `status: "ACTIVE"` to the two existing block queries.
- **Alternatives considered**: hard delete (rejected — violates FR-018 audit retention and the "already canceled" conflict); a dedicated `BlockStatus` enum (rejected — `ClassStatus` is semantically identical, reusing avoids enum duplication); a `canceled_at` tombstone column (rejected — spec requires an explicit status, and `ClassStatus` is the established pattern).

## R2. A pure domain service `BlockPolicy` owns all block business rules

- **Decision**: New `backend/src/domain/services/BlockPolicy.ts` (zero infrastructure imports) exposing:
  - `validBlockWindow(start, end, now): { valid: true } | { valid: false; reason: string }` — hour-aligned boundaries (`getUTCMinutes() === 0 && getUTCSeconds() === 0`, the same check `CreateTrainingClass.isHourAligned` uses), ≥ 60 min, `start < end`, `start >= now` (no past/in-progress blocks)
  - `canCreateGymWide(actorRole): boolean` — `ADMIN` only
  - `canCreatePersonal(actorRole, actorId, targetCoachId): boolean` — `ADMIN` (any coach) or `COACH` where `actorId === targetCoachId`
  - `canCancel(actorRole, actorId, block: { block_type; created_by }): boolean` — `ADMIN`, or `COACH` owning a `PERSONAL` block
- **Rationale**: Constitution §I (business rules live in domain services, not use cases) and §II (100% branch coverage on pure functions). All authorization and window rules become table-driven unit-testable booleans.
- **Alternatives considered**: inline checks in use cases (rejected — violates domain purity, unverifiable branch coverage); putting overlap scope selection in the policy (rejected — overlap is already covered by the pure `OverlapChecker` primitive; the scope query lives in the use case where Prisma data is shaped).

## R3. Overlap semantics at creation

- **Decision**: Before creating a block, query ACTIVE data and reject any overlap with `ConflictError("…", "OVERLAP_DETECTED")`:
  - **Gym-wide** conflicts with ANY active class (any coach) or ANY active block (personal or gym-wide) that overlaps `[start, end]`.
  - **Personal** conflicts with any active class assigned to the target Coach or any active block on that Coach's calendar — defined as `PERSONAL` with `coach_id = target` OR any `GYM_WIDE` — overlapping `[start, end]`.
  - Two personal blocks on different Coaches covering the same period remain allowed (per-coach independence).
- **Rationale**: FR-009 and the spec edge cases (a gym-wide block cannot overlap a personal block or any class; a personal block cannot overlap a block already on that Coach's calendar — including a gym-wide block). `OverlapChecker.hasOverlap` is reused to remain pure.
- **Alternatives considered**: partial acceptance of a non-overlapping sub-range (rejected — whole-block semantics per spec); treating gym-wide as implicitly superseding personal blocks (rejected — contradicts "blocks cannot overlap with existing classes or other blocks").

## R4. Calendar-first ordering for create and cancel (consistency with classes)

- **Decision**: **Create** — call `calendar.createEvent` first; on failure throw `ServiceUnavailableError` before any DB write; then `prisma.block.create` storing `google_event_id`; if the DB insert fails after the event was created, delete the event in the same handling path (mirrors `CreateTrainingClass.rollbackCalendarEvents`). **Cancel** — delete the calendar event first (`deleteEvent(google_event_id)`), then in the DB transaction set `status: CANCELED` and clear `google_event_id` (mirrors `CancelTrainingClass.deleteCalendarEvents`); calendar failure → `503` with no DB change.
- **Rationale**: Constitution §Performance/UX #1 (calendar is the availability single source of truth, server-side only) and FR-017 (no partial/inconsistent state when the calendar is unavailable). This is the exact ordering proven by class create/cancel, so divergence is minimized.
- **Alternatives considered**: DB-first then calendar (rejected — an unavailable calendar would leave a "blocked" state inconsistent with the schedule); compensating recreate on cancel failure (rejected — same fragility noted in 008's R3, unnecessary for a single-row update).

## R5. `GET /blocks` contract: interval-overlap date range + pagination + DTO, canceled excluded

- **Decision**: Rework `ListBlocks` to accept `{ start, end, blockType?, page, limit }`. A block is "within the range" when it **interval-overlaps** it (`start_time < rangeEnd AND end_time > rangeStart`), not merely when its start falls inside — so multi-hour blocks that straddle a range boundary still render. Query filters `status: "ACTIVE"` (optionally `block_type`, defaults exclude nothing), orders by `start_time ASC`, paginates with `skip/take`, and maps to a new `toBlockDTO` exposing `{ id, blockType, createdBy: {id,name}, coach: {id,name}|null, startTime, endTime, description }` per the documented contract. `blockType` is serialized as `"PERSONAL" | "GYM_WIDE"` — the enum casing consistent with `classType` — normalizing the lowercase example in `docs/api-specifications.md`.
- **Rationale**: FR-001/FR-002/FR-003 and US-4. Rendering correctness for a week view requires interval semantics. Matching `classType` casing keeps the API self-consistent; both sides ship in the same release.
- **Alternatives considered**: start-only membership like `GET /classes` (rejected — a block starting before the window but extending into it would disappear from the rendered week); no pagination (rejected — contract documents `meta` and long horizons should stay readable).

## R6. Availability and class creation already honor blocks — must be taught to ignore canceled ones

- **Decision**: Two one-line query changes:
  - `GetAvailableSlots.ts` block query (`findMany` on `GYM_WIDE` OR `PERSONAL` for the coach) gains `status: "ACTIVE"`.
  - `CreateTrainingClass.loadSlotContext` range-block query gains `status: "ACTIVE"`.
- **Rationale**: FR-014 and the clarified soft-cancel semantics. Time covered by a CANCELED block is free time and must be schedulable; without the filter, canceled blocks would keep blocking even though they are excluded from the list (inconsistent).
- **Alternatives considered**: post-query filtering in JS (rejected — data filtering belongs in the parameterized query per Constitution §V; also keeps queries single-purpose).

## R7. Router hardening: auth, strict schema, DTO, envelope

- **Decision**: Rewrite `backend/src/infrastructure/routes/blocks.ts`:
  - `GET /blocks` — `authenticate` + `requireRole(ADMIN, COACH)`; strict query schema (`start`, `end` ISO datetime required; `blockType` enum optional; `page`/`limit`), `start > end` → `400`; response `{ data: [...toBlockDTO], meta }`.
  - `POST /blocks` — `authenticate` + `requireRole(ADMIN, COACH)`; strict body schema (`blockType` enum, `coachId` uuid optional, `startDateTime`/`endDateTime` datetime, `description` optional ≤ 500); `503` guard when `container.createBlock` is null; `201` with the DTO.
  - `DELETE /blocks/:id` — `authenticate` + `requireRole(ADMIN, COACH)`; `200 { status: "CANCELED" }`.
  - All errors flow through the existing error-handler envelope.
- **Rationale**: FR-004/005/006 and G3/G4 (Constitution §III/IV). The current router has no auth, no validation, and returns raw snake_case rows — a security and contract violation.
- **Alternatives considered**: keeping the untyped route handlers (rejected — does not satisfy `requireRole`/`.strict()` gates); custom auth in the use case only (rejected — Constitution §III requires middleware-level guards for every endpoint).

## R8. Block creation rules: Coach personal defaults to self; Admin selects any active Coach

- **Decision**: On `POST /blocks` with `blockType=personal`, if the actor is a Coach the `coachId` defaults to the actor's own id (any explicitly different target → `403` via `BlockPolicy.canCreatePersonal`). If the actor is an Admin, `coachId` is required and the target must exist with role `ADMIN` or `COACH` and status `ACTIVE`; otherwise `404 NOT_FOUND`. `blockType=gym-wide` for a Coach → `403`.
- **Rationale**: US-1/US-2 and the documented contract (`docs/api-specifications.md` §POST /blocks: "For Coach creating a personal block, this defaults to their own ID"). Target validity prevents referencing a Coachee or an inactive user (spec edge case).
- **Alternatives considered**: allowing Coach personal blocks to target any other Coach (rejected — explicit prohibition in the user story); allowing gym-wide for Coaches (rejected — Admin-only).

## R9. Audit logging scope

- **Decision**: Every block create (success + denied authorization) and cancel (success + denied) writes a `SecurityAuditLog` row: `action: "block.create" | "block.cancel"`, `resource: "BLOCK"`, `resourceId`, `outcome: "SUCCESS" | "DENIED"`. No `Notification` rows are created anywhere for blocks.
- **Rationale**: FR-015/FR-016 and Constitution §Security-Requirements.5; mirrors `CancelTrainingClass` (audits DENIED before throwing `403`).
- **Alternatives considered**: omitting audit (rejected — Constitution §III/§Security-Requirements.5 mandate logging schedule mutations); generating notifications (rejected — FR-015, PRD §9 "Notifications not required for blocks").

## R10. Frontend surface: minimal but demonstrable

- **Decision**: Extend the existing shared `ClassCalendar` to fetch blocks for the active week (`useListBlocks`), merge them into the Schedule-X event set via a new `toBlockCalendarEvent` (distinct gray/dark styling + `blockType` label), open a new `BlockDetailView` on block click (with a role-aware Cancel: Admin always; Coach only on own `PERSONAL`), and add a `CreateBlockModal` (type selector; Coach's personal targets locked to self; Admin gets the coach dropdown from the existing `useAssignableCoaches`; hour-aligned selectors; optional description) wired via an "Add Block" button on the admin and coach `CalendarPage`. Mobile (Schedule-X day view) rendering of blocks is deferred to US-2.5.
- **Rationale**: US-4 "View blocked time" needs a user-visible surface to be demonstrable end-to-end; 008 shipped comparable list/detail/cancel UI. Reusing `useAssignableCoaches`, the repo/hook pattern, and `gymDateTime` keeps the change small.
- **Alternatives considered**: API-only delivery (rejected — no way to prove FR-001/002/003 end-to-end or to validate UI flows in quickstart); a dedicated standalone calendar page (rejected — the existing `ClassCalendar` is the correct surface; full block-styling polish is US-2.5).

## R11. Tests & test strategy

- **Decision**: Add `BlockPolicy.test.ts` (100% branch coverage: window matrix, personal/gym-wide create matrix, cancel matrix); `blocks.test.ts` (per endpoint happy-path + validation-error, plus 403/404/409 branches and pagination), using the existing hand-signed-JWT helper and per-describe `PrismaClient` seeding/cleanup conventions; `blocks.int.test.ts` gated `describe.runIf(hasCredentials)` to assert the Google event exists for a created block and is removed on cancel. Extend `GetAvailableSlots.test.ts` assertions so the block stub carries `status`.
- **Rationale**: Constitution §II (branch coverage on the domain service, happy-path + validation-error Supertest per endpoint). Mirrors `classes.test.ts` / `GetAvailableSlots.test.ts` conventions exactly.
- **Alternatives considered**: skipping int tests (rejected — calendar syncing is a hard acceptance criterion, FR-010/FR-013); testing calendar mocking in unit tests only (rejected — the live-sync path is asserted when credentials exist, matching the existing suite).

## R12. Docs synchronization

- **Decision**: Update `docs/api-specifications.md` §Blocks with two notes: `GET /blocks` excludes canceled blocks, and `blockType` values use enum casing (`PERSONAL`/`GYM_WIDE`). Update the `Block` node in the ERD inside `docs/system-architecture.md` to include `status ClassStatus @default(ACTIVE)`.
- **Rationale**: Constitution §IV (new/changed endpoint behavior documented) and the data-model-sync extension's ERD↔schema validation. Small, targeted edits; no contract shape changes.
- **Alternatives considered**: leaving docs untouched (rejected — the casing note prevents contract drift; the ERD must match the schema).

## R13. No new dependencies, no version bump

- **Decision**: The feature introduces zero new npm packages; the single additive column is a non-breaking migration; no API version bump (`/api/v1` unchanged; block endpoints already documented).
- **Rationale**: G5 and the pre-1.0 internal-API posture already applied by 008 (R8). The consuming SPA ships in the same release.
- **Alternatives considered**: `api/v2` (rejected — pre-1.0 internal API, single consumer); a third-party scheduling UI (rejected — Schedule-X already present and reused).