## Context

Builds on the shipped v0 portal (Vite + VanJS + Bun + Tailwind v4, same-origin `/streams`, streams API boundary module). This change adds the room/chat experience and applies the v0 contract change (username + creatorKey).

Frozen in the root record (`openspec/changes/room-chat-v0/`), binding on the portal:
- **§6 HTTP+WS contract is law** — not restated here as changeable.
- **D1** — v0 contract change: `POST /streams` requires `username` and returns `creatorKey`; `GET /streams` includes `username`; all other v0 behavior preserved.
- **D2** — reconciliation: open WS and buffer live frames FIRST, then fetch latest history, then flush + dedup by server message `id`.
- **D3** — on room delete the server broadcasts an `error` ("room ended") and closes; the client handles that calmly.
- **D5** — `creatorKey` is a credential: memory only, never logged/persisted/surfaced.
- **D6** — Home shows `username` (mono label).
- **D7** — server-stamped roles; the client renders the role it receives and never infers the streamer; viewer ids are server-generated per connection.
- **D8** — teammate-owned: my breakpoint and camera-placeholder wording are my call, reported to the lead.

Constitutions: `CONSTITUTION.md`, `CONSTITUTION.ts.md`, `CONSTITUTION.style.md`.

## Goals / Non-Goals

**Goals:**
- Keep the room UI pure and the WebSocket/HTTP a single injected boundary, so the reconciliation and reconnect logic are testable with a fake socket — no real network, no real timers.
- Implement D2 reconciliation exactly, proven by a test where a live frame arrives mid-load.
- Full style-law compliance (STREAMER label, chat-as-typography, calm auto-scroll).

**Non-Goals:**
- Changing §6, streamer internals, or the nginx/dev-proxy WS config (devops-owned).
- Real media; auth; persisting creatorKey; realtime Home.
- A state framework beyond VanJS; no speculative abstraction (Constitution §2).

## Decisions

### D-P1 — Feature folders: extend streams, add room + chat
`src/streams/` keeps the streams API + Home + start modal (modified for username/creatorKey). New `src/room/` holds the room page, its responsive layout, and the chat toggle. New `src/chat/` holds the chat client (WS + history boundary), the message list, the composer, and the STREAMER label. A tiny `src/streams/creator-key.ts` holds the in-memory creatorKey store. Named exports only; no `utils/`.

### D-P2 — One chat client owns the WS + history boundary
`src/chat/chat-client.ts` is the only place that opens the WebSocket and fetches history; UI never touches `WebSocket`/`fetch` directly (style §9, ts §6). It exposes a small interface — `connect()`, `send(text)`, `onMessage(cb)`, `onStatus(cb)`, `close()` — and reconciles internally per D2. Inbound frames are parsed from `unknown` and validated at the boundary (each `welcome`/`message`/`error` shape checked; `message.id/sender/role/text/ts` are strings) before reaching the UI; a malformed frame is dropped, not rendered. The `WebSocket` factory and the history `fetch` are injected (default to the real ones) so tests drive a fake socket deterministically.

### D-P3 — Reconciliation (D2), concretely
On entry the client: (1) opens the WS and, from the moment it is open, pushes every inbound `message` into a `pending` buffer while `reconciled=false`; (2) fetches the latest history page; (3) sets the message list to that page, then flushes `pending`, appending only frames whose `id` is not already present (dedup by server `id`), then sets `reconciled=true`; thereafter live frames append directly. This guarantees a frame broadcast during the load window appears exactly once. Ids are server-authoritative (root D2), so a `Set<id>` dedup is reliable.

### D-P4 — Same-origin WS URL, derived at runtime
The URL is built from `window.location`: `${protocol === "https:" ? "wss" : "ws"}://${host}/streams/${id}/ws` — same origin, no baked URL, works behind nginx (prod) and the Vite dev proxy (dev, which must set `ws: true` for that path). The `id` is path-encoded.

### D-P5 — creatorKey in memory only (D5)
A module-level store (`setCreatorKey(id, key)` / `takeCreatorKey(id)`) keyed by stream id, living only in the JS heap — never `localStorage`/`sessionStorage`/cookies. Set on the start flow's `201`, read once when the room page joins. A reload clears it (the creator correctly falls back to a viewer). It is never rendered or logged.

### D-P6 — Auto-scroll only when at bottom; scroll-up paginates
Before appending, the list records whether it is scrolled to the bottom (within a small threshold). It appends, then restores scroll only if it *was* at bottom — never yanking a user reading history (style §7, calm). A scroll-to-top handler loads the previous page via `nextCursor` (prepending older messages and preserving scroll position) until `nextCursor` is `null`; then it stops. No polling.

### D-P7 — Client validation reuses code-point counting
The composer blocks empty/whitespace and `> CHAT_MAX_LENGTH` (500) code points using the same `[...str].length` rule as v0 (shared `countCodePoints`), matching streamer's server-side check. Invalid → calm inline copy, no frame sent. The server enforces regardless; an inbound `error` frame is shown calmly.

### D-P8 — Reconnect + room-ended handling
On unexpected socket close the client shows a quiet `reconnecting` status and retries with capped exponential backoff, re-sending `join` on reopen (identity may change if no key — correct). Backoff delays are injected as a schedule so tests are deterministic (no real timers). An `error` frame with a room-ended reason (or a normal server close after delete, D3) moves the room to a calm `ended` state (a quiet line + a link Home); it does not thrash reconnecting.

### D-P9 — Layout: breakpoint and placeholder (my D8 call)
Two layouts, both LAW; only the breakpoint and camera wording are mine. Breakpoint: Tailwind `lg` (≥1024px) → columns camera 2/3 + chat 1/3; below → rows camera 1/2 + chat 1/2 (CSS grid; no JS measuring). Chat toggle (in-memory, session-local) hides chat and expands the camera to full width/height on both. Camera placeholder: a `gray-fill` block with calm mono text "Camera preview will appear here." (reported to the lead). Chat is `surface` on `paper` with hairline dividers only where needed; messages are typography, not bubbles.

## Risks / Trade-offs

- **Missed/duplicated message at the history↔live seam** → D-P3 buffers live first and dedups by server id; a test injects a mid-load frame and asserts exactly-once.
- **Auto-scroll fighting the reader** → D-P6 only auto-scrolls when already at bottom; covered by a test on the at-bottom flag.
- **creatorKey leaking to storage** → D-P5 keeps it in a heap-only module; a test asserts nothing is written to `localStorage`/`sessionStorage`.
- **Reconnect storm / flaky timing** → backoff schedule injected; tests use a synchronous schedule, no real timers (ts §7).
- **Dev WS not upgrading** → the Vite proxy needs `ws: true` for `/streams/{id}/ws`; production WS upgrade is nginx/devops (D4). Flagged to devops; my dev proxy handles the dev case.
- **Malformed inbound frame** → validated at the boundary and dropped, never rendered as `undefined`.

## Migration Plan

No data migration. Order within this change: (1) apply the v0 contract change (username field + creatorKey memory store + Home username + wire types) with tests; (2) chat client boundary (WS + history + reconciliation + reconnect) with a fake socket; (3) room page layout + toggle; (4) message list (append/auto-scroll/scroll-up/STREAMER label) + composer; (5) style-law litmus; (6) full `bun test` + `tsc --noEmit` + Biome + Docker build. Portal builds in parallel with streamer against §6; end-to-end WS round-trip through the proxy is devops's acceptance #10.

## Open Questions

None blocking. Breakpoint (`lg`) and camera wording chosen above and reported to the lead; may refine visuals via the frontend-design plugin during implementation without changing the two LAW layouts. Exact WS path is streamer-documented; I build to `/streams/{id}/ws` and will confirm during coordination.
