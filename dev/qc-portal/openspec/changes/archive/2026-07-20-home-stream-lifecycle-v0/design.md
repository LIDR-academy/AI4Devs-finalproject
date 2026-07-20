## Context

The portal is greenfield: `dev/qc-portal/` holds only `CLAUDE.md` and this openspec. This change stands up the app and delivers the Streamings slice (Home, start flow, stream page) of feature `home-stream-lifecycle-v0`.

The cross-scope decisions are already frozen in the team lead's root openspec (`openspec/changes/home-stream-lifecycle-v0/` — proposal, design D1–D7, spec). Binding on the portal:

- **§6 wire contract is law**: `GET /streams`, `POST /streams`, `DELETE /streams/{id}` with the exact payloads and status codes. Not restated here as changeable.
- **D1/D2 topology**: single origin behind a reverse proxy; the portal calls the literal same-origin path `/streams` (no `/api`, no rewrite); streamer emits no CORS; no base URL is baked into the bundle.
- **D3 counting**: `description ≤ 100` means Unicode code points, `[...str].length` on the client, matching streamer's `RuneCountInString`.
- **D4 server-authoritative bounds**: streamer may `400` a title the client did not pre-check (e.g. too long); the portal displays any `400` calmly.
- **D5 error body**: `{"error": string}` — the portal treats it as opaque and shows its own status-keyed copy.
- **D7 portal-owned**: SPA fallback in the portal's own static image; start flow is a single modal (style §4); Tailwind version resolved via the style exception at scaffolding.

Constitutions in force: `CONSTITUTION.md`, `CONSTITUTION.ts.md`, `CONSTITUTION.style.md`.

## Goals / Non-Goals

**Goals:**
- A boring, testable portal: UI components are pure (state in → DOM out); every side effect (fetch, navigation, storage) lives in a dedicated non-UI module.
- One typed, validated boundary to the §6 contract; malformed responses fail loudly, not silently.
- Full style-law compliance, verified before done.
- Deterministic tests with no real network (the streams module is injected/mocked at the boundary).

**Non-Goals:**
- Changing or re-specifying the §6 contract, streamer internals, or the proxy image (devops-owned).
- Realtime, polling, pagination, auth, media, dark mode.
- A component/state framework beyond VanJS; no speculative abstractions (Constitution §2).

## Decisions

### D-P1 — Feature-folder layout under `src/`
Structure by feature, not by kind (`CONSTITUTION.ts.md §3`): `src/streams/` (Home view, start-flow modal, stream page, the streams API module, and their `*.test.ts`), `src/router/` (client-side routing), `src/styles/` (Tailwind entry + token theme). Named exports only; no `utils/` dumping ground. **Over** a kind-based `components/`/`services/` split — feature cohesion keeps a mid-level reader oriented without a guide.

### D-P2 — A single `streams` API module owns the wire boundary
All `fetch` calls live in `src/streams/api.ts`; UI components never call `fetch` (`style §9`, `CONSTITUTION.ts.md §6`). It exposes typed functions — `listStreams()`, `createStream(input)`, `endStream(id)` — returning a discriminated result (`{ ok: true, value } | { ok: false, status }`) so callers branch on outcome, not on thrown strings. Responses are parsed from `unknown` and validated (shape of the array/object, `id`/`title` are strings, `description` present) before use; a malformed body is a loud error, not a silent `any`. **Over** scattering `fetch` in views — this is the one place external input crosses the boundary, so it is the one place validation lives (Constitution §10, `CONSTITUTION.ts.md §6`).

### D-P3 — Error body is opaque; copy is client-side and status-keyed
Per D5, the module returns only the HTTP status on failure; it does not read `error` text. UI maps status → calm copy: `400` → inline validation message on the start modal; `404` on delete → silent redirect to `/`; other/non-OK → a single calm generic line. **Over** surfacing server text — keeps the portal independent of streamer's message wording and avoids leaking internals.

### D-P4 — Client-side validation mirrors the server, server stays authoritative
The start modal blocks submit when the trimmed title is empty or `description` exceeds 100 code points (`[...str].length`, per D3). This is UX, not trust: the server re-validates and may still `400` (e.g. title over streamer's server-only max, D4). The modal therefore always has a path to render a returned `400` calmly, not only pre-checked cases. Title is trimmed client-side before send to match the server's trim rule.

### D-P5 — Minimal client-side router for `/` and `/stream/{id}`
A small history-API router maps `/` → Home and `/stream/{id}` → stream page, extracting `id` from the path. Navigation (including post-`201` and post-delete redirects) goes through one `navigate()` function in `src/router/`, keeping routing a side-effect module testable in isolation. No router dependency is added — a few lines of `history.pushState` + `popstate` handling is boring and sufficient (Constitution §6). SPA fallback (any deep link → `index.html`) is handled by the static server in the Dockerfile, not the router.

### D-P6 — Same-origin path, Vite dev proxy locally
The app calls `/streams` verbatim (relative), so it works identically behind the production reverse proxy (D1) and needs no base-URL env in the bundle. For local `bun run dev`, a Vite dev-server proxy forwards `/streams*` to a streamer address taken from an env var (dev-only, not baked into the built bundle). **Over** an absolute URL or a build-time base — relative paths make the bundle origin-agnostic and CORS-free.

### D-P7 — Tailwind tokens are the style law, defined once
The style-law palette, type scale, and font families are declared once in the Tailwind theme; components compose utilities only — no arbitrary colors/sizes, no static inline `style=` (`style §2/§5/§9`). Semantic states use text + icon + weight, never color. Primary/secondary buttons, inputs, and focus rings follow style §6. The v3-vs-v4 choice is taken directly with the human via the standing style exception at scaffolding and reported back for the openspec record; expected devops impact: none (CSS builds inside the portal image).

### D-P8 — Start flow is a single modal
One modal (style §4: `ink` scrim at low opacity, 0 radius, `1px gray-line` border) holds the title + description fields under the heading "Are you sure to start stream?" with primary **Start** / secondary **Cancel** — not a separate two-step confirm. Cancel closes and sends nothing. Focus is trapped and returned to the trigger on close; `Esc` cancels; motion is limited to `opacity` per style §7 and disabled under `prefers-reduced-motion`.

## Risks / Trade-offs

- **Server rejects input the client allowed (D4, e.g. long title)** → the start modal always renders a returned `400` as calm inline copy; it never assumes client validation is sufficient.
- **Malformed / non-JSON response from streamer** → the boundary module validates and returns a failure result; the UI shows the generic calm line instead of crashing or rendering `undefined`.
- **`GET /streams` ordering is unspecified in v0** → Home renders in received order and does not assume newest-first; no test asserts order.
- **Tailwind version undecided at proposal time** → isolated to the theme config and build; resolved before any component is styled, so it blocks nothing downstream. Reported to the team lead once chosen.
- **Deep-link / refresh on `/stream/{id}`** → depends on the static server's SPA fallback (Dockerfile), which is verified as part of this change, not left to devops.
- **Anonymous end-stream (anyone can DELETE)** → accepted v0 property from the frozen record; documented, changes when `security` enters.

## Migration Plan

Greenfield — no data migration, no rollback surface. Order within this change: (1) scaffold app + Tailwind tokens + Dockerfile/static-serving with SPA fallback + README; (2) streams API boundary module with tests; (3) router; (4) Home, start modal, stream page with tests; (5) style-law litmus pass; (6) full `bun test` + `tsc --noEmit` + linter/format clean. The portal builds in parallel with streamer against §6; end-to-end verification through the proxy is devops's compose step (acceptance #7), gated on both images existing.

## Open Questions

None blocking. Deferred and portal-owned, to be recorded when settled: Tailwind v3 vs v4 (resolved with the human via the style exception at scaffolding). The reverse-proxy image/config is devops-owned and out of this scope.
