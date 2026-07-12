# Editorial Restyle — T4 Checkout Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. RESTYLE + RESTRUCTURE of an existing working screen — all booking/payment BEHAVIOUR and the meaningful tests must stay green. Each implementer reads the named current file(s) + test(s) first, applies the change, follows TDD for new assertions, and updates only the assertions that encode the OLD layout/colours (never the behaviour assertions).

**Goal:** Restyle the Checkout screen (Figma node `1:235`) to the editorial design and adopt its restructured two-column layout: a full-width terracotta **hold banner** at the top, a LEFT column with the serif "Confirm and pay" heading + "Your trip" (dates/guests with Edit links) + "Pay with" (Stripe form) + legal fine print, and a RIGHT column with the property summary card + "Price details" + a separate "Total" card + a "Safe and secure booking" trust card. Reuse T1 tokens/primitives and the global T2 footer; preserve every booking/payment behaviour, `data-testid`, and a11y attribute.

**Architecture:** Faithful adaptation (user-approved divergences: adopt Figma layout; promote countdown to full-width top banner; include Edit links, legal fine print, and Safe & secure card). Global NavigationBar (T1) + Footer (T2) already wrap the page. **Forced adaptations (not choices):** keep **€/EUR** (Figma mocks $), and keep the Stripe `CardElement` (single combined field) — only its wrapper is restyled; we do NOT split into Card/Expiration/CVV/Postcode rows (would break the Stripe integration).

**Tech Stack:** Next.js 15 App Router, React 19, TS, Tailwind v4, TanStack Query, Stripe Elements, Vitest + RTL. Run npm via `npm --prefix frontend <script>` (do NOT `cd` — cwd is the repo root and a compound `cd … &&` triggers permission prompts).

**Branch:** `epic-editorial-restyle-t4-checkout` (already created off `main`). PR at end; never commit to `main`.

**Reference:** spec `docs/superpowers/specs/2026-06-22-editorial-ui-restyle-design.md`; Figma `yUOmxNuANSYeRjwW1eNBmV` node `1:235`; local screenshot `.design-ref/checkout.png`.

## Tokens / primitives (from T1 + T2)
`text-ink text-taupe text-terracotta bg-terracotta bg-terracotta-tint bg-surface bg-canvas border-border border-divider rounded-card rounded-pill font-serif font-sans focus-visible:ring-terracotta`; primitives `Card`, `Heading`, `Label`, `Badge`, `Button` from `@/components/shared/ui`; `--nav-h` (56px) CSS var for sticky offsets.

## Target structure after T4
```
<HoldCountdownBanner>            ← NEW: full-width terracotta bar, owns timer + onHoldExpired
[ back ‹ ]  Confirm and pay      ← serif H1
grid lg:grid-cols-[1fr_380px]:
  LEFT  (page.tsx inline):
    "Your trip"  → Dates row + Edit link · divider · Guests row + Edit link
    "Pay with"   → <PaymentForm> in editorial container
    legal fine print (static, links → "#")
  RIGHT (<BookingSummary>):
    property card (thumb + uppercase "{type} in {city}" label + serif title + ★ rating)
    "Price details" breakdown rows
    separate "Total (EUR)" card
    "Safe and secure booking" trust card (ShieldCheck)
```

## Global rules for every task
- Read the current file AND its `.test.tsx` first. Preserve every behaviour `data-testid`, prop the page relies on, handler, and a11y attribute. Re-tone colours to tokens — remove every `blue-*`/`gray-*`/`red-*`/`amber-*`/`green-*` from touched files.
- Status colours: errors → `text-terracotta` on `bg-terracotta-tint border-border`. The hold-banner urgency state keeps a distinct retone (see Task 1).
- Run the touched file's tests after each change; keep behaviour green. Add editorial assertions TDD-style (red→green) where the task says.
- **Branch safety:** each implementer FIRST runs `git checkout epic-editorial-restyle-t4-checkout` and confirms `git branch --show-current` prints exactly that; commit only there; re-verify before each commit. Do NOT prefix any command with `cd /abs/path &&`.

---

### Task 1: NEW `HoldCountdownBanner` component (TDD)
**Files (NEW):** `frontend/src/components/booking/HoldCountdownBanner.tsx` + `HoldCountdownBanner.test.tsx`.
**Why:** The countdown moves out of `BookingSummary` (Task 2) into a full-width top banner. This component OWNS the timer + `onHoldExpired` callback so the page's expiry-redirect flow is preserved.

Write tests FIRST (red), then implement (green). Port the timer behaviour verbatim from the current `BookingSummary` (lines 16–91): `secondsRemaining`, `formatCountdown`, the run-once interval `useEffect`, the `holdExpiresAt`-resync `useEffect`, and the `<120s` urgency threshold.

**Props:** `{ holdExpiresAt: string; onHoldExpired: () => void }`.

**PRESERVE (move from BookingSummary):** `data-testid="hold-countdown"`, `data-testid="countdown-timer"`, `data-urgent={secondsLeft < 120}`, the `M:SS` format, and the "calls onHoldExpired when it reaches 0" behaviour. These tests move here (use `vi.useFakeTimers()` as the old BookingSummary test did):
- shows `hold-countdown` + `countdown-timer`
- initial value for 10 min matches `/^9:\d{2}$|^10:00$/`
- `onHoldExpired` fires after the hold elapses (`advanceTimersByTime`)
- `data-urgent="true"` when `<120s`, `"false"` otherwise

**Editorial styling:** full-width terracotta bar — `w-full bg-terracotta text-white`, centered content `flex items-center justify-center gap-2 px-4 py-2.5 text-sm tracking-wide`; a `Clock` icon (lucide, `w-4 h-4`); uppercase copy `SPOT RESERVED — RESERVATION EXPIRES IN {M:SS}` (use `uppercase` + `font-medium`); the timer span keeps `tabular-nums font-semibold` + `data-testid="countdown-timer"`. Urgency retone: when `data-urgent`, deepen/emphasise (e.g. `bg-[#6f2a17]` darker terracotta OR add `animate-pulse` on the timer) — keep it visually distinct without raw red. The bar should be full-bleed (rendered above the `max-w-*` container in page.tsx).

Run `npm --prefix frontend run test -- src/components/booking/HoldCountdownBanner.test.tsx` green.
Commit: `feat(ui): add editorial HoldCountdownBanner (T4)`

### Task 2: Restyle + slim `BookingSummary` → right-column editorial card
**Files:** `frontend/src/components/booking/BookingSummary.tsx` + `.test.tsx`. READ both.
**Scope change:** `BookingSummary` becomes the RIGHT column only — property card + price details + Total card + Safe & secure card. It NO LONGER owns the countdown (moved to Task 1) and NO LONGER renders the dates/guests rows (those move to the LEFT "Your trip" in Task 4).

**Props after change:** `{ property: Property; priceBreakdown: PriceBreakdown }`. REMOVE `checkIn`, `checkOut`, `guestCount`, `holdExpiresAt`, `onHoldExpired` and the timer code/imports (`useEffect`/`useState`/`secondsRemaining`/`formatCountdown`/`Calendar`/`Users`).

**PRESERVE:** root `data-testid="booking-summary"`; the price rows container `data-testid="price-breakdown-table"`; total amount `data-testid="price-total"`; `formatEur`; the photo/placeholder branch (`getByAltText(property.title)` / placeholder div when no photos); property title + `city, country`; all four price rows + conditional tax row.

**Editorial layout:**
- Outer: `rounded-card border border-border bg-surface` (was `rounded-xl border-gray-200`).
- Property hero: thumbnail `rounded-card` (Figma ~`w-20 h-16`/`w-24 h-20`); to its right an uppercase `Label` `{property.property_type} in {property.location.city}` (e.g. "STUDIO IN BERLIN", use the `Label` primitive / `uppercase tracking-wide text-xs text-taupe`), then serif title `font-serif text-ink` (`getByText(property.title)` still passes), then a rating row `★ {avg_rating} ({review_count} reviews)` with `Star` `text-terracotta fill-terracotta` (only when `avg_rating != null && review_count > 0`), and a `MapPin` `city, country` line `text-taupe text-xs`.
- "Price details": serif `Heading`/`font-serif text-ink` heading above the breakdown. Row labels `text-taupe` (line-item labels may be `underline underline-offset-2 decoration-border` to match Figma), amounts `text-ink`. KEEP the `× N nights` text in the subtotal row (so the existing `getAllByText(/3 nights/)` still matches). Drop the in-card `border-t` total row.
- Separate **Total card**: its own block `rounded-card border border-border bg-surface px-4 py-3` (or a divider) with serif `Total (EUR)` label + the amount carrying `data-testid="price-total"` (`font-serif text-ink text-lg`). KEEP `€{total}` formatting (`€453.60`).
- **Safe & secure card**: `rounded-card border border-border bg-surface p-4` with a `ShieldCheck` (lucide) `text-terracotta`, an uppercase `Label` "Safe and secure booking", and body `text-taupe text-xs` "Your payment information is encrypted and processed securely." (static).

**Test updates (`BookingSummary.test.tsx`):** REMOVE the entire `describe('Hold expiry countdown', …)` block, the two urgency tests, the `shows check-in and check-out dates` test, and the `shows guest count` test (those behaviours moved to Task 1 / Task 4). REMOVE `vi.useFakeTimers()`/`afterEach` if no longer needed. Update each remaining `render(...)` to the new props (`property` + `priceBreakdown` only). KEEP: renders without crashing (`booking-summary`), property title, city/country, first photo / no-photo placeholder, night count (`getAllByText(/3 nights/)`), all price-row + tax tests, total (`price-total` → `€453.60`). ADD: asserts the "Safe and secure booking" text is present; asserts the uppercase `{type} in {city}` label renders.

Run `npm --prefix frontend run test -- src/components/booking/BookingSummary.test.tsx` green.
Commit: `feat(ui): restyle BookingSummary to editorial right-column card (T4)`

### Task 3: Restyle `PaymentForm`
**Files:** `frontend/src/components/booking/PaymentForm.tsx` + `.test.tsx`. READ both.
**PRESERVE EXACTLY:** the Stripe `Elements`/`CardElement` integration, `useStripe`/`useElements`, `handleSubmit`/`confirmCardPayment`, `onSuccess`/`onError`, the E2E-mode branch, and every `data-testid` (`payment-form-wrapper`, `payment-form`, `card-element-wrapper`, `payment-error`, `pay-button`) + `data-booking-id`. The pay button text MUST stay "Confirm and pay" / "Processing…" (test asserts `/confirm and pay/i` and `/processing/i`).

**Restyle (classes only):**
- Card label "Card details" `text-gray-700` → `text-ink` (or `text-taupe`), keep `font-medium`.
- `#card-element` wrapper `border-gray-300 rounded-lg focus-within:ring-blue-500` → `border-border rounded-card focus-within:ring-2 focus-within:ring-terracotta focus-within:border-transparent`. Update the `CardElement` `style.base.color` to the ink hex `#1b1c1a` and `::placeholder` to taupe `#56423d` (or keep neutral); `invalid` may stay a red hex (Stripe needs a colour) — acceptable for the card-invalid signal.
- Error block `bg-red-50 border-red-200 text-red-700` → `bg-terracotta-tint border-border text-terracotta`.
- Submit button `bg-blue-600 hover:bg-blue-700 disabled:bg-gray-300 rounded-xl` → `bg-terracotta hover:opacity-90 disabled:opacity-40 rounded-pill`; the spinner stays `border-white`. Consider the `Button` primitive only if it cleanly supports the loading spinner + `data-testid` + `disabled`; otherwise keep the native button retuned. KEEP `disabled={!stripe || loading}`.
- E2E-branch button `bg-blue-600 hover:bg-blue-700 rounded-lg` → `bg-terracotta hover:opacity-90 rounded-pill`; helper text `text-gray-500` → `text-taupe`.
- Remove all `blue-*`/`gray-*`/`red-*` Tailwind classes.

Run `npm --prefix frontend run test -- src/components/booking/PaymentForm.test.tsx` green (no behaviour assertions should change).
Commit: `feat(ui): restyle PaymentForm to editorial tokens (T4)`

### Task 4: Restructure + restyle `checkout/page.tsx`
**Files:** `frontend/src/app/booking/checkout/page.tsx` + `page.test.tsx`. READ both.
**PRESERVE EXACTLY (behaviour):** all hooks/state (`useRouter`/`useSearchParams`, URL params `propertyId`/`checkIn`/`checkOut`/`guestCount`, `booking`, `pageError`, `hasCreatedRef`), the create-on-mount `useEffect` incl. the auth-token guard + 409/400/generic error mapping, `handlePaymentSuccess` (sessionStorage write + `router.push('/confirmation/{id}')`), `handlePaymentError`, all render branches, and every behaviour `data-testid` (`checkout-loading`, `checkout-error`, `checkout-confirming`, `checkout-page`). KEEP `<Suspense>`.

**Restructure + restyle the main checkout view:**
- Render `<HoldCountdownBanner holdExpiresAt={booking.hold_expires_at} onHoldExpired={() => router.replace(`/property/${propertyId}?expired=true`)} />` full-bleed ABOVE the `max-w-*` container (so the bar spans the viewport; e.g. wrap page content so the banner is a sibling that is full width). The expiry-redirect behaviour now lives here (was on BookingSummary).
- Back button gray → `text-taupe hover:text-ink`.
- H1 `text-2xl font-bold text-gray-900` "Checkout" → serif `font-serif text-ink` **"Confirm and pay"** (drop `font-bold`; keep `text-2xl`+).
- Grid → editorial two-column on `lg` (e.g. `grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8`).
- **LEFT column (inline):**
  - "Your trip" — serif `font-serif text-ink` sub-heading. Then a Dates row: uppercase `Label` "Dates" + value (formatted from `checkIn`/`checkOut`) and an **Edit** link → `/property/${propertyId}?check_in=${checkIn}&check_out=${checkOut}` (`text-terracotta underline` / `hover:opacity-70`). A `border-divider` divider. Then a Guests row: `Label` "Guests" + `{guestCount} {guest|guests}` + an **Edit** link → `/property/${propertyId}?check_in=${checkIn}&check_out=${checkOut}`. Use a deterministic date formatter that parses the `YYYY-MM-DD` parts (do NOT `new Date('YYYY-MM-DD')` — TZ shift); month via a name lookup array, e.g. `Jul 10 – Jul 13, 2026`.
  - "Pay with" — serif sub-heading, then the existing `<PaymentForm .../>` (same props) inside an editorial container `rounded-card border border-border bg-surface p-5` (this replaces the old right-column `Payment` wrapper).
  - Legal fine print: `text-taupe text-xs` — "By selecting the button above, you agree to the Host's House Rules, Ground rules for guests, and StayHub's Rebooking and Refund Policy." with the three policy phrases as `underline` links to `"#"` (non-functional; no such pages exist).
- **RIGHT column:** `<BookingSummary property={property} priceBreakdown={booking.price_breakdown} />` (new slimmed props). On `lg`, make it sticky `lg:sticky lg:top-[calc(var(--nav-h)+1rem)]` if it reads cleanly.
- **Loading skeleton** (`checkout-loading`): bars `bg-gray-200`→`bg-border`, `rounded`/`rounded-xl`→`rounded-card`.
- **Error state** (`checkout-error`): back button gray → `text-taupe hover:text-ink`; error block `bg-red-50 border-red-200 text-red-700` → `bg-terracotta-tint border-border text-terracotta` (keep `role="alert"` + heading + message); "Back to search" `text-blue-600` → `text-terracotta hover:underline`.
- **Confirming state** (`checkout-confirming`): skeleton bars `bg-gray-200`→`bg-border`; "Confirming your booking…" `text-gray-500`→`text-taupe`.
- Remove all `blue-*`/`gray-*`/`red-*` from the file.

**Test updates (`page.test.tsx`):** the `BookingSummary` mock currently fires `onHoldExpired`; the redirect now flows through `HoldCountdownBanner`. So:
- Change the `BookingSummary` mock to a plain stub: `BookingSummary: () => <div data-testid="booking-summary-stub" />` (drop the `onHoldExpired` effect).
- ADD a mock for `@/components/booking/HoldCountdownBanner`: `HoldCountdownBanner: ({ onHoldExpired }) => { React.useEffect(() => { onHoldExpired(); }, [onHoldExpired]); return <div data-testid="hold-banner-stub" />; }` — this keeps the existing "redirects … when the hold expires" test asserting `mockReplace('/property/prop-uuid-1?expired=true')` valid.
- KEEP all other tests unchanged (loading, 409 error, generic error, renders page+summary+form, confirmation navigation). The `booking-summary-stub` + `payment-form` assertions still hold.

Run `npm --prefix frontend run test -- 'src/app/booking/checkout/page.test.tsx'` green. Then `npm --prefix frontend run test`, `npm --prefix frontend run type-check`, `npm --prefix frontend run lint`.
Commit: `feat(ui): restructure checkout to editorial layout + hold banner (T4)`

### Task 5: Full verification + PR
- `npm --prefix frontend run test` (all green), `npm --prefix frontend run type-check` (clean), `npm --prefix frontend run lint` (no NEW errors), `npm --prefix frontend run build` (succeeds).
- Manual: `npm --prefix frontend run dev`; reach `/booking/checkout?propertyId=…&checkIn=<future>&checkOut=<future+n>&guestCount=2` (needs an `auth_token` in localStorage). Compare to Figma `1:235`: full-width terracotta hold banner counting down; serif "Confirm and pay"; left "Your trip" (dates/guests + Edit) + "Pay with" (terracotta Confirm and pay) + legal note; right property card + Price details + Total card + Safe & secure card; global footer. Confirm the `<120s` urgency retone and that letting the hold expire redirects to the property page with `?expired=true`.
- Push + open PR (base `main`). After merge, close the T4 issue.

## Self-review notes
- **Behaviour preserved:** booking create-on-mount + auth guard + 409/400/generic mapping, hold-expiry redirect (moved to banner, still asserted), Stripe pay → confirm → sessionStorage → `/confirmation/{id}`, all `checkout-*` testids. Payment + price + total testids preserved.
- **Intended structural changes (user-approved):** countdown → full-width banner (new component); dates/guests → LEFT "Your trip"; property+price+total+trust → RIGHT card; heading "Checkout" → "Confirm and pay". Test churn is confined to relocating the countdown/dates/guests assertions to their new homes.
- **Tokens only:** every task strips raw `blue/gray/red/amber/green` for editorial tokens.
- **Forced adaptations:** € (not $); Stripe `CardElement` kept whole (no Card/Exp/CVV/Postcode split).
- **Omitted/static (no backing feature):** payment-method brand-icon tabs (Stripe owns the field); legal policy links → `#`; Safe & secure copy is static.
