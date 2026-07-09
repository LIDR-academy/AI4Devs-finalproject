## ADDED Requirements

### Requirement: Login with Magic Link
The system SHALL allow users to request a magic link by entering their email address on the login page.

#### Scenario: Request magic link successfully
- **WHEN** the user enters a valid email and clicks "Continue"
- **THEN** the system calls the POST /api/auth/magic-link endpoint and displays a "Check your email" confirmation.

### Requirement: Token Verification
The system SHALL verify magic link tokens when users land on the verify page.

#### Scenario: Successful token verification
- **WHEN** the verify page loads with a token in the URL query parameters
- **THEN** it calls the GET /api/auth/verify endpoint, sets authentication state via cookies, and redirects the user to the profile setup (if first login) or dashboard.

### Requirement: Profile Setup
The system SHALL provide a profile setup interface for first-time users to complete their registration.

#### Scenario: Complete profile setup
- **WHEN** a first-login user submits their name and accepts terms
- **THEN** the system redirects them to the onboarding wizard.

### Requirement: Route Protection
The system SHALL use an AuthGuard to protect routes that require authentication.

#### Scenario: Unauthorized access attempt
- **WHEN** an unauthenticated user navigates to the /dashboard route
- **THEN** the AuthGuard redirects the user to the /login page.

### Requirement: CSRF Protection
The system SHALL automatically include CSRF tokens on state-changing requests.

#### Scenario: Authenticated POST request
- **WHEN** an authenticated user makes a POST, PUT, PATCH, or DELETE request
- **THEN** the CsrfInterceptor reads the aura_csrf cookie and adds the X-CSRF-Token header to the request.

### Requirement: Silent Session Refresh
The system SHALL automatically refresh the user's session before it expires.

#### Scenario: JWT nearing expiration
- **WHEN** the current JWT reaches 50% of its lifetime
- **THEN** the system calls POST /api/auth/refresh to obtain a new session cookie.

### Requirement: Logout
The system SHALL allow users to explicitly log out.

#### Scenario: User triggers logout
- **WHEN** the user clicks the logout button
- **THEN** the system calls POST /api/auth/logout, clears local state, and redirects to /login.
