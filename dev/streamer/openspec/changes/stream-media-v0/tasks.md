## 1. Config: LiveKit env

- [x] 1.1 Extend `internal/config` with `LiveKitAPIKey`, `LiveKitAPISecret`, `LiveKitURL` (server-to-server), `LiveKitPublicURL` (browser-facing); fail-fast at startup when any is missing.
- [x] 1.2 Table-driven tests: all present ok; each one missing fails fast; assert the secret is never included in any error string.

## 2. LiveKit adapter (internal/livekit)

- [x] 2.1 Add the LiveKit Go server SDK dependency; `go mod tidy`; record the justification.
- [x] 2.2 Implement `Tokener.Sign(grant)` — sign a room-scoped access token (identity, publish/subscribe grant, `ValidFor` TTL) via the SDK.
- [x] 2.3 Implement `RoomController`: `DeleteRoom(ctx, id)` (server API) and `HasActivePublisher(ctx, id)` (ListParticipants → any participant with ≥1 published track).
- [x] 2.4 Implement webhook verification (validate the LiveKit signature, decode the event).
- [x] 2.5 Unit tests: token signs and decodes to the expected grant/identity/TTL; webhook verify accepts a correctly signed request and rejects an unsigned/tampered one. (Room API calls are exercised via fakes at the domain layer; live calls covered by build-tagged integration + container smoke.)

## 3. Token service + grant logic (internal/media)

- [x] 3.1 Implement `TokenService.Mint(ctx, id, creatorKey)`: `VerifyCreator` → 404 mapping (ErrNotFound); valid key → streamer identity=username + publish grant; absent/invalid → viewer generated id + subscribe-only grant; sign via `Tokener`; return `{token, url=LIVEKIT_PUBLIC_URL, identity, role}`.
- [x] 3.2 Direct unit tests with a fake `Tokener` capturing the grant: viewer grant has `CanPublish=false`/`CanSubscribe=true` room-scoped; streamer grant `CanPublish=true`; invalid key → viewer (no error); missing room → not-found; identity/role correct.

## 4. Room-end cascade (internal/media RoomEnder)

- [x] 4.1 Implement `RoomEnder.EndRoom(ctx, id)`: delete messages → end Valkey stream (ErrNotFound ⇒ stop) → hub CloseRoom → RoomController DeleteRoom (log+continue on LiveKit error). Idempotent.
- [x] 4.2 Unit tests with fakes: full cascade order; LiveKit-delete failure still completes the Valkey/chat teardown and returns success; ending an already-gone room is a no-op.

## 5. Publisher-aware DELETE (internal/httpapi)

- [x] 5.1 Refactor `DELETE /streams/{id}` to use `RoomEnder`; add publisher-aware auth: Exists→404; `HasActivePublisher` (fail-closed on LiveKit error) → if publisher/unknown require `Authorization: Bearer` constant-time match (else 403); if no publisher, escape-hatch authorize without a key; authorized → EndRoom → 204.
- [x] 5.2 Tests (fakes for publisher state + LiveKit): live room + valid key → 204 + cascade; live room + missing/invalid key → 403 nothing deleted; abandoned room (no publisher) + no key → 204; LiveKit-unknown → fail closed (403 without key); nonexistent → 404.

## 6. Media-token endpoint (internal/httpapi)

- [x] 6.1 Implement `POST /streams/{id}/media-token`: read `Authorization: Bearer`, call `TokenService.Mint`, map ErrNotFound→404, encode `{token,url,identity,role}`; wrong method → 405.
- [x] 6.2 Handler tests: existing room valid key → 200 streamer role + url; no/invalid key → 200 viewer role; nonexistent → 404; assert the response body carries no secret and no server-side `LIVEKIT_URL`.

## 7. Webhook + auto-reaper (internal/media Reaper, internal/httpapi)

- [x] 7.1 Implement `POST /livekit/webhook`: verify signature (reject unsigned/tampered with 4xx, no state change), decode event, dispatch to the Reaper.
- [x] 7.2 Implement `Reaper` (mutex-guarded per-room state + `time.AfterFunc` timers): creation-grace on room start; publisher-present cancels timers; publisher-left starts departure-grace; timer → `EndRoom`; `room_finished` drops state; `Shutdown()` stops all timers.
- [x] 7.3 Tests (injected clock/short graces, fake ender): publisher-left-past-grace → EndRoom; transient blip (rejoin within grace) → NOT reaped; never-gets-publisher past creation grace → EndRoom; Shutdown stops timers with no leaked goroutine; webhook handler rejects a spoofed request.

## 8. Wiring, lifecycle, docs

- [x] 8.1 Wire config → livekit client → TokenService/RoomController/RoomEnder/Reaper into `cmd/streamer/main.go`; graceful shutdown stops the reaper and closes the LiveKit client.
- [x] 8.2 Dockerfile builds with the new dependency; `.env.example` + README updated (media-token contract, DELETE change, webhook, TTL, grace windows, env vars, secret hygiene).
- [x] 8.3 Publish to devops (4 env vars + two URLs + webhook URL wiring) and to qc-portal (media-token contract); record both for the team lead.

## 9. Definition of Done gate

- [x] 9.1 `gofmt`, `go vet`, `golangci-lint` clean; `go mod tidy` no diff.
- [x] 9.2 `go test -race ./...` passes (grant logic direct-tested; reaper/webhook lifecycle race-tested); integration/container smoke of token + DELETE + webhook against a real LiveKit where feasible.
- [x] 9.3 Grep-verify the LiveKit API secret appears in no response, log, or error (AC10). Assemble the done report: what changed, tests, final TTL/grace values, full-suite output.
