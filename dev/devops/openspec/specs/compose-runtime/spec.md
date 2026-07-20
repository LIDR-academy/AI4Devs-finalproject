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

