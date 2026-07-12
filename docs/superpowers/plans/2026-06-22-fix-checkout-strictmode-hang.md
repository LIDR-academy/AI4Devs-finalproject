# Fix: Checkout hangs on the loading skeleton (React Strict Mode / client-nav)

> REQUIRED SUB-SKILL: superpowers:subagent-driven-development + TDD. One focused fix to the checkout data flow. Unit tests must stay green; the real regression is verified with a headless Playwright run against the dev server (Strict Mode only reproduces in dev).

## Bug
Navigating to `/booking/checkout` via the **Reserve** button (client-side nav) leaves the page stuck on the `checkout-loading` skeleton forever, even though `POST /api/v1/bookings` returns 201. Direct full-page loads work; production works.

## Root cause (verified by instrumented repro)
The hold is created in a `useEffect` via `createBooking.mutate(req, { onSuccess, onError })` — **`mutate`-level callbacks**. React 18/19 **Strict Mode** (default-on in dev) mounts → unmounts → remounts the component. The first mount fires the POST then is discarded; its mutation observer is unsubscribed, so when the 201 resolves the **mutate-level `onSuccess` is dropped** and the surviving instance (guarded by `hasCreatedRef`) never re-fires and never receives the result. Render trace: `idle → pending → [201] → (no further render)`. So `createBooking.isPending` stays true on the visible instance → skeleton never clears. Production has no double-mount, so it resolves normally.

## Fix — model hold creation as a params-keyed query (Strict-Mode-safe)
React Query queries dedupe concurrent fetches by key, cache the result, and deliver it to **all** current subscribers regardless of mount churn — exactly what "create once on mount, survive remount" needs. Bonus: re-entering checkout with the same params reuses the existing hold instead of creating a duplicate.

### Task 1: add `useBookingHold` query hook + refactor the checkout page (TDD)
**Files:** `frontend/src/services/bookingService.ts` (+ `.test.ts`), `frontend/src/app/booking/checkout/page.tsx` (+ `page.test.tsx`).

**1a. New hook in `bookingService.ts`:**
```ts
import { useMutation, useQuery, ... } from '@tanstack/react-query';

export function useBookingHold(
  request: CreateBookingRequest | null,
  enabled: boolean,
): UseQueryResult<CreateBookingResponse, NormalizedApiError> {
  return useQuery({
    queryKey: ['bookingHold', request?.property_id, request?.check_in, request?.check_out, request?.guest_count],
    queryFn: async () => {
      const res = await apiClient.post<CreateBookingResponse>('/api/v1/bookings', request!);
      return res.data;
    },
    enabled: enabled && request != null,
    staleTime: Infinity,
    gcTime: Infinity,
    retry: false,
    refetchOnWindowFocus: false,
    refetchOnMount: false,
    refetchOnReconnect: false,
  });
}
```
Keep `useCreateBooking` exported if still referenced elsewhere; otherwise remove it (grep first — it's likely only used by checkout). KEEP `useConfirmBooking` untouched.

**1b. Refactor `page.tsx` (preserve ALL behaviour + testids `checkout-loading`/`checkout-error`/`checkout-confirming`/`checkout-page`):**
- Remove `const [booking, setBooking] = useState(...)`, `const [pageError, setPageError] = useState(...)`, `hasCreatedRef`, the `createBooking` mutation, and the create-on-mount mutate effect.
- Keep an auth/params effect that runs once: if `!hasParams` do nothing (params error derived below); else if no `auth_token` → `router.push('/login?redirect=...')` and mark redirecting; else mark `authReady`. Use a small `useState` flag (`'checking' | 'ready' | 'redirecting'`). The redirect is idempotent under double-invoke.
- `const hasParams = !!propertyId && !!checkIn && !!checkOut;`
- `const holdReq = hasParams ? { property_id: propertyId, check_in: checkIn, check_out: checkOut, guest_count: guestCount } : null;`
- `const { data: booking, error: holdError, isLoading: holdLoading } = useBookingHold(holdReq, authState === 'ready');`
- Derive `pageError` (no state): `!hasParams` → 'Missing booking parameters. Please go back and try again.'; else if `holdError` → map by `holdError.status` (409 → 'Those dates are no longer available…', 400 → `Validation error: ${message}`, else → message/fallback). Preserve the exact strings the page used.
- Loading branch condition → `propertyLoading || authState === 'checking' || (authState === 'ready' && holdLoading)`. Keep the same skeleton markup + `data-testid="checkout-loading"`.
- Error / `!booking || !property` / confirming / main branches: unchanged markup. `handlePaymentSuccess` still reads `booking.booking_id`, `booking.price_breakdown.total_eur`, etc. — now sourced from the query `data`.
- `<HoldCountdownBanner holdExpiresAt={booking.hold_expires_at} ... />` and `<PaymentForm clientSecret={booking.stripe_client_secret} bookingId={booking.booking_id} ... />` unchanged.

**1c. Update tests:**
- `page.test.tsx`: it currently mocks `useCreateBooking` and drives `onSuccess`/`onError`. Re-point to mock `useBookingHold` returning `{ data, error, isLoading }` shapes: loading (`isLoading:true`), success (`data: mockBookingResponse`), 409 error (`error: { status:409, message }`), generic error. Keep the auth-token `beforeEach` (`localStorage.setItem('auth_token', …)`). Keep ALL existing assertions: `checkout-loading`, `checkout-error` + "no longer available", generic error, `checkout-page` + `booking-summary-stub` + `payment-form`, the hold-expiry redirect (still via the `HoldCountdownBanner` mock firing `onHoldExpired`), and the confirmation-navigation test (pay → `/confirmation/booking-uuid-1`). Mock `useConfirmBooking` as before.
- `bookingService.test.ts`: add a test for `useBookingHold` (renders, POSTs once, returns data; 409 surfaces as error). Follow the existing test patterns in that file.

**Verify:**
- `npm --prefix frontend run test -- src/app/booking/checkout/page.test.tsx src/services/bookingService.test.ts` green, then full `npm --prefix frontend run test`, `type-check`, `lint`.
- **Regression repro (the important one)** — with the dev server running on :3000, run the headless script `/tmp/diag-watch.cjs` (registers a user, opens the property page with a bookable window, clicks Reserve) and confirm it reaches **`FORM ✓`** (today it prints `STUCK LOADING ✗`). Pick a bookable window from `GET /api/v1/properties/{id}/availability` (e.g. compute a 4-night gap; the property is heavily booked). Also confirm a 409 window shows the **error card**, not a hang.

Commit: `fix(checkout): create booking hold via query to survive Strict Mode remount`

### Task 2: verify + PR
Full `test` + `type-check` + `lint` + `build` green; manual confirm on dev (Reserve → form; let hold expire → property `?expired=true`; pay via E2E stub → `/confirmation`). Push + PR (base main).

## Notes
- Do NOT "fix" this by disabling `reactStrictMode` — that hides a real fragility and the query fix is correct in prod too.
- `.env.local` var-name/`E2E` issues are separate and NOT in scope here.
