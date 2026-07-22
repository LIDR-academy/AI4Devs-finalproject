## 1. Service scaffold

- [x] 1.1 Initialize the Go module (`go.mod`) and the flat layout: `cmd/security/main.go`, `internal/config`, `internal/auth`, `internal/users`.
- [x] 1.2 Add the SuperTokens Go SDK dependency pinned to a fixed version; run `go mod tidy` (no diff).
- [x] 1.3 Write a minimal README (what the service is, how to run it, how to test it, required env vars).

## 2. Configuration (env, fail-fast)

- [x] 2.1 Implement `internal/config` to read `SUPERTOKENS_CONNECTION_URI`, `SUPERTOKENS_API_KEY`, app/api domain settings, and the service port from the environment.
- [x] 2.2 Validate presence of required vars at startup; a missing required var is a fatal, clearly-worded startup error.
- [x] 2.3 Ensure the config type never stringifies/logs the API key (no `String()` leak); provide `.env.example` with names only, no values, and keep real `.env` untracked (`.gitignore`).
- [x] 2.4 Tests: table-driven cases for present/missing/blank required vars (happy + error paths); assert the API key is absent from any formatted output.

## 3. SuperTokens auth: /auth/* and JWKS

- [x] 3.1 Initialize the SuperTokens SDK in `internal/auth` with the Passwordless (email magic link) + Session recipes, header transfer mode (Bearer, not cookies).
- [x] 3.2 Mount the SDK-provided `/auth/*` routes and the JWKS endpoint on the HTTP server.
- [x] 3.3 Add boundary validation for our own request payloads (reject malformed JSON / missing-or-invalid email with a consistent JSON error before any downstream call).
- [x] 3.4 Tests: `/auth/*` request-magic-link happy path and invalid-payload rejection; assert JWKS endpoint serves a key set with no secret material; assert responses/logs never contain the API key, magic link, or raw token.

## 4. Identity stamping (users get-or-create + claim override)

- [x] 4.1 Define a small `users` client interface in `internal/auth` (where it is consumed) and implement it in `internal/users` as an HTTP client calling `POST /internal/users/get-or-create { email } → { id, email, username, created }`, with an explicit outbound timeout and wrapped errors. No auth header (compose-network trust, D3).
- [x] 4.2 Wire the SuperTokens session-creation override to call get-or-create and stamp `userId` (the users-service `id`) + `username` into the access-token claims.
- [x] 4.3 On get-or-create failure or an incomplete record (missing `id`/`username`), fail session creation with a wrapped error — never issue a token lacking identity claims.
- [x] 4.4 Tests: hand-written fake `users` client — new user (`created: true`, claims stamped), returning user (`created: false`, same username/id), and failure/incomplete-record path (no token issued); assert no credential/token leak on any path.

## 5. HTTP server hardening and lifecycle

- [x] 5.1 Configure `http.Server` with read/write/idle timeouts; keep handlers thin (decode/validate/delegate only).
- [x] 5.2 Wire dependencies in `cmd/security/main.go` (config → SuperTokens init → users client → server); no business logic in `main`.
- [x] 5.3 Implement graceful shutdown on `context` cancellation (SIGINT/SIGTERM) so any goroutine has a defined stop path.
- [x] 5.4 Tests: server starts with valid config and shuts down cleanly on cancellation; startup fails fast with a clear error when a required env var is missing.

## 6. Dockerfile

- [x] 6.1 Write a multi-stage Dockerfile (Go build stage → static binary on a minimal base); config comes from env only, no secrets baked in; expose the service port.
- [x] 6.2 Verify the image builds and the container starts with env-supplied config (documented in the README); coordinate with `devops` on port/env-var names if anything is unclear.

## 7. Definition of Done evidence

- [x] 7.1 `gofmt`/`goimports` clean, `go vet` clean, `golangci-lint run` clean, `go mod tidy` produces no diff.
- [x] 7.2 `go test -race ./...` passes; new behavior covered on happy + error paths; no skipped/disabled tests.
- [x] 7.3 Grep evidence: the SuperTokens API key and any secret appear in no response, log, or committed file (AC7).
- [x] 7.4 Publish the finalized contracts to peers: `get-or-create` shape confirmed with `users`; JWKS URL + claim set (`userId`, `username`) to `streamer`; env var names to `devops` — all recorded via the team lead.
- [x] 7.5 Report done with evidence (change → tests → full-suite results), never a bare "done".
