# Mock-only payments — remove Stripe (frontend + backend tidy)

> REQUIRED SUB-SKILL: superpowers:subagent-driven-development + TDD. Two independent layers (frontend, backend). Behaviour of the booking→pay→confirm flow is preserved end-to-end via the existing stub/mock; only the real-Stripe code + deps are removed and the FE payment UI becomes a simple demo button.

## Decision
Commit to a mock payment path; never integrate real Stripe. UX = a simple **"Pay (demo)"** button with a "no real charge" note. Scope = **frontend + backend tidy**. Closes issue #53 (build the real Stripe adapter — won't happen).

## Current state (verified)
- Backend already runs only on `StubPaymentAdapter` (implements the `PaymentService` port: `createPaymentIntent` → `pi_stub_secret_<id>`, `getPaymentStatus` → SUCCEEDED, `refund`). The `com.stripe:stripe-java` dependency + `StripeWebhookController` are **dead** (no real adapter wired).
- Frontend `PaymentForm` has a real Stripe Elements branch + an E2E stub branch gated by `NEXT_PUBLIC_E2E`; ships `@stripe/react-stripe-js` + `@stripe/stripe-js`.

## Out of scope (keep as-is to avoid API/contract churn)
- Field names `stripe_client_secret` (API), `stripeClientSecret`/`stripePaymentIntentId` (domain) — keep; they're just the payment identifier the mock passes through.
- The `PaymentService` domain port — keep (good abstraction).

---

### Task 1 (frontend): make the mock the only payment path
**Files:** `frontend/src/components/booking/PaymentForm.tsx` (+ `.test.tsx`), `frontend/package.json` (+ lockfile), and any `NEXT_PUBLIC_E2E` references.
- Rewrite `PaymentForm` to a single demo path (delete `Elements`/`CardElement`/`useStripe`/`useElements`/`loadStripe`/`stripePromise`/`InnerPaymentForm`/`confirmCardPayment` and the `NEXT_PUBLIC_E2E` branch). Render: a short "Demo mode — no real charge" note (`text-taupe text-sm`) + a terracotta **"Pay"** button.
- PRESERVE the public contract exactly: `export interface PaymentFormProps { clientSecret: string; bookingId: string; onSuccess: (paymentIntentId: string) => void; onError: (msg: string) => void }`; the wrapper `data-testid="payment-form-wrapper"` with `data-booking-id={bookingId}`; the button `data-testid="pay-button"` whose text contains "Pay". On click, derive the intent id the way the old E2E branch did — `onSuccess(clientSecret.replace(/^pi_stub_secret_/, ''))` — so the backend stub's `getPaymentStatus` recognises it. (`onError` stays in the props for API stability even if unused now.) Keep the terracotta editorial styling (`bg-terracotta text-white rounded-pill …` or the `Button` primitive).
- Remove `@stripe/react-stripe-js` and `@stripe/stripe-js` from `package.json`; run `npm --prefix frontend install` to update the lockfile.
- Remove `NEXT_PUBLIC_E2E` usage from source. (Leave the E2E Playwright env/CI as-is — the `pay-button` testid still exists and now works unconditionally.)
- Rewrite `PaymentForm.test.tsx`: drop all Stripe mocks; assert the wrapper + `pay-button` render, the note shows, and clicking `pay-button` calls `onSuccess` with the id derived from `clientSecret` (e.g. `clientSecret="pi_stub_secret_pi_stub_ABC"` → `onSuccess("pi_stub_ABC")`).
- Verify: `npm --prefix frontend run test`, `type-check`, `lint`, `build` all green. Grep confirms no `@stripe` import and no `NEXT_PUBLIC_E2E` remain in `src`.
Commit: `chore(payments): make the mock the only frontend payment path; drop @stripe`

### Task 2 (backend): drop dead Stripe code, rename stub → mock
**Files:** `backend/.../presentation/api/StripeWebhookController.kt` (+ its test) [delete], `infrastructure/config/SecurityConfig.kt`, `src/main/resources/application.yml`, `backend/build.gradle(.kts)`, `infrastructure/payment/StubPaymentAdapter.kt` (+ its test).
- Delete `StripeWebhookController.kt` and `StripeWebhookControllerTest.kt`.
- `SecurityConfig.kt`: remove the `/api/v1/webhooks/**` `permitAll()` line + its two comment lines (the route no longer exists). Leave the rest of the chain intact.
- `application.yml`: remove the `stripe:` block (`secret-key`, `webhook-secret`).
- `build.gradle`: remove the `com.stripe:stripe-java` dependency and the `extra["stripeVersion"]` line.
- Rename `StubPaymentAdapter` → `MockPaymentAdapter` (class + file + `@Component`/bean if named + its test class/file). Keep it implementing `PaymentService` with identical behaviour (still emits `pi_stub_secret_…` so the FE + confirm flow are unchanged — do NOT change the secret/id format). Keep the `PaymentService` port untouched.
- Verify: `./gradlew test` (from `backend/`) green incl. ArchUnit; app context still boots (the `PaymentService` bean resolves to `MockPaymentAdapter`). Grep confirms no `com.stripe` import and no `StripeWebhookController` references remain.
Commit: `chore(payments): remove dead Stripe SDK + webhook controller; rename stub→mock adapter`

### Task 3: verify + PR
- Frontend: full `test`/`type-check`/`lint`/`build` green. Backend: `./gradlew build` green.
- Live smoke (dev): Reserve → checkout → **"Pay (demo)"** → confirmation page reached (the stub auto-succeeds). Use a bookable date window.
- Push + PR (base main). Note it closes #53.

## Notes
- The `stripe_client_secret`/`stripePaymentIntentId` names persist by design (renaming would churn the API + FE). Could be a future cosmetic pass.
- E2E Playwright (`booking-journey.spec.ts`) uses the `pay-button` testid only — unaffected.
