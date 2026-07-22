## Context

This is the devops implementation design for `home-stream-lifecycle-v0`. The cross-scope decisions are already frozen in the root orchestration change (`openspec/changes/home-stream-lifecycle-v0/design.md`): runtime topology (root D1), proxy path routing (root D2), streamer's runtime contract and health endpoints (root D5), and the ratified devops defaults (root D6). This document does not reopen them — it records the devops-owned *how* for standing them up: the compose structure, the proxy choice and its config, healthcheck/ordering wiring, and the env-file layout.

Current state: `dev/devops/` contains only its brief and this openspec change. There is no compose file, no proxy config, no env files. Greenfield.

Hard constraint throughout: devops is READ-ONLY on all service code, including Dockerfiles. This design consumes streamer's and qc-portal's Dockerfiles; it never edits them.

## Goals / Non-Goals

**Goals:**
- One `docker compose up` stands up Valkey + streamer + portal + proxy on a single browser-facing origin (root D1).
- Boring, reproducible infra: official images, pinned tags, config from the environment, no committed secrets.
- Sensible startup ordering and a readiness signal that reflects real end-to-end health (Valkey reachable → streamer ready).

**Non-Goals:**
- Any change to service code or Dockerfiles (read-only).
- Reopening the frozen contracts (wire §6, D1, D2, D5, D6).
- Production concerns: TLS, scaling, secret management, non-local deploy.
- CORS/OPTIONS handling or a portal base-URL env — single origin removes the need (root D1).

## Decisions

### DD1 — Compose service graph
Four services on one user-defined bridge network (default compose network):
- `valkey` — official `valkey/valkey`, pinned tag, no volume, no published host port.
- `streamer` — built from `dev/streamer/`'s Dockerfile; env `VALKEY_ADDR=valkey:6379`, `VALKEY_PASSWORD=""`, `VALKEY_DB=0`, `STREAMER_ADDR=:8080`; no published host port.
- `portal` — built from `dev/qc-portal/`'s Dockerfile (static build served inside its own image); no published host port.
- `proxy` — the only service with a published host port; the single browser-facing origin.

Rationale: matches root D1 exactly. Keeping streamer and valkey unpublished enforces the single-origin property structurally — the browser physically cannot bypass the proxy.

### DD2 — Reverse proxy: official nginx, pinned
Use the official `nginx` image, pinned tag, with a devops-owned `nginx.conf` (or a `conf.d` server file) mounted read-only into the container. **Chosen over** (a) Caddy — capable but adds an unfamiliar config surface for a two-rule routing job; (b) Traefik — label-driven dynamic routing is overkill for a static two-upstream map and would spread config across compose labels. nginx is the boring, ubiquitous choice for "route two paths, serve static fallback," and every mid-level dev can read its config.

Routing (implements root D2, no path rewrite):
- `location /streams` and `location /streams/` (covers `/streams` and `/streams/{id}`, any method) → `proxy_pass` to `streamer:8080`, forwarding the path verbatim.
- everything else → `proxy_pass` to `portal` (or serve its static root), with `try_files ... /index.html` SPA fallback.

Note `/stream/{id}` (portal route) does not collide with `/streams` (API) — nginx `location /streams` matches the `/streams` prefix, and `/stream/` is a different prefix. This is called out because the near-identical names are an easy mis-config.

Open sub-decision deferred to implementation: whether `portal` serves its own static (its image runs a server and nginx proxies to it) or nginx serves the portal's built assets from a shared read-only mount. Root D7 says SPA fallback lives in the portal's own static-serving image, so the default is: `portal` image serves static + SPA fallback, and the proxy simply forwards non-API paths to it. Confirm the portal image's listen port with qc-portal.

### DD3 — Healthchecks and ordering
- `valkey`: healthcheck `valkey-cli ping` expecting `PONG` (root D6 / D5).
- `streamer`: `depends_on: valkey: condition: service_healthy` so it starts only after Valkey answers. streamer's healthcheck uses its **own in-image health subcommand** — `test: ["CMD", "/streamer", "healthcheck"]` — which the binary implements as an HTTP GET to `http://127.0.0.1:8080/readyz`, exiting 0 on 200. `/readyz` returns 200 only when Valkey is reachable (root D5), so compose's "streamer healthy" means "actually wired to Valkey," satisfying acceptance #7's readiness scenario.
- `proxy`: `depends_on` streamer (service_healthy) and portal (service_started/healthy as available) so the origin only comes up once its upstreams exist.

Rationale: gate on real readiness, not just process start. A weaker TCP-only check would report ready before Valkey is wired; `/readyz` avoids that. The earlier concern about curl/wget in a minimal streamer image is **resolved (coordinated with streamer)**: streamer ships a scratch/distroless image with no shell and provides the `streamer healthcheck` subcommand, so the healthcheck needs no extra tooling from devops and adds no layers to their image. devops uses the CMD form above verbatim.

### DD4 — Configuration and secrets
- Committed `.env.example`: image tags (`VALKEY_IMAGE`, `NGINX_IMAGE` or equivalent pins), the single published proxy port (e.g. `PROXY_PORT`), and the streamer env values. All non-secret.
- Git-ignored `.env` for local overrides (add `.env` to `dev/devops/.gitignore`).
- No secrets this stage: Valkey is anonymous and ephemeral, so there is nothing sensitive to store. `VALKEY_PASSWORD=""` is an intentional empty value, not a secret.

Rationale: Constitution §10 — config from the environment, nothing sensitive committed. Pinning image tags via env keeps reproducibility while allowing a documented single source of truth.

### DD5 — What devops does NOT own (consumed contracts)
- streamer's Dockerfile must produce an image that listens on `:8080`, reads the four env vars, and serves `/healthz` + `/readyz`. Owned by streamer.
- portal's Dockerfile must produce a static-serving image with SPA fallback. Owned by qc-portal.
- Both are consumed by `docker compose build`. devops verifies they build and run; if either fails, devops reports evidence upstream and does not patch it.

## Risks / Trade-offs

- **Sequencing dependency** → devops can author compose + nginx.conf + env files now, but acceptance #7 (end-to-end) cannot be proven until streamer's and qc-portal's images build. Mitigation: build the full config now; run a partial bring-up of `valkey` (+ proxy against a portal placeholder if needed) to validate compose syntax and Valkey health early; hold the end-to-end evidence until both images land, and say so explicitly in the done report rather than claiming #7 prematurely.
- **Healthcheck HTTP client in streamer image** → RESOLVED (coordinated with streamer): streamer's minimal image has no shell/curl/wget, so the healthcheck uses their in-image `streamer healthcheck` subcommand (`test: ["CMD", "/streamer", "healthcheck"]`), which GETs `/readyz` internally. No tooling added by devops; no risk remaining.
- **Portal serving model ambiguity (DD2 sub-decision)** → resolved by root D7 (portal owns SPA fallback) but the proxy↔portal port must be confirmed. Mitigation: confirm the portal image's listen port with qc-portal before finalizing nginx upstream.
- **nginx location precedence** → `/streams` vs `/stream/` prefix matching must be verified so portal routes never shadow the API and vice-versa. Mitigation: explicit `location` blocks and a test request for each path class during verification.

## Migration Plan

Greenfield — no data, no rollback surface. Delivery order for the devops piece:
1. Author `docker-compose.yml`, `nginx.conf`, `.env.example`, `.gitignore`, `README.md` (this change, apply phase).
2. Validate compose config (`docker compose config`) and bring up `valkey` alone to confirm its healthcheck.
3. Once streamer's and qc-portal's images build, integrate them and verify acceptance #7 end to end (streamer `/readyz` → 200; portal works through the single origin).
Feature stays pending until this evidence exists; devops never reports #7 done without command output.

## Open Questions

- Portal image's listen port and whether it self-serves static vs. exposes assets for the proxy — confirm with qc-portal (default per root D7: portal self-serves with SPA fallback). **Still open.**
- Confirm `valkey-cli` is present in the pinned `valkey/valkey` tag for the healthcheck (expected yes; verify at implementation).
- None of these block authoring the compose/proxy/env now; they are settled during the apply phase and coordination, not by reopening a frozen contract.

**Resolved via coordination (streamer, race GO):**
- Streamer env var names are locked and match this design verbatim: `VALKEY_ADDR` (required, e.g. `valkey:6379`), `VALKEY_PASSWORD` (default ""), `VALKEY_DB` (default 0), `STREAMER_ADDR` (default `:8080`); streamer fails fast if `VALKEY_ADDR` is missing/unparsable; listen port `:8080`.
- Streamer healthcheck: in-image `streamer healthcheck` subcommand at `/streamer` (no shell/HTTP client needed in the image). devops uses `test: ["CMD", "/streamer", "healthcheck"]`.
