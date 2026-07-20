## Why

The `home-stream-lifecycle-v0` feature needs a running environment: acceptance #7 of the PRD requires that a single `docker compose up` brings the whole slice up end to end on one browser-facing origin. Today `dev/devops/` has no compose file, no proxy, and no environment configuration — there is nothing to run. This change stands up that first real runtime (Valkey + streamer + portal behind a reverse proxy) that this feature and every later feature build on.

This is the devops deliverable of the feature. It implements against the frozen cross-scope decisions recorded in the root orchestration change (`openspec/changes/home-stream-lifecycle-v0/` — proposal.md, design.md D1/D2/D6, and the `home-stream-lifecycle` spec). Those contracts are law here; this change does not reopen them.

## What Changes

- **New docker compose environment** wiring four services on one internal network: `valkey`, `streamer`, `portal` (built to static), and a `proxy` (the single browser-facing origin). This realizes Topology 2 (design D1).
- **Reverse proxy is the only host-exposed origin**: it routes `/streams` and `/streams/{id}` → `streamer`, and every other path → the `portal` static site with SPA fallback to `index.html` (design D2). Consequence: `streamer` needs no CORS, and no base URL is baked into the portal bundle — the browser only ever talks to the proxy.
- **Valkey container**: official `valkey/valkey` pinned to a specific tag, run anonymous (no AUTH), **ephemeral — no persistence volume** (design D6, PRD §5.3). Internal-only; not exposed to the host.
- **Streamer wiring**: `streamer` receives its Valkey connection verbatim via environment — `VALKEY_ADDR=valkey:6379`, `VALKEY_PASSWORD=""`, `VALKEY_DB=0` — and listens on `:8080` (`STREAMER_ADDR`). Internal-only; reached by the browser only through the proxy.
- **Readiness-gated startup ordering**: `streamer` depends on `valkey` being healthy (`valkey-cli ping`); the compose readiness of the slice is gated on streamer's `GET /readyz` (200 once Valkey is reachable, 503 otherwise) per design D5.
- **Environment configuration**: a committed `.env.example` documenting the non-secret runtime variables (image tags, ports, the Valkey env values above) plus a git-ignored `.env` for local overrides. **No secrets this stage** (Valkey is anonymous and ephemeral) — nothing sensitive is committed (Constitution §10).
- **Runtime documentation**: a README in `dev/devops/` covering how to start/stop the environment, the single origin/port, and the required env vars.

### Non-goals

- **No changes to any service's code or Dockerfile.** devops is read-only on all service code and only *consumes* streamer's and qc-portal's Dockerfiles. If an image won't build or a contract is wrong at runtime, devops reports evidence to the owning teammate — it does not fix it.
- **No reopening of the frozen contracts**: the §6 wire contract, the runtime topology (D1), the proxy routing rule (D2), streamer's env-var names and health endpoints (D5), and the ratified devops defaults (D6) are settled. This change implements them; it does not redesign them.
- **No CORS, no OPTIONS handling, no base-URL env in the portal bundle** — single-origin makes them unnecessary (D1).
- **No Valkey persistence, no TTL, no auth, no other services** (SuperTokens, MongoDB, LiveKit, security, users are not part of this slice).
- **No production concerns**: TLS, scaling, secrets management, and non-local deployment are out of scope for v0.

## Capabilities

### New Capabilities

- `compose-runtime`: the single-origin local runtime for the slice — a docker compose environment that brings up Valkey + streamer + portal + reverse proxy, gates readiness on Valkey health and streamer `/readyz`, exposes exactly one browser-facing origin, and takes all configuration from the environment with no committed secrets.

### Modified Capabilities

<!-- none — greenfield; dev/devops/ has no prior specs -->

## Impact

- **dev/devops/ (this scope, files created here only)**: a `docker-compose.yml` (services: valkey, streamer, portal, proxy), a reverse-proxy configuration file, `.env.example`, a `.gitignore` entry for `.env`, and a `README.md`. Exact proxy image is devops's choice (a boring, official one); the routing rule is fixed by D2.
- **Cross-scope dependencies devops CONSUMES (not owned here)**:
  - `streamer` Dockerfile — must build a working image that listens on `:8080`, reads `VALKEY_ADDR`/`VALKEY_PASSWORD`/`VALKEY_DB`/`STREAMER_ADDR`, and serves `GET /readyz` + `GET /healthz`. **Does not exist yet.**
  - `qc-portal` Dockerfile — must build the portal to static assets served inside its image with SPA fallback. **Does not exist yet.**
- **Sequencing / risk**: the full compose consumes both Dockerfiles, which are being built in parallel against §6. devops can author the compose + proxy config + env skeleton now, but **cannot prove acceptance #7 (end-to-end) until both images build**. End-to-end verification waits on them; this is a stated, coordinated dependency, not a blocker devops can resolve alone.
- **External systems**: Valkey is new to the running environment. No SuperTokens, MongoDB, or LiveKit in this slice.
- **Coordination**: confirm the exact Valkey env-var names with `streamer` and finalize proxy routing with `qc-portal`, keeping the team lead informed for the root openspec record.
