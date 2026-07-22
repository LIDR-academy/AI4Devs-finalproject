## MODIFIED Requirements

### Requirement: Creator-only End control
The room page SHALL show the **End stream** control ONLY to the signed-in **owner** — determined client-side as `signed-in AND the session username equals the stream's username` (the `creatorKey` mechanism is retired); anonymous users, viewers, and other signed-in users SHALL NOT see it. Because the session survives reload, the owner keeps the End control after reloading. Activating End SHALL send `DELETE /streams/{id}` with `Authorization: Bearer <access token>`. On `204` or `404` it SHALL redirect to `/`; on `403`/`401` it SHALL show a calm inline message and remain on the page. The server is authoritative on ownership (`403` for a non-owner).

#### Scenario: Owner sees End across reload
- **WHEN** the room renders for the signed-in owner, and again after they reload
- **THEN** the End stream control is shown both times; it is not shown to anonymous users, viewers, or non-owner signed-in users

#### Scenario: End is authenticated and redirects
- **WHEN** the owner activates End and the server returns `204`
- **THEN** the request carried `Authorization: Bearer <access token>` and the portal redirects to `/`

#### Scenario: End forbidden
- **WHEN** End returns `403` or `401`
- **THEN** a calm inline message is shown and the portal does not redirect

### Requirement: Chat client joins with server-stamped identity
On entering a room the portal SHALL open the room WebSocket at the same-origin path and send a `join` frame carrying the access **token** when the user is signed in (no token when anonymous — the `creatorKey` mechanism is retired). It SHALL render the `sender` and `role` returned in the server's `welcome` frame and SHALL NEVER send a role or infer which participant is the streamer.

#### Scenario: Signed-in join carries the token
- **WHEN** a signed-in user enters a room
- **THEN** the `join` frame includes their access token

#### Scenario: Anonymous join carries no token
- **WHEN** an anonymous visitor enters a room
- **THEN** the `join` frame is sent without a token and the connection is read-only (history + live messages)

### Requirement: Composer validates before sending
The composer SHALL be shown ONLY to signed-in users; for anonymous visitors the composer area SHALL be replaced by a calm **"Sign in to chat"** affordance (they still read history and live messages). For a signed-in user the composer is a single-line input that blocks sending when the trimmed text is empty or exceeds `CHAT_MAX_LENGTH` (500) Unicode code points (`[...str].length`), showing calm inline validation and sending no frame; valid text is sent as a `message` frame. The server enforces the rules regardless, and an inbound `error` frame — including `"auth_required"` (e.g. a lapsed token) — SHALL be shown calmly, with `"auth_required"` prompting re-authentication.

#### Scenario: Anonymous sees a sign-in affordance
- **WHEN** an anonymous visitor is in a room
- **THEN** the composer area shows a calm "Sign in to chat" affordance instead of an input, and chat history and live messages are still readable

#### Scenario: Empty or over-long message blocked
- **WHEN** a signed-in user tries to send empty/whitespace or over-`CHAT_MAX_LENGTH` text
- **THEN** no frame is sent and a calm inline validation message is shown

#### Scenario: auth_required shown calmly
- **WHEN** the server returns an `error` frame (including `"auth_required"`)
- **THEN** a calm inline message is shown, no message is added to the log, and `"auth_required"` prompts re-authentication
