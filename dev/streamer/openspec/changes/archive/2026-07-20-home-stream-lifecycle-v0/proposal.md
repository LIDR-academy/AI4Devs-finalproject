## Why

QuickChat has no backend yet. This delivers the streamer service's slice of `home-stream-lifecycle-v0`: the HTTP API that lists live streams, starts a stream (title + optional description), and ends it, backed by Valkey as private storage. It is the first real runtime for streamer and the server half of the frozen §6 wire contract the portal depends on.

This change covers the **streamer scope only**. The cross-scope wire contract (§6) and runtime topology are already frozen in the root orchestration record (`openspec/changes/home-stream-lifecycle-v0/`) and are **LAW** here — this proposal implements against them and does not redefine them.

## What Changes

- **HTTP API** (§6 contract, served on a single origin behind devops's reverse proxy, so streamer emits **no CORS** and handles **no OPTIONS**):
  - `GET /streams` → `200` with a JSON array of live streams `{id, title, description}`; `[]` when none.
  - `POST /streams` → `201` with the created `{id, title, description}`; `400` on validation failure.
  - `DELETE /streams/{id}` → `204` when removed; `404` when the id is not live.
- **Boundary validation**: `title` required, non-empty after trimming, max 200 runes; `description` optional, ≤ 100 Unicode code points (`utf8.RuneCountInString`); 8 KB request-body cap via `http.MaxBytesReader`. Violations → `400`.
- **Valkey as private storage** (never leaked into responses or errors): a `streams` set of live ids + a `stream:{id}` hash `{title, description}`. Add on POST, remove on DELETE. No TTL, no `KEYS`/`SCAN`. `GET /streams` order is unspecified in v0.
- **Operational endpoints** (outside the §6 contract): `GET /healthz` (liveness, always `200` when up) and `GET /readyz` (pings Valkey; `200`/`503`).
- **Stable error body**: `{"error": string}`, same shape for `400`/`404`/`405`/`500`.
- **Config from environment**: `VALKEY_ADDR` (required), `VALKEY_PASSWORD` (default `""`), `VALKEY_DB` (default `0`), `STREAMER_ADDR` (default `:8080`). Fail fast at startup if `VALKEY_ADDR` is missing/unreachable.
- **`id` generation**: 16 random bytes from `crypto/rand`, base64 `RawURLEncoding` (opaque, URL-safe).
- **Full `http.Server` timeouts** (ReadHeader/Read/Write/Idle) and outbound Valkey client timeouts — no zero-timeout server.
- **One justified external dependency**: a well-known Valkey/Redis client (hand-rolling RESP + connection pooling is not "a few lines of boring code"; §5.2 mandates Valkey storage).
- **Own Dockerfile**: multi-stage Go build → static binary on a minimal image; consumed by devops.
- **Greenfield** — the streamer scope has no pre-existing code, so no breaking changes.

### Non-goals

- Authentication, authorization, identity, ownership checks (anonymous v0 — anyone may end any stream).
- Realtime/WebSocket, chat, rooms, or LiveKit media (this slice is the streams API only).
- Valkey persistence (ephemeral container, no volume — devops-owned).
- Pagination, search, filtering, ordering guarantees on `GET /streams`.
- CORS handling, TLS termination, and the reverse proxy itself (devops-owned; single-origin topology per root design D1).

## Capabilities

### New Capabilities

- `stream-lifecycle-api`: the streamer HTTP service implementing the §6 streams contract (list/start/end) backed by Valkey private storage, with boundary validation, a stable error body, operational health/readiness endpoints, and environment-driven runtime configuration.

### Modified Capabilities

<!-- none — greenfield streamer scope, no existing specs -->

## Impact

- **New Go service** in `dev/streamer/`: `cmd/streamer/main.go` (wiring, config, server startup) + `internal/` business packages (streams domain + Valkey-backed storage + HTTP handlers).
- **New dependency**: one Valkey/Redis client (justified above), recorded in `go.mod`.
- **New Dockerfile** for the streamer service (multi-stage, minimal image).
- **External systems**: Valkey (new to the running environment, provided by devops via env vars).
- **Cross-scope contracts (flagged, frozen — not changed here)**:
  - `qc-portal -> streamer`: consumes `GET/POST/DELETE /streams` at the literal same-origin path per §6. Coordination item: confirm code-point counting for `description` matches (`[...str].length` in TS ↔ `utf8.RuneCountInString` in Go).
  - `streamer -> devops`: env var names published for compose (`VALKEY_ADDR`, `VALKEY_PASSWORD`, `VALKEY_DB`, `STREAMER_ADDR`); `/readyz` for the compose health gate; listen port `:8080`.
  - `security`, `users`: **not touched** in this slice.
