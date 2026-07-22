## Context

Builds on the shipped portal (room page with camera placeholder + independent chat). This change fills the camera area with LiveKit media. Frozen in the root record and binding on the portal:

- **§6 media-token contract is law** — `POST /streams/{id}/media-token` → `{ token, url, identity, role }`; `404` if the room is gone. Not restated as changeable.
- **D1** — streamer is the token authority; the API secret never crosses §6.
- **D2** — the `creatorKey` transport is `Authorization: Bearer <creatorKey>` (same as the shipped DELETE).
- **D3** — media is a second published origin: the browser connects to LiveKit cross-origin at the `url` from the token response; the portal bakes no LiveKit URL.
- **D4/D5/D6** — escape-hatch DELETE, auto-reap on publisher-left/creation grace, and LiveKit-room deletion are **server-side**; the portal's creator-only Bearer End is unchanged, and viewers are redirected Home by the **already-shipped room-ended handling** (no new portal work).
- **D7** — publisher presence (offline↔video) is detected client-side via `livekit-client` events.
- **D8** — viewers start muted with a solid `ink`/`paper` tap-to-unmute; media and chat are independent connections.
- **D9** — livekit-client integration shape and offline wording are mine.

Constitutions: `CONSTITUTION.md`, `CONSTITUTION.ts.md`, `CONSTITUTION.style.md`.

## Goals / Non-Goals

**Goals:**
- Keep the real WebRTC (the one hard-to-unit-test part) behind a thin, injected seam so all orchestration — token fetch, presence state machine, controls, reconnect — is deterministically unit-tested with a fake engine.
- Media and chat lifecycles fully independent on the room page (D8).
- Full style-law compliance for the video surface, controls, and quiet states.

**Non-Goals:**
- Changing §6, streamer internals, LiveKit dev config, or the nginx/second-origin setup (devops/streamer-owned).
- Server-side presence; any streamer-left redirect logic (reuses shipped room-ended).
- Screen share / co-hosts / quality picker; parsing the JWT; manual SDP/ICE.

## Decisions

### D-P1 — Feature folder `src/media/`, thin livekit seam
New `src/media/`: `media-api.ts` (token boundary), `media-engine.ts` (the ONLY module that imports `livekit-client`), `media-controller.ts` (orchestration + presence state machine), and the camera-area view pieces (`media-surface.ts`, controls). The room page mounts the media controller into the camera area independently of the chat panel.

### D-P2 — Token boundary owns the §6 call; token/url are opaque
`media-api.ts` exposes `fetchMediaToken(streamId, creatorKey?)` → `POST /streams/{id}/media-token`, sending `Authorization: Bearer <creatorKey>` only when a key is held (D2). It validates the response shape from `unknown` (`token`, `url`, `identity` strings; `role` ∈ {streamer, viewer}) and returns the streams `ApiResult`. It treats `token`/`url` as opaque strings — never decoded — and passes them onward. `404` → surfaced so the room can fall back (the room is gone; the shipped room-ended path handles the redirect).

### D-P3 — `MediaEngine` interface wraps livekit-client (the injected seam)
`media-engine.ts` defines a minimal interface the controller depends on — `connect(url, token)`, `startPreview()`, `publish()`, `setMicEnabled(on)`, `setCameraEnabled(on)`, `attachRemoteTo(el)`, `on(event, cb)`, `disconnect()` — and a real implementation backed by a `livekit-client` `Room`. Events are normalized to a small set the controller understands: `publisher-present`, `publisher-absent`, `reconnecting`, `reconnected`, `disconnected`. Tests inject a **fake engine** so the controller, presence machine, and view are fully deterministic without WebRTC. The real engine is thin (wire livekit events → normalized events, attach tracks to DOM) and is exercised by the compose E2E with Chrome fake devices (root risk note; AC2/AC5/AC9), not by unit tests.

### D-P4 — Presence state machine (D7), viewer
Controller states: `connecting → offline | live`, plus `reconnecting`. On `publisher-present` (a remote video track) → `live` (video attached to the camera-area element). On `publisher-absent` (track unpublished / participant left) → `offline` (quiet text on `gray-fill`). On engine `reconnecting` → `reconnecting` (calm), back to `live`/`offline` on `reconnected`. The offline state is not a spinner and nothing pulses (style §7).

### D-P5 — Creator pre-join + explicit go-live (no auto-publish)
When the token `role` is `streamer` (server-authoritative; only a held `creatorKey` yields it), the camera area shows a pre-join step: request camera/mic and show a **local preview** via the engine (`startPreview()`, which owns `getUserMedia` through livekit-client), then a primary **Go live** action. Only Go live calls `publish()`. While live: **mute mic** (`setMicEnabled`) and **camera off** (`setCameraEnabled`) toggles; the room page's End stream remains. A creator who reloaded holds no key → token `role: viewer` → viewer flow (accepted zombie edge, D of PRD; server auto-reaps).

### D-P6 — Viewer starts muted; solid tap-to-unmute (D8)
Remote audio starts muted (browser autoplay policy — not fought). The unmute affordance is a solid `ink`/`paper` button positioned over the video (NOT translucent text), meeting AA over any frame. Tapping it unmutes the remote audio. Video autoplays muted; only audio requires the gesture.

### D-P7 — Media and chat are independent on the room page (D8)
The room page mounts the chat panel and the media controller as two separate lifecycles. A chat WS drop only reconnects chat; a media drop only reconnects media (engine-driven backoff, mirroring chat's calm reconnect). Neither tears down the other. On leaving the room (navigation) or End, both are torn down.

### D-P8 — Video surface + controls styling (style §6/§7, PRD §7)
The video/camera element is 0 radius, no decorative chrome, no overlays fighting content; it sits in the existing `gray-line`-bordered camera area. Controls (Go live, mute, camera off, unmute) are standard buttons per style §6 with visible focus and calm hovers. Pre-join / offline / reconnecting are quiet text on `gray-fill`, mono where technical flavor fits. Motion limited to allowed opacity/color transitions, dropped under `prefers-reduced-motion`.

### D-P9 — Camera area swap modifies the room-chat layout requirement
The `portal-room-chat` "Room page layout" requirement is MODIFIED: the camera area hosts the media surface instead of a static placeholder. The 2/3 + expanded-on-toggle geometry and the chat toggle are unchanged; media simply fills that area.

## Risks / Trade-offs

- **Real WebRTC is unmockable in unit tests** → the `MediaEngine` seam confines livekit-client to one thin module; everything else is unit-tested against a fake engine. The real path is proven in the compose E2E with Chrome fake devices.
- **Autoplay policy** → viewers start muted with the solid tap-to-unmute; we do not fight the browser (D8).
- **Creator reload → viewer (zombie edge)** → accepted per PRD; streamer auto-reaps and the shipped room-ended redirect handles viewers. No portal special-casing.
- **Media/chat coupling bugs** → separate mounts + separate reconnect; a test asserts a chat status change does not touch the media controller and vice versa (at the controller boundary).
- **livekit-client bundle size** → accepted; it is the blessed SDK and the only sane way to speak the protocol. Loaded only on the room page.

## Migration Plan

Additive on the portal: a new `src/media/` feature and the camera-area swap. Order within this change: (1) add `livekit-client`; (2) media-token boundary + tests; (3) `MediaEngine` interface + fake + thin real impl; (4) media controller (presence machine, creator/viewer flows, reconnect) + tests with the fake; (5) media surface + controls + tap-to-unmute + offline/pre-join states; (6) wire into the room page camera area, independent of chat; (7) style-law litmus; (8) full `bun test` + `tsc` + Biome + Docker build. The portal builds against the §6 shape before LiveKit is live; full media E2E is devops's compose acceptance (#1/#2 with fake devices).

## Open Questions

None blocking. D9 items settled here: offline wording ("No one is on air right now." / pre-join and reconnecting copy) chosen in this change and reported to the lead; may refine the video-surface visuals via the frontend-design plugin without changing the LAW geometry or the token contract.
