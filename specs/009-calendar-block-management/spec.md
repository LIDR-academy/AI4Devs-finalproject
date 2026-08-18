# Feature Specification: Calendar Block Management

**Feature Branch**: `009-calendar-block-management`

**Created**: 2026-08-18

**Status**: Draft

**Input**: User description: "US-2.4: Calendar Block Management (COACHER-19) — As a Coach or Admin, I want to create personal and gym-wide time blocks, so that unavailable time is respected during scheduling."

## Clarifications

### Session 2026-08-18

- Q: Canceled block lifecycle & visibility → A: Soft-cancel: block gains a "Canceled" status, record retained for audit, but excluded from the block list and availability (Option A)

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Create a personal time block (Priority: P1)

A Coach or Admin marks a period of time where a specific Coach is unavailable. A Coach can only block their own calendar; an Admin can block the calendar of any Coach. The block starts and ends on an hour boundary and is at least one hour long. The system refuses any block that would overlap a class the Coach is assigned to or another existing block on that Coach's calendar, and it keeps the external scheduling calendar in sync by reserving the same period there.

**Why this priority**: Personal blocks are the most common way to protect a Coach's availability (rest days, appointments, vacations). Without them, the schedule can assign a Coach to a class they cannot teach, which is a direct correctness failure of the scheduling engine.

**Independent Test**: Can be fully tested by creating a personal block for a Coach and verifying it appears in the block list, over the same period on the external scheduling calendar, and that an overlapping class or block is refused — it delivers Coach availability protection on its own.

**Acceptance Scenarios**:

1. **Given** an authenticated Coach, **When** they create a personal block on their own calendar for an hour-aligned period of at least one hour, **Then** the block is created, appears in the block list, and the same period is reserved on the external scheduling calendar.
2. **Given** an authenticated Admin, **When** they create a personal block on the calendar of any active Coach, **Then** the block is created for that Coach and the external scheduling calendar is updated accordingly.
3. **Given** an authenticated Coach, **When** they attempt to create a personal block on another Coach's calendar, **Then** the attempt is refused with a permission-denied error and no block data is changed.
4. **Given** an authenticated Admin or Coach, **When** they create a block that overlaps a class already assigned to the Coach being blocked, **Then** the block is refused with a conflict error and no block is created.
5. **Given** an authenticated Admin or Coach, **When** they create a personal block that overlaps another existing block on the same Coach's calendar, **Then** the block is refused with a conflict error and no block is created.
6. **Given** a block request whose start or end is not aligned to an hour boundary or whose duration is under one hour, **When** the block is submitted, **Then** the request is rejected with a validation error and no block is created.

---

### User Story 2 - Create a gym-wide time block (Priority: P1)

An Admin marks a period of time during which no classes of any kind may run at the gym (for example, an event, maintenance, or a public holiday). Only an Admin can create a gym-wide block. It follows the same hour-alignment and one-hour-minimum rules, must not overlap any existing class or block, and is mirrored on the external scheduling calendar.

**Why this priority**: Gym-wide blocks protect the gym's capacity as a whole and take precedence over any class. They are the second half of the availability model and cannot be delivered by personal blocks, so they are equally necessary for the feature to fulfill its purpose.

**Independent Test**: Can be fully tested by creating a gym-wide block and verifying it is listed, appears on the external scheduling calendar, and prevents any class from being scheduled during its period — it delivers gym-wide availability protection on its own.

**Acceptance Scenarios**:

1. **Given** an authenticated Admin, **When** they create a gym-wide block for an hour-aligned period of at least one hour, **Then** the block is created, appears in the block list, and the period is reserved on the external scheduling calendar.
2. **Given** an authenticated Coach, **When** they attempt to create a gym-wide block, **Then** the attempt is refused with a permission-denied error and no block is created.
3. **Given** an existing class or block anywhere in the gym, **When** an Admin attempts to create a gym-wide block that overlaps it, **Then** the block is refused with a conflict error and no block is created.
4. **Given** a gym-wide block request whose start or end is not aligned to an hour boundary or whose duration is under one hour, **When** the block is submitted, **Then** the request is rejected with a validation error and no block is created.

---

### User Story 3 - Cancel a time block (Priority: P1)

A Coach or Admin removes a time block that is no longer needed, releasing that period back to the schedule. An Admin can cancel any block; a Coach can only cancel their own personal blocks (never a gym-wide block or a personal block created by someone else). The canceled period is removed from the external scheduling calendar and the blocked time immediately becomes available again.

**Why this priority**: Cancellation is the corrective counterpart to creation. Without it, an erroneous or outdated block would permanently take time out of the schedule, so the feature cannot be considered complete without this capability.

**Independent Test**: Can be fully tested by canceling an existing block and verifying it is removed from both the block list and the external scheduling calendar, plus that unauthorized cancellations are refused — it delivers block removal on its own.

**Acceptance Scenarios**:

1. **Given** an existing personal block, **When** an Admin or the Coach who created it cancels it, **Then** the block is removed from the block list and the period is released on the external scheduling calendar.
2. **Given** an existing gym-wide block, **When** an Admin cancels it, **Then** the block is removed from the block list and the period is released on the external scheduling calendar.
3. **Given** an existing gym-wide block, **When** a Coach attempts to cancel it, **Then** the attempt is refused with a permission-denied error and no block data is changed.
4. **Given** a personal block created by one Coach, **When** a different Coach attempts to cancel it, **Then** the attempt is refused with a permission-denied error and no block data is changed.
5. **Given** a block that does not exist, **When** someone attempts to cancel it, **Then** a not-found error is returned.
6. **Given** an already-canceled block, **When** someone attempts to cancel it again, **Then** the request is rejected with a conflict error and no duplicate cancellation occurs.

---

### User Story 4 - View blocked time and see it affect availability (Priority: P2)

A Coach or Admin views all blocks (personal and gym-wide) within a chosen date range, optionally narrowed to one type, so the calendar can render blocked periods alongside classes. In addition, whenever available time slots are computed, personal blocks and gym-wide blocks are excluded from the slots the schedule proposes.

**Why this priority**: Viewing and honoring blocks in availability is what makes the blocks meaningful for scheduling decisions. It is important but builds naturally on creation and cancellation, and it partly overlaps with the visual calendar surface delivered by a later user story, so it is ranked below the create/cancel flows.

**Independent Test**: Can be fully tested by requesting the block list for a date range containing known blocks and asking for available slots over a coach's or the gym's calendar — verifying the correct blocks are returned and no blocked period is proposed — it delivers block visibility on its own.

**Acceptance Scenarios**:

1. **Given** a set of blocks spread across several days and both block types, **When** a Coach or Admin requests the list for a date range containing only part of them, **Then** the response contains exactly the blocks that fall within that range, including each block's start, end, type, and the Coach calendar it blocks (for personal blocks).
2. **Given** a Coach or Admin viewing the block list, **When** they filter by block type (personal or gym-wide), **Then** only blocks of the selected type are returned.
3. **Given** existing personal and gym-wide blocks, **When** an available-slots request is made over the gym's or a Coach's calendar, **Then** no slot is proposed that overlaps a personal block on that Coach's calendar or any gym-wide block.
4. **Given** personal and gym-wide blocks within a range, **When** the block list is requested, **Then** gym-wide blocks are reported without a specific Coach (the whole gym is blocked), while personal blocks identify the Coach whose calendar is blocked.
5. **Given** no date range, or an invalid one, **When** a block list is requested, **Then** the request is rejected with a clear validation error and no blocks are shown.

---

### Edge Cases

- What happens when the requested start time is after the end time, or the two are equal? A clear validation error is returned; no block is created.
- What happens when a block request references a Coach who does not exist or is not active? A validation/not-found error is returned so the user knows the reference is wrong.
- What happens when a block is created that is already in progress or entirely in the past? Creating blocks in the past is rejected; an existing block can still be canceled regardless of when it started.
- How does the system handle a block that overlaps one class assigned to the Coach but not another? The overlap check rejects any overlap with any class assigned to the blocked Coach; the whole block is refused, not partially accepted.
- How does the system handle two personal blocks on different Coaches that cover the same period? They are allowed, because each Coach's availability is handled independently.
- What happens when a gym-wide block overlaps a personal block? Gym-wide blocks must be non-overlapping with all existing classes and blocks, so the request is refused with a conflict error.
- How does the system handle a multi-hour block (for example, 09:00–12:00)? Multi-hour blocks are allowed as long as both boundaries are hour-aligned and the duration is at least one hour.
- What happens if the external scheduling calendar is temporarily unavailable when creating or canceling a block? The operation fails with a clear service-unavailable message and leaves no partial or inconsistent block state behind; the user is told to retry.
- What happens when a Coach requests the block list? They see all active blocks, including gym-wide blocks and personal blocks of other Coaches, because the list is used to render the shared schedule for Admin and Coach roles.
- How does the system treat a canceled block? It keeps its record with a "Canceled" status for audit purposes, but it no longer appears in the block list and no longer consumes time in availability calculations or on the external scheduling calendar.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow an authenticated Admin or Coach to request the block list for a required date range and return every block that falls within it.
- **FR-002**: System MUST support optional filtering of the block list by block type (personal or gym-wide).
- **FR-003**: Each returned block MUST include its start, end, type, the user who created it, and, for personal blocks only, the Coach whose calendar is blocked (gym-wide blocks MUST have no Coach reference).
- **FR-004**: System MUST allow an authenticated Admin to create a personal block on any active Coach's calendar.
- **FR-005**: System MUST allow an authenticated Coach to create a personal block only on their own calendar; any other target MUST be refused with a permission-denied error.
- **FR-006**: System MUST allow only an authenticated Admin to create a gym-wide block; a Coach MUST receive a permission-denied error.
- **FR-007**: System MUST require block start and end to be aligned to hour boundaries and enforce a minimum duration of one hour, rejecting anything else with a validation error.
- **FR-008**: System MUST reject a block request whose start is on or after its end with a validation error.
- **FR-009**: System MUST check for overlap before creating any block: a personal block MUST not overlap any class assigned to the target Coach or any existing block on that Coach's calendar; a gym-wide block MUST not overlap any existing class or block gym-wide. Overlaps MUST be refused with a conflict error.
- **FR-010**: System MUST create a corresponding reservation on the external scheduling calendar for every block created.
- **FR-011**: System MUST allow an Admin to cancel any block, and a Coach to cancel only personal blocks they created; all other cancellations MUST be refused with a permission-denied error.
- **FR-012**: System MUST return a not-found error when canceling a block that does not exist, and MUST prevent double cancellation of an already-canceled block with a conflict error; canceled blocks keep their "Canceled" status in the record.
- **FR-013**: System MUST release the corresponding period on the external scheduling calendar when a block is canceled.
- **FR-014**: System MUST exclude time covered by personal blocks (for the affected Coach) and gym-wide blocks (for the whole gym) from every available-slots calculation.
- **FR-015**: System MUST NOT generate any notifications for block creation or cancellation.
- **FR-016**: System MUST record every block creation and cancellation (actor, block, outcome) for audit purposes.
- **FR-017**: If the external scheduling calendar cannot be reached during creation or cancellation, System MUST fail the operation transparently with a service-unavailable error and MUST NOT leave incomplete or inconsistent block state.
- **FR-018**: System MUST retain a canceled block's record (with status "Canceled") while excluding it from the block list and from all availability calculations.

### Key Entities *(include if feature involves data)*

- **Block**: A period of excluded time. It has a type of "personal" or "gym-wide", a start and end (hour-aligned, one-hour minimum), an optional Coach reference (present only for personal blocks, identifying whose calendar is blocked), the user who created it, the reference to its reservation on the external scheduling calendar, and a status of "Active" or "Canceled" (canceled blocks are retained in the record but excluded from the schedule and availability).
- **User (Coach / Admin)**: The actors who create and cancel blocks. Admins act on any Coach's calendar and the whole gym; Coaches act only on their own calendar.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of valid personal and gym-wide block creation attempts succeed on first submission and the block is immediately visible in the block list and on the external scheduling calendar.
- **SC-002**: 100% of overlapping block requests (classes or other blocks) are refused with a conflict error, and none of them create a block or alter any class data.
- **SC-003**: 100% of unauthorized actions (Coach creating a gym-wide block, Coach blocking another Coach's calendar, Coach canceling a gym-wide or another Coach's personal block) are refused without any change to block data.
- **SC-004**: An authorized user can cancel any eligible block within 30 seconds of deciding to do so, and the blocked period immediately becomes available again in the schedule and on the external calendar.
- **SC-005**: 100% of blocks within a requested range are returned in the block list with the exact requested range, and 100% of results match an applied block-type filter.
- **SC-006**: Time covered by personal or gym-wide blocks is excluded from 100% of available-slots results for the affected Coach or gym.
- **SC-007**: Block creation and cancellation generate zero notifications to any user.

## Assumptions

- Blocks may span multiple hours (for example 09:00–12:00) as long as both boundaries are hour-aligned and the duration is at least one hour.
- Creating a block that is already in progress or entirely in the past is rejected; an existing block can still be canceled regardless of its timing, mirroring class cancellation behavior.
- The Gym capacity model (max 2 individual + 1 group simultaneous) continues to govern class scheduling; blocks only exclude time, they do not change capacity rules.
- The visual calendar rendering of blocks is delivered by the Admin/Coach calendar UI storyline; this feature provides the underlying block data and availability behavior only.
- The external scheduling calendar is the project's scheduling engine (Google Calendar) and remains the single source of truth for reservations; it is accessed only server-side.
- No notifications are sent for block creation or cancellation, per the product decision for blocks.
- Blocks are not editable; any change is achieved by canceling and recreating, consistent with the project's scheduling conventions.
- Existing authentication, role-based authorization, timezone handling (gym timezone, DST-aware, hour-aligned wall-clock input), and audit-logging infrastructure are reused; no new user-management behavior is introduced by this feature.