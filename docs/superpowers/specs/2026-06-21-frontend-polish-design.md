# Design: Frontend polish — loading skeletons (#78) + ErrorBoundary (#83)

**Date:** 2026-06-21
**Status:** Approved (brainstorming) — pending implementation plan
**Issues:** #78 (T077 skeleton loading components), #83 (T082 ErrorBoundary)
**Scope:** Frontend only. Phase-7 polish. One PR.

## Context
- Loading states today: `search/page.tsx` shows a spinner; `property/[id]/page.tsx` uses ad-hoc `animate-pulse` blocks; `trips/page.tsx` shows a spinner. No reusable skeleton components.
- No error handling for render crashes: no `ErrorBoundary`, no App-Router `error.tsx`/`global-error.tsx`. An unhandled render error blanks the app.
- `apiClient` normalizes errors to `NormalizedApiError { message, code, status?, traceId? }`.
- `layout.tsx` (`'use client'`) renders `<NavigationBar />` then `{children}` inside `QueryClientProvider`.

## #78 — Loading skeleton components
Three props-less components in `frontend/src/components/shared/`, each mirroring the real component's shape using `animate-pulse` on `bg-gray-200` blocks (Tailwind's built-in pulse is the "shimmer"; matches the existing `animate-pulse` placeholders — no custom keyframe):

- `PropertyCardSkeleton.tsx` — aspect-square image block + title/location/price/rating lines; matches `PropertyCard`. `data-testid="property-card-skeleton"`.
- `PropertyDetailSkeleton.tsx` — gallery block + title + text lines + calendar/price column; matches the property-detail layout. `data-testid="property-detail-skeleton"`.
- `TripCardSkeleton.tsx` — horizontal 24×24 thumb + stacked lines; matches `TripCard`. `data-testid="trip-card-skeleton"`.

**Wiring (replace existing loading UI):**
- `search/page.tsx` `isLoading` → a grid of ~8 `PropertyCardSkeleton` in the existing results grid (replaces the spinner).
- `property/[id]/page.tsx` `isLoading` → `PropertyDetailSkeleton` (replaces the ad-hoc `animate-pulse` block).
- `trips/page.tsx` `isLoading` → ~3 `TripCardSkeleton` (replaces the spinner).

## #83 — ErrorBoundary
A React **class** error boundary at `frontend/src/components/shared/ErrorBoundary.tsx`:
- `state = { hasError: boolean; error: Error | null }`; `static getDerivedStateFromError(error)` → `{ hasError: true, error }`; `componentDidCatch(error, info)` → `console.error(...)` only when `process.env.NODE_ENV !== 'production'`.
- Props: `{ children: ReactNode }`.
- Fallback UI when `hasError` (`data-testid="error-boundary-fallback"`, inline Tailwind):
  - Friendly heading + message ("Something went wrong").
  - **Try again** button (`data-testid="error-retry"`) → `this.setState({ hasError: false, error: null })` to re-render children.
  - **Back to home** link (`href="/"`).
  - A "Trace ID: <id>" line shown only when the caught error carries a `traceId` (a thrown `NormalizedApiError`): read defensively via `(this.state.error as { traceId?: string } | null)?.traceId`. Omitted otherwise.
- Applied once in `layout.tsx`: `<NavigationBar />` then `<ErrorBoundary>{children}</ErrorBoundary>` (inside `QueryClientProvider`), so a page crash shows the fallback while the nav remains usable.

## Testing (vitest + RTL)
- Each skeleton renders its `data-testid`.
- Page loading swaps: with the page's data hook mocked to `isLoading: true`, the page renders the corresponding skeleton testid (search → property-card-skeleton; property → property-detail-skeleton; trips → trip-card-skeleton).
- ErrorBoundary: a child component that throws renders the fallback (heading + Try again); the trace-ID line appears when the thrown error has a `traceId` and is absent for a plain `Error`; clicking **Try again** resets state (after the child stops throwing, children re-render). Suppress the expected `console.error` during these tests.
- **No new Playwright journey** — presentational/resilience components; existing journeys are unaffected.

## Out of scope
- Next App-Router `error.tsx` / `global-error.tsx` / `loading.tsx` files (we use the class boundary + in-component skeletons per the ACs).
- Custom shimmer gradient keyframes (using `animate-pulse`).
- Sending errors to a logging service (console-only, dev).

## Self-review
- Placeholder scan: none. Consistent: skeleton testids + wiring + ErrorBoundary fallback + trace-id + tests align. Scoped to one frontend PR (5 new files + 3 page edits + 1 layout edit). Ambiguities resolved: shimmer → `animate-pulse`; ErrorBoundary placement → single in layout (approved); trace id shown only when present.
