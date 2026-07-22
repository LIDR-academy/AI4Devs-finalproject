## ADDED Requirements

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
