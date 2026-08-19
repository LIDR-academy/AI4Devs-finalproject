# Feature Specification: Coachee Dashboard & Calendar

**Feature Branch**: `012-coachee-dashboard-calendar`

**Created**: 2026-08-19

**Status**: Draft

**Input**: User description: "US-3.2: Coachee Dashboard & Calendar (COACHER-22) — As a Coachee, I want a personalized home screen and color-coded calendar, so that I can see my schedule and discover new classes. Acceptance: Home shows next class (or 'No upcoming classes'); Home lists joinable group classes within a 10-day window; Calendar shows 1-week view color-coded Blue (own), Green (joinable), Gray (other/busy); loading/empty/error states for all views; pull-to-refresh on mobile; Home shows count of active waiting lists."

## User Scenarios & Testing *(mandatory)*

### User Story 1 - See your next class and what you can join on Home (Priority: P1)

A Coachee opens the app after logging in and lands on their Home screen. At the top they immediately see the date and time of their next scheduled class (the soonest future class they are enrolled in, whether individual or group). If they have nothing scheduled, a clear "No upcoming classes" message is shown instead of a class. Below that, they see a list of group classes they can join in the next 10 days — classes within their level reach with at least one open spot that they are not already enrolled in. A counter shows how many active waiting lists they belong to. The system knows who the Coachee is from their signed-in session; they never type their own identifier.

**Why this priority**: The Home screen is the personalized "see my schedule and discover new classes" promise of the story — it is the first thing a Coachee sees and the place where they learn what is next for them and what they can sign up for. Without it, the Coachee has no overview of their own schedule, which is the core value of this feature.

**Independent Test**: Can be fully tested by a Coachee with a valid level and a mix of scheduled and joinable classes, verifying the next class (or "No upcoming classes"), the 10-day joinable list, and the waiting-list count render correctly from their session — it delivers the personalized schedule overview on its own.

**Acceptance Scenarios**:

1. **Given** a Coachee enrolled in one or more future classes, **When** the Home screen loads, **Then** the soonest future enrolled class is shown with its date and time, and no later class is shown as the next class.
2. **Given** a Coachee with no future enrolled classes, **When** the Home screen loads, **Then** a clear "No upcoming classes" message is shown instead of a next-class entry.
3. **Given** group classes within the next 10 days that are within the Coachee's level reach, have at least one open spot, and are not already joined, **When** the Home screen loads, **Then** each such class is listed as joinable, and no class outside the 10-day window, outside reach, full, or already joined appears in that list.
4. **Given** a Coachee with no joinable group classes in the window, **When** the Home screen loads, **Then** a clear empty state is shown for the joinable-classes section.
5. **Given** a Coachee who belongs to active waiting lists, **When** the Home screen loads, **Then** the number of active waiting lists is displayed and matches the real count.
6. **Given** a Coachee who belongs to no waiting lists, **When** the Home screen loads, **Then** no waiting-list count indicator is shown.
7. **Given** a Coachee viewing the Home screen, **When** they tap a joinable class, **Then** they are taken to the join flow for that class (the join action itself is owned by the enrollment feature).

---

### User Story 2 - Browse the week on a color-coded calendar (Priority: P1)

A Coachee opens the Calendar tab and sees a 1-week view of the gym's schedule. Every entry is color-coded so the Coachee can instantly tell what it means for them: **blue** for their own scheduled classes (tap to view or cancel), **green** for group classes they can join right now (within reach, open spot, not joined), and **gray** for everything else — other Coachees' individual classes, out-of-reach group classes, and full classes — shown as busy time without private details. Tapping a gray entry opens the waiting-list option where it applies (a full group class within reach, or an occupied individual time slot), and tapping a green entry opens the join option.

**Why this priority**: The color-coded calendar is the "discover new classes" half of the story and the second of the two explicitly promised views. It turns raw schedule data into an instantly scannable map of what is mine, what I can take, and what is taken — this is what makes the Coachee's schedule and discovery usable.

**Independent Test**: Can be fully tested by a Coachee with own classes, joinable group classes, and other Coachees' classes, verifying each calendar entry is colored correctly (blue/green/gray) and each tap surface offers the right option — it delivers the scannable week overview on its own.

**Acceptance Scenarios**:

1. **Given** a Coachee viewing the calendar, **When** the 1-week view renders, **Then** every class the Coachee is enrolled in (individual or group) is shown in blue.
2. **Given** a Coachee viewing the calendar, **When** a group class is within the Coachee's reach, has at least one open spot, and is not already joined, **Then** that class is shown in green.
3. **Given** a Coachee viewing the calendar, **When** an entry is another Coachee's individual class, a group class outside the Coachee's reach, or a full group class, **Then** that entry is shown in gray with no private details of other Coachees.
4. **Given** a green calendar entry, **When** the Coachee taps it, **Then** the join option for that class is offered.
5. **Given** a blue calendar entry, **When** the Coachee taps it, **Then** the class detail with the cancellation option is offered (cancellation itself is owned by the enrollment feature).
6. **Given** a gray calendar entry that is a full group class within reach or an occupied individual time slot, **When** the Coachee taps it, **Then** the waiting-list join option for that slot is offered (the waiting-list action is owned by the waiting-list feature).
7. **Given** a Coachee viewing the calendar, **When** the week contains no classes at all, **Then** a clear empty state is shown rather than a blank grid.

---

### User Story 3 - Every view always responds: loading, empty, error, and pull-to-refresh (Priority: P2)

No matter what happens, the Coachee is never left staring at a blank screen. While the Home screen or calendar is loading, a loading indicator is shown. If a section has no data, a friendly empty message explains it. If loading fails, a clear error state with a retry option is shown, without exposing technical details. On mobile, the Coachee can pull down on either view to refresh the schedule; when new classes are added, canceled, joined, or left elsewhere, the refreshed view reflects it.

**Why this priority**: These states make the two core views trustworthy — a schedule is only useful if the Coachee can tell when it is still loading, when it is genuinely empty, and when something went wrong. It ranks below the two content views because it is the presentation layer around the same data those views render, but it is required for the feature to be complete as specified.

**Independent Test**: Can be fully tested by loading the Home screen and calendar under normal, empty-data, and failing conditions, and by refreshing on mobile, verifying a loading indicator, a clear empty message, an error state with retry, and a successful refresh — it delivers dependable, always-responsive views on its own.

**Acceptance Scenarios**:

1. **Given** a Coachee opening the Home screen or calendar, **When** data is being fetched, **Then** a loading indicator is shown until the data arrives or the request fails.
2. **Given** a Coachee whose Home screen or calendar has no data to show, **When** the view finishes loading, **Then** a clear, friendly empty message is shown for each empty section.
3. **Given** a Home screen or calendar request that fails (e.g., network or server error), **When** the view would render, **Then** a friendly error state is shown with a retry option and no internal error details are exposed.
4. **Given** a Coachee on a mobile device viewing the Home screen or calendar, **When** they pull down to refresh, **Then** the view reloads its data and shows the latest schedule, including classes joined, canceled, or otherwise changed elsewhere.
5. **Given** a successful pull-to-refresh, **When** the refresh completes, **Then** the loading indicator is dismissed and the refreshed content is shown.

---

### Edge Cases

- What happens when the Coachee's next class is very far in the future (beyond any joinable window)? The next-class entry still shows it; the joinable list and the next-class entry are independent windows.
- What happens when the 10-day joinable window overlaps the calendar week? Both views stay consistent because they derive from the same schedule data; a class can appear both on the calendar and in the joinable list.
- What happens when a class the Coachee is enrolled in is canceled by a Coach? After a refresh, it no longer appears as blue on the calendar and the next-class entry advances to the next soonest enrolled class (or shows "No upcoming classes").
- What happens when the Coachee joins a class elsewhere (e.g., from the Home joinable list)? After a refresh, that class moves from green to blue on the calendar.
- What happens when the Coachee's level changes while they view the calendar? The colors reflect reach at render/refresh time; a class that was green may become gray, and an enrolled class stays blue regardless of reach.
- What happens when a Coachee is on many waiting lists? The count on Home shows the total number of active waiting lists, with no limit on the count displayed.
- What happens when the calendar week contains a mixture of entry types? Each entry is color-coded independently per its own state; no entry is double-colored or left uncolored.
- What happens if the authenticated session expires while the Coachee views the Home screen or calendar? A subsequent refresh or tap is refused with an authentication error and the Coachee is asked to sign in again; no private schedule data is shown.
- What happens when the same group class is full but within reach? It renders gray (not green, because it is not joinable), and tapping it offers the waiting-list join option.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST show on the Coachee's Home screen the date and time of their next scheduled class — the soonest future class they are enrolled in (individual or group) — and MUST show a clear "No upcoming classes" message when they have none.
- **FR-002**: System MUST show on the Home screen a list of joinable group classes within a 10-day window, where joinable means: group class, within the Coachee's level reach, with at least one open spot, and not already enrolled.
- **FR-003**: System MUST show on the Home screen the count of active waiting lists the Coachee belongs to, matching the real count, and MUST NOT show the count indicator when it is zero.
- **FR-004**: System MUST derive the Coachee's Home and Calendar content exclusively from the authenticated session (JWT); requests MUST NOT carry the Coachee identifier from the client.
- **FR-005**: System MUST render the Coachee's calendar as a 1-week view.
- **FR-006**: System MUST color-code calendar entries per the visibility rules: blue for classes the Coachee is enrolled in, green for joinable group classes (within reach, open spot, not enrolled), and gray for all other entries (other Coachees' individual classes, out-of-reach group classes, full group classes, and busy time).
- **FR-007**: System MUST show other Coachees' individual classes and other non-joinable entries as gray busy time without exposing their private details.
- **FR-008**: System MUST offer the correct action when a Coachee taps a calendar entry: a green entry offers the join option, a blue entry offers the class detail with the cancellation option, and a gray entry that is a full group class within reach or an occupied individual slot offers the waiting-list join option.
- **FR-009**: System MUST show a loading indicator for the Home screen and calendar while their data is being fetched.
- **FR-010**: System MUST show a clear, friendly empty state for the Home screen next-class entry, the joinable-classes section, and the calendar week when they have no data to show.
- **FR-011**: System MUST show a friendly error state with a retry option when the Home screen or calendar fails to load, and MUST NOT expose internal error details.
- **FR-012**: System MUST support pull-to-refresh on mobile for the Home screen and calendar, reloading the schedule data and reflecting classes joined, canceled, or otherwise changed since the last load.
- **FR-013**: System MUST refuse access to the Coachee dashboard and calendar data for authenticated users who are not Coachees, with a forbidden error and no data returned.
- **FR-014**: System MUST reflect schedule changes (join, cancel, waiting-list join/leave, Coach cancellation, level change) in the Home screen and calendar on the next load or refresh, and MUST NOT show stale next-class, joinable, or color state.
- **FR-015**: System MUST handle an expired or invalid session on the Home screen and calendar by refusing further data access without displaying any private schedule content.

### Key Entities *(include if feature involves data)*

- **Coachee**: The user role whose personalized schedule and discovery views this feature renders; identified from the authenticated session, with a level that determines which group classes are green/joinable (reach = own level, one above, or one below).
- **Class (reused)**: A single 60-minute training session (individual or group) with a start time, level (group), status, and capacity; its type, level, enrollment count, and capacity determine a Coachee's blue/green/gray classification.
- **Class Enrollment (reused)**: The record linking one Coachee to one class; it determines which calendar entries are blue and which class is the next scheduled class.
- **Level (reused)**: The difficulty tier of a Coachee and of group classes; the basis of the reach rule that decides green vs. gray and what appears in the joinable list.
- **Waiting List Entry (reused)**: The record of a Coachee on a class's waiting list; the count of active entries powers the Home screen's waiting-list counter.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: A Coachee can identify their next scheduled class and see all joinable group classes in under 5 seconds of opening the Home screen under normal network conditions.
- **SC-002**: 100% of calendar entries shown to a Coachee are color-coded correctly per the visibility rules (blue = own, green = joinable, gray = other).
- **SC-003**: The Home screen's next-class entry matches the soonest future enrolled class, and its joinable list matches the reach/open-spot/10-day rule, in 100% of loaded views.
- **SC-004**: 100% of Home and calendar loads resolve to a loading, empty, or error state — no view is ever left blank without feedback.
- **SC-005**: On mobile, a pull-to-refresh completes within 3 seconds and the refreshed Home and calendar reflect the latest schedule 100% of the time.
- **SC-006**: The Home screen's active waiting-list count matches the real count 100% of the time it is displayed.
- **SC-007**: 100% of attempts by a non-Coachee role to access the dashboard or calendar are refused without returning schedule data.

## Assumptions

- This feature delivers the two read/display views (Home dashboard and 1-week calendar) plus their states and refresh. The actions launched from them — join, cancel, and waiting-list join/leave — are owned by the enrollment/cancellation (US-3.1) and waiting-list (US-3.3) features; here the views surface the correct tap options and reflect the outcome on the next load or refresh.
- "Joinable" (green) means a group class within the Coachee's level reach with at least one open spot that is not already enrolled, per the issue's "joinable within reach" wording and the documented visibility rule. A full group class within reach therefore renders gray, and tapping it still offers the waiting-list join option.
- The 10-day joinable window starts at the beginning of today (gym timezone, Europe/Madrid) and includes the tenth day; a class at any time inside the window is eligible regardless of whether it starts earlier today.
- The calendar 1-week view shows the current week (7 days, starting Monday in the gym timezone); navigating between weeks is out of scope for this release.
- The Home screen and calendar data are fetched from the documented Coachee dashboard and class-listing contracts, which already define the next-class, joinable-classes, waiting-list count, and per-class visibility data; no assumption is made about how the views are implemented.
- The calendar renders scheduled classes per the visibility rules; gym-wide and personal calendar blocks are an Admin/Coach concern and are out of scope here, though any busy time surfaced to the Coachee renders gray.
- The waiting-list count indicator is hidden when the count is zero and shown as a number when it is one or more.
- Automation contract: the Coachee is identified only from the authenticated session for all dashboard and calendar reads; schedule data for other Coachees is never exposed in detail.
