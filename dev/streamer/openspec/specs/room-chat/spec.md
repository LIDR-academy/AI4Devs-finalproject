# room-chat Specification

## Purpose
TBD - created by archiving change room-chat-v0. Update Purpose after archive.
## Requirements
### Requirement: Join a room over WebSocket with a server-stamped identity
The service SHALL accept a WebSocket connection at `/streams/{id}/ws` and, on a `join` frame (optionally carrying `token` — the access token; `creatorKey` is retired), stamp the connection's identity server-side and reply with a `welcome` frame `{ "type": "welcome", "sender": string, "role": "streamer" | "viewer" }`. A valid `token` SHALL yield `sender` = the account username (from the `username` claim) and `role` = `"streamer"` when the token's `userId` is the stream owner, else `role` = `"viewer"`; such a connection MAY send messages. No token or an invalid token SHALL yield a **read-only** connection with a generated word+alphanumeric `sender` and `role` = `"viewer"` — an invalid token is NOT an error (silent read-only downgrade). The server SHALL stamp `role`; a client-sent `role` SHALL be ignored. Joining a room id that is not live SHALL send an `error` frame and close the connection. `token` SHALL never be echoed, logged, or included in any frame.

#### Scenario: Owner joins with a valid token
- **WHEN** a connection sends `join` with a valid token whose `userId` is the stream owner
- **THEN** the server replies `welcome` with `sender` = the account username and `role` = `"streamer"`, and the connection may send messages

#### Scenario: Signed-in non-owner joins
- **WHEN** a connection sends `join` with a valid token whose `userId` is not the owner
- **THEN** the server replies `welcome` with `sender` = the account username and `role` = `"viewer"`, and the connection may send messages

#### Scenario: Anonymous or invalid join is read-only
- **WHEN** a connection sends `join` with no token or an invalid token
- **THEN** the server replies `welcome` with a generated word+alphanumeric `sender`, `role` = `"viewer"`, no error, and the connection is read-only

#### Scenario: Join a nonexistent room
- **WHEN** a connection sends `join` for a room id that is not live
- **THEN** the server sends an `error` frame and closes the connection

### Requirement: Send and broadcast chat messages
Sending SHALL require authentication. On a `message` frame `{ "type": "message", "text": string }` from a connection that joined with a valid token, the service SHALL validate `text` (non-empty after trimming, at most `CHAT_MAX_LENGTH` Unicode code points), store it, and broadcast a `message` frame `{ "type": "message", "message": { "id", "sender", "role", "text", "ts" } }` to every connection in the room (including read-only viewers). `sender` and `role` SHALL be the sending connection's server-stamped identity (never taken from the frame). `ts` SHALL be server time in ISO-8601 UTC. A `message` frame from a **read-only** (no/invalid token) connection SHALL be rejected with an `error` frame `{ "type": "error", "reason": "auth_required" }` — nothing stored or broadcast, and the connection stays open. Invalid content from an authenticated sender SHALL produce an `error` frame to the sending connection only. The server SHALL enforce these rules regardless of client-side validation.

#### Scenario: Authenticated message is broadcast to the whole room
- **WHEN** an authenticated connection sends a valid `message` and read-only viewers are joined to the same room
- **THEN** every connection in the room (including the read-only viewers) receives a `message` frame carrying `id`, `sender`, `role`, `text`, and `ts`

#### Scenario: Read-only message rejected with auth_required
- **WHEN** a read-only (no/invalid token) connection sends a `message`
- **THEN** it receives an `error` frame with reason `auth_required`, nothing is stored or broadcast, and the connection stays open

#### Scenario: Empty or over-long message from an authenticated sender rejected
- **WHEN** an authenticated connection sends an empty/whitespace-only `text`, or a `text` longer than `CHAT_MAX_LENGTH` code points
- **THEN** only the sending connection receives an `error` frame, and nothing is stored or broadcast

### Requirement: Server-authoritative stable message ids
The service SHALL assign every stored message a stable, server-authoritative `id` that is identical in the WebSocket broadcast and in the HTTP history for that message. This SHALL make de-duplication by `id` reliable at the history/live boundary.

#### Scenario: Same id in live and history
- **WHEN** a message is broadcast over the WebSocket and later returned by the history endpoint
- **THEN** its `id` is identical in both, so a client can de-duplicate by `id`

### Requirement: Per-room capped message storage
The service SHALL store each room's messages in streamer's private Valkey storage as a ring buffer capped at `CHAT_MAX_MESSAGES`, dropping the oldest when full. Chat SHALL NOT reject a message at cap. Stored history SHALL never exceed `CHAT_MAX_MESSAGES`. When a stream is deleted its stored messages SHALL be deleted and SHALL NOT leak.

#### Scenario: Cap drops oldest
- **WHEN** more than `CHAT_MAX_MESSAGES` messages are sent to a room (verified with a lowered cap in tests)
- **THEN** the oldest messages are dropped, chat keeps accepting, and stored history never exceeds `CHAT_MAX_MESSAGES`

#### Scenario: Delete removes messages
- **WHEN** a stream is deleted
- **THEN** its stored messages are removed, and a room later created at the same id starts with empty history

### Requirement: Cursor-paginated chat history over HTTP
The service SHALL expose `GET /streams/{id}/messages?before={messageId}&limit={n}` returning `200` with `{ "messages": [ { "id", "sender", "role", "text", "ts" } ], "nextCursor": string | null }`. With no `before` it SHALL return the latest page. `limit` SHALL default to and be capped at `CHAT_PAGE_SIZE`. Messages SHALL be ordered oldest→newest within the page. `nextCursor` SHALL be the cursor to pass as `before` to fetch the previous (older) page, and SHALL be `null` when no older history remains. It SHALL return `404` when the room is not live.

#### Scenario: Latest page then scroll up
- **WHEN** a room has more than `CHAT_PAGE_SIZE` messages and a client requests history with no `before`
- **THEN** it receives the latest `CHAT_PAGE_SIZE` messages oldest→newest with a non-null `nextCursor`, and passing that cursor as `before` returns the previous page, until `nextCursor` is `null`

#### Scenario: Limit is capped
- **WHEN** a client requests history with a `limit` greater than `CHAT_PAGE_SIZE`
- **THEN** at most `CHAT_PAGE_SIZE` messages are returned

#### Scenario: History for a missing room
- **WHEN** a client requests history for a room id that is not live
- **THEN** the response is `404`

### Requirement: Stable error reasons distinguish terminal from transient
Error frames SHALL use stable, documented `reason` strings, and the service SHALL uphold a terminal-close invariant so the client can tell a terminal error (stop reconnecting) from a transient one (keep the connection / reconnect):

- TERMINAL error frames — always immediately followed by the server closing the connection: `reason: "room ended"` (stream deleted while connected), `reason: "room not found"` (join to a room that is not live), `reason: "expected join"` (malformed or absent initial join frame).
- NON-TERMINAL error frames — the connection stays open and is NOT followed by a close: `reason: "auth_required"` (a `message` from a read-only connection), message validation failures (e.g. `"message is empty"`, `"message must be at most N characters"`), an unparseable frame (`"invalid frame"`), and a transient storage failure (`"could not send message"`).

A bare connection close with no preceding error frame (e.g. a network drop) is transient. These reason strings are a stable micro-contract; changing a terminal reason string is a contract change.

#### Scenario: Terminal error is followed by a close
- **WHEN** a client joins a room that is not live, or a live room is deleted while it is connected
- **THEN** it receives an `error` frame whose `reason` is one of the terminal strings and the connection is then closed

#### Scenario: Non-terminal error leaves the connection open
- **WHEN** a read-only connection sends a message (rejected with `auth_required`) and then, after authenticating on a fresh connection, sends a valid message
- **THEN** the read-only connection stays open after the `auth_required` error, and the authenticated message is broadcast

### Requirement: Room ends while connected
When a stream is deleted while connections are live in its room, the service SHALL broadcast an `error` frame ("room ended") to those connections, close them, and drop the room from the in-process hub. No socket, goroutine, or subscription SHALL be left behind.

#### Scenario: Delete closes live connections
- **WHEN** a stream is deleted while a viewer is connected to its room
- **THEN** the viewer's connection receives an `error` frame and is closed, and the room is dropped from the hub with no leaked goroutine

### Requirement: WebSocket connection lifecycle is leak-free
Every WebSocket connection SHALL be served by goroutines that each have a defined owner and stop path and select on context cancellation. When a client disconnects (drop, close, or read error) or the room is closed, all of that connection's goroutines SHALL stop and it SHALL be unregistered from the hub, leaving no leaked goroutine or Valkey subscription. This behavior SHALL be verified under the race detector.

#### Scenario: Client drop is fully cleaned up
- **WHEN** a joined connection drops (its read fails or it closes)
- **THEN** its read and write goroutines both stop, it is removed from the hub's room, and no goroutine is leaked

### Requirement: WebSocket is served on the single origin without CORS
The room WebSocket SHALL be reachable by the browser only through the reverse proxy on the single published origin: the service SHALL emit no CORS headers and SHALL NOT require an `Origin` allowlist of its own, and SHALL accept the upgrade at the documented path `/streams/{id}/ws`. No base URL SHALL be required by clients beyond the same-origin path.

#### Scenario: Upgrade accepted on the documented path
- **WHEN** a WebSocket upgrade request arrives at `/streams/{id}/ws` for a live room
- **THEN** the service completes the upgrade and proceeds to the join handshake without any CORS negotiation

### Requirement: Chat knobs are environment-configurable
The service SHALL read `CHAT_MAX_MESSAGES` (default 1000000), `CHAT_PAGE_SIZE` (default 200), and `CHAT_MAX_LENGTH` (default 500) from the environment, and these SHALL govern the ring-buffer cap, the history page size/limit cap, and the maximum message length respectively. Invalid values (non-integer or non-positive) SHALL fail fast at startup.

#### Scenario: Lowered cap in tests
- **WHEN** `CHAT_MAX_MESSAGES` is lowered via the environment
- **THEN** the ring-buffer cap follows the configured value

#### Scenario: Invalid knob fails fast
- **WHEN** the service starts with a non-integer or non-positive chat knob
- **THEN** startup fails immediately with an error naming the offending variable, and no server begins listening

