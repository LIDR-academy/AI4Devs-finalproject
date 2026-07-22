## Context

streamer's implementation design for its slice of `security-v0`. The §6 contract and root decisions (D1–D7) are frozen in `openspec/changes/security-v0/` and are LAW — this records the streamer-internal *how* and my D7 calls. It builds on the three shipped features and **retires `creatorKey`** across all of them. Constitutions: `CONSTITUTION.md` + `CONSTITUTION.go.md`. Token verification gets direct unit tests against a stubbed JWKS (tampered/expired/wrong-key/missing-claim rejected — AC6); the JWKS refresh worker has a defined stop path; `-race` throughout. No SuperTokens API key or secret ever reaches streamer (only the public JWKS does).

## Goals / Non-Goals

**Goals:** stateless local JWT verification (no per-request security call); ownership by `userId`; auth gates create + chat while browse/watch/read stay public; the creator-reload edge gone; no user lockout (reaper + owner-only delete replace the escape hatch).

**Non-Goals:** security/users services, SuperTokens, the portal auth UI, Mongo/compose wiring; enforcing token expiry on live WS connections (v0 simplification).

## Decisions

### D-A — JWKS/JWT library (my D7 call)
`github.com/lestrrat-go/jwx/v2` — the blessed standard Go JWT/JWKS library. Its `jwk.Cache` fetches the JWKS once and refreshes it in the background on a context-bound worker (the stop path), and `jwt.Parse(..., jwt.WithKeySet(set), jwt.WithValidate(true))` verifies signature + expiry in one call. Confined to `internal/auth` behind a `Verifier` interface so handlers and tests never import it. Final version recorded in the done evidence.

### D-B — internal/auth: the verifier
```
type Claims struct { UserID, Username string }
type Verifier interface { Verify(ctx, token string) (Claims, error) }
```
- Construction: `jwk.NewCache(ctx)` + `cache.Register(jwksURL, jwk.WithMinRefreshInterval(15*time.Minute))`; the `ctx` is the app context, cancelled at shutdown → the refresh worker stops (no leaked goroutine). An initial `cache.Refresh(ctx, url)` warms it at startup; a transient failure is logged, not fatal (tokens are then treated as unauthenticated until the JWKS loads — protected actions gated, never wrongly accepted).
- `Verify`: `set, _ := cache.Get(ctx, url)` (cached — no network per call); `jwt.Parse([]byte(token), jwt.WithKeySet(set), jwt.WithValidate(true))` → signature + exp/nbf checked; read `userId` + `username` private claims (both required, non-empty). Any failure → a single `ErrUnauthenticated` sentinel (callers never branch on the reason). AC6 "no per-request call" is provable: the JWKS stub server counts requests and stays flat across many `Verify` calls.

### D-C — HTTP auth helper (per-endpoint, not blanket middleware)
Endpoints differ (required / optional / owner-only), so a small helper `authenticate(r) (auth.Claims, bool)` extracts the Bearer token and verifies; `ok=false` means anonymous/invalid. Each handler applies its own rule:
- `POST /streams`: `!ok → 401`.
- `DELETE /streams/{id}`: `!ok → 401`; then owner check (`claims.UserID == stream owner` else `403`).
- `POST /streams/{id}/media-token`: optional — `ok` drives owner/username, `!ok` → anonymous viewer.

### D-D — Ownership storage & one-stream-per-user (root D4/D5)
Retire `creatorKey`; own by `userId`. Valkey model:
- `stream:{id}` HASH gains `userid` (owner); `creatorKey` field removed.
- `user:{userId}:stream` STRING = the user's active stream id — the one-per-user index.
- **Create is atomic on the slot**: `SETNX user:{userId}:stream = id`; if it returns 0 (already set) → `ErrAlreadyStreaming` → `409`. On success, write the stream keys; if that write fails, `DEL` the user key to avoid orphaning the slot.
- **End/reap** reads the stream's `userid`, then in one transaction `SREM streams`, `DEL stream:{id}`, `DEL user:{userid}:stream` — freeing the slot. This makes the reaper (owner media left past grace → `EndRoom`) free the user's slot, per root D5.
- `stream.Service.Create(ctx, userID, username, title, description)` (username from the claim, trusted — only `title`/`description` validated); `Owner(ctx, id) (userID string, err)`; `VerifyCreator` and the `creatorKey` generation are deleted.

### D-E — DELETE loses the escape hatch (root D5)
The publisher-aware branch (`HasActivePublisher` + keyless escape) is removed; `DELETE` is strictly auth + owner-only. `RoomController.HasActivePublisher` and its LiveKit implementation are deleted (dead code after this). `RoomEnder` keeps its cascade and now also frees the user slot (via the store change in D-D). The reaper is unchanged in mechanism and still calls `EndRoom`.

### D-F — Media token by ownership (stream-media MODIFIED)
`TokenService.Mint(ctx, roomID, claims, authed)`: room exists else `404`; if `authed` and `claims.UserID == Owner(roomID)` → publish, identity = `claims.Username`; if `authed` non-owner → subscribe-only, identity = `claims.Username`; if anonymous → subscribe-only, generated identity. `creatorKey` is gone from the signature and the request body.

### D-G — WS join by token (room-chat MODIFIED)
The `join` frame carries optional `token` (not `creatorKey`). The hub verifies it via the `Verifier`:
- valid → `sender` = username claim, `role` = streamer if `userId == Owner`, else viewer, `canChat = true`.
- no/invalid → `sender` = generated viewer id, `role` viewer, `canChat = false` (read-only).
A `message` frame from a `canChat=false` connection → `error { reason: "auth_required" }` (non-terminal; connection stays open). Token is verified once at join; mid-connection expiry is not enforced (v0). The hub gains a `Verifier` and an `Owner`-lookup dependency (both interfaces); `Authenticator`/`VerifyCreator` is removed.

### D-H — `auth_required` joins the stable-reason micro-contract
`auth_required` is added as a NON-TERMINAL reason (connection stays open), and pinned as a hub constant alongside the existing reasons, so qc-portal's terminal/transient matcher stays correct.

### D-I — Config & secret hygiene
`internal/config` gains `SECURITY_JWKS_URL` (fail-fast if missing). streamer never sees the SuperTokens API key or any security secret — only the public JWKS. Grep evidence confirms no security secret in responses/logs (there is none to leak; the JWKS is public).

## Risks / Trade-offs

- **Breaking change ripples through three baselines** → handled as MODIFIED requirements; my own test suites are updated in lockstep and the regression sweep (AC8) re-verifies prior behavior under auth.
- **JWKS unavailable at startup** → tolerated (warn + background retry); protected actions gate (401) until keys load, never accept unverified tokens. Fail-fast only on a missing/malformed `SECURITY_JWKS_URL` (config).
- **Claim names/shape** → `userId` + `username` are LAW, but their exact casing and location in the SuperTokens payload is a coordination item with `security` (flagged); a mismatch is caught by the integration test once security is up.
- **One-stream-per-user race** → the `SETNX` slot makes concurrent creates by one user resolve to a single stream + `409`.
- **No per-request security call** → the `jwk.Cache` guarantees it; asserted by counting JWKS-stub hits across many verifies.
- **WS token expiry not enforced mid-connection** → accepted v0 simplification (recorded); new joins need a fresh token.

## Migration Plan

Breaking, additive-then-swap within streamer: add `internal/auth` + config; change storage (owner `userid` + user index, drop creatorKey); thread auth through POST/DELETE/media-token/WS; delete `VerifyCreator` + the DELETE escape-hatch/`HasActivePublisher`. Build order: (1) config + `internal/auth` with stubbed-JWKS tests; (2) stream storage/ownership + one-per-user; (3) POST/DELETE auth; (4) media-token by ownership; (5) WS join-by-token + `auth_required`; (6) wire verifier in `cmd`, refresh worker stop path; (7) Docker/env/README + grep evidence + regression sweep. security stands up SuperTokens + JWKS and users the Mongo store; devops wires `SECURITY_JWKS_URL`; the full auth E2E runs once SuperTokens creds land. Feature pending until reported done with `go test -race ./...` + vet + lint.

## Open Questions

None blocking. D7 calls recorded, finalized in evidence: JWKS lib `lestrrat-go/jwx/v2`; JWKS min-refresh 15m; grace windows unchanged (departure 30s / creation 2m). Coordination for the race: claim set + JWKS URL with security; auth transport + contract changes with qc-portal; `SECURITY_JWKS_URL` with devops.
