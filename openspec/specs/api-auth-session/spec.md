## ADDED Requirements

### Requirement: Profile Setup
The system MUST require new users to complete profile setup before fully accessing protected resources.

#### Scenario: First login profile setup
- **WHEN** an authenticated new user submits their profile details (name, terms acceptance)
- **THEN** the system creates UserConsent records and allows full access to the API

### Requirement: Session Refresh
The system MUST allow users with a valid JWT to refresh their session silently.

#### Scenario: Successful session refresh
- **WHEN** an authenticated user requests a session refresh
- **THEN** the system issues a new JWT with a fresh 24h expiry and a new CSRF token in cookies

### Requirement: Session Logout
The system MUST allow users to terminate their active session.

#### Scenario: Successful logout
- **WHEN** an authenticated user requests to log out
- **THEN** the system hashes the current JWT, stores it in a Dragonfly-backed blacklist with a TTL equal to the remaining expiry, and clears the session cookies
