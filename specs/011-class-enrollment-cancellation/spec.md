# Feature Specification: Class Enrollment & Cancellation

**Feature Branch**: `011-class-enrollment-cancellation`

**Created**: 2026-08-18

**Status**: Draft

**Input**: User description: "US-3.1: Class Enrollment & Cancellation (COACHER-21) — As a Coachee, I want to join and cancel group classes, so that I can manage my own attendance."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Join a group class with an available spot (Priority: P1)

A Coachee browses the available classes and taps "Join" on a group class they want to attend. The system checks that the class still has a free spot, that the class level is within the Coachee's reach (their level, one above, or one below), and that the Coachee has no other class at the same time. If all checks pass, the Coachee is enrolled and sees the class confirmed in their schedule. If a check fails, the system refuses the join with a clear, specific reason. The system knows who is joining from the authenticated session — the Coachee never has to type their own identifier.

**Why this priority**: Joining classes is the core value of the story — it is the action "manage my own attendance" exists to enable. Without the join flow, the Coachee has no way to take control of their attendance, and everything else in this feature (cancel, full-class states) has nothing to act on.

**Independent Test**: Can be fully tested by a Coachee with a valid level joining a group class with free spots at a non-conflicting time and verifying they appear as enrolled, then repeating against a full class, an out-of-reach level, an overlapping class, and an already-enrolled class to verify each is refused with its distinct reason — it delivers self-service enrollment on its own.

**Acceptance Scenarios**:

1. **Given** a Coachee authenticated with a valid level and an active group class with a free spot at a time the Coachee has nothing else scheduled, **When** they join the class, **Then** they are enrolled successfully, the enrollment is recorded, and the enrollment count of the class increases by one.
2. **Given** a group class that is at full capacity, **When** a Coachee tries to join, **Then** the join is refused with a clear "class is full" message and no enrollment is recorded.
3. **Given** a group class whose level is outside the Coachee's reach (their level, one above, or one below), **When** they try to join, **Then** the join is refused with a clear "level mismatch" message and no enrollment is recorded.
4. **Given** a Coachee already enrolled in another class (individual or group) at the same time as the class being joined, **When** they try to join, **Then** the join is refused with a clear "time overlap" message and no enrollment is recorded.
5. **Given** a Coachee who is already enrolled in the class, **When** they try to join it again, **Then** the join is refused with a clear "already enrolled" message and no duplicate enrollment is created.
6. **Given** an individual class, **When** a Coachee tries to join it, **Then** the join is refused because individual classes are assigned by a Coach or Admin only, and no enrollment is recorded.
7. **Given** a canceled class, **When** a Coachee tries to join it, **Then** the join is refused and no enrollment is recorded.
8. **Given** a Coachee initiating the join, **When** the request to join is submitted, **Then** the system identifies the Coachee from the authenticated session only and the request carries no Coachee identifier from the client.
9. **Given** a user who is not a Coachee (a Coach or Admin), **When** they attempt to self-enroll, **Then** the attempt is refused and no enrollment is recorded.

---

### User Story 2 - Cancel own attendance from any enrolled class (Priority: P1)

A Coachee taps "Cancel" on a class they are enrolled in (a group class they joined, or an individual class assigned to them by a Coach or Admin). The system removes their enrollment immediately, with no penalties or restrictions, and the freed spot becomes available to others. If the class had a waiting list, the system detects that a spot has opened and prepares the automatic waiting-list handling (actual dispatching is completed in a later release). The Coachee sees confirmation that they are no longer in the class.

**Why this priority**: Cancelling is the other half of "manage my own attendance" and the issue explicitly places it at equal weight with joining. It also keeps the schedule honest — freed spots are reusable immediately, which is what makes the gym's finite capacity work.

**Independent Test**: Can be fully tested by an enrolled Coachee canceling their attendance and verifying the enrollment record is removed and the spot freed, and by attempting to cancel a class they are not enrolled in to verify a clear refusal — it delivers self-service cancellation on its own.

**Acceptance Scenarios**:

1. **Given** a Coachee enrolled in a group class, **When** they cancel their attendance, **Then** the enrollment record is removed, the class is confirmed free of that Coachee, and the enrollment count decreases by one.
2. **Given** a Coachee enrolled in an individual class assigned to them by a Coach or Admin, **When** they cancel their attendance, **Then** the enrollment record is removed and the class is confirmed free of that Coachee.
3. **Given** any enrollment being canceled by the enrolled Coachee, **When** the cancellation succeeds, **Then** no penalty, fee, or restriction is applied and no record of negative consequence is created.
4. **Given** a Coachee who is not enrolled in a class, **When** they try to cancel attendance from it, **Then** they are informed the enrollment does not exist and nothing is changed.
5. **Given** an enrollment being canceled, **When** the canceled class has a waiting list, **Then** the system recognizes that a spot has opened for automatic waiting-list handling (the actual processing and notification of waitlisted Coachees is released in a later epic).
6. **Given** a user other than the enrolled Coachee (another Coachee, a Coach, or an Admin), **When** they try to cancel this Coachee's enrollment, **Then** the attempt is refused and the enrollment is left unchanged.
7. **Given** a canceled class, **When** an enrolled Coachee tries to cancel their attendance from it, **Then** the request is refused with a clear validation message and no further change is made.

---

### User Story 3 - See the correct join state on every class card (Priority: P2)

As a Coachee moves through the class list, each group class card shows the right action for its state: an available class shows a "Join" button, and a class the Coachee is already enrolled in shows a "Cancel" button instead. When a class becomes full, the "Join" button is replaced by a waiting-list option, so the Coachee always knows what is possible at a glance. After any successful join or cancel, the affected card updates to its new correct state without a full page reload.

**Why this priority**: Correct state presentation makes the enroll/cancel actions usable — it is what turns raw class data into something a Coachee can act on. It ranks below the two core flows because it is a presentation layer over the same state those flows produce, but it is required for the feature to be complete as specified.

**Independent Test**: Can be fully tested by rendering the class list for a Coachee and verifying each group class shows the correct action (Join / Cancel / waiting-list option) matching its real state, including a full class showing the waiting-list option instead of Join — it delivers accurate, actionable class cards on its own.

**Acceptance Scenarios**:

1. **Given** a Coachee viewing a list of group classes, **When** a class has a free spot and is within the Coachee's reach, **Then** the class shows a "Join" action.
2. **Given** a Coachee viewing a class they are already enrolled in, **When** the card renders, **Then** it shows the cancellation action instead of a join action.
3. **Given** a group class at full capacity, **When** the card renders, **Then** the "Join" action is replaced by a waiting-list option and joining is no longer offered.
4. **Given** a Coachee who successfully joins a class, **When** the class card updates, **Then** the card switches to the enrolled state (cancellation action) without a full page reload.
5. **Given** a Coachee who successfully cancels from a class, **When** the class card updates, **Then** the card switches to the available state (or the waiting-list option, if the class is now full) without a full page reload.
6. **Given** any refused join or cancel (full class, level mismatch, overlap, already enrolled, not enrolled), **When** the response arrives, **Then** the Coachee sees a clear, user-friendly message explaining the specific reason, and the card state is unchanged.

---

### Edge Cases

- What happens if two Coachees join the last free spot at the same time (race condition)? Only one enrollment is accepted; the other receives the "class is full" response and the class shows the waiting-list option.
- What happens after a Coachee cancels from a class that is now below capacity? The spot is free and the class returns to the "Join" state for other eligible Coachees.
- What happens when a Coachee joins a class and, in the same moment, the class crosses into full capacity? The join is accepted (it took the last spot), and from that moment the class presents the waiting-list option to everyone else.
- How does the system handle a Coachee whose level was changed after they joined an out-of-reach class? Their existing enrollment is unaffected; the reach rule applies at join time, not retroactively.
- What happens when the class list shows a class that has since been canceled? It cannot be joined; the cancel enrollment flow also refuses to act on a canceled class.
- What happens if a Coachee tries to cancel from a class whose enrollment was already removed? They are told the enrollment does not exist and nothing changes.
- How does the system behave when a Coachee is on a waiting list for a class and a spot opens due to another Coachee's cancellation? The enrollment system recognizes the opened spot for automatic waiting-list processing, which is completed in a later release; the freed spot is not silently filled in this release.
- What happens when the authenticated session expires mid-flow (after the card was shown but before the join or cancel completes)? The action is refused with an authentication error and the Coachee is asked to sign in again; no partial enrollment change occurs.
- What happens when a Coachee uses an individual class's card? No join action is offered — individual classes are assignment-only.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow an authenticated Coachee to join an active group class that has an available spot.
- **FR-002**: System MUST derive the Coachee identity exclusively from the authenticated session (JWT) for enrollment and cancellation; requests MUST NOT carry the Coachee identifier in the request body.
- **FR-003**: System MUST refuse a join when the group class is at full capacity, using the class full error, and MUST not create any enrollment.
- **FR-004**: System MUST refuse a join when the class level is outside the Coachee's reach (their level, one above, or one below), using the level mismatch error, and MUST not create any enrollment.
- **FR-005**: System MUST refuse a join when the Coachee already has another class (individual or group) at the same time, using the overlap error, and MUST not create any enrollment.
- **FR-006**: System MUST refuse a join when the Coachee is already enrolled in the class, using the already-enrolled error, and MUST NOT create a duplicate enrollment.
- **FR-007**: System MUST refuse Coachee self-join of individual classes (assignment-only) with a validation error and MUST NOT create any enrollment.
- **FR-008**: System MUST refuse any enrollment action on a canceled class with a validation error and MUST NOT change data.
- **FR-009**: System MUST refuse enrollment or cancellation actions by users who are not the relevant Coachee with a forbidden error (non-Coachee role for actions, or non-enrolled attempt).
- **FR-010**: System MUST allow the enrolled Coachee to cancel their own attendance from any class they are enrolled in, whether they joined a group class or were assigned to an individual class.
- **FR-011**: System MUST remove the enrollment record upon cancellation and MUST apply no penalties, fees, or restrictions.
- **FR-012**: System MUST recognize when a cancellation opens a spot in a class that has a waiting list and MUST record that a spot opened for automatic waiting-list processing; the actual automatic processing and notification is delivered by a later release.
- **FR-013**: System MUST record every successful and refused enrollment and cancellation action with the acting user, the class, the action, and the outcome for audit purposes.
- **FR-014**: System MUST present a "Join" action on class cards for active group classes with a free spot that are within the Coachee's reach and not already joined.
- **FR-015**: System MUST present the cancellation action on class cards for classes the Coachee is already enrolled in.
- **FR-016**: System MUST replace the "Join" action with a waiting-list option for group classes at full capacity and MUST NOT offer self-join for full classes.
- **FR-017**: System MUST update a class card to its new state immediately after a successful join or cancellation without requiring a full page reload.
- **FR-018**: System MUST surface every refused join or cancel to the Coachee as a clear, user-friendly message that reflects the specific reason, and MUST NOT expose internal error details.
- **FR-019**: System MUST preserve the "last free spot" invariant under concurrent join attempts: when two or more Coachees try to join the final spot simultaneously, exactly one succeeds and the rest receive the class full error.
- **FR-020**: System MUST reject enrollment or cancellation attempts with an expired or invalid authenticated session without altering any data.

### Key Entities *(include if feature involves data)*

- **Class (reused)**: A single 60-minute training session that is either individual or group, assigned to one Coach, with a level (group classes), a start time, a status of "Active" or "Canceled", and a capacity (group classes max 4).
- **Class Enrollment**: The record linking one Coachee to one class occurrence (group self-join or individual assignment); it captures the enrollment time, is created on a successful join, and is the record removed on cancellation.
- **Coachee**: The user role that self-joins and cancels classes; identified from the authenticated session, with a level that determines reach (±1) and the target of overlap and already-enrolled validations.
- **Level (reused)**: The difficulty tier of a group class and of a Coachee; the basis of the level reach rule at join time.
- **Waiting List (reused)**: The queue of Coachees waiting for a spot in a full class; its existence determines the waiting-list option shown on full class cards and triggers the opened-spot handling on cancellation (automatic processing in a later release).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A Coachee can join a group class with a free spot, matching level, and no time conflict in under 1 minute from deciding to join, and sees the class confirmed in their schedule immediately.
- **SC-002**: 100% of join attempts made when the class is full, out of reach, overlapping, or already enrolled are refused with the specific, distinguishable reason, and cause zero change to enrollment data.
- **SC-003**: 100% of enforced class-card states (Join / Cancel / waiting-list option) match the real class state for the Coachee viewing them.
- **SC-004**: An enrolled Coachee (joined group class or assigned individual class) can cancel in under 1 minute, and 100% of such cancellations remove the enrollment record, free the spot, and apply no penalty.
- **SC-005**: 100% of cancellation or enrollment attempts by an unauthorized party (wrong role, not the enrolled Coachee, not enrolled at all) are refused with zero data changes.
- **SC-006**: When exactly one spot remains in a group class, exactly one of any concurrent join attempts succeeds and all others are refused as full; this holds in 100% of tested contention cases.
- **SC-007**: 100% of successful and refused enrollment and cancellation actions are recorded with actor, class, action, and outcome for audit purposes.
- **SC-008**: When a Coachee cancels and the class has a waiting list, the system detects the opened spot in 100% of cases and records it for automatic waiting-list processing.

## Assumptions

- Group class capacity is a maximum of 4 Coachees, and level reach is the Coachee's own level, one above, or one below — both per the established scheduling rules (PRD Section 5).
- Level reach, capacity, and overlap apply at the moment of joining; a later level change never removes or re-validates an existing enrollment.
- Cancellation is allowed from any class the Coachee is enrolled in, including individual classes assigned by a Coach or Admin, per the documented cancellation contract.
- The waiting-list join option on full class cards is surfaced in this feature (per the acceptance criteria), but the actual waiting-list join/leave flows and automatic processing are covered by the separate waiting-list stories (US-3.2 and the waiting-list automation epic) and are out of scope here.
- Notification dispatching (to Coachees and the assigned Coach) for enrollments and cancellations is deferred to the notifications epic; this feature records the events and prepares the opened-spot state for waiting-list processing.
- The Coachee class list and class cards already exist (from the Coachee calendar/viewing storyline); this feature adds the enroll/cancel actions and their state presentation on those cards.
- The frontend enrollment surface is part of this feature: a "Join" action with confirmation, a "Cancel" action with confirmation, the full-class waiting-list option replacement, and clear user-facing error messages for every refusal.
- Automation contract: security event logging follows the established audit rules — enrollment and cancellation events are logged with actor, action, resource, and outcome.