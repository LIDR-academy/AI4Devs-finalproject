# Editorial Restyle — Tech-Debt Cleanup Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. This is a REFACTOR (no user-visible behaviour change) closing out tech debt flagged by reviewers across T4–T6. New shared helpers get TDD unit tests (red→green) asserting their EXACT current output; existing component/page tests guard each migration and must stay green. Each implementer reads the named files + tests first.

**Goal:** Remove duplication introduced during the editorial restyle epic by extracting shared helpers and consolidating CTA buttons onto the `Button` primitive — with ZERO change to rendered output, behaviour, routes, or `data-testid`s.

**Three debts (from T4–T6 code-quality reviews):**
1. Two date formatters are each copy-pasted: `formatDate(iso)` → "10 Jun 2030" (in `TripCard.tsx` + `trips/[id]/page.tsx`); `formatDateRange(checkIn,checkOut)` + `MONTHS`/`formatDay`/`formatYear` → "Jul 10 – Jul 13, 2026" (in `checkout/page.tsx` + `confirmation/[id]/page.tsx`).
2. An identical booking-status pill map `STATUS_STYLES: Record<BookingStatus,string>` in `TripCard.tsx` + `trips/[id]/page.tsx`.
3. Near-identical terracotta primary CTAs (and their neutral secondary siblings) hand-rolled across property/confirmation/cancellation instead of using the `Button` primitive.

**Architecture:** Shared pure helpers live in `frontend/src/lib/` (currently empty save `.gitkeep`). The `Button` primitive is `frontend/src/components/shared/ui/Button.tsx` (variants `primary` = terracotta fill, `ghost` = uppercase terracotta text; spreads `...rest`, has `disabled:opacity-50`). We ADD a `secondary` (neutral/outline) variant.

**Tech Stack:** Next.js 15 / React 19 / TS / Tailwind v4 / Vitest + RTL. PostCSS DISABLED in tests (assert on class strings). Run npm via `npm --prefix frontend <script>` (no `cd`).

**Branch:** `epic-editorial-restyle-cleanup` (already created off `main`). PR at end; never commit to `main`.

## Global rules
- **No behaviour/output change.** Every migrated call site must render byte-identical text + the same testids/handlers/aria. Existing tests must pass unchanged (except where a class moves onto the primitive — then update only that class assertion).
- **Branch safety:** each implementer FIRST runs `git checkout epic-editorial-restyle-cleanup`, confirms `git branch --show-current` == it, commits only there. Never prefix commands with `cd /abs/path &&`.
- Tasks run SERIALLY (they touch overlapping files — e.g. `TripCard.tsx` in Tasks 1+2; `confirmation/[id]/page.tsx` in Tasks 1+3). Each commits before the next starts.

---

### Task 1: Shared date formatters → `lib/formatDate.ts` (TDD)
**New files:** `frontend/src/lib/formatDate.ts` + `frontend/src/lib/formatDate.test.ts`.
Export EXACTLY these, preserving current behaviour byte-for-byte:
- `export const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];`
- `export function formatDate(iso: string): string` — port from `TripCard.tsx:18-25`: `const [year, month, day] = iso.split('-').map(Number); return new Date(year, month - 1, day).toLocaleDateString('en-GB', { day: 'numeric', month: 'short', year: 'numeric' });` (output e.g. `10 Jun 2030`).
- `export function formatDateRange(checkIn: string, checkOut: string): string` — port from `checkout/page.tsx:26-46` including the internal `formatDay`/`formatYear` (parts-based, `parseInt`, `MONTHS[month-1] ?? ''`, `!year||!month||!day` guard, `!checkIn||!checkOut` guard). Output e.g. `Jul 10 – Jul 13, 2026` (en dash, collapsed year).

TDD tests FIRST (red→green): `formatDate('2030-06-10')` === `'10 Jun 2030'`; `formatDateRange('2026-07-10','2026-07-13')` === `'Jul 10 – Jul 13, 2026'`; cross-month `('2026-07-31','2026-08-02')` === `'Jul 31 – Aug 2, 2026'`; cross-year `('2026-12-30','2027-01-02')` === `'Dec 30 – Jan 2, 2027'`; empty-input guards (`formatDateRange('','')` === `''`).

Then MIGRATE — delete the local copies and import from `@/lib/formatDate`:
- `frontend/src/app/booking/checkout/page.tsx`: remove `MONTHS`/`formatDay`/`formatYear`/`formatDateRange`, `import { formatDateRange } from '@/lib/formatDate';`.
- `frontend/src/app/confirmation/[id]/page.tsx`: same (remove its `MONTHS`/`formatDay`/`formatYear`/`formatDateRange`), import `formatDateRange`.
- `frontend/src/components/booking/TripCard.tsx`: remove local `formatDate`, import `formatDate`.
- `frontend/src/app/trips/[id]/page.tsx`: remove local `formatDate`, import `formatDate`.
Do NOT touch `AvailabilityCalendar.tsx`'s own `MONTHS` (different use — full calendar) or `ReviewList.tsx`'s one-off `en-US` date.
Run the new test + all four affected suites green:
`npm --prefix frontend run test -- src/lib/formatDate.test.ts 'src/app/booking/checkout/page.test.tsx' 'src/app/confirmation/[id]/page.test.tsx' src/components/booking/TripCard.test.tsx 'src/app/trips/[id]/page.test.tsx'`
`npm --prefix frontend run type-check` clean.
Commit: `refactor(ui): extract shared date formatters to lib/formatDate (cleanup)`

### Task 2: Shared booking-status badge → `lib/bookingStatus.ts` (TDD)
**New files:** `frontend/src/lib/bookingStatus.ts` + `frontend/src/lib/bookingStatus.test.ts`.
Export a helper that returns the FULL pill className currently inlined at both sites (so the wrapper classes are DRY too):
```ts
import type { BookingStatus } from '@/types';
const STATUS_TOKENS: Record<BookingStatus, string> = {
  confirmed: 'bg-terracotta-tint text-terracotta',
  cancelled: 'border border-border bg-surface text-taupe',
  completed: 'bg-canvas text-taupe',
};
export function bookingStatusBadgeClass(status: BookingStatus): string {
  return `rounded-pill px-2 py-0.5 text-xs font-medium uppercase tracking-wide ${STATUS_TOKENS[status]}`;
}
```
TDD tests FIRST: each status returns a string containing the right tokens (e.g. confirmed → `bg-terracotta-tint` + `rounded-pill` + `uppercase`; cancelled → `border-border text-taupe`; completed → `bg-canvas`).
Then MIGRATE — in `TripCard.tsx` and `trips/[id]/page.tsx`: remove the local `STATUS_STYLES` map and replace the badge `className={`rounded-pill … ${STATUS_STYLES[x]}`}` with `className={bookingStatusBadgeClass(x)}`. KEEP the raw lowercase `{status}` text node and `data-testid="trip-status"` (on TripCard). The TripCard test `getByTestId('trip-status').className` contains `bg-terracotta-tint` must stay green.
Run `npm --prefix frontend run test -- src/lib/bookingStatus.test.ts src/components/booking/TripCard.test.tsx 'src/app/trips/[id]/page.test.tsx'` green; `type-check` clean.
Commit: `refactor(ui): extract booking-status badge class to lib/bookingStatus (cleanup)`

### Task 3: Add `secondary` Button variant + migrate CTAs
**Files:** `frontend/src/components/shared/ui/Button.tsx` + `Button.test.tsx`; then the CTA call sites.
1. ADD a `secondary` variant to the primitive (neutral, matching the existing hand-rolled secondary buttons): `variant?: 'primary' | 'ghost' | 'secondary'` and
   `secondary: 'border border-border bg-canvas text-ink rounded-pill px-6 py-3 text-[14px] font-semibold hover:bg-terracotta-tint'`.
   Add a `Button.test` case asserting `variant="secondary"` renders `border-border` + `bg-canvas`. Keep existing primary/ghost tests green.
2. MIGRATE these to `<Button>` (preserve every `data-testid`, `onClick`, `disabled`, `aria-label`, and the children text; pass extra layout via `className`):
   - `property/[id]/page.tsx` — both Reserve buttons (`reserve-button`, `reserve-button-mobile`): `<Button variant="primary" className="w-full justify-center" disabled={!checkIn||!checkOut} data-testid="reserve-button" onClick={handleReserve}>Reserve</Button>`. (The primitive's `disabled:opacity-50` replaces the old `disabled:opacity-40` — acceptable; no test asserts opacity.)
   - `confirmation/[id]/page.tsx` — `view-trips-button` → `<Button variant="primary" …>View in My Trips</Button>`; `back-to-search-button` → `<Button variant="secondary" …>Back to Search</Button>`.
   - `CancellationModal.tsx` — `confirm-cancel-button` → `<Button variant="primary" disabled={isCancelling} …>{isCancelling ? 'Cancelling…' : 'Confirm cancellation'}</Button>` (the test asserts its className contains `bg-terracotta` — primary provides it ✓); `dismiss-cancel-button` ("Keep booking") → `<Button variant="secondary" disabled={isCancelling} …>Keep booking</Button>`.
3. KEEP NATIVE (do NOT migrate): `PaymentForm.tsx` buttons (Stripe + loading spinner + E2E branch); `trips/[id]/page.tsx` "Cancel booking" (outlined-terracotta `border-border text-terracotta hover:bg-terracotta-tint` — distinct from the new variants); the filter `role="tab"` buttons; the back-link/nav text buttons. Document this in the commit body.
Run the affected suites green: `npm --prefix frontend run test -- src/components/shared/ui/Button.test.tsx 'src/app/property/[id]/page.test.tsx' 'src/app/confirmation/[id]/page.test.tsx' src/components/booking/CancellationModal.test.tsx`. Update ONLY assertions that checked a now-moved class (the `confirm-cancel-button` `bg-terracotta` assertion should still pass). `type-check` clean.
Commit: `refactor(ui): migrate terracotta CTAs to the Button primitive (cleanup)`

### Task 4: Full verification + PR
- `grep -rnE "STATUS_STYLES|function formatDate|function formatDateRange" frontend/src/app frontend/src/components --include="*.tsx"` → only `AvailabilityCalendar`/`ReviewList` unrelated matches remain; the four migrated sites import from `@/lib`.
- **E2E text audit (epic lesson):** `grep -nE "getByText|getByRole" frontend/tests/e2e/booking-journey.spec.ts` — confirm nothing breaks (no copy changed; status text stays lowercase; testids preserved). Refactor → spec needs no changes.
- `npm --prefix frontend run test` (all green), `type-check` (clean), `lint` (no NEW errors), `build` (succeeds).
- Push + open PR (base `main`). This closes the editorial-restyle epic's tech-debt follow-up.

## Self-review notes
- **Pure refactor:** no rendered output/behaviour/route/testid changes; helpers reproduce exact current strings (locked by TDD tests + existing suites).
- **Scope bounds:** only the duplicated `formatDate`/`formatDateRange`/`STATUS_STYLES` and the clean primary/secondary CTA buttons. Left native (by design): PaymentForm (Stripe/spinner), the outlined trip-detail Cancel button, filter tabs, text/nav buttons, `AvailabilityCalendar` MONTHS, `ReviewList` date.
- **Risk:** the only test class assertion on a migrated button (`confirm-cancel-button` → `bg-terracotta`) stays green via the primary variant.
