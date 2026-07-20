# PRD — Room Chat v0

- **Feature ID**: `room-chat-v0`
- **Status**: Approved by human
- **Depends on**: `home-stream-lifecycle-v0` (shipped)
- **Scopes involved**: `qc-portal`, `streamer`, `devops`
- **Scopes NOT involved**: `security`, `users` (must not be touched)
- **Constitutions in force**: `CONSTITUTION.md`, `CONSTITUTION.ts.md` (qc-portal),
  `CONSTITUTION.go.md` (streamer), `CONSTITUTION.style.md` (qc-portal)

## 1. Summary

Live chat inside stream rooms. Visitors on `/stream/{id}` chat over the
`streamer` WebSocket; message history is stored per room in Valkey (up to 1M
messages, drop-oldest) and paginated over HTTP (200 per page, cursor-based,
scroll-up). The stream creator sets a username at creation and is labeled
**STREAMER** in chat via a server-stamped role. Everyone else gets an ephemeral
generated id. The room page gets its first real layout: camera placeholder 2/3,
chat 1/3, responsive, with a chat toggle.

## 2. Goals

- Visitors in a room can chat in real time.
- Chat history survives within the room's lifetime and paginates upward.
- The creator is identifiable: username in the room header and a STREAMER
  label on their messages — enforced by the server, not the client.
- The room page has its production layout (minus real media).

## 3. Non-Goals (explicitly out of scope)

- Authentication / real identity. The `creatorKey` is a stopgap that `security`
  will replace; it is not an auth system and must not grow into one.
- Message persistence beyond room lifetime — messages die with the room.
- Editing/deleting messages, reactions, moderation, rate limiting (accepted
  risk for v0; revisit with security).
- Real media. The camera area remains a placeholder.
- Realtime updates on Home (unchanged from v0).

## 4. Decisions on Record

- 1M cap is **per room**, drop-oldest (ring buffer) — chat never rejects at cap.
- Valkey remains streamer's **private**, ephemeral storage; no volume.
- Viewer ids: **word + alphanumeric** (e.g. `falcon-x92k`), generated
  **per WS connection**, nothing stored client-side. Reload = new id.
- Creator identity: `POST /streams` returns an opaque **`creatorKey`**, held in
  client memory only. Valid key on WS join → chat as the username with
  `role: "streamer"`. Lost key (reload) → creator falls back to a random
  viewer id. Trivial by design; security replaces it later.
- Username is stream metadata: set at creation, **non-editable**, displayed
  above title and description.
- Pagination is cursor-based, newest-first entry + infinite scroll upward.
  "Page N" style pagination is explicitly rejected for chat.
- Knobs are env vars with defaults: `CHAT_MAX_MESSAGES=1000000`,
  `CHAT_PAGE_SIZE=200`, `CHAT_MAX_LENGTH=500`.

## 5. Functional Requirements

### 5.1 streamer

**Contract change to v0 endpoints** (this is a recorded contract change):

- `POST /streams` now requires `username` (non-empty, trimmed) alongside
  `title` (required) and `description` (optional, ≤ 100). Returns `creatorKey`.
- `GET /streams` now includes `username` per stream. `creatorKey` is **never**
  exposed in any listing or history — only in the `201` create response.

**Chat storage**

- Per-room message log in Valkey; cap `CHAT_MAX_MESSAGES` with drop-oldest.
- A message: `{ id, sender, role, text, ts }`. `role` ∈ `"streamer" | "viewer"`,
  stamped by the server at receive time based on the connection's join.
- When a stream is deleted (`DELETE /streams/{id}`), its messages are deleted.

**History endpoint**

- `GET /streams/{id}/messages?before={messageId}&limit={n}` — no `before` means
  the latest page; `limit` defaults to and is capped at `CHAT_PAGE_SIZE`.
  Returns messages plus `nextCursor` (`null` when history is exhausted).
  `404` if the room doesn't exist.

**WebSocket** (endpoint path of streamer's choice, documented in its openspec,
e.g. `/streams/{id}/ws`):

- On connect, client sends `join` (optionally with `creatorKey`). Server
  validates: valid key → sender = stream username, role = streamer; otherwise
  generate a word+alphanumeric id, role = viewer. Server replies `welcome`
  with the assigned sender (and role).
- `message` frames: server validates (non-empty after trim, ≤ `CHAT_MAX_LENGTH`),
  stores, broadcasts to all connections in the room with `id/sender/role/text/ts`.
  Invalid → `error` frame to the sender only; nothing stored or broadcast.
- Joining a nonexistent room → `error` + close.
- Multiple connections may present the same valid `creatorKey` (e.g. two tabs);
  all get the streamer identity. Accepted for v0.

### 5.2 qc-portal

**Start flow (updated)**

- New first field: **Username** (required, non-empty) — above Title, mirroring
  display order: username, title, description. Same confirm step as v0.
- On `201`, keep `creatorKey` **in memory only** (no localStorage — forbidden
  by decision and by artifact of the ephemeral rule), then redirect.

**Room page `/stream/{id}` — layout (style law in force)**

- **Desktop / wide**: two columns — camera area **2/3**, chat **1/3**.
- **Mobile / narrow**: two rows — camera **1/2**, chat **1/2**.
- Camera area: placeholder — calm `gray-fill` block with a short mono text
  (teammate's wording). No fake video chrome.
- **Room header** above the camera area: **username**, then title, then
  description (when present). Username is display-only.
- **Chat toggle**: available on desktop AND mobile. Hidden chat → camera area
  expands to full width (desktop) / full height (mobile). Toggle state is
  session-local, in memory.
- **End stream** button remains on the page (placement: teammate's choice,
  sane and per style law).
- Same layout for creator and viewers.

**Chat behavior**

- On entry: fetch latest page via history endpoint, open WS, send `join`
  (with `creatorKey` if held in memory).
- Live messages append at the bottom; auto-scroll only when the user is
  already at the bottom (never yank them while reading history).
- Scrolling to the top loads the previous page via `nextCursor` until `null`.
- Sender rendering: sender name; when `role == "streamer"`, add a small
  **STREAMER** label — mono, uppercase, `tracking-wide`, per style §5. No
  color accent (none exists). The client renders the role it receives; it
  never infers who the streamer is.
- Input: single-line composer; client-side enforcement of non-empty and
  ≤ 500 chars (server enforces regardless); calm inline validation.
- WS drop: show a quiet "reconnecting" state and retry with simple backoff;
  on reconnect, re-join (identity may change if the key was never held — that
  is correct behavior, not a bug).

### 5.3 devops

- Add to `streamer`'s environment in compose:
  `CHAT_MAX_MESSAGES=1000000`, `CHAT_PAGE_SIZE=200`, `CHAT_MAX_LENGTH=500`.
- No new containers. Valkey unchanged (ephemeral, no volume).

## 6. Wire Contract — Law

Both sides implement against this exactly. Changes go back through the team lead.

### HTTP

```
POST /streams
  body: { "username": string, "title": string, "description"?: string }
  constraints: username & title required, non-empty (trimmed); description ≤ 100
  → 201 { "id", "username", "title", "description", "creatorKey" }
  → 400 on validation failure

GET /streams
  → 200 [ { "id", "username", "title", "description" } ]

DELETE /streams/{id}
  → 204 (also deletes the room's messages)
  → 404 if not found

GET /streams/{id}/messages?before={messageId}&limit={n}
  → 200 { "messages": [ { "id", "sender", "role", "text", "ts" } ],
          "nextCursor": string | null }
  → 404 if the room doesn't exist
  notes: no `before` = latest page; limit capped at CHAT_PAGE_SIZE;
         messages ordered oldest→newest within the page; ts = server time,
         ISO-8601 UTC.
```

### WebSocket

```
client → { "type": "join", "creatorKey"?: string }
server → { "type": "welcome", "sender": string, "role": "streamer" | "viewer" }
client → { "type": "message", "text": string }
server → { "type": "message",
           "message": { "id", "sender", "role", "text", "ts" } }   // broadcast
server → { "type": "error", "reason": string }                     // to sender only
```

- `role` is stamped by the server. Clients never send a role.
- Invalid `creatorKey` is not an error: the client silently becomes a viewer.

## 7. Style Requirements (qc-portal)

`CONSTITUTION.style.md` applies in full. Feature-specific checks:

- STREAMER label: mono, uppercase, small, `tracking-wide` — weight/mono carry
  the distinction, no color, no background pill with radius (0 radius always).
- Chat surface: `surface` on `paper`, hairline dividers only where needed;
  messages are typography, not bubbles.
- Toggle, composer, buttons: per style §6; focus states mandatory; auto-scroll
  behavior must never fight the user (calm motion, §7).
- Layout breakpoints: teammate's choice of exact breakpoint, but the two
  layouts in §5.2 are law.

## 8. Acceptance Criteria

1. Creating a stream requires a username; it appears in the room header above
   title/description and in `GET /streams`.
2. The creator (key in memory) chats as their username with the STREAMER label;
   every other participant gets a word+alphanumeric id with no label.
3. Creator reload → creator becomes an anonymous viewer (expected, documented).
4. Two browsers in the same room see each other's messages live.
5. History: entering a room with >200 messages shows the latest 200; scrolling
   up loads older pages until exhausted; order is correct throughout.
6. Cap behavior verified with a lowered `CHAT_MAX_MESSAGES` in tests: oldest
   messages are dropped, chat keeps accepting.
7. Empty and >500-char messages are blocked client-side and rejected
   server-side (error frame; nothing broadcast).
8. Ending a stream deletes its messages (room recreated at same id starts empty
   — id reuse isn't expected, but storage must not leak).
9. Layout: 2/3+1/3 columns on wide, 1/2+1/2 rows on narrow; toggle hides chat
   and expands camera on both; End stream still works.
10. All knobs configurable via env; devops wiring verified with
    `docker compose up` end to end.
11. Full suites pass with evidence: `bun test`; `go test -race ./...` +
    `go vet` + linter. WS code must be race-tested.
12. qc-portal's done report explicitly states style-law compliance.

## 9. Delegation Plan (team lead)

- Record in openspec as `room-chat-v0` with the v0 contract change noted.
- Three deliverables: streamer (§5.1, §6), qc-portal (§5.2, §7), devops (§5.3).
- Teammates run their own openspec workflow before code. Contract is law from
  day one, so portal and streamer build in parallel; direct coordination
  allowed, lead always informed.
- Pending until all three report done with evidence; lead presents the final
  summary. **The human has the final word on shipped.**

## 10. Resolved Decisions (for the record)

- Transport split confirmed: WS for live, HTTP for history (gap #1).
- 1M per room, drop-oldest (gap #2). Messages die with the room; Valkey
  private/ephemeral (gap #3).
- Ids: word+alphanumeric, per-connection ephemeral; creator identified via
  `creatorKey` returned at creation (gap #4, mechanism lead's call, approved).
- Cursor pagination, latest-first entry, scroll-up (gap #5).
- Knobs as env vars via compose (gap #6), including `CHAT_MAX_LENGTH=500` (#7).
- Rate limiting explicitly out of scope for v0 (gap #7).
- Camera stays fake with placeholder text (gap #8).
- Toggle on desktop and mobile; camera expands; same layout for all (gap #9).
- STREAMER chat label, server-stamped `role` field (human addition, final turn).
