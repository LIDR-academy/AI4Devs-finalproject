## 1. v0 contract change (username + creatorKey)

- [x] 1.1 Extend wire types: `Stream` gains `username`; add `CreateStreamResult` (adds `creatorKey`); `CreateStreamInput` gains `username`.
- [x] 1.2 Update the streams API boundary: `POST /streams` sends `{ username, title, description }`; validate `username` (string) on every stream and `creatorKey` (string) on the create response from `unknown`; malformed → failure. Update tests.
- [x] 1.3 Add `src/streams/creator-key.ts`: in-memory only store (`setCreatorKey`/`takeCreatorKey`), never localStorage/sessionStorage/cookies. Test: set→take, and assert no web storage is written.
- [x] 1.4 Start modal: add required Username as the first field (order username → title → description); trim + require username client-side; on 201 store creatorKey in memory then navigate. Update/extend modal tests (empty username blocks, username trimmed, creatorKey retained + not persisted).
- [x] 1.5 Home: render each stream's username as a mono label above the title; description still not shown. Update Home tests (username shown, description hidden).

## 2. Chat client — WS + history boundary (`src/chat/chat-client.ts`)

- [x] 2.1 Define typed WS frames (join/welcome/message/error) and the history response type; validate all inbound frames + history from `unknown` at the boundary; drop malformed.
- [x] 2.2 Derive the same-origin WS URL from `window.location` (ws/wss by protocol, id path-encoded); inject the `WebSocket` factory and history `fetch` (defaults real) for testing.
- [x] 2.3 Implement reconciliation (D2): open WS → buffer live `message` frames → fetch latest history → render page, flush buffer, dedup by server `id` → then live-append. Expose `connect/send/onMessage/onStatus/close`.
- [x] 2.4 Implement reconnect with injected bounded backoff schedule (no real timers), re-`join` on reopen; distinguish room-ended (error/close after delete) → terminal `ended` status, not reconnecting.
- [x] 2.5 Tests (fake socket, deterministic): join carries/omits creatorKey; welcome identity applied; reconciliation exactly-once for a mid-load duplicate AND a distinct mid-load message; malformed frame dropped; error frame surfaced; reconnect re-joins; room-ended is terminal.

## 3. Room page + layout (`src/room/`)

- [x] 3.1 Build the room page shell: header (username → title → description when present), camera placeholder (`gray-fill` block + calm mono wording), chat area; wire End stream (DELETE → redirect on 204/404) — preserved from v0.
- [x] 3.2 Responsive layout: camera 2/3 + chat 1/3 columns at `lg`+, camera 1/2 + chat 1/2 rows below (CSS grid, no JS measuring).
- [x] 3.3 Chat toggle (in-memory, session-local) hiding chat + expanding camera on both layouts.
- [x] 3.4 Tests: header order, End stream 204/404 redirect preserved, toggle shows/hides chat and expands camera.

## 4. Chat UI — message list + composer (`src/chat/`)

- [x] 4.1 Message list: append live at bottom; auto-scroll only when already at bottom (record at-bottom before append, restore only if it was); scroll-to-top loads older pages via `nextCursor` until null, preserving position; no polling.
- [x] 4.2 Message rendering: typography on `surface` (not bubbles); STREAMER label (mono/uppercase/tracking-wide, no color, 0 radius) only when role == "streamer"; client renders received role, never infers.
- [x] 4.3 Composer: single-line; block empty/whitespace and > CHAT_MAX_LENGTH (500) code points (`[...str].length`) with calm inline copy; send valid `message`; show inbound `error` calmly.
- [x] 4.4 Tests: auto-scroll at-bottom vs scrolled-up; scroll-up paginates until nextCursor null then stops; STREAMER label present for streamer / absent for viewer; composer blocks empty + 501, allows exactly-500, sends valid; error frame shown, no message added.

## 5. Wiring & dev proxy

- [x] 5.1 Room page mounts the chat client on entry (join with held creatorKey), tears it down on leave (close socket, no leaks).
- [x] 5.2 Vite dev proxy: upgrade WebSocket (`ws: true`) for `/streams/{id}/ws`, alongside the existing `/streams` HTTP proxy; document in README + .env.example. (Production WS upgrade is nginx/devops per root D4.)

## 6. Style-law compliance & Definition of Done

- [x] 6.1 Run the `CONSTITUTION.style.md` §10 litmus across the room page (both layouts + toggle), the message list, the STREAMER label, and the composer: tokens only, AA contrast, radius 0, hairline dividers, no shadows, correct fonts/scale/weights, visible focus on toggle/composer/End stream, calm motion incl. non-fighting auto-scroll, prefers-reduced-motion respected. Fix any violation.
- [x] 6.2 Full suite green: `bun test` (new behavior + error paths, deterministic — fake socket, no real timers/network), `tsc --noEmit` strict clean, Biome clean with no inline disables, no `any`/unjustified `as`/`!`/`@ts-ignore` in the diff.
- [x] 6.3 Confirm the Dockerfile still builds and the static image serves (SPA fallback intact for `/stream/{id}` deep links); coordinate the WS frame contract + exact path and dedup-by-id with streamer, and WS proxy upgrade with devops.
- [x] 6.4 Compile the evidence-based done report (change → tests that prove it → bun test + tsc + Biome results) with an explicit `CONSTITUTION.style.md` compliance statement (AC12). Never a bare "done".

## 7. Behavior fixes (D9 clickable list, D10 creator-only End, D11 ended redirect)

- [x] 7.1 Coordinate the authenticated DELETE transport with streamer (`Authorization: Bearer <creatorKey>`; 204/404 redirect, 403 stay).
- [x] 7.2 D9: make each Home stream a keyboard-accessible link (real anchor to `/stream/{id}`, visible focus) that navigates on click/Enter. Test: link href + activation navigates.
- [x] 7.3 D10: show the End control only when the creatorKey is held in memory; send the authenticated DELETE; handle 204/404 (clear key, redirect) and 403 (calm inline, stay). Tests: End-visible-only-with-key, header sent, 204/403/404 handling.
- [x] 7.4 D11: on the terminal room-ended signal, show a calm "This stream has ended" notice then redirect Home; a transient drop still reconnects (no redirect). Tests: ended→notice→redirect, onEnded fires only on "ended".
- [x] 7.5 Re-run full DoD (tsc strict / bun test / Biome / Dockerfile builds) and re-state style-law compliance incl. the clickable-list focus states and the ended notice.
