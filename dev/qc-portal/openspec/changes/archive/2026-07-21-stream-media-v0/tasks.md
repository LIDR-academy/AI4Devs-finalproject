## 1. Dependency & media-token boundary

- [x] 1.1 Add `livekit-client` (blessed SDK) to package.json; justify in the change; `bun install` and confirm the build still works.
- [x] 1.2 Define media types: `MediaToken` (`token`, `url`, `identity`, `role`) with `role ∈ {streamer, viewer}`.
- [x] 1.3 Implement `src/media/media-api.ts`: `fetchMediaToken(streamId, creatorKey?)` → `POST /streams/{id}/media-token` with `Authorization: Bearer <creatorKey>` only when a key is held; validate the response from `unknown` (fields + role); treat token/url as opaque; surface 404/malformed/network as failures.
- [x] 1.4 Tests: header present with key / absent without key; valid 200 → parsed token; malformed body (missing field / bad role) → failure; 404 → failure; deterministic (mock fetch).

## 2. Media engine seam (`src/media/media-engine.ts`)

- [x] 2.1 Define the `MediaEngine` interface the controller depends on (`connect`, `startPreview`, `publish`, `setMicEnabled`, `setCameraEnabled`, `attachRemoteTo`, `on`, `disconnect`) with a normalized event set (`publisher-present`/`publisher-absent`/`reconnecting`/`reconnected`/`disconnected`).
- [x] 2.2 Implement the real engine backed by a `livekit-client` `Room` (thin: map LiveKit events → normalized events, attach tracks to the DOM element). No manual SDP/ICE. This module is the ONLY importer of `livekit-client`.
- [x] 2.3 Provide a test fake implementing `MediaEngine` (drivable: emit events, record publish/mute/camera calls) for controller tests.

## 3. Media controller — orchestration & presence (`src/media/media-controller.ts`)

- [x] 3.1 Implement the controller: fetch token → connect the engine → drive the presence state machine (connecting → offline | live, plus reconnecting) from normalized events; inject `fetchToken` + `engine` for testing.
- [x] 3.2 Creator flow (role streamer): pre-join `startPreview()`, explicit `publish()` on Go live (no auto-publish), `setMicEnabled`/`setCameraEnabled` for the live controls.
- [x] 3.3 Viewer flow (role viewer): subscribe, start muted, expose an unmute action; presence events swap offline↔video.
- [x] 3.4 Media reconnect: engine `reconnecting`/`reconnected` → calm reconnecting state → back to live/offline (no chat coupling).
- [x] 3.5 Tests (fake engine, deterministic — no WebRTC): role selects creator vs viewer; Go live publishes only on the action; mute/camera toggles call the engine; publisher-present→video, publisher-absent→offline; reconnecting→reconnected transitions; 404 token → failure state.

## 4. Media surface & controls (`src/media/media-surface.ts`, controls)

- [x] 4.1 Camera-area view: renders the state from the controller — pre-join (preview + Go live), live (video + mute/camera controls), viewer video, offline (quiet text on `gray-fill`), reconnecting (calm). Video/preview element: 0 radius, no chrome.
- [x] 4.2 Tap-to-unmute affordance: a solid `ink`/`paper`, keyboard-focusable button over the video (not translucent text), AA over any frame; activating it unmutes.
- [x] 4.3 Tests: state → rendered surface (pre-join shows Go live; offline shows quiet copy, no spinner; live shows controls); unmute affordance present + activatable for viewers.

## 5. Room page integration (independence)

- [x] 5.1 Mount the media controller into the room page camera area, independent of the chat panel (separate lifecycles); tear down both on leave/End. The camera area no longer renders the static placeholder.
- [x] 5.2 Tests: media mounts/unmounts independently of chat (a chat status change does not touch the media controller and vice versa, at the controller boundary); End/leave tears down both.

## 6. Style-law compliance & Definition of Done

- [x] 6.1 Run the `CONSTITUTION.style.md` §10 litmus across the media surface (video 0 radius/no chrome), controls (§6, visible focus, calm hover), the solid tap-to-unmute (AA over video), and the quiet pre-join/offline/reconnecting states (no spinner, prefers-reduced-motion respected). Fix any violation.
- [x] 6.2 Full suite green: `bun test` (new behavior + error paths, deterministic — fake engine, mocked fetch, no real WebRTC/timers), `tsc --noEmit` strict clean, Biome clean with no inline disables, no `any`/unjustified `as`/`!`/`@ts-ignore` in the diff.
- [x] 6.3 Confirm the Dockerfile still builds (livekit-client bundled) and the static image serves; coordinate the media-token contract + `role` semantics + `Authorization: Bearer` transport with streamer, and the LiveKit second-origin (`url` in response) with devops. Note: real WebRTC E2E is devops's compose acceptance with Chrome fake devices.
- [x] 6.4 Compile the evidence-based done report (change → tests → bun test + tsc + Biome results) with an explicit `CONSTITUTION.style.md` compliance statement (AC12). Never a bare "done".
