# PRD — Stream Media v0 (Video & Audio)

- **Feature ID**: `stream-media-v0`
- **Status**: Approved by human
- **Depends on**: `home-stream-lifecycle-v0`, `room-chat-v0` (shipped)
- **Scopes involved**: `qc-portal`, `streamer`, `devops`
- **Scopes NOT involved**: `security`, `users` (must not be touched)
- **Constitutions in force**: `CONSTITUTION.md`, `CONSTITUTION.ts.md` (qc-portal),
  `CONSTITUTION.go.md` (streamer), `CONSTITUTION.style.md` (qc-portal)

## 1. Summary

The camera placeholder dies: real video and audio via a self-hosted **LiveKit
SFU** (WebRTC), per the C4 model. The stream creator publishes camera + mic;
everyone else subscribes. `streamer` becomes the gatekeeper: it mints LiveKit
access tokens, granting publish rights only to a valid `creatorKey`. devops adds
the LiveKit server to compose in dev mode.

## 2. Goals

- The creator can go live with camera and microphone from the room page.
- Viewers see and hear the stream in the 2/3 camera area.
- Publish permission is enforced server-side via token grants — never by the client.
- LiveKit runs locally as part of the compose environment.

## 3. Non-Goals (explicitly out of scope)

- Screen share, co-hosts, viewer cameras — **one publisher per room**.
- Manual quality picker — LiveKit defaults + simulcast; the SFU adapts.
- Recording, egress, thumbnails, stream previews on Home.
- Publisher-presence tracking: "live" still means "room exists in Valkey".
  A listed room with no video yet is valid. Presence/status is a future feature.
- Production-grade LiveKit deployment (TURN, TLS, real keys, host networking).
  **Recorded as a future devops feature.** v0 is dev-mode, localhost-oriented.
- Auth. `creatorKey` remains the stopgap; security replaces it later.

## 4. Decisions on Record

- **Self-hosted LiveKit**, official `livekit/livekit-server` image, single node,
  **dev mode** (`--dev` / dev config): default API key/secret pattern, published
  ports (7880 WS signaling, 7881 TCP fallback, UDP media ports), no Redis
  (single node; Valkey is Redis-compatible if multi-node ever comes).
- **streamer mints tokens.** The LiveKit API secret lives only in streamer's
  environment. The portal never sees it.
- Grants: valid `creatorKey` → publish + subscribe. Otherwise → subscribe-only.
- Media: **camera + microphone only**.
- **Creator reload edge accepted**: reload loses `creatorKey` (memory-only) →
  creator becomes subscribe-only → nobody can publish to that room until it is
  ended and recreated. Documented loudly; not a bug; purity kept for v0.
- Viewers start **muted** with a tap-to-unmute affordance (browser autoplay
  policy — not negotiable, do not fight it).
- Dependencies blessed: `livekit-client` (portal), LiveKit server SDK for Go
  (streamer, token signing). Official SDKs only; hand-rolled WebRTC is a
  boring-code violation.

## 5. Functional Requirements

### 5.1 streamer

**Token endpoint** (contract §6):

- `POST /streams/{id}/media-token`, optional `creatorKey` in the body.
- Room must exist in Valkey → else `404`. Never create LiveKit rooms for
  nonexistent streams.
- Valid `creatorKey` → token with publish + subscribe, identity = stream
  username. Invalid/absent key → subscribe-only token, identity = a generated
  word+alphanumeric id (same generator as chat). Invalid key is **not** an
  error — silent viewer downgrade, same doctrine as chat.
- Response includes the LiveKit URL the browser should connect to
  (from env, e.g. `LIVEKIT_PUBLIC_URL`) — the portal hardcodes nothing.
- Token TTL: short (e.g. 1h, streamer's choice, documented in its openspec).

**End stream** (`DELETE /streams/{id}`) gets teeth:

- In addition to Valkey deletion (stream + messages), streamer deletes the
  LiveKit room via the server API → all participants are disconnected.
  LiveKit unreachable → the delete still succeeds for Valkey and the error is
  logged; the room dies with its token source anyway.

**Config via env** (provided by compose): `LIVEKIT_API_KEY`,
`LIVEKIT_API_SECRET`, `LIVEKIT_URL` (server-to-server), `LIVEKIT_PUBLIC_URL`
(browser-facing). The secret never appears in any response, log, or error.

### 5.2 qc-portal

**Creator flow (has `creatorKey` in memory)**

- Arriving at `/stream/{id}`: a **pre-join step** in the camera area — camera/mic
  permission prompt, local preview, then an explicit **Go live** action.
  No auto-publish; nobody goes on air by accident.
- While live: minimum controls — **mute mic** and **camera off** toggles
  (placement per style law). End stream button remains.

**Viewer flow**

- Fetch token (no key) → connect → render the publisher's video + audio in the
  camera area, **starting muted** with a calm tap/click-to-unmute affordance.
- No publisher currently on air → calm **offline state** (quiet text on
  `gray-fill`, teammate's wording — not a spinner, nothing pulsing).
  Publisher appears → video replaces it; publisher leaves → back to offline.

**Both**

- Layout from `room-chat-v0` is unchanged: media fills the 2/3 area (or the
  expanded area when chat is toggled). Chat and media are independent — a WS
  chat drop must not tear down the media connection, and vice versa.
- Media connection drop: quiet reconnect with simple backoff, mirroring the
  chat pattern. Reconnecting state is calm; no alarm styling.
- `livekit-client` handles WebRTC; no manual SDP/ICE code anywhere.

### 5.3 devops

- New compose service: `livekit` (official `livekit/livekit-server` image),
  dev-mode configuration, published ports: 7880, 7881, and the UDP media
  port/range per LiveKit docs. No Redis. No TLS/TURN.
- Provide streamer's four LiveKit env vars; dev key/secret live in compose env,
  clearly marked dev-only.
- Known caveat (documented in the environment README): full host-networking
  setups are Linux-only; the dev-mode published-ports approach is the
  supported local path. If localhost media fails on some platform, devops
  investigates config first (this is the expected fiddly zone).
- Read-only on all code, as always.

## 6. Wire Contract — Law

One new endpoint; everything from `room-chat-v0` is unchanged.

```
POST /streams/{id}/media-token
  body: { "creatorKey"?: string }
  → 200 {
      "token": string,          // LiveKit access token (JWT)
      "url": string,            // browser-facing LiveKit URL
      "identity": string,       // username (creator) or generated id
      "role": "streamer" | "viewer"   // mirrors the grant; server-stamped
    }
  → 404 if the stream doesn't exist
```

- The portal treats `token` and `url` as opaque and passes them to
  `livekit-client`. It must not parse the JWT.
- `role` here and chat `role` share semantics; the client renders, never decides.
- The LiveKit API secret and server-side URL never cross this boundary.

## 7. Style Requirements (qc-portal)

`CONSTITUTION.style.md` applies in full. Feature-specific checks:

- Video surface: 0 radius, no decorative chrome, no overlays fighting the
  content. Controls (mute/camera/go-live/unmute) are standard buttons per
  style §6 — visible focus states, calm hovers.
- Offline / pre-join / reconnecting states: quiet text on `gray-fill`; mono
  labels where technical flavor fits; nothing animated except allowed
  opacity/color transitions.
- Tap-to-unmute affordance must pass AA contrast over video: use a solid
  `ink`/`paper` element, never translucent text floating on video.

## 8. Acceptance Criteria

1. `docker compose up` brings up Valkey + streamer + LiveKit; the whole flow
   works end to end on localhost.
2. Creator: pre-join preview → Go live → their camera/mic reach a second
   browser, which sees/hears after unmuting. Video renders in the 2/3 area and
   in the expanded area when chat is toggled.
3. Viewer without key gets a subscribe-only token; any publish attempt is
   rejected by LiveKit (verified in test — not by trusting the UI).
4. Invalid `creatorKey` → silent viewer token; `404` for nonexistent rooms;
   no LiveKit room is created for a nonexistent stream.
5. Mute mic / camera off work live (verified from the viewer side).
6. Creator reload: they return as a viewer; the room continues but no one can
   publish — documented behavior, asserted in a test at the token level.
7. End stream disconnects all participants, deletes the LiveKit room, and
   preserves all v0/chat delete semantics (Valkey stream + messages gone).
8. Chat and media are independent: killing one connection leaves the other
   functioning.
9. Viewer joining before the publisher sees the offline state; it transitions
   to video when publishing starts, and back when it stops.
10. The LiveKit secret appears nowhere in portal code, network responses, or
    logs (grep-verified in streamer's evidence).
11. Full suites pass with evidence: `bun test`; `go test -race ./...` +
    `go vet` + linter. Token-grant logic has direct unit tests.
12. qc-portal's done report explicitly states style-law compliance.

## 9. Delegation Plan (team lead)

- Record in openspec as `stream-media-v0`; note the new endpoint as a contract
  addition (no changes to existing endpoints).
- Three deliverables: streamer (§5.1, §6), qc-portal (§5.2, §7), devops (§5.3).
- Suggested internal order: devops's LiveKit service and streamer's token
  endpoint unblock qc-portal's integration testing — but sequencing remains
  self-organized; the contract lets everyone start immediately (portal can
  build against the contract shape before the environment is live).
- Teammates run their own openspec workflows; direct coordination allowed,
  lead always informed. Pending until all three report done with evidence.
  **The human has the final word on shipped.**

## 10. Resolved Decisions (for the record)

- Self-hosted LiveKit in Docker confirmed after verifying the official image
  and dev-mode path (gap #1; human questioned cloud vs docker — docker it is).
- streamer owns token minting; secret never reaches the browser (gap #2).
- One publisher per room; creator publishes, everyone else subscribes (gap #3).
- Camera + mic only; screen share out (gap #4).
- Creator reload edge accepted, documented, purity kept (gap #5).
- Pre-join preview + explicit Go live; mute/camera-off controls (gap #6).
- Muted autoplay + tap-to-unmute; calm offline state, no spinner (gap #7).
- "Live" still means "exists in Valkey"; presence is a future feature (gap #8).
- LiveKit defaults + simulcast; no quality picker (gap #9).
- End stream disconnects participants and deletes the LiveKit room (gap #10).
- Official SDKs blessed: `livekit-client`, LiveKit Go server SDK (gap #11).
- Production LiveKit hardening recorded as a future devops feature.
