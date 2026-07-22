## Context

The `security` service is greenfield — nothing exists in `dev/security/` beyond scaffolding. This design covers how to build it for `security-v0`: a Go HTTP service that fronts SuperTokens managed cloud for email magic-link auth, exposes a JWKS endpoint, and stamps a users-service identity into every access token. The PRD (`prds/security-v0.md` §4/§5.1/§6/§10) and the team lead's orchestration record resolve the major decisions; this document records the security-scoped technical choices and their rationale. It is a genuine design doc because the change introduces a new external dependency (SuperTokens SDK), a new service, and security-sensitive config handling.

Constraints in force: `CONSTITUTION.md` + `CONSTITUTION.go.md` (idiomatic flat layout, `net/http` first, handlers thin, config from env, no secrets in code/logs, `-race` clean, every I/O path takes `context.Context`).

## Goals / Non-Goals

**Goals:**
- Stand up the security Go service with the standard flat layout (`cmd/security`, `internal/*`).
- Integrate SuperTokens Passwordless (email magic link) via the official Go SDK; expose `/auth/*` and JWKS.
- Header Bearer transport; security is the sole SuperTokens client.
- On new session, call `users` get-or-create and stamp `userId` + `username` into the access-token claims.
- Config strictly from env, fail-fast on missing required vars; the API key never logged/returned/committed.
- A multi-stage Dockerfile that builds a static binary on a minimal image.

**Non-Goals:**
- Self-hosted SuperTokens core, username editing, roles/rate-limiting, social/password/2FA (proposal Non-goals).
- Issuing LiveKit/media tokens (the OPEN LiveKit-issuer question is not resolved here).
- Implementing `users`, `streamer`, `qc-portal`, or `devops` code — this service only publishes its contracts to them.

## Decisions

### D1 — SuperTokens Go SDK, managed cloud, security as sole client
Integrate `github.com/supertokens/supertokens-golang` (the official, blessed SDK per PRD §4). Managed cloud hosts the core, its storage, and sends the magic-link email — so no local core, no Postgres, no mail container. Only `security` initializes the SDK and holds the connection URI + API key.
- **Alternative considered:** hand-rolled magic-link + JWT. Rejected — reimplementing token issuance, rotation, session refresh, and JWKS is error-prone and out of scope (Constitution §6: reach for the dependency only when the stdlib genuinely can't do the job; here it can't reasonably).

### D2 — Standard flat Go layout
- `cmd/security/main.go` — entrypoint only: load config, init SuperTokens, wire the HTTP server with timeouts, start/stop. No business logic.
- `internal/config` — read + validate env (fail-fast at startup on missing required vars).
- `internal/auth` — SuperTokens recipe init (Passwordless + Session), the claim-override that stamps `userId`/`username`, and the `/auth/*` + JWKS wiring. Named `auth`, not `user` — the package is about the auth flow; avoids `utils`-style vagueness (Go constitution §2).
- `internal/users` — a thin client for the `users` get-or-create call, behind a small interface (defined where consumed, in `auth`) with a hand-written fake for tests (Go constitution §7).
- **Alternative considered:** matching the C4 "User"/"Tokens" package names literally. Deferred — v0 only stamps identity claims; a separate token-issuance package (`Tokens`) has no behavior yet (LiveKit issuer is OPEN), so introducing it now would be a speculative abstraction (Constitution §2). Naming follows what the code does today.

### D3 — Header Bearer transport, JWKS for stateless verification
Configure SuperTokens header transfer mode so the access token travels as `Authorization: Bearer <token>` (not cookies). Expose the SDK's JWKS endpoint. `streamer` fetches JWKS at startup + refreshes and verifies statelessly — **no per-request call to security** (AC6). The JWKS URL and the claim set are published to streamer as law.
- **Alternative considered:** cookie transport. Rejected by PRD §4 — header mode is the agreed contract; WS carries the token in the join frame, which cookies can't serve cleanly.

### D4 — Identity stamping via SuperTokens claim override
On new-session creation, the SDK's session-creation hook (override) calls `users` `POST /internal/users/get-or-create { email } → { id, email, username, created }`, then adds `userId` (= the users-service `id`) and `username` to the access-token payload as custom claims. `userId` — **not** SuperTokens' internal user id — is the ownership key `streamer` reads.
- **Idempotency & failure:** the `users` endpoint is get-or-create (idempotent by email — D3 of the root record); a retry never duplicates. If the `users` call fails, session creation fails loudly (error wrapped with context, no token minted) rather than issuing a token with missing identity claims — a token without `userId` would break ownership downstream.
- **Alternative considered:** stamping SuperTokens' own user id and resolving to a users id later. Rejected — the PRD makes the users-service id the ownership identity; resolving per request reintroduces the per-request coupling D3 exists to avoid.

### D5 — Config from env, fail-fast, secret hygiene
`internal/config` reads `SUPERTOKENS_CONNECTION_URI`, `SUPERTOKENS_API_KEY`, the app/api domain settings, and the service port from the environment, validating presence at startup (a missing required var is a fatal startup error per Constitution §9). The API key is never logged, never included in any response body, and never written to a committed file — `.env` files stay untracked (AC7 grep-verified in evidence). Structured logs redact/omit tokens, magic links, and credentials entirely.
- **security→users trust = the compose network** (D3, no shared secret in v0) — the get-or-create client sends no auth header; isolation is the boundary.

### D6 — HTTP server hardening
`net/http` with a router if one helps (chi acceptable per Go constitution §6; full frameworks not). Set read/write/idle timeouts on `http.Server` and a timeout on the outbound `users` client (zero-timeout is a bug, §6). Handlers stay thin: SuperTokens middleware handles `/auth/*`; our own handlers only decode/validate/delegate. Graceful shutdown on `context` cancellation so any goroutine has a stop path.

## Risks / Trade-offs

- **External dependency gates the real E2E** → the full magic-link loop needs real SuperTokens creds + a real inbox (human-supplied). Mitigation: build and unit-test against the contract with a faked `users` client and the SDK in a test config; the live loop runs once creds land. Unit tests never depend on the managed service.
- **A `users` outage blocks sign-in** → by design (D4) a missing identity is fatal to session creation. Mitigation: the error is surfaced clearly; this is preferable to minting identity-less tokens. Revisit with retry/backoff only if it proves flaky (not speculatively).
- **Secret leakage** → API key in a log or response would be a critical breach. Mitigation: config layer never stringifies the key; a grep in the done-evidence asserts no secret in responses/logs/committed files (AC7).
- **Claim-override coupling to SDK internals** → the override API is SDK-version-specific. Mitigation: pin the SDK version in `go.mod`; keep the override small and covered by a unit test asserting the stamped claims.
- **Naming divergence from the C4 model** (D2, no `Tokens` package yet) → recorded deliberately; revisit when a token-issuance responsibility (e.g. LiveKit) is actually assigned.

## Migration Plan

Additive only — a brand-new service, no data migration. Build order: config → SuperTokens init + `/auth/*` + JWKS → users client + claim override → Dockerfile + README. Publish to peers before their implementation depends on it: the `get-or-create` shape is finalized with `users`; the JWKS URL + claim set (`userId`, `username`) go to `streamer`; the env var names go to `devops`. No rollback concern (nothing depends on security until the contract is published and the other scopes wire in). Pending until done-with-evidence: `gofmt`/`go vet`/`golangci-lint`/`go test -race ./...` clean, README + Dockerfile present, AC7 secret grep clean.

## Open Questions

- **LiveKit access-token issuer** (security vs streamer) — OPEN in the root record; explicitly out of scope for v0, so it does not block this change. To be resolved in a later feature's contract phase.
- The exact `/auth/*` route base path and SuperTokens app/api domain values are environment-supplied (devops) — placeholders in code, real values injected at runtime; not a blocker.
