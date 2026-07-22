# stream-media Specification

## Purpose
TBD - created by archiving change stream-media-v0. Update Purpose after archive.
## Requirements
### Requirement: Mint a media access token
The system SHALL expose `POST /streams/{id}/media-token` accepting an optional `creatorKey` as `Authorization: Bearer <creatorKey>`. The room MUST exist in Valkey, else the system SHALL return `404` and SHALL NOT create a LiveKit room. On success it SHALL return `200 { "token": string, "url": string, "identity": string, "role": "streamer" | "viewer" }`, where `token` is a LiveKit access token, `url` is the browser-facing LiveKit URL (from env), `identity` and `role` are server-stamped. A valid `creatorKey` (constant-time) SHALL grant publish + subscribe with `identity = the stream username`, `role = "streamer"`. An absent or invalid key SHALL grant subscribe-only with a generated word+alphanumeric `identity`, `role = "viewer"` — an invalid key is a silent viewer downgrade, not an error. The LiveKit API secret SHALL NEVER appear in the response, logs, or errors.

#### Scenario: Creator gets a publish token
- **WHEN** a client POSTs the media-token endpoint with a valid `creatorKey` for an existing room
- **THEN** the response is `200` with a token granting publish+subscribe, `identity` = the stream username, `role` = "streamer", and a browser-facing `url`

#### Scenario: Viewer gets a subscribe-only token
- **WHEN** a client POSTs with no key or an invalid key for an existing room
- **THEN** the response is `200` with a subscribe-only token, a generated word+alphanumeric `identity`, `role` = "viewer", and no error

#### Scenario: Token for a nonexistent room
- **WHEN** a client POSTs the media-token endpoint for a room id that does not exist
- **THEN** the response is `404` and no LiveKit room is created

### Requirement: Publish permission is server-enforced
Publish rights SHALL be enforced by LiveKit via the token grant, never by the client. A subscribe-only token SHALL NOT be able to publish; any publish attempt with it SHALL be rejected by LiveKit.

#### Scenario: Subscribe-only token cannot publish
- **WHEN** a client holding a subscribe-only token attempts to publish a track
- **THEN** LiveKit rejects the publish (verified at the token/grant level, not via the UI)

### Requirement: Creator publishes camera and microphone with an explicit go-live
The portal creator flow (holding the `creatorKey`) SHALL present a pre-join step in the camera area — camera/mic permission prompt and a local preview — and SHALL publish only on an explicit **Go live** action (no auto-publish). While live it SHALL provide **mute mic** and **camera off** controls (per style law), and the End stream action SHALL remain. Media SHALL use `livekit-client`; no manual SDP/ICE code.

#### Scenario: Pre-join then go live
- **WHEN** the creator arrives at `/stream/{id}` and grants camera/mic
- **THEN** a local preview shows and nothing is published until the creator activates **Go live**, after which their camera and mic reach subscribers

#### Scenario: Mute and camera-off take effect live
- **WHEN** the live creator toggles mute mic or camera off
- **THEN** the change is observable from the viewer side

### Requirement: Viewer subscribes muted with tap-to-unmute
The portal viewer flow SHALL fetch a token (no key), connect, and render the publisher's video and audio in the camera area, **starting muted** with a solid `ink`/`paper` tap/click-to-unmute affordance (AA contrast over video, never translucent text). When no publisher is on air it SHALL show a calm offline state (quiet text on `gray-fill`, no spinner/pulse); when publishing starts the video SHALL replace it, and when the publisher leaves it SHALL return to the offline state. Presence is detected client-side via `livekit-client` events.

#### Scenario: Viewer sees and hears after unmuting
- **WHEN** a viewer connects while a publisher is live and taps unmute
- **THEN** the publisher's video renders in the 2/3 area (and the expanded area when chat is toggled) and audio plays

#### Scenario: Offline state before and after publishing
- **WHEN** a viewer is in a room with no publisher on air
- **THEN** a calm offline state shows; it transitions to video when publishing starts and back to offline when the publisher leaves

### Requirement: Media and chat are independent connections
The media (WebRTC) and chat (WebSocket) connections SHALL be independent: dropping or reconnecting one SHALL NOT tear down the other. A media connection drop SHALL trigger a quiet reconnect with simple backoff and calm (non-alarm) styling, mirroring chat.

#### Scenario: Chat drop leaves media running
- **WHEN** the chat WebSocket drops while media is connected
- **THEN** video/audio keep playing and only chat reconnects (and vice versa)

### Requirement: Streamer reaps a room when its publisher leaves
The system SHALL subscribe to LiveKit participant webhooks. When the creator/publisher disconnects and does not return within a grace window — or a room never gets a publisher within a creation grace — streamer SHALL end the room (delete the Valkey stream, its messages, and the LiveKit room), which fires the room-ended broadcast so viewers redirect Home. A transient publisher drop that recovers within the grace SHALL NOT reap the room or eject viewers.

#### Scenario: Publisher leaves past the grace
- **WHEN** the creator/publisher disconnects and does not return within the grace window
- **THEN** streamer deletes the room (stream + messages + LiveKit room) and connected viewers receive the room-ended signal and redirect Home

#### Scenario: Transient publisher blip does not reap
- **WHEN** the publisher drops and reconnects within the grace window
- **THEN** the room is not reaped, viewers are not ejected, and media resumes

### Requirement: Media relays reliably across supported browsers via a dev TURN
The compose environment SHALL include a minimal dev TURN service (coturn) and configure LiveKit to hand out TURN credentials, so real-browser media relays reliably over TURN-over-TCP through Docker Desktop (working around mDNS candidate filtering and flaky UDP reflection). This is dev-only (no TLS, no real keys, no production hardening). Real-browser media SHALL work on the supported browsers — Chromium (Chrome, Brave) and WebKit (Safari). Firefox (Gecko) is a documented known v0 dev-environment limitation, deferred with the production-LiveKit hardening; the env README SHALL state the supported-browser matrix.

#### Scenario: Real-browser media on a supported browser
- **WHEN** a creator goes live in a supported browser (Chrome/Brave/Safari) and a viewer opens the room in another on `docker compose up`
- **THEN** the viewer sees and hears the creator's camera/mic, relayed via the dev TURN

#### Scenario: Firefox limitation is documented
- **WHEN** the environment README is consulted
- **THEN** it states the supported-browser matrix and that Firefox media is a known v0 limitation deferred with production-LiveKit hardening

### Requirement: LiveKit runs in the compose environment (dev mode)
`docker compose up` SHALL bring up a single-node LiveKit server in dev mode alongside Valkey + streamer + portal + proxy, publishing its own ports (WS 7880, TCP 7881, a UDP media range) as a documented second origin. streamer SHALL receive `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL` (server-to-server), and `LIVEKIT_PUBLIC_URL` (browser-facing) from the environment; no secret SHALL be baked into an image or committed. No Redis, no TLS/TURN in v0.

#### Scenario: Full media flow end to end
- **WHEN** an operator runs `docker compose up` and a creator goes live in one browser
- **THEN** a second browser can subscribe and, after unmuting, see and hear the creator's camera and mic through the dev-mode LiveKit server

