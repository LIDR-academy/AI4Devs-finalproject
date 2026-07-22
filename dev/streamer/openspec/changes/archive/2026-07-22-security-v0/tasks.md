## 1. Config: JWKS URL

- [x] 1.1 Add `SECURITY_JWKS_URL` to `internal/config`, fail-fast if missing.
- [x] 1.2 Table-driven test: present ok; missing fails fast.

## 2. Token verification (internal/auth)

- [x] 2.1 Add the JWKS/JWT dependency (lestrrat-go/jwx/v2); `go mod tidy`; record justification.
- [x] 2.2 Implement `Verifier` over a `jwk.Cache` (register + startup warm + background refresh bound to the app context; transient failure logged, not fatal). `Verify(ctx, token)` → `Claims{UserID,Username}` via `jwt.Parse` with keyset + validate; missing claim → unauthenticated; single `ErrUnauthenticated` sentinel.
- [x] 2.3 Direct unit tests with a STUBBED JWKS (test RSA key → served JWKS): valid token verifies; tampered/expired/wrong-key/missing-claim rejected; assert the JWKS stub is hit a bounded number of times across many `Verify` calls (no per-request fetch, AC6); refresh worker stops when the context is cancelled (no leak).

## 3. Ownership storage + one-stream-per-user (internal/stream, internal/valkey)

- [x] 3.1 Retire `creatorKey`: remove the field/credential and `VerifyCreator`. `stream.Service.Create(ctx, userID, username, title, description)` validates only title/description; add `Owner(ctx, id)`.
- [x] 3.2 Valkey: `stream:{id}` stores `userid` (owner), drop `creatorKey`; add `user:{userId}:stream` index. Create via `SETNX` on the user slot → `ErrAlreadyStreaming` on conflict; write stream keys, roll back the slot on failure. Remove clears the user slot in the same transaction.
- [x] 3.3 Unit/integration tests: create sets owner + slot; second create by same user → ErrAlreadyStreaming; delete/reap frees the slot; Owner returns the userId / ErrNotFound; List/GET shapes unchanged (username still listed, never userid/creatorKey).

## 4. Auth on POST + DELETE (internal/httpapi)

- [x] 4.1 Add `authenticate(r) (auth.Claims, bool)` helper (Bearer extract + verify).
- [x] 4.2 `POST /streams`: 401 if unauthenticated; body drops username; owner = claim userId, username = claim; 409 on ErrAlreadyStreaming; 201 `{id,username,title,description}` (no creatorKey); 400 validation.
- [x] 4.3 `DELETE /streams/{id}`: 401 if unauthenticated; 404 if missing; 403 if claim userId != owner; else EndRoom → 204. Remove the publisher-check/escape-hatch entirely.
- [x] 4.4 Tests: POST authed→201 no creatorKey / no-token→401 / second→409 / bad title→400; DELETE owner→204+cascade / non-owner→403 / no-token→401 / missing→404.

## 5. Media token by ownership (internal/media, internal/httpapi)

- [x] 5.1 `TokenService.Mint(ctx, roomID, claims, authed)`: 404 missing; owner→publish identity=username; authed non-owner→subscribe-only identity=username; anon→subscribe-only generated identity. Drop creatorKey.
- [x] 5.2 Handler: optional auth; empty body. Tests (fake tokener/verifier): owner→publish grant identity=username; non-owner→subscribe-only identity=username; anon→subscribe-only generated; nonexistent→404; response carries no secret.

## 6. WS join by token + auth_required (internal/hub)

- [x] 6.1 `join` frame takes optional `token`; hub verifies via `Verifier` + `Owner` lookup: valid→sender=username, role=owner?streamer:viewer, canChat=true; no/invalid→read-only viewer (generated sender), canChat=false. Remove `Authenticator`/VerifyCreator.
- [x] 6.2 `message` from a read-only connection → `error {reason:"auth_required"}` (non-terminal, connection stays open); pin `auth_required` as a hub constant in the non-terminal set.
- [x] 6.3 Tests (fake verifier + owner): owner-token→streamer can chat; non-owner-token→viewer can chat; no/invalid token→read-only; read-only message→auth_required stays open; broadcast reaches read-only viewers; -race + leak-free lifecycle preserved.

## 7. Wiring, lifecycle, docs

- [x] 7.1 Wire config → auth.Verifier (JWKS cache) → httpapi/media/hub in `cmd/streamer/main.go`; the JWKS refresh worker is bound to the app context and stops at shutdown.
- [x] 7.2 Remove now-dead `HasActivePublisher` from the RoomController interface + livekit impl + Deps.
- [x] 7.3 Dockerfile builds; `.env.example` + README updated (auth transport, 401/403/409, creatorKey retired, media-token optional auth, WS token + auth_required, SECURITY_JWKS_URL). Publish to security (claim set + JWKS URL), qc-portal (auth transport + contract), devops (SECURITY_JWKS_URL); record for the team lead.

## 8. Definition of Done gate

- [x] 8.1 `gofmt`, `go vet`, `golangci-lint` clean; `go mod tidy` no diff.
- [x] 8.2 `go test -race ./...` passes; token-verify direct-tested with a stubbed JWKS (tampered/expired rejected, AC6); WS/hub race-tested; regression sweep — all prior features still pass their suites under auth (AC8).
- [x] 8.3 Grep-verify no security secret in any response/log (the JWKS is public; no key reaches streamer). Assemble the done report: what changed, tests, final jwx version + refresh interval, full-suite output.
