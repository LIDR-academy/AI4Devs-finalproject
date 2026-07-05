# EP-01: Auth & User Foundation

## Milestone
**Users can log in; Admins manage Coachees, Coaches, and levels.**

## Description
Establish the project foundation, authentication system, and user management for all three roles (Admin, Coach, Coachee). After this epic, an Admin can log in and fully manage the user base. Coaches and Coachees can log in and see a role-appropriate interface skeleton.

## Priority: High
## Dependencies: None (starting point)

---

## User Stories

### US-1.1: User Login & Session Management

**As a** gym user (Admin, Coach, or Coachee),  
**I want** to securely log in and out of the platform with my email and password,  
**So that** I can access my role-appropriate dashboard.

**Acceptance Criteria:**
- [ ] User can log in with valid email/password and receives JWT access + refresh tokens
- [ ] Invalid credentials always return "Invalid credentials" (no email enumeration)
- [ ] Inactive users cannot log in (403 Forbidden)
- [ ] Expired/revoked tokens return 401 Unauthorized
- [ ] User can refresh their session via refresh token
- [ ] User can explicitly log out (token revocation)
- [ ] Every protected endpoint enforces role guard (RBAC middleware)
- [ ] Login form provides validation, error states, and loading feedback

**Task File:** `userStories/US-1.1-user-login-session.md`

---

### US-1.2: Coachee Lifecycle Management

**As an** Admin,  
**I want** to add, view, update, filter, and manage Coachees,  
**So that** I can onboard and track my clients.

**Acceptance Criteria:**
- [ ] Admin can create a Coachee with name, email, phone, level, and class type preference
- [ ] Admin can list all Coachees with pagination and multi-select filters (status, level)
- [ ] Admin can view detailed Coachee profile (including additional info)
- [ ] Admin can update Coachee profile fields (partial updates)
- [ ] Admin can activate/deactivate a Coachee
- [ ] Admin can change a Coachee's level (triggers notification #11 in EP-04)
- [ ] Financial data is never exposed in Coachee endpoints
- [ ] 403 Forbidden if non-Admin tries to access

**Task File:** `userStories/US-1.2-coachee-lifecycle.md`

---

### US-1.3: Coach Lifecycle & Financial Data

**As an** Admin,  
**I want** to add, view, update, and access Coach profiles and financial data,  
**So that** I can manage my coaching staff.

**Acceptance Criteria:**
- [ ] Admin can create a Coach with profile and financial data (bank account, SSN, DNI)
- [ ] Financial data is encrypted with AES-256-GCM before storage
- [ ] Admin can list Coaches with pagination and status filter
- [ ] Admin can view detailed Coach profile (non-financial fields)
- [ ] Admin can update Coach profile fields (partial updates)
- [ ] Admin can activate/deactivate a Coach
- [ ] Financial data access is isolated to a dedicated `GET /coaches/:id/financial` endpoint
- [ ] Financial endpoint access is logged as a security event
- [ ] Financial data is never included in list or general detail responses

**Task File:** `userStories/US-1.3-coach-lifecycle.md`

---

### US-1.4: Level System & Role-Based UI

**As a** user,  
**I want** to see navigation and screens tailored to my role and have training levels assigned to Coachees,  
**So that** I can use the platform effectively.

**Acceptance Criteria:**
- [ ] 5 training levels are seeded: Principiante, Básico, Intermedio, Avanzado, Experto (with color and sort order)
- [ ] Admin/Coach can assign and change Coachee levels at any time
- [ ] Admin layout shows sidebar with: Today, Calendar, Coachees, Coaches
- [ ] Coach layout shows sidebar with: Today, Calendar, Coachees (no Coaches section)
- [ ] Coachee layout shows bottom navigation with: Home, Calendar, Notifications
- [ ] Unauthorized routes redirect to appropriate role view
- [ ] Notifications bell icon (placeholder) is present in header for all roles
- [ ] Frontend is responsive (desktop for Admin/Coach, mobile-first for Coachee)

**Task File:** `userStories/US-1.4-levels-role-ui.md`
