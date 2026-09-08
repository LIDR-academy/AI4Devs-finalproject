# Feature Specification: Level System & Role-Based UI

**Feature Branch**: `003-level-system-role-ui`

**Created**: 2026-07-15

**Status**: Draft

**Input**: User description: "US-1.4: Level System & Role-Based UI — Add training level assignment for Coachees and role-specific layouts (Admin sidebar, Coach sidebar, Coachee bottom nav) with responsive design"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin views role-specific layout (Priority: P1)

As an Admin, I want to see a sidebar navigation with Today, Calendar, Coachees, and Coaches sections so that I can manage all aspects of the platform.

**Why this priority**: The role-based layout is the foundation for all user interactions; without it, users cannot navigate the platform.

**Independent Test**: Log in as an Admin and verify the sidebar contains exactly 4 navigation items: Today, Calendar, Coachees, Coaches.

**Acceptance Scenarios**:

1. **Given** an authenticated Admin user, **When** they log into the platform, **Then** they see a sidebar with links to Today, Calendar, Coachees, and Coaches
2. **Given** an Admin on any page, **When** they click a sidebar link, **Then** they are navigated to the corresponding section
3. **Given** an unauthenticated user, **When** they try to access an Admin route, **Then** they are redirected to the login page

---

### User Story 2 - Coach views role-specific layout (Priority: P1)

As a Coach, I want to see a sidebar navigation with Today, Calendar, and Coachees sections (no Coaches) so that I can manage my coachees and schedule appropriately.

**Why this priority**: Coaches are primary daily users of the platform.

**Independent Test**: Log in as a Coach and verify the sidebar contains exactly 3 items (Today, Calendar, Coachees) and no Coaches item.

**Acceptance Scenarios**:

1. **Given** an authenticated Coach user, **When** they log into the platform, **Then** they see a sidebar with links to Today, Calendar, and Coachees
2. **Given** a Coach user, **When** they view the sidebar, **Then** they do NOT see a Coaches link
3. **Given** a Coach, **When** they try to access a Coaches-only route, **Then** they are redirected to their default view

---

### User Story 3 - Coachee views role-specific layout (Priority: P1)

As a Coachee, I want to see a mobile-first bottom navigation with Home, Calendar, and Notifications so that I can easily access my training information on any device.

**Why this priority**: Coachees are the end customers and need a mobile-friendly experience.

**Independent Test**: Log in as a Coachee and verify the bottom navigation bar contains 3 tabs: Home, Calendar, Notifications.

**Acceptance Scenarios**:

1. **Given** an authenticated Coachee user, **When** they log into the platform, **Then** they see a bottom navigation bar with Home, Calendar, and Notifications
2. **Given** a Coachee, **When** they tap a bottom nav item, **Then** they are navigated to the corresponding section
3. **Given** a Coachee, **When** they try to access an Admin or Coach route, **Then** they are redirected to their default view

---

### User Story 4 - Admin/Coach assigns training level to Coachee (Priority: P1)

As an Admin or Coach, I want to assign or change a Coachee's training level at any time so that I can manage their progression through the training program.

**Why this priority**: Level assignment is a core business capability that enables the training progression model.

**Independent Test**: From a Coachee's profile page, select a new level from a dropdown and save; verify the level updates immediately.

**Acceptance Scenarios**:

1. **Given** an authenticated Admin or Coach viewing a Coachee's profile, **When** they select a new training level and save, **Then** the Coachee's level is updated and persisted
2. **Given** a Coachee whose level has been changed, **When** they refresh their UI, **Then** they see their new level reflected
3. **Given** an Admin or Coach changing a Coachee's level, **When** the change is saved, **Then** the audit log records the actor ID, action, resource, and outcome

---

### User Story 5 - System seeds training levels (Priority: P2)

As the system, I want to initialize 5 training levels with names, colors, and sort order so that the platform has a predefined progression structure on first setup.

**Why this priority**: Levels are needed for assignment but seeding is a one-time setup task.

**Independent Test**: Run the seed script and verify via API that exactly 5 levels exist with correct names.

**Acceptance Scenarios**:

1. **Given** a fresh database, **When** the seed script runs, **Then** the following levels exist: Principiante, Básico, Intermedio, Avanzado, Experto
2. **Given** seeded levels, **When** retrieved via the API, **Then** each level has a unique color and a sort order value

---

### Edge Cases

- What happens when a Coachee's level is changed while a class is in progress? (Level should update immediately; no impact on the current class)
- What happens when a user's role is changed? (Their UI layout should update on next page load or navigation)
- How does the system handle an unrecognized or corrupted role claim? (Redirect to default view or show an error with a contact-support message)
- What happens when a Coachee with no assigned level views the platform? (Show "No level assigned" indicator; prompt Admin/Coach to assign)
- What happens when a user tries to assign a non-existent level? (System should reject with a clear error)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: The system MUST seed exactly 5 training levels: Principiante, Básico, Intermedio, Avanzado, Experto, each with a distinct color and ascending sort order. Levels are immutable after seeding — no add, edit, reorder, or delete operations are supported
- **FR-002**: Admin and Coach users MUST be able to assign or change a Coachee's training level through the Coachee profile UI. Coach scope is all Coachees in the system (not restricted to assigned coachees)
- **FR-003**: Level changes MUST be persisted immediately and reflected in the Coachee's view upon next load
- **FR-004**: Admin layout MUST display a sidebar navigation with 4 items: Today, Calendar, Coachees, Coaches
- **FR-005**: Coach layout MUST display a sidebar navigation with 3 items: Today, Calendar, Coachees
- **FR-006**: Coach layout MUST NOT include the Coaches navigation item
- **FR-007**: Coachee layout MUST display a bottom navigation bar with 3 items: Home, Calendar, Notifications
- **FR-008**: Unauthorized access to a role-specific route MUST redirect the user to their appropriate default view
- **FR-009**: All role layouts MUST include a notifications bell icon (placeholder) in the header bar
- **FR-010**: Admin and Coach layouts MUST be optimized for desktop screens (1024px minimum)
- **FR-011**: Coachee layout MUST be mobile-first and responsive across all device sizes down to 320px
- **FR-012**: Every level change operation MUST be logged with actor ID, action, resource, and outcome

### Key Entities *(include if feature involves data)*

- **TrainingLevel**: Represents a proficiency tier in the training system. Key attributes: name (string), color (hex code), sortOrder (integer). Pre-seeded with 5 fixed values. Immutable — no create, update, or delete operations supported.
- **Coachee (User)**: Has a reference to a TrainingLevel. Admin/Coach can update this assignment at any time.
- **LevelAssignment (AuditLog entry)**: Records when a Coachee's level is changed, storing previous level, new level, actor, and timestamp.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: After seeding, exactly 5 levels exist with distinct names, colors, and sequential sort order (1-5)
- **SC-002**: Admin or Coach can change a Coachee's level in 3 or fewer clicks from the Coachee's profile
- **SC-003**: Level change is reflected in the Coachee's UI within 2 seconds of saving
- **SC-004**: Admin sidebar renders all 4 navigation items correctly on desktop viewport (1024px+)
- **SC-005**: Coach sidebar renders 3 navigation items (no Coaches link) correctly on desktop viewport
- **SC-006**: Coachee bottom navigation renders all 3 items correctly on mobile viewport (320px-768px)
- **SC-007**: Unauthorized route access completes redirect in under 1 second
- **SC-008**: Notifications bell icon is visible in the header across all 3 role views
- **SC-009**: 100% of level change operations are recorded in the audit log with all required fields

## Clarifications

### Session 2026-07-15

- Q: Can a Coach change ANY Coachee's level or only their own assigned Coachees? → A: Coach can change any Coachee's level (global scope, same as Admin)
- Q: Should the system support Admin-level CRUD for training levels or are they fixed to the 5 seeded values? → A: Fixed/immutable — the 5 seeded levels are permanent and never change

## Assumptions

- Authentication and JWT-based role extraction are already implemented from a prior sprint
- Role-based route protection middleware already exists or will be built alongside this feature
- The notifications bell icon is a visual placeholder; actual notification push/read functionality is out of scope for this feature
- Admin and Coach work primarily on desktop; Coachee primarily on mobile devices
- Training levels are global across all Coachees (not per-coach or per-class) and are immutable after seeding
- Level assignment is accessible from the Coachee detail/profile view
- Color values for levels will be refined during design; a sensible default palette (e.g., green-to-gold progression) is acceptable for initial implementation
- Sort order values 1-5 correspond to Principiante→Experto progression
