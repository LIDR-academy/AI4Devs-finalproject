## Context

Builds on shipped `home-stream-lifecycle-v0` + `room-chat-v0` (single-origin nginx proxy, streamer + Valkey, WS chat, creator-only End via `Authorization: Bearer`). PRD `prds/stream-media-v0.md` is approved; §4/§10 resolve most gaps. During explore-mode intake the human resolved four cross-scope decisions, chief among them the zombie-room interaction the earlier features created together. This records the how; each teammate produces its own change.

## Goals / Non-Goals

**Goals:** real camera+mic media via LiveKit; server-enforced publish permission; a runtime that comes up with `docker compose up`; and no zombie rooms (a reloaded creator's room dies cleanly).

**Non-Goals:** intra-service detail owned by each teammate — exact UDP port strategy, token TTL, livekit-client integration shape, offline-state wording, grace-window length.

## Decisions

### D1 — streamer is the token authority (human decision, day-one open question resolved)
`POST /streams/{id}/media-token` mints LiveKit tokens. The API secret lives only in streamer's env, never crosses §6, never logged. Room must exist in Valkey (else `404`) — no LiveKit room is created for a nonexistent stream. Valid `creatorKey` → publish+subscribe, identity = username, `role: streamer`; absent/invalid → subscribe-only, identity = generated word+alphanumeric (same generator as chat), `role: viewer`. Invalid key is a silent viewer downgrade (chat doctrine), not an error.

### D2 — creatorKey transport: `Authorization: Bearer` everywhere (human decision)
The media-token endpoint takes the `creatorKey` as `Authorization: Bearer <creatorKey>`, matching the shipped DELETE — one credential, one transport. This is a deliberate tweak to the PRD §6 "body" wording, recorded here.

### D3 — Media is a second published origin (human decision, forced by WebRTC)
WebRTC media cannot traverse the nginx HTTP reverse proxy. LiveKit publishes its own ports (WS 7880, TCP 7881, a UDP media range) and the browser connects cross-origin at `LIVEKIT_PUBLIC_URL` (e.g. `ws://localhost:7880` in dev). The app itself stays single-origin behind nginx. streamer talks to LiveKit server-to-server at `LIVEKIT_URL` (internal). The portal bakes no LiveKit URL — it receives `url` in the token response. Exact UDP port strategy is devops's (the fiddly zone).

### D4 — Zombie resolution: escape hatch + streamer auto-reap (human decision)
Two parts, so a reloaded creator's room never becomes an un-endable, video-less zombie:
- **Escape hatch (MODIFIED DELETE):** `DELETE /streams/{id}` MAY succeed **without** a valid key when the room has **no active LiveKit publisher** (abandoned). A room with a live publisher still requires `Authorization: Bearer <creatorKey>` → 204/403/404 as shipped.
- **Auto-reap:** streamer subscribes to LiveKit participant webhooks. When the publisher (creator identity) disconnects and does not return within a grace window, streamer ends the room — Valkey stream + messages + LiveKit room — which fires the shipped room-ended broadcast, so viewers redirect Home (reusing room-chat-v0 behavior, no new portal work for the redirect). streamer also reaps a room that never gets a publisher within a creation grace (covers "created but never went live"). Grace length is streamer's, documented.

### D5 — Grace distinguishes "left" from a blip (human decision)
A transient media drop (publisher back within the grace window) survives via quiet reconnect (PRD reconnect behavior) and must NOT reap the room or eject viewers. Only a past-grace absence counts as "streamer left."

### D6 — DELETE also deletes the LiveKit room (from PRD)
On any successful delete (key-gated or escape-hatch), streamer deletes the LiveKit room via the server API → all participants disconnected. LiveKit unreachable → the Valkey delete still succeeds and the error is logged; the room dies with its token source anyway.

### D7 — Client-side presence for offline↔video (from PRD, restated)
The portal detects the publisher via `livekit-client` track events: publisher present → video in the 2/3 area (and the expanded area when chat is toggled); none → calm offline state (quiet text on `gray-fill`, no spinner). Server-side presence stays a non-goal.

### D8 — Muted autoplay (from PRD, non-negotiable)
Viewers start muted with a solid `ink`/`paper` tap-to-unmute affordance (AA over video, never translucent text) — browser autoplay policy, do not fight it. Media and chat are independent connections: dropping one never tears down the other.

### D10 — Dev TURN added for cross-browser media (human decision; conscious scope expansion)
Live testing on real browsers exposed that in-scope config cannot give reliable media on Docker Desktop macOS: real browsers hide host ICE candidates behind mDNS `.local` names that LiveKit-in-container can't resolve, the Docker Desktop UDP reflection is per-browser flaky (Chrome opportunistically connects, Firefox fails), and TCP-only cannot be forced (LiveKit always advertises a UDP candidate; unpublishing UDP breaks even `livekit-cli`; `livekit-client` has no force-TCP without TURN). Root cause is fully bounded: reliable local real-browser media genuinely needs TURN or Linux host-networking — both deferred by the PRD (§3/§5.3/§10).

**Decision (human-approved):** pull a minimal **dev TURN (coturn)** into `stream-media-v0` — a deliberate, recorded expansion beyond the PRD's TURN deferral. Rationale: acceptance #1 requires "works end to end on localhost," which on the primary dev platform (Docker Desktop macOS) it otherwise does not; TURN-over-TCP relays media reliably through Docker Desktop. Scope of the expansion: devops-only infra (a pinned coturn service + LiveKit TURN config + a couple of dev env vars); **no service code change**, no client change. Still dev-only (no TLS/real keys/production hardening — that remains the deferred production-LiveKit feature). Acceptance bar for the fix: real-browser media works across all four browser combos (Chrome↔Chrome, Firefox↔Firefox, both Chrome↔Firefox directions), verified by the human.

### D10a — Outcome + Firefox limitation (human-verified, recorded)
Human live-tested the dev-TURN (coturn) env on real browsers: media works reliably on **Chrome, Brave, and Safari** (Chromium + WebKit engines) — creator go-live → viewer sees/hears, relayed over TURN-over-TCP. **Firefox** (Gecko) remains the lone holdout even with TURN — a Firefox-specific ICE/TURN quirk in this Docker-dev setup. Human decision: keep the working coturn solution, **document Firefox as a known v0 dev-environment limitation** (deferred alongside the production-LiveKit/TURN/TLS/host-networking hardening feature), and do not spend further rounds chasing it. Supported-browser matrix (Chrome/Brave/Safari verified; Firefox deferred) documented in the env README. This closes the media blocker for v0.

### D9 — Teammate-owned (recorded as their call)
Token TTL (streamer); exact UDP port publishing strategy + LiveKit dev config (devops); livekit-client integration and component shape (qc-portal); grace-window value (streamer); fake-media E2E approach for AC2/AC5 (Chrome fake devices).

## Risks / Trade-offs

- **UDP media in Docker is the fiddly zone** → devops owns it; the PRD flags host-networking as Linux-only and dev-mode published-ports as the supported local path. Biggest runtime risk.
- **Real-WebRTC E2E is hard to automate** → drive with Chrome fake media devices (`--use-fake-device-for-media-stream`); AC2/AC5/AC9 proven with fake devices, not by trusting the UI.
- **Publish permission must be server-enforced** → LiveKit rejects a publish from a subscribe-only token; AC3 asserts this at the token level, not via the UI.
- **Webhook reliability** → if the LiveKit webhook is missed, the creation-grace reaper and the escape hatch are backstops so rooms still get reaped/endable.
- **Secret leakage** → the LiveKit API secret is grep-verified absent from portal code, responses, and logs (AC10).

## Migration Plan

Additive: one new endpoint, one MODIFIED delete, a new compose service; no data migration. The contract lets all three build in parallel (portal against the contract shape before LiveKit is live); devops's LiveKit + streamer's token endpoint unblock full integration. Feature pending until all three report done with evidence.

## Open Questions

None blocking. D9 items are teammate-owned and recorded in each teammate's own change when settled.
