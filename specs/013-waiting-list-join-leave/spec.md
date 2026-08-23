# Feature Specification: Waiting List Join/Leave

**Feature Branch**: `013-waiting-list-join-leave`

**Created**: 2026-08-19

**Status**: Draft

**Input**: User description: "US-3.3: Waiting List Join/Leave (COACHER-23) — As a Coachee, I want to join and leave waiting lists, So that I can be considered for spots when they open."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Join the waiting list for a full group class (Priority: P1)

A Coachee sees a group class that is already at full capacity (4 of 4 spots taken) and taps the waiting-list option on the class. The system checks that the class is a group class at full capacity, that the class is within the Coachee's level reach (their level, one above, or one below), that the Coachee is not already enrolled in the class and not already on its waiting list, and that the waiting list has a free slot (fewer than 4 members). If all checks pass, the Coachee is added to the waiting list and receives confirmation that they are on the list. If a check fails, the system refuses with a clear, specific reason. The system knows who is joining from the authenticated session — the Coachee never has to type their own identifier.

**Why this priority**: Joining the waiting list for a full group class is the core value of the story — it is the path a Coachee takes to be considered when a spot in a popular class opens. It is the most common waiting-list action and gives the Coachee immediate control over otherwise-blocked classes.

**Independent Test**: Can be fully tested by a Coachee with a valid level joining a full group class waiting list that has a free slot and verifying they appear on the list, then repeating against a full waiting list, an out-of-reach level, an already-enrolled class, an already-joined list, a partially-full class, and a canceled class to verify each is refused with its distinct reason — it delivers self-service waitlisting for group classes on its own.

**Acceptance Scenarios**:

1. **Given** a Coachee authenticated with a valid level and a group class at full capacity (4/4) with fewer than 4 people on its waiting list, **When** the Coachee joins the waiting list, **Then** they are added successfully, the waiting-list entry is recorded, the waiting-list membership count increases by one, and the Coachee receives confirmation that they are on the list.
2. **Given** a group class whose waiting list already has 4 members, **When** a Coachee tries to join the waiting list, **Then** the join is refused with a clear "waiting list is full" message and no entry is recorded.
3. **Given** a group class whose level is outside the Coachee's reach (their level, one above, or one below), **When** the Coachee tries to join the waiting list, **Then** the join is refused with a clear "level mismatch" message and no entry is recorded.
4. **Given** a group class at full capacity in which the Coachee is already enrolled, **When** the Coachee tries to join the waiting list, **Then** the join is refused with a clear "already enrolled" message and no entry is recorded.
5. **Given** a group class at full capacity whose waiting list the Coachee is already on, **When** the Coachee tries to join the waiting list again, **Then** the join is refused with a clear "already on waiting list" message and no duplicate entry is created.
6. **Given** a group class that still has a free spot (not full), **When** a Coachee tries to join its waiting list, **Then** the join is refused because the waiting list is only offered for full classes, and no entry is recorded (the Coachee is directed to the normal join flow instead).
7. **Given** a canceled group class, **When** a Coachee tries to join its waiting list, **Then** the join is refused and no entry is recorded.
8. **Given** a Coachee initiating the join, **When** the request to join is submitted, **Then** the system identifies the Coachee from the authenticated session only and the request carries no Coachee identifier from the client.
9. **Given** a user who is not a Coachee (a Coach or an Admin), **When** they attempt to join a waiting list, **Then** the attempt is refused and no entry is recorded.

---

### User Story 2 - Join the waiting list for an occupied individual class slot (Priority: P1)

A Coachee sees an individual class time slot that is already occupied (shown as a gray busy block on the calendar) and chooses "Join waiting list for this time slot". The system checks that the individual class slot is occupied, that the class is within the Coachee's level reach, that the Coachee is not already enrolled in that class and not already on its waiting list, and that the waiting list has a free slot (fewer than 4 members). If all checks pass, the Coachee is added to the waiting list for that specific time slot and receives confirmation. If a check fails, the system refuses with a clear, specific reason.

**Why this priority**: Individual class slots are the gym's scarcest resource and are often occupied by an assigned Coachee; the waiting list for an occupied slot is the only way a Coachee can express interest in a time their preferred Coach is otherwise unavailable. It is listed at equal weight with the group flow in the story and unlocks the gray-block interaction from the calendar.

**Independent Test**: Can be fully tested by a Coachee with a valid level joining the waiting list of an occupied individual class time slot with a free waiting-list slot and verifying they appear on the list, then repeating against an occupied slot with a full waiting list, an unoccupied slot, an already-enrolled coachee, and an already-joined list to verify each is refused with its distinct reason — it delivers self-service waitlisting for individual slots on its own.

**Acceptance Scenarios**:

1. **Given** an occupied individual class time slot with fewer than 4 people on its waiting list, **When** a Coachee joins the waiting list for that time slot, **Then** they are added successfully, the waiting-list entry is recorded, and the Coachee receives confirmation identifying the specific time slot.
2. **Given** an occupied individual class time slot whose waiting list already has 4 members, **When** a Coachee tries to join, **Then** the join is refused with a clear "waiting list is full" message and no entry is recorded.
3. **Given** an individual class time slot that is not occupied, **When** a Coachee tries to join its waiting list, **Then** the join is refused because the waiting list is only offered for occupied slots, and no entry is recorded.
4. **Given** an individual class time slot in which the Coachee is already enrolled, **When** the Coachee tries to join its waiting list, **Then** the join is refused with a clear "already enrolled" message and no entry is recorded.
5. **Given** an occupied individual class time slot whose waiting list the Coachee is already on, **When** the Coachee tries to join again, **Then** the join is refused with a clear "already on waiting list" message and no duplicate entry is created.
6. **Given** a Coachee with a level outside the individual class's reach, **When** the Coachee tries to join its waiting list, **Then** the join is refused with a clear "level mismatch" message and no entry is recorded.
7. **Given** a canceled individual class, **When** a Coachee tries to join its waiting list, **Then** the join is refused and no entry is recorded.

---

### User Story 3 - Leave any waiting list at any time (Priority: P2)

A Coachee who is on one or more waiting lists can leave any of them at any time by choosing the "Leave" option on the waiting-list entry. The system removes the entry immediately, frees a slot in that waiting list for other Coachees, and confirms the removal to the Coachee. Leaving causes no penalty and notifies no other party.

**Why this priority**: The speculation-commit model for spots means a Coachee's waiting-list membership is low-cost and voluntary; being able to leave freely keeps the lists honest and matches the "no hold time, no penalty" rule. It is the natural counterpart to joining and is required for the waitlist entry to be a real, trustworthy waiting mechanism rather than a trap — but it ranks below the two join flows the story is centered on.

**Independent Test**: Can be fully tested by a Coachee who is on a waiting list choosing "Leave" and verifying the entry is removed, the waiting list slot is freed, and an attempt to leave a waiting list they are not on is refused cleanly — it delivers self-service departure on its own.

**Acceptance Scenarios**:

1. **Given** a Coachee who is on a waiting list, **When** they choose to leave it, **Then** the waiting-list entry is removed immediately, the Coachee is confirmed as no longer on the list, and the waiting-list membership count decreases by one.
2. **Given** a Coachee leaving a waiting list, **When** the leave succeeds, **Then** no penalty, fee, or restriction is applied and no other party is notified.
3. **Given** a Coachee who is not on a particular class's waiting list, **When** they try to leave that waiting list, **Then** they are informed the waiting-list entry does not exist and nothing is changed.
4. **Given** a user other than the waitlisted Coachee (another Coachee, a Coach, or an Admin), **When** they try to remove a Coachee from a waiting list, **Then** the attempt is refused and the entry is left unchanged.
5. **Given** a Coachee on a waiting list of a class that is later canceled, **When** they try to leave the waiting list, **Then** the leave is handled cleanly and the entry is removed without error.

---

### User Story 4 - View all active waiting lists (Priority: P2)

A Coachee can see every waiting list they are currently on in a dedicated "My waiting lists" view, with each entry showing the class type, name/level, date and time, and the Coach, plus an indicator of whether a spot has recently opened in that class. The view shows no position number — because all waitlisted Coachees are notified simultaneously, position carries no priority. Each entry offers a "Leave" action, and the view updates to reflect a join, a leave, or a newly opened spot without requiring a full page reload.

**Why this priority**: Without a way to see their active waiting lists, a Coachee cannot confirm a join, find a list to leave, or notice that a spot opened — so the view is what makes the join/leave actions auditable and usable. It ranks below the join and leave flows because it depends on the stored entries those flows produce, but it is required for the feature to feel complete and trustworthy.

**Independent Test**: Can be fully tested by a Coachee with several active waiting lists verifying each appears with accurate class details and no position number, and that a newly-opened spot is reflected — it delivers an accurate waiting-list overview on its own.

**Acceptance Scenarios**:

1. **Given** a Coachee who is on at least one waiting list, **When** they open their waiting lists view, **Then** every active waiting list they are on is listed with the class type, name/level, date and time, and the assigned Coach.
2. **Given** a Coachee viewing their active waiting lists, **When** the list renders, **Then** no entry shows a position number, because priority is not guaranteed by position.
3. **Given** a Coachee's waiting-list entry for a class whose enrollment count is now below full capacity, **When** the view renders, **Then** the entry indicates that a spot has recently opened (informational only — the Coachee must still take an action to claim it).
4. **Given** a Coachee with no waiting-list entries, **When** they open the view, **Then** they see an empty state instead of an error.
5. **Given** a class the Coachee is on the waiting list for that has since been canceled, **When** the view renders, **Then** the entry is not shown as an active waiting list.
6. **Given** a Coachee who successfully joins or leaves a waiting list, **When** the waiting lists view updates, **Then** it reflects the new set of active lists immediately without requiring a full page reload.

---

### Edge Cases

- What happens if two Coachees try to join the last free waiting-list slot (the 4th) at the same time (race condition)? Only one join is accepted; the other receives the "waiting list is full" message.
- What happens when a Coachee tries to join a class's waiting list and, in the same moment, the class ceases to be full (a spot opened)? The join is handled against the class state at the moment of the attempt: if the class no longer qualifies (group class no longer full), the join is refused and the Coachee is directed to the normal join flow.
- What happens when a Coachee is on a waiting list and a spot opens in that class? They are NOT enrolled automatically in this release — the automatic claim process is deferred to the waiting-list processing epic (EP-04); the freed spot and opened-spot indicator are recognized in this release.
- What happens if a Coachee tries to leave a waiting list whose entry was already removed (for example, a class was deleted or the entry expired)? They are told the waiting-list entry does not exist and nothing changes.
- What happens when a Coachee's level changes while they are on a waiting list? Their existing waiting-list membership is unaffected; the level reach rule applies at join time, not retroactively.
- What happens when the authenticated session expires mid-flow (after the list was shown but before the join/leave completes)? The action is refused with an authentication error and the Coachee is asked to sign in again; no partial waiting-list change occurs.
- What happens when a Coachee is on several waiting lists across both group and individual classes? There is no limit on the number of different waiting lists a Coachee may join, and each is managed independently.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow an authenticated Coachee to join the waiting list of a group class that is at full capacity (4/4), provided the waiting list has a free slot.
- **FR-002**: System MUST allow an authenticated Coachee to join the waiting list of an occupied individual class time slot, provided the waiting list has a free slot.
- **FR-003**: System MUST refuse a waiting-list join when the class's waiting list already has 4 members, using the waiting list full error, and MUST NOT create any entry.
- **FR-004**: System MUST refuse a waiting-list join when the class's level is outside the Coachee's reach (their level, one above, or one below), using the level mismatch error, and MUST NOT create any entry.
- **FR-005**: System MUST refuse a waiting-list join when the Coachee is already enrolled in the class, using the already-enrolled error, and MUST NOT create any entry.
- **FR-006**: System MUST refuse a waiting-list join when the Coachee is already on that class's waiting list, using the already-on-waiting-list error, and MUST NOT create a duplicate entry.
- **FR-007**: System MUST refuse waiting-list join for a group class that is not full (has a free spot) with a clear validation error, and MUST NOT create any entry.
- **FR-008**: System MUST refuse waiting-list join for an individual class time slot that is not occupied with a clear validation error, and MUST NOT create any entry.
- **FR-009**: System MUST refuse any waiting-list action on a canceled class with a validation error and MUST NOT change data.
- **FR-010**: System MUST derive the Coachee identity exclusively from the authenticated session for waiting-list join and leave; requests MUST NOT carry the Coachee identifier in the request body.
- **FR-011**: System MUST refuse waiting-list join or leave actions by users who are not the relevant Coachee with a forbidden error (non-Coachee role for joins, and any non-owner attempt to remove an entry).
- **FR-012**: System MUST allow the waitlisted Coachee to leave a waiting list at any time, removing the entry immediately with no penalties, fees, or restrictions.
- **FR-013**: System MUST enforce a maximum of 4 Coachees per waiting list (per class) and allow the 4th (last) slot to be contested safely: when two or more Coachees try to join it simultaneously, exactly one succeeds and the rest receive the waiting-list-full error.
- **FR-014**: System MUST allow a Coachee to be on any number of different waiting lists simultaneously, across both group and individual classes, with no aggregate limit.
- **FR-015**: System MUST list all of the authenticated Coachee's active waiting lists, showing the class type, name/level, date and time, and assigned Coach for each.
- **FR-016**: System MUST NOT show a position for a waiting-list entry, because priority is not guaranteed by position (all waitlisted Coachees are notified simultaneously).
- **FR-017**: System MUST indicate when a class on the Coachee's waiting list has an open spot (informational only — the Coachee must take action to claim it and is not auto-enrolled in this release).
- **FR-018**: System MUST exclude from the active waiting lists view any entry whose class is canceled or otherwise no longer active.
- **FR-019**: System MUST notify the Coachee with confirmation when they join a waiting list (identifying the class/slot) and when they leave a waiting list.
- **FR-020**: System MUST record every successful and refused waiting-list join and leave with the acting user, the class, the action, and the outcome for audit purposes.
- **FR-021**: System MUST update the waiting lists view (and the class card / calendar block state) to its new state after a successful join or leave without requiring a full page reload, and MUST surface every refusal as a clear, user-friendly message that reflects the specific reason without exposing internal error details.
- **FR-022**: System MUST reject waiting-list join or leave attempts with an expired or invalid authenticated session without altering any data.

### Key Entities *(include if feature involves data)*

- **Class (reused)**: A single 60-minute training session that is either individual or group, assigned to one Coach, with a level, a start time, a status of "Active" or "Canceled", and — for group classes — a capacity of 4. Its fullness (group) or occupancy (individual) determines whether a waiting list is offered.
- **Class Enrollment (reused)**: The record linking one Coachee to one class occurrence (group self-join or individual assignment); its existence blocks a Coachee from joining the same class's waiting list (already-enrolled rule).
- **Waiting List Entry**: The record linking one Coachee to one class waiting list; it captures the join time, is capped at 4 entries per class, is removed on leave or list processing, and carries no position.
- **Coachee (reused)**: The user role that joins, views, and leaves waiting lists; identified from the authenticated session, with a level that determines reach (±1) and the target of the already-enrolled and already-on-waiting-list validations.
- **Level (reused)**: The difficulty tier of a class and of a Coachee; the basis of the level reach rule at waiting-list join time.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A Coachee can join a waiting list (full group class or occupied individual slot) in under 1 minute from deciding to join, and sees immediate confirmation that they are on the list.
- **SC-002**: 100% of waiting-list join attempts made when the list is full, out of reach, already enrolled, already on the list, not full (group), unoccupied (individual), or canceled are refused with the specific, distinguishable reason, and cause zero change to waiting-list data.
- **SC-003**: When exactly one waiting-list slot remains, exactly one of any concurrent join attempts succeeds and all others are refused as full; this holds in 100% of tested contention cases.
- **SC-004**: A waitlisted Coachee can leave any waiting list in under 1 minute at any time, and 100% of such leaves remove the entry, free the slot, apply no penalty, and notify no other party.
- **SC-005**: 100% of waiting-list join or leave attempts by an unauthorized party (wrong role, or non-owner removal) are refused with zero data changes.
- **SC-006**: 100% of a Coachee's active waiting lists are visible in the waiting lists view with correct class details, and no entry ever displays a position number.
- **SC-007**: When a class on a Coachee's waiting list gains an open spot, the waitlists view indicates it in 100% of cases, and the Coachee is never enrolled automatically in this release.
- **SC-008**: 100% of successful and refused waiting-list join and leave actions are recorded with actor, class, action, and outcome for audit purposes.

## Assumptions

- A waiting list is capped at 4 Coachees per class, all waitlisted Coachees are notified simultaneously when spots open (no position priority), and a Coachee may be on any number of waiting lists — all per the established scheduling rules (PRD Section 5).
- Level reach, fullness/occupancy, already-enrolled, and already-on-waiting-list checks apply at the moment of joining; a later level change never removes or re-validates an existing waiting-list entry.
- Group-class waiting lists are offered only when the class is full (4/4); individual-class waiting lists are offered only when the time slot is occupied; both expose their entries through one consistent join/leave flow.
- The automatic processing of waiting lists when spots open — notifying all waitlisted Coachees simultaneously and claiming the freed spot on a first-come-first-served basis — is deferred to the waiting-list processing epic (EP-04) and is OUT OF SCOPE here; this feature stores entries, allows join/leave/view, and surfaces an opened-spot indicator only.
- The presentation surfaces (the "Join waiting list" option replacing the Join button on full class cards, the gray busy-block interaction, confirmation dialogs, and optimistic calendar updates) belong to the dashboard/calendar and calendar-interaction stories (US-3.2, US-3.4); this feature provides the underlying join/leave/view capability and confirmation feedback those surfaces act on.
- Notification dispatch beyond the immediate join/leave confirmation shown to the acting Coachee is deferred to the notifications epic; this feature records the events for audit so the notifications service can act on them.
- The Coachee waiting-list surface (list view with details and Leave action) is part of this feature, per the "view all active waiting lists" acceptance criterion.
- Automation contract: waiting-list join/leave events are logged with actor, action, resource, and outcome, consistent with the security event logging rule.