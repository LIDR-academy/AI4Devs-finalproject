# streamer

The QuickChat **streamer** service: the HTTP + WebSocket API for the live-stream
lifecycle and room chat, backed by **Valkey** as private storage. Streams are
anonymous; the creator is identified by an opaque `creatorKey` returned at
creation (a stopgap until `security` lands). Media is not implemented yet.

Stack: Go, standard library `net/http`, [go-redis](https://github.com/redis/go-redis)
as the Valkey client, [coder/websocket](https://github.com/coder/websocket) for chat.

## HTTP API (wire contract §6)

Served on a single origin behind a reverse proxy, so the service emits **no CORS**
and handles **no OPTIONS**.

| Method & path | Success | Errors |
|---|---|---|
| `GET /streams` | `200` — `[{id,username,title,description}]`; `[]` when none | — |
| `POST /streams` | `201` — `{id,username,title,description,creatorKey}` | `400` on validation failure |
| `DELETE /streams/{id}` | `204` (deletes the room's messages + closes live connections) | `403` bad/missing key; `404` when not live |
| `GET /streams/{id}/messages?before={id}&limit={n}` | `200` — `{messages:[{id,sender,role,text,ts}], nextCursor}` | `404` when room not live |

Validation at the boundary (POST):

- `username` — required, non-empty after trimming, ≤ 200 code points.
- `title` — required, non-empty after trimming, ≤ 200 code points.
- `description` — optional, ≤ 100 code points, defaults to `""`.
- Body capped at 8 KiB; unknown JSON fields ignored.

`creatorKey` is returned **only** in the `201` create response — never in a
listing, history, error, or log. Length is counted in **Unicode code points**
(`utf8.RuneCountInString`), matching the portal.

Ending a stream requires proof of ownership: `DELETE /streams/{id}` must carry
`Authorization: Bearer <creatorKey>`, verified with a constant-time compare —
match → `204` + cascade; existing stream with a missing/invalid key → `403`
(nothing deleted); unknown id → `404`. A creator who loses the key (e.g. by
reloading) can no longer end the stream (accepted v0 limitation).

History (`GET /streams/{id}/messages`): no `before` = latest page; `limit`
defaults to and is capped at `CHAT_PAGE_SIZE`; messages ordered oldest→newest;
`nextCursor` is `null` when older history is exhausted; `ts` is server time,
ISO-8601 UTC.

### WebSocket — room chat

Path: `GET /streams/{id}/ws` (same origin, through the proxy). Frames:

```
client → { "type": "join", "creatorKey"?: string }
server → { "type": "welcome", "sender": string, "role": "streamer" | "viewer" }
client → { "type": "message", "text": string }
server → { "type": "message", "message": { id, sender, role, text, ts } }   // broadcast
server → { "type": "error", "reason": string }                              // to the sender only
```

- `role` is **server-stamped**: a valid `creatorKey` (constant-time compare) →
  `role: "streamer"`, `sender` = the stream username; otherwise a generated
  word+alphanumeric `sender` and `role: "viewer"`. Clients never send a role;
  an invalid key silently becomes a viewer.
- Joining a room that is not live → an `error` frame and close.
- `message` text is validated (non-empty after trim, ≤ `CHAT_MAX_LENGTH` code
  points); invalid → an `error` to the sender only, nothing stored or broadcast.
- Deleting the stream broadcasts a "room ended" error to live connections and
  closes them.
- Message `id` is the Valkey stream entry id — server-authoritative and identical
  in the live broadcast and in history, so clients can de-duplicate by `id`.

### Error body

Every HTTP error (`400`, `404`, `405`, `500`) returns `{ "error": string }`.

### Operational endpoints (outside §6)

- `GET /healthz` — liveness; `200` whenever serving.
- `GET /readyz` — readiness; `200` when Valkey is reachable, else `503`.

## Storage model

Valkey is private to this service and never leaks into responses or errors.

- `streams` — a SET of live stream ids.
- `stream:{id}` — a HASH `{username, title, description, creatorKey}` (creatorKey private).
- `room:{id}:messages` — a Redis **Stream** (ring buffer, exact `MAXLEN` =
  `CHAT_MAX_MESSAGES`, drop-oldest). Each entry id is the message id and the
  pagination cursor. Read with `XREVRANGE`; no `KEYS`/`SCAN`.

`POST` writes the stream keys in one transaction; `DELETE` removes the stream,
its message stream, and closes live connections. No TTL.

## Configuration

All configuration comes from the environment (see `.env.example`). The process
**fails fast** at startup on a missing/invalid `VALKEY_ADDR` or a non-positive
chat knob.

| Variable | Required | Default | Meaning |
|---|---|---|---|
| `VALKEY_ADDR` | yes | — | Valkey `host:port` |
| `VALKEY_PASSWORD` | no | `""` | Valkey password |
| `VALKEY_DB` | no | `0` | Valkey logical database index |
| `STREAMER_ADDR` | no | `:8080` | HTTP listen address |
| `CHAT_MAX_MESSAGES` | no | `1000000` | per-room message cap (drop-oldest) |
| `CHAT_PAGE_SIZE` | no | `200` | history page size / limit cap |
| `CHAT_MAX_LENGTH` | no | `500` | max message length (code points) |

## Run

```sh
# Needs a reachable Valkey (e.g. `docker run -p 6379:6379 valkey/valkey`).
VALKEY_ADDR=localhost:6379 go run ./cmd/streamer
```

Normally run via the project's `docker compose` (Valkey + streamer + portal +
reverse proxy) — see the `devops` scope. The proxy must forward the WebSocket
upgrade for `/streams/{id}/ws` (HTTP/1.1, `Upgrade`/`Connection` headers, an
idle-tolerant read timeout).

### Container healthcheck

The image is shell-less (distroless static). The binary doubles as its own
healthcheck: `streamer healthcheck` probes `/readyz` and exits `0`/`1`.

## Test

```sh
# Unit tests (hermetic; WebSocket/hub code is race-tested).
go test -race ./...

# Integration tests against a real Valkey (excluded from the default run).
VALKEY_ADDR=localhost:6379 go test -race -tags integration ./...

# Formatting, vet, lint.
gofmt -l . && go vet ./... && golangci-lint run
```

## Layout

```
cmd/streamer/      entrypoint: config, wiring, server lifecycle, healthcheck subcommand
internal/config/   environment configuration (fail-fast)
internal/stream/   domain: Stream, validation, id/creatorKey, Service, Store interface
internal/chat/     domain: Message, validation, viewer identity, history, MessageStore
internal/valkey/   Valkey-backed Store + MessageStore
internal/hub/      in-process broadcast hub + WebSocket connection lifecycle
internal/httpapi/  thin HTTP handlers + error shape + WS routing
```
