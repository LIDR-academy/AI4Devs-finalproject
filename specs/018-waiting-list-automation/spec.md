# Feature Specification: Waiting List Automation

**Feature Branch**: `018-waiting-list-automation`

**Created**: 2026-08-24

**Status**: Draft

**Input**: User description: "US-4.2: Waiting List Automation (COACHER-26) — As a system, I want waiting lists to be automatically processed when a spot opens, so that waitlisted Coachees are notified and the spot is claimed."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - All waitlisted Coachees are notified when a spot opens (Priority: P1)

When an enrolled Coachee cancels their attendance (or an enrollment is removed by other means) and the class has a waiting list, the system automatically notifies every Coachee on that waiting list simultaneously. The notification informs each waitlisted Coachee that a spot has opened in a specific class, that it is available on a first-come-first-served basis with no hold time, and that they should act quickly to claim it. The notification includes the class type, date/time, level, and assigned Coach. If a Coachee has no registered devices, the notification record is still created and persisted but delivery is skipped (consistent with the push notification infrastructure from US-4.1).

**Why this priority**: Notifying all waitlisted Coachees at once is the fundamental trigger that makes the waiting list work as a first-come-first-served mechanism. Without simultaneous notification, the system cannot guarantee fairness — some Coachees would learn about the spot later than others, breaking the equal-opportunity design.

**Independent Test**: Can be fully tested by enrolling a Coachee in a group class, adding two Coachees to the waiting list, canceling the first Coachee's enrollment, and verifying both waitlisted Coachees receive a notification identifying the class — it delivers the core trigger-and-notify behavior on its own.

**Acceptance Scenarios**:

1. **Given** a Coachee enrolled in a group class, **When** that Coachee cancels their enrollment, **Then** every Coachee on the class's waiting list receives a notification simultaneously that a spot has opened, identifying the class type, date/time, level, and assigned Coach.
2. **Given** a class with a waiting list containing Coachee A and Coachee B, **When** the enrolled Coachee cancels, **Then** both Coachee A and Coachee B receive the notification at the same time (no sequential delay between recipients).
3. **Given** a class with a waiting list, **When** the enrolled Coachee cancels, **Then** the notification is persisted with its type, recipient, and unread status before any delivery attempt is made (consistent with the notification infrastructure).
4. **Given** a waitlisted Coachee with no registered push devices, **When** the notification is dispatched, **Then** the notification record is created and persisted, delivery is logged as having no device, and no error is raised to the cancellation operation.
5. **Given** a class with a waiting list, **When** the cancellation opens a spot, **Then** the notification clearly communicates that the spot is first-come-first-served with no hold time, so the Coachee understands they must act immediately.
6. **Given** the waitlisted Coachee receiving the notification, **When** they tap or activate it, **Then** they are taken to the class detail or the class list where they can claim the spot.

---

### User Story 2 - The Coach receives notification when a spot opens (with or without waiting list) (Priority: P1)

When a Coachee cancels enrollment from a group class, the assigned Coach receives a notification. If the class has a waiting list, the Coach is notified that a spot opened and that waitlisted Coachees have been notified to claim it (notification #4). If the class has no waiting list, the Coach is notified that a spot is now available (notification #5). Notifications #4 and #5 are mutually exclusive — the Coach receives exactly one, never both, never neither (for a group-class cancellation).

**Why this priority**: The Coach needs to know when a spot opens so they can adjust their preparation — the notification content differs depending on whether there is a waiting list mechanism actively managing the spot. This is essential for the Coach's awareness of class attendance dynamics.

**Independent Test**: Can be fully tested by enrolling a Coachee in a Coach's group class (one with a waiting list, one without), canceling each, and verifying the Coach receives exactly one distinct notification per cancellation — it delivers Coach awareness of spot openings on its own.

**Acceptance Scenarios**:

1. **Given** a group class with a waiting list, **When** a Coachee cancels enrollment, **Then** the assigned Coach receives a notification stating that a spot has opened and waitlisted Coachees have been notified to claim it.
2. **Given** a group class with no waiting list, **When** a Coachee cancels enrollment, **Then** the assigned Coach receives a notification stating that a spot is now available.
3. **Given** a group-class cancellation, **When** the notification logic executes, **Then** the Coach receives exactly one notification — either the "waiting-list notified" variant or the "spot available" variant, never both, never zero.
4. **Given** a group-class cancellation, **When** the Coach has no registered devices, **Then** the notification record is still persisted and no error is raised to the cancellation operation.
5. **Given** a Coach's notification about a spot opening, **When** they tap or activate it, **Then** they are taken to the class detail or the class list where they can see the current state of the class.

---

### User Story 3 - A waitlisted Coachee claims the opened spot (Priority: P1)

When a waitlisted Coachee responds to the "spot opened" notification (or otherwise attempts to claim the spot), the system processes the claim on a first-come-first-served basis. The first Coachee to successfully claim the spot is enrolled in the class, their waiting-list entry is removed, and the Coach receives a notification that a waitlisted Coachee has claimed the spot. All other waitlisted Coachees who respond after the spot is taken are informed that the spot is no longer available and receive no enrollment. There is no hold time — the spot is available until claimed by the first responder.

**Why this priority**: Claiming the spot is the payoff of the waiting-list mechanism. Without it, the notification is informational only and the Coachee must navigate the general join flow (which would already work if the class is no longer full), but the first-come-first-served claim with Coach notification is the waiting-list-specific behavior that closes the loop.

**Independent Test**: Can be fully tested by opening a spot in a class with a waiting list, having two waitlisted Coachees attempt to claim it simultaneously, and verifying exactly one succeeds, both receive appropriate feedback, and the Coach is notified — it delivers the first-come-first-served claim behavior on its own.

**Acceptance Scenarios**:

1. **Given** a spot that has opened in a class with a waiting list, **When** a waitlisted Coachee claims the spot, **Then** they are enrolled in the class, their waiting-list entry is removed, and they receive confirmation identifying the class.
2. **Given** a spot that has opened, **When** two waitlisted Coachees attempt to claim it simultaneously, **Then** exactly one is enrolled and the other is informed the spot is no longer available, with no duplicate enrollment created.
3. **Given** a waitlisted Coachee who claims the spot, **When** the claim succeeds, **Then** the assigned Coach receives a notification that a waitlisted Coachee has claimed the spot (notification #6).
4. **Given** a spot that has already been claimed, **When** another waitlisted Coachee attempts to claim it, **Then** the attempt is refused with a clear message that the spot is no longer available, and the waiting-list entry remains until the Coachee chooses to leave or the class fills.
5. **Given** a waitlisted Coachee who claims the spot, **When** the claim succeeds, **Then** the class enrollment count increases by one and the waiting-list membership count decreases by one.
6. **Given** a waitlisted Coachee who claims the spot, **When** the claim succeeds, **Then** the Coachee receives confirmation on join (notification #9) and no penalty or fee is applied.
7. **Given** a waitlisted Coachee who leaves the waiting list, **When** the leave completes, **Then** the Coachee receives confirmation on leave (notification #10) and no other party is notified.
8. **Given** a waitlisted Coachee whose session expires while attempting to claim, **When** the claim is submitted, **Then** the claim is refused with an authentication error, no enrollment is created, and the Coachee is asked to sign in again.

---

### User Story 4 - Automatic processing after cancellation is safe and auditable (Priority: P2)

Every automatic waiting-list action — notification dispatch, spot claim, enrollment creation, and waiting-list entry removal — is recorded with the acting user (or system), the class, the action, and the outcome for audit purposes. If a notification delivery fails, the failure is logged without raising an error to the cancellation operation. The system is resilient to edge cases: a cancellation on a class whose waiting list was emptied between the check and the action still completes cleanly; a class that was canceled after a spot opened but before a claim still refuses the claim with a clear message.

**Why this priority**: The automation operates without direct user oversight — it triggers on cancellations and processes claims in the background. Auditability and resilience are what make it safe to run automatically in production.

**Independent Test**: Can be fully tested by triggering a cancellation on a class with a waiting list, verifying audit records exist for every notification and claim action, and by forcing delivery failures and edge conditions to verify graceful handling — it delivers safe, auditable automation on its own.

**Acceptance Scenarios**:

1. **Given** a cancellation that triggers waiting-list processing, **When** processing completes, **Then** an audit record exists for each notification dispatched (recipient, class, action, outcome) and for each claim attempt.
2. **Given** a notification delivery that fails, **When** the failure occurs, **Then** a log entry records the recipient, notification type, and cause, and no error propagates to the cancellation operation.
3. **Given** a class whose waiting list is emptied between the cancellation and the notification dispatch, **When** the dispatch runs, **Then** no notifications are sent, the spot is simply freed, and the Coach receives the "no waiting list" notification variant.
4. **Given** a class that is canceled after a spot opened but before a waitlisted Coachee claims it, **When** the claim is attempted, **Then** the claim is refused with a clear message that the class is canceled, and no enrollment is created.
5. **Given** a cancellation operation, **When** the waiting-list processing completes (including notification dispatch), **Then** the cancellation response to the acting Coachee shows no error related to notifications and completes within a negligible overhead of the normal cancellation time.

---

### Edge Cases

- What happens when a Coachee cancels and the class has a waiting list with 0 members? The spot is freed, the Coach receives notification #5 (no waiting list variant is functionally equivalent — no notifications dispatched to waitlisted Coachees), and no processing occurs beyond the spot being freed.
- What happens when two Coachees cancel from the same class simultaneously, and there is one person on the waiting list? Both spots open; the single waitlisted Coachee receives one notification and can claim one spot. The second spot remains available for general join.
- What happens when a Coachee on the waiting list also cancels their own enrollment from a different class at the same moment? Each class's waiting-list processing operates independently; no cross-class interaction occurs.
- What happens when the class capacity changes (e.g., increased by an Admin) while waiting-list processing is in flight? The processing operates on the class state at the moment of the cancellation; subsequent capacity changes are independent.
- What happens when the same Coachee is on the waiting list twice (which should be impossible per 013's uniqueness rule)? The system enforces at most one entry per Coachee per class waiting list at join time; this scenario cannot occur.
- What happens when a push notification fails for all waitlisted Coachees simultaneously (provider outage)? All notification records are persisted, all deliveries are logged as failed, the spot remains open, and the cancellation completes successfully. The Coach also receives their notification (which may also fail delivery, logged the same way).
- What happens when a waitlisted Coachee claims a spot in a class that has since been canceled? The claim is refused with a clear "class canceled" message, no enrollment is created, and the waiting-list entry remains (the Coachee can leave it at their leisure).
- What happens when the authenticated session expires while a Coachee is claiming a spot? The claim is refused with an authentication error, no enrollment or waiting-list change occurs, and the Coachee is asked to sign in again.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST automatically trigger waiting-list processing when a Coachee's enrollment is canceled from a class that has a waiting list with at least one member.
- **FR-002**: System MUST dispatch a "spot opened" notification to every Coachee on the waiting list simultaneously (all recipients notified in the same processing pass, no sequential delay that advantages earlier recipients).
- **FR-003**: The "spot opened" notification MUST identify the class type, date/time, level, and assigned Coach, and MUST communicate that the spot is first-come-first-served with no hold time.
- **FR-004**: System MUST assign the Coach exactly one notification when a Coachee cancels from a group class: notification #4 ("spot opened, waitlisted Coachees notified") if the class has a waiting list, or notification #5 ("spot available") if it does not — these MUST be mutually exclusive.
- **FR-005**: System MUST allow a waitlisted Coachee to claim an opened spot on a first-come-first-served basis with no hold time; exactly one claimant is enrolled when contention exists.
- **FR-006**: System MUST remove the claimant's waiting-list entry upon successful claim and MUST increase the class enrollment count by one.
- **FR-007**: System MUST notify the assigned Coach (notification #6) when a waitlisted Coachee successfully claims a spot.
- **FR-008**: System MUST inform a waitlisted Coachee who attempts to claim a spot that has already been taken with a clear "spot no longer available" message, and MUST NOT create a duplicate enrollment.
- **FR-009**: System MUST confirm the claiming Coachee on join (notification #9) with no penalty or fee when the claim succeeds.
- **FR-010**: System MUST confirm the Coachee on leave (notification #10) when they leave a waiting list, with no other party notified.
- **FR-011**: System MUST persist every notification before attempting delivery, with its type, recipient, and unread status, consistent with the notification infrastructure from US-4.1.
- **FR-012**: System MUST log all notification delivery failures (recipient, type, cause) without raising errors to the triggering cancellation or claim operation.
- **FR-013**: System MUST record every automatic waiting-list action (notification dispatch, spot claim, enrollment creation, entry removal) with the acting user or system, the class, the action, and the outcome for audit purposes.
- **FR-014**: System MUST refuse a spot claim when the class has been canceled, with a clear message and no enrollment created.
- **FR-015**: System MUST refuse a spot claim when the authenticated session is invalid or expired, with no enrollment or waiting-list change and a request to sign in again.
- **FR-016**: System MUST complete the cancellation operation successfully regardless of notification delivery outcome; notification failures MUST NOT cause the cancellation to fail or delay its response.
- **FR-017**: System MUST handle the edge case where a waiting list is emptied between the cancellation check and the notification dispatch by simply freeing the spot and notifying the Coach with the "no waiting list" variant.
- **FR-018**: System MUST NOT process waiting-list automation for canceled classes; a cancellation of an enrollment in an already-canceled class MUST be refused.
- **FR-019**: System MUST ensure that a single class cancellation with a waiting list produces exactly one notification to the Coach (either #4 or #5), even when multiple spots open simultaneously.
- **FR-020**: System MUST NOT limit the number of waitlisted Coachees notified simultaneously (the 4-member cap from 013 applies at join time; processing dispatches to all current members regardless of count).

### Key Entities *(include if feature involves data)*

- **Class (reused)**: A single 60-minute training session (individual or group) assigned to one Coach, with a level, a start time, a status of "Active" or "Canceled", and — for group classes — a capacity of 4. Its waiting list and enrollment state trigger and gate the automation.
- **Class Enrollment (reused)**: The record linking one Coachee to one class occurrence; its removal by cancellation is the trigger for waiting-list processing. A new enrollment is created when a waitlisted Coachee claims a spot.
- **Waiting List Entry (reused)**: The record linking one Coachee to a class waiting list, capped at 4 entries and carrying no position. It is removed upon claim or voluntary leave; its existence triggers notification dispatch on spot opening.
- **Notification (reused from US-4.1)**: One alert addressed to one recipient — its type, recipient, content, and read status. Waiting-list automation produces notifications of specific types (#1, #4, #5, #6, #9, #10) to specific recipients.
- **Coachee (reused)**: The user role that is waitlisted, claims spots, and cancels enrollments; identified from the authenticated session for claim actions.
- **Coach (reused)**: The user role assigned to a group class; receives notifications (#4, #5, or #6) about spot openings and claims.
- **ProcessWaitingListService (new domain service)**: The domain-layer orchestrator that handles the waiting-list processing workflow — detecting a spot opening, dispatching notifications, and processing claims. It depends on the domain ports for class/enrollment/waiting-list persistence and notification dispatch, with no infrastructure dependencies.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When a Coachee cancels from a group class with a waiting list, 100% of waitlisted Coachees receive the "spot opened" notification simultaneously (within the same processing pass).
- **SC-002**: 100% of group-class cancellations produce exactly one Coach notification — either #4 (waiting list exists) or #5 (no waiting list) — never both, never zero.
- **SC-003**: When two or more waitlisted Coachees claim a spot simultaneously, exactly one is enrolled and all others receive a clear "spot no longer available" message, with zero duplicate enrollments.
- **SC-004**: A waitlisted Coachee can claim an opened spot in under 1 minute from receiving the notification, and sees immediate confirmation upon successful claim.
- **SC-005**: 100% of notification delivery failures are logged with recipient, type, and cause, while 100% of triggering cancellation or claim operations complete with their normal successful response.
- **SC-006**: 100% of automatic waiting-list actions (notification dispatch, spot claim, enrollment creation, entry removal) are recorded with actor, class, action, and outcome for audit purposes.
- **SC-007**: 100% of spot-claim attempts on canceled classes or with expired sessions are refused with a clear message and zero data changes.
- **SC-008**: The cancellation response time for a class with a waiting list does not exceed the normal cancellation response time by more than a negligible overhead under normal conditions.

## Assumptions

- The waiting-list infrastructure from US-3.3 (join/leave/view) and US-3.4 (eligibility discovery) is complete and tested; this feature builds the automatic processing that fires when spots open.
- The push notification infrastructure from US-4.1 (FCM delivery, device registration, notification persistence) is complete and tested; this feature produces notification payloads and relies on US-4.1 for delivery.
- "Simultaneous" notification means all waitlisted Coachees are notified in the same processing pass — there is no intentional sequential delay. In practice, push delivery latency may vary by device, but the system dispatches to all recipients at once.
- First-come-first-served means the first successful claim (server-received and processed) wins; there is no hold time, no queue priority, and no position-based advantage.
- Notification types #4, #5, #6, #9, and #10 follow the numbering from the source issue COACHER-26; the exact notification content (title, body wording) is finalized during implementation but must convey the semantics described in the acceptance scenarios.
- A single class cancellation with a waiting list containing N members produces N notifications to waitlisted Coachees plus 1 notification to the Coach (#4), totaling N+1 notifications dispatched. If N=0, only the Coach notification (#5) is dispatched.
- Individual class cancellations do not trigger waiting-list processing in the same way; individual-class waiting lists are out of scope for this automation (per 013, individual waiting lists exist but the automatic processing behavior for individual slots is not specified in this issue).
- The `ProcessWaitingListService` lives in the domain layer (per Hexagonal Architecture) and depends only on domain ports, not on infrastructure adapters. The concrete persistence and notification adapters are injected through the DI container.
- Edge cases involving simultaneous cancellations from the same class are handled safely: each cancellation triggers its own processing pass, and the system state (enrollment count, waiting-list membership) is consistent at the start of each pass.
