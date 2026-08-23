# Feature Specification: Coachee Calendar Interactions

**Feature Branch**: `016-coachee-calendar-interactions`

**Created**: 2026-08-19

**Status**: Draft

**Input**: User description: "US-3.4: Calendar Interactions for Coachees (COACHER-24) — As a Coachee, I want to interact with classes directly from the calendar — joining, canceling, and waitlisting — so that I can manage everything from one view. Backend is done and tested; only the frontend calendar-interaction UX remains: render gray 'Busy' classes, tap-to-detail modals with confirmation dialogs for blue (cancel), green (join), and gray (waitlist) entries, optimistic calendar updates with rollback on error, and error feedback in all new modal flows. A coachee should not see any busy block from any class that is not relevant or related to the same coachee."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See your full week, including busy slots (Priority: P1)

A Coachee opens the Calendar tab and sees the full 1-week view with every entry color-coded: **blue** for their own enrolled classes, **green** for group classes they can join right now, and **gray** for busy entries that are relevant to them — full group classes within their reach (waitlist-eligible) — rendered as informational "Busy" blocks that carry no private details of other Coachees. Classes not relevant or related to the Coachee (occupied individual slots and out-of-reach group classes) never appear as busy blocks. Canceled classes appear as informational entries with no action. The calendar is the single place where the Coachee can see both their own schedule and the busy slots they could act on.

**Why this priority**: Showing the relevant busy slots is the foundation of the story — a coachee cannot make decisions about joining or waitlisting a slot they cannot see. Busy slots shown are limited to those the Coachee can actually act on (waitlist-eligible full groups within reach), so the calendar stays a truthful, relevant map of the week without cluttering it with classes unrelated to the Coachee.

**Independent Test**: Can be fully tested by a Coachee with a mix of blue, green, gray, and canceled entries verifying every entry renders with the correct color, gray entries show no other Coachee's details, classes not relevant to the Coachee never render as busy blocks, and canceled entries offer no action — it delivers a truthful, relevant week view on its own.

**Acceptance Scenarios**:

1. **Given** a Coachee viewing the calendar for a week, **When** the week renders, **Then** every enrolled class is shown in blue, every joinable group class in green, and every busy entry relevant to them (a full group class within their reach) in gray; occupied individual slots and out-of-reach group classes are not shown at all.
2. **Given** classes that are not relevant or related to the Coachee (an occupied individual slot or an out-of-reach group class), **When** the calendar renders, **Then** no busy block appears for those classes.
3. **Given** a canceled class, **When** it renders, **Then** it is shown as informational with no action offered.
4. **Given** a week with no classes, **When** the calendar renders, **Then** a clear empty state is shown rather than a blank grid.

---

### User Story 2 - Manage your own classes from the calendar (Priority: P1)

A Coachee taps a blue entry (one of their own classes) and sees a detail modal with the class type, time, level, and Coach. From that modal they can choose to cancel their enrollment; the action requires an explicit confirmation dialog before anything changes. After a confirmed cancel, the calendar updates immediately to reflect the new state (the class is no longer blue for them), and if the action fails the calendar returns to its previous state with a clear, friendly error message.

**Why this priority**: Canceling an enrollment is the highest-stakes single action a Coachee takes from the calendar — it frees a spot they may not get back. Doing it from the calendar with a confirmation is the core "manage my schedule from one view" promise, and the confirmation protects against accidental clicks.

**Independent Test**: Can be fully tested by a Coachee tapping one of their blue entries, viewing its details, confirming a cancel, and verifying the calendar updates immediately and rolls back cleanly when the cancel fails — it delivers self-service cancellation on its own.

**Acceptance Scenarios**:

1. **Given** a blue calendar entry, **When** the Coachee taps it, **Then** a detail modal opens showing the class type, time, level, and Coach.
2. **Given** the open detail modal for a blue entry, **When** the Coachee chooses to cancel, **Then** a confirmation dialog asks them to confirm before any change is made.
3. **Given** a confirmed cancel that succeeds, **When** the action completes, **Then** the calendar reflects immediately that the Coachee is no longer enrolled (the entry is no longer blue), and the Coachee receives confirmation.
4. **Given** a confirmed cancel that fails on the server, **When** the action fails, **Then** the calendar returns to its pre-action state and a clear, friendly error message explains the failure without exposing internal details.
5. **Given** the confirmation dialog, **When** the Coachee dismisses or cancels it, **Then** no change is made and the calendar state is unchanged.

---

### User Story 3 - Join a class from the calendar (Priority: P1)

A Coachee taps a green entry (a group class they can join) and sees a detail modal with the level, the Coach, and the number of spots available. They choose to join; the action requires an explicit confirmation dialog before anything changes. After a confirmed join, the calendar updates immediately (the entry turns blue), and if the action fails the calendar returns to its previous state with a clear, friendly error message.

**Why this priority**: Joining directly from the calendar is the story's other core promise — the Coachee sees a spot and takes it without leaving the calendar, which closes the loop on discovery ("I see it" → "I take it") in one place.

**Independent Test**: Can be fully tested by a Coachee tapping a green entry, seeing its level, Coach, and open spots, confirming a join, and verifying the calendar updates immediately and rolls back cleanly when the join fails — it delivers self-service joining on its own.

**Acceptance Scenarios**:

1. **Given** a green calendar entry, **When** the Coachee taps it, **Then** a detail modal opens showing the class level, the Coach, and the spots available.
2. **Given** the open detail modal for a green entry, **When** the Coachee chooses to join, **Then** a confirmation dialog asks them to confirm before any change is made.
3. **Given** a confirmed join that succeeds, **When** the action completes, **Then** the calendar reflects immediately that the Coachee is now enrolled (the entry turns blue), and the Coachee receives confirmation.
4. **Given** a confirmed join that fails on the server (for example, the last spot was taken meanwhile), **When** the action fails, **Then** the calendar returns to its pre-action state and a clear, friendly error message explains the failure without exposing internal details.
5. **Given** the confirmation dialog, **When** the Coachee dismisses or cancels it, **Then** no change is made and the calendar state is unchanged.

---

### User Story 4 - Join or leave a waiting list from a busy slot (Priority: P1)

- A Coachee taps a gray "Busy" entry that is waitlist-eligible — a full group class within their reach — and sees a dialog with the class details (time, type, level, Coach). From that dialog they can join the waiting list for that slot, behind an explicit confirmation. If they are already on that slot's waiting list, the dialog offers "Leave waiting list" instead. A gray busy block never appears for a class that is not relevant or related to the Coachee, so the "Busy" tap always has a real waitlist option; if the server's own eligibility decision ever rejects an action, it is surfaced as a clear message. After a confirmed join or leave, the calendar updates immediately, and if the action fails the calendar returns to its previous state with a clear, friendly error message.

**Why this priority**: Busy slots are the gym's scarcest time; the waiting list is the only way a Coachee can express interest in them, and the calendar is where they encounter them. Offering the waitlist exactly where it applies — and only there — is the story's final interaction and the one that makes the gray blocks actionable.

**Independent Test**: Can be fully tested by a Coachee tapping waitlist-eligible gray entries (a full group within reach and an occupied individual slot), confirming a waitlist join and seeing it reflected, then leaving the list, and by tapping a non-eligible gray entry and verifying no waitlist option is offered — it delivers self-service waitlisting from the calendar on its own.

**Acceptance Scenarios**:

1. **Given** a gray entry that is waitlist-eligible (a full group class within reach), **When** the Coachee taps it, **Then** a dialog opens showing the class time, type, level, and Coach with a join-waiting-list option.
2. **Given** the waitlist dialog, **When** the Coachee chooses to join the waiting list, **Then** a confirmation dialog asks them to confirm, showing the class details, before any change is made.
3. **Given** a confirmed waitlist join that succeeds, **When** the action completes, **Then** the calendar reflects immediately that the Coachee is on the waiting list for that slot, and the Coachee receives confirmation.
4. **Given** a gray entry whose waiting list the Coachee is already on, **When** they tap it, **Then** the dialog offers "Leave waiting list", and a confirmed leave removes the Coachee from the list and updates the calendar immediately.
5. **Given** a full group class within reach (waitlist-eligible), **When** the Coachee sees the calendar, **Then** it renders as a gray busy entry; occupied individual slots and out-of-reach group classes never render as busy blocks.
6. **Given** a confirmed waitlist join or leave that fails on the server, **When** the action fails, **Then** the calendar returns to its pre-action state and a clear, friendly error message explains the failure without exposing internal details.
7. **Given** the confirmation dialog, **When** the Coachee dismisses or cancels it, **Then** no change is made and the calendar state is unchanged.

---

### User Story 5 - Every calendar action is immediate and trustworthy (Priority: P2)

Whatever the Coachee does from the calendar — join, cancel, waitlist join, or waitlist leave — the calendar responds instantly: the affected entry changes color/state right away (blue ↔ green/gray, waiting-list state on/off), before the server confirms. If the server later rejects the action, the calendar automatically reverts to what it showed before, and a friendly error message explains what happened. Every action in the calendar is guarded by a confirmation dialog, so no change ever happens from a single accidental tap, and no action ever leaves the calendar in a half-updated, inconsistent state.

**Why this priority**: Immediacy plus safety is what makes the calendar feel alive and trustworthy — the Coachee sees their schedule change as they act, and the confirmation step protects them from mistakes. It ranks below the three concrete interactions because it is the behavior that wraps all of them, but it is required for the feature to feel complete and correct.

**Independent Test**: Can be fully tested by performing each calendar action (join, cancel, waitlist join, waitlist leave), verifying an immediate state change on the calendar, a confirmation dialog on every action, and a clean revert plus friendly error when the action is made to fail — it delivers instant, safe, consistent interactions on its own.

**Acceptance Scenarios**:

1. **Given** a Coachee initiating any calendar action, **When** the action is confirmed, **Then** the calendar reflects the new state immediately rather than waiting for the server.
2. **Given** any calendar action that fails on the server, **When** the failure is known, **Then** the calendar reverts to its exact pre-action state and a clear, friendly error message is shown.
3. **Given** any of the four calendar actions (join, cancel, waitlist join, waitlist leave), **When** the Coachee initiates it, **Then** a confirmation dialog is always required before the change executes.
4. **Given** a calendar action in flight, **When** the Coachee triggers a second action on the same entry, **Then** the system prevents conflicting double-actions and keeps the calendar consistent.
5. **Given** a successfully completed action, **When** the underlying schedule is refreshed, **Then** the refreshed data matches the state the calendar already showed.

---

### Edge Cases

- What happens when a Coachee taps a green class and the last spot is taken by someone else in the moment they confirm? The join is refused by the server, the calendar reverts to the pre-action (green) state, and a clear message explains the class filled up.
- What happens when a Coachee taps a busy slot that is not waitlist-eligible? This cannot happen in the calendar, because busy blocks only render for waitlist-eligible full group classes within reach; if the server's eligibility decision still rejects an action, its message is surfaced verbatim as the error.
- What happens when the Coachee is already on the waiting list and taps the same busy slot again? The dialog offers "Leave waiting list" instead of a join.
- What happens when the authenticated session expires while the Coachee is mid-action? The action is refused, no data changes, the calendar stays in its last known-good state, and the Coachee is asked to sign in again.
- What happens when a class the Coachee is enrolled in is canceled by a Coach? After a refresh, the entry no longer shows as blue; it renders as an informational canceled entry with no action.
- What happens when the Coachee's level changes while they view the calendar? Colors reflect reach at render/refresh time; a class that was green may become gray, and an enrolled class stays blue regardless of reach.
- What happens when the calendar is refreshed while an action is in flight? The refreshed data and the immediately-shown state converge on the server's truth; a failed action still reverts to the state the server reports.
- What happens if the same entry is tapped twice quickly? The second tap is ignored while the first action is in flight, preventing duplicate enrollments or duplicate waiting-list entries.
- What happens when the calendar entry has incomplete data (for example, a level is missing for an individual class)? The modal shows only the details that exist; the action still works.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render every class in the Coachee's 1-week calendar with its correct color: blue for enrolled classes, green for joinable group classes (within reach, open spot, not enrolled), and gray for busy entries relevant to the Coachee (full group classes within reach).
- **FR-002**: System MUST NOT render busy blocks for classes not relevant or related to the Coachee (occupied individual slots and out-of-reach group classes).
- **FR-003**: System MUST render canceled classes as informational entries with no action offered.
- **FR-004**: System MUST show a clear empty state when the calendar week has no classes.
- **FR-005**: System MUST open a class-detail modal when a Coachee taps a blue entry, showing the class type, time, level, and Coach, with a cancellation option.
- **FR-006**: System MUST open a class-detail modal when a Coachee taps a green entry, showing the class level, the Coach, and the spots available, with a join option.
- **FR-007**: System MUST open a waiting-list dialog when a Coachee taps a waitlist-eligible gray entry (a full group class within reach), showing the class time, type, level, and Coach, with a join-waiting-list option.
- **FR-008**: System MUST offer "Leave waiting list" instead of join when the Coachee is already on the tapped slot's waiting list.
- **FR-009**: System MUST NOT render busy blocks for classes that are not waitlist-eligible (occupied individual slots and out-of-reach group classes); if the server's eligibility decision is ever reached (for example, the class fills up between render and confirm), its rejection message MUST be surfaced as a clear, user-friendly error.
- **FR-010**: System MUST require an explicit confirmation dialog before executing any of the four calendar actions: join, cancel enrollment, join waiting list, and leave waiting list.
- **FR-011**: System MUST NOT change any data when a confirmation dialog is dismissed or canceled.
- **FR-012**: System MUST update the calendar to the expected new state immediately upon a confirmed action, before the server responds.
- **FR-013**: System MUST revert the calendar to its exact pre-action state when a confirmed action fails on the server, and MUST show a clear, friendly error message without exposing internal details.
- **FR-014**: System MUST prevent duplicate or conflicting actions on the same calendar entry while an action on it is in flight.
- **FR-015**: System MUST keep the calendar's immediately-shown state and the server-confirmed state consistent after the action completes or after a refresh.
- **FR-016**: System MUST refuse any calendar action when the authenticated session is invalid or expired, MUST NOT alter any data, and MUST ask the Coachee to sign in again.
- **FR-017**: System MUST complete all four calendar actions (join, cancel, waitlist join, waitlist leave) entirely within the calendar view, with no requirement to navigate to Home or any other screen.
- **FR-018**: System MUST surface server rejection messages (for example, waitlist-eligibility, class-full, already-enrolled, already-on-waiting-list) as clear, user-friendly feedback in the relevant modal flow, matching the specific reason without exposing internal details.

### Key Entities *(include if feature involves data)*

- **Class (reused)**: A single 60-minute training session (individual or group) with a start time, type, level, Coach, status, and — for group classes — an enrollment count and capacity; its type, level, fullness, occupancy, and the Coachee's relation to it determine the blue/green/gray classification of the calendar entry.
- **Class Enrollment (reused)**: The record linking one Coachee to one class; its presence or absence decides whether an entry is blue (enrolled) or joinable, and is the target of the cancel action.
- **Waiting List Entry (reused)**: The record of a Coachee on a class's waiting list; its presence decides whether a gray slot offers "Join waiting list" or "Leave waiting list".
- **Coachee (reused)**: The user role performing the calendar interactions, identified from the authenticated session; their level determines reach (±1), which decides green vs. gray and waitlist eligibility.
- **Level (reused)**: The difficulty tier of a Coachee and of group classes; the basis of the reach rule behind green vs. gray and waitlist eligibility.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A Coachee can join, cancel, join a waiting list, or leave a waiting list entirely from the calendar view in under 1 minute per action, with no navigation to Home or any other screen.
- **SC-002**: 100% of calendar actions require an explicit confirmation dialog before any change executes, and 100% of dismissed dialogs result in zero data change.
- **SC-003**: 100% of confirmed calendar actions that succeed are reflected immediately on the calendar, and 100% of actions that fail on the server revert the calendar to its exact pre-action state with a clear, friendly error message.
- **SC-004**: 100% of calendar entries render with the correct color (blue = enrolled, green = joinable, gray = busy), no gray entry ever exposes another Coachee's private details, and no busy block appears for classes not relevant or related to the Coachee.
- **SC-005**: 100% of waitlist-eligible gray slots offer the waitlist option with class details shown for confirmation, and 100% of non-eligible gray slots offer no waitlist option and instead show a clear message.
- **SC-006**: A Coachee already on a slot's waiting list sees "Leave waiting list" instead of a join option 100% of the time they tap that slot.
- **SC-007**: 100% of expired or invalid sessions during a calendar action refuse the action, change no data, and leave the calendar in its last known-good state.
- **SC-008**: After any calendar action, the calendar's displayed state matches the server's refreshed state 100% of the time.

## Assumptions

- The server-side capabilities this feature builds on — enrollment join/cancel, waiting-list join/leave, class visibility (blue/green/gray), waiting-list eligibility policy, and the data returned per class (type, time, level, Coach, enrollment count, capacity, waiting-list status) — are complete and tested; this feature delivers the calendar-side interaction experience that uses them.
- The blue/green/gray classification and the waiting-list eligibility rules follow the established scheduling rules (PRD Section 5) and the waiting-list eligibility policy: gray busy slots are waitlist-eligible when they are full group classes within reach; classes outside the Coachee's reach, and occupied individual slots, are never rendered as busy blocks because they are not relevant or related to the Coachee.
- The calendar renders a gray busy block only when the class is relevant to the Coachee: a group class within ±1 level of the Coachee's level (waitlist-eligible, `isWithinReach` on the detail). Occupied individual slots and out-of-reach group classes are filtered out of the calendar view entirely.
- The calendar keeps the existing day-strip + card list layout; migrating it to a time-grid is out of scope for this feature.
- A gray busy entry for an occupied individual slot belongs to another Coachee; the entry never reveals that Coachee's identity or other private details.
- Every calendar action is initiated by tapping an entry within the calendar view; no duplicate Home-based controls are required by this feature, though actions triggered elsewhere must produce the same server-side outcome.
- "Immediately" for calendar updates means the calendar reflects the expected new state without waiting for the server round-trip; the source of truth for the final state is the server, and any divergence is resolved by revert-on-error and by the next refresh.
- Error messages reuse the existing user-facing message maps (enrollment and waiting-list reasons) so that each failure shows a specific, understandable reason.
- The immediately-reflecting and rollback behavior is scoped to calendar actions performed within this calendar view; other views (Home, waiting lists) reflect changes on their next load or refresh.
