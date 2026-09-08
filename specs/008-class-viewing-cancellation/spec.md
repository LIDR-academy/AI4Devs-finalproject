# Feature Specification: Class Viewing & Cancellation

**Feature Branch**: `008-class-viewing-cancellation`

**Created**: 2026-08-17

**Status**: Draft

**Input**: User description: "US-2.3: Class Viewing & Cancellation (COACHER-17) — As a Coach or Admin, I want to view, filter, and cancel classes, so that I can manage the schedule effectively."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View and filter the class schedule (Priority: P1)

A Coach or Admin opens the class list for a specific date range (for example, the current week) and can narrow it down by class type (individual / group) and by the assigned Coach. The list shows every class in that range — including its type, assigned Coach, level (for group classes), date and time, status, and current enrollment — and never reveals classes outside the requested window, even if filters are applied.

**Why this priority**: Seeing the schedule accurately is the foundation of the entire feature. Without a correct, filterable view, no Coach or Admin can plan, and the cancellation actions in later stories have no useful context. It also matches the existing calendar surface the team already uses.

**Independent Test**: Can be fully tested by querying the class list for a known date range containing a known set of classes and verifying that exactly those classes are returned, both unfiltered and filtered — it delivers accurate schedule visibility on its own.

**Acceptance Scenarios**:

1. **Given** a set of existing classes spread across several days, classes types, and Coaches, **When** a Coach or Admin requests the list for a date range containing only part of them, **Then** the response contains exactly the classes that fall within that range, with no classes from outside it.
2. **Given** a Coach or Admin viewing the class list, **When** they filter by class type (individual or group), **Then** only classes of the selected type are returned.
3. **Given** a Coach or Admin viewing the class list, **When** they filter by an assigned Coach, **Then** only classes assigned to that Coach are returned.
4. **Given** a Coach or Admin, **When** either of them requests the class list, **Then** both see the same complete set of classes regardless of who created or was assigned to them.
5. **Given** no date range, or an invalid one, **When** a class list is requested, **Then** the request is rejected with a clear validation error and no classes are shown.
6. **Given** filters that match no classes, **When** the list is requested, **Then** an empty list is returned with a message indicating no classes match.

---

### User Story 2 - Cancel a class (single or whole series) (Priority: P1)

A Coach or Admin cancels a class that is not going to happen. If the class is part of a weekly recurring series, they choose either to cancel only that one occurrence or to cancel the entire series (all its upcoming occurrences). The class is immediately marked as "Canceled" and shown in gray everywhere in the schedule, and the external scheduling calendar is kept in sync. Only the assigned Coach or an Admin can cancel; anyone else is refused.

**Why this priority**: Cancellation is the primary corrective action for schedule management and is explicitly called out in the user story. Without it, a Coach or Admin cannot respond to disruptions, and the schedule would diverge from reality.

**Independent Test**: Can be fully tested by canceling an existing class as an authorized user and verifying it appears as "Canceled," then repeating for a series instance and verifying the chosen scope only — it delivers the schedule-management capability on its own.

**Acceptance Scenarios**:

1. **Given** an active (non-canceled) class, **When** the assigned Coach or an Admin cancels it, **Then** its status becomes "Canceled" and it is displayed in gray with a "Canceled" tag.
2. **Given** a class that belongs to a weekly recurring series, **When** the assigned Coach or Admin cancels it with "single occurrence" scope, **Then** only that occurrence is canceled and every other occurrence remains active.
3. **Given** a class that belongs to a weekly recurring series, **When** the assigned Coach or Admin cancels it with "entire series" scope, **Then** that occurrence and all upcoming occurrences are canceled, the count of canceled occurrences is reported, and past occurrences are left unchanged.
4. **Given** a Coach who is neither the assigned Coach nor an Admin, or a Coachee, **When** any of them attempts to cancel a class, **Then** the attempt is refused with a permission-denied error and no class data is changed.
5. **Given** an active class, **When** it is canceled, **Then** the external scheduling calendar reflects the cancellation (the event is removed).
6. **Given** an already-canceled class, **When** someone tries to cancel it again, **Then** the request is rejected with a conflict error and no duplicate cancellation occurs.
7. **Given** a class that does not exist, **When** someone attempts to cancel it, **Then** the request is rejected with a not-found error.
8. **Given** a class being canceled, **When** the cancellation succeeds, **Then** the action is recorded with the acting user, the class, and the outcome for audit purposes, and the notification for enrolled Coachees is prepared (dispatching is handled in a later release).
9. **Given** a series cancellation where some upcoming occurrences are already canceled, **When** the series is canceled, **Then** already-canceled occurrences are left as they are and only the remaining active ones are newly canceled.

---

### User Story 3 - View class details (enrollment & waiting list) (Priority: P2)

A Coach or Admin opens one class to see its full detail: the assigned Coach, level (group classes), date and time, description, the list of enrolled Coachees with the enrollment count against capacity, and whether a waiting list exists with its current count.

**Why this priority**: Detail inspection supports good decision-making before canceling or adjusts coaching plans, and it gives visibility into demand (waiting lists). It is valuable independently but secondary to the core list and cancellation flows.

**Independent Test**: Can be fully tested by opening a known class and verifying all detail fields — including enrollment and waiting list counts — match the recorded state; it delivers detailed schedule insight on its own.

**Acceptance Scenarios**:

1. **Given** a class with enrolled Coachees, **When** a Coach or Admin requests its detail, **Then** the class type, assigned Coach, level (group), start time, and description are all returned accurately.
2. **Given** a class with enrolled Coachees, **When** its detail is requested, **Then** the enrolled Coachee names, the enrollment count, and the class capacity are all returned.
3. **Given** a group class with people on its waiting list, **When** its detail is requested, **Then** the waiting list is reflected with its current count.
4. **Given** a class that does not exist, **When** its detail is requested, **Then** a not-found error is returned.

---

### Edge Cases

- What happens when the requested date range is missing, malformed, or inverted (start after end)? A clear validation error is returned; no classes are shown.
- What happens when a filter value does not match anything (unknown class type, non-existent Coach)? An empty list for valid filters; an explicit not-found/validation handling for an unknown Coach reference so the user knows the filter is wrong.
- How does the system handle a class that is already canceled? It stays gray/"Canceled," cannot be canceled again (conflict), and is shown in the list so cancellations are always visible.
- How does the system handle canceling a past occurrence? A single past occurrence can still be canceled by an authorized user; series cancellation never touches past occurrences.
- How does the system handle a series with no remaining future occurrences when "entire series" is used? The current occurrence is canceled and the reported count reflects only occurrences actually canceled.
- How does the system handle a large date range (many classes)? The list is paginated so the schedule remains readable.
- What happens if the external scheduling calendar is temporarily unavailable during a cancellation? The cancellation must still be safe/consistent; the sync failure is treated as an infrastructure error with a clear message rather than silently corrupting the schedule.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST allow an authenticated Admin or Coach to request the class list for a required date range and return every class that starts within it.
- **FR-002**: System MUST support optional filtering of the class list by class type (individual or group).
- **FR-003**: System MUST support optional filtering of the class list by the assigned Coach.
- **FR-004**: System MUST return the full set of classes to Admins and Coaches regardless of who created or is assigned to each class.
- **FR-005**: System MUST enforce class visibility by the viewer's role so that a Coachee can never access classes outside the permitted visibility rules, regardless of how the request is made.
- **FR-006**: Each item in the class list MUST include class type, assigned Coach, level (for group classes), start time, duration, status, enrollment count, capacity, waiting-list presence, and (for Coachees) a visibility classification.
- **FR-007**: System MUST paginate the class list and report pagination metadata so the full range can be browsed.
- **FR-008**: System MUST return full detail for a single class, including the enrolled Coachee names, enrollment count vs. capacity, whether a waiting list exists and its current count, and its membership in a recurring series.
- **FR-009**: System MUST allow an authorized Admin or Coach to cancel a single class instance.
- **FR-010**: System MUST support two cancellation scopes — "single occurrence" (default) and "entire series" (all remaining future occurrences) — and apply the selected scope.
- **FR-011**: System MUST restrict cancellation to the assigned Coach of the class or an Admin; all other users (including other Coaches and Coachees) MUST receive a permission-denied error.
- **FR-012**: System MUST mark a canceled class with status "Canceled", keep it visible in the schedule, and present it in gray with a visible "Canceled" tag.
- **FR-013**: System MUST update the external scheduling calendar to reflect any cancellation (removing the reserved block of time).
- **FR-014**: System MUST prevent double cancellation of an already-canceled class with a conflict error.
- **FR-015**: System MUST return a not-found error for cancellation or detail requests that reference a class that does not exist.
- **FR-016**: System MUST record every cancellation (actor, class, scope, outcome) for audit purposes.
- **FR-017**: System MUST prepare the cancellation notification for all enrolled Coachees of a canceled class; actual dispatching is deferred to a later release.

### Key Entities *(include if feature involves data)*

- **Class (occurrence)**: A single 1-hour training session (individual or group) at a start time, assigned to one Coach, optionally linked to a level (group) and a description, with a status of "Active" or "Canceled"; it holds the enrolled Coachees and, when full, a waiting list.
- **Recurrence Series**: A weekly recurring arrangement that groups the occurrences generated from a single creation; canceling the series cancels all remaining future occurrences while leaving past ones untouched.
- **Class Enrollment**: The list of Coachees signed up for a class occurrence; in individual classes at most one, in group classes between 3 and 4.
- **Waiting List**: The queue of Coachees waiting for a spot in a full class; its presence and current size are surfaced in class detail and list views.
- **User (Coach / Admin / Coachee)**: The people acting on and listed within classes; Coaches and Admins view and cancel, Coachees are enrolled and have restricted visibility.
- **Level**: The difficulty tier attached to group classes, used for visibility and reach.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of classes that start within a requested date range are returned in the list, with zero classes from outside the range (verified against the schedule).
- **SC-002**: When a class type or assigned-Coach filter is applied, 100% of returned classes match the filter.
- **SC-003**: An authorized Coach or Admin can cancel any eligible class within 30 seconds of deciding to do so, and the class immediately appears as "Canceled" (gray) in the schedule.
- **SC-004**: 100% of unauthorized cancellation attempts (Coachee, non-assigned Coach) are refused with a permission-denied error and cause zero changes to class data.
- **SC-005**: Canceling a recurring series with "entire series" scope cancels 100% of the remaining future occurrences and never alters any past occurrence.
- **SC-006**: 100% of canceled classes are reflected in the external scheduling calendar (no reserved blocks remain for canceled classes).
- **SC-007**: 100% of class detail views display enrollment and waiting-list counts that match the current state of the class.

## Assumptions

- The role-based visibility rules for Coachees are applied server-side per the documented contract; the full Coachee calendar experience (colored blocks, join flows) is covered by the Coachee self-service storyline and is out of scope here.
- Cancellation notifications are prepared and recorded, but their actual dispatching (and automatic waiting-list processing) is deferred to the notifications epic as stated in the user story.
- Classes cannot be edited or rescheduled (duration is always 60 minutes and no changes are allowed); cancellation is the removal mechanism.
- A class may be canceled by an authorized user even if it has already started; when "entire series" scope is used, only future occurrences are affected.
- The external scheduling calendar is the single source of truth for time availability, so any cancellation must be reflected there.
- The default cancellation scope, when not specified, is "single occurrence."
- Pagination defaults and page sizes follow standard list behavior so large ranges stay readable.
- Existing authentication, authorization, and audit-logging infrastructure is reused; no new user-management behavior is introduced by this feature.