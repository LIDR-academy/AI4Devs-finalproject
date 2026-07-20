## Context

This is streamer's implementation design for its slice of `home-stream-lifecycle-v0`. The cross-scope wire contract (§6) and runtime topology are frozen in the root orchestration record (`openspec/changes/home-stream-lifecycle-v0/proposal.md`, `design.md`, `specs/`) and are LAW — this document does not redefine them; it records the streamer-internal *how*: package layout, storage model, validation, error handling, configuration, and lifecycle. The streamer scope is greenfield (only `CLAUDE.md` and `openspec/` exist today), so there is no prior code to migrate.

Constraints in force: `CONSTITUTION.md` + `CONSTITUTION.go.md` (idiomatic Go, boring code, validate at the boundary, errors are first-class, context on every I/O path, no zero-timeout server, `go test -race` clean, no secrets/PII in logs). Runtime topology (root D1): a reverse proxy gives a single origin, so streamer emits **no CORS** and handles **no OPTIONS**.

## Goals / Non-Goals

**Goals:**
- Implement `GET/POST/DELETE /streams` exactly per §6, plus `/healthz` and `/readyz`, backed by Valkey as private storage.
- Validate every inbound request at the boundary; return the stable `{"error": string}` body for all error statuses.
- Keep the service boring and idiomatic: thin handlers, business logic in `internal/`, a small storage interface with a hand-written fake for tests.
- Fail fast on missing/unreachable Valkey config; harden the HTTP server and shut down gracefully.

**Non-Goals:**
- Auth/identity, chat/WebSocket, rooms, LiveKit media (later features — not this slice).
- CORS, TLS, the reverse proxy, and the Valkey container (devops-owned).
- Valkey persistence, TTL, ordering guarantees, pagination.
- The portal UI and its client-side validation (qc-portal-owned; we only agree the code-point counting method).

## Decisions

### D1 — Package layout (flat, idiomatic)
- `cmd/streamer/main.go` — entrypoint only: read config from env, construct the Valkey client, wire storage → service → HTTP handler, start the server, handle graceful shutdown. No business logic.
- `internal/stream/` — the domain: the `Stream` struct, validation (trim, rune-count bounds), `id` generation, and the `Service` that orchestrates create/list/delete against a `Store` interface.
- `internal/stream/store` collapsed into the same package or a small `internal/valkey/` package holding the Valkey-backed `Store` implementation. **Chosen**: define the `Store` interface where it is consumed (`internal/stream`), and put the Valkey implementation in `internal/valkey`. This keeps the domain testable with a hand-written fake and confines the dependency to one package.
- `internal/httpapi/` — thin `net/http` handlers: decode/validate → call `stream.Service` → encode response. Router: stdlib `net/http.ServeMux` (Go 1.22+ pattern routing handles `POST /streams` and `DELETE /streams/{id}` with method matching), avoiding a router dependency. **Over** chi — stdlib mux is now sufficient for three routes; no dependency justified.

### D2 — Storage model (root D5, restated for implementation)
Two keys per stream, no `KEYS`/`SCAN`:
- `streams` — a Valkey SET of live ids. `GET /streams` reads this set, then fetches each hash.
- `stream:{id}` — a Valkey HASH with fields `title` and `description`.
- POST: generate id, then add to the set and write the hash. To keep the two writes consistent, perform them in a single `MULTI/EXEC` transaction (or pipeline) so a stream never appears in the set without its hash.
- DELETE: remove the id from the set and delete the hash in one transaction; return `404` if the id was not a member (checked via the set-removal count), `204` otherwise.
- Read-then-fetch race: a stream deleted between reading the set and fetching its hash yields a missing hash — treat a missing hash as "not live" and omit it from the list rather than erroring. Documented as acceptable v0 behavior.

### D3 — Validation at the boundary (root D3, D4)
- Cap the body with `http.MaxBytesReader` (8 KB) before decoding; a body over the cap → `400`.
- Decode JSON with `json.Decoder`; malformed JSON → `400`. Unknown fields are ignored (lenient decode — do **not** use `DisallowUnknownFields`, to stay forgiving of additive client changes).
- `title`: trim leading/trailing whitespace; reject empty (`400`); reject > 200 code points via `utf8.RuneCountInString` (`400`). Store the trimmed value.
- `description`: default `""` when absent; reject > 100 code points via `utf8.RuneCountInString` (`400`).
- The counting method (code points) is the agreed cross-scope contract with qc-portal.

### D4 — Error handling and shape
- One small helper writes `{"error": string}` with the right status and `Content-Type: application/json`. Same shape for `400`/`404`/`405`/`500`.
- `500` messages are generic ("internal error"); the underlying error is logged server-side with context (never the request body, never Valkey credentials). Errors are wrapped with `fmt.Errorf("...: %w", err)` through the call chain (Go §4).
- Method mismatches on a known path → `405` (ServeMux method patterns produce this; the handler emits the standard body).

### D5 — id generation (root D5)
16 bytes from `crypto/rand.Read`, encoded with `base64.RawURLEncoding` (~22 chars, opaque, URL-safe, no padding). A `crypto/rand` failure is a real error → `500`, logged; it does not panic.

### D6 — Configuration and fail-fast (root D5)
- Read `VALKEY_ADDR` (required), `VALKEY_PASSWORD` (default `""`), `VALKEY_DB` (default `0`, parsed as int), `STREAMER_ADDR` (default `:8080`).
- Missing/blank `VALKEY_ADDR` or an unparsable `VALKEY_DB` → return an error from config loading; `main` logs it and exits non-zero **before** the server listens. This is the only place a startup failure is acceptable (Go §4).
- `/readyz` pings Valkey per request (bounded timeout) so readiness reflects live reachability, not just startup.

### D7 — Server hardening and lifecycle (Go §5, §6)
- `http.Server` with `ReadHeaderTimeout`, `ReadTimeout`, `WriteTimeout`, `IdleTimeout` all set to sensible non-zero values.
- `main` owns the server goroutine and one signal handler (`signal.NotifyContext` on SIGINT/SIGTERM); on signal it calls `server.Shutdown(ctx)` with a bounded deadline, then closes the Valkey client. No fire-and-forget goroutines; every goroutine has an owner and a stop path. `context.Context` is threaded as the first parameter through the service and store; never stored in a struct.

### D8 — Dependency choice (Valkey client)
One external dependency: **`github.com/valkey-io/valkey-go`** (the official Valkey client) — or `github.com/redis/go-redis/v9` if the former proves awkward for the SET/HASH + MULTI operations. Justification (Constitution §6): §5.2 mandates Valkey storage; implementing the RESP protocol, connection pooling, and pipelining by hand is far more than "a few lines of boring code." The final choice and its version are recorded in `go.mod` and reported in the done evidence. The dependency is confined to `internal/valkey`.

## Risks / Trade-offs

- Two-write consistency on POST/DELETE → mitigated by a single `MULTI/EXEC` transaction so the set and hash never diverge.
- Read-then-fetch race in `GET /streams` (stream deleted mid-list) → mitigated by treating a missing hash as "not live" and omitting it; acceptable for an ephemeral v0 with no ordering guarantee.
- `GET /streams` does N hash fetches after reading the set → fine at v0 scale; if the live-stream count grows, batch via a pipeline. Not optimized prematurely (Constitution §2).
- Anonymous DELETE (anyone can end any stream) → an accepted v0 property from the PRD; revisited when `security` enters.
- Dependency risk (a Valkey client) → mitigated by confining it to `internal/valkey` behind the `Store` interface, so a swap touches one package and no tests.

## Migration Plan

Greenfield: no data migration, no rollback surface. Build order within streamer: (1) config + domain (`Stream`, validation, id) with unit tests; (2) `Store` interface + Valkey implementation + a hand-written fake; (3) HTTP handlers with `httptest`-driven tests against the fake store; (4) `main` wiring + graceful shutdown; (5) Dockerfile (multi-stage → minimal image) + README. devops consumes the Dockerfile and proves end-to-end acceptance (#7) once the portal image also builds. The feature stays pending until reported done with `go test -race ./...` + `go vet` + linter evidence.

## Open Questions

None blocking. Deferred, streamer-owned, recorded when settled: final Valkey client library choice (valkey-go vs go-redis, decided during implementation and reported); whether `GET /streams` needs deterministic ordering (only if a product need arises — would use a Valkey sorted set).
