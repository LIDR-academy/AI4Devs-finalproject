# QuickChat — Local Environment (devops)

The runtime for QuickChat: a `docker compose` stack. The **application** plane is served
on a **single browser-facing origin** (nginx). The **media** plane (WebRTC) is a
**second origin** — see "Media is a second origin" below. This scope owns the compose
file, the reverse proxy config, the LiveKit dev config, and environment configuration.
It is **read-only on all service code** — it consumes each service's Dockerfile without
modifying it.

## What runs

| Service    | Image / build            | Exposed?        | Purpose                                             |
|------------|--------------------------|-----------------|-----------------------------------------------------|
| `proxy`    | official `nginx` (pinned)| **yes** — app origin | Single origin; routes traffic to streamer / portal |
| `streamer` | built from `../streamer` | no (internal)   | HTTP API, uses Valkey as private storage; mints LiveKit tokens |
| `portal`   | built from `../qc-portal`| no (internal)   | Static frontend (serves its own SPA fallback)       |
| `valkey`   | official `valkey/valkey` (pinned) | no (internal) | Ephemeral key/value store for streamer          |
| `livekit`  | official `livekit/livekit-server` (pinned) | **yes** — media origin | Dev-mode SFU for WebRTC video/audio (second origin) |
| `coturn`   | official `coturn/coturn` (pinned) | **yes** — TURN `3478` | Dev TURN server; relays browser media over TCP (Docker-Desktop reliability) |
| `security` | built from `../security` | no (internal, via proxy `/auth`) | Magic-link auth (SuperTokens Go SDK → managed cloud); exposes JWKS |
| `users`    | built from `../users`    | no (internal)   | User persistence (Go + MongoDB); reached only by `security`          |
| `mongo`    | official `mongo` (pinned) | no (internal)  | User store for `users`; DEV-ONLY creds, **ephemeral** (no volume)   |

The proxy publishes the app origin; LiveKit publishes the media origin. Every other
service is internal-only. The browser reaches `streamer` (`/streams*`) and `security`
(`/auth*`) only through the proxy (no CORS, no baked API URL); it reaches LiveKit
directly on LiveKit's own ports. `users` and `mongo` are **never** reachable from the
host or the browser.

## Auth / identity (security-v0)

Magic-link email auth via **SuperTokens managed cloud** (free tier), fronted by the
`security` service. `users` persists accounts in MongoDB. No SuperTokens core and no
mail container run locally — the managed cloud hosts the core + storage and sends the
magic-link email.

- **Browser `/auth/*`** is routed through the single origin to `security` (same as
  `/streams*` → streamer). No CORS, no baked URL.
- **`streamer` verifies JWTs locally** against security's JWKS (`SECURITY_JWKS_URL`,
  fetched at startup + refreshed with retry) — no per-request call to security.
- **`users` + `mongo` are internal-only** and ephemeral (dev users wiped on
  `docker compose down`).
- **Required human-supplied secrets** (SuperTokens managed-cloud, free tier):
  set the REAL values ONLY in the git-ignored `dev/devops/.env` — NEVER commit them:
  ```
  SUPERTOKENS_CONNECTION_URI=...   # from your SuperTokens dashboard
  SUPERTOKENS_API_KEY=...          # from your SuperTokens dashboard
  ```
  `.env.example` carries empty placeholders only. If unset, the `security` service
  **fails fast at startup** with a clear log (routine compose commands still work).
  They must never appear in git, a log, or a response (AC7).

## Media is a second origin (stream-media-v0)

WebRTC media **cannot** traverse the nginx HTTP reverse proxy, so LiveKit is a second
published origin (root decision D3). The app itself stays single-origin behind nginx;
only media is separate.

- **Ports** (published by the `livekit` service): `7880/tcp` (WebSocket signaling +
  streamer's HTTP/Twirp server API), `7881/tcp` (ICE/TCP fallback), `7882/udp` (a
  **single UDP mux** port carrying all media).
- **Why a single UDP port, not a range**: publishing LiveKit's default `50000-60000`
  UDP range on Docker Desktop is impractically slow/unreliable. LiveKit's UDP mux
  carries all participants over one port (`rtc.udp_port` in `livekit.yaml`); TCP `7881`
  is the fallback if a network blocks UDP.
- **Host-networking caveat**: `network_mode: host` would avoid port mapping but is
  **Linux-only** (it does not work on Docker Desktop for macOS/Windows). The supported
  cross-platform local path is **published ports** plus the **dev TURN relay** below.
  On Docker Desktop macOS the direct UDP/TCP candidates are unreliable for real browsers,
  so media rides the TURN relay (see "Dev TURN"); if media fails on some platform,
  investigate the LiveKit/coturn config first (this is the known fiddly zone).
- **URLs**: the browser connects to LiveKit at `LIVEKIT_PUBLIC_URL` (`ws://localhost:7880`
  in dev), which streamer returns in the media-token response — the portal bakes nothing.
  streamer talks to LiveKit server-to-server at `LIVEKIT_URL` (`http://livekit:7880`).
- **Webhooks**: LiveKit POSTs participant events to `http://streamer:8080/livekit/webhook`
  (internal, signed with the dev API key) so streamer can auto-reap abandoned rooms.
- **Dev TURN for reliable browser media** (`coturn` service + `livekit.yaml` `turn_servers`):
  on Docker Desktop macOS the DIRECT WebRTC path is unreliable for real browsers — they hide
  their host ICE candidates behind mDNS `.local` names LiveKit-in-container can't resolve, and
  UDP only sometimes completes via the Docker gateway (works in one browser, "ICE failed" in
  another). The `coturn` dev TURN server relays media over a single reliable **TCP** connection,
  bypassing the problem. LiveKit advertises coturn to browsers (via `rtc.turn_servers`) so they
  get a TURN **relay** candidate and fall back to it when the direct path fails. Only coturn's
  control port `3478` is published (browsers reach it at `localhost:3478`); its relay range
  `50000-50100` stays internal (LiveKit reaches it on the compose network). This is the
  human-approved fix (root design D10) for AC1's "works on localhost" on Mac.
  - **How the relay routes** (`livekit.yaml`): LiveKit does **not** set `node_ip: 127.0.0.1`
    — it advertises its own Docker-internal IP. That's required so `coturn` (a separate
    container) can deliver relayed media **to** LiveKit; `127.0.0.1` would be coturn's own
    loopback. coturn's relay address (its container IP) is likewise only used by LiveKit,
    which reaches it internally. The host browser uses only coturn's published control port
    `3478`, so the relay range need not be host-published.
- **Supported browsers for media** (verified, dev-mode via TURN): **Chrome, Brave, Safari**
  (Chromium + WebKit engines). Audio/video publish + subscribe work end to end on these.
- **Known v0 limitation — Firefox media**: Firefox does **not** connect media in this dev-mode
  setup (a Gecko ICE/TURN quirk with the containerized dev TURN on Docker Desktop). It is a
  **documented, accepted v0 limitation** (root design D10a) — not chased further for v0. Firefox
  media is expected to work with the deferred production hardening (real TURN + TLS / host
  networking). Chat, streams, and the rest of the app work in Firefox; only media publish/subscribe
  is affected.
- **DEV ONLY**: LiveKit dev key/secret (`devkey`/`secret`), TURN static creds (`devuser`/`devpass`
  in `coturn.conf`), no TLS, no Redis. Full production hardening (production TURN + TLS, real
  keys, host networking) remains a separately deferred future feature.

### Routing (single origin)

- `GET/POST /streams`, `DELETE /streams/{id}`, `GET /streams/{id}/messages` → `streamer` (paths forwarded verbatim, HTTP).
- `GET /streams/{id}/ws` → `streamer` as a **WebSocket** (room chat): the proxy performs the HTTP/1.1 Upgrade and keeps idle sockets open, so live chat traverses the single origin (no CORS, no baked URL).
- Everything else → `portal` (which serves `index.html` as the SPA fallback).

## Requirements

- Docker with Compose v2 (`docker compose`, not the legacy `docker-compose`).

## Configure

Configuration comes from the environment. Copy the documented, non-secret defaults:

```bash
cp .env.example .env
```

`.env` is git-ignored. There are **no secrets** at this stage: Valkey runs anonymous
and ephemeral. Variables:

| Variable          | Default                   | Meaning                                             |
|-------------------|---------------------------|-----------------------------------------------------|
| `VALKEY_IMAGE`    | `valkey/valkey:8.1-alpine`| Pinned Valkey image                                 |
| `NGINX_IMAGE`     | `nginx:1.27-alpine`       | Pinned reverse-proxy image                          |
| `PROXY_PORT`      | `8080`                    | Host port for the single origin (open this)         |
| `PORTAL_PORT`     | `3000`                    | Portal's internal listen port                       |
| `VALKEY_ADDR`     | `valkey:6379`             | Valkey address passed to streamer                   |
| `VALKEY_PASSWORD` | *(empty)*                 | Valkey password (none — anonymous)                  |
| `VALKEY_DB`       | `0`                       | Valkey logical DB for streamer                      |
| `STREAMER_ADDR`   | `:8080`                   | Streamer's internal listen address                  |
| `CHAT_MAX_MESSAGES` | `1000000`               | Per-room chat ring-buffer cap (drop-oldest)         |
| `CHAT_PAGE_SIZE`  | `200`                     | Chat history page size / cap                        |
| `CHAT_MAX_LENGTH` | `500`                     | Max characters per chat message (server-enforced)   |
| `LIVEKIT_IMAGE`   | `livekit/livekit-server:v1.13.4` | Pinned LiveKit image                       |
| `LIVEKIT_WS_PORT` / `LIVEKIT_TCP_PORT` / `LIVEKIT_UDP_PORT` | `7880` / `7881` / `7882` | Published LiveKit ports (WS / TCP fallback / UDP mux) |
| `LIVEKIT_API_KEY` / `LIVEKIT_API_SECRET` | `devkey` / `secret` | **DEV-ONLY** LiveKit credentials (read by streamer) |
| `LIVEKIT_URL`     | `http://livekit:7880`     | Server-to-server LiveKit API (streamer → LiveKit)   |
| `LIVEKIT_PUBLIC_URL` | `ws://localhost:7880`  | Browser-facing LiveKit URL (returned in media tokens) |

## Run

```bash
# Start everything (builds streamer + portal images, pulls valkey + nginx):
docker compose up

# In the background:
docker compose up -d

# Then open the app:
#   http://localhost:8080     (or your PROXY_PORT)

# Stop and remove everything (Valkey is ephemeral — no data persists):
docker compose down
```

Startup is ordered by health: `streamer` starts only after Valkey passes
`valkey-cli ping`, and `streamer` is considered ready only when its own
`/readyz` returns `200` (which happens once Valkey is reachable). The `portal`
reports healthy once its `/healthz` returns `200`. The proxy comes up only after
both `streamer` and `portal` are healthy — so the single origin is exposed only
once its upstreams can actually serve.

## Validate the config without running

```bash
docker compose config      # renders and validates the merged compose file
```

## Notes

- **Images are pinned** (never `latest`) for reproducibility.
- **Ephemeral by design**: Valkey has no volume; a `down`/`up` starts empty.
- The `streamer` and `qc-portal` images build from their own Dockerfiles. If a build
  fails or a health check does not pass, that is reported to the owning teammate with
  evidence — devops does not modify service code.
