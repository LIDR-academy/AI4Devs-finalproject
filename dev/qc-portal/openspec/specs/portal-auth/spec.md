# portal-auth Specification

## Purpose
TBD - created by archiving change security-v0. Update Purpose after archive.
## Requirements
### Requirement: Session state drives the UI
The portal SHALL use `supertokens-web-js` in header-auth mode, with a session store holding `{ status: "loading" | "anonymous" | "signed-in", username? }` resolved once on boot via the SDK (session-exists + the `username` claim). Home, the room, and chat SHALL render from this state, and sign-in/sign-out SHALL update it. Reload SHALL keep the session (ownership, publish rights, and the STREAMER label survive). All SDK access SHALL go through a single seam so the rest of the app is testable without the SDK.

#### Scenario: Anonymous on boot
- **WHEN** a visitor with no session opens the app
- **THEN** the session store resolves to `anonymous` and anonymous UI is shown

#### Scenario: Reload keeps the session
- **WHEN** a signed-in user reloads
- **THEN** the session store resolves to `signed-in` with their username, and their owner/publisher state is retained

### Requirement: Magic-link sign-in flow
The portal SHALL provide a sign-in flow: an email form → a calm "check your inbox" state (after requesting the magic link via the SDK) → a magic-link **landing route** that consumes the link via the SDK and, on success, sets the session and redirects to the intended destination (or Home). Failure to consume a link SHALL show a calm "this link didn't work" message with a path back to sign-in. The email input SHALL follow style §6.

#### Scenario: Request magic link
- **WHEN** the visitor submits a valid email
- **THEN** the portal requests a magic link via the SDK and shows a calm "check your inbox" state

#### Scenario: Consume magic link
- **WHEN** the visitor opens the magic-link landing route
- **THEN** the portal consumes the link via the SDK, establishes the session, and redirects to the intended destination or Home

#### Scenario: Bad or expired link
- **WHEN** consuming a link fails
- **THEN** a calm error is shown with a path back to sign-in, and no session is established

### Requirement: Home auth controls
Home SHALL show, top-right beside Start streaming, **Sign in** when signed out or the **username + Sign out** when signed in. Start streaming SHALL remain visible to everyone. Identity display SHALL be typography only — no avatars, no colored identity chips.

#### Scenario: Signed-out controls
- **WHEN** an anonymous visitor opens Home
- **THEN** a Sign in action is shown beside Start streaming, and Start streaming is visible

#### Scenario: Signed-in controls
- **WHEN** a signed-in user opens Home
- **THEN** their username (typography only) and a Sign out action are shown beside Start streaming

### Requirement: Authenticated transport
Protected requests SHALL carry `Authorization: Bearer <access token>` obtained from the SDK via the seam; public reads (`GET /streams`, chat history) SHALL be unauthenticated. The chat WebSocket `join` frame SHALL carry the access token when signed in. No auth token SHALL be baked into the bundle; the SDK SHALL be initialized against the app's own origin.

#### Scenario: Protected request carries the token
- **WHEN** a signed-in user creates a stream, ends a stream, or fetches a media token
- **THEN** the request includes `Authorization: Bearer <access token>` from the session

#### Scenario: Public read omits auth
- **WHEN** the list or chat history is fetched
- **THEN** no `Authorization` header is sent

### Requirement: Sign-out warns then ends the owned stream
On sign-out the portal SHALL clear the session and return to anonymous UI. If the signing-out user owns an active stream and is currently publishing, the portal SHALL first show a calm confirmation that signing out will end their stream; on confirmation it SHALL `DELETE` the owned stream (authenticated) and then sign out.

#### Scenario: Sign-out while publishing
- **WHEN** a publishing owner signs out
- **THEN** a calm confirmation is shown; on confirm, their stream is ended and the session is cleared

#### Scenario: Sign-out while not streaming
- **WHEN** a signed-in user who is not streaming signs out
- **THEN** the session is cleared and the UI returns to anonymous without a stream-end step

### Requirement: Auth surfaces are the calmest surfaces
The sign-in form, inbox-check state, gated prompts, landing route, and sign-out confirmation SHALL comply with `CONSTITUTION.style.md` and SHALL be the calmest surfaces in the product: quiet typography, standard style-§6 buttons, no urgency styling, token-only colors, AA contrast, visible focus, and motion limited to opacity/color disabled under `prefers-reduced-motion`.

#### Scenario: Calm sign-in surfaces
- **WHEN** any auth surface is shown
- **THEN** it uses quiet typography and standard buttons with no urgency styling, and every interactive element has a visible focus state

