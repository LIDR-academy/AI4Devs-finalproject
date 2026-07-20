# streamer

The QuickChat **streamer** service: the HTTP API for the live-stream lifecycle —
list live streams, start a stream, end a stream — backed by **Valkey** as private
storage. This is the `home-stream-lifecycle-v0` slice (anonymous, ephemeral, no
auth, no media yet).

Stack: Go, standard library `net/http`, [go-redis](https://github.com/redis/go-redis)
as the Valkey client.

## HTTP API (wire contract §6)

Served on a single origin behind a reverse proxy, so the service emits **no CORS**
and handles **no OPTIONS**.

| Method & path        | Success | Errors | Notes |
|----------------------|---------|--------|-------|
| `GET /streams`       | `200` — JSON array `[{id,title,description}]`; `[]` when none | — | order unspecified |
| `POST /streams`      | `201` — `{id,title,description}` | `400` on validation failure | body `{title, description?}` |
| `DELETE /streams/{id}` | `204` | `404` when not live | anonymous — anyone may end |

Validation at the boundary:

- `title` — required, non-empty after trimming, ≤ 200 Unicode code points.
- `description` — optional, ≤ 100 Unicode code points, defaults to `""`.
- Request body capped at 8 KiB. Unknown JSON fields are ignored.

Length is counted in **Unicode code points** (`utf8.RuneCountInString`), matching
the portal's client-side counting so both sides accept/reject identically.

### Error body

Every error (`400`, `404`, `405`, `500`) returns the same shape:

```json
{ "error": "human-readable message" }
```

Consumers depend only on the HTTP status and may display the message.

### Operational endpoints (outside §6)

- `GET /healthz` — liveness; `200` whenever the process is serving.
- `GET /readyz` — readiness; `200` when Valkey is reachable, else `503`.

## Storage model

Valkey is private to this service and never leaks into responses or errors.

- `streams` — a SET of live stream ids.
- `stream:{id}` — a HASH with fields `title` and `description`.

A stream is live **iff** its id is in the `streams` set. `POST` writes both keys in
one transaction; `DELETE` removes both in one transaction. No `KEYS`/`SCAN`, no TTL.

## Configuration

All configuration comes from the environment (see `.env.example`). The process
**fails fast** at startup if `VALKEY_ADDR` is missing or malformed.

| Variable          | Required | Default   | Meaning |
|-------------------|----------|-----------|---------|
| `VALKEY_ADDR`     | yes      | —         | Valkey `host:port` |
| `VALKEY_PASSWORD` | no       | `""`      | Valkey password (empty = no auth) |
| `VALKEY_DB`       | no       | `0`       | Valkey logical database index |
| `STREAMER_ADDR`   | no       | `:8080`   | HTTP listen address |

## Run

```sh
# Needs a reachable Valkey (e.g. `docker run -p 6379:6379 valkey/valkey`).
VALKEY_ADDR=localhost:6379 go run ./cmd/streamer
```

The service is normally run via the project's `docker compose` (Valkey + streamer +
portal + reverse proxy) — see the `devops` scope.

### Container healthcheck

The image is shell-less (distroless static). The binary doubles as its own
healthcheck: `streamer healthcheck` probes `/readyz` and exits `0`/`1`, which the
Dockerfile's `HEALTHCHECK` uses.

## Test

```sh
# Unit tests (hermetic — no external services), race detector on.
go test -race ./...

# Integration tests against a real Valkey (excluded from the default run).
VALKEY_ADDR=localhost:6379 go test -race -tags integration ./...

# Formatting, vet, lint.
gofmt -l .
go vet ./...
golangci-lint run
```

## Layout

```
cmd/streamer/      entrypoint: config, wiring, server lifecycle, healthcheck subcommand
internal/config/   environment configuration (fail-fast)
internal/stream/   domain: Stream, validation, id generation, Service, Store interface
internal/valkey/   Valkey-backed Store implementation
internal/httpapi/  thin HTTP handlers + error shape
```
