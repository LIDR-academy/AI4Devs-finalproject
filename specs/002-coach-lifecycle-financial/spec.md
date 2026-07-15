# Feature Specification: Coach Lifecycle & Financial Data

**Feature Branch**: `002-coach-lifecycle-financial`

**Created**: 2026-07-15

**Status**: Draft

**Input**: Linear issue COACHER-14 — "As an Admin, I want to add, view, update, and access Coach profiles and financial data, So that I can manage my coaching staff."

## User Scenarios & Testing

### User Story 1 — Admin Creates a Coach with Financial Data (Priority: P1)

The Admin adds a new coach with both profile information and sensitive financial data (bank account, SSN, DNI). Financial data must be encrypted before storage and never exposed through the coach's general profile.

**Why this priority**: Coach creation is the entry point for managing coaching staff, and financial data handling is a security requirement that affects system architecture.

**Independent Test**: Can be fully tested by creating a new coach with valid profile and financial fields, then verifying the coach appears in the coach list and that financial data cannot be retrieved through the general profile endpoint.

**Acceptance Scenarios**:

1. **Given** an authenticated Admin user, **When** they submit a create request with valid profile fields (name, email, phone, specialities) and financial fields (bank account, SSN, DNI), **Then** the coach is created and a success response with the coach's profile (excluding financial data) is returned.
2. **Given** an authenticated Admin user, **When** they submit a create request with a duplicate email, **Then** the system returns an error indicating the email already exists.
3. **Given** an authenticated Admin user, **When** they submit a create request with missing required fields, **Then** the system returns a validation error indicating which fields are required.
4. **Given** a newly created coach, **When** the stored financial data is inspected at rest, **Then** the bank account, SSN, and DNI fields are encrypted using AES-256-GCM.

---

### User Story 2 — Admin Lists and Views Coaches (Priority: P1)

The Admin can browse all coaches with pagination and status filtering, and view detailed profiles of individual coaches.

**Why this priority**: Basic read operations are essential for day-to-day staff management and must work reliably.

**Independent Test**: Can be fully tested by viewing the paginated coach list with active/inactive filters and requesting a specific coach's profile.

**Acceptance Scenarios**:

1. **Given** an authenticated Admin user, **When** they request the list of all coaches, **Then** the system returns a paginated list with coach summary information (name, email, status) and no financial data.
2. **Given** an authenticated Admin user, **When** they filter the coach list by status (active/inactive), **Then** the system returns only coaches matching the selected status.
3. **Given** an authenticated Admin user, **When** they view a specific coach's profile, **Then** the system returns full coach details (name, email, phone, specialities, status) excluding all financial data fields.
4. **Given** an authenticated Admin user, **When** they attempt to view a non-existent coach, **Then** the system returns a not-found error.

---

### User Story 3 — Admin Updates Coach Profile and Lifecycle Status (Priority: P2)

The Admin can update individual coach profile fields and activate/deactivate coaches as staffing changes occur.

**Why this priority**: Keeping coach records current and managing active status is necessary for accurate scheduling and reporting.

**Independent Test**: Can be fully tested by updating a coach's profile fields, deactivating and reactivating, and verifying the changes are reflected.

**Acceptance Scenarios**:

1. **Given** an authenticated Admin user, **When** they update one or more profile fields of a coach (name, email, phone, specialities), **Then** the system applies the changes and returns the updated coach profile.
2. **Given** an authenticated Admin user and an active coach, **When** they deactivate the coach, **Then** the coach's status changes to inactive and is reflected in subsequent queries.
3. **Given** an authenticated Admin user and an inactive coach, **When** they activate the coach, **Then** the coach's status changes to active.
4. **Given** an authenticated Admin user, **When** they deactivate an already-inactive coach, **Then** the system handles this gracefully (no error or idempotent response).

---

### User Story 4 — Admin Accesses Financial Data via Dedicated Endpoint (Priority: P1)

The Admin can retrieve a coach's financial data through a dedicated, audited endpoint. This data is never included in list or general profile responses.

**Why this priority**: Financial data isolation is a security and compliance requirement that must be verified independently.

**Independent Test**: Can be fully tested by creating a coach with financial data, verifying the general profile endpoint does not expose it, and then retrieving it through the dedicated financial endpoint. The audit log must record the access.

**Acceptance Scenarios**:

1. **Given** an authenticated Admin user and an existing coach, **When** they request `GET /coaches/:id/financial`, **Then** the system returns the coach's decrypted financial data (bank account, SSN, DNI).
2. **Given** an authenticated Admin user, **When** they request the general coach profile or coach list, **Then** no financial data fields are present in any response.
3. **Given** a request to the financial endpoint, **Then** the access event is logged with timestamp, Admin user identity, coach ID, and action type.
4. **Given** a non-Admin user (Coach or Coachee), **When** they attempt to access the financial endpoint, **Then** the system returns 403 Forbidden and logs the attempted access as a security event.

---

### Edge Cases

- What happens when an Admin tries to create a coach without providing financial data? (financial fields should be required or optional depending on policy — assume required for this feature)
- What happens when the encryption key is rotated or unavailable? (system must handle decryption failures gracefully with a clear error)
- How does pagination behave when requesting a page beyond available data? (return empty results for that page)
- What happens when updating financial data — is there a separate endpoint? (not in scope for this feature; financial data is set at creation and updated via a future feature)
- How does the system respond when a non-Admin tries to access coach management endpoints? (403 Forbidden)

## Requirements

### Functional Requirements

- **FR-001**: System MUST allow Admin users to create a Coach with profile fields (name, email, phone, specialities) and financial fields (bank account, SSN, DNI).
- **FR-002**: System MUST encrypt financial data fields (bank account, SSN, DNI) with AES-256-GCM before persisting to storage.
- **FR-003**: System MUST validate that email is unique before creating a new Coach.
- **FR-004**: System MUST require name and email as mandatory fields on Coach creation.
- **FR-005**: System MUST return a paginated list of all Coaches with support for page number and page size parameters.
- **FR-006**: System MUST allow filtering the Coach list by status (active/inactive).
- **FR-007**: System MUST return a detailed Coach profile when requested by ID, including name, email, phone, specialities, and status — but NEVER financial data.
- **FR-008**: System MUST support partial updates to Coach profile fields (name, email, phone, specialities).
- **FR-009**: System MUST allow Admin to change a Coach's status between active and inactive.
- **FR-010**: System MUST provide a dedicated `GET /coaches/:id/financial` endpoint that returns decrypted financial data.
- **FR-011**: System MUST log every access to the financial endpoint as a security event with timestamp, Admin identity, coach ID, and action type.
- **FR-012**: System MUST return 403 Forbidden when a non-Admin user attempts to access any Coach management or financial endpoint.
- **FR-013**: System MUST log 403 access attempts to the financial endpoint as a security event.
- **FR-014**: System MUST handle decryption failures gracefully, returning a clear error without exposing stack traces or system internals.
- **FR-015**: System MUST return clear validation error messages when required fields are missing or invalid.

### Key Entities

- **Coach**: Represents a staff member who delivers training. Key attributes: name, email, phone, specialities, status (active/inactive). A Coach is distinct from system users (Coachee, Admin) and has the Coach role.
- **CoachFinancialData**: Contains sensitive financial information associated with a Coach. Attributes: bank account (encrypted), SSN (encrypted), DNI (encrypted). Stored in a separate data structure from the Coach profile to enforce access isolation.
- **SecurityAuditLog**: Records security-relevant events. Attributes: timestamp, actor identity, action type, target resource, outcome. Used to track access to the financial endpoint.

## Success Criteria

### Measurable Outcomes

- **SC-001**: Admin can complete the full coach creation flow (profile + financial data) in under 3 minutes with valid data.
- **SC-002**: Paginated Coach list with active filter returns results within 2 seconds for up to 1,000 coaches.
- **SC-003**: 100% of financial data stored at rest is encrypted using industry-standard encryption (verifiable by inspecting storage).
- **SC-004**: 100% of non-Admin access attempts to financial endpoint are rejected with 403 and logged.
- **SC-005**: Zero financial data fields leak into coach list or general profile responses (verifiable by automated test).
- **SC-006**: Financial endpoint access logs capture Admin identity, timestamp, and coach ID for 100% of requests.

## Assumptions

- Existing authentication and authorization system handles JWT validation and role-based access control (Admin and Coach roles are already defined).
- AES-256-GCM encryption utilities are available or can be implemented as an infrastructure adapter.
- Financial data is set during coach creation and does not require a dedicated update endpoint in this feature (updates via separate feature).
- Security audit logging infrastructure exists or can be created following project standards.
- The Coach entity is distinct from system User entities but linked via a foreign key or shared identity.
- Bank account, SSN, and DNI are required fields for coach creation (no partial financial data).
- Duplicate phone numbers are allowed across different Coaches.
- Deactivating a Coach does not delete their data or prevent viewing their profile.
- API endpoints follow the existing convention (`/api/v1/coaches/...`) with standard response envelopes.
