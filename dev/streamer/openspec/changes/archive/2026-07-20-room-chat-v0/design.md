## Context

streamer's implementation design for its slice of `room-chat-v0`. The cross-scope HTTP+WebSocket contract (§6) and the root decisions (D1–D8) are frozen in `openspec/changes/room-chat-v0/` and are LAW — this records the streamer-internal *how* and the D8 calls delegated to me. It builds on the shipped `home-stream-lifecycle-v0` code (config, `internal/stream`, `internal/valkey`, `internal/httpapi`, hardened `http.Server`, graceful shutdown, distroless image + `healthcheck` subcommand). Constitutions in force: `CONSTITUTION.md` + `CONSTITUTION.go.md`. Concurrency is the core risk here (§5): every pump owns its goroutine and stop path and selects on `ctx.Done()`; `-race` on all WS code (AC11).

## Goals / Non-Goals

**Goals:** apply the v0 contract change (username + creatorKey) without breaking preserved behavior; add the room WebSocket, per-room capped storage with server-authoritative stable ids, cursor history, and room-end teardown; keep the hub in-process and boring; no leaked goroutines/subscriptions on drop or room-close.

**Non-Goals:** portal layout/rendering and the client-side history↔live buffering (qc-portal); nginx WS-upgrade config and TLS (devops); multi-replica fan-out (no Valkey pub/sub); auth (creatorKey is a stopgap).

## Decisions

### D-A — Valkey model: a Redis Stream per room (my D8 call)
Each room's messages live in a Valkey **Stream** at key `room:{id}:messages`.
- **Append**: `XADD room:{id}:messages MAXLEN <CHAT_MAX_MESSAGES> * sender <s> role <r> text <t> ts <iso>`. The returned entry id (e.g. `1721470000000-0`) **is** the message `id` — server-authoritative, monotonic, unique, and a natural pagination cursor. This satisfies "stable ids" (root D2) and cursor pagination in one structure.
- **Cap**: **exact** `MAXLEN` (not `MAXLEN ~`). Chosen over the approximate `~` form because the spec requires stored history to *never exceed* the cap; exact trim guarantees `len ≤ N`. The efficiency cost of exact trimming is irrelevant at v0 scale.
- **Latest page**: `XREVRANGE key + - COUNT limit`, then reverse in-memory to oldest→newest. `nextCursor` = the id of the oldest message in the page when the page is full, else `null`.
- **Before a cursor**: `XREVRANGE key (before - COUNT limit` (the `(` makes `before` exclusive), reverse to oldest→newest; `nextCursor` = oldest id when full, else `null`.
- **Delete room messages**: `DEL room:{id}:messages` (called from `DELETE /streams/{id}`).
- **Room existence** for history/join `404`: membership in the existing `streams` SET (a live stream ⇔ its id is in the set), reusing `internal/stream`.
- Rejected: a LIST with LPUSH/LTRIM — it lacks server-authoritative ids usable as cursors, forcing a separate id scheme; Streams give ids + range queries for free.

### D-B — WebSocket library (second justified dependency, my call)
No WebSocket server exists in the stdlib, so one dependency is justified (Constitution §6). **Choice: `github.com/coder/websocket`** (preferred) — its API is context-native (`conn.Read(ctx)`, `conn.Write(ctx)`, `conn.Close(code, reason)`), which maps directly onto our rule that every I/O takes a context and every pump selects on `ctx.Done()`; it has no transitive dependencies and passes the Autobahn suite. Fallback: `github.com/gorilla/websocket` (deadline-based) if a blocker appears. The dependency is confined to `internal/hub`'s connection type behind a small interface, so the domain and tests don't import it. Final choice + version recorded in the done evidence.

### D-C — In-process broadcast hub (root D8: single instance, no pub/sub)
`internal/hub` owns all live rooms. No Valkey pub/sub — a single streamer replica fans out in memory.
- `Hub`: a `sync.Mutex`-guarded `map[string]map[*Client]struct{}` (roomID → set of clients). Methods: `Register(roomID, *Client)`, `Unregister(roomID, *Client)`, `Broadcast(roomID, payload)`, `CloseRoom(roomID)`. Critical sections are tiny (map mutations only).
- `Client`: holds the WS conn, a per-connection `context.Context`+`cancel`, a **buffered** `send chan []byte`, and its stamped identity. **One writer** owns the socket (the write pump); nothing else writes to the conn.
- **Backpressure**: `Broadcast` does a non-blocking send to each client's buffer; if a client's buffer is full (slow/stuck consumer) the hub cancels that client (disconnects it) rather than blocking the room. A slow consumer never stalls broadcast.
- **CloseRoom**: cancel every client in the room (which stops their pumps and triggers unregister) and delete the room entry.

### D-D — Connection lifecycle and goroutine ownership (Constitution §5, AC11)
The WS handler owns each connection's two goroutines and blocks until both stop:
- Accept the upgrade. Read the first frame; require `join`. Resolve identity (see D-E). If the room is not live → send `error`, close, return (never registered).
- Send `welcome`; `hub.Register`.
- Start `readPump` and `writePump` under a `sync.WaitGroup` (stdlib — no errgroup dependency), then `wg.Wait()` → `hub.Unregister`. Because the handler returns only after both pumps exit, tests wait on handler completion to **prove** no goroutine is leaked (no goleak dependency needed).

**Stop signal — a stop channel, not context cancellation.** The chosen WebSocket
library (coder/websocket) *closes the connection when the read context is
cancelled*, which would race the write of a queued "room ended" frame. So the
stop path is an idempotent `client.stop` channel, and the **write pump is the
sole closer** of the socket:
- `readPump`: loops `conn.Read(connCtx)` (connCtx = the request context, cancelled only on HTTP teardown); on a `message` frame validate → append → broadcast; on any read error or bad frame it requests stop and returns. It never closes the socket. A bounded read limit prevents a huge frame from exhausting memory.
- `writePump`: `select { case <-client.stop: flush queued frames then CloseNow; case payload := <-send: write }`. `CloseNow` (no close handshake) unblocks the concurrent read pump immediately; queued frames (e.g. the room-ended error) are written to the socket before it.
- Stop is requested by: client drop (read error), a write failure, a full send buffer (slow-consumer disconnect), `CloseRoom`, and `CloseAll` (shutdown). `CloseRoom` enqueues the room-ended error *then* requests stop, so the write pump flushes it before closing.

### D-E — creatorKey as a credential (root D5)
- Generated at `POST /streams`: 32 bytes `crypto/rand`, base64 `RawURLEncoding` (opaque). Stored as a **private** field in the `stream:{id}` hash.
- Verified on join by `stream.Service.VerifyCreator(ctx, id, key) (role, sender, error)` using `crypto/subtle.ConstantTimeCompare`. A missing room → `ErrNotFound`; a non-match → viewer (not an error).
- Never returned by `List`, never in history, never in a frame, never logged. `List` builds the public `{id,username,title,description}` explicitly and does not read the `creatorKey` field into any response path.

### D-F — Identity generation (root D7)
Viewer `sender` = `<word>-<alnum>` (e.g. `falcon-x92k`): a word from a small fixed adjective/noun list + a short `crypto/rand` base32 suffix, generated per WS connection, nothing stored. `role` is always server-stamped.

### D-G — Config additions (fail-fast)
`internal/config` gains `ChatMaxMessages` (default 1000000), `ChatPageSize` (default 200), `ChatMaxLength` (default 500), parsed as ints; non-integer or non-positive → error at startup (extends the existing fail-fast `Load`).

### D-H — Package layout (extends v0)
- `internal/chat` — `Message` struct, message validation (trim, ≤ `CHAT_MAX_LENGTH` code points), the `MessageStore` interface (`Append`, `History`, `DeleteRoom`), and a `Service` orchestrating validate→append and history. Testable with a fake `MessageStore`.
- `internal/hub` — the `Hub`, `Client`, and the WS connection type (the only importer of the websocket library, behind an interface for hub tests).
- `internal/valkey` — extend the `Store` with username + private creatorKey fields and implement `MessageStore` (Stream ops above) and `DeleteRoom`.
- `internal/stream` — `Stream` gains `Username`; validation adds username; `Create` generates/stores `creatorKey` and returns it once; `VerifyCreator`; `End` cascades to message deletion.
- `internal/httpapi` — POST/GET shape change; new `GET /streams/{id}/messages` handler; new `/streams/{id}/ws` upgrade handler that wires a connection into the hub; `DELETE` now also closes the room in the hub and deletes messages.

## Risks / Trade-offs

- **WS goroutine leaks on drop/room-close** → D-D: single `cancel()` stop path + handler-joins-both-pumps; tests wait on handler return to prove teardown; `-race` on all WS tests.
- **Slow consumer stalling the room** → D-C backpressure: full buffer ⇒ disconnect that client, never block `Broadcast`.
- **History/live boundary** → D-A stream entry ids are the message ids, so client dedup by id is exact; the client-side buffering is qc-portal's half.
- **creatorKey is a bearer secret** → D-E hygiene (crypto/rand, constant-time compare, never logged/listed); multi-tab same-key-all-streamer is an accepted PRD limit.
- **Exact MAXLEN cost** → negligible at v0; correctness (never exceed cap) beats the approximate-trim micro-optimization.
- **Second dependency** → confined to `internal/hub`; the domain and stores stay library-agnostic behind interfaces.

## Migration Plan

No data migration (Valkey ephemeral; new `room:{id}:messages` keys are additive; existing `streams`/`stream:{id}` gain a `username` and private `creatorKey` field on new creates). Build order: (1) config knobs + `internal/stream` contract change (username, creatorKey, VerifyCreator, delete-cascade) with tests; (2) `internal/chat` domain + fake store; (3) `internal/valkey` Stream ops + message store; (4) `internal/hub` + connection pumps with race tests (fake conn, then real WS via httptest); (5) `internal/httpapi` wiring (POST/GET change, /messages, /ws, DELETE room-close); (6) Docker/env/README. devops adds env vars + nginx WS-upgrade and proves the end-to-end WS round-trip (AC10) once images build. Feature pending until reported done with `go test -race ./...` + vet + lint evidence.

## Open Questions

None blocking. Recorded, my calls, finalized in implementation/evidence: final WS library (coder/websocket vs gorilla); the exact viewer-id word list; whether `nextCursor` uses the full-page heuristic or an extra existence probe (I will use the full-page heuristic — a spurious final empty fetch is acceptable and simpler). Coordination items for the race (not now): WS frame contract + `/streams/{id}/ws` path with qc-portal; env var names + nginx WS-upgrade (path, idle read timeout) with devops.
