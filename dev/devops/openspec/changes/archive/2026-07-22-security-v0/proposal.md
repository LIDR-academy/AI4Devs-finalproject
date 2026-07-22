## Why

`security-v0` adds real magic-link identity, waking two greenfield services (`security`, `users`) and their datastore (MongoDB). The runtime must now stand up the FULL stack — `security`, `users` + `mongo`, `streamer`, `qc-portal`, plus the shipped `valkey`, `livekit`, `coturn`, and the `proxy` — wire each service's auth/identity configuration from the environment (including HUMAN-SUPPLIED SuperTokens credentials that must never be committed), route the browser-facing `/auth/*` endpoints through the single origin, and order startup so `users` waits for Mongo and `streamer` tolerates `security` coming up. This is the devops deliverable of the first all-hands feature.

Implemented against the frozen root record (`openspec/changes/security-v0/` — design D1/D2/D3/D5, PRD §5.5 and acceptance #7). It extends the shipped `compose-runtime` baseline. devops is READ-ONLY on all service code and consumes each service's Dockerfile.

## What Changes

- **New `mongo` service** (official `mongo`, pinned) for `users`: **internal network only, NO published host port** (never reachable from host/portal, PRD §5.2/§5.5). DEV-ONLY root credentials via the image's `MONGO_INITDB_ROOT_USERNAME`/`MONGO_INITDB_ROOT_PASSWORD` from the environment. **Ephemeral (no volume)** — consistent with the rest of the dev env; dev users are wiped on `docker compose down` (documented; a named volume is a one-line change if persistence is later wanted). Healthcheck via `mongosh` ping.
- **New `security` service** (built from `../security`): fronts SuperTokens managed cloud; internal, reached by the browser only through the proxy for `/auth/*`. Reads human-supplied SuperTokens config from the environment.
- **New `users` service** (built from `../users`): internal-only Go API persisting to Mongo. Reads `MONGO_URI` + `MONGO_DB` (values I supply) and listens internally; never published.
- **nginx `/auth/*` routing on the single origin**: the portal's `supertokens-web-js` calls `/auth/*` from the browser, so the proxy SHALL route `/auth` and `/auth/...` to `security`. The app stays single-origin; only LiveKit media is a separate origin.
- **Env wiring** (config from environment, secret hygiene per Constitution §10 + AC7):
  - `security`: `SUPERTOKENS_CONNECTION_URI` + `SUPERTOKENS_API_KEY` — **HUMAN-SUPPLIED via an untracked `.env` (git-ignored), NEVER committed, never logged/returned**. `.env.example` carries only empty placeholders + instructions. Plus app/api domain settings as security reads them.
  - `users`: `MONGO_URI=mongodb://<devuser>:<devpass>@mongo:27017/?authSource=admin`, `MONGO_DB=quickchat` (dev creds DEV-ONLY), and its internal listen addr.
  - `streamer`: `SECURITY_JWKS_URL` (internal, e.g. `http://security:<port>/auth/jwt/jwks.json` — exact path confirmed with security) for stateless local JWT verification.
- **Startup ordering**: `users depends_on mongo: service_healthy`. `streamer` needs security's JWKS reachable — but MUST tolerate security not-yet-up (fetch at startup + refresh with retry, coordinated with streamer); so `streamer depends_on security: service_started` at most, not a hard health gate that would deadlock.
- **NO SuperTokens core container, NO mail container** — the managed cloud hosts the core + storage and sends magic-link emails (PRD §4).

### Non-goals

- **No changes to any service code or Dockerfile** — devops stays read-only and consumes streamer/security/users/qc-portal images. If an image won't build or a contract is wrong at runtime, devops reports evidence to the owner; it never edits their scope.
- **No self-hosted SuperTokens, no Postgres, no Mailpit** — managed cloud does core + storage + email (explicitly out of scope for v0).
- **No committed secrets**: the SuperTokens credentials are the human's untracked-env responsibility; devops commits only placeholders + docs.
- **No publishing Mongo or users to the host** — both are strictly internal.
- **No reopening frozen contracts** (wire §6, D1–D6, the internal security↔users contract, JWT claim set). This change implements the runtime for them.

## Capabilities

### New Capabilities

<!-- none — extends the existing compose-runtime capability -->

### Modified Capabilities

- `compose-runtime`: the runtime gains the auth/identity tier — a `mongo` datastore (internal, ephemeral, dev creds), the `security` and `users` services, browser `/auth/*` routing through the single origin, the auth/identity env wiring (including human-supplied SuperTokens creds kept out of git), and the associated startup ordering and secret hygiene. ADDED requirements on the existing capability; the shipped runtime behavior is unchanged.

## Impact

- **dev/devops/ (files changed here only)**:
  - `docker-compose.yml` — add `mongo`, `security`, `users` services; env for security/users/streamer; ordering.
  - `nginx.conf` — add `/auth/*` → `security` routing (single origin).
  - `.env.example` — document all new vars; **empty placeholders** for the SuperTokens creds with a "fill your real values in .env (git-ignored)" note; DEV-ONLY Mongo creds documented.
  - `.gitignore` — `.env` already ignored (verify).
  - `README.md` — the full-stack service list, the auth tier, the human-supplied-creds step, and the "users/mongo are internal-only" + ephemeral notes.
- **Cross-scope dependencies devops CONSUMES (not owned here)**:
  - `security` Dockerfile (builds a Go image serving `/auth/*` + JWKS; reads SuperTokens env). **Does not exist yet.**
  - `users` Dockerfile (builds a Go image reading `MONGO_URI`/`MONGO_DB`; internal API). **Does not exist yet.**
  - streamer reading `SECURITY_JWKS_URL`; security exposing the JWKS path; users reading `MONGO_URI`/`MONGO_DB`. **Confirm names/paths with owners.**
- **Sequencing / external dependency**: the full auth E2E (acceptance #1 real magic-link loop) is GATED on (a) security's + users' images building, and (b) the **human supplying real SuperTokens credentials** in the untracked `.env` — the race's only external dependency. Compose/env/proxy are authorable now; the real-email loop runs once creds + images land. devops does not claim the auth E2E without evidence.
- **Coordination**: Mongo env with `users` (done — single MONGO_URI, host `mongo:27017`, DB `quickchat`, users on :8080, ephemeral); SuperTokens env names with `security` (+ human supplies values); JWKS URL/path + startup-retry tolerance with `streamer` and `security`.
