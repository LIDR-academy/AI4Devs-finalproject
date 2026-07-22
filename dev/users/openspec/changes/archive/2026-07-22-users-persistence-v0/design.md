## Context

`users` is greenfield: `dev/users/` currently holds only its brief and this openspec scope. This change stands up the whole service for `security-v0`. The only caller is `security`, on first login, via one internal endpoint; the only external system is MongoDB. The wire contract (§5.2/§6 of the PRD) is frozen. The hard constraints come from the constitution: idempotent creation, MongoDB behind a small interface with a hand-written fake, integration tests separated from the default run, config from the environment, and never logging PII.

Two cross-scope shapes are being confirmed in parallel and are not blocking this design: the get-or-create error/status contract with `security`, and the exact Mongo env var names + internal listen port with `devops`.

## Goals / Non-Goals

**Goals:**
- One idempotent internal endpoint that turns an email into a stable `{id, username}` identity.
- Correctness under concurrency: two first-time requests for the same email yield exactly one user.
- Persistence isolated behind a narrow interface so business logic is unit-tested with a hand-written fake and no database.
- Boring, idiomatic Go; standard library first; thin HTTP handler, logic in a domain package.

**Non-Goals:**
- Username/profile editing, avatars, email change (username is fixed in v0).
- Any public/host-exposed API; any auth or shared secret on the internal endpoint (network isolation is the v0 trust boundary).
- SuperTokens knowledge — `users` never talks to SuperTokens; it only knows emails and its own records.

## Decisions

### D1 — Layout: thin handler, logic in `internal/user`
`cmd/users/main.go` wires config → Mongo client → repository → service → HTTP server and starts it (no business logic). `internal/user` holds the domain: the `User` type, the `Service` with `GetOrCreate(ctx, email)`, the repository interface, and username generation. The HTTP handler decodes/validates, calls the service, and encodes the response. Rationale: matches `CONSTITUTION.go.md` §2 (flat standard layout, handlers thin). Alternative — everything in one package — rejected as it blurs the boundary the tests rely on.

### D2 — Repository interface defined at the consumer, with a hand-written fake
`internal/user` defines a small interface (e.g. `GetByEmail`, `Insert`, and a uniqueness check for usernames) that the service consumes; the Mongo implementation lives in a sibling package (e.g. `internal/user/mongo` or an adapter file) and satisfies it. Unit tests use a hand-written in-memory fake. Rationale: `CONSTITUTION.go.md` §1/§7 (accept interfaces where consumed, hand-written fakes, no mocking frameworks). Alternative — mocking library — rejected by the constitution.

### D3 — Idempotency: unique index on email + insert-or-fetch, not read-then-write
Correctness under concurrent first-time requests comes from a **unique index on `email`** in MongoDB, not from a check-then-insert race. The flow: attempt to fetch by email; if found, return it with `created:false`; if not, attempt an insert; if the insert fails on the duplicate-key error, another request won the race — fetch again and return `created:false`. Only a genuine insert returns `created:true`. Rationale: the database is the single arbiter of uniqueness, so two racing creates cannot both succeed. Alternative — application-level lock or read-then-write — rejected: racy and not durable. The `id` returned is the Mongo document id (`_id`), used platform-wide as `userId` (root design D3).

### D4 — Username generation: word+alphanumeric, unique via index + regenerate-on-collision
A generator produces a word+alphanumeric string in the same style as ephemeral chat ids (a word plus a short alphanumeric suffix), using `crypto/rand` for the random portion. A **unique index on `username`** enforces global uniqueness; on the rare duplicate-key error the service regenerates and retries a bounded number of times. Rationale: index-enforced uniqueness is authoritative; the suffix keeps collisions rare so retries are effectively never hit. Alternative — sequential or purely dictionary usernames — rejected (collisions, or predictable/ugly). The exact word list/suffix length is an implementation detail documented in code.

### D5 — Validation and error mapping at the boundary
The handler validates: body must be JSON, `email` present, non-empty, and pass a basic format check, before any persistence. Mapping: validation failure → `400`; datastore failure → `500`; success → `200`. All error responses share the JSON shape `{ "error": string }` with a human-actionable message that contains no PII. Rationale: constitution §9/§10 (validate at the boundary, errors first-class, no PII).

**Confirmed with `security`:** a `200` MUST always carry a complete body — non-empty `id` and non-empty `username`. `security` treats any non-200, an unreachable/errored call, OR a `200` with a missing/empty `id`/`username` as a hard failure: it fails session creation and mints no token (never an identity-less token). So this service never returns a `200` unless a real record with both fields is in hand. Because `security` only ever sends an email SuperTokens has already verified, a `400` on this path should be rare-to-never and would signal an internal contract mismatch — `security` treats it as a hard failure exactly like a `500`; the boundary validation remains as defense in depth.

### D6 — Config from env, fail fast
A tiny config loader reads the Mongo connection settings and HTTP listen address from environment variables at startup and returns a clear error (aborting) if a required value is missing. `http.Server` gets explicit read/write/idle timeouts; the Mongo client gets connect/operation timeouts via `context`. Rationale: constitution §9/§10 and `CONSTITUTION.go.md` §6 (env config, fail fast, always set timeouts).

Variable names are **pinned with `devops`** (confirmed):
- `MONGO_URI` — full connection string including dev auth, e.g. `mongodb://quickchat:<devpass>@mongo:27017/?authSource=admin` (host `mongo`, port `27017`, internal network only, no host publish).
- `MONGO_DB` — database name, `quickchat`.
- `USERS_HTTP_ADDR` — internal listen address, `:8080` (internal-only; only `security` dials it over the compose network).

The loader centralizes them so any future rename is one edit. `devops` runs Mongo ephemeral (no volume) for dev and gates `users` on a Mongo healthcheck (`depends_on: service_healthy`), so startup never races ahead of the database.

### D7 — Logging without PII
Structured logs (standard library `log/slog`) record request outcome, status, and error context but never the email or any personal field. Rationale: constitution §10. A user is identified in logs by its opaque id only after creation, never by email.

### D8 — Testing strategy: unit by default, integration separated
Unit tests (handler validation, service idempotency and username logic, error mapping) run against the hand-written fake with no database and no sleeps — concurrency is exercised deterministically. Integration tests against a real MongoDB live behind a build tag (e.g. `//go:build integration`) so `go test ./...` stays hermetic. Rationale: `CONSTITUTION.go.md` §7 and constitution §4.

### D9 — Dockerfile
Multi-stage: Go build → static binary on a minimal base image, config purely from env, no secrets baked in. `devops` consumes it. Rationale: the users brief and constitution §10.

## Risks / Trade-offs

- **Duplicate-key handling must distinguish email vs username collisions** → the insert path inspects which unique index the duplicate-key error names, so an email race returns the existing user while a username collision triggers regeneration. Covered by unit tests over the fake plus an integration test over real Mongo indexes.
- **Internal endpoint has no authentication in v0** → accepted per root design D3 (network isolation is the trust boundary); a shared secret is a trivial future hardening, recorded as a non-goal.
- **Basic email validation only** → `security` has already verified the email via the magic link, so `users` does boundary sanity-checking, not authoritative validation; documented so we don't over-engineer.
- **Ephemeral Mongo (devops call)** → dev users are wiped on `docker compose down`; accepted per PRD (ephemeral dev env). A named volume is a one-line devops change if persistence is later wanted; does not affect this service's design.

## Migration Plan

Additive: a new service and a new MongoDB database in the running environment (added by `devops`). No data migration — the environment is ephemeral. Deploy order within the race: this service builds and tests against its fake independently of `security`; the end-to-end get-or-create loop runs once `devops` wires Mongo and `security` calls the endpoint. Rollback is removal of the service and its Mongo container; nothing else depends on `users` yet.

## Open Questions

None. All cross-scope contracts are closed: Mongo env (`MONGO_URI`, `MONGO_DB`, `USERS_HTTP_ADDR=:8080`; host `mongo:27017`, internal-only, ephemeral) confirmed with `devops`; the get-or-create shape and failure/status contract (200 with complete `{id,email,username,created}` = success, everything else = hard failure that blocks login) confirmed with `security`.
