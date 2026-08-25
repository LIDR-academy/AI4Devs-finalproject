# Feature Specification: Class Lifecycle Notifications

**Feature Branch**: `019-class-lifecycle-notifications`

**Created**: 2026-08-24

**Status**: Draft

**Input**: User description: "US-4.3: Class Lifecycle Notifications (COACHER-27) — As a user, I want to be notified about class creation, assignment, and cancellation events, so that I stay informed about schedule changes."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Eligible Coachees are notified when a new group class is created within their reach (Priority: P1)

When an Admin or Coach creates a new group class that has open spots and falls within the level reach of existing Coachees, those eligible Coachees receive a notification (notification #2). The notification identifies the class type, date/time, level, and assigned Coach, and communicates that spots are available. The notification is delivered both as a push notification (FCM) and stored in-app. Coachees who are not eligible (level out of reach) or who have no registered devices still have the notification skipped gracefully — the class creation operation is never delayed or failed by notification delivery.

**Why this priority**: This is the primary discovery mechanism for Coachees to learn about new classes they can join. Without it, Coachees must manually check the schedule, reducing engagement and class utilization.

**Independent Test**: Can be fully tested by creating a new group class at a level within reach of existing Coachees, verifying eligible Coachees receive notification #2 with class details, and verifying non-eligible Coachees do not receive it — it delivers the core class-discovery notification on its own.

**Acceptance Scenarios**:

1. **Given** a Coachee whose level is within reach of a new group class being created, **When** the class is created with open spots, **Then** the Coachee receives notification #2 identifying the class type, date/time, level, and assigned Coach.
2. **Given** multiple Coachees with levels within reach, **When** a new group class is created, **Then** all eligible Coachees receive notification #2 simultaneously.
3. **Given** a Coachee whose level is NOT within reach of the new class, **When** the class is created, **Then** the Coachee does NOT receive notification #2.
4. **Given** a new group class created at full capacity (no open spots), **When** the class is created, **Then** no Coachees receive notification #2 (the class is not joinable).
5. **Given** an eligible Coachee with no registered push devices, **When** the class is created, **Then** the notification record is still persisted in-app, delivery is logged as having no device, and no error is raised to the class creation operation.
6. **Given** an eligible Coachee who receives notification #2, **When** they tap or activate it, **Then** they are taken to the class detail or class list where they can join the class.

---

### User Story 2 - The assigned Coach is notified when an individual class is assigned to a Coachee (Priority: P1)

When an Admin assigns an individual class to a Coachee (or a Coachee books an individual slot), the assigned Coach receives notification #8. The notification identifies the class type, date/time, level, and the Coachee's name. The notification is delivered both as push (FCM) and stored in-app. If the Coach has no registered devices, the notification is persisted but delivery is skipped.

**Why this priority**: The Coach needs to know when individual sessions are booked so they can prepare for the specific Coachee and level. This is essential for the Coach's schedule awareness.

**Independent Test**: Can be fully tested by assigning an individual class to a Coachee, verifying the assigned Coach receives notification #8 with class and Coachee details — it delivers the Coach-awareness notification on its own.

**Acceptance Scenarios**:

1. **Given** an individual class assigned to a Coachee, **When** the assignment completes, **Then** the assigned Coach receives notification #8 identifying the class type, date/time, level, and the Coachee's name.
2. **Given** an individual class assigned to a Coachee, **When** the Coach has no registered devices, **Then** the notification record is persisted, delivery is logged as having no device, and no error is raised to the assignment operation.
3. **Given** a Coach who receives notification #8, **When** they tap or activate it, **Then** they are taken to the class detail or class list where they can see the assignment.
4. **Given** an individual class that is reassigned to a different Coachee, **When** the reassignment completes, **Then** the Coach receives notification #8 with the updated Coachee name.

---

### User Story 3 - All enrolled Coachees are notified when the Coach cancels an entire class (Priority: P1)

When the assigned Coach (or an Admin) cancels an entire class (or a recurring series), every Coachee enrolled in that class receives notification #7. The notification identifies the class type, date/time, level, and the cancellation. The notification is delivered both as push (FCM) and stored in-app. If a Coachee has no registered devices, the notification is persisted but delivery is skipped.

**Why this priority**: Enrolled Coachees must know immediately when a class they planned to attend is canceled, so they can adjust their schedule. Delayed notification could cause Coachees to show up for a canceled class.

**Independent Test**: Can be fully tested by canceling a group class with enrolled Coachees, verifying all enrolled Coachees receive notification #7 with class details — it delivers the cancellation-awareness notification on its own.

**Acceptance Scenarios**:

1. **Given** a group class with enrolled Coachees, **When** the Coach cancels the class, **Then** every enrolled Coachee receives notification #7 identifying the class type, date/time, level, and the cancellation.
2. **Given** an individual class assigned to a Coachee, **When** the Coach cancels the class, **Then** the assigned Coachee receives notification #7 identifying the class details and cancellation.
3. **Given** a class with multiple enrolled Coachees, **When** the Coach cancels, **Then** all enrolled Coachees receive notification #7 simultaneously.
4. **Given** a Coachee with no registered devices, **When** the class is canceled, **Then** the notification record is persisted, delivery is logged as having no device, and no error is raised to the cancellation operation.
5. **Given** a Coachee who receives notification #7, **When** they tap or activate it, **Then** they are taken to the class detail or class list where they can see the cancellation status.

---

### User Story 4 - The assigned Coach is notified when assigned to a class they didn't create (Priority: P2)

When an Admin assigns a Coach to a class that the Coach did not create, the Coach receives notification #12. The notification identifies the class type, date/time, level, and communicates that the class has been assigned to them. The notification is delivered both as push (FCM) and stored in-app. If the Coach has no registered devices, the notification is persisted but delivery is skipped.

**Why this priority**: Coaches need to know when classes are assigned to them by Admins so they can prepare and adjust their schedule. This ensures Coaches are aware of their full teaching load.

**Independent Test**: Can be fully tested by having an Admin assign a Coach to a class the Coach didn't create, verifying the Coach receives notification #12 with class details — it delivers the assignment-awareness notification on its own.

**Acceptance Scenarios**:

1. **Given** a class created by someone other than the assigned Coach, **When** an Admin assigns the Coach to the class, **Then** the Coach receives notification #12 identifying the class type, date/time, level, and the assignment.
2. **Given** a Coach assigned to a class they created themselves, **When** the assignment completes, **Then** the Coach does NOT receive notification #12 (they already know about the class).
3. **Given** a Coach with no registered devices, **When** they are assigned to a class they didn't create, **Then** the notification record is persisted, delivery is logged as having no device, and no error is raised to the assignment operation.
4. **Given** a Coach who receives notification #12, **When** they tap or activate it, **Then** they are taken to the class detail or class list where they can see the assignment.

---

### User Story 5 - All notifications include rendered content with relevant details (Priority: P1)

Every class lifecycle notification (#2, #3, #7, #8, #12) includes a rendered content field containing the class details: class type (individual/group), date and time, level name, and assigned Coach name. The content is human-readable and sufficient for the recipient to understand the event without additional context.

**Why this priority**: Notifications without sufficient detail force users to navigate to the class to understand what happened, degrading the notification experience.

**Independent Test**: Can be fully tested by triggering each notification type and verifying the content field contains all required class details — it delivers the content-rendering requirement on its own.

**Acceptance Scenarios**:

1. **Given** any class lifecycle notification, **When** the notification is created, **Then** its content field contains the class type, date/time, level name, and assigned Coach name in a human-readable format.
2. **Given** notification #2 (new class available), **When** the content is rendered, **Then** it also communicates that spots are available for joining.
3. **Given** notification #7 (class canceled), **When** the content is rendered, **Then** it communicates that the class has been canceled.
4. **Given** notification #8 (individual class assigned), **When** the content is rendered, **Then** it also includes the Coachee's name.
5. **Given** notification #12 (Coach assigned), **When** the content is rendered, **Then** it communicates that the class has been assigned to the Coach.

---

### Edge Cases

- What happens when a group class is created but all eligible Coachees have no registered devices? All notification records are persisted, all deliveries are logged as having no device, and the class creation completes successfully with no errors.
- What happens when a class is created and immediately canceled before notifications are delivered? Notifications are still persisted (they represent the creation event); the cancellation triggers its own notification (#7) to enrolled Coachees. Both events are independently auditable.
- What happens when a Coach is assigned to a class they didn't create, but the class is then immediately reassigned to a different Coach? The first Coach receives notification #12 for the initial assignment; if the reassignment happens, a new notification may or may not be triggered depending on timing — both events are independently auditable.
- What happens when an Admin creates a group class and assigns a Coach simultaneously? The Coach receives notification #12 (assigned to class they didn't create) and eligible Coachees receive notification #2 (new class available). Both notifications are independent.
- What happens when a Coachee's level changes after a group class is created? The notification was sent based on eligibility at creation time; level changes after creation do not trigger re-sending or revoking of notifications.
- What happens when multiple group classes are created simultaneously? Each class creation independently evaluates eligibility and dispatches notifications; there is no batching or deduplication across class creations.
- What happens when the same Coach is assigned to multiple classes simultaneously? Each assignment independently triggers notification #12 if the Coach didn't create the class.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST dispatch notification #2 to every Coachee whose level is within reach when a new group class is created with open spots.
- **FR-002**: System MUST NOT dispatch notification #2 to Coachees whose level is not within reach of the new class.
- **FR-003**: System MUST NOT dispatch notification #2 when a new group class is created at full capacity (no open spots).
- **FR-004**: System MUST dispatch notification #8 to the assigned Coach when an individual class is assigned to a Coachee.
- **FR-005**: System MUST dispatch notification #7 to every Coachee enrolled in a class when the Coach or Admin cancels the class (single or series).
- **FR-006**: System MUST dispatch notification #12 to a Coach when they are assigned to a class they did not create.
- **FR-007**: System MUST NOT dispatch notification #12 when a Coach is assigned to a class they created themselves.
- **FR-008**: Every class lifecycle notification (#2, #3, #7, #8, #12) MUST include a rendered content field containing class type, date/time, level name, and assigned Coach name.
- **FR-009**: Notification #2 content MUST communicate that spots are available for joining.
- **FR-010**: Notification #7 content MUST communicate that the class has been canceled.
- **FR-011**: Notification #8 content MUST also include the Coachee's name.
- **FR-012**: Notification #12 content MUST communicate that the class has been assigned to the Coach.
- **FR-013**: System MUST deliver every notification both as a push notification (FCM) and stored in-app.
- **FR-014**: System MUST persist every notification record before attempting push delivery, with its type, recipient, content, and read status.
- **FR-015**: System MUST NOT raise errors to the triggering operation (class creation, assignment, cancellation) when a recipient has no registered devices; the notification is persisted and delivery is skipped.
- **FR-016**: System MUST log all notification delivery failures (recipient, type, cause) without raising errors to the triggering operation.
- **FR-017**: System MUST dispatch notifications to all eligible recipients simultaneously (no sequential delay that advantages earlier recipients).
- **FR-018**: System MUST evaluate level reach at the moment of class creation for notification #2; subsequent level changes do not trigger re-evaluation.
- **FR-019**: System MUST evaluate Coach ownership at the moment of assignment for notification #12; the Coach is considered the creator if they created the class instance being assigned.

### Key Entities *(include if feature involves data)*

- **Class (reused)**: A single 60-minute training session (individual or group) assigned to one Coach, with a level, a start time, and a status. Its creation, assignment, and cancellation are the triggers for lifecycle notifications.
- **Notification (reused from US-4.1)**: One alert addressed to one recipient — its type, recipient, content, and read status. Class lifecycle events produce notifications of specific types (#2, #3, #7, #8, #12) to specific recipients.
- **Coachee (reused)**: The user role that receives notifications about classes within their reach, class cancellations, and individual class assignments.
- **Coach (reused)**: The user role that receives notifications about individual class assignments (to Coachees) and class assignments (to themselves).
- **Level Reach (reused)**: The domain concept that determines which Coachees are eligible for a class based on level proximity; used to filter notification #2 recipients.
- **ClassLifecycleNotificationService (new domain service)**: The domain-layer orchestrator that evaluates notification triggers for class creation, assignment, and cancellation events, determines eligible recipients, and dispatches notifications through the notification port. It depends on domain ports for class persistence, enrollment persistence, level reach calculation, and notification dispatch, with no infrastructure dependencies.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: When a group class is created with open spots, 100% of eligible Coachees (level within reach) receive notification #2 simultaneously, and 0% of non-eligible Coachees receive it.
- **SC-002**: When an individual class is assigned to a Coachee, 100% of assigned Coaches receive notification #8 with the Coachee's name and class details.
- **SC-003**: When a class is canceled, 100% of enrolled Coachees receive notification #7 simultaneously with the cancellation details.
- **SC-004**: When a Coach is assigned to a class they didn't create, 100% of such Coaches receive notification #12; when a Coach is assigned to a class they created, 0% receive notification #12.
- **SC-005**: 100% of class lifecycle notifications include rendered content with class type, date/time, level name, and Coach name — no notification is sent with empty or incomplete content.
- **SC-006**: 100% of notifications are delivered both as push (FCM) and stored in-app; no notification is delivered via only one channel.
- **SC-007**: 100% of notification delivery failures (no device, provider error) are logged without causing errors to the triggering operation; 100% of triggering operations complete successfully regardless of delivery outcome.
- **SC-008**: A Coachee can view a new class notification and navigate to join the class in under 2 minutes from notification receipt.

## Assumptions

- The push notification infrastructure from US-4.1 (FCM delivery, device registration, notification persistence) is complete and tested; this feature produces notification payloads and relies on US-4.1 for delivery.
- The level reach calculation from US-3.4 (eligibility discovery) is complete and tested; notification #2 recipients are determined using the same reach logic.
- Notification types #3 (Coachee cancels individual → Coach) and #7 (Coach cancels class → Coachees) are already implemented in the codebase; this feature ensures they use the full push + in-app delivery infrastructure and include rendered content.
- "Within reach" for notification #2 uses the same level proximity rule as waiting-list eligibility (at most one level apart by sort order).
- The class creator is identified by the `created_by` field on the TrainingClass; a Coach is considered to have "created" a class if their user ID matches this field.
- Notification content is rendered server-side as a human-readable string; the exact wording is finalized during implementation but must convey the semantics described in the acceptance scenarios.
- The `ClassLifecycleNotificationService` lives in the domain layer (per Hexagonal Architecture) and depends only on domain ports, not on infrastructure adapters. The concrete persistence and notification adapters are injected through the DI container.
- Edge cases involving simultaneous class creation and cancellation are handled safely: each event triggers its own notification dispatch independently, and the system state is consistent at the start of each dispatch.
