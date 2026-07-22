## Why

The camera area is still a placeholder. This makes streams real: the creator publishes camera + microphone and everyone else watches, via a self-hosted LiveKit SFU (WebRTC) — completing the C4 vision and answering the day-one open question of *who issues the LiveKit token* (streamer does). It also closes a latent defect the earlier features created together: a reloaded creator's room could become an un-endable, video-less zombie.

Orchestration-level record for `stream-media-v0` (PRD `prds/stream-media-v0.md`). Builds on shipped `home-stream-lifecycle-v0` and `room-chat-v0`. Each involved teammate runs its own openspec change against this record.

## What Changes

- **New token endpoint** (contract addition): `POST /streams/{id}/media-token` with the `creatorKey` presented as `Authorization: Bearer <creatorKey>` (per decision, aligned with DELETE — a tweak to the PRD's "body"). Valid key → publish+subscribe token (identity = username, `role: streamer`); absent/invalid key → subscribe-only token (identity = generated word+alphanumeric, `role: viewer`); `404` for a nonexistent room. Response carries the browser-facing LiveKit `url`. The API secret never crosses this boundary.
- **streamer becomes the token authority + reaper**: mints LiveKit tokens (secret only in its env), and subscribes to LiveKit participant webhooks. When the creator/publisher disconnects and does not return within a grace window (or a room never gets a publisher within a creation grace), streamer ends the room — reusing the shipped delete cascade + room-ended broadcast, so viewers redirect Home. **No zombie rooms.**
- **DELETE gains teeth + an escape hatch** (MODIFIED): on delete, streamer also deletes the LiveKit room (disconnecting all participants; LiveKit-unreachable is logged, Valkey delete still succeeds). And a `DELETE` MAY succeed **without** a valid key when the room has **no active publisher** (abandoned) — live rooms stay key-gated.
- **qc-portal media client**: creator pre-join (camera/mic permission + local preview) → explicit **Go live**; mute-mic / camera-off controls while live; End stream remains. Viewer subscribes, renders video+audio in the 2/3 camera area, **starts muted** with a tap-to-unmute affordance; a calm **offline state** when no publisher is on air, transitioning to video when publishing starts and back when it stops. Media and chat are independent connections. `livekit-client` handles all WebRTC.
- **devops LiveKit service**: official `livekit/livekit-server`, single-node **dev mode**, published ports (7880 WS, 7881 TCP, UDP media range) — a documented second published origin (WebRTC cannot traverse the nginx proxy). Supplies streamer's four LiveKit env vars (dev key/secret, marked dev-only). No Redis, no TLS/TURN.
- **Scopes touched:** `qc-portal`, `streamer`, `devops`. **NOT touched:** `security`, `users`.

### Non-goals

Screen share / co-hosts / viewer cameras (one publisher per room); manual quality picker (LiveKit simulcast defaults); recording/egress/thumbnails/Home previews; server-side presence ("live" still means "room exists in Valkey"; the offline↔video transition is client-side via livekit-client events); production LiveKit hardening (TURN/TLS/real keys/host-networking — a future devops feature); auth (creatorKey remains the stopgap).

## Capabilities

### New Capabilities

- `stream-media`: real camera+mic video via LiveKit SFU — the token endpoint and server-stamped grants, streamer's LiveKit room management + webhook-driven reaper, the portal's pre-join/go-live/subscribe/muted-autoplay/offline media client, and the dev-mode LiveKit runtime.

### Modified Capabilities

- `home-stream-lifecycle`: `DELETE /streams/{id}` also deletes the LiveKit room, and gains the no-active-publisher escape hatch (keyless delete for abandoned rooms). Existing key-gated behavior for live rooms preserved.

## Impact

- **streamer**: `POST /streams/{id}/media-token` (Bearer key → grant), LiveKit token signing (Go server SDK, secret in env), LiveKit room deletion on DELETE, LiveKit webhook endpoint + grace-based auto-reap, escape-hatch DELETE. Env: `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL` (server-to-server), `LIVEKIT_PUBLIC_URL` (browser-facing); secret never logged/returned. Token TTL streamer's choice, documented. Constitutions: `CONSTITUTION.md`, `CONSTITUTION.go.md`.
- **qc-portal**: pre-join + Go live, mute/camera-off, viewer subscribe + muted autoplay + tap-to-unmute, offline/reconnecting states, media independent from chat, `livekit-client`. Treats `token`/`url` as opaque. Constitutions: `CONSTITUTION.md`, `CONSTITUTION.ts.md`, `CONSTITUTION.style.md`.
- **devops**: LiveKit dev-mode compose service + published ports (incl. UDP media) as a documented second origin; streamer's four LiveKit env vars (dev-only key/secret); README caveats (host-networking is Linux-only; dev-mode published-ports is the supported local path). Read-only on code. Constitution: `CONSTITUTION.md`.
- **External systems**: LiveKit SFU (new to the running environment). Valkey unchanged.
