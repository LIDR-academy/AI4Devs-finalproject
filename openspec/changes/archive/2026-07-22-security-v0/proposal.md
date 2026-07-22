## Why

The final v0 slice: real identity. QuickChat has run on the `creatorKey` stopgap through three features; this retires it. Email magic-link auth (SuperTokens managed cloud) fronted by `security`, first-login user creation in `users` (MongoDB), and JWT-based ownership replace the throwaway key everywhere — gating stream creation and chat, keeping browse/watch/read public, and finally fixing the creator-reload edge (the session survives reload). It wakes the two dormant services (`security`, `users`) and closes v0.

Orchestration-level record for `security-v0` (PRD `prds/security-v0.md`). First all-hands, five-scope race. Builds on all three shipped features.

## What Changes

- **New `security` service (Go):** SuperTokens Passwordless (email magic link) via the SuperTokens Go SDK — `/auth/*` endpoints + a JWKS endpoint. On new session, calls `users` get-or-create by email and stamps `userId` + `username` into the access-token payload. No other service ever talks to SuperTokens. Config: `SUPERTOKENS_CONNECTION_URI`, `SUPERTOKENS_API_KEY` (human-supplied, untracked env; never logged/returned).
- **First real `users` build (Go + MongoDB):** internal-only `POST /internal/users/get-or-create {email} → {id,email,username,created}`; random word+alphanumeric username, unique, fixed for v0. Never published to the host/portal; identity reaches services only via JWT claims. **security→users trust = the compose network** (no shared secret; same model as Mongo/Valkey).
- **`streamer` contract changes (breaking — `creatorKey` retired):**
  - Verifies `Authorization: Bearer` JWTs **locally** against security's JWKS (`SECURITY_JWKS_URL`, fetched at startup + refreshed; no per-request call to security).
  - `POST /streams`: **auth required** (`401`); body drops `username` (from claims); owner = `userId`; `409` if the user already has an active stream; response has no `creatorKey`.
  - `DELETE /streams/{id}`: **auth required, owner-only** (`403` otherwise). **The no-active-publisher escape-hatch is retired** (delete is strictly owner-only now).
  - `POST /streams/{id}/media-token`: body drops `creatorKey`; auth **optional**; owner → publish+subscribe, others/anon → subscribe-only.
  - **WS** `join` carries optional `token`: valid → chat as account username (role by ownership); no/invalid → **read-only** (message frames → `error "auth_required"`; invalid = silent read-only downgrade).
  - **Reaper KEPT** (owner's media leaves past grace → reap the stream), now freeing the "one stream per user" slot. WS survives mid-connection token expiry (recorded simplification).
- **`qc-portal`:** `supertokens-web-js` header-auth mode; Home Sign in / username + Sign out; sign-in flow (email → inbox-check → magic-link landing → redirect); Start-flow **username field removed**; owner publisher experience with no key juggling (reload keeps ownership); anonymous chat shows history + a calm "Sign in to chat" affordance instead of the composer; **sign-out ends the user's active stream** (warn calmly if publishing). Visible-but-gated protected actions, per style law.
- **`devops`:** add MongoDB (internal-only) for `users`; wire security's SuperTokens vars (human-supplied, untracked env, never committed), users' Mongo vars, streamer's `SECURITY_JWKS_URL`. No SuperTokens core / mail container (managed cloud does both).
- **Scopes touched:** ALL five. This is the first all-hands race.

### Non-goals

Username/profile editing (fixed), avatars, email change; roles/moderation/bans/rate-limiting; social login/passwords/2FA; self-hosted SuperTokens core; migrating pre-auth anonymous streams (ephemeral dev data).

## Capabilities

### New Capabilities

- `auth`: magic-link authentication + identity — the `security` service (SuperTokens Passwordless, JWKS, claim stamping), `users` persistence + get-or-create, and the portal sign-in/out UX + gated actions.

### Modified Capabilities

- `home-stream-lifecycle`: `POST /streams` auth-required + username-from-claims + `409`; `DELETE` auth-required owner-only + escape-hatch retired; start-flow username field removed; Home sign-in affordance.
- `room-chat`: WS `join` carries a token; chat is auth-gated (read-only for anon; `auth_required` on message); composer replaced by a sign-in affordance for anon.
- `stream-media`: media-token drops `creatorKey`, ownership by JWT; reaper freeing the one-stream slot; escape-hatch retired.

## Impact

- **security** (new, Go): SuperTokens SDK, JWKS, claim stamping, users get-or-create call. Constitutions: `CONSTITUTION.md`, `CONSTITUTION.go.md`.
- **users** (new, Go+Mongo): persistence, get-or-create, username gen, Mongo behind an interface + fake for unit tests. Constitutions: `CONSTITUTION.md`, `CONSTITUTION.go.md`.
- **streamer**: local JWT/JWKS verification (blessed lib, e.g. `lestrrat-go/jwx`), auth on POST/DELETE/WS, media-token by ownership, `409`, escape-hatch removal, reaper retention. `CONSTITUTION.md`, `CONSTITUTION.go.md`.
- **qc-portal**: `supertokens-web-js`, session-driven UI, sign-in flow, gated actions, sign-out-ends-stream. `CONSTITUTION.md`, `CONSTITUTION.ts.md`, `CONSTITUTION.style.md`.
- **devops**: MongoDB service (internal), SuperTokens/Mongo/JWKS env wiring (untracked secrets). `CONSTITUTION.md`.
- **External systems**: SuperTokens managed cloud (new), MongoDB (new to the running env).
- **Regression**: all three shipped features must still pass under auth (AC8 sweep).
