## Context

Builds on shipped `home-stream-lifecycle-v0` (single-origin nginx proxy, streamer + Valkey, static portal). PRD `prds/room-chat-v0.md` is approved; §6 wire contract is law and §4/§10 resolve most product gaps. During explore-mode intake the three involved teammates' concerns were distilled to a handful of cross-scope decisions; the human ruled on them. This records those decisions so every teammate builds to the same how. Orchestration-level design; each teammate produces its own change with its own internal design.

## Goals / Non-Goals

**Goals:** one agreed HTTP+WS contract and one runtime story (WS through the single origin); a correct history↔live boundary; the v0 contract change applied without breaking preserved v0 behavior.

**Non-Goals:** intra-service implementation detail owned by each teammate — streamer's Valkey structure and hub design, qc-portal's component layout and breakpoint, nginx's exact directives/timeout value.

## Decisions

### D1 — v0 contract change is deliberate and preserves prior behavior (human-recorded)
`POST /streams` requires `username` (non-empty, trimmed) and returns `creatorKey`; `GET /streams` includes `username`. Everything else about v0 streams (title/description rules, DELETE, error body, single origin) is preserved. The spec captures this as MODIFIED requirements against the `home-stream-lifecycle` baseline, not a rewrite.

### D2 — History ↔ live reconciliation is a fixed contract rule (human decision)
The client SHALL: open the WS and buffer incoming live frames first, then fetch the latest history page, then flush the buffer and dedup by server message `id`. This removes both the missed-message gap and the duplicate-message overlap at the boundary. Both portal and streamer build to this rule; message ids are server-authoritative so dedup is reliable.

### D3 — Stream deleted while viewers are connected (human decision)
On `DELETE /streams/{id}`, streamer SHALL broadcast an `error` ("room ended") to every connection in that room, close those connections, and drop the room from the hub. No zombie sockets.

### D4 — WebSocket traverses the single origin; devops scope expanded (human decision)
The browser reaches the WS only through the nginx proxy at `/streams/{id}/ws` (same origin, no CORS, no baked URL — consistent with Topology 2). devops's deliverable therefore includes nginx WebSocket-upgrade config (Upgrade/Connection headers, HTTP/1.1 upstream, a read timeout long enough for idle chat), not just env vars. Acceptance #10's "end to end" includes a live WS round-trip through the proxy.

### D5 — creatorKey is handled as a credential (human decision)
Opaque, generated with `crypto/rand`, stored server-side as private stream metadata, returned only in the `201`. Validation on join uses a constant-time compare. It is never logged, never in listings/history/errors. It is a stopgap for `security` and must not grow into an auth system.

### D6 — Home shows username (human decision)
Home renders each stream's `username` (mono label, per style §5) above the title, in addition to the title. `description` remains received-but-not-shown.

### D7 — Server-stamped roles; ephemeral viewer ids (from PRD, restated as law)
`role ∈ {streamer, viewer}` is stamped by the server at join from the connection's identity; clients never send a role and never infer who the streamer is. Viewer ids are word+alphanumeric, generated per WS connection, nothing stored client-side (reload = new id).

### D9 — Clickable stream list (human decision)
Each stream on Home is a clickable, keyboard-accessible control (visible focus, style law) that navigates to `/stream/{id}`. qc-portal only; no contract change.

### D10 — Creator-only end via creatorKey; memory-only limitation accepted (human decision)
`DELETE /streams/{id}` requires the stream's `creatorKey` as `Authorization: Bearer <creatorKey>` (§6 contract change, folded in). streamer verifies with a constant-time compare: match → `204` + cascade (messages + close connections); existing stream, missing/invalid key → `403`; not found → `404`. qc-portal shows the End control ONLY to the client holding the key in memory and never to viewers or reloaded creators. **Chosen over** persisting the key (rejected: keeps the recorded memory-only rule) and over real ownership via `security` (out of scope now). Accepted consequence: a creator who reloads loses the key and can no longer end the stream — and no one else can — documented as a v0 limitation. The exact header (`Authorization: Bearer`) is confirmed as a small streamer↔qc-portal coordination item; it is forward-compatible with real auth later.

### D11 — Ended → notice then redirect (human decision)
On the terminal room-ended signal (D3 error-then-close), the portal shows a calm "This stream has ended" notice and then redirects the participant to Home (`/`). Applies to viewers and non-triggering creator tabs; the creator who clicked End redirects via the `204`. A transient drop (close without a preceding terminal error) still reconnects — no redirect. Builds directly on qc-portal's hybrid terminal detection.

### D8 — Teammate-owned, recorded as their call (not re-opened here)
Valkey structure for the capped log + cursor pagination (Valkey Streams `XADD MAXLEN ~` / `XRANGE` is a natural fit but streamer decides); the exact WS path (documented in streamer's openspec, e.g. `/streams/{id}/ws`); in-process broadcast hub (single instance — no Valkey pub/sub needed, do not over-build); nginx timeout value; portal breakpoint and camera-placeholder wording.

## Risks / Trade-offs

- **WS through nginx is the sleeper task** → D4 makes it explicit and testable; without it every container is "up" but chat silently fails.
- **History/live seam** → D2 fixes the ordering as contract; the remaining risk is each side implementing its half consistently — covered by tests on both.
- **creatorKey is a bearer secret** → D5 credential hygiene; the design limit (multiple tabs with the same key all become streamer) is accepted per PRD.
- **WS concurrency** → streamer's core risk area (leaked goroutines/subscriptions on client drop, races). Its constitution §5 governs; `-race` on WS code is required by acceptance #11.
- **Contract change breaks a client that omits username** → intended (username is now required); the portal is updated in lockstep and no other client exists.

## Migration Plan

No data migration (Valkey ephemeral). Delivery: streamer (contract change + chat) and qc-portal (username + room/chat client) build in parallel against §6; devops adds env vars + WS proxy config and proves the end-to-end WS round-trip once images build. Feature pending until all three report done with evidence.

## Open Questions

None blocking. Teammate-owned items in D8 get recorded in each teammate's own change when settled.
