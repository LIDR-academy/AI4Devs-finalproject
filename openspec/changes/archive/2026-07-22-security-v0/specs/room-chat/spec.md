## MODIFIED Requirements

### Requirement: Join a room over WebSocket with a server-stamped identity
The system SHALL accept a WebSocket connection for a room and, on a `join` frame (optionally carrying `token` — the access token), stamp the connection's identity server-side and reply with a `welcome` frame `{ type, sender, role }`. A valid `token` SHALL yield `sender = the account username` (from the `username` claim) and `role = "streamer"` if the token's `userId` is the stream owner, else `role = "viewer"`. No token or an invalid token SHALL yield a read-only connection with a generated word+alphanumeric `sender` and `role = "viewer"` — an invalid token is NOT an error (silent read-only downgrade). Clients SHALL NEVER send a role. Joining a nonexistent room SHALL send an `error` frame and close. (`creatorKey` is retired.)

#### Scenario: Owner joins with a valid token
- **WHEN** a connection sends `join` with a valid token whose `userId` is the stream owner
- **THEN** the server replies `welcome` with `sender` = the account username and `role` = "streamer"

#### Scenario: Signed-in non-owner joins
- **WHEN** a connection sends `join` with a valid token whose `userId` is not the owner
- **THEN** the server replies `welcome` with `sender` = the account username and `role` = "viewer"

#### Scenario: Anonymous/invalid join is read-only viewer
- **WHEN** a connection sends `join` with no or an invalid token
- **THEN** the server replies `welcome` with a generated word+alphanumeric `sender`, `role` = "viewer", and no error

#### Scenario: Join a nonexistent room
- **WHEN** a connection sends `join` for a room id that does not exist
- **THEN** the server sends an `error` frame and closes the connection

### Requirement: Send and broadcast chat messages
Sending SHALL require authentication. On a `message` frame `{ type, text }` from a connection that joined with a valid token, the server SHALL validate `text` (non-empty after trim, ≤ `CHAT_MAX_LENGTH` code points), store it, and broadcast a `message` frame `{ message: { id, sender, role, text, ts } }` to every connection in the room (including read-only viewers), where `role`/`sender` are the connection's server-stamped identity and `ts` is server time (ISO-8601 UTC). A `message` frame from a read-only (no/invalid token) connection SHALL be rejected with an `error` frame `{ reason: "auth_required" }` — nothing stored or broadcast. Invalid content from an authenticated sender SHALL produce an `error` frame to the sender only. Clients SHALL enforce the same non-empty / ≤ `CHAT_MAX_LENGTH` rule before sending; the server enforces regardless.

#### Scenario: Authenticated message is broadcast
- **WHEN** an authenticated connection sends a valid `message`
- **THEN** every connection in the room (including anonymous read-only viewers) receives a `message` frame carrying `id`, `sender`, `role`, `text`, and `ts`

#### Scenario: Anonymous message rejected with auth_required
- **WHEN** a read-only (no/invalid token) connection sends a `message`
- **THEN** it receives an `error` frame with reason `auth_required` and nothing is stored or broadcast

#### Scenario: Empty or over-long message rejected
- **WHEN** an authenticated connection sends an empty/whitespace or over-`CHAT_MAX_LENGTH` `message`
- **THEN** the sender receives an `error` frame and nothing is stored or broadcast
