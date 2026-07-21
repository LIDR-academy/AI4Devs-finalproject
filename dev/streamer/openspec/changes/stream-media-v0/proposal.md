## Why

The camera area is still a placeholder. This makes streamer the **LiveKit token authority**: it mints LiveKit access tokens granting publish rights only to a valid `creatorKey`, deletes the LiveKit room when a stream ends, and auto-reaps abandoned rooms via LiveKit webhooks so a reloaded creator's room never becomes an un-endable zombie. Real camera+mic media (WebRTC via a self-hosted LiveKit SFU) then flows creator→viewers, with publish permission enforced server-side.

This change covers the **streamer scope only**. The cross-scope wire contract (§6) and the runtime/zombie decisions (root D1–D9) are frozen in `openspec/changes/stream-media-v0/` and are **LAW** here. This proposal implements against them and does not reopen them. It resolves the long-standing open question: **streamer issues the LiveKit access token.**

## What Changes

- **New endpoint** `POST /streams/{id}/media-token`:
  - `creatorKey` via `Authorization: Bearer <creatorKey>` (root D2 — same transport as DELETE, **not** the body).
  - The room MUST exist in Valkey, else `404` — **never** create a LiveKit room for a nonexistent stream.
  - Valid key (constant-time) → publish+subscribe grant, `identity` = stream username, `role: "streamer"`. Absent/invalid key → subscribe-only grant, generated word+alphanumeric `identity` (same generator as chat), `role: "viewer"` — a silent viewer downgrade, not an error.
  - Response `{ token, url, identity, role }`; `url` is the browser-facing LiveKit URL from `LIVEKIT_PUBLIC_URL`. Token TTL is short (1h, documented).
  - The **LiveKit API secret never appears** in any response, log, or error.
- **Token signing** via the official LiveKit Go server SDK (blessed dependency): a publish token grants `CanPublish+CanSubscribe`; a viewer token grants `CanSubscribe` only, `CanPublish=false` — publish permission is enforced by LiveKit via the grant, never by the client.
- **MODIFIED `DELETE /streams/{id}`** (root D4 escape hatch + D6):
  - When the room has an **active LiveKit publisher**, still key-gated: `Authorization: Bearer` required, `204`/`403`/`404` as shipped.
  - When the room has **no active publisher** (abandoned), it MAY be ended **without** a key (the escape hatch, so a reloaded creator's room is endable).
  - On any successful delete, also **delete the LiveKit room** via the server API (participants disconnect). LiveKit unreachable → the Valkey delete still succeeds and the error is logged.
- **Auto-reap** (root D4/D5): subscribe to LiveKit participant webhooks (signature-verified). When the publisher (creator identity) leaves and does not return within a **departure grace**, or a room never gets a publisher within a **creation grace**, streamer ends the room (Valkey stream + messages + LiveKit room) — reusing the shipped room-ended broadcast to redirect viewers Home. A transient blip within grace does **not** reap.
- **New env** from compose: `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL` (server-to-server), `LIVEKIT_PUBLIC_URL` (browser-facing); fail-fast if missing.

### Non-goals

- The portal creator/viewer media UI, pre-join, go-live, mute/camera controls, offline state, tap-to-unmute, and `livekit-client` integration (qc-portal scope).
- The LiveKit compose service, dev-mode config, UDP port strategy, TLS/TURN, and the webhook URL wiring (devops scope).
- Screen share, co-hosts, viewer cameras, recording/egress, quality picker (one publisher per room; LiveKit defaults).
- Server-side publisher-presence tracking as stream status — "live" still means "exists in Valkey"; presence is used only for the escape hatch and reaper, not exposed.
- Auth/identity — `creatorKey` remains the stopgap.
- Multi-node LiveKit (no Redis), production hardening.

## Capabilities

### New Capabilities

- `stream-media`: the streamer server side of media — minting LiveKit access tokens with server-enforced publish grants, deleting the LiveKit room on stream end, ingesting signature-verified LiveKit webhooks, and auto-reaping abandoned rooms, all configured from the environment with the secret never leaked.

### Modified Capabilities

- `stream-lifecycle-api`: `DELETE /streams/{id}` gains publisher-aware authorization (the escape hatch for rooms with no active publisher) and cascades to deleting the LiveKit room. All prior behavior (key-gated delete of live rooms, message cascade, chat close, 404) is preserved (MODIFIED, not a rewrite).

## Impact

- **New Go packages**: `internal/media` (token-grant logic + a `Tokener`/`RoomController` interface, the shared `RoomEnder` cascade, and the webhook-driven `Reaper`) and `internal/livekit` (implements token signing + room control + webhook verification, confining the LiveKit SDK).
- **Modified packages**: `internal/config` (four LiveKit env vars, fail-fast), `internal/httpapi` (new `POST /streams/{id}/media-token`, new `POST /livekit/webhook`, publisher-aware `DELETE`), `cmd/streamer` (wire LiveKit client, ender, reaper; shutdown stops reaper timers).
- **New dependency**: the official LiveKit Go server SDK (`github.com/livekit/server-sdk-go/v2` + `github.com/livekit/protocol` for `auth`/`webhook`) — the blessed dependency for token signing, room control, and webhook verification (hand-rolling JWT grants or WebRTC is a boring-code violation).
- **External systems**: LiveKit SFU (new; server-to-server at `LIVEKIT_URL`, browser-facing at `LIVEKIT_PUBLIC_URL`). Valkey unchanged.
- **Cross-scope contracts (flagged, frozen — coordinated in the race)**:
  - `qc-portal ↔ streamer`: the media-token endpoint contract (path, `Authorization: Bearer`, `{token,url,identity,role}` response; token/url opaque).
  - `streamer → devops`: the four env var names + the two URLs (server vs public), and the LiveKit **webhook wiring** (LiveKit configured to POST participant webhooks to streamer's internal `/livekit/webhook`).
  - `security`, `users`: **not touched**.
