## Why

`security-v0` wakes the dormant `users` service: real identity needs a durable home. On a user's first magic-link login, `security` must turn a verified email into a stable QuickChat identity (`userId` + `username`) that becomes the basis for stream ownership and chat identity across the platform. This change stands up `users` as the single source of truth for that identity, backed by MongoDB, exposed only inside the compose network.

This is the `users` deliverable of `security-v0` (PRD `prds/security-v0.md` §5.2, §6; root record `openspec/changes/security-v0/`). It belongs entirely to the **users** scope.

## What Changes

- **New `users` Go service** persisting user records to **MongoDB**.
- **New internal HTTP endpoint** (the `security -> users` wire contract, frozen in PRD §5.2/§6):
  ```
  POST /internal/users/get-or-create
    body: { "email": string }
    → 200 { "id": string, "email": string, "username": string, "created": bool }
  ```
  - **Idempotent by email**: the first call for a never-seen email creates exactly one record and returns `created: true`; every subsequent call for that email returns the same record (same `id`, same `username`) with `created: false`. `security` retrying the command never produces a duplicate user.
  - `id` is the **users-service (Mongo) id** — the value `security` stamps as the `userId` JWT claim and the platform uses for ownership (not SuperTokens' internal id; per root design D3).
  - `username` is a random **word+alphanumeric** string (same style as ephemeral chat ids), **unique**, and **fixed for v0** — there is no update endpoint.
- **Internal-only exposure**: the service listens only on the compose network and is **never published to the host or portal**. Trust is the network boundary — no shared secret in v0 (root design D3). Identity reaches other services only via JWT claims minted by `security`.
- **MongoDB behind a small interface** with a hand-written fake, so unit tests run with no database. Integration tests that hit a real MongoDB are **separated from the default `go test ./...` run** (build tag / dedicated path).
- **Config from the environment** (Mongo connection, listen address); no credentials baked into code or image. **No PII is ever logged.**
- **Service Dockerfile** (multi-stage Go build → static binary on a minimal image), consumed by `devops`.

**Cross-scope contracts (resolved before implementation, not during):**
- `security -> users` get-or-create shape — frozen in the PRD; being confirmed directly with `security` (payload, the `id`-is-Mongo-id semantics, and the failure/error-status contract).
- Mongo env var names + the users service's internal listen port — **confirmed with `devops`**: `MONGO_URI` (full connection string incl. dev auth), `MONGO_DB` (`quickchat`), `USERS_HTTP_ADDR` (`:8080`); Mongo is service `mongo:27017`, internal-only, ephemeral.

## Capabilities

### New Capabilities
- `user-persistence`: durable QuickChat user identity in MongoDB, exposed via the internal, idempotent get-or-create endpoint; owns the user document shape, username generation, and the uniqueness guarantee.

### Modified Capabilities
<!-- None. The users scope has no pre-existing specs; this is a greenfield capability. -->

## Impact

- **New service** in `dev/users/`: `cmd/`, `internal/` domain package(s), MongoDB repository behind an interface + hand-written fake, config loader, HTTP handler, Dockerfile, README. Constitutions: `CONSTITUTION.md`, `CONSTITUTION.go.md`.
- **New external system in the running env**: MongoDB (added to compose by `devops`).
- **Consumers**: `security` is the only caller of the internal endpoint. No other service talks to `users` directly.
- **Non-goals (v0):** username/profile editing (username is fixed — no update endpoint), avatars, email change; any public/host-exposed API; authentication or a shared secret on the internal endpoint (network isolation is the trust boundary for v0); roles/permissions; migrating pre-auth anonymous data.
