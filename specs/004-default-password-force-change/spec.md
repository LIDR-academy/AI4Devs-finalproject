# Feature Specification: Default Password & Force Change on First Login

**Feature Branch**: `004-default-password-force-change`

**Created**: 2026-07-15

**Status**: Draft

**Input**: User description: "https://linear.app/ai4devs/issue/COACHER-189/default-password-for-coachees-phone-force-change-on-first-login"

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Admin creates coachee with phone as default password (Priority: P1)

As an Admin, I want to create a coachee where their phone number serves as their initial password so that the coachee can log in for the first time without needing a separate invitation or password-set flow.

**Why this priority**: This is the foundation of the feature — without it, coachees cannot log in at all (the current behavior generates a random UUID that makes login impossible).

**Independent Test**: An Admin creates a coachee providing name, email, and phone. The system confirms creation. The coachee can log in using their email and phone number as password.

**Acceptance Scenarios**:

1. **Given** an Admin user on the Add Coachee form, **When** they submit without providing a phone number, **Then** the system rejects the submission with a clear error that phone is required
2. **Given** an Admin submitting the Add Coachee form with all required fields including phone, **When** the coachee is created, **Then** the system sets the phone number as the coachee's initial password
3. **Given** a newly created coachee, **When** their account is created, **Then** their account has a `must_change_password` flag set to `true`, indicating they must change their password on first login

---

### User Story 2 - Coachee logs in for the first time and is forced to change password (Priority: P1)

As a coachee, I want to log in using my phone number as my password so that I can access the platform for the first time, and I want to be guided to set a new password before I can use the app.

**Why this priority**: This is the core user-facing flow; without it, coachees cannot complete their onboarding.

**Independent Test**: A coachee with `must_change_password = true` logs in with email + phone as password. The login succeeds but the system redirects them to a change-password page instead of their home screen.

**Acceptance Scenarios**:

1. **Given** a coachee with `must_change_password = true`, **When** they log in with correct credentials (email + phone), **Then** the login succeeds and the system indicates that a password change is required
2. **Given** a coachee who needs to change their password, **When** they land on any page after login, **Then** they are redirected to the change-password page until they complete the change
3. **Given** a coachee on any page after login but before changing password, **When** they try to navigate elsewhere, **Then** they are always redirected back to the change-password page

---

### User Story 3 - Coachee changes password (Priority: P1)

As a coachee required to change my password, I want to provide my current password and a new password (with confirmation) so that I can set a personal, secure password and proceed to use the app normally.

**Why this priority**: Without completing the password change, the coachee is blocked and cannot use the platform.

**Independent Test**: A coachee on the change-password page submits current password (phone), new password (meets requirements), and confirmation. The system accepts the change, sets `must_change_password = false`, and redirects to the coachee's home screen.

**Acceptance Scenarios**:

1. **Given** a coachee on the change-password page, **When** they submit current password, new password, and confirmation, **Then** the system validates and updates the password
2. **Given** a coachee submitting the change form, **When** the new password and confirmation do not match, **Then** the system rejects with a clear error
3. **Given** a coachee submitting the change form, **When** the new password does not meet minimum length requirements, **Then** the system rejects with a clear error
4. **Given** a coachee submitting the change form, **When** the current password is incorrect, **Then** the system rejects with an invalid credentials error
5. **Given** a successful password change, **When** the operation completes, **Then** the `must_change_password` flag is set to `false`
6. **Given** a successful password change, **When** the operation completes, **Then** the coachee is redirected to their role-based home screen
7. **Given** an unauthenticated user, **When** they try to access the change-password page, **Then** they are redirected to the login page

---

### User Story 4 - Coachee logs in after changing password (Priority: P2)

As a coachee who has already changed my password, I want to log in with my new password and go directly to my home screen without any interruption.

**Why this priority**: This is the steady-state behaviour that returns the user to normal operation.

**Independent Test**: A coachee with `must_change_password = false` logs in with email + new password. The login succeeds and they are taken directly to their home screen.

**Acceptance Scenarios**:

1. **Given** a coachee with `must_change_password = false`, **When** they log in with their new password, **Then** the login succeeds and they are redirected to their role-based home screen
2. **Given** a coachee who changed their password, **When** they try to log in with their old password (phone), **Then** the login fails with an invalid credentials error

---

### Edge Cases

- What happens when a coachee navigates away from the change-password page (closes browser, refreshes)? They should be redirected back to change-password on next login or page load until they complete the change.
- What happens if an Admin changes the coachee's phone number after creation? The password does not change — only the phone used at creation time set the initial password.
- What happens when a coachee attempts to change their password to the same value as their current password? The system should accept it (no business rule prevents reusing the same password).
- What happens if the change-password endpoint receives a request from a user who has already changed their password? It should still work (voluntary password change should be allowed).
- What happens when an Admin creates a coachee with a phone number that matches an existing coachee's phone? Standard uniqueness validation on phone should reject it.
- What happens if the coachee provides the wrong current password multiple times? Standard authentication rate limiting applies.

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: Phone field MUST be required when creating a coachee (Admin cannot create a coachee without a phone number)
- **FR-002**: System MUST use the coachee's phone number as their initial password, securely hashed
- **FR-003**: Every newly created coachee MUST have `must_change_password` set to `true`
- **FR-004**: Login endpoint MUST include the `must_change_password` status in the response so the frontend can determine the redirect path
- **FR-005**: After successful login, if `must_change_password` is `true`, the coachee MUST be redirected to the change-password page instead of their home screen
- **FR-006**: The change-password page MUST require authentication — unauthenticated users are redirected to login
- **FR-007**: Users who have not changed their password MUST be redirected to the change-password page on every navigation attempt until the change is completed
- **FR-008**: Users MUST provide their current password, a new password, and a confirmation of the new password to complete the change
- **FR-009**: System MUST validate that the new password and confirmation match
- **FR-010**: System MUST validate that the new password meets minimum length requirements
- **FR-011**: System MUST verify the current password matches the stored hash before allowing the change
- **FR-012**: On successful password change, `must_change_password` MUST be set to `false`
- **FR-013**: On successful password change, the user MUST be redirected to their role-appropriate home screen
- **FR-014**: After password change, subsequent logins MUST go directly to the user's home screen
- **FR-015**: System MUST support the change-password flow for authenticated users of any role (Admin, Coach, Coachee)

### Key Entities *(include if feature involves data)*

- **User**: Represents a platform user (Admin, Coach, or Coachee). Gains a `must_change_password` boolean attribute that tracks whether the user needs to set a new password. The initial password is derived from the coachee's phone number at creation time (for coachee role).
- **PasswordChange**: Represents the discrete operation of a user updating their password from an existing one to a new one. Not persisted as a separate entity — the effect is an update to the User entity's password hash and `must_change_password` flag.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Admin cannot create a coachee without providing a phone number — the system consistently rejects the submission with a clear error
- **SC-002**: A coachee created with a phone number can log in using that phone number as their password on the first attempt
- **SC-003**: After first login, the coachee is consistently redirected to the change-password page — verified for all navigation entry points
- **SC-004**: A coachee can complete the password change flow (current → new → confirm → success) in 3 or fewer screens
- **SC-005**: After successful password change, the coachee reaches their home screen within 3 seconds
- **SC-006**: After password change, subsequent logins with the new password succeed and never show the change-password page
- **SC-007**: Unauthenticated users trying to access the change-password page are redirected to login in under 1 second
- **SC-008**: Invalid attempts (wrong current password, mismatched confirmation, too-short new password) return clear error messages within 2 seconds

## Assumptions

- Only coachees get the `must_change_password` flag set to `true` at creation time. Admin and Coach accounts are created with a separate secure password flow (out of scope for this feature).
- The existing authentication system (email + password login, JWT tokens) is already in place and will be reused.
- The Admin communicates the initial password (the coachee's phone number) to the coachee through existing channels (out of band — not part of this feature).
- If a coachee forgets their password after changing it, the password reset flow is handled by a separate feature (out of scope).
- Changing password to the same value as the current password is allowed (no history/complexity rules beyond minimum length).
- The minimum password length is 6 characters.
- Standard auth rate limiting (10 attempts/min) applies to the change-password endpoint to prevent brute-force attacks on current password verification.
