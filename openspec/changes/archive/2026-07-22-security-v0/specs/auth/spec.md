## ADDED Requirements

### Requirement: Magic-link sign-in and sign-out
The `security` service SHALL integrate SuperTokens Passwordless (email magic link) via the SuperTokens Go SDK and expose the standard `/auth/*` endpoints (request magic link, consume link, session refresh, sign-out, session info). Auth SHALL use header transfer mode: the access token travels as `Authorization: Bearer <access token>`, not cookies. Only `security` SHALL ever talk to SuperTokens. The SuperTokens API key and connection URI SHALL come from the environment and SHALL NEVER appear in any response, log, or committed file.

#### Scenario: Full magic-link loop
- **WHEN** a visitor submits their email and clicks the magic link delivered to their inbox
- **THEN** they receive a valid session (access token via header) and are signed in

#### Scenario: Sign-out
- **WHEN** a signed-in user signs out
- **THEN** their session is revoked and subsequent protected requests are unauthenticated

### Requirement: First login creates a user in users
On establishing a new session, `security` SHALL call `users` `POST /internal/users/get-or-create { "email" } → { "id", "email", "username", "created" }` and SHALL stamp `userId` (the users-service id) and `username` into the access-token payload as claims. A brand-new email SHALL create exactly one user with a random word+alphanumeric username, fixed for v0 (`created: true` on first login, `false` thereafter). `users` SHALL be reachable only inside the compose network (never published to the host/portal); the security→users call is trusted by network isolation (no shared secret in v0).

#### Scenario: New user get-or-create
- **WHEN** a never-seen email signs in for the first time
- **THEN** `users` creates one record with a unique random username and returns `created: true`; the session's claims carry that `userId` and `username`

#### Scenario: Returning user
- **WHEN** a previously-seen email signs in again
- **THEN** `users` returns the existing record with `created: false` and the same username

### Requirement: Streamer verifies tokens locally against JWKS
`security` SHALL expose a JWKS endpoint. `streamer` SHALL verify `Authorization: Bearer` access tokens **statelessly** against that JWKS (fetched at startup and refreshed via `SECURITY_JWKS_URL`), making **no per-request call** to `security`. Tampered or expired tokens SHALL be rejected. Identity (`userId`, `username`) SHALL flow to services only via the verified JWT claims.

#### Scenario: Local verification, no security call
- **WHEN** streamer receives a request with an access token
- **THEN** it verifies the token against the cached JWKS without calling security (asserted with a stubbed JWKS in tests)

#### Scenario: Tampered/expired token rejected
- **WHEN** a request carries a tampered or expired token
- **THEN** streamer rejects it as unauthenticated

### Requirement: Anonymous is visible-but-gated
Anonymous visitors SHALL be able to browse the stream list, watch streams, and read chat history and live messages. Protected actions SHALL be visible and calm, never hidden: the portal SHALL show Start streaming to everyone (routing a signed-out click to a calm sign-in prompt) and SHALL replace the chat composer with a calm "Sign in to chat" affordance for anonymous users. Server-side, unauthenticated create is `401` and an unauthenticated chat `message` is rejected with `error "auth_required"`.

#### Scenario: Anonymous browse/watch/read
- **WHEN** an anonymous visitor opens Home and a room
- **THEN** they see the list, can watch, and can read chat, with calm sign-in affordances in place of the create/compose actions

#### Scenario: Gated actions are visible, not hidden
- **WHEN** an anonymous visitor clicks Start streaming
- **THEN** they are taken to a calm sign-in prompt (the action was visible, not hidden)

### Requirement: Sign-out ends the user's active stream
When a signed-in user signs out, the portal SHALL warn calmly if they are currently publishing, and on completion their active stream (if any) SHALL be ended. Together with the reaper (owner media leaves past grace → stream reaped), this ensures the "one active stream per user" rule never locks a user out via an abandoned stream.

#### Scenario: Sign-out clears an owned stream
- **WHEN** a user who owns an active stream signs out
- **THEN** they are warned calmly if publishing, the stream is ended, and their "one stream" slot is free on next sign-in

### Requirement: Portal sign-in UX and identity display
The portal SHALL use `supertokens-web-js` in header-auth mode with session state driving the UI: Home top-right shows Sign in (signed out) or the username + Sign out (signed in), beside Start streaming. The sign-in flow SHALL be email form → "check your inbox" state → a magic-link landing route that consumes the link via the SDK → redirect to the intended destination (or Home). Identity display (header, chat) SHALL be typography only — no avatars, no colored identity chips. Reload SHALL keep the session (ownership, publish rights, STREAMER label survive). All states SHALL comply with `CONSTITUTION.style.md` (calmest surfaces in the product).

#### Scenario: Reload keeps identity
- **WHEN** a signed-in owner reloads their room page
- **THEN** the session persists and they retain ownership, the publisher experience, and the STREAMER label — the old creator-reload edge is gone

#### Scenario: Calm auth surfaces
- **WHEN** the sign-in form, inbox-check, and gated prompts are shown
- **THEN** they are quiet typography + standard buttons per the style law, with no urgency styling
