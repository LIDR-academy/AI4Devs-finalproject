## ADDED Requirements

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
