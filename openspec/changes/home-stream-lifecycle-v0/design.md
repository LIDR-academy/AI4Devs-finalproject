## Context

First user-facing slice of QuickChat across three scopes (`qc-portal`, `streamer`, `devops`); `security` and `users` are out of scope. The PRD (`prds/home-stream-lifecycle-v0.md`) is approved and its §6 wire contract is law. During intake the three involved teammates reviewed the PRD read-only and surfaced integration/runtime gaps; the human resolved the one genuine cross-scope decision (origin/runtime topology) and the team lead ratified the remaining implementation-detail decisions. This document records those decisions so every teammate implements against the same agreed how. It is the orchestration-level design; each teammate produces its own change with its own design in its own scope.

## Goals / Non-Goals

**Goals:**
- One agreed cross-scope HTTP contract (§6) and one agreed runtime topology, both frozen before delegation.
- A single `docker compose up` brings the whole slice up end to end on one origin.
- Keep each service boring: streamer carries no CORS; the portal bakes no base URL.

**Non-Goals:**
- Auth, identity, realtime, TTL, real media, Valkey persistence (see proposal Non-goals).
- Prescribing intra-service implementation detail that belongs to each teammate's own design (framework choices, file layout, component structure).

## Decisions

### D1 — Runtime topology: containerized portal behind a reverse proxy (human decision)
`docker compose up` runs Valkey + streamer + portal (built to static) + a reverse proxy. The proxy is the single browser-facing origin: `/streams*` → streamer, everything else → portal static with SPA fallback to `index.html`. **Chosen over** (a) Vite-dev-proxy with the portal on host — rejected because the human wants one-command end-to-end; and (b) dev-CORS on streamer — rejected to keep streamer free of CORS logic and an allowed-origins env. Consequence: streamer emits no CORS and handles no OPTIONS; the portal calls the literal same-origin path `/streams` with no base-URL env baked into the bundle.

### D2 — Proxy path routing (qc-portal + devops coordinate, lead guidance)
The proxy routes by path: `/streams` and `/streams/{id}` → streamer; all other paths → portal static. Portal fetches use the literal `/streams` so they match §6 verbatim (no `/api` prefix, no rewrite). Note `/stream/{id}` (a portal route) does not collide with `/streams` (the API). Exact proxy image/config is devops's; the routing rule is agreed here.

### D3 — Description length counting: Unicode code points on both sides
`≤ 100 characters` means code points, validated identically client and server: `[...str].length` in TS, `utf8.RuneCountInString` in Go. **Over** UTF-16 code units (JS default) or bytes (Go `len`) — those disagree on emoji/astral input and would let the client accept what the server 400s.

### D4 — Server-authoritative bounds (streamer-owned, ratified)
Title has no max in §6, so streamer enforces a server-side title max (200 runes) and an 8 KB request-body cap via `http.MaxBytesReader`, returning `400`. The portal need not pre-validate title length; it displays any `400` calmly like any other. Server is the authority.

### D5 — streamer runtime contract (streamer-owned, ratified)
- Env: `VALKEY_ADDR` (required, e.g. `valkey:6379`), `VALKEY_PASSWORD` (default ""), `VALKEY_DB` (default 0), `STREAMER_ADDR` (default `:8080`). Fail fast at startup if `VALKEY_ADDR` is missing/unreachable.
- Health: `GET /healthz` (liveness) and `GET /readyz` (pings Valkey; 200/503). Outside the `/streams` contract. devops gates compose readiness on `/readyz`.
- Error body: `{"error": string}` — one stable message field, same shape for 400/404/405/500. The portal treats it as opaque and shows its own calm copy keyed by HTTP status.
- `id`: 16 random bytes from `crypto/rand`, base64 RawURLEncoding (opaque, URL-safe, ~22 chars).
- Valkey model: a `streams` set of live ids + a `stream:{id}` hash `{title, description}`; add on POST, remove on DELETE, no `KEYS`/`SCAN`. `GET /streams` order is unspecified in v0.
- One justified external dependency: a well-known Valkey/Redis client (hand-rolling RESP + pooling is not "a few lines"); justification recorded in streamer's own change.

### D6 — devops runtime defaults (devops-owned, ratified)
Official `valkey/valkey` pinned to a specific tag, no persistence volume (ephemeral). Valkey runs anonymous (no AUTH) for dev. Committed `.env.example` (non-secret runtime vars) + git-ignored `.env`; no secrets this stage. Streamer host port and Valkey internal-only as devops finalizes once streamer's listen port is fixed (`:8080`).

### D7 — Portal self-owned concerns (qc-portal-owned)
SPA route fallback lives in the portal's own static-serving image. Start-flow presentation is a single modal (style §4). Tailwind version (v3 vs v4) resolved via the portal's standing style exception at scaffolding, reported back for the openspec record; expected devops impact: none (CSS builds inside the portal image).

## Risks / Trade-offs

- Sequencing: the full compose (D1) consumes streamer's and the portal's Dockerfiles, which do not exist yet → streamer and qc-portal build in parallel against §6; devops wires compose and proves acceptance #7 once both images build. devops can author Valkey + proxy skeleton earlier but cannot verify end-to-end until then.
- Anonymous end-stream (anyone can `DELETE`) is an accepted v0 property → documented; changes when `security` enters.
- Unspecified `GET /streams` ordering → the list may appear unordered; acceptance does not require order. Revisit if a product need for newest-first appears (would need a Valkey list/sorted-set).
- Contract drift between portal and streamer → §6 is law; any change routes through the team lead, not a local edit.

## Migration Plan

Greenfield; no data migration, no rollback surface. Delivery order: (1) streamer API + Dockerfile and qc-portal UI + Dockerfile in parallel against §6; (2) devops compose + proxy integrating both images; (3) acceptance #7 verified end to end. Feature stays pending until all three report done with evidence.

## Open Questions

Resolved during the race and recorded here:
- Tailwind version: **v4**, chosen by the human via qc-portal's §11 style exception. CSS-first `@theme` declares the style-law tokens/scale/fonts once; `@tailwindcss/vite`, no `tailwind.config.js`. CSS builds inside the portal image → no devops impact.
- Reverse proxy: **nginx** (official, pinned), chosen by devops over Caddy/Traefik.
- Portal static server: **`portal:3000`** (Bun.serve); SPA fallback owned inside the portal image; proxy forwards non-`/streams` traffic to `:3000`.
- Portal linter/formatter: **Biome** (qc-portal in-scope tooling choice; repo had none configured).

Still open (non-blocking): optional `GET /streams` ordering — only if a product need for deterministic order arises.
