# EP-02: Core Scheduling Engine

## Milestone
**Coaches and Admins can schedule and manage classes visually.**

## Description
Implement Google Calendar as the internal scheduling engine, class CRUD with business rules, block management, and a full visual calendar UI for Admin and Coach roles. After this epic, the gym can operate its daily scheduling through the platform.

## Priority: High
## Dependencies: EP-01 (Auth & User Foundation)

---

## User Stories

### US-2.1: Google Calendar as Scheduling Engine

**As a** system,  
**I want** Google Calendar to be the internal scheduling source via a Service Account,  
**So that** availability is always accurate and scheduling conflicts are prevented.

**Acceptance Criteria:**
- [ ] Google Cloud project created with Calendar API enabled
- [ ] Service Account with private calendar configured (no user has direct access)
- [ ] `CalendarProvider` port interface defined in domain layer (decoupled from Google)
- [ ] `GoogleCalendarAdapter` implements the port (create, update, delete events, free/busy query)
- [ ] Free/busy is queried server-side only (no browser-to-Google API calls)
- [ ] Google Calendar event titles identify the class: individual = "coachee name - level", group = "Group class - level"; description includes coach, recurrence status, notes, and enrolled coachees (group)
- [ ] Google Calendar errors are caught and return 503 with a unique error ref
- [ ] Calendar health monitoring tracks failure rate (>5% in 5 min → alert)

**Task File:** `userStories/US-2.1-google-calendar-integration.md`

---

### US-2.2: Class Creation (Individual, Group, Recurring)

**As a** Coach or Admin,  
**I want** to create individual and group classes (including weekly recurring series) with proper validation,  
**So that** training sessions are scheduled correctly.

**Acceptance Criteria:**
- [ ] Individual class: exactly 1 Coachee, max 2 concurrent individual classes
- [ ] Group class: min 3, max 4 Coachees, single group at a time
- [ ] Level is required for group classes (hidden for individual)
- [ ] Assigned Coach defaults to creator; can select another Coach
- [ ] Gym capacity: max 2 individual + 1 group simultaneously
- [ ] Overlap check: Coachee cannot be in two overlapping classes; Coach cannot have overlapping assignments
- [ ] Level reach: Coachee's level must match, one above, or one below class level
- [ ] Recurring series: weekly instances generated (same day/time/level/coach)
- [ ] Google Calendar event created for each class instance
- [ ] All duration is fixed at 60 minutes

**Task File:** `userStories/US-2.2-class-creation.md`

---

### US-2.3: Class Viewing & Cancellation

**As a** Coach or Admin,  
**I want** to view, filter, and cancel classes,  
**So that** I can manage the schedule effectively.

**Acceptance Criteria:**
- [ ] List classes within date range with optional filters (classType, coachId)
- [ ] Role-based visibility: Admin/Coach see all classes
- [ ] Class detail shows enrollment and waiting list counts
- [ ] Cancel single instance or entire recurring series (scope param)
- [ ] Canceled classes marked as "canceled" and shown in gray
- [ ] Google Calendar events updated/removed on cancellation
- [ ] 403 if non-authorized user tries to cancel
- [ ] Cancellation notifications wired (will be implemented in EP-04)

**Task File:** `userStories/US-2.3-class-viewing-cancellation.md`

---

### US-2.4: Calendar Block Management

**As a** Coach or Admin,  
**I want** to create personal and gym-wide time blocks,  
**So that** unavailable time is respected during scheduling.

**Acceptance Criteria:**
- [ ] Personal block: blocks specified Coach's calendar (Coach can only block self; Admin can block any)
- [ ] Gym-wide block: blocks entire gym (Admin only)
- [ ] Blocks aligned to hour boundaries (1-hour minimum)
- [ ] Overlap check: blocks cannot overlap with existing classes or other blocks
- [ ] Google Calendar event created for each block
- [ ] Blocks can be canceled (Admin: any; Coach: own personal only)
- [ ] No notifications needed for blocks
- [ ] Blocks factored into available slots calculation

**Task File:** `userStories/US-2.4-block-management.md`

---

### US-2.5: Admin/Coach Calendar UI

**As a** Coach or Admin,  
**I want** a visual calendar with class creation modal and today's schedule,  
**So that** I can manage the weekly schedule in one place.

**Acceptance Criteria:**
- [ ] Custom calendar component (never calls Google Calendar API from browser)
- [ ] Shows all classes from all Coaches with color coding
- [ ] Shows blocks (personal and gym-wide) on calendar
- [ ] "Add Class" button opens modal with dynamic fields
- [ ] Add Class modal shows available time slots
- [ ] Today page: vertical chronological list with visual distinction for individual vs group
- [ ] Canceled classes shown in gray with "Canceled" tag
- [ ] Responsive layout (desktop + tablet)

**Task File:** `userStories/US-2.5-admin-coach-calendar-ui.md`
