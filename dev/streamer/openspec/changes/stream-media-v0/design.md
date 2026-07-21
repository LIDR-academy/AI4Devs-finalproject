## Context

streamer's implementation design for its slice of `stream-media-v0`. The cross-scope §6 contract and root decisions (D1–D9) are frozen in `openspec/changes/stream-media-v0/` and are LAW — this records the streamer-internal *how* and the D9 calls delegated to me. It builds on shipped `home-stream-lifecycle-v0` + `room-chat-v0` (config, stream/chat/valkey/hub/httpapi, creator-only `Authorization: Bearer` DELETE, the room-ended broadcast). Constitutions: `CONSTITUTION.md` + `CONSTITUTION.go.md`. Token-grant logic gets direct unit tests; the webhook/reaper lifecycle has defined goroutine stop paths; `-race` throughout. The LiveKit API secret is grep-verified absent from responses/logs/errors (AC10).

## Goals / Non-Goals

**Goals:** mint LiveKit tokens with server-enforced publish grants; delete the LiveKit room on stream end; ingest signature-verified webhooks and auto-reap abandoned rooms; keep the LiveKit SDK confined; no leaked goroutines from reaper timers.

**Non-Goals:** the portal media UI and `livekit-client`; the LiveKit compose service / UDP strategy / webhook URL wiring (devops); server-side presence as stream status; screen share / multi-publisher.

## Decisions

### D-A — Package layout
- `internal/livekit` — the only importer of the LiveKit SDK. Implements: `Tokener` (sign an access token from a grant), `RoomController` (`DeleteRoom`, `HasActivePublisher`), and webhook verification (validate the signature, decode the event). Confines `github.com/livekit/server-sdk-go/v2` + `github.com/livekit/protocol` (`auth`, `webhook`).
- `internal/media` — transport-agnostic domain: `TokenService` (decide identity/role/grant from creatorKey validity via `stream.Service`, then sign via a `Tokener`), the shared `RoomEnder` (the end-room cascade), and the `Reaper` (webhook-driven grace timers). Testable with fakes for `Tokener`/`RoomController`.
- `internal/httpapi` — new `POST /streams/{id}/media-token` and `POST /livekit/webhook` handlers; MODIFIED `DELETE` (publisher-aware auth → `RoomEnder`).
- `internal/config` — four LiveKit env vars, fail-fast.

### D-B — LiveKit dependency (blessed, D9/PRD)
`github.com/livekit/server-sdk-go/v2` (+ its `github.com/livekit/protocol` `auth`/`webhook` packages) — the official SDK, blessed by the PRD; hand-rolling JWT grants, room RPC, or webhook signature verification is a boring-code violation. Confined to `internal/livekit` behind the `Tokener`/`RoomController` interfaces so the domain and its tests never import it.

### D-C — Token minting and grants (D1, §6)
`TokenService.Mint(ctx, roomID, creatorKey)`:
1. `stream.Service.VerifyCreator(roomID, key)` → `ErrNotFound` ⇒ `404` (no LiveKit room is created — minting a token does not create a room; LiveKit auto-creates on first join, and we never call the room API here).
2. Match ⇒ `identity = username`, `role = streamer`, grant `{RoomJoin, Room: id, CanPublish: true, CanSubscribe: true}`. Non-match/absent ⇒ `identity = chat.NewViewerID()`, `role = viewer`, grant `{RoomJoin, Room: id, CanPublish: false, CanSubscribe: true}`.
3. Sign via `Tokener` with `ValidFor(tokenTTL)`; return `{token, url = LIVEKIT_PUBLIC_URL, identity, role}`.
The grant is always room-scoped. Direct unit tests assert viewer grant `CanPublish=false` and streamer grant `CanPublish=true` (AC3/AC6) using a fake `Tokener` that captures the grant.

### D-D — Token TTL (my D9 call)
**1 hour.** Long enough for a normal session, short enough to bound a leaked token. Documented in the README; a refresh is a future concern (portal re-fetches on reconnect if needed).

### D-E — DELETE authorization is publisher-aware (D4 escape hatch, D6)
The MODIFIED `DELETE` handler:
1. `stream.Service.Exists` → `404` if not live.
2. `RoomController.HasActivePublisher(ctx, id)` — authoritative live query (LiveKit `ListParticipants`; a publisher is a participant with ≥1 published track). On a LiveKit error, **fail closed**: treat as "has publisher" (require the key).
3. If has-publisher (or unknown): require `Authorization: Bearer` and constant-time match, else `403`. If no-publisher: authorize without a key (escape hatch).
4. Authorized ⇒ `RoomEnder.EndRoom(ctx, id)`.
`HasActivePublisher` is a live query (not webhook-derived) so the escape-hatch decision is authoritative even if a webhook was missed; the reaper (webhook-derived) is the async backstop — the two cover each other (design Risks).

### D-F — RoomEnder: one cascade, two callers (DRY)
`RoomEnder.EndRoom(ctx, id)` is the single teardown, called by both the DELETE handler and the Reaper:
1. `chat.DeleteRoom(id)` (messages) → 2. `stream.End(id)` (Valkey stream; `ErrNotFound` ⇒ already gone, stop) → 3. `hub.CloseRoom(id)` (room-ended broadcast + close chat conns) → 4. `RoomController.DeleteRoom(id)` (LiveKit; on error, log and continue — the Valkey delete stands, per D6). Messages first so a failure aborts before the stream is removed (no leak), matching the shipped order.

### D-G — Reaper: webhook-driven grace timers (D4/D5)
`internal/media.Reaper` tracks per-room state under a `sync.Mutex`: whether a publisher is present and a pending reap timer. Driven by verified webhook events:
- `room_started` (or first participant) → start a **creation-grace** timer.
- participant joined whose identity == the stream's username (the publisher, looked up via `stream.Store`) → mark publisher present, cancel any pending timer.
- publisher participant left → start a **departure-grace** timer.
- timer fires → `RoomEnder.EndRoom` and drop the room's state.
- `room_finished` / successful end → drop state, stop timer.
Timers use `time.AfterFunc` (each returns a `*time.Timer` stored in the room state and `Stop()`-ed on cancel/shutdown) — no long-lived goroutine to leak; `Reaper.Shutdown()` stops every pending timer. This honors Constitution §5 (defined owner + stop path; no context stored in a struct — the reap uses a fresh bounded context per fire).

### D-H — Grace windows (my D9 calls)
- **Departure grace: 30s** — covers a reconnect blip (PRD reconnect behavior) without leaving a dead room around long.
- **Creation grace: 120s** — the creator has time to grant camera/mic permission and hit Go live before an unused room is reaped.
Both documented in the README; both env-overridable is a future nicety, hardcoded constants for v0 (Constitution §2 — no speculative config).

### D-I — Webhook authentication (Constitution §10)
`POST /livekit/webhook` verifies the LiveKit signature via the SDK's webhook receiver (keyed by `LIVEKIT_API_KEY`/`SECRET`) before acting — an unsigned/spoofed request is rejected with a `4xx` and changes no state. The endpoint is server-to-server (devops points LiveKit at streamer's internal URL); it is not browser-facing and carries no CORS.

### D-J — Config + secret hygiene (AC10)
`internal/config` reads the four LiveKit vars, fail-fast on any missing. The secret is used only to sign tokens and verify webhooks; it is never logged, never in a response, never in an error. Only `LIVEKIT_PUBLIC_URL` crosses `/media-token`; `LIVEKIT_URL` (server-side) and the secret never do. A `grep`-style check over the built binary/logs for the secret is part of the done evidence.

## Risks / Trade-offs

- **Webhook missed** → the DELETE escape hatch queries LiveKit live (not webhook state), and the creation-grace reaper backstops a room that never went live; the two mechanisms cover each other.
- **`HasActivePublisher` LiveKit round-trip on DELETE** → adds latency + a dependency to DELETE; mitigated by failing closed (require key) on error, so a LiveKit outage never lets an unauthorized delete through.
- **Reaper timer races** (publisher rejoins as a timer fires) → all state transitions under one mutex; `EndRoom` is idempotent (`stream.End` ErrNotFound ⇒ no-op), so a late reap after a manual delete is harmless.
- **Real-WebRTC E2E is hard to automate** → my scope is server-side; I unit-test the grant logic and reaper with fakes, and prove the token/delete/webhook endpoints via container smoke; the full fake-media browser E2E (AC2/AC5/AC9) is qc-portal + devops.
- **Secret leakage** → confined to `internal/livekit`; grep-verified absent from responses/logs (AC10).

## Migration Plan

Additive: one new endpoint, one MODIFIED delete, a new webhook endpoint, a new dependency, four new env vars; no data migration. Build order: (1) config + `internal/livekit` (Tokener/RoomController/webhook verify) with fakes; (2) `internal/media` TokenService + grant unit tests; (3) RoomEnder cascade + refactor DELETE to use it; (4) publisher-aware DELETE auth; (5) Reaper + webhook handler; (6) wire in `cmd`, shutdown stops the reaper; (7) Docker/env/README + grep evidence. devops stands up LiveKit + the webhook wiring and proves the browser media E2E once the portal lands. Feature pending until reported done with `go test -race ./...` + vet + lint evidence.

## Open Questions

None blocking. My D9 calls (token TTL 1h; departure grace 30s; creation grace 120s; `HasActivePublisher` = a participant with ≥1 published track) are recorded here and finalized in the evidence. Coordination for the race: the media-token contract with qc-portal; the four env vars + two URLs + the webhook URL wiring with devops.
