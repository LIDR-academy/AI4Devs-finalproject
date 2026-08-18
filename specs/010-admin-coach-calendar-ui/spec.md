# Feature Specification: Admin/Coach Calendar UI

**Feature Branch**: `010-admin-coach-calendar-ui`

**Created**: 2026-08-18

**Status**: Draft

**Input**: User description: "US-2.5: Admin/Coach Calendar UI (COACHER-20) — As a Coach or Admin, I want a visual calendar with class creation modal and today's schedule, so that I can manage the weekly schedule in one place."

## Clarifications

### Session 2026-08-18

- Q: What basis drives the calendar color coding scheme? → A: By class type (individual vs group), matching the PRD's two distinct background colors; the 5-level color mapping is NOT used for calendar cells.
- Q: Should the Add Class modal also create time blocks, or only classes? → A: Yes, create blocks too — the modal offers Individual / Group / Block (PRD parity); blocks are both created from the modal and rendered on the calendar.

## User Scenarios & Testing *(mandatory)*

### User Story 1 - View the weekly calendar with all classes and blocks (Priority: P1)

A Coach or Admin opens the Calendar page and sees the current week rendered as a visual, in-app calendar. The calendar shows every class from every Coach (no per-Coach filtering in this version), with a color coding scheme that makes the schedule readable at a glance, plus the time period covered by personal blocks and gym-wide blocks rendered as blocked regions. Classes that have been canceled appear grayed out with a visible "Canceled" tag. The calendar is a self-contained application component: it never reaches out to the external scheduling service directly from the browser — all data comes through the application's own services.

**Why this priority**: The visual calendar is the heart of the story — its stated purpose is to let a Coach or Admin "manage the weekly schedule in one place." Without the calendar rendering every class and blocked period correctly, none of the schedule-management value exists, and the Add Class flow in the next story has no context to be placed in.

**Independent Test**: Can be fully tested by opening the Calendar page and verifying that all classes from all Coaches for the current week are rendered with color coding, all personal and gym-wide blocks are shown, canceled classes appear gray with the "Canceled" tag, and that no direct request to the external scheduling service originates from the browser while the page loads — it delivers full weekly schedule visibility on its own.

**Acceptance Scenarios**:

1. **Given** a Coach or Admin with an existing set of classes assigned to different Coaches across the current week, **When** they open the Calendar page, **Then** all of those classes are visible in their correct day and 1-hour time positions.
2. **Given** a Coach or Admin viewing the calendar, **When** the visible period contains both individual and group classes, **Then** each class is rendered with the agreed color coding so classes can be told apart at a glance.
3. **Given** one or more personal blocks and one or more gym-wide blocks within the visible period, **When** the calendar is displayed, **Then** each blocked period is rendered as a blocked region visually distinct from scheduled classes.
4. **Given** a class that has been canceled, **When** the calendar is displayed during the canceled class's original time, **Then** the class is shown in gray with a visible "Canceled" tag and its blocked time is no longer offered as free.
5. **Given** a Coach or Admin navigating the month, **When** they move to a previous or next week, **Then** the calendar reloads that week's classes and blocks correctly.
6. **Given** the Calendar page is loaded in a browser, **When** the page fetches its data, **Then** no request is made from the browser to the external scheduling service; every calendar payload comes through the application's own services.

---

### User Story 2 - Create a class or block directly from the calendar via the Add Class modal (Priority: P1)

While viewing the calendar, a Coach or Admin clicks an "Add Class" button in the toolbar and the application opens a modal to create a new class or time block. The modal shows a dynamic set of fields that adapt to the selected type (individual, group, or block): exactly one Coachee for individual classes, a Coachee multi-select for group classes, a level selector for group classes only, and an assigned Coach that defaults to the creating user but can be changed. When "Block" is selected, the Coachee, level, and assigned-Coach fields are hidden and a block-type selector (Personal or Gym-wide) is shown instead; Gym-wide is Admin-only, matching the block-management rules already agreed. The modal surfaces the available time slots for the chosen date so the user can only schedule into genuinely free time. Once saved, the new class or block appears on the calendar.

**Why this priority**: Creating classes (and blocks) without leaving the calendar is the primary management action the story promises ("manage the weekly schedule in one place"). It is equally critical to viewing because a schedule that cannot be changed from the same screen is not manageable from one place.

**Independent Test**: Can be fully tested by clicking "Add Class," filling the dynamic fields for an individual class, choosing one of the presented available time slots, saving, and verifying the class appears on the calendar at the chosen slot; repeating for a gym-wide block verifies block creation — it delivers in-place class and block creation on its own.

**Acceptance Scenarios**:

1. **Given** a Calendar page with an "Add Class" button, **When** a Coach or Admin clicks it, **Then** a modal opens showing the type choice (Individual / Group / Block) and all relevant fields for the default type.
2. **Given** the Add Class modal, **When** the user selects "Individual," **Then** the modal requires exactly one Coachee and hides the level selector; for group classes the modal requires between 3 and 4 Coachees and shows the level selector.
3. **Given** the Add Class modal, **When** the user selects "Block," **Then** the Coachee, level, and assigned-Coach fields are hidden and a block-type selector (Personal or Gym-wide) appears; for an Admin both options are available, for a Coach only Personal (their own calendar).
4. **Given** the Add Class modal, **When** a date is chosen, **Then** the modal presents the available time slots for that date and only those slots are selectable for the class or block start time.
5. **Given** the Add Class modal, **When** the user saves a valid class, **Then** the class is created using the existing scheduling rules (60-minute duration, coach and coachee overlap checks, gym capacity limits, level validation) and immediately appears on the calendar.
6. **Given** the Add Class modal, **When** the user saves a valid block, **Then** the block is created using the existing block rules (hour-aligned start/end, one-hour minimum, overlap checks, personal vs gym-wide permissions) and immediately appears on the calendar.
7. **Given** the Add Class modal, **When** the user attempts to save with invalid or missing data (for example, no Coachee, fewer than 3 group Coachees, an occupied slot, or a Coach selecting Gym-wide), **Then** the application shows a clear validation message and no class or block is created.
8. **Given** an Admin or Coach whose role permits class creation, **When** they open the modal, **Then** the assigned-coach field defaults to the creating user and can be changed to any other active Coach.

---

### User Story 3 - View today's schedule as a chronological list (Priority: P2)

A Coach or Admin opens the Today page and sees today's classes as a vertical, chronological list. Individual classes are visually distinguished from group classes (for example, by background color), and canceled classes are shown in gray with a "Canceled" tag. The list shows the Coachee name(s) and the start time for each class, ordered by time of day.

**Why this priority**: The Today view is the fastest daily operational surface — at the start of a workday a Coach or Admin wants "what's happening right now / next" without reading a full grid. It builds on the same class data as the calendar but is a distinct, simpler layout, so it ranks below the calendar + creation flow.

**Independent Test**: Can be fully tested by opening the Today page and verifying that all of today's classes appear in chronological order with the individual/group visual distinction, and that canceled classes are gray with the tag — it delivers the day-at-a-glance view on its own.

**Acceptance Scenarios**:

1. **Given** a set of classes scheduled for today across different times, **When** a Coach or Admin opens the Today page, **Then** all of them are listed vertically in chronological order of start time.
2. **Given** the Today page showing both class types, **When** the list renders, **Then** individual and group classes are visually distinguished from one another.
3. **Given** a canceled class whose original time is today, **When** the Today page renders, **Then** the class is shown in gray with a visible "Canceled" tag in its chronological position.
4. **Given** a day with no classes, **When** a Coach or Admin opens the Today page, **Then** an empty-state message indicates there are no classes scheduled today.

---

### User Story 4 - Responsive calendar layout for desktop and tablet (Priority: P3)

A Coach or Admin uses the Calendar and Today views on a desktop or tablet screen and the layout adapts cleanly to both: the calendar grid remains readable, the Add Class modal stays usable, and no essential information is cut off or requires horizontal scrolling on tablet widths.

**Why this priority**: Responsiveness is required by the acceptance criteria and affects where and how the schedule is used, but it is a layout polish that layers on top of the full desktop functionality, so it is the lowest-priority slice.

**Independent Test**: Can be fully tested by opening the Calendar and Today pages on desktop (e.g., 1280px wide) and tablet (e.g., 768px wide) viewports and verifying all information and actions remain accessible without horizontal scrolling — it delivers adaptive layout on its own.

**Acceptance Scenarios**:

1. **Given** a Coach or Admin on a desktop viewport, **When** they open the Calendar and Today pages, **Then** classes, blocks, and the Add Class modal are fully visible and usable without horizontal scrolling.
2. **Given** a Coach or Admin on a tablet viewport, **When** they open the Calendar and Today pages, **Then** the layout adapts so all schedule information and the Add Class flow remain accessible without horizontal scrolling.

---

### Edge Cases

- What happens on a calendar week with no classes and no blocks? The grid renders empty with a clear empty state so the user knows the week is genuinely free.
- How does the calendar handle a week that includes blocked periods spanning across week boundaries (for example, a block starting Friday 23:00 and ending Saturday 01:00)? Each visible day renders only the portion of the block that falls within it.
- How does the system handle a canceled class in the calendar? It is still shown (gray, "Canceled" tag) so cancellations remain visible, and its original time is not offered as an available slot.
- What happens if two classes or a class and a block occupy the same slot? This situation cannot be created because scheduled data is authoritative; if displayed, the overlapping classes are rendered without layout overlap so both are readable.
- What happens when a class has more than one Coachee (group) with a long name? The class block shows the content within the 1-hour slot without overflowing the grid cell in a way that hides adjacent classes.
- What happens when the external scheduling service is temporarily unavailable when a Coach or Admin loads the calendar? The page shows a clear error message instead of partial or stale schedule data, and the user retries.
- How does the Add Class modal behave for a date whose available slots all fall at unfriendly hours (for example, none within the gym's operating window)? The modal shows the earliest available slot combined with a clear message; the user can pick another date.
- What happens when a Coach or Admin tries to save a class into an occupied slot that appeared free but was just booked by another user (race condition)? The application rejects the save with a clear conflict message, keeps the modal open with the field values, and refreshes the available slots so the user can pick a genuinely free one.
- How does the Add Class modal handle a Coach selecting the "Block" type? The class-specific fields are replaced by the Personal/Gym-wide selector; Gym-wide is Admin-only and a Coach selecting it gets a permission error. Blocks are hour-aligned with a one-hour minimum, matching the block-management rules.
- How is the calendar updated after a class is created from the modal? The new class appears in the visible grid immediately without a full page reload.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST render the calendar as an in-application component and MUST NOT make any request to the external scheduling service from the browser; calendar data MUST be sourced exclusively through the application's own services.
- **FR-002**: System MUST display, for the visible time period, all classes from all Coaches without per-Coach filtering.
- **FR-003**: System MUST place each class in its correct day and 1-hour time slot within the calendar grid.
- **FR-004**: System MUST apply the agreed color coding scheme to classes so distinct classes can be told apart at a glance; color coding is based on class type, with individual classes always using one color and group classes another.
- **FR-005**: System MUST render personal blocks and gym-wide blocks within the visible period as blocked regions that are visually distinct from scheduled classes; multi-day blocks MUST be shown on every day they cover.
- **FR-006**: System MUST display canceled classes in the calendar in gray with a visible "Canceled" tag and MUST NOT offer their original time as an available slot.
- **FR-007**: System MUST provide week navigation (previous / next) on the Calendar page so the user can move across the schedule.
- **FR-008**: System MUST provide an "Add Class" action on the Calendar page that opens the class/block creation modal.
- **FR-009**: The Add Class modal MUST adapt its fields to the selected type: exactly one Coachee for individual classes; a Coachee multi-select of 3 to 4 for group classes; a level selector shown only for group classes; and, when "Block" is selected, a Personal/Gym-wide block-type selector replacing the class-specific fields.
- **FR-010**: The Add Class modal MUST default the assigned Coach to the creating user and MUST allow selecting any other active Coach.
- **FR-011**: The Add Class modal MUST present the available time slots for the selected date and MUST restrict class or block creation to those slots only.
- **FR-012**: Saving a class from the modal MUST enforce all existing scheduling rules (60-minute duration, coach/coachee overlap checks, gym capacity limits, level validation) and MUST reject invalid submissions with a clear validation message without altering data.
- **FR-012a**: Saving a block from the modal MUST enforce the existing block rules (hour-aligned start/end, one-hour minimum, overlap checks, personal vs gym-wide permissions — gym-wide is Admin-only) and MUST reject invalid submissions with a clear validation message without altering data.
- **FR-013**: When a slot selected by the user becomes unavailable between slot presentation and submission, System MUST reject the save with a clear conflict message, preserve the user's field entries, and refresh the available slots.
- **FR-014**: System MUST immediately reflect a successfully created class or block on the calendar without requiring a full page load.
- **FR-015**: System MUST render the Today page as a vertical chronological list of today's classes showing the Coachee name(s) and start time of each class.
- **FR-016**: The Today page MUST visually distinguish individual classes from group classes.
- **FR-017**: Canceled classes on the Today page MUST appear in gray with a visible "Canceled" tag in their chronological position.
- **FR-018**: The Today page MUST show a clear empty state when no classes are scheduled for the day.
- **FR-019**: System MUST allow only authenticated Admin and Coach users to access the Calendar and Today pages; other roles MUST NOT be granted access.
- **FR-020**: Calendar and Today page layouts MUST be fully usable on desktop and tablet viewports without horizontal scrolling.
- **FR-021**: When the external scheduling service is unavailable while loading the calendar or available slots, System MUST show a clear error message rather than stale or partial schedule data, and MUST record the failure for observability.

### Key Entities *(include if feature involves data)*

- **Calendar View**: The presentation of classes and blocks over a visible week (or day, for Today), sourced from the application's own services — the frontend surface of this feature.
- **Class (reused)**: A single 60-minute individual or group session assigned to one Coach, with a status of "Active" or "Canceled"; the unit that populates calendar slots and the Today list.
- **Block (reused)**: A period of excluded time, either personal (blocks one Coach's calendar) or gym-wide (blocks the whole gym), rendered as blocked regions on the calendar and creatable from the Add Class modal under the existing block-management rules.
- **Available Slot**: A 1-hour period the system has verified as free for the chosen date (no conflicting class or block), presented as selectable in the Add Class modal.
- **User (Coach / Admin)**: The roles that can access the calendar and Today views and create classes from the modal; the creating user is the default assigned Coach.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: 100% of classes from all Coaches that fall within the visible week are shown at their correct day and time on the Calendar page, with zero classes omitted from outside the period.
- **SC-002**: 100% of active personal and gym-wide blocks within the visible period are rendered as blocked regions, and every day a multi-day block covers shows it.
- **SC-003**: 100% of canceled classes appear gray with a visible "Canceled" tag on both the Calendar and Today pages, and their original time is never offered as an available slot.
- **SC-004**: A Coach or Admin can create a valid class from the Add Class modal in under 2 minutes and see it appear on the calendar immediately.
- **SC-005**: 100% of class-creation attempts using a slot presented as available succeed on first submission, and 100% of attempts into genuinely occupied slots are rejected with a clear conflict message.
- **SC-005a**: A Coach or Admin can create a valid time block from the Add Class modal in under 2 minutes, and 100% of gym-wide blocks attempted by a Coach are refused with a permission error.
- **SC-006**: 100% of Today-page listings are in chronological order and correctly distinguish individual from group classes.
- **SC-007**: On desktop (1280px) and tablet (768px) viewports, all Calendar and Today content and the Add Class modal remain accessible without horizontal scrolling.
- **SC-008**: During calendar and slot loading, the browser makes zero requests directly to the external scheduling service; all data comes from the application's own services.

## Assumptions

- The Calendar page shows one week at a time (including the current week on first load) with previous/next navigation; the Today page covers the current day. This matches the story's "manage the weekly schedule" framing and the existing 1-week calendar window described in the PRD.
- The backend services required by this UI already exist: class listing with date ranges, block listing with date ranges, available-slots computation, class creation, coach listing, and coachee listing. This story is primarily a frontend surface (calendar component, modal, Today page) that consumes those existing services.
- The color coding scheme is based on class type: individual classes and group classes each have their own distinct color, matching the PRD's "two distinct background colors" for the Today page; the 5-level color mapping is not used for calendar cells.
- The "Add Class" modal covers individual classes, group classes, AND time blocks (Individual / Group / Block, per the PRD); block creation from the modal reuses the existing block-management rules (personal vs gym-wide, hour-aligned, one-hour minimum), and blocks rendered on the calendar reflect both blocks created here and blocks created via the block-management surface.
- Timezone handling follows the project convention: user-entered wall-clock times are interpreted in the gym timezone (Europe/Madrid, DST-aware), and schedule data is stored as UTC instants.
- The duration of every class remains a fixed 60-minute domain invariant.
- Existing authentication, role-based authorization, error contract (clear messages, no internal details), and observability infrastructure are reused; no new user-management or security behavior is introduced by this feature.
- Canceled classes remain visible in all schedule surfaces (calendar, Today, block availability) per the class-viewing/cancellation conventions already agreed.