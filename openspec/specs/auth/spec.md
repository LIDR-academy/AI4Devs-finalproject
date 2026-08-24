# auth Specification

## Purpose
TBD - created by archiving change add-auth-rbac. Update Purpose after archive.
## Requirements
### Requirement: Email-based login

The system SHALL identify users by email address, not username, and SHALL require the email to be unique.

#### Scenario: Login with email and password

- **WHEN** a user submits their email and correct password to `POST /api/auth/login`
- **THEN** the system authenticates them and returns a JWT access token and refresh token

#### Scenario: Duplicate email rejected

- **WHEN** a new user is created with an email that already exists
- **THEN** the system rejects the creation with a validation error

### Requirement: JWT issuance and refresh

The system SHALL issue short-lived JWT access tokens and longer-lived refresh tokens, and SHALL allow renewing an access token via the refresh token without re-entering credentials.

#### Scenario: Successful login issues both tokens

- **WHEN** valid credentials are submitted to `POST /api/auth/login`
- **THEN** the response includes an `access` token and a `refresh` token

#### Scenario: Refresh renews the access token

- **WHEN** a valid, non-expired refresh token is submitted to `POST /api/auth/refresh`
- **THEN** the system returns a new access token

#### Scenario: Expired access token is rejected

- **WHEN** a request is made with an expired access token
- **THEN** the system responds `401 Unauthorized`

### Requirement: Invalid credentials give a generic error

The system SHALL respond with a generic error on invalid login, without revealing whether the email or the password was incorrect.

#### Scenario: Wrong password

- **WHEN** a login attempt uses a valid email with an incorrect password
- **THEN** the response is `401` with a generic "invalid credentials" message, not specifying which field was wrong

#### Scenario: Unknown email

- **WHEN** a login attempt uses an email with no matching user
- **THEN** the response is the same generic `401` as a wrong password

### Requirement: Inactive users cannot authenticate

The system SHALL prevent an inactive user from logging in or using an existing token.

#### Scenario: Inactive user login attempt

- **WHEN** an inactive user submits valid credentials to `POST /api/auth/login`
- **THEN** the response is `401` with a message indicating the account is deactivated

### Requirement: One role per user, permissions by code

The system SHALL assign exactly one role to each user. Each role SHALL have a set of permissions identified by a unique code (e.g. `cliente.crear`), configurable from the system without code changes.

#### Scenario: Role determines allowed actions

- **WHEN** a user's role has the permission code `cliente.crear`
- **THEN** the user can successfully call the endpoint that requires `cliente.crear`

#### Scenario: Missing permission is forbidden

- **WHEN** a user's role does NOT have the permission code required by an endpoint
- **THEN** the system responds `403 Forbidden`

#### Scenario: Permissions are editable without a deploy

- **WHEN** an administrator adds or removes a permission from a role through the system's own screens/endpoints
- **THEN** the change takes effect for that role's users on their next request, without any code change or restart

### Requirement: Identity endpoint

The system SHALL expose an endpoint that returns the authenticated user's own identity, role, and permissions.

#### Scenario: Authenticated user fetches their profile

- **WHEN** an authenticated user calls `GET /api/auth/me`
- **THEN** the response includes their email, role name, and the list of permission codes they hold

### Requirement: User and role management

The system SHALL provide CRUD endpoints for users and roles, each requiring the appropriate permission code, and SHALL prevent removing the last active administrator.

#### Scenario: Creating a user requires permission

- **WHEN** a caller without the `usuario.crear` permission attempts to create a user
- **THEN** the response is `403`

#### Scenario: Last administrator cannot be deactivated

- **WHEN** an attempt is made to deactivate or delete the only remaining active user with the administrator role
- **THEN** the system rejects the operation with a validation error

### Requirement: Sensitive actions are auditable

The system SHALL emit an auditable event for login, user creation, and role/permission changes, so a future audit-log capability can record them.

#### Scenario: Login emits an audit event

- **WHEN** a user successfully logs in
- **THEN** an audit event is emitted identifying the user and the action `login`

### Requirement: Frontend authentication flow

The system SHALL provide a login screen that stores the issued tokens and a route guard that redirects unauthenticated users to login before rendering protected pages.

#### Scenario: Unauthenticated user is redirected

- **WHEN** an unauthenticated user navigates to a protected route
- **THEN** the frontend redirects them to the login screen

#### Scenario: Authenticated requests carry the token

- **WHEN** a logged-in user's frontend makes an API request
- **THEN** the request includes `Authorization: Bearer <access token>`

