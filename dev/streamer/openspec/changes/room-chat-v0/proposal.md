## Why

`home-stream-lifecycle-v0` shipped the streams API but a room is silent. This adds live chat inside stream rooms — a per-room WebSocket for real-time messages, capped per-room history in Valkey with cursor pagination over HTTP, and a server-stamped `STREAMER` role — plus the v0 contract change that introduces `username` and `creatorKey`. It is the streamer server half of `room-chat-v0`.

This change covers the **streamer scope only**. The cross-scope wire contract (§6: HTTP + WebSocket) and the runtime decisions are frozen in the root record (`openspec/changes/room-chat-v0/`) and are **LAW** here. This proposal implements against them and does not reopen them.

## What Changes

**Contract change to the shipped v0 endpoints (MODIFIED, preserving prior behavior):**

- `POST /streams` now also requires `username` (non-empty, trimmed) and returns an opaque `creatorKey`. Response becomes `{ id, username, title, description, creatorKey }`. All prior v0 rules (title required, description ≤ 100 code points, 8 KiB cap, 400 on failure) are preserved.
- `GET /streams` now includes `username` per stream: `{ id, username, title, description }`. `creatorKey` is **never** exposed in any listing or history — only in the `201` create response.

**New chat capability (ADDED):**

- **WebSocket** at `/streams/{id}/ws` (streamer's documented path), reachable only through the reverse proxy on the single origin — **no CORS**. Frames per §6: `join` (optional `creatorKey`) → server-stamped `welcome` `{sender, role}`; `message` `{text}` → validated, stored, broadcast as `{message:{id,sender,role,text,ts}}`; `error` `{reason}` to the sender only. Joining a nonexistent room → `error` + close.
- **Server-stamped identity**: a valid `creatorKey` (constant-time compare against the stream's stored key) → `sender = username`, `role = "streamer"`; otherwise a generated word+alphanumeric `sender`, `role = "viewer"`. Clients never send a role; an invalid key is not an error (silent viewer).
- **Per-room capped storage** in Valkey: a ring buffer of up to `CHAT_MAX_MESSAGES`, drop-oldest — chat never rejects at cap. Message ids are **server-authoritative and stable** so history↔live dedup by id is reliable (root D2). Deleting a stream deletes its messages.
- **History endpoint** `GET /streams/{id}/messages?before={messageId}&limit={n}` → `200 {messages:[{id,sender,role,text,ts}], nextCursor}`; no `before` = latest page; `limit` defaults to and is capped at `CHAT_PAGE_SIZE`; messages ordered oldest→newest; `nextCursor` `null` when history is exhausted; `404` if the room does not exist. `ts` is server time, ISO-8601 UTC.
- **Room-end while connected**: on `DELETE /streams/{id}`, broadcast an `error` ("room ended") to that room's connections, close them, drop the room from the in-process hub, and delete its messages — no lingering sockets or goroutines.
- **In-process broadcast hub**: single instance, no Valkey pub/sub (single-replica deployment — do not over-build).
- **New env knobs**: `CHAT_MAX_MESSAGES` (default 1000000), `CHAT_PAGE_SIZE` (default 200), `CHAT_MAX_LENGTH` (default 500).

### Non-goals

- Authentication / real identity — `creatorKey` is a stopgap credential for `security` later; it must not grow into an auth system.
- Message editing/deletion, reactions, moderation, rate limiting (accepted v0 risk).
- Message persistence beyond room lifetime (Valkey ephemeral, no volume — devops-owned).
- Real media; the camera stays a placeholder (qc-portal-owned).
- The portal room-page layout, chat rendering, and the client-side history↔live buffering (qc-portal scope). This change owns only the server obligations that make them work (stable ids, the frame contract, the history contract).
- Multi-replica fan-out (Valkey pub/sub) — single in-process hub only.
- nginx WebSocket-upgrade config and TLS (devops-owned).

## Capabilities

### New Capabilities

- `room-chat`: the streamer server side of room chat — the room WebSocket (join/identity/message/broadcast/error/room-end), per-room capped Valkey storage with server-authoritative stable ids, the cursor-paginated history endpoint, single-origin serving, and the chat env knobs.

### Modified Capabilities

- `stream-lifecycle-api`: `POST /streams` gains a required `username` and returns `creatorKey`; `GET /streams` gains `username`. All other v0 behavior is preserved (MODIFIED, not a rewrite).

## Impact

- **Modified Go packages**: `internal/config` (three chat knobs), `internal/stream` (username field + validation; `creatorKey` generation/storage/constant-time verify; delete cascades to messages), `internal/httpapi` (POST/GET shape change, new `/streams/{id}/messages` handler, new `/streams/{id}/ws` upgrade handler), `internal/valkey` (username + private creatorKey fields; per-room message stream ops).
- **New Go packages**: `internal/chat` (Message, validation, history, `MessageStore` interface) and `internal/hub` (in-process broadcast hub + connection lifecycle).
- **New dependency**: one WebSocket library (no stdlib WS server) — the second justified external dependency; choice and version recorded in the design and done evidence.
- **External systems**: Valkey (now also holds per-room message streams). No new systems.
- **Cross-scope contracts (flagged, frozen — coordinated in the race, not changed here)**:
  - `qc-portal ↔ streamer`: the WebSocket frame contract and the WS path `/streams/{id}/ws`; the history endpoint shape; the POST/GET contract change.
  - `streamer → devops`: three new env var names (`CHAT_MAX_MESSAGES`, `CHAT_PAGE_SIZE`, `CHAT_MAX_LENGTH`); nginx WebSocket-upgrade expectations for `/streams/{id}/ws` (Upgrade/Connection headers, HTTP/1.1 upstream, an idle-tolerant read timeout).
  - `security`, `users`: **not touched**.
