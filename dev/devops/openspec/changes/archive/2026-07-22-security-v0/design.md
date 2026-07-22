## Context

devops implementation design for `security-v0`, the first all-hands feature, building on the shipped runtime (single-origin nginx proxy; streamer + Valkey; portal; LiveKit + coturn media). The cross-scope decisions are frozen in the root record: D1 (SuperTokens managed cloud, human-supplied creds via untracked env), D2 (header Bearer + local JWKS verification, `SECURITY_JWKS_URL`), D3 (security↔users internal contract, users compose-internal only), D5 (ownership cleanup). This document records the devops-owned *how* for the runtime: the Mongo/security/users services, `/auth/*` routing, env wiring + secret hygiene, and ordering. It does not reopen those.

Hard constraint: devops is READ-ONLY on all service code, including Dockerfiles. This design consumes security's and users' Dockerfiles and their env/JWKS contracts; it never edits them.

## Goals / Non-Goals

**Goals:**
- Stand up the full auth-enabled stack with one `docker compose up`.
- MongoDB internal-only for users; the human's SuperTokens creds injected without ever being committed.
- Browser `/auth/*` on the single origin; streamer able to reach security's JWKS internally.
- Sensible ordering (users→Mongo healthy; streamer tolerant of security starting later).

**Non-Goals:**
- Any change to service code/Dockerfiles (read-only) or the shipped app/media routing beyond adding `/auth`.
- Self-hosted SuperTokens, Postgres, Mailpit (managed cloud does core + storage + email).
- Publishing Mongo/users to the host; Mongo persistence (ephemeral for dev).

## Decisions

### DD1 — Mongo service: official image, internal-only, ephemeral, dev creds
Official `mongo` pinned to a specific tag, on the compose network as `mongo`, port 27017, **no published host port** (internal-only per PRD). DEV-ONLY root credentials via `MONGO_INITDB_ROOT_USERNAME`/`MONGO_INITDB_ROOT_PASSWORD` from env (labeled DEV-ONLY, like the LiveKit/coturn dev creds). **Ephemeral (no volume)** — consistent with the ephemeral dev env (Valkey, streams). Documented; a named volume is a one-line change if persistence is later wanted. Healthcheck via `mongosh --eval "db.adminCommand('ping')"`. **Chosen over** a persistent volume: dev consistency + no stale dev users; over a host-published port: users/Mongo must never be reachable from the host/portal (PRD §5.2).

### DD2 — Mongo env contract with users (coordinated, done)
Supply `users`: `MONGO_URI=mongodb://<devuser>:<devpass>@mongo:27017/?authSource=admin` and `MONGO_DB=quickchat`, plus its internal listen addr. Single URI (not split) — the boring standard; `authSource=admin` because the root user authenticates against admin. users owns the var names (it reads them); devops supplies values verbatim. Confirmed with users: single MONGO_URI + MONGO_DB, host `mongo:27017`, users listens `:8080` internal.

### DD3 — security + users services (consumed builds)
`security` builds from `../security`, `users` from `../users` (their Dockerfiles — read-only). Both are internal Go services. `users` is never published. `security` is internal but reached by the browser through the proxy for `/auth/*` (DD4) and by `streamer` internally for JWKS. Both default to `:8080` in their own containers (no conflict; addressed by service name). Exact ports/paths confirmed with the owners.

### DD4 — `/auth/*` routing on the single origin
The portal's `supertokens-web-js` calls `/auth/*` from the browser, so nginx SHALL route `location /auth` (and the `/auth/` prefix) to `security` — same style as `/streams` → streamer, verbatim path, no rewrite, no CORS. Preserve the existing routing (`= /streams`, `/streams/`, room WS regex, `/` → portal). The app stays single-origin; LiveKit media is the only separate origin. Note the WS auth token now rides in the `join` frame (no proxy change — the room WS location already upgrades).

### DD5 — Secret hygiene: SuperTokens creds human-supplied, never committed (AC7)
`security` needs `SUPERTOKENS_CONNECTION_URI` + `SUPERTOKENS_API_KEY` — REAL managed-cloud credentials the human supplies. These go in the **git-ignored `.env`** only; `.env.example` carries **empty placeholders** + a clear "put your real SuperTokens values in `.env` (never commit)" instruction. In compose they are `${VAR:-}` (render empty if unset) so routine compose commands (config/ps/down) stay usable without creds; the **`security` service fail-fasts at startup** with a clear log if they are empty (security owns that check — confirmed in coordination). The key never appears in a committed file, a log, or a response (security owns not-logging it; devops owns not-committing it). Dev Mongo/other creds keep `${VAR:-default}` dev defaults; only the SuperTokens creds are human-mandatory (empty default, no dev fallback).

### DD6 — Startup ordering
- `users depends_on mongo: service_healthy` — never starts before Mongo is ready.
- `streamer`: needs security's JWKS, but MUST NOT deadlock if security is slower to start. Per D2, streamer fetches JWKS at startup + refreshes with retry. So gate at most `streamer depends_on security: service_started` (or no dependency) — NOT `service_healthy`. Confirm with streamer that it tolerates a not-yet-ready JWKS (retry) so `docker compose up` converges regardless of security/streamer start order.
- `security` depends on nothing in-stack that would block it (it talks to the managed cloud, external).
- Proxy already gates on streamer/portal healthy; add security to its `depends_on` (service_started) so `/auth` upstream exists when the origin comes up.

### DD7 — What devops does NOT own (consumed contracts)
- security's Dockerfile, `/auth/*` + JWKS endpoint paths, SuperTokens env var names.
- users' Dockerfile, `MONGO_URI`/`MONGO_DB` reads, internal API.
- streamer's `SECURITY_JWKS_URL` read + JWKS retry behavior; the JWT claim set.
All consumed at runtime; issues are reported upstream with evidence, never patched here.

## Risks / Trade-offs

- **External dependency (human creds)** → the AC1 real magic-link loop can't run until the human puts real SuperTokens creds in `.env`. Mitigation: author compose/env/proxy now; validate structure with `docker compose config` + a Mongo-only bring-up; run the auth E2E once creds + images land. Fail-fast on missing creds so it's obvious.
- **Secret leakage** → SuperTokens key must never be committed/logged. Mitigation: placeholders-only in `.env.example`, real values in git-ignored `.env`, grep-verify no secret in committed files (AC7).
- **Ordering deadlock** → gating streamer on security-healthy could deadlock if security is slow. Mitigation: streamer tolerates JWKS-not-ready with retry (D2); devops uses service_started at most (DD6) — confirm with streamer.
- **Missing Dockerfiles** → security + users are greenfield; their images don't exist yet. Mitigation: stated sequencing dependency; E2E waits on both images.
- **Breaking contract regression** → creatorKey retirement ripples through shipped features; AC8 regression sweep is cross-scope. devops's part: the env comes up and the full stack runs; behavior verification is the services' + the regression sweep's.

## Migration Plan

Additive services (mongo, security, users) + env wiring + `/auth` routing. No data migration (ephemeral). Delivery: author compose/env/proxy/docs now; validate `docker compose config` + Mongo-only bring-up (healthy) without the app images. Once security's + users' images build AND the human supplies SuperTokens creds, run the full auth E2E (magic-link loop) + the AC8 regression sweep. Feature pending until all five report done with evidence.

## Open Questions

- security's exact `/auth` JWKS path for `SECURITY_JWKS_URL` and its listen port — confirm with security (expected `http://security:8080/auth/jwt/jwks.json`).
- streamer's confirmation that it retries a not-yet-ready JWKS so ordering can stay service_started — confirm with streamer.
- Neither blocks authoring compose/proxy/env now; both settle during coordination / apply.
