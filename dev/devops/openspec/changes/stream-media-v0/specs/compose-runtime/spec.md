## ADDED Requirements

### Requirement: LiveKit media server in the compose environment (dev mode)
`docker compose up` SHALL bring up a single-node LiveKit server (official `livekit/livekit-server`, pinned tag) in dev mode alongside Valkey, streamer, portal, and the proxy, with no Redis, no TLS, and no TURN. LiveKit SHALL be a documented **second published origin**: because WebRTC media cannot traverse the nginx reverse proxy, LiveKit publishes its own host ports and the browser reaches it directly, while the application plane stays single-origin behind nginx. LiveKit SHALL publish `7880` (WebSocket signaling), `7881` (TCP fallback), and a UDP media port for browser reachability without host networking.

#### Scenario: Full media flow end to end
- **WHEN** an operator runs `docker compose up` and a creator goes live in one browser
- **THEN** a second browser can subscribe and, after unmuting, see and hear the creator's camera and mic through the dev-mode LiveKit server on localhost

#### Scenario: LiveKit is a second origin, app stays single-origin
- **WHEN** the environment is up
- **THEN** the browser reaches the application only through the nginx proxy on its single origin, and reaches LiveKit media directly on LiveKit's own published ports — the two origins are separate and both work

#### Scenario: UDP reachability without host networking
- **WHEN** the environment runs on Docker Desktop (no host networking) on localhost
- **THEN** WebRTC media reaches LiveKit over the published UDP port (or the TCP `7881` fallback), and the host-networking-only approach is documented as Linux-only

### Requirement: Streamer receives LiveKit configuration from the environment
Compose SHALL supply `streamer` four LiveKit variables from the environment, using the exact names streamer reads: `LIVEKIT_API_KEY`, `LIVEKIT_API_SECRET`, `LIVEKIT_URL` (server-to-server HTTP/Twirp API, internal, `http://livekit:7880`), and `LIVEKIT_PUBLIC_URL` (browser-facing WebRTC signaling, `ws://localhost:7880`). The dev key and secret SHALL be clearly labeled DEV-ONLY, and no secret SHALL be baked into an image or committed as a real credential. The browser-facing URL SHALL be distinct from the internal one so the token response can hand the browser a reachable address.

#### Scenario: Streamer reaches LiveKit internally and hands the browser the public URL
- **WHEN** streamer mints a media token
- **THEN** it uses `LIVEKIT_API_KEY`/`LIVEKIT_API_SECRET` to sign, talks to LiveKit at the internal `LIVEKIT_URL`, and returns `LIVEKIT_PUBLIC_URL` to the browser — nothing LiveKit-related is baked into the portal bundle

#### Scenario: No real secret is committed
- **WHEN** the compose file and committed env files are inspected
- **THEN** the LiveKit key/secret are the dev defaults, labeled DEV-ONLY, and no production credential is present

### Requirement: LiveKit participant webhooks reach streamer
LiveKit SHALL be configured to deliver participant webhooks to streamer's webhook endpoint over the internal compose network, so streamer's auto-reap of abandoned rooms functions. The webhook destination path SHALL match the endpoint streamer exposes (coordinated with streamer), and SHALL be signed with the shared dev API key.

#### Scenario: Publisher-left webhook drives auto-reap
- **WHEN** a publisher disconnects and LiveKit emits a participant webhook
- **THEN** LiveKit POSTs it to streamer's webhook endpoint on the internal network, and streamer can act on it (reaping the abandoned room)
