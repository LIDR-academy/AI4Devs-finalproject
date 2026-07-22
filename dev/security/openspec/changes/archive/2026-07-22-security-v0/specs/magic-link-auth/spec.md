## ADDED Requirements

### Requirement: Magic-link sign-in via SuperTokens
The `security` service SHALL integrate SuperTokens Passwordless (email magic link) via the official SuperTokens Go SDK and SHALL expose the standard SDK-provided `/auth/*` endpoints: request a magic link, consume the link, refresh the session, sign out, and read session info. The access token SHALL travel in header transfer mode as `Authorization: Bearer <access token>`, never as a cookie. `security` SHALL be the only service that communicates with SuperTokens.

#### Scenario: Request a magic link
- **WHEN** a visitor submits a syntactically valid email to the request-magic-link endpoint
- **THEN** `security` asks SuperTokens to deliver a magic-link email and responds without exposing the link or any credential in the response body or logs

#### Scenario: Consume the magic link and sign in
- **WHEN** a visitor opens a valid, unexpired magic link and it is consumed via the SDK
- **THEN** a valid session is established and the access token is returned to the client in header transfer mode

#### Scenario: Invalid or expired magic link
- **WHEN** a visitor attempts to consume a malformed, already-used, or expired magic link
- **THEN** `security` returns the SDK's unauthenticated/invalid response and no session is created

### Requirement: Sign-out revokes the session
The `security` service SHALL expose the SDK sign-out endpoint. On sign-out the caller's session SHALL be revoked so that subsequent protected requests presenting that token are treated as unauthenticated.

#### Scenario: Sign-out
- **WHEN** a signed-in user calls the sign-out endpoint with a valid session
- **THEN** the session is revoked and a later request carrying the old token is rejected as unauthenticated

### Requirement: Input validation at the boundary
The `security` service SHALL validate every external input at the boundary. Malformed request payloads (e.g. missing or non-string email, invalid JSON) SHALL be rejected with a meaningful client-error status and a consistent JSON error shape, before any call to SuperTokens or `users`.

#### Scenario: Malformed request payload rejected
- **WHEN** a request to an auth endpoint carries invalid JSON or a missing/invalid email field
- **THEN** `security` responds with a client-error status and a consistent JSON error, and makes no downstream call
