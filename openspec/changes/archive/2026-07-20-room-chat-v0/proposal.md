## Why

`home-stream-lifecycle-v0` shipped a room page that is only a placeholder. This adds the first real reason to be in a room: live chat. Visitors chat in real time over the streamer WebSocket, history is stored per room and paginates upward, the creator is identifiable (username + a server-stamped STREAMER label), and the room page gets its production layout (camera placeholder + chat). It is the first feature that **changes a shipped contract** (`POST /streams` gains `username` and returns `creatorKey`).

Orchestration-level record for `room-chat-v0` (PRD `prds/room-chat-v0.md`). Each involved teammate runs its own openspec change against this record.

## What Changes

- **Contract change to shipped v0 (recorded):** `POST /streams` now requires `username` and returns an opaque `creatorKey`; `GET /streams` now includes `username`. `creatorKey` is never exposed in any listing or history — only in the `201`.
- **Chat over WebSocket** on the streamer service: `join` → `welcome` (server-stamped `sender`/`role`), `message` broadcast to the room, `error` to sender only. `role ∈ {streamer, viewer}` is stamped by the server from the connection's join; clients never send a role.
- **Creator vs viewer identity:** a valid `creatorKey` on join → chat as the stream `username` with `role: streamer`; otherwise a generated word+alphanumeric id (per-connection, nothing stored client-side), `role: viewer`. Lost key (reload) → creator becomes a viewer (documented, expected).
- **Chat history over HTTP:** `GET /streams/{id}/messages?before=&limit=` — cursor-based, latest page by default, `nextCursor` null when exhausted, `404` if the room is gone.
- **Per-room message storage in Valkey:** ring buffer capped at `CHAT_MAX_MESSAGES` (drop-oldest, never rejects at cap); deleted when the stream is deleted.
- **Room page layout (style law):** camera placeholder 2/3 + chat 1/3 (wide), 1/2 + 1/2 (narrow), chat toggle on both, room header (username, title, description). Same layout for creator and viewers.
- **Home shows username** (mono label above the title) in addition to title.
- **Env knobs** via compose: `CHAT_MAX_MESSAGES=1000000`, `CHAT_PAGE_SIZE=200`, `CHAT_MAX_LENGTH=500`.

**Behavior fixes folded into this feature (post-test-drive):**

- **Clickable stream list:** each stream on Home is a clickable, keyboard-accessible item that navigates into its room (`/stream/{id}`). qc-portal only.
- **Creator-only end (contract change):** `DELETE /streams/{id}` now requires the stream's `creatorKey` (`Authorization: Bearer <creatorKey>`) → `204` for the owner, `403` for a missing/invalid key on an existing stream, `404` if not found. The End control is shown only to the creator (the client holding the key). This replaces the v0 "anyone can end" behavior. Accepted limitation: `creatorKey` stays memory-only, so a creator who reloads loses the ability to end their own stream (nobody else can either) — documented until `security` provides real identity.
- **Ended → notice then redirect:** when the streamer ends the stream, other participants see a calm "This stream has ended" notice and are redirected to Home; a transient drop still reconnects (no redirect).

- **Scopes touched:** `qc-portal`, `streamer`, `devops`. **NOT touched:** `security`, `users`.

### Non-goals

Authentication / real identity (`creatorKey` is a stopgap, must not grow into an auth system); message persistence beyond room lifetime; edit/delete/reactions/moderation/rate-limiting; real media (camera stays a placeholder); realtime updates on Home.

## Capabilities

### New Capabilities

- `room-chat`: real-time chat in a stream room — WebSocket transport, server-stamped roles, creator/viewer identity via `creatorKey`, cursor-paginated history, per-room ring-buffer storage, the room layout, and the single-origin WS runtime.

### Modified Capabilities

- `home-stream-lifecycle`: `POST /streams` and `GET /streams` change shape (username + creatorKey); Home and the start flow gain the username field/display. Existing v0 behavior otherwise preserved.

## Impact

- **streamer**: username on create (+ stored `creatorKey`, treated as a credential), `GET /streams` username, WS endpoint + broadcast hub, history endpoint, ring-buffer message storage, delete-cascades-messages, room-closed-on-delete. Reads `CHAT_MAX_MESSAGES`/`CHAT_PAGE_SIZE`/`CHAT_MAX_LENGTH`. Constitutions: `CONSTITUTION.md`, `CONSTITUTION.go.md` (concurrency: every WS pump on `ctx.Done()`, `-race`, no leaked goroutines/subscriptions).
- **qc-portal**: username field in start flow, `creatorKey` in memory only, room layout + chat client (WS + history), STREAMER label, composer, reconnect, Home username. Constitutions: `CONSTITUTION.md`, `CONSTITUTION.ts.md`, `CONSTITUTION.style.md`.
- **devops**: three env vars on streamer **and nginx WebSocket-upgrade config** for `/streams/{id}/ws` (Upgrade/Connection headers, HTTP/1.1 upstream, long read timeout); acceptance now includes a live WS round-trip through the single origin. No new containers; Valkey unchanged. Constitution: `CONSTITUTION.md`.
