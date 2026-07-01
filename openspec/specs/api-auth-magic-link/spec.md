## ADDED Requirements

### Requirement: Magic Link Request
The system MUST allow users to request a magic link for authentication by providing their email address.

#### Scenario: Successful request
- **WHEN** a user requests a magic link with a valid email
- **THEN** the system creates or updates the user, generates a token, stores its SHA-256 hash, and sends an email with the link

#### Scenario: Anti-enumeration protection
- **WHEN** a user requests a magic link
- **THEN** the system returns a standard success message without indicating if the user is new or existing

#### Scenario: Rate limiting
- **WHEN** a user requests a magic link more than 3 times per hour
- **THEN** the system rejects the request with a 429 Too Many Requests status and Retry-After header

### Requirement: Magic Link Verification
The system MUST verify magic link tokens and issue session credentials upon success.

#### Scenario: Successful verification
- **WHEN** a user verifies a valid, unexpired magic link token
- **THEN** the system clears the stored hash, updates the user status to active, and issues a JWT and CSRF token in HttpOnly and secure cookies

#### Scenario: Expired token
- **WHEN** a user attempts to verify an expired magic link token (> 15 minutes)
- **THEN** the system rejects the request with a 401 Unauthorized status and "Link expired" message
