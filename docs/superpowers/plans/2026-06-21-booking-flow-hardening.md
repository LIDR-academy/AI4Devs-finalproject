# Booking-flow UX Hardening Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Close the real gaps in three booking-flow hardening tickets — past-date validation in `SearchBar` (#80), an app-wide 401→login redirect (#81), and hold-expiry auto-redirect + expired banner (#82).

**Architecture:** Frontend only. Each change is small and follows existing patterns (inline errors/banners, no toast lib; `data-testid`s for testability). The 401 handling lives in the shared `apiClient` response interceptor (the composition seam). Each task is TDD'd against the existing co-located `*.test.tsx` and verified with `npm run test` + `npm run build`.

**Tech Stack:** Next.js 15 (App Router) + React 19 + TypeScript + Tailwind + axios + TanStack Query; vitest + React Testing Library.

**Scope:** Spec `docs/superpowers/specs/2026-06-21-booking-flow-hardening-design.md`. Issues #80/#81/#82. Much was already built (see spec) — this covers only the gaps.

**Branch:** `booking-flow-hardening` (already created; the design doc is committed there). One PR.

**Convention reminder:** every `.tsx` (components/pages/tests) starts with `import React from 'react'` (vitest classic JSX transform). All five target test files already exist — EXTEND them.

---

### Task 1: #80 — Past-date validation in SearchBar

**Files:**
- Modify: `frontend/src/components/search/SearchBar.tsx`
- Test: `frontend/src/components/search/SearchBar.test.tsx` (extend)

- [ ] **Step 1: Write the failing tests** — append inside the existing top-level `describe` in `SearchBar.test.tsx`:

```tsx
  // Local yyyy-mm-dd for "today" (mirrors the component's computation).
  function todayLocalIso(): string {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }
  function futureIso(days: number): string {
    const d = new Date();
    d.setDate(d.getDate() + days);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  }

  it('sets the check-in min attribute to today', () => {
    render(<SearchBar onSearch={vi.fn()} />);
    expect(screen.getByLabelText('Check-in')).toHaveAttribute('min', todayLocalIso());
  });

  it('blocks submit and shows an inline error for a past check-in', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    fireEvent.change(screen.getByLabelText('Check-in'), { target: { value: '2020-01-01' } });
    fireEvent.blur(screen.getByLabelText('Check-in'));
    expect(screen.getByTestId('search-error')).toBeInTheDocument();
    fireEvent.click(screen.getByTestId('search-submit'));
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('blocks submit when check-out is not after check-in', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    const ci = futureIso(5);
    fireEvent.change(screen.getByLabelText('Check-in'), { target: { value: ci } });
    fireEvent.change(screen.getByLabelText('Check-out'), { target: { value: ci } });
    fireEvent.click(screen.getByTestId('search-submit'));
    expect(screen.getByTestId('search-error')).toBeInTheDocument();
    expect(onSearch).not.toHaveBeenCalled();
  });

  it('submits a valid future range with no error', () => {
    const onSearch = vi.fn();
    render(<SearchBar onSearch={onSearch} />);
    fireEvent.change(screen.getByLabelText('Check-in'), { target: { value: futureIso(5) } });
    fireEvent.change(screen.getByLabelText('Check-out'), { target: { value: futureIso(8) } });
    fireEvent.click(screen.getByTestId('search-submit'));
    expect(onSearch).toHaveBeenCalledTimes(1);
    expect(screen.queryByTestId('search-error')).not.toBeInTheDocument();
  });

  it('clears check-out when check-in moves to or past it', () => {
    render(<SearchBar onSearch={vi.fn()} />);
    fireEvent.change(screen.getByLabelText('Check-in'), { target: { value: futureIso(5) } });
    fireEvent.change(screen.getByLabelText('Check-out'), { target: { value: futureIso(8) } });
    fireEvent.change(screen.getByLabelText('Check-in'), { target: { value: futureIso(10) } });
    expect(screen.getByLabelText('Check-out')).toHaveValue('');
  });
```

Ensure the test file imports `fireEvent` and `screen` from `@testing-library/react` and `vi` from `vitest` (add to the existing import if missing).

- [ ] **Step 2: Run, expect failures**

Run: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test -- src/components/search/SearchBar.test.tsx`
Expected: the new tests FAIL (no `min` today, no `search-error`, `alert`-based submit still fires onSearch / no inline error).

- [ ] **Step 3: Implement** — edit `SearchBar.tsx`:

(a) Add an `error` state next to the others (after line 40 `const [guests, setGuests] = useState(1);`):
```tsx
  const [error, setError] = useState<string | null>(null);

  // Local yyyy-mm-dd "today" — used to disable past check-in dates.
  const todayIso = (() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
  })();

  const validateDates = (ci: string, co: string): string | null => {
    if (ci && ci < todayIso) return "Check-in date can't be in the past";
    if (ci && co && co <= ci) return 'Check-out date must be after check-in date';
    return null;
  };
```

(b) Replace `handleCheckInChange` (lines 52-54) with one that clears a now-invalid check-out and resets the error:
```tsx
  const handleCheckInChange = (e: ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setCheckInDate(value);
    if (checkOutDate && value && checkOutDate <= value) {
      setCheckOutDate('');
    }
    setError(null);
  };
```

(c) Replace `handleCheckOutChange` (lines 59-61) to clear the error on edit:
```tsx
  const handleCheckOutChange = (e: ChangeEvent<HTMLInputElement>) => {
    setCheckOutDate(e.target.value);
    setError(null);
  };
```

(d) Replace the `handleSubmit` validation block (lines 83-87) — drop the `alert`:
```tsx
    const validationError = validateDates(checkInDate, checkOutDate);
    if (validationError) {
      setError(validationError);
      return;
    }
```

(e) Add `min={todayIso}` and an `onBlur` to the check-in input (line 126-132 block) so it reads:
```tsx
          <input
            id="check-in"
            type="date"
            min={todayIso}
            value={checkInDate}
            onChange={handleCheckInChange}
            onBlur={() => setError(validateDates(checkInDate, checkOutDate))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
```

(f) Add an `onBlur` to the check-out input (line 140-147 block), keeping its existing `min={checkInDate}`:
```tsx
          <input
            id="check-out"
            type="date"
            min={checkInDate}
            value={checkOutDate}
            onChange={handleCheckOutChange}
            onBlur={() => setError(validateDates(checkInDate, checkOutDate))}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
```

(g) Render the inline error — insert immediately after the closing `</div>` of the grid (after line 188, before the Search Button block at line 190):
```tsx
      {error && (
        <p data-testid="search-error" role="alert" className="mt-3 text-sm text-red-600">
          {error}
        </p>
      )}
```

- [ ] **Step 4: Run, expect PASS**

Run: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test -- src/components/search/SearchBar.test.tsx`
Expected: all SearchBar tests pass (existing + 5 new).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(search): past-date validation + inline error in SearchBar (#80)"
```

---

### Task 2: #81 — Global 401 → login redirect in apiClient

**Files:**
- Modify: `frontend/src/services/apiClient.ts`
- Test: `frontend/src/services/apiClient.test.ts` (extend)

- [ ] **Step 1: Write the failing tests** — append to `apiClient.test.ts`. Add `maybeRedirectOnUnauthorized` to the existing `import { ... } from './apiClient'`:

```ts
describe('maybeRedirectOnUnauthorized', () => {
  const realLocation = window.location;

  function stubLocation(pathname: string, search = '') {
    Object.defineProperty(window, 'location', {
      configurable: true,
      value: { pathname, search, assign: vi.fn() },
    });
  }

  afterEach(() => {
    Object.defineProperty(window, 'location', { configurable: true, value: realLocation });
    vi.restoreAllMocks();
  });

  function axios401(url: string) {
    return { isAxiosError: true, response: { status: 401 }, config: { url } };
  }

  it('redirects to /login with the current path on a 401 from a non-auth endpoint', () => {
    stubLocation('/booking/checkout', '?propertyId=p1');
    const removeSpy = vi.spyOn(window.localStorage, 'removeItem');

    maybeRedirectOnUnauthorized(axios401('/api/v1/bookings'));

    expect(removeSpy).toHaveBeenCalledWith('auth_token');
    expect(window.location.assign).toHaveBeenCalledWith(
      '/login?redirect=' + encodeURIComponent('/booking/checkout?propertyId=p1'),
    );
  });

  it('does NOT redirect on a 401 from the login endpoint', () => {
    stubLocation('/login');
    maybeRedirectOnUnauthorized(axios401('/api/v1/auth/login'));
    expect(window.location.assign).not.toHaveBeenCalled();
  });

  it('does NOT redirect when already on /login', () => {
    stubLocation('/login', '?redirect=%2Ftrips');
    maybeRedirectOnUnauthorized(axios401('/api/v1/bookings'));
    expect(window.location.assign).not.toHaveBeenCalled();
  });

  it('ignores non-401 errors', () => {
    stubLocation('/trips');
    maybeRedirectOnUnauthorized({ isAxiosError: true, response: { status: 500 }, config: { url: '/api/v1/bookings/my-trips' } });
    expect(window.location.assign).not.toHaveBeenCalled();
  });
});
```

Ensure `afterEach` is imported from `vitest` in this file.

- [ ] **Step 2: Run, expect failure**

Run: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test -- src/services/apiClient.test.ts`
Expected: FAIL — `maybeRedirectOnUnauthorized` is not exported.

- [ ] **Step 3: Implement** — in `apiClient.ts`, replace the response interceptor (lines 155-159) with:

```ts
// --- Response interceptor: redirect on auth expiry, then normalize errors. ---
apiClient.interceptors.response.use(
  (response) => response,
  (error: unknown) => {
    maybeRedirectOnUnauthorized(error);
    return Promise.reject(normalizeError(error));
  },
);

/**
 * On a 401 from a non-auth endpoint, clear the stale token and bounce the user
 * to /login (preserving where they were). Browser-only; skips the auth endpoints
 * themselves and avoids a loop when already on /login. Exported for testing.
 */
export function maybeRedirectOnUnauthorized(error: unknown): void {
  if (typeof window === 'undefined') return;
  if (!axios.isAxiosError(error)) return;
  if (error.response?.status !== 401) return;
  const url = error.config?.url ?? '';
  if (url.includes('/api/v1/auth/login') || url.includes('/api/v1/auth/register')) return;
  if (window.location.pathname.startsWith('/login')) return;
  try {
    window.localStorage.removeItem(AUTH_TOKEN_STORAGE_KEY);
  } catch {
    // localStorage unavailable — ignore.
  }
  const redirect = encodeURIComponent(window.location.pathname + window.location.search);
  window.location.assign(`/login?redirect=${redirect}`);
}
```

(`axios` and `AUTH_TOKEN_STORAGE_KEY` are already in scope in this file.)

- [ ] **Step 4: Run, expect PASS**

Run: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test -- src/services/apiClient.test.ts`
Expected: all apiClient tests pass (existing + 4 new).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(api): global 401 -> login redirect (clears stale token) (#81)"
```

---

### Task 3: #82a — Countdown turns red under 2 minutes (BookingSummary)

**Files:**
- Modify: `frontend/src/components/booking/BookingSummary.tsx`
- Test: `frontend/src/components/booking/BookingSummary.test.tsx` (extend)

- [ ] **Step 1: Write the failing tests** — append inside the existing `describe`:

```tsx
  function isoIn(seconds: number): string {
    return new Date(Date.now() + seconds * 1000).toISOString();
  }
  const baseProps = {
    property: sampleProperty,           // reuse the existing fixture in this file
    checkIn: '2030-06-10',
    checkOut: '2030-06-13',
    guestCount: 2,
    priceBreakdown: samplePriceBreakdown, // reuse the existing fixture in this file
    onHoldExpired: vi.fn(),
  };

  it('marks the countdown urgent (red) when under 2 minutes remain', () => {
    render(<BookingSummary {...baseProps} holdExpiresAt={isoIn(60)} />);
    expect(screen.getByTestId('hold-countdown')).toHaveAttribute('data-urgent', 'true');
  });

  it('countdown is not urgent when more than 2 minutes remain', () => {
    render(<BookingSummary {...baseProps} holdExpiresAt={isoIn(300)} />);
    expect(screen.getByTestId('hold-countdown')).toHaveAttribute('data-urgent', 'false');
  });
```

If the existing test file names its fixtures differently than `sampleProperty` / `samplePriceBreakdown`, reuse whatever fixtures that file already defines (read the top of the file) instead of inventing new ones.

- [ ] **Step 2: Run, expect failure**

Run: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test -- src/components/booking/BookingSummary.test.tsx`
Expected: FAIL — no `data-urgent` attribute.

- [ ] **Step 3: Implement** — in `BookingSummary.tsx`, derive `urgent` and apply it to the countdown badge (replace the badge block at lines 178-187):

```tsx
      {/* Hold expiry countdown */}
      <div
        className={`mx-4 mb-4 px-3 py-2 rounded-lg text-xs flex items-center justify-between border ${
          secondsLeft < 120
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-amber-50 border-amber-200 text-amber-800'
        }`}
        data-testid="hold-countdown"
        data-urgent={secondsLeft < 120}
      >
        <span>Hold expires in</span>
        <span className="font-semibold tabular-nums" data-testid="countdown-timer">
          {formatCountdown(secondsLeft)}
        </span>
      </div>
```

- [ ] **Step 4: Run, expect PASS**

Run: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test -- src/components/booking/BookingSummary.test.tsx`
Expected: all BookingSummary tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(checkout): countdown turns red under 2 minutes (#82)"
```

---

### Task 4: #82b — Auto-redirect to the property page on hold expiry (checkout)

**Files:**
- Modify: `frontend/src/app/booking/checkout/page.tsx`
- Test: `frontend/src/app/booking/checkout/page.test.tsx` (extend/adapt)

- [ ] **Step 1: Adapt the test** — read `booking/checkout/page.test.tsx`. The current behavior renders a `checkout-hold-expired` UI when the hold expires; the new behavior redirects. Replace any test that asserts the `checkout-hold-expired` UI with one asserting the redirect. The robust way is to mock `BookingSummary` so it invokes `onHoldExpired` on mount, and assert the router was sent to the property page. Add near the other `vi.mock(...)` calls:

```tsx
vi.mock('@/components/booking/BookingSummary', () => ({
  BookingSummary: ({ onHoldExpired }: { onHoldExpired: () => void }) => {
    // Fire the expiry callback once on mount to exercise the redirect.
    React.useEffect(() => { onHoldExpired(); }, [onHoldExpired]);
    return <div data-testid="booking-summary-stub" />;
  },
}));
```

and a test (the `useRouter` mock in this file must expose a `replace` spy — extend it if it only has `push`):

```tsx
  it('redirects to the property page with ?expired=true when the hold expires', async () => {
    // arrange: a successful booking creation so the main view (with BookingSummary) renders.
    // (Reuse this file's existing mock setup for useCreateBooking returning a booking.)
    render(<CheckoutPage />);
    await waitFor(() =>
      expect(mockReplace).toHaveBeenCalledWith('/property/prop-uuid-1?expired=true'),
    );
  });
```

Match `prop-uuid-1` to whatever `propertyId` the file's mocks/searchParams use. If the existing `useRouter` mock only provides `push`, add `replace: mockReplace` (declare `const mockReplace = vi.fn()` alongside the existing `mockPush`). Keep all other existing checkout tests intact.

- [ ] **Step 2: Run, expect failure**

Run: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test -- "src/app/booking/checkout/page.test.tsx"`
Expected: FAIL — the page still calls `setHoldExpired(true)` and renders the old UI instead of redirecting.

- [ ] **Step 3: Implement** — in `checkout/page.tsx`:

(a) Change the `onHoldExpired` prop passed to `BookingSummary` (line 256) to redirect:
```tsx
          onHoldExpired={() => router.replace(`/property/${propertyId}?expired=true`)}
```

(b) Remove the now-dead `holdExpired` state declaration (line 46: `const [holdExpired, setHoldExpired] = useState(false);`) and the entire `if (holdExpired) { … }` block (lines 157-178). (Leave the rest — `pageError`, the loading/error/confirming states — unchanged.)

- [ ] **Step 4: Run, expect PASS**

Run: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test -- "src/app/booking/checkout/page.test.tsx"`
Expected: all checkout tests pass (the adapted redirect test + the untouched ones).

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(checkout): auto-redirect to property page on hold expiry (#82)"
```

---

### Task 5: #82c — Expired-hold banner on the property page

**Files:**
- Modify: `frontend/src/app/property/[id]/page.tsx`
- Test: `frontend/src/app/property/[id]/page.test.tsx` (extend)

- [ ] **Step 1: Write the failing tests** — append to `property/[id]/page.test.tsx`. This file already mocks `next/navigation`; for these tests make `useSearchParams` return a map containing `expired=true`. If the existing mock is module-level, add dedicated tests that override it per-test (e.g. `vi.mocked(useSearchParams).mockReturnValue(new URLSearchParams({ expired: 'true' }) as unknown as ReturnType<typeof useSearchParams>)`), matching the file's existing mocking style:

```tsx
  it('shows the expired-hold banner when ?expired=true', () => {
    // make useSearchParams include expired=true (match this file's mock style)
    renderPropertyPage({ expired: 'true' }); // use the file's existing render helper / mock setup
    expect(screen.getByTestId('expired-banner')).toBeInTheDocument();
  });

  it('does not show the banner without ?expired', () => {
    renderPropertyPage({});
    expect(screen.queryByTestId('expired-banner')).not.toBeInTheDocument();
  });

  it('dismisses the banner', async () => {
    const user = userEvent.setup();
    renderPropertyPage({ expired: 'true' });
    await user.click(screen.getByTestId('expired-banner-dismiss'));
    expect(screen.queryByTestId('expired-banner')).not.toBeInTheDocument();
  });
```

Adapt `renderPropertyPage(params)` to however this file already renders the page and feeds `useSearchParams` (reuse its existing helper/mock; do not invent a new mocking mechanism). Keep existing property-page tests intact.

- [ ] **Step 2: Run, expect failure**

Run: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test -- "src/app/property/[id]/page.test.tsx"`
Expected: FAIL — no `expired-banner`.

- [ ] **Step 3: Implement** — in `property/[id]/page.tsx`:

(a) Add `useState` to the React import (line 3 currently `import React, { Suspense, useCallback, useMemo } from 'react';`):
```tsx
import React, { Suspense, useCallback, useMemo, useState } from 'react';
```

(b) Inside `PropertyDetailPageContent`, after `const checkOut = searchParams.get('check_out') || undefined;` (line 48), add:
```tsx
  const holdExpired = searchParams.get('expired') === 'true';
  const [bannerDismissed, setBannerDismissed] = useState(false);
```

(c) Render the banner as the FIRST child inside the page's main returned content container (the top-level wrapper of the success render, before the back/breadcrumb). Insert:
```tsx
      {holdExpired && !bannerDismissed && (
        <div
          data-testid="expired-banner"
          role="alert"
          className="mb-4 flex items-center justify-between gap-3 rounded-lg border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800"
        >
          <span>Your 10-minute hold expired — please reserve again.</span>
          <button
            type="button"
            onClick={() => setBannerDismissed(true)}
            aria-label="Dismiss"
            data-testid="expired-banner-dismiss"
            className="font-semibold text-amber-800 hover:text-amber-900"
          >
            ✕
          </button>
        </div>
      )}
```
Read the file's return JSX and place this immediately inside the outermost content `<div>`/`<main>` of the loaded-property render path (not inside the loading or error branches).

- [ ] **Step 4: Run, expect PASS**

Run: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test -- "src/app/property/[id]/page.test.tsx"`
Expected: all property-page tests pass.

- [ ] **Step 5: Commit**

```bash
git add -A && git commit -m "feat(property): expired-hold banner when ?expired=true (#82)"
```

---

### Task 6: Verify + PR

- [ ] **Step 1: Full suite + build**

Run: `cd /Users/jordi/projects/aidev/AI4Devs-finalproject-JGLL/frontend && npm run test 2>&1 | tail -6 && npm run build 2>&1 | tail -12`
Expected: all vitest tests pass (count ≥ prior + new tests); `next build` compiles successfully.

- [ ] **Step 2: Push + PR**

```bash
git push -u origin booking-flow-hardening
gh pr create --title "Booking-flow UX hardening (#80/#81/#82)" --body "<summary: past-date validation; global 401->login redirect; hold-expiry auto-redirect + property banner. Reuses existing patterns; vitest per change; next build green. No new Playwright journey (guards/edges of the existing booking journey; expiry is timer-driven). Design: docs/superpowers/specs/2026-06-21-booking-flow-hardening-design.md>"
```

- [ ] **Step 3: Report** the test counts, build result, and PR URL. Do NOT close issues (the user closes them).

---

## Self-review
- **Spec coverage:** #80 past-date min + inline error + blur/submit validation + clear-stale-checkout (Task 1 ✓); #81 global 401 interceptor skipping auth endpoints + loop guard + token clear + redirect (Task 2 ✓); #82 red-under-2min (Task 3 ✓), auto-redirect to `/property/{id}?expired=true` (Task 4 ✓), property `?expired` dismissible banner (Task 5 ✓); verify/build (Task 6 ✓). No new Playwright (per spec rationale).
- **Placeholder scan:** code is complete; Tasks 4 & 5 instruct the implementer to reuse each test file's existing mock/render helper (those vary per file) rather than inventing one — the test bodies + production edits are fully specified.
- **Identifier consistency:** `validateDates`, `todayIso`, `search-error`; `maybeRedirectOnUnauthorized`, `AUTH_TOKEN_STORAGE_KEY`; `data-urgent` + `secondsLeft < 120`; `router.replace('/property/${propertyId}?expired=true')`; `expired-banner` + `expired-banner-dismiss` + `searchParams.get('expired') === 'true'`. Consistent across tasks.
