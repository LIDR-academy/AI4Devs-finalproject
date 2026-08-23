# Feature Specification: Coachee Lifecycle Management

**Feature Branch**: `001-coachee-lifecycle-management`

**Created**: 2026-07-13

**Status**: Draft

**Input**: User description: "As an Admin, I want to add, view, update, filter, and manage Coachees, So that I can onboard and track my clients."

## User Scenarios & Testing

### User Story 1 - Admin Creates and Lists Coachees (Priority: P1)

The Admin adds a new coachee with their personal details to onboard them into the system. Once created, the Admin can browse all coachees with pagination and filters to find specific individuals.

**Why this priority**: Onboarding is the first action in the coachee lifecycle and unblocks all downstream workflows (class booking, progress tracking).

**Independent Test**: Can be fully tested by creating a new coachee with valid data and verifying they appear in the paginated list, delivering the ability to onboard clients.

**Acceptance Scenarios**:

1. **Given** an authenticated Admin user, **When** they submit a create request with valid name, email, phone, level, and class type preference, **Then** the coachee is created and a success response with the coachee details is returned.
2. **Given** an authenticated Admin user, **When** they submit a create request with a duplicate email, **Then** the system returns an error indicating the email already exists.
3. **Given** an authenticated Admin user, **When** they submit a create request with missing required fields, **Then** the system returns a validation error indicating which fields are required.
4. **Given** an authenticated Admin user, **When** they request the list of all coachees, **Then** the system returns a paginated list with coachee summary information (name, email, status, level).
5. **Given** an authenticated Admin user, **When** they apply filters by coachee status (active/inactive) and level, **Then** the system returns only coachees matching the selected filters.

---

### User Story 2 - Admin Views and Updates Coachee Profiles (Priority: P1)

The Admin can view a detailed profile of any coachee and update specific fields when information changes.

**Why this priority**: Maintaining accurate client information is essential for ongoing client management and communication.

**Independent Test**: Can be fully tested by viewing a coachee's profile, updating fields, and verifying the changes are reflected, delivering the ability to keep client records current.

**Acceptance Scenarios**:

1. **Given** an authenticated Admin user, **When** they view a specific coachee's profile, **Then** the system returns full coachee details including name, email, phone, level, status, and class type preference (but no financial data).
2. **Given** an authenticated Admin user, **When** they update one or more fields of a coachee's profile using a partial update, **Then** the system applies the changes and returns the updated coachee details.
3. **Given** an authenticated Admin user, **When** they attempt to view a non-existent coachee, **Then** the system returns a not-found error.

---

### User Story 3 - Admin Manages Coachee Lifecycle Status (Priority: P2)

The Admin can activate or deactivate a coachee and change their level as their training progresses.

**Why this priority**: Active/inactive management keeps the system clean and accurate, while level changes track the coachee's progression through their training journey.

**Independent Test**: Can be fully tested by deactivating a coachee, verifying they are marked inactive, then reactivating and verifying the status change, delivering lifecycle state management.

**Acceptance Scenarios**:

1. **Given** an authenticated Admin user and an active coachee, **When** the Admin deactivates the coachee, **Then** the coachee's status changes to inactive and is reflected in subsequent queries.
2. **Given** an authenticated Admin user and an inactive coachee, **When** the Admin activates the coachee, **Then** the coachee's status changes to active.
3. **Given** an authenticated Admin user, **When** they change a coachee's level, **Then** the level is updated and the notification system is triggered.
4. **Given** an authenticated Admin user, **When** they deactivate an already-inactive coachee, **Then** the system handles this gracefully (no error or idempotent response).

---

### Edge Cases

- What happens when an Admin creates a coachee with a phone number already used by another coachee? (should accept, phone is not a unique identifier unless specified otherwise)
- How does the system handle pagination requests beyond the available data? (empty results page)
- What happens when changing the level triggers a notification but the notification system is unavailable? (graceful degradation or logged failure)
- How does the system respond when a non-Admin (Coach or Coachee) tries to access coachee management endpoints? (403 Forbidden)
- What happens when an Admin tries to view a coachee profile that has been deactivated? (profile is still viewable, deactivation affects operations not visibility)

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow Admin users to create a Coachee with name, email, phone, level, and class type preference.
- **FR-002**: System MUST validate that email is unique before creating a new Coachee.
- **FR-003**: System MUST require name and email as mandatory fields on Coachee creation.
- **FR-004**: System MUST return a paginated list of all Coachees with support for page number and page size parameters.
- **FR-005**: System MUST allow filtering the Coachee list by status (active/inactive) and level, supporting multi-select for both filters.
- **FR-006**: System MUST return a detailed Coachee profile when requested by ID, including name, email, phone, level, status, and class type preference.
- **FR-007**: System MUST support partial updates to Coachee profile fields (name, email, phone, class type preference).
- **FR-008**: System MUST allow Admin to change a Coachee's status between active and inactive.
- **FR-009**: System MUST allow Admin to change a Coachee's level, and this change MUST trigger a notification as specified in EP-04 notification #11.
- **FR-010**: System MUST return 403 Forbidden when a non-Admin user attempts to access any Coachee management endpoint.
- **FR-011**: System MUST NOT expose any financial data in Coachee-related endpoint responses.
- **FR-012**: System MUST return clear validation error messages when required fields are missing or invalid.

### Key Entities

- **Coachee**: Represents a client being trained. Key attributes: name, email, phone, assigned level (reference to Level entity), status (active/inactive), class type preference (individual/group). A Coachee is distinct from system users (Coach, Admin).
- **Level**: Represents a training level (pre-existing seed data with 5 levels). Referenced by Coachee to track progression.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Admin can complete the full coachee creation flow in under 2 minutes with valid data.
- **SC-002**: Paginated Coachee list with active filters returns results within 2 seconds for up to 10,000 coachees.
- **SC-003**: 100% of non-Admin access attempts to Coachee management endpoints are rejected with 403.
- **SC-004**: Coachee profile updates are reflected immediately in subsequent read requests (eventual consistency not acceptable).
- **SC-005**: Level change notifications are triggered successfully for at least 99% of level change operations.

## Assumptions

- Existing authentication and authorization system handles JWT validation and role-based access control (Admin role is already defined).
- The Level entity already exists in the system with 5 predefined levels from seed data.
- The notification system (referenced as EP-04, notification #11) exists and is available for level change notifications.
- Coachees are system users with the Coachee role, but their credential setup / invitation flow is assumed to be handled by a separate auth process (out of scope for this feature).
- Duplicate phone numbers are allowed across different Coachees.
- Deactivating a Coachee does not delete their data or prevent viewing their profile.
- API endpoints follow the existing convention (`/api/v1/coachees/...`) with standard response envelopes.
