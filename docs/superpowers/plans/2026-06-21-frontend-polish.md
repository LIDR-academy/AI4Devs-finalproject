# Frontend Polish Implementation Plan — Skeletons (#78) + ErrorBoundary (#83)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans. Steps use checkbox (`- [ ]`) tracking.

**Goal:** Reusable loading-skeleton components swapped into the search/property/trips loading states (#78), and a global React `ErrorBoundary` that catches render crashes with a friendly fallback + trace id (#83).

**Architecture:** Three props-less `animate-pulse` skeleton components mirroring `PropertyCard` / property-detail / `TripCard`, used in each page's existing `isLoading` branch. One class `ErrorBoundary` rendered in `layout.tsx` wrapping `{children}` (below `NavigationBar`). All frontend; Tailwind v4 inline.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind v4, lucide-react; vitest + RTL.

**Scope:** Spec `docs/superpowers/specs/2026-06-21-frontend-polish-design.md`. Issues #78, #83. Branch `frontend-polish-skeletons-errorboundary` (created; design committed there). One PR.

**Convention:** every `.tsx` (components/pages/tests) starts with `import React from 'react'`.

---

### Task 1: PropertyCardSkeleton + wire into search loading

**Files:**
- Create: `frontend/src/components/shared/PropertyCardSkeleton.tsx`
- Test: `frontend/src/components/shared/PropertyCardSkeleton.test.tsx`
- Modify: `frontend/src/app/search/page.tsx` (loading branch)
- Test: `frontend/src/app/search/page.test.tsx` (add a loading-state test)

- [ ] **Step 1: Write the failing component test** — create `PropertyCardSkeleton.test.tsx`:

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PropertyCardSkeleton } from './PropertyCardSkeleton';

describe('PropertyCardSkeleton', () => {
  it('renders a pulsing skeleton placeholder', () => {
    render(<PropertyCardSkeleton />);
    const el = screen.getByTestId('property-card-skeleton');
    expect(el).toBeInTheDocument();
    expect(el.className).toContain('animate-pulse');
  });
});
```

- [ ] **Step 2: Run, expect failure** — `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test -- src/components/shared/PropertyCardSkeleton.test.tsx`

- [ ] **Step 3: Implement** — create `PropertyCardSkeleton.tsx`:

```tsx
'use client';

import React from 'react';

/** Loading placeholder mirroring PropertyCard's shape (image + title/location/price/rating). */
export function PropertyCardSkeleton() {
  return (
    <div
      data-testid="property-card-skeleton"
      className="animate-pulse overflow-hidden rounded-lg bg-white shadow-sm"
      aria-hidden="true"
    >
      <div className="aspect-square w-full bg-gray-200" />
      <div className="flex flex-col gap-2 p-3">
        <div className="h-4 w-3/4 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-200" />
        <div className="h-4 w-1/3 rounded bg-gray-200" />
        <div className="h-3 w-1/4 rounded bg-gray-200" />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Wire into the search loading state** — in `frontend/src/app/search/page.tsx`, add the import:
```tsx
import { PropertyCardSkeleton } from '@/components/shared/PropertyCardSkeleton';
```
and replace the `{isLoading && ( … spinner … )}` block (the one with "Loading properties...") with a skeleton grid:
```tsx
            {isLoading && (
              <div className="grid grid-cols-1 gap-4" data-testid="property-grid-loading">
                {Array.from({ length: 8 }).map((_, i) => (
                  <PropertyCardSkeleton key={i} />
                ))}
              </div>
            )}
```

- [ ] **Step 5: Add a search loading test** — in `frontend/src/app/search/page.test.tsx`, add a test that mocks `usePropertySearch` to return `{ data: undefined, isLoading: true, error: null }` (match the file's existing mock mechanism) and asserts a skeleton renders:
```tsx
  it('shows property card skeletons while loading', () => {
    // override usePropertySearch to isLoading: true (use this file's mock style)
    expect(screen.getAllByTestId('property-card-skeleton').length).toBeGreaterThan(0);
  });
```
Adapt the mock override to how the file already controls `usePropertySearch` (read it first). Keep existing tests intact.

- [ ] **Step 6: Run, expect PASS** — `npm run test -- src/components/shared/PropertyCardSkeleton.test.tsx "src/app/search/page.test.tsx"`

- [ ] **Step 7: Commit**
```bash
git add -A && git commit -m "feat(ui): PropertyCardSkeleton + search loading grid (#78)"
```

---

### Task 2: TripCardSkeleton + wire into trips loading

**Files:**
- Create: `frontend/src/components/shared/TripCardSkeleton.tsx`
- Test: `frontend/src/components/shared/TripCardSkeleton.test.tsx`
- Modify: `frontend/src/app/trips/page.tsx` (loading branch)
- Test: `frontend/src/app/trips/page.test.tsx` (update the loading test)

- [ ] **Step 1: Write the failing component test** — create `TripCardSkeleton.test.tsx`:

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { TripCardSkeleton } from './TripCardSkeleton';

describe('TripCardSkeleton', () => {
  it('renders a pulsing skeleton placeholder', () => {
    render(<TripCardSkeleton />);
    const el = screen.getByTestId('trip-card-skeleton');
    expect(el).toBeInTheDocument();
    expect(el.className).toContain('animate-pulse');
  });
});
```

- [ ] **Step 2: Run, expect failure** — `npm run test -- src/components/shared/TripCardSkeleton.test.tsx`

- [ ] **Step 3: Implement** — create `TripCardSkeleton.tsx`:

```tsx
'use client';

import React from 'react';

/** Loading placeholder mirroring TripCard's horizontal shape (thumb + stacked lines). */
export function TripCardSkeleton() {
  return (
    <div
      data-testid="trip-card-skeleton"
      className="flex w-full animate-pulse gap-4 rounded-lg bg-white p-3 shadow-sm"
      aria-hidden="true"
    >
      <div className="h-24 w-24 flex-shrink-0 rounded-md bg-gray-200" />
      <div className="flex flex-1 flex-col gap-2 py-1">
        <div className="h-4 w-2/3 rounded bg-gray-200" />
        <div className="h-3 w-1/3 rounded bg-gray-200" />
        <div className="h-3 w-1/2 rounded bg-gray-200" />
        <div className="h-4 w-1/4 rounded bg-gray-200" />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Wire into the trips loading state** — in `frontend/src/app/trips/page.tsx`, add the import:
```tsx
import { TripCardSkeleton } from '@/components/shared/TripCardSkeleton';
```
and replace the `{isLoading && ( … spinner … )}` block (the one with "Loading your trips…") with:
```tsx
        {isLoading && (
          <ul className="flex flex-col gap-3" data-testid="trips-loading">
            {Array.from({ length: 3 }).map((_, i) => (
              <li key={i}>
                <TripCardSkeleton />
              </li>
            ))}
          </ul>
        )}
```

- [ ] **Step 5: Update the trips loading test** — `frontend/src/app/trips/page.test.tsx` currently has a test asserting the loading text matches `/loading/i`. That spinner is gone. Update that test to assert the skeleton instead:
```tsx
  it('shows trip card skeletons while loading', () => {
    useMyTrips.mockReturnValue({ data: undefined, isLoading: true, error: null });
    render(<TripsPage />);
    expect(screen.getAllByTestId('trip-card-skeleton').length).toBeGreaterThan(0);
  });
```
(Match the file's existing `useMyTrips` mock variable/mechanism.) Keep all other trips tests intact.

- [ ] **Step 6: Run, expect PASS** — `npm run test -- src/components/shared/TripCardSkeleton.test.tsx "src/app/trips/page.test.tsx"`

- [ ] **Step 7: Commit**
```bash
git add -A && git commit -m "feat(ui): TripCardSkeleton + trips loading list (#78)"
```

---

### Task 3: PropertyDetailSkeleton + wire into property loading

**Files:**
- Create: `frontend/src/components/shared/PropertyDetailSkeleton.tsx`
- Test: `frontend/src/components/shared/PropertyDetailSkeleton.test.tsx`
- Modify: `frontend/src/app/property/[id]/page.tsx` (loading branch)
- Test: `frontend/src/app/property/[id]/page.test.tsx` (update the loading test if present)

- [ ] **Step 1: Write the failing component test** — create `PropertyDetailSkeleton.test.tsx`:

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { PropertyDetailSkeleton } from './PropertyDetailSkeleton';

describe('PropertyDetailSkeleton', () => {
  it('renders a pulsing skeleton placeholder', () => {
    render(<PropertyDetailSkeleton />);
    const el = screen.getByTestId('property-detail-skeleton');
    expect(el).toBeInTheDocument();
    expect(el.className).toContain('animate-pulse');
  });
});
```

- [ ] **Step 2: Run, expect failure** — `npm run test -- src/components/shared/PropertyDetailSkeleton.test.tsx`

- [ ] **Step 3: Implement** — create `PropertyDetailSkeleton.tsx`:

```tsx
'use client';

import React from 'react';

/** Loading placeholder mirroring the property detail layout (gallery + title + body + side column). */
export function PropertyDetailSkeleton() {
  return (
    <div
      data-testid="property-detail-skeleton"
      className="mx-auto max-w-5xl animate-pulse px-4 py-8"
      aria-hidden="true"
    >
      <div className="h-96 w-full rounded-xl bg-gray-200" />
      <div className="mt-6 h-8 w-2/3 rounded bg-gray-200" />
      <div className="mt-3 h-4 w-1/2 rounded bg-gray-200" />
      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
        <div className="space-y-3 lg:col-span-2">
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-full rounded bg-gray-200" />
          <div className="h-4 w-5/6 rounded bg-gray-200" />
          <div className="h-4 w-4/6 rounded bg-gray-200" />
        </div>
        <div className="h-64 rounded-xl bg-gray-200" />
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Wire into the property loading state** — in `frontend/src/app/property/[id]/page.tsx`, add the import:
```tsx
import { PropertyDetailSkeleton } from '@/components/shared/PropertyDetailSkeleton';
```
and replace the entire `if (isLoading) { return ( … animate-pulse block … ); }` early-return with:
```tsx
  if (isLoading) {
    return <PropertyDetailSkeleton />;
  }
```

- [ ] **Step 5: Update the property loading test** — `frontend/src/app/property/[id]/page.test.tsx`: if a test asserts the old `property-page-loading` testid, update it to assert `property-detail-skeleton`:
```tsx
    expect(screen.getByTestId('property-detail-skeleton')).toBeInTheDocument();
```
(Match the file's existing mock for `usePropertyDetails` returning `isLoading: true`.) If no loading test exists, add one. Keep other tests intact.

- [ ] **Step 6: Run, expect PASS** — `npm run test -- src/components/shared/PropertyDetailSkeleton.test.tsx "src/app/property/[id]/page.test.tsx"`

- [ ] **Step 7: Commit**
```bash
git add -A && git commit -m "feat(ui): PropertyDetailSkeleton + property loading state (#78)"
```

---

### Task 4: ErrorBoundary + wire into layout

**Files:**
- Create: `frontend/src/components/shared/ErrorBoundary.tsx`
- Test: `frontend/src/components/shared/ErrorBoundary.test.tsx`
- Modify: `frontend/src/app/layout.tsx`

- [ ] **Step 1: Write the failing test** — create `ErrorBoundary.test.tsx`:

```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ErrorBoundary } from './ErrorBoundary';

vi.mock('next/link', () => ({
  default: ({ children, href }: { children: React.ReactNode; href: string }) => <a href={href}>{children}</a>,
}));

function Boom({ traceId }: { traceId?: string }): React.ReactElement {
  const err = new Error('boom') as Error & { traceId?: string };
  if (traceId) err.traceId = traceId;
  throw err;
}

describe('ErrorBoundary', () => {
  let errorSpy: ReturnType<typeof vi.spyOn>;
  beforeEach(() => {
    errorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
  });
  afterEach(() => {
    errorSpy.mockRestore();
  });

  it('renders children when there is no error', () => {
    render(
      <ErrorBoundary>
        <div data-testid="ok">fine</div>
      </ErrorBoundary>,
    );
    expect(screen.getByTestId('ok')).toBeInTheDocument();
    expect(screen.queryByTestId('error-boundary-fallback')).not.toBeInTheDocument();
  });

  it('renders the fallback when a child throws', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument();
    expect(screen.getByTestId('error-retry')).toBeInTheDocument();
  });

  it('shows the trace id when the thrown error carries one', () => {
    render(
      <ErrorBoundary>
        <Boom traceId="trace-123" />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId('error-trace-id')).toHaveTextContent('trace-123');
  });

  it('hides the trace id for a plain error', () => {
    render(
      <ErrorBoundary>
        <Boom />
      </ErrorBoundary>,
    );
    expect(screen.queryByTestId('error-trace-id')).not.toBeInTheDocument();
  });

  it('recovers after Try again when the child no longer throws', async () => {
    const user = userEvent.setup();
    let shouldThrow = true;
    function Child() {
      if (shouldThrow) throw new Error('boom');
      return <div data-testid="recovered">ok</div>;
    }
    render(
      <ErrorBoundary>
        <Child />
      </ErrorBoundary>,
    );
    expect(screen.getByTestId('error-boundary-fallback')).toBeInTheDocument();
    shouldThrow = false;
    await user.click(screen.getByTestId('error-retry'));
    expect(screen.getByTestId('recovered')).toBeInTheDocument();
  });
});
```

- [ ] **Step 2: Run, expect failure** — `npm run test -- src/components/shared/ErrorBoundary.test.tsx`

- [ ] **Step 3: Implement** — create `ErrorBoundary.tsx`:

```tsx
'use client';

import React, { Component, type ErrorInfo, type ReactNode } from 'react';
import Link from 'next/link';

interface ErrorBoundaryProps {
  children: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Catches render-time errors anywhere in its child tree and shows a friendly
 * fallback (Try again + Back to home, plus a trace id when the thrown error is
 * a NormalizedApiError carrying one). Logs to console in development only.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false, error: null };

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, info: ErrorInfo): void {
    if (process.env.NODE_ENV !== 'production') {
      // eslint-disable-next-line no-console
      console.error('ErrorBoundary caught an error:', error, info);
    }
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  render(): ReactNode {
    if (!this.state.hasError) {
      return this.props.children;
    }

    const traceId = (this.state.error as { traceId?: string } | null)?.traceId;

    return (
      <div
        data-testid="error-boundary-fallback"
        role="alert"
        className="mx-auto max-w-md px-4 py-16 text-center"
      >
        <h1 className="text-2xl font-bold text-gray-900">Something went wrong</h1>
        <p className="mt-2 text-sm text-gray-600">
          An unexpected error occurred. You can try again or head back home.
        </p>
        {traceId && (
          <p className="mt-3 text-xs text-gray-400" data-testid="error-trace-id">
            Trace ID: {traceId}
          </p>
        )}
        <div className="mt-6 flex items-center justify-center gap-3">
          <button
            type="button"
            onClick={this.handleReset}
            data-testid="error-retry"
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
          >
            Try again
          </button>
          <Link
            href="/"
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-50"
          >
            Back to home
          </Link>
        </div>
      </div>
    );
  }
}
```

- [ ] **Step 4: Wire into the layout** — in `frontend/src/app/layout.tsx`, add the import:
```tsx
import { ErrorBoundary } from "@/components/shared/ErrorBoundary";
```
and wrap `{children}` (keep `<NavigationBar />` outside the boundary so the nav survives a page crash):
```tsx
        <QueryClientProvider client={queryClient}>
          <NavigationBar />
          <ErrorBoundary>{children}</ErrorBoundary>
        </QueryClientProvider>
```

- [ ] **Step 5: Run, expect PASS** — `npm run test -- src/components/shared/ErrorBoundary.test.tsx`

- [ ] **Step 6: Commit**
```bash
git add -A && git commit -m "feat(ui): global ErrorBoundary with fallback + trace id (#83)"
```

---

### Task 5: Verify + PR

- [ ] **Step 1: Full suite + build**
Run: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test 2>&1 | tail -6 && npm run build 2>&1 | tail -12`
Expected: all vitest tests pass (existing + new); `next build` compiles clean.

- [ ] **Step 2: Push + PR**
```bash
git push -u origin frontend-polish-skeletons-errorboundary
gh pr create --title "Frontend polish — loading skeletons + ErrorBoundary (#78/#83)" --body "<summary: 3 animate-pulse skeleton components (PropertyCard/PropertyDetail/TripCard) swapped into the search/property/trips loading states; a global class ErrorBoundary in layout (below the nav) with Try-again + Back-to-home + trace id (from NormalizedApiError.traceId) + dev console logging. vitest per piece; next build clean. No new Playwright. Design: docs/superpowers/specs/2026-06-21-frontend-polish-design.md>"
```

- [ ] **Step 3: Report** test counts, build result, PR URL. Do NOT close issues (the user closes them).

---

## Self-review
- **Spec coverage:** PropertyCardSkeleton + search wiring (Task 1 ✓); TripCardSkeleton + trips wiring (Task 2 ✓); PropertyDetailSkeleton + property wiring (Task 3 ✓); ErrorBoundary (class, getDerivedStateFromError + componentDidCatch dev-log, fallback with Try-again/Back-home/trace-id) + layout wrap below nav (Task 4 ✓); verify/build (Task 5 ✓). Shimmer = `animate-pulse` per spec; trace id only when present; no Next error.tsx/loading.tsx.
- **Placeholder scan:** all novel code complete; the only "adapt to existing mock" notes are the page-test updates (each page test controls its hook differently — the implementer reads + matches), with concrete assertions specified.
- **Identifier consistency:** testids `property-card-skeleton` / `property-detail-skeleton` / `trip-card-skeleton` / `error-boundary-fallback` / `error-retry` / `error-trace-id`; import paths `@/components/shared/*`; layout wraps `<ErrorBoundary>{children}</ErrorBoundary>` below `<NavigationBar/>`.
