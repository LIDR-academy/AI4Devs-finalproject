# compose-runtime Specification

## Purpose
TBD - created by archiving change home-stream-lifecycle-v0. Update Purpose after archive.
## Requirements
### Requirement: Single-origin compose environment
`docker compose up` SHALL bring up four services on one internal network — `valkey`, `streamer`, `portal` (served static), and a reverse `proxy` — and SHALL expose exactly one host-facing origin: the proxy. Neither `streamer` nor `valkey` SHALL publish a host port; the browser reaches `streamer` only through the proxy. All four services SHALL use pinned image versions (no `latest`).

#### Scenario: One command brings the slice up
- **WHEN** an operator runs `docker compose up` and streamer's and portal's images are available
- **THEN** `valkey`, `streamer`, `portal`, and `proxy` all start, and only the proxy's port is published on the host

#### Scenario: Only the proxy is browser-reachable
- **WHEN** the environment is up
- **THEN** the browser can reach the application only through the proxy origin, and `streamer` and `valkey` are not directly reachable from the host

### Requirement: Proxy routes by path on a single origin
The reverse proxy SHALL route `/streams` and `/streams/{id}` (any method) to `streamer`, and SHALL route every other path to the `portal` static site. Requests for unknown non-API paths SHALL fall back to the portal's `index.html` (SPA fallback). The proxy SHALL NOT rewrite the `/streams` path prefix, so streamer receives the literal paths of the §6 wire contract.

#### Scenario: API path reaches streamer verbatim
- **WHEN** the browser requests `GET /streams` or `DELETE /streams/{id}` through the proxy
- **THEN** the request is forwarded to `streamer` at the identical path, and streamer's response is returned unchanged

#### Scenario: Application path reaches the portal
- **WHEN** the browser requests `/` or `/stream/{id}`
- **THEN** the proxy serves the portal static site, returning `index.html` for the SPA route

#### Scenario: No CORS needed
- **WHEN** the browser calls `/streams` from the application loaded on the same proxy origin
- **THEN** the call is same-origin and succeeds without any CORS headers or preflight from streamer

### Requirement: Valkey is ephemeral and anonymous
The environment SHALL run Valkey from the official `valkey/valkey` image pinned to a specific tag, with no persistence volume and no authentication. Valkey SHALL be internal-only.

#### Scenario: No data survives a restart
- **WHEN** the environment is torn down with `docker compose down` and brought back up
- **THEN** no previously created streams remain, because Valkey has no persistence volume

#### Scenario: Anonymous access from streamer
- **WHEN** `streamer` connects to Valkey using `VALKEY_PASSWORD=""`
- **THEN** the connection succeeds because Valkey requires no authentication

### Requirement: Streamer receives its configuration from the environment
Compose SHALL provide `streamer` its configuration verbatim as environment variables: `VALKEY_ADDR=valkey:6379`, `VALKEY_PASSWORD=""`, `VALKEY_DB=0`, and `STREAMER_ADDR=:8080`. No configuration value SHALL be baked into an image, and no secret SHALL appear in the compose file or any committed env file.

#### Scenario: Streamer reaches Valkey by service name
- **WHEN** `streamer` reads `VALKEY_ADDR` and dials it
- **THEN** it resolves `valkey:6379` over the compose network and connects

#### Scenario: Configuration is not baked in
- **WHEN** the compose file and committed env files are inspected
- **THEN** every runtime value comes from the environment and no secret or credential is present

### Requirement: Readiness-gated startup ordering
`streamer` SHALL start only after `valkey` reports healthy, where Valkey health is determined by `valkey-cli ping` returning `PONG`. The compose readiness of `streamer` SHALL be determined by its `GET /readyz` endpoint returning `200`.

#### Scenario: Streamer waits for Valkey
- **WHEN** the environment starts and Valkey is not yet answering `ping`
- **THEN** `streamer` is not started until Valkey's healthcheck passes

#### Scenario: Streamer reported ready only when Valkey reachable
- **WHEN** `streamer` is running and Valkey is reachable
- **THEN** `GET /readyz` returns `200` and compose marks `streamer` healthy; if Valkey becomes unreachable, `/readyz` returns `503` and `streamer` is not healthy

### Requirement: Environment configuration is documented and secret-free
The scope SHALL provide a committed `.env.example` documenting every non-secret runtime variable (image tags, the proxy host port, and the streamer env values), and SHALL keep the actual `.env` git-ignored. No secrets SHALL be committed at this stage.

#### Scenario: Operator can configure from the example
- **WHEN** an operator copies `.env.example` to `.env` and runs the environment
- **THEN** the environment starts using documented, non-secret values, and `.env` is not tracked by git

#### Scenario: README explains how to run it
- **WHEN** a newcomer reads `dev/devops/README.md`
- **THEN** they learn how to start and stop the environment, which single origin/port to open, and the required environment variables

### Requirement: Consumes service images without modifying them
The environment SHALL build `streamer` and `portal` from the Dockerfiles owned by those scopes, without devops modifying any service code or Dockerfile. If an image fails to build or a service fails its healthcheck at runtime, devops SHALL surface the exact evidence (build output, logs, exit codes) to the owning teammate rather than altering that scope.

#### Scenario: Build failure is reported, not fixed
- **WHEN** `streamer`'s or `portal`'s image fails to build during `docker compose build`
- **THEN** devops reports the build output and exit code to the owning teammate and does not modify that scope's files

#### Scenario: End-to-end verification depends on both images
- **WHEN** both `streamer` and `portal` images build successfully
- **THEN** `docker compose up` can be verified end to end: streamer's `/readyz` returns `200` and the portal works against the API through the single origin

### Requirement: WebSocket upgrade on the single origin
The reverse proxy SHALL upgrade the room WebSocket at `/streams/{id}/ws` so the browser reaches it only through the single published origin — no CORS, no base URL baked into the bundle. For that path the proxy SHALL forward the `Upgrade` and `Connection` headers, speak HTTP/1.1 to the upstream, and use a read timeout tolerant of idle chat so a quiet long-lived connection is not dropped. The existing HTTP behavior of `/streams` (list/create) and `/streams/{id}` (history GET, DELETE) SHALL be unchanged by this addition.

#### Scenario: Live chat round-trip through the proxy
- **WHEN** the environment is up via `docker compose up` and two clients open a WebSocket to the same room through the single origin
- **THEN** the proxy upgrades each connection and a message sent by one client is delivered live to the other, proving the WS upgrade traverses the proxy

#### Scenario: Idle WebSocket is not dropped
- **WHEN** a WebSocket connection stays open and silent for a period longer than a default proxy read timeout
- **THEN** the proxy keeps the connection open (its read timeout is tolerant of idle chat) and a later message still round-trips

#### Scenario: HTTP endpoints unaffected by the upgrade config
- **WHEN** a client sends a non-WebSocket request to `/streams` or `/streams/{id}/messages` through the proxy
- **THEN** it is proxied as a normal HTTP/1.1 request to streamer and behaves exactly as before (no upgrade attempted)

### Requirement: Chat knobs supplied to streamer from the environment
Compose SHALL supply `streamer` the three chat tuning variables from the environment with their documented defaults — `CHAT_MAX_MESSAGES=1000000`, `CHAT_PAGE_SIZE=200`, `CHAT_MAX_LENGTH=500` — using the exact names streamer reads, overridable via the environment, and never baked into an image. These SHALL be documented in `.env.example`. No new container or volume SHALL be added; Valkey remains ephemeral and unchanged.

#### Scenario: Defaults supplied when unset
- **WHEN** the environment is brought up without overriding the chat variables
- **THEN** streamer receives `CHAT_MAX_MESSAGES=1000000`, `CHAT_PAGE_SIZE=200`, and `CHAT_MAX_LENGTH=500`

#### Scenario: Overridable via the environment
- **WHEN** an operator lowers `CHAT_MAX_MESSAGES` in `.env` and brings the environment up
- **THEN** streamer receives the lowered value (so the ring-buffer cap follows configuration), with no image rebuild required

#### Scenario: No new infrastructure
- **WHEN** the room-chat runtime is inspected
- **THEN** there is no new container, no message broker, and no persistence volume — chat history lives in the existing ephemeral Valkey as streamer's private storage

### Requirement: LiveKit media server in the compose environment (dev mode)
`docker compose up` SHALL bring up a single-node LiveKit server (official `livekit/livekit-server`, pinned tag) in dev mode alongside Valkey, streamer, portal, and the proxy, with no Redis and no TLS (a DEV-ONLY TURN server is included — see "Reliable browser media via a dev TURN server"). LiveKit SHALL be a documented **second published origin**: because WebRTC media cannot traverse the nginx reverse proxy, LiveKit publishes its own host ports and the browser reaches it directly, while the application plane stays single-origin behind nginx. LiveKit SHALL publish `7880` (WebSocket signaling), `7881` (TCP fallback), and a UDP media port.

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

### Requirement: Reliable browser media via a dev TURN server
On Docker Desktop macOS the direct WebRTC path is unreliable for real browsers (they hide host ICE candidates behind mDNS names the container cannot resolve, and UDP is browser-flaky), so the environment SHALL include a DEV-ONLY TURN server (official `coturn`, pinned) that relays media over TCP. LiveKit SHALL advertise this TURN server to browser clients (via `rtc.turn_servers`, protocol TCP) so they obtain a relay candidate and fall back to it when the direct path fails. Only the TURN control port SHALL be host-published; the relay range SHALL stay internal (LiveKit reaches it on the compose network). LiveKit SHALL advertise its own container (Docker-internal) IP — it SHALL NOT set `node_ip` to loopback — so the TURN server can deliver relayed media to LiveKit. The TURN credentials SHALL be DEV-ONLY (not real secrets). This is a human-approved expansion beyond the PRD's TURN deferral (root design D10) for local browser media; full production TURN/TLS/host-networking remains a separately deferred hardening feature.

#### Scenario: Real browser relays media over TURN
- **WHEN** a creator goes live in a supported browser and a viewer opens the same room on `docker compose up`
- **THEN** media relays through the dev TURN server over TCP and the viewer sees/hears the creator, without any client-side transport configuration

#### Scenario: Documented browser support and limitation
- **WHEN** the environment README is consulted
- **THEN** it states media is verified on Chrome, Brave, and Safari, and that Firefox media is a known, accepted v0 limitation in this dev-mode setup (root design D10a), deferred with production hardening

### Requirement: Auth/identity tier in the compose environment
`docker compose up` SHALL bring up the auth/identity tier alongside the existing stack: a `mongo` datastore (official image, pinned), a `security` service (built from its own Dockerfile), and a `users` service (built from its own Dockerfile). Mongo and users SHALL be **internal-only** — neither SHALL publish a host port, and both SHALL be unreachable from the host/portal. Mongo SHALL run with DEV-ONLY root credentials supplied from the environment and SHALL be ephemeral (no persistence volume) for dev, which SHALL be documented. There SHALL be NO SuperTokens core container and NO mail container (the managed cloud provides both).

#### Scenario: Full stack comes up
- **WHEN** an operator runs `docker compose up`
- **THEN** security, users, mongo, streamer, portal, valkey, livekit, coturn, and the proxy all start, and users + mongo are reachable only on the internal compose network (no published host port)

#### Scenario: No self-hosted auth infrastructure
- **WHEN** the running environment is inspected
- **THEN** there is no SuperTokens core container, no Postgres, and no mail container — security talks to the managed SuperTokens cloud

### Requirement: Browser auth endpoints on the single origin
The reverse proxy SHALL route the browser-facing `/auth` and `/auth/...` paths to the `security` service, so the portal's auth SDK reaches SuperTokens' endpoints through the single published origin (no CORS, no baked URL). The existing routing (`/streams*` → streamer, room WS, everything else → portal) SHALL be preserved; LiveKit media remains the only separate origin.

#### Scenario: Auth calls traverse the single origin
- **WHEN** the portal calls an `/auth/*` endpoint from the browser
- **THEN** the proxy forwards it to `security` on the same origin, and streamer/app routing is unchanged

### Requirement: Auth/identity configuration from the environment, secrets never committed
Compose SHALL supply auth/identity configuration from the environment: `security` receives its SuperTokens settings, `users` receives its Mongo connection (`MONGO_URI` including dev credentials + `MONGO_DB`), and `streamer` receives `SECURITY_JWKS_URL` for local JWT verification. The SuperTokens credentials (`SUPERTOKENS_CONNECTION_URI`, `SUPERTOKENS_API_KEY`) are HUMAN-SUPPLIED and SHALL be provided via a git-ignored env file only — they SHALL NEVER be committed, and `.env.example` SHALL carry only empty placeholders with instructions. No secret SHALL be baked into an image; the SuperTokens key SHALL never appear in a committed file.

#### Scenario: Human supplies SuperTokens creds out of git
- **WHEN** an operator provides real SuperTokens credentials in the git-ignored `.env`
- **THEN** `security` receives them from the environment, and `git` shows no committed SuperTokens credentials (only placeholders in `.env.example`)

#### Scenario: Streamer verifies tokens against security's JWKS
- **WHEN** `streamer` starts
- **THEN** it reads `SECURITY_JWKS_URL` from the environment and can fetch security's JWKS to verify access tokens locally, with no per-request call to security

### Requirement: Auth-tier startup ordering
`users` SHALL start only after `mongo` reports healthy (Mongo healthcheck). `streamer` SHALL NOT hard-depend on `security` being healthy in a way that could deadlock — it tolerates `security` not-yet-up by fetching the JWKS at startup with retry/refresh — so the ordering SHALL NOT gate streamer on a security health condition.

#### Scenario: Users waits for Mongo
- **WHEN** the environment starts and Mongo is not yet ready
- **THEN** `users` does not start until Mongo's healthcheck passes

#### Scenario: Streamer survives security starting later
- **WHEN** `streamer` starts before `security` is serving its JWKS
- **THEN** the environment does not deadlock — streamer retries the JWKS fetch and becomes able to verify tokens once security is up

