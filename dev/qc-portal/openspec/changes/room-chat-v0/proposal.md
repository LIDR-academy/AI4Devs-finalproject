## Why

`home-stream-lifecycle-v0` shipped a room page that is only a placeholder. This change gives the room its first real experience: live chat over the streamer WebSocket, paginated history over HTTP, a responsive camera-2/3 + chat-1/3 layout, and a server-stamped **STREAMER** label so the creator is identifiable. It also applies the v0 contract change (a stream now carries a `username`, set at creation) to the Home list and start flow.

This is the qc-portal deliverable for feature `room-chat-v0`. The cross-scope HTTP+WS contract (PRD §6) and the reconciliation/identity decisions are already frozen in the team lead's root record (`openspec/changes/room-chat-v0/`, decisions D1–D8). This change records only how the portal implements against that frozen record; it never restates the contract as changeable.

## What Changes

Components touched: **Streamings** (Home list + start flow) and **Rooms** (the room page: layout + chat). **Login** untouched.

Modifies the `portal-home-stream-lifecycle` baseline:
- **Start flow** gains a required **Username** as the first field (order: username → title → description). On `201` the returned **`creatorKey`** is kept **in memory only** — never `localStorage`, never any persistent store (decision D5, and the ephemeral rule).
- **Home** renders each stream's **`username`** as a mono label (style §5) above its `title`; `description` stays received-but-not-shown (D6).
- The **wire boundary** sends `{ username, title, description }` to `POST /streams` and reads `username` on every stream and `creatorKey` on the create response.

Adds a new capability `portal-room-chat`:
- **Room page (`/stream/{id}`)** with a header (username, then title, then description when present), a calm `gray-fill` camera placeholder, and chat — laid out **camera 2/3 + chat 1/3** wide and **camera 1/2 + chat 1/2 (rows)** narrow, with a **chat toggle** on both that hides chat and expands the camera. Same layout for creator and viewers. **End stream** remains.
- **Chat client** over the same-origin WebSocket: on entry it opens the WS and buffers live frames, fetches the latest history page, then flushes and de-duplicates by server message `id` (reconciliation rule D2). It sends `join` (with the in-memory `creatorKey` if held) and renders the server-stamped `sender`/`role` from `welcome` — it **never infers** who the streamer is (D7).
- **Message rendering**: messages are typography on `surface`, not bubbles; a `role == "streamer"` message shows a mono/uppercase/`tracking-wide` **STREAMER** label — no color, 0 radius (style §5). Live messages append at the bottom and auto-scroll **only when the user is already at the bottom**; scrolling to the top loads older pages via `nextCursor` until `null`.
- **Composer**: single-line, client-enforced non-empty and ≤ `CHAT_MAX_LENGTH` (500) code points, with calm inline validation; the server enforces regardless.
- **Resilience**: a WS drop shows a quiet "reconnecting" state and retries with simple backoff, then re-joins (identity may change if no key was held — correct, not a bug); a "room ended" error/close is handled calmly.

## Capabilities

### New Capabilities

- `portal-room-chat`: the portal-side room experience — responsive room layout with chat toggle, the WebSocket chat client, history↔live reconciliation, cursor-paginated scroll-up, server-stamped identity/STREAMER rendering, the composer, and reconnect/room-ended handling — consuming the frozen §6 HTTP+WS contract at the same origin.

### Modified Capabilities

- `portal-home-stream-lifecycle`: start flow gains a required username and retains `creatorKey` in memory; Home shows username; the wire boundary carries `username`/`creatorKey`.

## Impact

- **Scope**: qc-portal only. All files under `dev/qc-portal/`. No other scope touched.
- **Consumes (frozen §6, not modified here)**: `POST /streams` (now `{username,title,description}` → `{…,creatorKey}`), `GET /streams` (now includes `username`), `DELETE /streams/{id}`, `GET /streams/{id}/messages?before&limit`, and the room WebSocket at the same-origin path (streamer-documented, e.g. `/streams/{id}/ws`). All reached same-origin — no CORS, no base URL baked in.
- **New dev-proxy need**: the Vite dev proxy must upgrade WebSocket for the `/streams/{id}/ws` path (`ws: true`), mirroring nginx's upgrade in production (devops-owned, D4).
- **Coordination (for the race)**: WS frame shapes + exact path with streamer; that my dedup-by-id matches streamer's server-authoritative ids.
- **Constitutions**: `CONSTITUTION.md`, `CONSTITUTION.ts.md`, `CONSTITUTION.style.md`.
- **Not involved**: `security`, `users`, LiveKit — `creatorKey` is a stopgap, not auth, and must not grow into one.

## Non-goals

- Authentication / real identity; persisting `creatorKey` anywhere (memory only).
- Message persistence beyond room lifetime; editing/deleting/reactions/moderation/rate-limiting.
- Real media — the camera area stays a placeholder.
- Realtime updates on Home (unchanged).
- Dark mode (style §8). Any change to the §6 contract — it is law; changes route through the team lead.
