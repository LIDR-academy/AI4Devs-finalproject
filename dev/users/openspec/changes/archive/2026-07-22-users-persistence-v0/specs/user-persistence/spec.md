## ADDED Requirements

### Requirement: Idempotent get-or-create by email

The `users` service SHALL expose `POST /internal/users/get-or-create` accepting a JSON body `{ "email": string }` and returning `200 { "id": string, "email": string, "username": string, "created": bool }`. The operation SHALL be idempotent by email: the first request for a never-seen email SHALL create exactly one user record and return `created: true`; every subsequent request for the same email SHALL return the existing record — the same `id` and the same `username` — with `created: false`. The `id` SHALL be the users-service (MongoDB) identifier used platform-wide for ownership. `security` retrying the command SHALL NEVER produce a duplicate user, even under concurrent requests for the same new email.

#### Scenario: First login creates one user
- **WHEN** a request arrives for an email that has no existing record
- **THEN** exactly one user record is created and the response is `200` with a new `id`, the submitted `email`, a generated `username`, and `created: true`

#### Scenario: Returning email is stable
- **WHEN** a request arrives for an email that already has a record
- **THEN** the response is `200` with the same `id` and same `username` as before and `created: false`, and no new record is created

#### Scenario: Concurrent first-time requests never duplicate
- **WHEN** two requests for the same never-seen email are processed concurrently
- **THEN** exactly one user record exists afterward, both responses carry the same `id` and `username`, and at most one response has `created: true`

### Requirement: Random unique username, fixed for v0

On creating a new user, the service SHALL generate a `username` in the word+alphanumeric style used for ephemeral chat ids. The `username` SHALL be unique across all users. There SHALL be no endpoint to change a username in v0 — once assigned it is fixed. If a generated username collides with an existing one, the service SHALL regenerate until it obtains a unique value before persisting.

#### Scenario: Generated username shape
- **WHEN** a new user is created
- **THEN** its `username` is a non-empty word+alphanumeric string and is returned in the response

#### Scenario: Username uniqueness under collision
- **WHEN** username generation produces a value that already exists
- **THEN** the service regenerates and persists a different, unique username, and the created user still has a unique username

#### Scenario: Username is fixed
- **WHEN** a returning email calls get-or-create again
- **THEN** the same username as the original creation is returned, with no mechanism to alter it

### Requirement: Validate input at the boundary

The service SHALL validate every inbound request at the HTTP boundary before touching persistence. A request with a malformed body (not JSON), a missing `email` field, an empty email, or an email that fails basic format validation SHALL be rejected with `400` and a JSON error body `{ "error": string }`. The error message SHALL NOT echo back sensitive personal data.

#### Scenario: Malformed JSON is rejected
- **WHEN** a request body is not valid JSON
- **THEN** the response is `400` with a JSON error body and no persistence occurs

#### Scenario: Missing or empty email is rejected
- **WHEN** a request omits `email` or provides an empty string
- **THEN** the response is `400` with a JSON error body and no user is created

#### Scenario: Invalid email format is rejected
- **WHEN** a request provides a value that fails basic email format validation
- **THEN** the response is `400` with a JSON error body and no user is created

### Requirement: Persistence failures are surfaced, not swallowed

When the underlying MongoDB operation fails, the service SHALL return `500` with a JSON error body `{ "error": string }` and SHALL log the failure with enough context for a human to act, without exposing the failure as a success. The service SHALL NEVER return `created: true` unless a record was actually persisted.

#### Scenario: Datastore error yields 500
- **WHEN** the MongoDB read or write required by get-or-create fails
- **THEN** the response is `500` with a JSON error body and no partial or phantom success is reported

### Requirement: Internal-only exposure and no PII in logs

The service SHALL be reachable only inside the compose network and SHALL NOT be published to the host or the portal; trust is the network boundary (no shared secret in v0). The service SHALL NEVER log personal data — email addresses and any other PII SHALL be excluded from all log output. Identity SHALL reach other services only via `security`'s JWT claims, never by exposing this endpoint publicly.

#### Scenario: No PII is logged
- **WHEN** the service handles any request, including validation failures and datastore errors
- **THEN** its log output contains no email address or other personal data

#### Scenario: Endpoint is internal
- **WHEN** the service is deployed
- **THEN** the get-or-create endpoint is served only on the internal compose network and is not published to the host or portal

### Requirement: Configuration from the environment, fail fast

The service SHALL read its MongoDB connection settings and HTTP listen address from environment variables, with no credentials baked into code or image. On startup, if a required configuration value is missing or invalid, the service SHALL fail fast and loudly with a clear error rather than starting in a broken state.

#### Scenario: Missing required config aborts startup
- **WHEN** a required environment variable (e.g. the MongoDB connection) is absent at startup
- **THEN** the service exits immediately with an error explaining what is missing, and does not begin serving requests
