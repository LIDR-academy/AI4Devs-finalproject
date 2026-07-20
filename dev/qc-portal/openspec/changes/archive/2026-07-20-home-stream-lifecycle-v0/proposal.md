## Why

QuickChat has no frontend yet. This change delivers the portal's first user-facing slice — a Home page that lists live streams, a flow to start a stream, and a stream page to end it — so a visitor can drive the whole lifecycle end to end against the `streamer` service. It also stands up the portal's scaffolding (TypeScript + Vite + VanJS + Bun + Tailwind) and its static-serving Dockerfile that later features build on.

This is the qc-portal deliverable for feature `home-stream-lifecycle-v0`. The cross-scope HTTP contract (PRD §6) and runtime topology are already frozen in the team lead's root openspec (`openspec/changes/home-stream-lifecycle-v0/`). This change records only how the portal implements against that frozen record; it never restates the contract as changeable.

## What Changes

Components touched: **Streamings** (Home list + start flow + stream page). **Login** and **Rooms** are untouched in v0 (no auth, no media).

- **Project scaffolding**: stand up the Vite + VanJS + Bun app with strict TypeScript, Tailwind wired to the style-law tokens (ink/paper/surface + grays, Inter + JetBrains Mono, fixed type scale), a client-side router for `/` and `/stream/{id}`, a Vite dev proxy mirroring the same-origin `/streams` path, a multi-stage Dockerfile (Bun build → minimal static image) whose static server does SPA fallback to `index.html`, and a README.
- **Home page (`/`)**: fetch `GET /streams` once on load (no polling), list live streams by **title** (`description` is received and held client-side but not displayed in v0), a calm single-line empty state when the array is empty, and a **Start streaming** primary button (style §6).
- **Start flow**: a single modal (style §4) with a required **title** and optional **description** (≤ 100 Unicode code points, validated client-side via `[...str].length`), headed "Are you sure to start stream?" with primary **Start** / secondary **Cancel**. **Start** → `POST /streams`; on `201` redirect to `/stream/{id}` using the returned `id`; on `400` show a calm inline validation message. **Cancel** → close, send no request, create nothing.
- **Stream page (`/stream/{id}`)**: calm placeholder content and an **End stream** button → `DELETE /streams/{id}`; redirect to `/` on both `204` and `404`. Anonymous in v0: anyone on the page can end the stream.
- **Wire boundary**: a dedicated, non-UI streams API module owns all `fetch` calls, types the `GET`/`POST` payloads, validates responses at the boundary (`unknown` → narrowed), and treats the error body as **opaque** — the portal shows its own calm copy keyed by HTTP status, never surfacing server-provided text.
- **Style-law compliance**: every visible surface built against `CONSTITUTION.style.md` and checked against its §10 litmus test before done.

## Capabilities

### New Capabilities

- `portal-home-stream-lifecycle`: the portal-side behavior for listing live streams, starting a stream through a modal flow, and ending it from the stream page — consuming the frozen §6 HTTP contract at the same-origin `/streams` path, with client-side validation, boundary-typed wire messages, and full style-law compliance.

### Modified Capabilities

<!-- none — greenfield portal, no pre-existing specs -->

## Impact

- **Scope**: qc-portal only. All files created under `dev/qc-portal/`. No other scope is touched.
- **Consumes (frozen contract, not modified here)**: `streamer` HTTP API §6 — `GET /streams`, `POST /streams`, `DELETE /streams/{id}` — reached at the literal same-origin path `/streams` (no `/api` prefix, no CORS, no base-URL env baked into the bundle; a Vite dev proxy mirrors the path locally).
- **Runtime seam with devops**: the reverse proxy routes `/streams*` → streamer and everything else → the portal's static image; the portal's own image performs SPA fallback for client-side routes. Coordinated directly with devops (proxy routing) and streamer (code-point counting), team lead kept informed.
- **New tooling in the portal image**: Tailwind (CSS built inside the multi-stage Dockerfile; expected devops build impact: none). Tailwind v3-vs-v4 resolved via the standing style exception at scaffolding and reported for the openspec record.
- **Constitutions in force**: `CONSTITUTION.md`, `CONSTITUTION.ts.md`, `CONSTITUTION.style.md`.
- **Not involved**: `security`, `users`, LiveKit — no auth, identity, or media in this slice.

## Non-goals

- Authentication, authorization, identity — anonymous streams only in v0.
- Displaying `description` on Home (received and held client-side, shown in a later feature).
- Pagination, search, filtering; realtime updates (no polling, no WebSocket — refresh = reload).
- Stream TTL / auto-expiry; real media on the stream page (placeholder only).
- Dark mode (style §8, out of scope); the Login and Rooms components.
- Any change to the §6 wire contract — it is law; changes route through the team lead.
