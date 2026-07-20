## Context

devops implementation design for `room-chat-v0`, building on the shipped `home-stream-lifecycle-v0` runtime (single-origin nginx proxy, streamer + Valkey, static portal). The cross-scope decisions are frozen in the root record: D4 (WS traverses the single origin; devops adds the nginx upgrade config), D8 (WS path is streamer's call, e.g. `/streams/{id}/ws`; nginx timeout value is devops's call), and the `compose-runtime` spec additions. This document records the devops-owned *how*; it does not reopen those.

Current runtime state (from the archived `compose-runtime` baseline): `nginx.conf` routes `location = /streams` and `location /streams/` to streamer as plain HTTP/1.1 (no upgrade), everything else to portal; streamer already receives `VALKEY_ADDR`/`VALKEY_PASSWORD`/`VALKEY_DB`/`STREAMER_ADDR`. This change adds WS-upgrade handling and three chat env vars. Nothing else moves.

Hard constraint: devops is READ-ONLY on all service code. This design consumes streamer's WS endpoint and env-var contract; it never edits them.

## Goals / Non-Goals

**Goals:**
- The room WebSocket works end to end through the single origin under `docker compose up`.
- The WS-upgrade config is scoped so the existing HTTP `/streams` behavior is untouched.
- Streamer gets the three chat knobs from the environment with documented defaults; no new infrastructure.

**Non-Goals:**
- Any change to service code/Dockerfiles (read-only).
- Reopening frozen contracts (§6 wire, D4, WS path/D8, env-var names).
- New infrastructure for broadcast (no Valkey pub/sub, no broker — streamer's hub is in-process, single-instance per D8).
- Production WS concerns: TLS, sticky sessions, multi-replica WS balancing (single streamer instance in v0).

## Decisions

### DD1 — Dedicated nginx location for the WS path, HTTP path unchanged
Add a **dedicated location** for the WebSocket path (streamer-owned, expected `/streams/{id}/ws`) rather than folding upgrade directives into the general `location /streams/`. A regex location such as `location ~ ^/streams/[^/]+/ws$` matches the WS endpoint precisely and takes precedence over the prefix `location /streams/`, so:
- WS requests get the upgrade treatment (below).
- HTTP `/streams`, `/streams/{id}` (DELETE), and `/streams/{id}/messages` (history) keep hitting the existing plain-HTTP location, unchanged.

**Chosen over** adding upgrade headers to the shared `location /streams/`: that would also apply a long idle read timeout to the history/DELETE endpoints and blur which path is the long-lived socket. Scoping to a dedicated location keeps each concern boring and isolated. Exact regex/path is finalized once streamer confirms the WS path (D8); if streamer picks a different path, only this location's pattern changes.

### DD2 — Standard nginx WebSocket upgrade directives
In the WS location:
- `proxy_pass http://streamer;` (same upstream as HTTP — the existing `upstream streamer { server streamer:8080; }`).
- `proxy_http_version 1.1;` — HTTP/1.1 is required for upgrade.
- `proxy_set_header Upgrade $http_upgrade;` and `proxy_set_header Connection $connection_upgrade;`, where `$connection_upgrade` comes from the canonical map:
  `map $http_upgrade $connection_upgrade { default upgrade; '' close; }`
  (defined at http scope). This is the ubiquitous, documented nginx WS pattern — no clever tooling.
- Preserve the existing `Host` / `X-Forwarded-*` headers as on the other locations.

### DD3 — Idle-tolerant read timeout (devops's call, D8)
Set `proxy_read_timeout` (and `proxy_send_timeout`) on the WS location to a value comfortably longer than expected chat idle gaps — default nginx `proxy_read_timeout` is 60s, which would drop a quiet room. Pick a boring, generous value (e.g. **3600s**) scoped to the WS location only. This is a devops decision per D8; confirm streamer's idle-timeout expectation and whether streamer sends WS pings/keepalive (if streamer pings periodically, the timeout only needs to exceed the ping interval). The value lives in one place and is easy to tune.

### DD4 — Chat env vars, defaults via `${VAR:-default}`
Add to the `streamer` service `environment:` — `CHAT_MAX_MESSAGES: ${CHAT_MAX_MESSAGES:-1000000}`, `CHAT_PAGE_SIZE: ${CHAT_PAGE_SIZE:-200}`, `CHAT_MAX_LENGTH: ${CHAT_MAX_LENGTH:-500}` — matching the existing pattern so the environment runs with documented defaults and no `.env` present, and any knob is overridable via `.env`. Document all three in `.env.example`. Names are supplied verbatim as streamer reads them (to be confirmed). No new container, no volume; Valkey is untouched.

### DD5 — What devops does NOT own (consumed contracts)
- streamer's WS endpoint accepting `join`/`message` and broadcasting per §6 — owned by streamer; devops only routes/upgrades to it.
- streamer reading the three chat env vars by these names — owned by streamer.
- qc-portal connecting to the same-origin WS path — owned by qc-portal.
All consumed via runtime; if any is wrong, devops reports evidence upstream and does not patch it.

## Risks / Trade-offs

- **WS-through-nginx is the sleeper task** (root risk) → made explicit and testable here (DD1–DD3); the live round-trip is an acceptance gate, so "containers up" cannot masquerade as "chat works." Mitigation: verify with a real two-client WS exchange through the proxy, not just an HTTP check.
- **WS path is streamer-owned and not yet final** → the dedicated location's pattern depends on it. Mitigation: confirm the exact path with streamer before finalizing; the change is one directive.
- **Idle timeout too short drops quiet rooms; too long leaks half-dead sockets** → pick a generous but bounded value (DD3) and align with streamer's keepalive/ping behavior; streamer owns socket lifecycle (its constitution §5), devops owns only the proxy timeout.
- **Upgrade directives accidentally applied to HTTP endpoints** → avoided by DD1's dedicated location; verify HTTP history/DELETE still behave post-change.
- **Sequencing** → env vars + proxy config are authorable now, but the acceptance #10 live WS round-trip needs streamer's WS server and qc-portal's client images. Mitigation: author now, validate `docker compose config` + a Valkey/streamer bring-up, and prove the WS round-trip once both images land — never claim #10 without command output.

## Migration Plan

No data migration (Valkey ephemeral, unchanged). Delivery: streamer (WS server + chat + contract change) and qc-portal (username + room/chat client) build in parallel against §6; devops adds the WS-upgrade location + three env vars, then proves the end-to-end WS round-trip through the proxy once both images build. Feature pending until all three report done with evidence.

## Open Questions

- Exact WS path (streamer-owned, D8 — expected `/streams/{id}/ws`) and streamer's idle-timeout / keepalive expectation for DD3. Confirm with streamer; neither blocks authoring the config now.
- Confirm the three chat env-var names are read verbatim by streamer.
- None reopen a frozen contract; all settle during coordination / apply.
