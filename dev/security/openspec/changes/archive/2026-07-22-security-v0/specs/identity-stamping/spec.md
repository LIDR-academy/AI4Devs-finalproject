## ADDED Requirements

### Requirement: First login creates a user and stamps identity claims
On establishing a new session, `security` SHALL call `users` `POST /internal/users/get-or-create { "email" } → { "id", "email", "username", "created" }` and SHALL stamp `userId` (the returned users-service `id`) and `username` into the access-token payload as custom claims via the SuperTokens claim-override mechanism. The `userId` claim SHALL be the users-service id (used downstream for ownership), never the SuperTokens internal id. The `users` call is trusted by compose-network isolation and carries no shared secret in v0.

#### Scenario: New user get-or-create
- **WHEN** a never-seen email establishes its first session
- **THEN** `users` creates exactly one record and returns `created: true`, and the issued access token carries that `userId` and `username` as claims

#### Scenario: Returning user
- **WHEN** a previously-seen email establishes a new session
- **THEN** `users` returns the existing record with `created: false` and the same `username`, and the issued access token carries that same `userId` and `username`

### Requirement: Session creation fails if identity cannot be resolved
If the `users` get-or-create call fails or returns an incomplete record (missing `id` or `username`), `security` SHALL fail session creation with a wrapped error and SHALL NOT issue an access token lacking the `userId` and `username` claims.

#### Scenario: users call fails during login
- **WHEN** the `users` get-or-create call errors or returns a record without an `id`
- **THEN** `security` returns an error, no session is created, and no token missing identity claims is issued

### Requirement: Identity handling never leaks credentials
`security` SHALL NOT log or return the SuperTokens API key, magic links, or raw tokens while performing get-or-create and claim stamping. Log lines related to identity SHALL carry only non-sensitive context (e.g. that a user was created vs. found), never the token payload or credentials.

#### Scenario: No credential leakage on the identity path
- **WHEN** a login flows through get-or-create and claim stamping, including on the error path
- **THEN** no log line or response body contains the API key, a magic link, or a raw token
