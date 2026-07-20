## 1. Scaffolding & toolchain

- [x] 1.1 Resolve Tailwind v3 vs v4 with the human via the standing style exception; report the choice to the team lead for the openspec record before styling any component.
- [x] 1.2 Initialize the Bun + Vite + VanJS app with strict TypeScript (`strict: true`, `noUncheckedIndexedAccess`), ES modules, named exports; `package.json` scripts for `dev`, `build`, `test`, `typecheck`, `lint`, `format`.
- [x] 1.3 Configure the formatter + linter (repo standard) and confirm `tsc --noEmit`, lint, and format all run clean on the empty scaffold.
- [x] 1.4 Define the style-law theme once in Tailwind: tokens (ink/paper/surface + grays), type scale (12/14/16/20/28/40), fonts (Inter + JetBrains Mono), weights 400/600; no arbitrary values available to components.
- [x] 1.5 Add the Vite dev-server proxy forwarding `/streams*` to a dev-only streamer address from an env var (never baked into the built bundle).
- [x] 1.6 Author the multi-stage Dockerfile (Bun install/build → minimal static-serving image) with SPA fallback to `index.html` for client-side routes; config from env, nothing secret baked in.
- [x] 1.7 Write the README: what it is, `bun install` / `bun run dev` / `bun test`, required env vars, and the same-origin `/streams` runtime note.

## 2. Wire boundary — streams API module (`src/streams/api.ts`)

- [x] 2.1 Define shared wire types for the §6 payloads (`Stream`, `CreateStreamInput`) in one place; model failures as a discriminated result (`{ ok: true, value } | { ok: false, status }`).
- [x] 2.2 Implement `listStreams()`, `createStream(input)`, `endStream(id)` calling the literal `/streams` path; parse each response from `unknown` and validate its shape at the boundary; treat a malformed/non-JSON success body as a failure.
- [x] 2.3 Ensure the error body is never read for display — return status only; no server text surfaced.
- [x] 2.4 Tests: happy paths (200 array, 201 object, 204), error paths (400, 404, malformed/non-JSON body, non-OK status), and boundary validation — deterministic, no real network (mock `fetch` at the boundary). Cover the exact-100 multi-byte code-point case.

## 3. Router (`src/router/`)

- [x] 3.1 Implement a minimal history-API router mapping `/` → Home and `/stream/{id}` → stream page, extracting `id`; expose a single `navigate()` for all redirects.
- [x] 3.2 Tests: path → view resolution, `id` extraction, and `navigate()` behavior (including post-201 and post-delete redirects), deterministic with no real timers.

## 4. Home & start flow (`src/streams/`)

- [x] 4.1 Build the Home view: fetch-once on load via the streams module, render titles in received order (no polling, description not displayed), calm empty-state line, Start streaming primary button. Component stays pure (data in → DOM out); no `fetch` inside it.
- [x] 4.2 Build the start-flow modal (single modal, style §4): required title + optional description fields, "Are you sure to start stream?" heading, primary Start / secondary Cancel; focus trap, `Esc` cancels, focus returns to trigger; motion limited to `opacity` and disabled under `prefers-reduced-motion`.
- [x] 4.3 Wire client-side validation: trim title, block empty title and description > 100 code points (`[...str].length`) with calm inline copy; on Start → `POST` → redirect to `/stream/{id}` on 201; render a calm inline message on 400; Cancel sends nothing.
- [x] 4.4 Tests: renders list + empty state, description hidden, Start success redirects, 400 shows calm copy with no redirect, Cancel sends no request, both client-side validation blocks, exact-100 multi-byte allowed.

## 5. Stream page (`src/streams/`)

- [x] 5.1 Build the stream page (`/stream/{id}`): calm placeholder content + End stream action → `DELETE /streams/{id}`; redirect to `/` on both 204 and 404, no error shown on 404.
- [x] 5.2 Tests: 204 redirects to `/`, 404 redirects to `/` without an error surface.

## 6. Style-law compliance & Definition of Done

- [x] 6.1 Run the `CONSTITUTION.style.md` §10 litmus test across Home, the modal, and the stream page: tokens only, AA contrast, radius 0, hairline borders, no shadows/gradients/blurs, correct fonts/scale/weights, visible focus on every interactive element, calm-or-nothing motion. Fix any violation.
- [x] 6.2 Full suite green: `bun test` passing with new behavior + error paths covered, `tsc --noEmit` clean in strict mode, formatter + linter clean with no inline disables, no `any`/unjustified `as`/`!`/`@ts-ignore` in the diff.
- [x] 6.3 Confirm the Dockerfile builds and the static image serves the app with working SPA fallback (deep link / refresh on `/stream/{id}`); coordinate the `/streams*` proxy routing with devops.
- [x] 6.4 Compile the evidence-based done report (change → tests that prove it → `bun test` + `tsc --noEmit` + lint/format results + explicit style-law compliance statement) for the team lead. Never a bare "done".
