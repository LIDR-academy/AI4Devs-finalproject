## 1. Config: chat knobs

- [x] 1.1 Extend `internal/config` with `ChatMaxMessages` (default 1000000), `ChatPageSize` (default 200), `ChatMaxLength` (default 500), parsed as ints; non-integer or non-positive fails fast at startup.
- [x] 1.2 Table-driven tests: defaults applied, all set, non-integer rejected, non-positive rejected.

## 2. Contract change: username + creatorKey (internal/stream)

- [x] 2.1 Add `Username` to `Stream`; validate username (trim, non-empty, ≤ 200 code points) alongside title; keep all prior v0 rules.
- [x] 2.2 Generate `creatorKey` at `Create` (32 bytes crypto/rand, base64 RawURLEncoding); return it once from `Create`; never expose it elsewhere.
- [x] 2.3 Implement `VerifyCreator(ctx, id, key) -> (role, sender)` using `crypto/subtle.ConstantTimeCompare`; missing room → ErrNotFound; non-match → viewer.
- [x] 2.4 Extend `End` to cascade-delete the room's messages via the message store.
- [x] 2.5 Unit tests (fake stores): username validation happy/error, creatorKey returned once and absent from List, VerifyCreator match/non-match/missing-room, delete cascades.

## 3. Chat domain (internal/chat)

- [x] 3.1 Define `Message {id, sender, role, text, ts}`, the `MessageStore` interface (`Append`, `History`, `DeleteRoom`), and a `Service`.
- [x] 3.2 Implement message validation (trim, non-empty, ≤ `CHAT_MAX_LENGTH` code points) and `ts` stamping (ISO-8601 UTC via an injected clock for deterministic tests).
- [x] 3.3 Implement history orchestration: default/cap `limit` to `CHAT_PAGE_SIZE`, oldest→newest ordering, `nextCursor` semantics.
- [x] 3.4 Unit tests with a fake `MessageStore`: valid append, empty/over-long rejected, limit capping, ordering, nextCursor null at exhaustion, boundary at CHAT_MAX_LENGTH code points with multi-byte runes.

## 4. Valkey message store + contract-field storage (internal/valkey)

- [x] 4.1 Store `username` and a private `creatorKey` in the `stream:{id}` hash; ensure `List` never reads creatorKey into any response.
- [x] 4.2 Implement `MessageStore` on a Redis Stream `room:{id}:messages`: `Append` via `XADD MAXLEN <cap> *` returning the entry id as the message id; `History` via `XREVRANGE` (latest and `(before` exclusive) reversed to oldest→newest; `DeleteRoom` via `DEL`. Bounded op timeouts; no `KEYS`/`SCAN`.
- [x] 4.3 Integration tests (build-tagged `integration`, real Valkey): append/list/paginate, exact-cap drop-oldest with a lowered cap, delete removes the stream key, cursor exclusivity.

## 5. Broadcast hub + connection lifecycle (internal/hub)

- [x] 5.1 Implement `Hub` (mutex-guarded roomID → client set): `Register`, `Unregister`, `Broadcast` (non-blocking send; full buffer ⇒ disconnect that client), `CloseRoom` (cancel all clients + drop room).
- [x] 5.2 Implement `Client` (WS conn behind a small interface, per-connection ctx+cancel, buffered send chan, stamped identity) and the read/write pumps: both select on `ctx.Done()`, single writer owns the socket, single `cancel()` stop path; bounded read size.
- [x] 5.3 Hub tests with fake clients (channels, no real WS): broadcast reaches all room members; unregister stops delivery; CloseRoom cancels all; full-buffer client is disconnected not blocking; `-race`.
- [x] 5.4 Lifecycle test proving no leak: drive a connection to drop and assert both pumps exit (handler `wg.Wait()` returns) and the hub room is emptied; `-race`.

## 6. HTTP + WS wiring (internal/httpapi, cmd/streamer)

- [x] 6.1 Update `POST /streams` (accept username, return creatorKey) and `GET /streams` (include username) per the MODIFIED contract; preserve all v0 behavior and error shape.
- [x] 6.2 Implement `GET /streams/{id}/messages?before=&limit=`: 404 when room not live, else the history page + nextCursor.
- [x] 6.3 Implement the `/streams/{id}/ws` upgrade handler: accept, read `join`, resolve identity via `VerifyCreator`, 404-equivalent `error`+close for a missing room, `welcome`, register, run pumps, unregister on exit.
- [x] 6.4 Extend `DELETE /streams/{id}`: remove the stream, delete its messages, and `CloseRoom` in the hub (broadcast "room ended", close connections) — order so new joins 404 immediately.
- [x] 6.5 Wire the hub, chat service, and config knobs into `cmd/streamer/main.go`; ensure graceful shutdown also closes hub connections cleanly.
- [x] 6.6 Handler/WS tests: POST/GET new shape (incl. creatorKey once, absent from GET), /messages 200 + 404 + limit cap, full WS handshake over `httptest` (join→welcome, valid message broadcast to a second connection, empty/over-long → error only, join nonexistent → error+close, delete → live connection gets error + closed); `-race`.

## 7. Docker, env, docs

- [x] 7.1 Confirm the Dockerfile still builds with the WS dependency (no runtime changes expected); keep the distroless image + healthcheck subcommand.
- [x] 7.2 Publish to devops: the three env var names (CHAT_MAX_MESSAGES/CHAT_PAGE_SIZE/CHAT_MAX_LENGTH) and the nginx WS-upgrade needs for `/streams/{id}/ws` (Upgrade/Connection headers, HTTP/1.1 upstream, idle-tolerant read timeout). Confirm the WS frame contract + path with qc-portal. Record both for the team lead.
- [x] 7.3 Update `.env.example` (chat knobs) and `README.md`: the contract change, WS path + frames, history endpoint, chat storage model, env knobs.

## 9. Creator-only end via creatorKey (root D10, folded in)

- [x] 9.1 Require `Authorization: Bearer <creatorKey>` on `DELETE /streams/{id}`; verify with the existing constant-time `VerifyCreator`: match → 204 + cascade (messages, End, CloseRoom); existing stream + missing/invalid key → 403 (delete nothing); unknown id → 404. Preserve all other v0/chat behavior.
- [x] 9.2 Tests: 204 with valid key + cascade asserted; 403 on missing key and on wrong key with NOTHING deleted (messages + stream intact); 404 on unknown id; re-delete after removal → 404.
- [x] 9.3 Update spec (MODIFIED "End a stream"), README, and the container E2E to show DELETE-without-key → 403 and DELETE-with-key → 204 + cascade.

## 8. Definition of Done gate

- [x] 8.1 `gofmt`, `go vet`, `golangci-lint run` clean; `go mod tidy` no diff (with the new WS dependency justified/recorded).
- [x] 8.2 `go test -race ./...` passes (all WS/hub code race-tested per AC11); integration tests pass against a real Valkey via their build tag.
- [x] 8.3 Assemble the done report: contract change + chat summary, tests written, final WS library + version, full-suite results (never a bare "done").
