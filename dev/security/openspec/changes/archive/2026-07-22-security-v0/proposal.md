## Why

QuickChat has run on the `creatorKey` stopgap through three shipped features; `security-v0` retires it by introducing real identity. This change stands up the `security` service — the authentication and token authority — as a greenfield Go service. It fronts SuperTokens managed cloud for email magic-link auth, exposes a JWKS endpoint so `streamer` can verify tokens statelessly, and stamps a durable identity (`userId`, `username`) into every access token so ownership across the platform derives from the authenticated user instead of a throwaway key.

This proposal covers the **security scope only**. It is the security service's own per-feature record, derived from PRD `prds/security-v0.md` §5.1 and §6 (wire contract — LAW) and the team lead's orchestration record `openspec/changes/security-v0/`.

## What Changes

- **New `security` Go service.** Greenfield: `cmd/` entrypoint + `internal/` packages, its own `go.mod`, README, and multi-stage Dockerfile (config from env, no baked secrets).
- **SuperTokens Passwordless integration** via the official SuperTokens Go SDK. `security` is the **only** service that ever talks to SuperTokens.
- **Standard `/auth/*` endpoints** (SDK-provided): request magic link, consume link, session refresh, sign-out, session info.
- **JWKS endpoint** (SDK-provided) so `streamer` verifies access tokens locally with no per-request call back to security.
- **Header transfer mode** (`Authorization: Bearer <access token>`) — not cookies.
- **First-login identity stamping.** On a new session, `security` calls `users` `POST /internal/users/get-or-create { email } → { id, email, username, created }` and stamps the returned `userId` (the users-service id — what `streamer` uses for ownership) and `username` into the access-token payload as claims, via the SuperTokens claim-override mechanism.
- **Config from env:** `SUPERTOKENS_CONNECTION_URI`, `SUPERTOKENS_API_KEY` (human-supplied, untracked), plus app/api domain settings. The API key **never** appears in any response, log, or committed file.
- **security→users trust = the compose network.** No shared secret in v0 (D3); the internal call is trusted by network isolation.

### Cross-scope wire contracts (flagged; resolved before implementation, per §6 LAW)

- **security ↔ users:** the internal `get-or-create` contract shape is finalized **with the `users` teammate** at delegation time (body `{ email }` → `{ id, email, username, created }`). security consumes it; users owns it.
- **security → streamer:** the JWT claim set (`userId`, `username`) and the **JWKS URL** are published to `streamer` — law from day one; streamer verifies statelessly against it (`SECURITY_JWKS_URL`).
- **security → devops:** the env var names (`SUPERTOKENS_CONNECTION_URI`, `SUPERTOKENS_API_KEY`, app/api domain, service port) are published to `devops` for compose wiring; values are human-supplied via an untracked env file, never committed.

### Non-goals

- Self-hosted SuperTokens core (managed cloud only for v0).
- Username/profile editing (username is fixed for v0; security only stamps what `users` returns), avatars, email change.
- Roles, moderation, bans, rate limiting.
- Social login, passwords, 2FA — passwordless magic link only.
- Issuing room/media tokens for LiveKit (the OPEN question of who issues the LiveKit token is not resolved here; this change stamps identity claims only).
- Any change to `users`, `streamer`, `qc-portal`, or `devops` code — those are owned by their teammates against the shared contract.

## Capabilities

### New Capabilities

- `magic-link-auth`: SuperTokens Passwordless sign-in/sign-out fronted by security — `/auth/*` endpoints, header Bearer transport, security as sole SuperTokens client, API key kept out of every response/log/committed file.
- `identity-stamping`: first-login get-or-create call to `users` and stamping `userId` + `username` into the access-token claims via SuperTokens claim override.
- `jwks-publication`: exposing the JWKS endpoint so streamer verifies access tokens statelessly, with no per-request call to security.

### Modified Capabilities

<!-- None. The security service is greenfield; it has no prior spec whose requirements change. Cross-scope contract changes (streamer's API, creatorKey retirement) are owned and recorded by those teammates' own openspec, against the shared §6 contract. -->

## Impact

- **New code:** `dev/security/` — Go service (`cmd/`, `internal/`), `go.mod`, README, multi-stage Dockerfile.
- **New dependency:** the official SuperTokens Go SDK (`supertokens/supertokens-golang`) — the blessed way to integrate SuperTokens; justified because implementing Passwordless + session + JWKS by hand is out of scope and error-prone.
- **External system:** SuperTokens managed cloud (new to the running environment).
- **APIs exposed:** `/auth/*` (SDK shapes), JWKS endpoint.
- **APIs consumed:** `users` `POST /internal/users/get-or-create` (compose-internal).
- **Config:** `SUPERTOKENS_CONNECTION_URI`, `SUPERTOKENS_API_KEY`, app/api domain, service port — all from env.
- **Consumers depending on this change:** `streamer` (JWKS URL + claim set), `qc-portal` (login flow via `/auth/*`), `devops` (env wiring).
- **Constitutions in force:** `CONSTITUTION.md`, `CONSTITUTION.go.md`.
