# streamer

The QuickChat **streamer** service: the HTTP + WebSocket API for the live-stream
lifecycle and room chat, backed by **Valkey** as private storage. Streams are
owned by an authenticated user: streamer verifies `security`-issued **Bearer
access tokens** locally against a cached JWKS (stateless, no per-request call to
`security`) and derives ownership from the `userId` claim. Creating a stream and
chatting require auth; browsing the list, watching, and reading chat are public.

Stack: Go, standard library `net/http`, [go-redis](https://github.com/redis/go-redis)
as the Valkey client, [coder/websocket](https://github.com/coder/websocket) for chat,
[lestrrat-go/jwx](https://github.com/lestrrat-go/jwx) for JWKS-cached JWT verification.

## Authentication

streamer is a **stateless JWT verifier**. It validates `Authorization: Bearer
<access token>` against `security`'s JWKS (`SECURITY_JWKS_URL`, RS256), fetched
once at startup and refreshed in the background — **never** a per-request call to
`security`. SuperTokens rotates signing keys, so the key is matched by `kid`
against the auto-refreshing key set (no pinned key). Identity flows only from two
**top-level** claims: `userId` (ownership) and `username` (display). Absent,
malformed, expired, or wrong-signature tokens are rejected as unauthenticated.
streamer never sees any SuperTokens secret — only the public JWKS.

## HTTP API (wire contract §6)

Served on a single origin behind a reverse proxy, so the service emits **no CORS**
and handles **no OPTIONS**.

| Method & path | Success | Errors |
|---|---|---|
| `GET /streams` | `200` — `[{id,username,title,description}]`; `[]` when none | — (public) |
| `POST /streams` | `201` — `{id,username,title,description}` | `401` no/invalid token; `400` validation; `409` caller already owns an active stream |
| `DELETE /streams/{id}` | `204` (deletes messages + LiveKit room + closes live connections) | `401` no/invalid token; `403` caller is not the owner; `404` when not live |
| `GET /streams/{id}/messages?before={id}&limit={n}` | `200` — `{messages:[{id,sender,role,text,ts}], nextCursor}` | `404` when room not live |
| `POST /streams/{id}/media-token` | `200` — `{token,url,identity,role}` | `404` when room not live |
| `POST /livekit/webhook` | `200` (signature-verified; server-to-server) | `401` on bad/missing signature |

`POST /streams` and `DELETE /streams/{id}` **require** `Authorization: Bearer
<access token>`. `GET` (list/history) and `media-token` are public/optional-auth.

Validation at the boundary (`POST /streams`, auth required):

- Body is `{ "title", "description"? }` — **no `username`** (it comes from the
  `username` claim, trusted) and **no `creatorKey`** (retired).
- `title` — required, non-empty after trimming, ≤ 200 code points.
- `description` — optional, ≤ 100 code points, defaults to `""`.
- Body capped at 8 KiB; unknown JSON fields ignored.
- Owner is the `userId` claim. A user may own **one** active stream at a time; a
  second `POST` while one is live → `409` and creates nothing (atomic `SETNX` on
  the per-user slot). Length is counted in **Unicode code points**
  (`utf8.RuneCountInString`), matching the portal.

The `201` response carries **no `creatorKey`** (retired). `username` is the
owner's account username from the claim.

Ending a stream is **auth owner-only**: `DELETE /streams/{id}` requires a valid
token whose `userId` equals the stream owner → `204` + cascade (messages + Valkey
stream + live connections closed + LiveKit room). No token → `401`; a token that
is not the owner → `403`; unknown id → `404`. LiveKit unreachable still returns
`204` (the Valkey delete succeeds; the LiveKit failure is logged). **The old
keyless `creatorKey` escape hatch is retired** — abandoned streams are cleaned up
by the reaper (below) and by sign-out, not by a keyless delete.

## Media (LiveKit)

streamer is the **LiveKit token authority**. `POST /streams/{id}/media-token`
has an **empty body** and **optional** auth (`Authorization: Bearer` if signed in);
it returns `{token, url, identity, role}`. The room must be live, else `404`:

- Owner (valid token, `userId` = owner) → `role: "streamer"`, `identity` =
  account username, token grants **publish + subscribe**.
- Signed-in non-owner → `role: "viewer"`, `identity` = account username, token
  grants **subscribe only**.
- Anonymous (no/invalid token) → `role: "viewer"`, generated `identity`, token
  grants **subscribe only** — not an error. Publish permission is enforced by
  LiveKit via the grant, never by the client.
- `token` and `url` are opaque; `url` is the browser-facing LiveKit URL
  (`LIVEKIT_PUBLIC_URL`). The API secret and the server-side `LIVEKIT_URL` never
  cross this boundary. Token TTL: **1 hour**.

**On stream end**, streamer deletes the LiveKit room via the server API
(participants disconnect); a LiveKit outage still lets the Valkey delete succeed
(logged).

**Auto-reap**: streamer receives signed LiveKit webhooks at `POST /livekit/webhook`
(server-to-server; signature-verified, spoofed requests → `401`). When the
publisher leaves and doesn't return within the **departure grace (30s)**, or a room
never gets a publisher within the **creation grace (2m)**, streamer ends the room
(Valkey stream + messages + LiveKit room) and **frees the owner's one-stream
slot**, firing the room-ended broadcast so viewers redirect Home. A transient blip
within grace does not reap. Together with owner-only `DELETE`, this replaces the
retired keyless escape hatch: an owner who abandons a stream is never locked out.

History (`GET /streams/{id}/messages`): no `before` = latest page; `limit`
defaults to and is capped at `CHAT_PAGE_SIZE`; messages ordered oldest→newest;
`nextCursor` is `null` when older history is exhausted; `ts` is server time,
ISO-8601 UTC.

### WebSocket — room chat

Path: `GET /streams/{id}/ws` (same origin, through the proxy). Frames:

```
client → { "type": "join", "token"?: string }
server → { "type": "welcome", "sender": string, "role": "streamer" | "viewer" }
client → { "type": "message", "text": string }
server → { "type": "message", "message": { id, sender, role, text, ts } }   // broadcast
server → { "type": "error", "reason": string }                              // to the sender only
```

- `join` carries an **optional access token** (not `creatorKey`). A valid token →
  `sender` = the account username, `role: "streamer"` if `userId` = owner else
  `role: "viewer"`, and the connection **may chat**. No/invalid token → a
  read-only viewer with a generated word+alphanumeric `sender` (silent downgrade,
  not an error). Clients never send a role; role is **server-stamped**.
- A `message` from a **read-only** (no/invalid token) connection → `error {
  reason: "auth_required" }`; nothing is stored or broadcast. This reason is
  **non-terminal** — the connection stays open (a client can join anonymously to
  watch, then send a token-backed join to chat). Token is verified once at join;
  mid-connection expiry is not enforced (v0).
- Joining a room that is not live → an `error` frame and close.
- `message` text is validated (non-empty after trim, ≤ `CHAT_MAX_LENGTH` code
  points); invalid → an `error` to the sender only, nothing stored or broadcast.
- A broadcast reaches **every** connection in the room, including read-only viewers.
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
- `stream:{id}` — a HASH `{userid, username, title, description}`. `userid` is the
  owner (`userId` claim) and is **private** — never returned in a listing.
- `user:{userId}:stream` — a STRING = the user's single active stream id; the
  one-stream-per-user slot, claimed atomically with `SETNX` at create.
- `room:{id}:messages` — a Redis **Stream** (ring buffer, exact `MAXLEN` =
  `CHAT_MAX_MESSAGES`, drop-oldest). Each entry id is the message id and the
  pagination cursor. Read with `XREVRANGE`; no `KEYS`/`SCAN`.

`POST` claims the per-user slot (`SETNX`) then writes the stream keys in one
transaction, rolling back the slot if the write fails; `DELETE`/reap removes the
stream, its message stream, and **frees the owner's slot** in one transaction, and
closes live connections. No TTL.

## Configuration

All configuration comes from the environment (see `.env.example`). The process
**fails fast** at startup on a missing/invalid `VALKEY_ADDR`, a missing
`SECURITY_JWKS_URL`, or a non-positive chat knob.

| Variable | Required | Default | Meaning |
|---|---|---|---|
| `VALKEY_ADDR` | yes | — | Valkey `host:port` |
| `SECURITY_JWKS_URL` | yes | — | `security`'s JWKS endpoint for local token verification (e.g. `http://security:8080/auth/jwt/jwks.json`) |
| `VALKEY_PASSWORD` | no | `""` | Valkey password |
| `VALKEY_DB` | no | `0` | Valkey logical database index |
| `STREAMER_ADDR` | no | `:8080` | HTTP listen address |
| `CHAT_MAX_MESSAGES` | no | `1000000` | per-room message cap (drop-oldest) |
| `CHAT_PAGE_SIZE` | no | `200` | history page size / limit cap |
| `CHAT_MAX_LENGTH` | no | `500` | max message length (code points) |
| `LIVEKIT_API_KEY` | yes | — | LiveKit API key |
| `LIVEKIT_API_SECRET` | yes | — | LiveKit API secret (never logged/returned) |
| `LIVEKIT_URL` | yes | — | server-to-server LiveKit API URL (e.g. `http://livekit:7880`) |
| `LIVEKIT_PUBLIC_URL` | yes | — | browser-facing LiveKit URL (returned in tokens) |

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
internal/auth/     stateless JWT verification against a background-refreshed JWKS (confines jwx)
internal/stream/   domain: Stream, validation, ownership (userId), one-per-user slot, Service, Store interface
internal/chat/     domain: Message, validation, viewer identity, history, MessageStore
internal/valkey/   Valkey-backed Store + MessageStore
internal/hub/      in-process broadcast hub + WebSocket connection lifecycle
internal/media/    token grants, the shared room-end cascade, the abandoned-room reaper
internal/livekit/  LiveKit adapter (token signing, room control, webhook verify) — confines the SDK
internal/httpapi/  thin HTTP handlers + error shape + WS routing
```
