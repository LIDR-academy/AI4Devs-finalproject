# Design: Booking-flow UX hardening (#80 / #81 / #82)

**Date:** 2026-06-21
**Status:** Approved (brainstorming) — pending implementation plan
**Issues:** #80 (T079 past-date validation), #81 (T080 unauthenticated/401 redirect), #82 (T081 hold-expiry countdown + auto-redirect)
**Scope:** Frontend only. All four user stories (US1–US4) are built; this is Phase-7 polish/hardening.

## Context

Investigation of the current code shows much of these tickets is already implemented; this design covers only the genuine gaps (the original ticket text references stale routes — `/booking/[id]`, `/properties/{id}` — the real routes are `/booking/checkout` and `/property/[id]`).

Already in place:
- `SearchBar` check-out input has `min={checkInDate}`.
- `checkout/page.tsx` pre-checks `auth_token` and redirects unauthenticated users to `/login?redirect=…`; `login/page.tsx` honors `?redirect=`.
- `BookingSummary` renders a full MM:SS countdown from `hold_expires_at` with an `onHoldExpired` callback; checkout sets a `holdExpired` state on timeout.

## Goals (the gaps)

1. **#80** — Disable past check-in dates and surface validation inline (replace `alert()`).
2. **#81** — A stale/invalid token that yields a `401` from the API should send the user to login (app-wide), not show a generic error.
3. **#82** — On hold expiry, auto-redirect to the property page with an expiry notice; ensure the countdown turns red under 2 minutes.

## Non-goals
- No toast/notification library — use inline banners/errors matching existing styling.
- No new Playwright journey (see Testing).
- No backend changes.

## Design

### #80 — Past-date validation (`frontend/src/components/search/SearchBar.tsx`)
- Compute `todayIso` (local `yyyy-mm-dd`) and set `min={todayIso}` on the check-in `<input type="date">`. Keep `min={checkInDate}` on check-out.
- When check-in changes to a date after the current check-out, clear check-out (prevents submitting a stale invalid range).
- Replace the `alert()` with a state-driven inline error (`data-testid="search-error"`, styled like existing errors). Show it when, on **blur** of a field or on **submit**: check-in is before today, or check-out ≤ check-in, or a field holds a manually-typed invalid/empty date. Block submission while invalid.

### #81 — Global 401 → login redirect (`frontend/src/services/apiClient.ts`)
- Add an axios **response interceptor** (alongside the existing request interceptor). On a `401` response:
  - Skip if the request URL targets an auth endpoint (`/api/v1/auth/login`, `/api/v1/auth/register`) — let those surface as `NormalizedApiError` (bad credentials).
  - Skip if not in a browser (`typeof window === 'undefined'`) or already on `/login` (loop guard).
  - Otherwise: `localStorage.removeItem('auth_token')` and `window.location.assign('/login?redirect=' + encodeURIComponent(location.pathname + location.search))`.
  - Still reject with the normalized error (so in-flight React Query state settles).
- The existing checkout pre-check remains (handles the "no token at all" case before any request). This interceptor adds the stale-token case and covers all authed pages (checkout + `/trips`, `/trips/[id]`).

### #82 — Hold-expiry auto-redirect + expired banner
- `frontend/src/app/booking/checkout/page.tsx`: in the existing `onHoldExpired` handler, redirect to `/property/${propertyId}?expired=true` (real route; `propertyId` is already read from `searchParams`).
- `frontend/src/components/booking/BookingSummary.tsx`: ensure the countdown text/badge turns red when `secondsRemaining < 120` (add the conditional class if absent). Keep existing `data-testid`s.
- `frontend/src/app/property/[id]/page.tsx`: read `?expired` via `useSearchParams`; when present, render a dismissible inline banner (`data-testid="expired-banner"`, inline styling like existing errors): "Your 10-minute hold expired — please reserve again." Dismiss via local state.

## Testing (vitest; no new Playwright journey)
- **SearchBar:** check-in input has `min` = today; inline error appears on blur/submit for past check-in and for check-out ≤ check-in; valid range submits.
- **apiClient interceptor:** 401 on a non-auth request → token cleared + redirect to `/login?redirect=<path>`; 401 on `/auth/login` → no redirect (error surfaces); when already on `/login` → no redirect.
- **checkout:** firing `onHoldExpired` navigates to `/property/{propertyId}?expired=true` (mock `useRouter`).
- **property page:** with `?expired=true` the banner renders and is dismissible; without it, no banner.

**Why no Playwright:** these are guards/edges of the *existing* booking journey (already covered by the Slice-C E2E), not a new cross-page journey. The expiry path is driven by a 10-minute timer that can't be exercised in-browser without clock control; component/unit tests at the timer/handler boundary are the correct layer.

## Delivery
One PR (`booking-flow-hardening`), three commits (#80, #81, #82), each TDD'd (failing test → implement → green) and reviewed (spec + code-quality), then verify (`npm run test` + `npm run build`).

## Self-review
- Placeholder scan: none. Internally consistent (gaps only; existing pieces named). Scoped to one small PR. Ambiguities resolved: 401 handling is **global** (user-approved); redirect target uses the **real** `/property/[id]` route (not the ticket's stale `/properties/{id}`); no toast lib (inline banner).
