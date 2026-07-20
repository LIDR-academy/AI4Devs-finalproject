## 1. Environment configuration

- [x] 1.1 Create `dev/devops/.env.example` documenting non-secret runtime vars: pinned image tags (Valkey, nginx), single published `PROXY_PORT`, and streamer env values (`VALKEY_ADDR=valkey:6379`, `VALKEY_PASSWORD=`, `VALKEY_DB=0`, `STREAMER_ADDR=:8080`).
- [x] 1.2 Create/append `dev/devops/.gitignore` to ignore `.env`; confirm `.env` is untracked.

## 2. Compose definition

- [x] 2.1 Author `dev/devops/docker-compose.yml` with the `valkey` service: official `valkey/valkey` pinned tag, no volume, no published host port, on the default compose network.
- [x] 2.2 Add the `valkey` healthcheck: `valkey-cli ping` expecting `PONG`.
- [x] 2.3 Add the `streamer` service: build from `dev/streamer/` Dockerfile, env vars from §1.1, no published host port, `depends_on: valkey (service_healthy)`.
- [x] 2.4 Add the `streamer` healthcheck using streamer's in-image subcommand: `test: ["CMD", "/streamer", "healthcheck"]` (GETs `/readyz` internally; works in their shell-less minimal image — resolved with streamer).
- [x] 2.5 Add the `portal` service: build from `dev/qc-portal/` Dockerfile (static + SPA fallback), no published host port.
- [x] 2.6 Add the `proxy` service: official `nginx` pinned tag, the only service publishing a host port (`PROXY_PORT`), `depends_on` streamer (service_healthy) and portal, with `nginx.conf` mounted read-only.

## 3. Reverse proxy configuration

- [x] 3.1 Author `dev/devops/nginx.conf`: `location /streams` and `/streams/` → `proxy_pass http://streamer:8080` with no path rewrite (verbatim §6 paths).
- [x] 3.2 Route all other paths → `portal` with SPA fallback to `index.html`; confirm the portal image's listen port with qc-portal and wire the upstream accordingly.
- [x] 3.3 Verify `location` precedence so `/streams` (API) and `/stream/{id}` (portal route) never shadow each other.

## 4. Local validation (no external images required)

- [x] 4.1 Run `docker compose config` and confirm it renders with no errors.
- [x] 4.2 Bring up `valkey` alone and confirm its healthcheck reports healthy (`docker compose ps` / `docker inspect` health = healthy).

## 5. Documentation

- [x] 5.1 Write `dev/devops/README.md`: what the environment is, how to start/stop it, the single origin/port to open, and the required env vars (pointing at `.env.example`).

## 6. End-to-end verification (GATED — requires streamer + qc-portal images to build)

- [x] 6.1 Coordinate readiness: confirm streamer's and qc-portal's Dockerfiles build (they are produced in parallel); if either fails, report evidence upstream and do not modify their scope. — both images built (`quickchat-streamer`, `quickchat-portal`); no build failures.
- [x] 6.2 Once both images build, run `docker compose up`; confirm all four services reach healthy and streamer's `/readyz` returns `200`. — valkey + streamer Healthy, portal + proxy Up; streamer reached Healthy via `/streamer healthcheck` (GETs `/readyz` → 200).
- [x] 6.3 Verify acceptance #7 end to end through the single origin: `GET /streams` reaches streamer via the proxy; a portal route (`/`, `/stream/{id}`) serves the portal; capture command output as evidence. — GET/POST/DELETE /streams (200/201/204/404) + `/` and `/stream/{id}` both 200 text/html, all via proxy:8080.
- [x] 6.4 Verify the ordering scenario: with Valkey unreachable, streamer `/readyz` returns `503` and compose does not mark streamer healthy. — with Valkey stopped, `streamer healthcheck` → "readyz returned status 503" exit 1; container flipped to unhealthy (failingStreak 6).
