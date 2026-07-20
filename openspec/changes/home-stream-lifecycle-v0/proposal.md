## Why

QuickChat has no user-facing surface yet. This delivers the first usable slice — see who is live, start a stream, end it — so the platform is demonstrably working end to end before authentication and real media arrive. It also stands up the first real runtime (Valkey + streamer + portal behind a reverse proxy) that later features build on.

This is an orchestration-level change: it records the resolved cross-scope contract and decisions for the `home-stream-lifecycle-v0` feature (PRD `prds/home-stream-lifecycle-v0.md`). Each involved teammate runs its own openspec change for its deliverable against this record.

## What Changes

- **Home page (`/`)** in qc-portal: fetches `GET /streams` once on load (no polling), lists live streams by **title**; calm empty state when none; **Start streaming** primary button.
- **Start flow**: title (required, non-empty) + optional description (≤ 100 chars), confirmation "Are you sure to start stream?" with Start / Cancel; `POST /streams` → on 201 redirect to `/stream/{id}`; Cancel sends nothing.
- **Stream page (`/stream/{id}`)**: placeholder content + **End stream** → `DELETE /streams/{id}` → redirect to `/` on 204 or 404. Anonymous: anyone can end (v0).
- **streamer HTTP API** per the §6 wire contract (`GET/POST/DELETE /streams`) backed by **Valkey as private storage** (never leaked in responses); plus `/healthz` and `/readyz`.
- **Runtime (single origin)**: a reverse proxy fronts the containerized portal (built static) and streamer; `docker compose up` brings **Valkey + streamer + portal + proxy** up end to end. Streamer emits **no CORS**; no base URL is baked into the portal bundle.
- **Scopes touched**: `qc-portal`, `streamer`, `devops`. **NOT touched**: `security`, `users` (no auth, no identity — anonymous streams confirmed for this stage).
- **Cross-scope wire contract is LAW** (§6): frozen; any change routes back through the team lead.
- Greenfield — nothing pre-exists, so no breaking changes.

### Non-goals

Authentication / authorization / identity; pagination, search, filtering; realtime updates (refresh = reload); stream TTL / auto-expiry; real media/streaming (the stream page is a placeholder); Valkey persistence (ephemeral, no volume).

## Capabilities

### New Capabilities

- `home-stream-lifecycle`: the cross-scope behavior and HTTP wire contract for listing live streams, starting a stream (title + optional description), and ending it — anonymous, ephemeral, served on a single origin. This is the authoritative contract all three teammates implement against.

### Modified Capabilities

<!-- none — greenfield, no existing specs -->

## Impact

- **qc-portal**: Home, start flow, stream page; own Dockerfile (multi-stage bun build → static); Vite dev proxy mirroring same-origin `/streams`; consumes §6 at same-origin path `/streams`. Constitutions: `CONSTITUTION.md`, `CONSTITUTION.ts.md`, `CONSTITUTION.style.md`.
- **streamer**: HTTP API + Valkey storage; `/healthz` (liveness) + `/readyz` (Valkey ping); own Dockerfile; reads env `VALKEY_ADDR` (required), `VALKEY_PASSWORD` (default ""), `VALKEY_DB` (default 0), `STREAMER_ADDR` (default `:8080`); fails fast if `VALKEY_ADDR` missing/unreachable. Constitutions: `CONSTITUTION.md`, `CONSTITUTION.go.md`.
- **devops**: compose wiring Valkey + streamer + portal + reverse proxy; proxy routes `/streams*` → streamer, everything else → portal static (SPA fallback); ephemeral Valkey on a pinned `valkey/valkey` tag (no volume); committed `.env.example` + git-ignored `.env` (no secrets this stage). Read-only on all service code. Constitution: `CONSTITUTION.md`.
- **External systems**: Valkey (new to the running environment). No SuperTokens, MongoDB, or LiveKit in this slice.
