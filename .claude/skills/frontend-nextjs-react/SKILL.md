---
name: frontend-nextjs-react
description: Use when implementing or modifying StayHub frontend code (Next.js 15 App Router + React 19 + TypeScript + TanStack Query + Tailwind + vitest). Encodes service/component patterns, conventions, pitfalls observed in Phase 3+4 (QueryClientProvider in root layout, never hardcode API URLs, memoize TanStack Query params, snake_case JSON contract), AND a `rules/` directory with 70 React/Next.js performance rules across 8 categories (waterfalls, bundle size, server-side, client-side, re-renders, rendering, JS, advanced) — load individual rule files on demand for performance-sensitive work.
---

# StayHub Frontend (Next.js + React) Skill

## Stack

- Next.js 15+ (App Router, NOT Pages Router)
- React 19
- TypeScript (strict mode — no `any`)
- TanStack Query v5 for server state
- Tailwind CSS for styling
- vitest + React Testing Library for tests
- axios via shared `apiClient` for HTTP
- lucide-react for icons
- Mapbox GL JS / `react-map-gl` for maps

## Critical Setup (Already Done — Don't Break It)

- **`QueryClientProvider` MUST live in `frontend/src/app/layout.tsx`** wrapping `{children}`. Without it, ANY component using TanStack Query hooks crashes with "No QueryClient set". (Phase 3 bug.)
- **`apiClient` reads `process.env.NEXT_PUBLIC_API_URL`** from `.env.local` (set to `http://localhost:8080` in dev). Never hardcode URLs in services. Never bypass `apiClient`.
- **CORS is configured server-side** for `http://localhost:3000`. If you add a new origin, update `backend/src/main/kotlin/com/stayhub/infrastructure/config/CorsConfig.kt`.
- **`'use client'` directive** at the top of every component using hooks/state. App Router defaults to server components.

## Reference Files (Copy Patterns From These)

| Want to write… | Read this first |
|---|---|
| Service hook (TanStack Query) | `services/searchService.ts` (memoize note in JSDoc, `enabled` flag, `staleTime`/`gcTime`) |
| Service hook test | `services/searchService.test.ts` (mock `apiClient` via vitest) |
| Form / search input component | `components/search/SearchBar.tsx` (controlled inputs, validation, callback prop) |
| Card / display component | `components/search/PropertyCard.tsx` (props-driven, no internal data fetching) |
| Component with internal data fetch | `components/search/PropertyCard.tsx` calls service hook itself? NO — pass data as prop. Only PAGE-level orchestrators fetch data. |
| Component test | `components/search/PropertyCard.test.tsx` (renders with sample data, asserts content) |
| Page (orchestrator) | `app/search/page.tsx` (reads URL params, calls service hooks, distributes data to children) |
| Page test | `app/search/page.test.tsx` (mocks service hooks, tests routing/state) |
| Map view | `components/search/MapView.tsx` (`react-map-gl`) |

## TanStack Query Patterns

```ts
export function usePropertyDetails(id: string): UseQueryResult<PropertyDetails, Error> {
  return useQuery({
    queryKey: ['propertyDetails', id],          // ID changes → new query
    queryFn: async () => {
      const r = await apiClient.get<PropertyDetails>(`/api/v1/properties/${id}`);
      return r.data;
    },
    enabled: !!id,                               // disabled when id falsy — no premature requests
    staleTime: 1000 * 60 * 5,                    // 5min: details rarely change
    gcTime:    1000 * 60 * 10,
  });
}
```

**MUST do:**
- ✅ `enabled: !!param` to disable queries when input is empty
- ✅ Caller memoizes filter/params object with `useMemo` — TanStack Query treats new object identity as a new key (extra fetches)
- ✅ `queryKey` includes ALL inputs that affect the response

**DON'T:**
- ❌ Build URLs with template strings inside `queryFn` body; use `apiClient` and put params in `params: { ... }`
- ❌ Hardcode `http://localhost:8080`
- ❌ Disable `enabled` based on the *result* of another query — chain via `enabled: !!firstQuery.data`

## Component Conventions

- **Pages own data fetching**, components are display-only and accept props. Exception: `PriceBreakdown` / similar live-update components MAY call their own service hook because they react to date inputs.
- **One component = one file** with co-located test. Tests in same dir as component (`Component.test.tsx`).
- **`'use client'`** at top of any file using `useState`, `useEffect`, `useRouter`, `useSearchParams`, TanStack hooks, event handlers.
- **Tailwind utility classes** — no CSS modules, no inline styles. Common patterns in `components/search/*` for reference.
- **Icons via `lucide-react`** — `import { Wifi, Star, MapPin } from 'lucide-react'`.
- **TypeScript strict** — no `any`. Define types in `src/types/index.ts` or alongside the component.

## JSON Contract

Backend returns **snake_case** JSON. TypeScript types match:

```ts
export interface PropertyDetails {
  id: string;
  property_type: 'apartment' | 'house' | 'villa' | 'cabin' | 'studio';
  nightly_rate_eur: number;
  cleaning_fee_eur: number;
  is_verified: boolean;     // backend: is_verified (NOT _verified)
  unavailable_dates: Array<{ date: string; reason: 'booked'|'blocked'|'held' }>;
  // ...
}
```

OpenAPI source of truth: `specs/001-guest-search-booking/contracts/*.yml`.

## Test Patterns (vitest)

```ts
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

function createWrapper() {
  const qc = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return ({ children }: { children: React.ReactNode }) => (
    <QueryClientProvider client={qc}>{children}</QueryClientProvider>
  );
}

it('renders property card', () => {
  render(<PropertyCard property={sample} onClick={vi.fn()} />, { wrapper: createWrapper() });
  expect(screen.getByText(sample.title)).toBeInTheDocument();
});
```

For tests that call `await import('next/navigation')`, the test function MUST be `async`. (Phase 4 bug.)

When mocking service hooks:
```ts
vi.mock('@/services/propertyService', () => ({
  usePropertyDetails: vi.fn(() => ({ data: sampleDetails, isLoading: false, error: null })),
}));
```

## Journey Coverage (Playwright E2E) — REQUIRED for user journeys

vitest tests here mock the service hooks / `apiClient`, so they verify component and page logic **in isolation** — they never hit a real backend and **cannot** catch integration breakage (a blank page from a backend 500, a CORS/codec failure, a broken redirect). That's a real gap we've been bitten by.

**Rule:** any new or changed **user journey** (a flow that spans pages and real API calls — e.g. search → property → checkout → confirmation) MUST be covered or extended in the Playwright browser E2E (`frontend/tests/e2e/`), which drives the real UI against the real backend + DB. Mocked-hook vitest tests are necessary but **not sufficient** for journey coverage. The E2E navigates via the results list (the Mapbox map uses a dummy token) and completes checkout through the stub payment path. See `docs/superpowers/specs/2026-06-19-e2e-flow-testing-strategy-design.md`.

## Validation Before Marking Task Done

```bash
cd frontend
npm run test          # all tests pass — no `1 failed | N passed`
npm run build         # production build succeeds (TypeScript strict checks)
npm run dev &         # dev server starts
# Open http://localhost:3000/<your-route> in browser, click around,
# verify Network tab calls http://localhost:8080/api/v1/... NOT localhost:3000
# verify no CORS errors, no "No QueryClient set", no console errors
```

If page renders but shows error/blank/console errors, NOT done. (See `WAVE4-PHASE3-LEARNINGS.md`.)

## Pitfalls (Phase 3+4 evidence)

| Mistake | Symptom | Rule |
|---|---|---|
| Forgot `QueryClientProvider` in root layout | "No QueryClient set" runtime error on any page | Provider lives in `app/layout.tsx`. Don't move it. |
| Hardcoded `http://localhost:8080` | Worked locally, broke elsewhere | Always go through `apiClient`; reads `NEXT_PUBLIC_API_URL` |
| Forgot `'use client'` | "Functions cannot be passed directly to client components" | Add `'use client'` at top of any component using hooks/state |
| Missed snake_case in TS type | Field `undefined` in component | Match backend JSON exactly: `nightly_rate_eur`, `unavailable_dates`, etc. |
| Search location not used in API call | "Madrid" search returned Barcelona results | Wire `useGeocode(location)` → bbox → `usePropertySearch` (Phase 3 enhancement) |
| `await` in non-`async` test | "await can only be used inside an async function" | Test function must be `async` if it uses `await import()` |
| Test passes but page blank | Mocked everything, real wiring broken | Open in browser before reporting done |
| Wrong `enabled` flag → unwanted requests | Network tab shows extra calls | `enabled: !!input` or `enabled: !!input.dates && !!input.bbox` |

## Common Mistakes — Self-Check Before Commit

- ❌ Service hook does not memoize when caller passes new object every render → flickering / extra requests
- ❌ Page-level component lacks `'use client'` but uses `useSearchParams`
- ❌ TypeScript `any` anywhere — use `unknown` and narrow, or define a proper type
- ❌ Hardcoded URL or API key (must come from `process.env.NEXT_PUBLIC_*`)
- ❌ Component fetches its own data instead of accepting props (unless it's a self-driving widget like `PriceBreakdown`)
- ❌ Skipped browser verification — `npm run test` passing is necessary but not sufficient

## Performance Rules

For React and Next.js performance patterns (data fetching, bundle size,
re-renders, rendering, server-side caching), this skill includes a `rules/`
directory with **70 rules across 8 categories**, prioritised by impact. Each
rule is a separate markdown file with `incorrect` and `correct` code examples.

Load only the rule(s) relevant to the task at hand — they are designed to be
read individually rather than as a single block.

### Categories (high → low impact)

| Priority | Category | Prefix | When to load |
|---|---|---|---|
| 1 | **Eliminating Waterfalls** | `async-` | New page or service hook that fetches data |
| 2 | **Bundle Size Optimization** | `bundle-` | Adding a heavy dependency (Stripe, charts, calendar, icons) |
| 3 | **Server-Side Performance** | `server-` | Working with Server Components, RSC fetches, server actions |
| 4 | **Client-Side Data Fetching** | `client-` | Adding new TanStack Query hook, listeners, localStorage |
| 5 | **Re-render Optimization** | `rerender-` | Component with derived state, expensive renders, state in callbacks |
| 6 | **Rendering Performance** | `rendering-` | Long lists, hydration, conditional rendering, scripts |
| 7 | **JavaScript Performance** | `js-` | Hot loops, repeated lookups, sort/filter chains |
| 8 | **Advanced Patterns** | `advanced-` | Custom hooks with refs, latest-value patterns |

### Phase 5+ priority loadout (booking + checkout)

When implementing a booking widget, checkout flow, or anything Stripe-adjacent,
load these rules first:

- `rules/async-parallel.md` — parallelise property + availability + price fetches
- `rules/bundle-dynamic-imports.md` — lazy-load Stripe Elements / heavy widgets
- `rules/bundle-barrel-imports.md` — keep icon + UI library imports cheap
- `rules/rerender-derived-state-no-effect.md` — calendar selection, live price
- `rules/rerender-transitions.md` — non-blocking date / filter updates
- `rules/rerender-no-inline-components.md` — avoid defining components inside components
- `rules/rendering-content-visibility.md` — long property lists / review lists

### Full index

See `rules/_sections.md` (upstream sections file) for the complete categorised
index, or `ls rules/` to list all rule files. Files prefixed with an underscore
(`_sections.md`, `_template.md`) are housekeeping, not guidance.

Attribution / licence: `rules/ATTRIBUTION.md`.
