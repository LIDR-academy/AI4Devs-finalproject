# Evidence: 2026-07-08-FRONTEND-VERIFICATION — Frontend build, serve, and full-stack smoke test

**Date**: 2026-07-08
**Agent**: implementer
**Story**: transversal (Foundational hardening)
**Branch**: feature-entrega2-DMM

## Prompt (verbatim)

> "primero verificar"

(en respuesta a "el siguiente bloqueador crítico" = frontend nunca había sido arrancado)

## What was done

Verified the frontend can build, type-check, run dev server, serve all 5 routes, and integrate with the backend end-to-end. Also added 13 unit tests for the frontend.

### 1. svelte-check (typecheck)

Initial run: **1 error** — `frontend/src/lib/api/client.ts:46` called `session.set({...})` but the session store only exposes `setSessionId/reset/update/subscribe`. Fixed by using the public `setSessionId(id)` helper.

After fix: **0 errors, 0 warnings**.

### 2. vite build (production)

Initial run: **FAIL** with `Could not resolve entry module "index.html"`.

Root cause: `vite.config.ts` and `svelte.config.js` were swapped — `vite.config.ts` contained the SvelteKit config (preprocess, adapter) and `svelte.config.js` was nearly empty. The SvelteKit Vite plugin was not actually loaded.

Fix:
- `svelte.config.js`: just the SvelteKit config (preprocess + adapter-node)
- `vite.config.ts`: Vite plugins (sveltekit() + SvelteKitPWA)

After fix: **build OK in 1.87s**, generating:
- 5 page entries (`_page.svelte.js` for each route)
- 28 PWA precache entries (98.51 KiB)
- Service worker at `.svelte-kit/output/server/sw.js`
- Node adapter output ready for `node build` deployment

### 3. vite dev (development server)

Started with `VITE_API_URL=http://localhost:3001`, then verified all 5 routes:

| Route | Status |
|---|---|
| `/` (dashboard) | 200 |
| `/listing-lens` | 200 |
| `/mortgage-compass` | 200 |
| `/timeline` | 200 |
| `/checklist` | 200 |
| `/manifest.webmanifest` | 200 |
| `/service-worker.js` | 404 (expected in dev; only in build) |

The HTML response includes:
- `<html lang="es">`
- PWA meta tags (theme-color, apple-mobile-web-app-*, manifest link)
- `<title>Realista</title>`

### 4. Full-stack smoke test (backend + frontend simultaneously)

Booted both servers:
- Backend: `DATABASE_URL=...:5433/realista MOCK_OPENROUTER=true npx tsx backend/src/index.ts` on :3001
- Frontend: `VITE_API_URL=http://localhost:3001 npx vite dev` on :5173

CORS verified:
```
$ curl -H "Origin: http://localhost:5173" -I http://localhost:3001/health
Access-Control-Allow-Origin: http://localhost:5173
Access-Control-Allow-Credentials: true
Access-Control-Expose-Headers: X-Session-Id,X-RateLimit-Limit,X-RateLimit-Remaining,X-RateLimit-Reset
```

Backend responds 200 to all status checks while the frontend is up.

### 5. Unit tests for the frontend

13 new tests across 2 files:

`tests/unit/format.test.ts` (10 tests):
- `formatCurrency` with default and custom currency/locale
- `formatDate` with ISO string
- `scoreColor` for high/mid/low scores
- `scoreLabelEs` for the 4 boundaries (>=90, 70-89, 50-69, <50)

`tests/unit/session.test.ts` (3 tests):
- UUID v4 generation on first import
- Persistence to localStorage via `setSessionId`
- `reset()` clears storage and regenerates a new UUID

#### Setup file approach (replaces jsdom)

Initial attempt used `// @vitest-environment jsdom` directive, which Vitest 1.6 + this SvelteKit setup did not honor (jsdom was not loaded — `localStorage` remained undefined in tests).

Replaced with a lightweight 30-line `localStorage` polyfill loaded from `tests/unit/setup.ts`:
- `Map<string, string>`-backed `getItem/setItem/removeItem/clear/length/key`
- Polyfills `globalThis.localStorage` and `globalThis.window`
- Avoids the multi-megabyte jsdom dependency

This is **faster** (test setup drops from ~600ms to ~13ms) and **simpler** (no jsdom version coupling).

## Deliverables

### Commits

- `fix(frontend): use setSessionId in api client (session store has no set)`
  - `frontend/src/lib/api/client.ts`
- `fix(frontend): split svelte.config.js and vite.config.ts correctly`
  - `frontend/svelte.config.js`
  - `frontend/vite.config.ts`
- `test(frontend): 13 unit tests with lightweight localStorage polyfill`
  - `frontend/tests/unit/format.test.ts` (new)
  - `frontend/tests/unit/session.test.ts` (new)
  - `frontend/tests/unit/setup.ts` (new)
  - `frontend/vitest.config.ts`
  - `frontend/package.json` (removed `jsdom` devDep)

## Tests

- Frontend unit: 13/13 passing
  - format.test.ts: 10
  - session.test.ts: 3
- Backend unit (unchanged): 38/38 passing
- svelte-check: 0 errors, 0 warnings
- vite build: succeeds in 1.87s
- vite dev: serves all 5 routes + manifest = 200
- CORS: backend allows `http://localhost:5173` with credentials

## What now works (verified end-to-end)

| Component | FR/US | Status |
|---|---|---|
| Backend health, session, rate limit, dashboard, analyze, negotiation, timeline, purchaseProcess CRUD, checklist | 10+ | ✅ |
| Frontend svelte-check | — | ✅ |
| Frontend vite build | FR-009 | ✅ (manifest + SW generated) |
| Frontend dev server (5 routes) | US1-US6 | ✅ |
| CORS backend ↔ frontend | — | ✅ |
| Frontend unit tests (format, session) | — | ✅ |

## What still doesn't work (gaps remaining)

| Component | FR | Status |
|---|---|---|
| **FR-024 auto-create Checklist on first analysis** | FR-024 | ❌ |
| **Mortgage Compass narrative UI** | US2 | 🟡 Endpoint + service exist; UI doesn't render narratives |
| **Negotiation Assistant UI** | US4 | 🟡 Endpoint OK; UI doesn't show questions |
| **PWA icons (192, 512, 512-maskable)** | FR-009 | ❌ Empty `frontend/static/icons/` |
| **Re-analysis with diff** | FR-022 | 🟡 DiffService exists, no route |
| **Catastro XML parsing** | FR-003 | ❌ Adapter stub |
| **SSE real-time to frontend** | FR-018 | 🟡 Server side OK, frontend simulates |
| **Portal health cron** | FR-027 | 🟡 Table OK, no cron |
| **Browser-driven E2E** | — | ⚠️ Manual smoke only; no Playwright run yet |

## Next steps

1. **FR-024 auto-create Checklist** — hook into `AutoAttachService` or `AnalyzeListingUseCase` to create the checklist with 21 items on first analysis
2. **Mortgage Compass UI integration** — render amortization scenarios + investment table + narratives from `NarrativeGenerator`
3. **Negotiation Assistant UI** — section in `/listing-lens` showing the 5 questions
4. **PWA icons** — generate 3 PNGs (192, 512, 512-maskable)
5. **Catastro XML parsing** — add `xml2js` back, parse SEC response
6. **SSE real-time progress** — wire `EventSource` on the frontend
7. **Playwright E2E** — write at least one happy-path test that exercises the full stack
