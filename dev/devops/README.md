# QuickChat — Local Environment (devops)

The runtime for QuickChat: a `docker compose` stack that brings the whole slice up
on a **single browser-facing origin**. This scope owns the compose file, the reverse
proxy config, and environment configuration. It is **read-only on all service code** —
it consumes each service's Dockerfile without modifying it.

## What runs

| Service    | Image / build            | Exposed?        | Purpose                                             |
|------------|--------------------------|-----------------|-----------------------------------------------------|
| `proxy`    | official `nginx` (pinned)| **yes** — only one | Single origin; routes traffic to streamer / portal |
| `streamer` | built from `../streamer` | no (internal)   | HTTP API, uses Valkey as private storage            |
| `portal`   | built from `../qc-portal`| no (internal)   | Static frontend (serves its own SPA fallback)       |
| `valkey`   | official `valkey/valkey` (pinned) | no (internal) | Ephemeral key/value store for streamer          |

Only the proxy publishes a host port. The browser reaches `streamer` **only** through
the proxy, so streamer needs no CORS and the portal bakes in no API base URL.

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
