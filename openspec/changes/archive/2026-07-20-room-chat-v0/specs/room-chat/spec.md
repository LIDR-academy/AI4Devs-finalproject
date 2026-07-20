## ADDED Requirements

### Requirement: Join a room over WebSocket with a server-stamped identity
The system SHALL accept a WebSocket connection for a room and, on a `join` frame (optionally carrying `creatorKey`), stamp the connection's identity server-side and reply with a `welcome` frame `{ type, sender, role }`. A valid `creatorKey` (constant-time match to the stream's stored key) SHALL yield `sender = the stream username`, `role = "streamer"`. Any other case SHALL yield a generated word+alphanumeric `sender` and `role = "viewer"`. Clients SHALL NEVER send a role, and an invalid `creatorKey` SHALL NOT be an error — the connection silently becomes a viewer. Joining a nonexistent room SHALL send an `error` frame and close.

#### Scenario: Creator joins with a valid key
- **WHEN** a connection sends `join` with the stream's valid `creatorKey`
- **THEN** the server replies `welcome` with `sender` = the stream username and `role` = "streamer"

#### Scenario: Viewer joins without a key
- **WHEN** a connection sends `join` with no key or an invalid key
- **THEN** the server replies `welcome` with a generated word+alphanumeric `sender` and `role` = "viewer", and no error is sent

#### Scenario: Join a nonexistent room
- **WHEN** a connection sends `join` for a room id that does not exist
- **THEN** the server sends an `error` frame and closes the connection

### Requirement: Send and broadcast chat messages
On a `message` frame `{ type, text }`, the server SHALL validate `text` (non-empty after trim, ≤ `CHAT_MAX_LENGTH` code points), store it, and broadcast a `message` frame `{ message: { id, sender, role, text, ts } }` to every connection in the room, where `role`/`sender` are the connection's server-stamped identity and `ts` is server time (ISO-8601 UTC). Invalid input SHALL produce an `error` frame to the sender only, with nothing stored or broadcast. Clients SHALL enforce the same non-empty / ≤ `CHAT_MAX_LENGTH` rule before sending; the server enforces regardless.

#### Scenario: Valid message is broadcast
- **WHEN** a connection sends a valid `message`
- **THEN** every connection in the room (including two separate browsers) receives a `message` frame carrying `id`, `sender`, `role`, `text`, and `ts`

#### Scenario: Empty or over-long message rejected
- **WHEN** a connection sends an empty/whitespace or over-`CHAT_MAX_LENGTH` `message`
- **THEN** the sender receives an `error` frame and nothing is stored or broadcast

### Requirement: Per-room capped message storage
The system SHALL store each room's messages in streamer's private Valkey storage as a ring buffer capped at `CHAT_MAX_MESSAGES`, dropping the oldest when full — chat SHALL NOT reject at cap. When a stream is deleted, its messages SHALL be deleted with it and SHALL NOT leak.

#### Scenario: Cap drops oldest
- **WHEN** more than `CHAT_MAX_MESSAGES` messages are sent to a room (verified with a lowered cap in tests)
- **THEN** the oldest messages are dropped, chat keeps accepting, and history never exceeds the cap

#### Scenario: Delete removes messages
- **WHEN** a stream is deleted
- **THEN** its stored messages are removed; a room later created at the same id starts with empty history

### Requirement: Cursor-paginated chat history over HTTP
The system SHALL expose `GET /streams/{id}/messages?before={messageId}&limit={n}` returning `200 { "messages": [ { id, sender, role, text, ts } ], "nextCursor": string | null }`. With no `before` it SHALL return the latest page; `limit` defaults to and is capped at `CHAT_PAGE_SIZE`; messages SHALL be ordered oldest→newest within the page; `nextCursor` SHALL be `null` when older history is exhausted. It SHALL return `404` if the room does not exist.

#### Scenario: Latest page then scroll up
- **WHEN** a room has more than `CHAT_PAGE_SIZE` messages and a client requests history with no `before`
- **THEN** it receives the latest `CHAT_PAGE_SIZE` messages oldest→newest with a non-null `nextCursor`, and passing that cursor as `before` returns the previous page, until `nextCursor` is `null`

#### Scenario: History for a missing room
- **WHEN** a client requests history for a room id that does not exist
- **THEN** the response is `404`

### Requirement: History and live reconcile without gaps or duplicates
The client SHALL open the WebSocket and buffer incoming live `message` frames first, then fetch the latest history page, then flush the buffer and de-duplicate by server message `id`, so that no message is missed and none is shown twice at the boundary.

#### Scenario: Message arriving during load is shown once
- **WHEN** a message is broadcast in the window between the client opening the WS and its history fetch completing
- **THEN** that message appears exactly once after reconciliation (not missing, not duplicated)

### Requirement: Room ends while connected
When a stream is deleted while connections are live in its room, the system SHALL broadcast an `error` ("room ended") to those connections, close them, and drop the room from the hub, leaving no lingering sockets or subscriptions.

#### Scenario: Delete closes live connections
- **WHEN** a stream is deleted while a viewer is connected
- **THEN** the viewer's connection receives an `error` and is closed, and no goroutine or subscription leaks

### Requirement: WebSocket is served on the single origin
The room WebSocket SHALL be reachable by the browser only through the reverse proxy on the single published origin (no CORS, no base URL baked into the bundle). The proxy SHALL correctly upgrade the WebSocket (Upgrade/Connection headers, HTTP/1.1 upstream, a read timeout tolerant of idle chat) so a live round-trip works end to end under `docker compose up`.

#### Scenario: Live chat through the proxy
- **WHEN** the environment is brought up with `docker compose up` and two browsers open the same room through the single origin
- **THEN** a message sent by one appears live in the other, proving the WS upgrade traverses the proxy

### Requirement: Room page layout and chat rendering
The portal room page (`/stream/{id}`) SHALL present a room header (username, then title, then description when present) and a camera placeholder plus chat, laid out as camera 2/3 + chat 1/3 on wide viewports and camera 1/2 + chat 1/2 (rows) on narrow, with a chat toggle available on both that hides chat and expands the camera area. The same layout SHALL apply to creator and viewers. Live messages SHALL append at the bottom and auto-scroll only when the user is already at the bottom; scrolling to the top SHALL load older pages until exhausted. A message from `role == "streamer"` SHALL render a mono, uppercase, tracking-wide **STREAMER** label (no color, 0 radius); the client renders the role it receives and never infers the streamer. The **End stream** action SHALL be shown ONLY to the creator — the client that holds the `creatorKey` in memory — and SHALL send it as `Authorization: Bearer <creatorKey>` on `DELETE`; viewers and reloaded creators (who hold no key) SHALL NOT see the End control. On `204` the creator SHALL redirect to Home; a `404` (already gone) SHALL also redirect to Home; a `403` SHALL be handled calmly without leaving the page. All of this SHALL comply with `CONSTITUTION.style.md`.

#### Scenario: Responsive layout and toggle
- **WHEN** the room page is viewed wide then narrow, and the chat toggle is used
- **THEN** the layout is 2/3+1/3 columns wide and 1/2+1/2 rows narrow, and toggling hides chat and expands the camera area on both, with End stream still working

#### Scenario: STREAMER label from server role
- **WHEN** a message arrives with `role` = "streamer"
- **THEN** it renders with the STREAMER label (mono/uppercase/tracking-wide, no color, 0 radius), and viewer messages render with no label

### Requirement: Stream ended notice and redirect
When the room ends (the terminal room-ended signal: an `error` frame with a documented terminal reason immediately followed by a server close), the portal SHALL show a calm, style-law-compliant "This stream has ended" notice and then redirect the participant to Home (`/`). This applies to viewers and to any creator tab that did not itself trigger the end (the creator who clicked End stream redirects via the `204`). A transient drop (a close without a preceding terminal error) SHALL NOT redirect — it reconnects as before.

#### Scenario: Viewer redirected when the stream ends
- **WHEN** a viewer is in a room and the streamer ends the stream (terminal room-ended signal)
- **THEN** the viewer sees a brief "This stream has ended" notice and is then redirected to Home (`/`)

#### Scenario: Transient drop does not redirect
- **WHEN** the socket closes with no preceding terminal error frame
- **THEN** the portal reconnects and does not redirect to Home

### Requirement: Chat knobs are environment-configurable
The system SHALL read `CHAT_MAX_MESSAGES`, `CHAT_PAGE_SIZE`, and `CHAT_MAX_LENGTH` from the environment (supplied by compose) with the documented defaults, and these SHALL govern the cap, page size, and message length limit respectively.

#### Scenario: Lowered cap in tests
- **WHEN** `CHAT_MAX_MESSAGES` is lowered via the environment
- **THEN** the ring-buffer cap follows the configured value
