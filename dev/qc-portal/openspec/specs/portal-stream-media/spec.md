# portal-stream-media Specification

## Purpose
TBD - created by archiving change stream-media-v0. Update Purpose after archive.
## Requirements
### Requirement: Media token boundary
The portal SHALL fetch a media token from `POST /streams/{id}/media-token`, sending the in-memory `creatorKey` as `Authorization: Bearer <creatorKey>` only when one is held for that stream. It SHALL validate the response shape from `unknown` (`token`, `url`, `identity` strings; `role` ∈ `{ "streamer", "viewer" }`) before use, and SHALL treat `token` and `url` as **opaque** — passing them to `livekit-client` and NEVER parsing the JWT. A `404` (room gone) SHALL be surfaced as a failure. All media HTTP SHALL live in one non-UI module; UI components SHALL NOT call `fetch` directly.

#### Scenario: Creator token request carries the key
- **WHEN** the room is entered while a `creatorKey` for that stream is held in memory
- **THEN** the media-token request includes `Authorization: Bearer <creatorKey>`

#### Scenario: Viewer token request omits the key
- **WHEN** the room is entered with no held `creatorKey`
- **THEN** the media-token request is sent without an `Authorization` header and the client accepts whatever `role` the response assigns

#### Scenario: Malformed token response is a failure
- **WHEN** the media-token response is missing a field or has an invalid `role`
- **THEN** the module reports a failure and no connection is attempted

### Requirement: Creator pre-join and explicit go-live
When the media token's `role` is `"streamer"`, the portal SHALL present a pre-join step in the media area — request camera/microphone and show a local preview — and SHALL publish ONLY on an explicit **Go live** action (no auto-publish). While live it SHALL provide **mute mic** and **camera off** toggles; the End stream action SHALL remain. All WebRTC SHALL go through `livekit-client`; there SHALL be no manual SDP/ICE code.

#### Scenario: Pre-join shows a preview and does not publish
- **WHEN** the creator arrives and grants camera/mic
- **THEN** a local preview is shown and nothing is published until the creator activates **Go live**

#### Scenario: Go live publishes
- **WHEN** the creator activates **Go live**
- **THEN** the portal publishes camera and microphone through `livekit-client`

#### Scenario: Live controls toggle tracks
- **WHEN** the live creator activates mute mic or camera off
- **THEN** the corresponding local track is disabled through `livekit-client`

### Requirement: Viewer subscribes muted with tap-to-unmute
When the media token's `role` is `"viewer"`, the portal SHALL connect and render the publisher's video and audio in the media area, **starting muted**. It SHALL present a solid `ink`/`paper` tap/click-to-unmute affordance (meeting WCAG AA over any video frame, never translucent text floating on video); activating it SHALL unmute the remote audio. Video MAY autoplay muted; only audio requires the user gesture.

#### Scenario: Viewer unmutes to hear
- **WHEN** a viewer is connected while a publisher is live and activates the unmute affordance
- **THEN** the remote audio plays and the affordance reflects the unmuted state

#### Scenario: Unmute affordance is a solid element
- **WHEN** the muted video is shown
- **THEN** the unmute affordance is a solid `ink`/`paper` control (not translucent text over video) and is keyboard-focusable

### Requirement: Publisher presence drives offline and video
The portal SHALL detect publisher presence client-side via `livekit-client` track events. When a publisher's video is present it SHALL show the video in the media area (2/3 wide, and the expanded area when chat is toggled). When no publisher is on air it SHALL show a calm offline state — quiet text on `gray-fill`, no spinner or pulse. It SHALL transition to video when publishing starts and back to offline when the publisher leaves. Server-side presence SHALL NOT be relied upon.

#### Scenario: Offline before a publisher, video after
- **WHEN** a viewer is in a room with no publisher on air
- **THEN** a calm offline state is shown, it transitions to video when publishing starts, and it returns to the offline state when the publisher leaves

### Requirement: Media and chat are independent connections
The media (WebRTC) and chat (WebSocket) connections SHALL be independent: a fault, drop, or reconnect of one SHALL NOT tear down or disturb the other. A media connection drop SHALL trigger a quiet reconnect with simple backoff and calm (non-alarm) styling, mirroring chat. Leaving the room or ending the stream SHALL tear down both.

#### Scenario: Chat drop leaves media running
- **WHEN** the chat WebSocket drops or reconnects while media is connected
- **THEN** the media connection is undisturbed and continues, and vice versa

#### Scenario: Media drop reconnects calmly
- **WHEN** the media connection drops
- **THEN** a quiet reconnecting state is shown and the client retries with backoff, without alarm styling

### Requirement: Media surface style-law compliance
The media area SHALL comply with `CONSTITUTION.style.md`: the video/preview surface has border-radius 0, no decorative chrome, and no overlays fighting the content; controls (Go live, mute, camera off, unmute) are standard buttons per style §6 with visible focus and calm hovers; pre-join, offline, and reconnecting states are quiet text on `gray-fill` (mono where technical flavor fits) with no spinner; colors are token-only with AA contrast (including the unmute affordance over video); and motion is limited to opacity/color transitions disabled under `prefers-reduced-motion`.

#### Scenario: Quiet states, no spinner
- **WHEN** the media area is in a pre-join, offline, or reconnecting state
- **THEN** it shows calm token-styled text on `gray-fill` with no spinner or pulsing animation

#### Scenario: Focus visible on media controls
- **WHEN** the visitor moves focus with the keyboard to a media control (Go live, mute, camera off, or unmute)
- **THEN** a visible focus indicator is shown on that control

