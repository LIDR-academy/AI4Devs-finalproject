# portal-room-chat Specification

## Purpose
TBD - created by archiving change room-chat-v0. Update Purpose after archive.
## Requirements
### Requirement: Room page layout
The room page (`/stream/{id}`) SHALL present a header showing the stream's `username`, then `title`, then `description` when present, a **media area** (hosting the live media surface — creator pre-join/live or viewer video/offline, defined in the `portal-stream-media` capability), and a chat area. It SHALL lay these out as media 2/3 + chat 1/3 (columns) on wide viewports and media 1/2 + chat 1/2 (rows) on narrow viewports. The same layout SHALL apply to creator and viewers. A **chat toggle** SHALL be available on both layouts; hiding chat SHALL expand the media area to full width (wide) or full height (narrow). Toggle state SHALL be session-local and held in memory only. The media area and the chat SHALL be independent (per `portal-stream-media`): toggling or a fault in one SHALL NOT disturb the other.

#### Scenario: Responsive two-layout
- **WHEN** the room page is viewed on a wide viewport and then a narrow one
- **THEN** it shows media 2/3 + chat 1/3 columns when wide and media 1/2 + chat 1/2 rows when narrow

#### Scenario: Chat toggle expands the media area
- **WHEN** the visitor toggles chat off
- **THEN** the chat area is hidden and the media area expands to fill the space, on both layouts, and toggling on restores chat, without disturbing the media connection

#### Scenario: Header shows username first
- **WHEN** the room page renders for a stream with a username, title, and description
- **THEN** the header shows the username, then the title, then the description, and the username is display-only

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

### Requirement: Room ended notice and redirect
When the chat reaches the terminal room-ended state, the room page SHALL show a calm "This stream has ended" notice and then redirect to `/`. A transient WebSocket drop (no preceding terminal error) SHALL NOT trigger this — it reconnects with no notice or redirect.

#### Scenario: Ended shows a notice then redirects
- **WHEN** the terminal room-ended signal fires
- **THEN** a calm "This stream has ended" notice is shown and the portal then redirects to `/`

#### Scenario: Transient drop does not redirect
- **WHEN** the WebSocket drops with no preceding terminal error
- **THEN** the client reconnects and no ended notice or redirect occurs

### Requirement: Chat client joins with server-stamped identity
On entering a room the portal SHALL open the room WebSocket at the same-origin path and send a `join` frame carrying the access **token** when the user is signed in (no token when anonymous — the `creatorKey` mechanism is retired). It SHALL render the `sender` and `role` returned in the server's `welcome` frame and SHALL NEVER send a role or infer which participant is the streamer.

#### Scenario: Signed-in join carries the token
- **WHEN** a signed-in user enters a room
- **THEN** the `join` frame includes their access token

#### Scenario: Anonymous join carries no token
- **WHEN** an anonymous visitor enters a room
- **THEN** the `join` frame is sent without a token and the connection is read-only (history + live messages)

### Requirement: History and live reconcile without gaps or duplicates
On entry the portal SHALL open the WebSocket and buffer inbound live `message` frames first, then fetch the latest history page, then render that page and flush the buffer, de-duplicating by server message `id`, so that a message broadcast during the load window appears exactly once. Message `id`s are treated as server-authoritative for de-duplication.

#### Scenario: Message during load appears once
- **WHEN** a `message` frame arrives after the WebSocket opens but before the history fetch completes, and that message is also present in the fetched page
- **THEN** it is rendered exactly once after reconciliation, neither missing nor duplicated

#### Scenario: Distinct live message during load is kept
- **WHEN** a `message` frame arrives during the load window and is NOT in the fetched history page
- **THEN** it is appended exactly once after the history page

### Requirement: Message rendering and STREAMER label
The chat SHALL render messages as typography on a `surface` background (not bubbles), showing each message's `sender` and `text`. A message whose `role` is `"streamer"` SHALL render a **STREAMER** label that is mono, uppercase, and `tracking-wide`, with no color and 0 radius; viewer messages SHALL render with no label. The client SHALL render the `role` it receives and SHALL NOT infer the streamer.

#### Scenario: Streamer message shows the label
- **WHEN** a message arrives with `role` = "streamer"
- **THEN** it renders with the mono/uppercase/tracking-wide STREAMER label (no color, 0 radius)

#### Scenario: Viewer message shows no label
- **WHEN** a message arrives with `role` = "viewer"
- **THEN** it renders the sender and text with no STREAMER label

### Requirement: Auto-scroll only when at bottom
When a new live message is appended, the chat SHALL keep the view pinned to the newest message only if the user was already scrolled to the bottom; if the user was scrolled up reading history, the view SHALL NOT move.

#### Scenario: Pinned when at bottom
- **WHEN** the user is scrolled to the bottom and a new message arrives
- **THEN** the view scrolls to show the new message

#### Scenario: Not moved when scrolled up
- **WHEN** the user is scrolled up reading older messages and a new message arrives
- **THEN** the view does not move

### Requirement: Scroll-up loads older history
Scrolling to the top of the chat SHALL load the previous page via the `nextCursor` from the last history response, prepending older messages while preserving the reading position, and SHALL stop when `nextCursor` is `null`. There SHALL be no polling.

#### Scenario: Older pages load until exhausted
- **WHEN** the user scrolls to the top and a non-null `nextCursor` is available
- **THEN** the previous page is fetched and prepended, and this repeats on further scroll-to-top until `nextCursor` is `null`, after which no further request is made

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

### Requirement: Reconnect and room-ended handling
On an unexpected WebSocket close the portal SHALL show a quiet "reconnecting" status and retry with a bounded backoff, re-sending `join` on reconnect (the assigned identity MAY change if no `creatorKey` is held, which is correct). When the room ends (a server `error` indicating the room ended, or a close following deletion) the portal SHALL move to a calm "ended" state and SHALL NOT keep reconnecting.

#### Scenario: Transient drop reconnects
- **WHEN** the WebSocket closes unexpectedly
- **THEN** a quiet reconnecting status is shown, the client retries with backoff, and on reopen it re-sends `join`

#### Scenario: Room ended stops reconnecting
- **WHEN** the server signals the room has ended
- **THEN** the portal shows a calm ended state and does not continue reconnecting

### Requirement: Typed, validated chat boundary
All WebSocket and chat-history calls SHALL live in a single non-UI chat module; UI components SHALL NOT open a `WebSocket` or call `fetch` directly. The module SHALL derive the WebSocket URL from the current origin (no base URL baked in), parse inbound frames from `unknown`, and validate each frame's shape (`welcome`/`message`/`error`, with `message` carrying string `id`, `sender`, `role`, `text`, `ts`) before surfacing it; a malformed frame SHALL be dropped, not rendered. The history endpoint response SHALL likewise be validated, including a `nextCursor` that is a string or `null`.

#### Scenario: Malformed frame dropped
- **WHEN** the WebSocket delivers a frame that is not a valid `welcome`/`message`/`error`
- **THEN** the chat module drops it and nothing invalid is rendered

#### Scenario: UI does not touch the socket
- **WHEN** a UI component needs to send or receive chat
- **THEN** it uses the chat module, which owns the WebSocket and history fetch, and never opens the socket itself

### Requirement: Room chat style-law compliance
The room page and chat SHALL comply with `CONSTITUTION.style.md`: token-only colors (no arbitrary hex/rgb, no accent color; the STREAMER distinction carried by mono/uppercase/weight, never color), WCAG AA contrast, border-radius 0, `1px` hairline dividers, no shadows/gradients/blurs, Inter + JetBrains Mono with the fixed scale and weights 400/600, visible focus on every interactive element (toggle, composer, buttons), and motion limited to `opacity`/color transitions disabled under `prefers-reduced-motion` — including the auto-scroll, which SHALL never fight the user.

#### Scenario: Reduced motion respected
- **WHEN** the environment sets `prefers-reduced-motion: reduce`
- **THEN** chat and layout transitions render without motion

#### Scenario: Focus visible on chat controls
- **WHEN** the visitor moves focus with the keyboard to the composer, the chat toggle, or the End stream action
- **THEN** a visible focus indicator is shown on that element

