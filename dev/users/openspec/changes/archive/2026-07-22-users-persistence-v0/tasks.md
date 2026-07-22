## 1. Project scaffold

- [x] 1.1 Initialize the Go module (`go mod init`) and standard flat layout: `cmd/users/`, `internal/user/`.
- [x] 1.2 Add a `.gitignore` and a README stub (what it is, how to run, how to test) to be completed in task 7.

## 2. Domain: user type and username generation

- [x] 2.1 Define the `User` type in `internal/user` (id, email, username, created-at) with a package/doc comment.
- [x] 2.2 Implement word+alphanumeric username generation using `crypto/rand` (chat-id style), documented.
- [x] 2.3 Unit-test username generation: non-empty, expected shape, distinct across many calls (deterministic, no sleeps).

## 3. Repository interface and hand-written fake

- [x] 3.1 Define the repository interface in `internal/user` where it is consumed (`GetByEmail`, `Insert`, username-uniqueness check) with `context.Context` first param.
- [x] 3.2 Implement an in-memory hand-written fake of the interface for unit tests (supports duplicate-key simulation for email and username).

## 4. Service: idempotent get-or-create

- [x] 4.1 Implement `Service.GetOrCreate(ctx, email)`: fetch-by-email → return `created:false`; else insert → `created:true`; on duplicate-email error, re-fetch and return `created:false`.
- [x] 4.2 Handle username duplicate-key by regenerating (bounded retries) before persisting.
- [x] 4.3 Unit-test idempotency over the fake: new email → created:true; repeat → created:false, same id/username; simulated concurrent create → exactly one record, one created:true.
- [x] 4.4 Unit-test username collision path and the bounded-retry exhaustion error path.

## 5. HTTP boundary

- [x] 5.1 Implement the handler for `POST /internal/users/get-or-create`: decode JSON, validate (present, non-empty, basic email format), call the service, encode `200 {id,email,username,created}`.
- [x] 5.2 Map errors: validation → `400`, datastore → `500`, all with `{ "error": string }` and no PII; set `http.Server` read/write/idle timeouts.
- [x] 5.3 Unit-test the handler: malformed JSON → 400; missing/empty email → 400; invalid format → 400; datastore error (fake) → 500; happy path → 200 with correct body.

## 6. MongoDB adapter and config

- [x] 6.1 Implement the MongoDB repository satisfying the interface; create unique indexes on `email` and `username` at startup; distinguish which index a duplicate-key error names.
- [x] 6.2 Implement the env-driven config loader reading `MONGO_URI`, `MONGO_DB`, `USERS_HTTP_ADDR` (confirmed with devops) that fails fast on missing/invalid values; centralize the names in one place.
- [x] 6.3 Wire everything in `cmd/users/main.go`: load config → connect Mongo (with timeouts) → build repo/service/handler → start server with graceful shutdown on signal.
- [x] 6.4 Add integration tests behind the `integration` build tag exercising real Mongo idempotency + unique-index behavior; keep them out of the default `go test ./...` run.

## 7. Packaging, docs, and Definition of Done

- [x] 7.1 Write the multi-stage Dockerfile (Go build → static binary on a minimal image, config from env, no secrets baked in); confirm it builds.
- [x] 7.2 Complete the README (what it is, run, test, env vars, internal-only note) and ensure every exported identifier has a doc comment.
- [x] 7.3 Verify no PII is logged anywhere (grep review of log calls); confirm the endpoint is internal-only.
- [x] 7.4 Run and record evidence: `gofmt`/`goimports` clean, `go vet` clean, `golangci-lint run` clean, `go test -race ./...` passing, `go mod tidy` no diff.
