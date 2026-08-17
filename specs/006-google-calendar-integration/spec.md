# Feature Specification: Google Calendar Integration

**Created**: 2026-07-29

**Status**: Draft

**Input**: User description: "Implement remaining tasks for US-2.1: Google Calendar as Scheduling Engine — define CalendarProvider port, implement GoogleCalendarAdapter, server-side free/busy queries, no PII in event titles, error handling with 503 + unique error ref, calendar health monitoring with >5% failure rate alerting"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Developer defines CalendarProvider port and GoogleCalendarAdapter (Priority: P1)

As a developer, I want a domain-level CalendarProvider port interface and a GoogleCalendarAdapter that implements it so that the scheduling engine can create, update, and delete calendar events and query free/busy without being coupled to the Google Calendar API.

**Why this priority**: This is the foundational layer — all calendar operations depend on the port-adapter pattern being in place.

**Independent Test**: A test script can instantiate the GoogleCalendarAdapter, authenticate using the existing Service Account credentials, and successfully create, read, update, and delete an event on the configured system calendar.

**Acceptance Scenarios**:

1. **Given** a CalendarProvider port interface in the domain layer, **When** any application code references it, **Then** it depends only on the interface (no Google Calendar types or imports leak into domain or application layers)
2. **Given** a GoogleCalendarAdapter implementing the CalendarProvider port, **When** `createEvent` is called with valid class/block data, **Then** a new event is created on Google Calendar and the Google event ID is returned
3. **Given** a GoogleCalendarAdapter, **When** `updateEvent` is called with an existing Google event ID and updated data, **Then** the corresponding Google Calendar event is updated
4. **Given** a GoogleCalendarAdapter, **When** `deleteEvent` is called with an existing Google event ID, **Then** the corresponding Google Calendar event is deleted
5. **Given** a GoogleCalendarAdapter, **When** `queryFreeBusy` is called with a time range, **Then** it returns free/busy information for the system calendar

---

### User Story 2 - System syncs classes and blocks to Google Calendar (Priority: P1)

As a system, when an admin or coach creates, updates, or deletes a class or time block, I want the corresponding Google Calendar event to be created, updated, or deleted automatically so that Google Calendar remains the authoritative scheduling source.

**Why this priority**: This is the core business value — without automatic sync, Google Calendar would not reflect actual classes and blocks.

**Independent Test**: An admin creates a class via the API; a corresponding event appears on the system Google Calendar within 5 seconds. The event title contains only the class type and level (no coach or coachee names).

**Acceptance Scenarios**:

1. **Given** a new TrainingClass is created, **When** the creation is committed, **Then** a Google Calendar event is created and the event's `google_event_id` is stored on the TrainingClass record
2. **Given** an existing TrainingClass with a `google_event_id` is updated, **When** the update is committed, **Then** the corresponding Google Calendar event is updated
3. **Given** an existing TrainingClass with a `google_event_id` is deleted, **When** the deletion is committed, **Then** the corresponding Google Calendar event is deleted
4. **Given** a new Block is created, **When** the creation is committed, **Then** a Google Calendar event is created and the event's `google_event_id` is stored on the Block record
5. **Given** an existing Block with a `google_event_id` is deleted, **When** the deletion is committed, **Then** the corresponding Google Calendar event is deleted
6. **Given** any event created on the system calendar, **When** the event's title is inspected, **Then** it contains only the class type (e.g., "Yoga", "HIIT") and level (e.g., "Beginner", "Intermediate") — no coach name, coachee name, email, or any personally identifiable information (PII)

---

### User Story 3 - System checks availability via server-side free/busy (Priority: P1)

As a system, when determining scheduling availability (for classes or blocks), I want to query Google Calendar's free/busy API server-side so that no browser-to-Google API calls are needed, ensuring credentials remain server-side only.

**Why this priority**: Security requirement — Service Account credentials must never be exposed to the browser.

**Independent Test**: The backend can call `queryFreeBusy` for the system calendar and receive accurate availability data for a given time range, without any client-side Google API calls.

**Acceptance Scenarios**:

1. **Given** a time range and a list of calendar IDs, **When** `queryFreeBusy` is called server-side, **Then** it returns the busy time intervals for each queried calendar
2. **Given** the system needs to check coach or gym availability, **When** availability is evaluated, **Then** all Google Calendar queries are performed exclusively by the backend (no Google API tokens, keys, or SDKs are loaded in the browser)
3. **Given** a free/busy query overlapping with existing events, **When** the query completes, **Then** the overlapping time slots are correctly marked as busy

---

### User Story 4 - System handles Google Calendar errors gracefully (Priority: P1)

As a system, when Google Calendar API returns an error (network failure, quota exceeded, auth failure, etc.), I want the error to be caught and a 503 response with a unique error reference to be returned so that the system degrades gracefully and errors are traceable.

**Why this priority**: Reliability requirement — unhandled calendar errors could cause data inconsistency or confusing user-facing errors.

**Independent Test**: When Google Calendar API is unavailable (simulated), creating a class returns a 503 response with a unique error reference, and no partial data is persisted.

**Acceptance Scenarios**:

1. **Given** a Google Calendar API call fails, **When** the adapter catches the error, **Then** it wraps it in a `ServiceUnavailableError` with a unique UUID reference
2. **Given** a Google Calendar API error occurs during class creation, **When** the error is caught, **Then** the class creation transaction is rolled back (no partial state — the class is not created if the calendar event fails)
3. **Given** a Google Calendar API error occurs during class update or deletion, **When** the error is caught, **Then** the error is logged with the unique ref and a 503 is returned to the caller
4. **Given** a 503 error response, **When** inspected, **Then** it follows the standard error envelope format `{ error: { code, message, ref } }` with `code` = `SERVICE_UNAVAILABLE` and `ref` = a valid UUID

---

### User Story 5 - Admin monitors Google Calendar health (Priority: P2)

As an admin, I want the system to track Google Calendar API call success/failure rates and alert when the failure rate exceeds 5% in a 5-minute window so that I can respond to calendar integration issues proactively.

**Why this priority**: Operational excellence — without monitoring, calendar integration failures could go unnoticed, causing silent data inconsistency.

**Independent Test**: After simulating a 6% failure rate over 5 minutes, the health monitoring system logs an alert and exposes the degraded status via a health endpoint.

**Acceptance Scenarios**:

1. **Given** a calendar health monitor, **When** each Google Calendar API call completes (success or failure), **Then** the outcome is recorded with a timestamp
2. **Given** a rolling 5-minute window of API call outcomes, **When** the failure rate exceeds 5%, **Then** an alert is logged via the audit logger or application logger
3. **Given** a health check endpoint, **When** the calendar integration health is queried, **Then** it returns the current status (healthy/degraded/offline) with the current failure rate and total call count
4. **Given** normal operation (failure rate below 5%), **When** the health endpoint is queried, **Then** the status is reported as healthy

---

### Edge Cases

- What happens when the Service Account key is rotated while the application is running? The adapter should fail to authenticate and return a 503; after the new key is deployed and the application restarted, normal operation resumes.
- What happens when Google Calendar API rate limits are exceeded? The adapter should catch the 403/429 response and return a 503 with a unique ref.
- What happens when a calendar event is deleted manually from Google Calendar (not through the app)? The system will have a stale `google_event_id`; the next update attempt should handle the "not found" error gracefully and either recreate the event or return a 503.
- What happens if multiple classes are created simultaneously? Each class event creation is independent; the adapter should handle concurrent requests correctly.
- What happens when the system calendar ID is misconfigured? All calendar API calls will fail with a 503 until the configuration is corrected.
- What happens with recurring class series? Each individual class instance in the series creates its own calendar event; the adapter treats each instance independently.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The domain layer MUST define a `CalendarProvider` port interface with methods for `createEvent`, `updateEvent`, `deleteEvent`, and `queryFreeBusy` — this interface MUST NOT reference any Google Calendar types, SDKs, or implementation details
- **FR-002**: A `GoogleCalendarAdapter` MUST implement the `CalendarProvider` port using the Google Calendar v3 API authenticated via the existing Service Account (JSON key file)
- **FR-003**: The `GoogleCalendarAdapter` MUST authenticate using the existing Service Account credentials loaded from environment configuration (no hardcoded paths or keys)
- **FR-004**: The `createEvent` method MUST accept event data (title, description, start time, end time, timezone) and return the Google Calendar event ID
- **FR-005**: The `updateEvent` method MUST accept a Google event ID and updated event data, then update the corresponding event on Google Calendar
- **FR-006**: The `deleteEvent` method MUST accept a Google event ID and delete the corresponding event from Google Calendar
- **FR-007**: The `queryFreeBusy` method MUST accept a time range (start, end) and optional list of calendar IDs, then return busy intervals from Google Calendar
- **FR-008**: Google Calendar event titles MUST identify the class: individual classes use the coachee name + level (e.g., "Juan Pérez - Intermedio"), group classes use "Group class" + level (e.g., "Group class - Intermedio"); the event description MUST include the assigned coach name, recurrence status, user-added notes, and (for group classes) the list of enrolled coachees
- **FR-009**: All Google Calendar API errors MUST be caught by the adapter and wrapped in a `ServiceUnavailableError` (HTTP 503) with a unique UUID error reference following the standard error envelope format
- **FR-010**: When a class or block is created, the system MUST create a corresponding Google Calendar event and persist the returned `google_event_id` on the database record; if the Google Calendar API call fails, the entire operation MUST be rolled back (no partial state)
- **FR-011**: When a class or block with an existing `google_event_id` is updated, the system MUST update the corresponding Google Calendar event
- **FR-012**: When a class or block with an existing `google_event_id` is deleted, the system MUST delete the corresponding Google Calendar event
- **FR-013**: A calendar health monitor MUST track the outcome (success/failure) and timestamp of every Google Calendar API call
- **FR-014**: The calendar health monitor MUST compute the failure rate over a rolling 5-minute window
- **FR-015**: When the failure rate exceeds 5% in the rolling 5-minute window, the monitor MUST log an alert and expose the degraded status via a health endpoint
- **FR-016**: All Google Calendar API calls MUST be made server-side only; no Google API credentials, tokens, or SDKs may be loaded or executed in the browser

### Key Entities *(include if feature involves data)*

- **CalendarProvider (Port)**: A domain-layer interface that abstracts calendar operations. Decouples the scheduling engine from any specific calendar service provider. Methods: `createEvent`, `updateEvent`, `deleteEvent`, `queryFreeBusy`.
- **GoogleCalendarAdapter (Adapter)**: An infrastructure-layer implementation of the CalendarProvider port. Uses the `googleapis` library and Service Account credentials to interact with Google Calendar v3 API. Resolves the active calendar ID based on the current environment (dev/staging/prod).
- **Google Calendar Event**: A remote resource on Google Calendar representing a class session or time block. Identified by a Google event ID string. Contains a title (individual: coachee name + level; group: "Group class" + level), start/end times, timezone, and a description with coach, recurrence status, notes, and (group) enrolled coachees.
- **Calendar Health Monitor**: An infrastructure component that records API call outcomes, computes rolling failure rates, and exposes health status. Runs in-process (no external monitoring service required for v1).

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Creating a class or block results in a corresponding Google Calendar event appearing on the system calendar within 5 seconds of the API call completing
- **SC-002**: Updating a class or block updates the corresponding Google Calendar event title and times within 5 seconds
- **SC-003**: Deleting a class or block removes the corresponding Google Calendar event within 5 seconds
- **SC-004**: A free/busy query for a given time range returns accurate busy intervals within 5 seconds
- **SC-005**: No Google API credentials, tokens, or SDKs are present in any browser-delivered JavaScript bundle (verified by code inspection and frontend build analysis)
- **SC-006**: A simulated Google Calendar API failure during class creation results in a 503 error with a unique UUID `ref`, and no class record is persisted to the database
- **SC-007**: A simulated 6% failure rate over a 5-minute window triggers a health alert (logged) and the health endpoint reports degraded status with the failure rate
- **SC-008**: All Google Calendar event titles inspected on the system calendar follow the pattern "coachee name - level" for individual classes and "Group class - level" for group classes, with the event description containing the assigned coach, recurrence status, notes, and (for group classes) the enrolled coachees

## Assumptions

- The Google Cloud project, Service Account, JSON key, and system calendars (dev/staging/prod) are already provisioned by the preceding infrastructure setup task (Task 1 of COACHER-16).
- The existing environment variables (`GOOGLE_CALENDAR_SA_EMAIL`, `GOOGLE_CALENDAR_SA_KEY_PATH`, `GOOGLE_CALENDAR_ID_DEV`, etc.) are available and correctly configured.
- Class duration is always 60 minutes (per project convention).
- Calendar events are one-off instances; recurring series events are created individually per instance.
- Health monitoring operates in-process with in-memory tracking; no external monitoring system (e.g., Prometheus, Datadog) is required for v1. Persistent health metrics across restarts are out of scope.
- The system calendar should not be queried for free/busy from the frontend under any circumstance.
- The `google_event_id` field exists on both `TrainingClass` and `Block` Prisma models and is ready for use.
