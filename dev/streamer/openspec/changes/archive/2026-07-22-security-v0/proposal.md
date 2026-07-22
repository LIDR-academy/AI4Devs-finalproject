## Why

Real identity arrives, and the `creatorKey` stopgap is retired. streamer becomes a **stateless JWT verifier**: it validates `Authorization: Bearer` access tokens locally against `security`'s JWKS (no per-request call), and derives ownership, publish rights, and the STREAMER role from the authenticated user (`userId` + `username` claims). Auth gates creating streams and chatting; browsing the list, watching, and reading chat stay public. Because the session survives reload, the old creator-reload edge is finally gone.

This change covers the **streamer scope only**. The cross-scope §6 contract and the root decisions (D1–D7) are frozen in `openspec/changes/security-v0/` and are **LAW** here. The JWT claim set (`userId`, `username`) is law from day one. This is a **breaking contract change** — `creatorKey` is removed from every streamer endpoint and code path.

## What Changes

- **Local JWT verification (new)**: verify `Authorization: Bearer <access token>` statelessly against `security`'s JWKS, fetched at startup and refreshed in the background from `SECURITY_JWKS_URL` — **no per-request call** to security. Tampered/expired/wrong-signature tokens are rejected; identity flows only via the `userId`/`username` claims.
- **`POST /streams` — AUTH REQUIRED**: `401` without a valid token. Body drops `username` (from the claim): `{ "title", "description"? }`. Owner = `userId`. `409` if the user already owns an active stream (one active stream per user). Response drops `creatorKey`: `{ "id", "username", "title", "description" }` (username = the owner's account username).
- **`DELETE /streams/{id}` — AUTH REQUIRED, OWNER-ONLY**: `401` without a token, `403` when the token's `userId` ≠ the stream owner. **The creatorKey escape hatch is RETIRED** — there is no keyless delete. Cascade unchanged (messages + Valkey stream + hub close + LiveKit room). Abandoned streams are cleaned up by the reaper and by sign-out, not by a keyless delete.
- **`POST /streams/{id}/media-token` — AUTH OPTIONAL**: empty body (`creatorKey` retired). Owner (valid token, `userId` = owner) → publish+subscribe, `identity` = account username, `role` "streamer". Signed-in non-owner → subscribe-only, `identity` = account username, `role` "viewer". Anonymous (no/invalid token) → subscribe-only, generated `identity`, `role` "viewer".
- **WebSocket `join` carries optional `token`** (not `creatorKey`): valid token → `sender` = account username, `role` "streamer" if owner else "viewer", **may chat**. No/invalid token → **read-only viewer** (generated `sender`); any `message` frame is rejected with `error { reason: "auth_required" }` (invalid token = silent read-only downgrade). WS survives mid-connection token expiry (v0 simplification — verified once at join).
- **Reaper KEPT**: when the owner's media leaves past the grace window, the reaper reaps the stream — which now also **frees the user's one-stream slot** (and redirects viewers Home via the shipped room-ended broadcast). This + owner-only delete replaces the retired escape hatch (root D5).
- **Ownership model**: streams are owned by `userId`. Storage adds the owner `userId` and a per-user active-stream index (for the `409`); `creatorKey` and its constant-time verify are removed. `VerifyCreator` and the DELETE `HasActivePublisher` publisher check are deleted (no longer used).
- **New env**: `SECURITY_JWKS_URL` (fail-fast if missing).

### Non-goals

- The `security` and `users` services, SuperTokens integration, magic-link email, MongoDB, and the security↔users internal contract (security/users scopes).
- The portal auth UI, `supertokens-web-js`, sign-in/out flows, and session refresh (qc-portal scope).
- MongoDB/SuperTokens compose wiring and the SuperTokens credentials (devops/human).
- Enforcing token expiry on live WS connections (accepted v0 simplification).
- Roles/moderation/rate-limiting, profile editing, anonymous-stream migration.

## Capabilities

### New Capabilities

- `token-verification`: streamer's stateless local verification of `security`-issued Bearer JWTs against a cached, background-refreshed JWKS (`SECURITY_JWKS_URL`), exposing the `userId`/`username` claims to the request path with no per-request call to security.

### Modified Capabilities

- `stream-lifecycle-api`: `POST /streams` now requires auth, drops `username`/`creatorKey`, owns by `userId`, and `409`s a second active stream; `DELETE /streams/{id}` is auth-required owner-only and retires the escape hatch. Public `GET` shapes unchanged.
- `room-chat`: WS `join` carries `token` (not `creatorKey`); no/invalid token → read-only; `message` from a read-only connection → `error "auth_required"`. The stable-error-reasons micro-contract gains `auth_required` (non-terminal).
- `stream-media`: `POST /streams/{id}/media-token` drops `creatorKey`, auth is optional, and publish is granted only to the authenticated owner.

## Impact

- **New Go package**: `internal/auth` (JWKS-cached JWT verifier + `Claims{UserID, Username}`; confines the JWKS/JWT library).
- **Modified packages**: `internal/config` (`SECURITY_JWKS_URL`, fail-fast); `internal/stream` (owner `userId`, one-per-user index + `ErrAlreadyStreaming`, remove `creatorKey`/`VerifyCreator`, add `Owner`); `internal/valkey` (owner field + `user:{userId}:stream` index, drop creatorKey); `internal/media` (`TokenService.Mint` by ownership; `RoomEnder` frees the user index); `internal/hub` (WS join takes a token → verify → read-only vs chat, `auth_required` on message from read-only); `internal/httpapi` (auth on POST/DELETE, optional auth on media-token, remove the publisher-check/escape-hatch); `cmd/streamer` (wire the verifier; JWKS refresh goroutine cancelled at shutdown).
- **Removed**: the `creatorKey` field/credential, `stream.VerifyCreator`, and the DELETE `HasActivePublisher` escape-hatch path (dead after owner-only delete).
- **New dependency**: a standard JWKS/JWT library (blessed by the PRD; e.g. `github.com/lestrrat-go/jwx/v2`) — confined to `internal/auth`. streamer's 4th external dependency.
- **External systems**: `security` (JWKS endpoint, server-to-server at `SECURITY_JWKS_URL`). Valkey + LiveKit unchanged.
- **Cross-scope contracts (flagged, frozen — coordinated in the race)**:
  - `security → streamer`: the JWKS endpoint URL (`SECURITY_JWKS_URL`) and the exact claim set (`userId`, `username` — names, casing, location in the token payload).
  - `qc-portal ↔ streamer`: the auth transport (`Authorization: Bearer` for HTTP, `token` in the WS `join` frame) and the contract changes (401/409/403, dropped `username`/`creatorKey`, `auth_required`).
  - `devops`: the `SECURITY_JWKS_URL` env var (server-to-server URL to security's JWKS).
  - `users`: **not touched** by streamer (identity arrives only via claims).
