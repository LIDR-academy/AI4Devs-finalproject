## Why

`room-chat-v0` adds live chat inside stream rooms. Chat is real-time over a WebSocket served by `streamer`, and the browser must reach that WebSocket **only through the single-origin nginx proxy** shipped in `home-stream-lifecycle-v0` (root decision D4: no CORS, no baked URL). The current proxy config forwards `/streams*` to streamer as plain HTTP — it does **not** perform the WebSocket upgrade, so without this change every container is "up" but live chat silently fails. Streamer also needs three chat tuning knobs from the environment. This change extends the runtime to carry the WS and the knobs.

This is the devops deliverable of the feature, implemented against the frozen root record (`openspec/changes/room-chat-v0/` — design D4 and the `room-chat` spec requirements "WebSocket is served on the single origin" and "Chat knobs are environment-configurable"). It does not reopen those contracts.

## What Changes

- **nginx WebSocket-upgrade support on the single origin** for streamer's WS path (`/streams/{id}/ws`, streamer-owned per D8): forward the `Upgrade` and `Connection` headers, speak **HTTP/1.1** to the upstream, and use a **read timeout tolerant of idle chat** so a long-lived, quiet WebSocket is not dropped. The browser reaches the WS only through the proxy — same origin, no CORS, no base URL in the bundle — consistent with the shipped Topology 2.
- **Three chat env vars supplied to `streamer` in compose**: `CHAT_MAX_MESSAGES=1000000`, `CHAT_PAGE_SIZE=200`, `CHAT_MAX_LENGTH=500` (PRD §5.3, defaults from §4). Supplied verbatim as streamer reads them, via `${VAR:-default}` so the environment runs with documented defaults; also recorded in `.env.example`.
- **Acceptance #10 "end to end" now includes a live WS round-trip through the proxy**: two clients in the same room see each other's messages, proven with command output — not just an HTTP check.
- **No new containers. Valkey unchanged** (ephemeral, no volume) — chat history is streamer's private storage in the existing Valkey.

### Non-goals

- **No changes to any service code or Dockerfile** — devops stays read-only and only consumes streamer's/qc-portal's images. If streamer's WS won't upgrade or a build fails, devops reports evidence to the owner; it does not fix their code.
- **No reopening of frozen contracts**: the HTTP+WS wire contract (§6), D4 (WS on single origin), the WS path ownership (D8, streamer's call), and the env-var names/defaults are settled. This change implements them.
- **No new infrastructure**: no message broker, no Valkey pub/sub, no second Valkey — streamer's broadcast hub is in-process and single-instance (D8); devops adds nothing for it.
- **No production concerns**: TLS, scaling, sticky sessions, WS load-balancing across replicas are out of scope for v0 (single streamer instance).
- **No auth**: `creatorKey` is streamer-side; devops neither sees nor handles it (and must never log it).

## Capabilities

### New Capabilities

<!-- none — this extends the existing compose-runtime capability -->

### Modified Capabilities

- `compose-runtime`: the single-origin runtime gains two behaviors — the reverse proxy correctly upgrades the room WebSocket at `/streams/{id}/ws` so live chat traverses the single origin, and compose supplies streamer the three chat knobs from the environment. These are ADDED requirements on the existing capability; the shipped home-stream-lifecycle runtime behavior is unchanged.

## Impact

- **dev/devops/ (files changed here only)**:
  - `nginx.conf` — add WS-upgrade handling for `/streams/{id}/ws` (Upgrade/Connection headers via an `http_upgrade` map, `proxy_http_version 1.1`, idle-tolerant `proxy_read_timeout`), scoped so the existing HTTP `/streams` history/DELETE behavior is unchanged.
  - `docker-compose.yml` — add `CHAT_MAX_MESSAGES`, `CHAT_PAGE_SIZE`, `CHAT_MAX_LENGTH` to the `streamer` service environment.
  - `.env.example` — document the three new non-secret knobs.
  - `README.md` — note WS traverses the single origin and list the new env vars.
- **Cross-scope dependencies devops CONSUMES (not owned here)**:
  - streamer's WS endpoint at `/streams/{id}/ws` accepting `join`/`message` frames and broadcasting per the §6 WS contract. **Path is streamer-owned (D8) — must be confirmed.**
  - streamer reading `CHAT_MAX_MESSAGES`/`CHAT_PAGE_SIZE`/`CHAT_MAX_LENGTH` from env with these exact names. **Must be confirmed with streamer.**
  - qc-portal opening the WS at the same-origin `/streams/{id}/ws` for the live round-trip proof.
- **Sequencing / risk**: WS-through-nginx is the sleeper task (root risk note) — env vars and proxy config are authorable now, but the acceptance #10 live WS round-trip cannot be proven until streamer's WS server and qc-portal's chat client images build. Verification waits on both; devops does not claim #10 without command output.
- **Coordination**: confirm with streamer the exact WS path and its idle-timeout expectation, and the three env-var names; confirm with qc-portal that the client connects to the same-origin WS path. Keep the team lead informed for the root openspec.
