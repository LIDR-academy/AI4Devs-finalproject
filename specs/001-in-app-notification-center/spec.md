# Feature Specification: In-App Notification Center

**Feature Branch**: `001-in-app-notification-center`

**Created**: 2026-08-24

**Status**: Draft

**Input**: User description: "US-4.5: In-App Notification Center"

## User Scenarios & Testing

### User Story 1 - View Unread Notifications via Header Badge (Priority: P1)

As a user, I want to see an unread notification count badge on a bell icon in the header, so that I can quickly see if I have new notifications without navigating away from my current screen.

**Why this priority**: This is the entry point for all notification interactions. Without visibility of new notifications, the rest of the feature provides no value. The badge acts as the primary signal that motivates users to engage with the notification center.

**Independent Test**: Can be fully tested by logging in as any user and verifying the bell icon appears in the header with an accurate count of unread notifications.

**Acceptance Scenarios**:

1. **Given** a user is logged in, **When** the user has unread notifications, **Then** the bell icon in the header displays a badge with the correct unread count.
2. **Given** a user is logged in, **When** the user has no unread notifications, **Then** the bell icon displays without a badge.
3. **Given** a user is logged in, **When** a new notification is received, **Then** the badge count increments by one in real time without requiring a page refresh.
4. **Given** a user is logged in, **When** the user marks a notification as read, **Then** the badge count decrements by one.

---

### User Story 2 - Admin/Coach Daily Notification Panel (Priority: P2)

As an Admin or Coach, I want a dropdown panel from the bell icon that shows only today's notifications, so that I can quickly review alerts relevant to my current schedule without being overwhelmed by historical data.

**Why this priority**: Admins and Coaches operate on a day-to-day basis. Showing only today's notifications keeps the interface focused and actionable for their workflow.

**Independent Test**: Can be tested by logging in as Admin or Coach, clicking the bell icon, and verifying the dropdown shows only notifications from the current day.

**Acceptance Scenarios**:

1. **Given** an Admin or Coach is logged in, **When** they click the bell icon, **Then** a dropdown panel opens showing only notifications from the current day.
2. **Given** an Admin or Coach opens the notification panel, **When** notifications exist for today, **Then** each notification displays its content, timestamp, and read/unread status.
3. **Given** an Admin or Coach opens the notification panel, **When** no notifications exist for today, **Then** a "No notifications today" message is displayed.
4. **Given** an Admin or Coach clicks on a notification, **When** the notification is unread, **Then** it is marked as read and the badge count decreases.
5. **Given** an Admin or Coach clicks on a notification linked to a class, **When** they click the notification, **Then** they are navigated to the relevant class detail screen.

---

### User Story 3 - Coachee Full Notification History (Priority: P3)

As a Coachee, I want a dedicated notifications screen showing my full chronological notification history, so that I can review past alerts, track class changes, and ensure I haven't missed anything important.

**Why this priority**: Coachees benefit from reviewing historical notifications to track class updates, cancellations, and schedule changes over time. This is a deeper engagement feature compared to the quick-glance badge.

**Independent Test**: Can be tested by logging in as a Coachee, navigating to the notifications screen, and verifying the full notification history is displayed chronologically with pagination.

**Acceptance Scenarios**:

1. **Given** a Coachee is logged in, **When** they navigate to the notifications screen, **Then** all notifications for the Coachee are displayed in chronological order (newest first).
2. **Given** a Coachee views their notification history, **When** they have many notifications, **Then** the list supports pagination (load more or infinite scroll).
3. **Given** a Coachee views their notification history, **When** they tap a notification, **Then** it is marked as read.
4. **Given** a Coachee views their notification history, **When** they tap a notification linked to a class, **Then** they are navigated to the class detail screen.
5. **Given** a Coachee views their notification history, **When** they want to filter, **Then** they can toggle a filter to show only unread notifications.

---

### User Story 4 - Mark Notifications as Read (Priority: P4)

As a user, I want to mark individual notifications as read by tapping on them, so that I can keep my notification list organized and track what I have already reviewed.

**Why this priority**: Marking notifications as read is a core interaction that supports the other user stories. It is included as a separate story because it can be independently verified and tested.

**Independent Test**: Can be tested by opening a notification and verifying its read status changes and the unread badge updates accordingly.

**Acceptance Scenarios**:

1. **Given** a user has unread notifications, **When** they tap on a single notification, **Then** that notification is marked as read immediately.
2. **Given** a user marks a notification as read, **When** the badge was showing the previous count, **Then** the badge count decrements by one.
3. **Given** a user has multiple unread notifications, **When** they mark one as read, **Then** the other notifications remain unread and their status is unchanged.

---

### Edge Cases

- What happens when a user has zero notifications? The bell icon displays without a badge and the panel/screen shows an empty state message.
- What happens when a notification references a class that was cancelled? The notification is still displayed but the navigation link shows the class as cancelled.
- What happens when a notification is received while the user is viewing the notification panel? The new notification appears at the top of the list and the badge count updates.
- What happens when the network is unavailable? The app displays cached notifications if available, otherwise shows an appropriate error message.
- What happens when a user taps a notification that has already been read? The notification remains read and navigation proceeds normally.

## Requirements

### Functional Requirements

- **FR-001**: System MUST display a bell icon with an unread notification count badge in the application header for all authenticated users.
- **FR-002**: System MUST provide a GET /notifications endpoint that returns notifications for the authenticated user.
- **FR-003**: System MUST support pagination on the GET /notifications endpoint.
- **FR-004**: System MUST support an unread-only filter parameter on the GET /notifications endpoint.
- **FR-005**: System MUST provide a PATCH /notifications/:id/read endpoint that marks a single notification as read.
- **FR-006**: Admin and Coach users MUST see only the current day's notifications in a dropdown panel when clicking the bell icon.
- **FR-007**: Coachee users MUST have access to a dedicated notifications screen showing full chronological notification history.
- **FR-008**: Each notification MUST display content, timestamp, and read/unread status.
- **FR-009**: Tapping or clicking an unread notification MUST mark it as read and update the badge count.
- **FR-010**: Tapping a notification linked to a class MUST navigate the user to the relevant class detail screen.
- **FR-011**: System MUST update the unread badge count in real time when notifications are received or marked as read.
- **FR-012**: System MUST display an empty state message when no notifications are available for the current view.

### Key Entities

- **Notification**: Represents an alert sent to a user. Key attributes: content (text of the alert), timestamp (when the notification was created), read status (whether the user has viewed it), linked resource (optional reference to a class or other entity), recipient (the user who receives the notification).
- **User**: The person interacting with the system. Has a role (Admin, Coach, or Coachee) that determines how notifications are displayed and accessed.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Users can view their unread notification count in the header badge within 1 second of logging in.
- **SC-002**: 95% of notification taps result in successful navigation to the linked class detail screen (where applicable).
- **SC-003**: Admins and Coaches can review all of today's notifications within 30 seconds of clicking the bell icon.
- **SC-004**: Coachees can scroll through their full notification history without performance degradation for up to 500 notifications.
- **SC-005**: Marking a notification as read updates the badge count within 2 seconds.
- **SC-006**: System handles 100 concurrent users viewing notifications without degradation.

## Assumptions

- Users have a valid authenticated session to access notifications.
- The existing notification generation system (e.g., class bookings, cancellations, schedule changes) is already in place or will be implemented separately.
- The Coachee notifications screen is accessible via a navigation route (e.g., /notifications).
- Notifications are stored server-side and fetched via API; client-side caching may be used for performance.
- The notification content is pre-defined by the system and not user-editable.
- Mobile-first design principles apply for the Coachee experience (PWA-compatible).
- Pagination defaults to 20 notifications per page unless otherwise specified.
