# Editorial Restyle — T6 My Trips Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. RESTYLE of existing working screens — all behaviour and the meaningful tests (Vitest AND Playwright E2E) must stay green. Each implementer reads the named current file + its test first, applies the editorial restyle, and updates ONLY assertions that encode the old presentation (never behaviour/navigation/testid assertions).

**Goal:** Restyle the **My Trips** experience to the editorial design — the trips list page (Figma node `1:2`: serif "My Trips", terracotta filter tabs, editorial trip cards with uppercase location + serif title + dates + status pill + price + "View details →"), the trip **detail** page, the **CancellationModal**, and the **TripCardSkeleton** — reusing T1 tokens/primitives and the global T2 footer, keeping all behaviour and tests intact. This is the **final screen of the editorial restyle epic** (after T1–T5).

**Architecture:** Faithful adaptation. Global NavigationBar (T1) + Footer (T2) already wrap the pages. Components keep props, hooks, data flow, handlers, and every `data-testid`; only presentation changes. The detail page and CancellationModal have no dedicated Figma frame — extend the established editorial tokens consistently with the list + the rest of the epic.

**Tech Stack:** Next.js 15 App Router, React 19, TS, Tailwind v4, TanStack Query, Vitest + RTL, Playwright (E2E in CI only). Run npm via `npm --prefix frontend <script>` (do NOT `cd`; cwd is the repo root and a compound `cd … &&` triggers permission prompts).

**Branch:** `epic-editorial-restyle-t6-trips` (already created off `main`). PR at end; never commit to `main`.

**Reference:** spec `docs/superpowers/specs/2026-06-22-editorial-ui-restyle-design.md`; Figma `yUOmxNuANSYeRjwW1eNBmV` node `1:2`; local screenshot `.design-ref/trips.png`.

## Tokens / primitives (from T1 + T2)
`text-ink text-taupe text-terracotta bg-terracotta bg-terracotta-tint bg-surface bg-canvas border-border border-divider rounded-card rounded-pill font-serif`; primitives `Card`, `Heading`, `Label`, `Badge`, `Button` from `@/components/shared/ui`. READ `frontend/src/components/shared/ui/index.ts` + the relevant primitive source before using; if a primitive doesn't cleanly fit, use plain elements with equivalent token classes.

## Data available (do not invent fields)
- `BookingSummary` (list card): `{ id, reference_number, property_title, property_photo_url, city, check_in, check_out, status, total_eur }` — NO `guest_count`, NO `country`. So the card shows **city only** (Figma's "2 Guests" is omitted — no data).
- `BookingStatus` = `'confirmed' | 'cancelled' | 'completed'`.
- `BookingDetailResponse` (detail): has `property.{title,photo_url,city,country,address,host_name}`, `reference_number`, `check_in`, `check_out`, `guest_count`, `status`, `price_breakdown`, `cancellation_policy?`, `refund_amount_eur`, `can_cancel`.

## CRITICAL — test contracts that must NOT break
- **Status text stays the raw lowercase `{status}`** (`confirmed`/`cancelled`/`completed`). The E2E (`frontend/tests/e2e/booking-journey.spec.ts`) and unit tests do `getByText('confirmed')`/`getByText('cancelled')`. Apply `uppercase` via CSS only — the DOM text node must remain lowercase.
- **`TripCard.test` asserts the exact date string `'10 Jun 2030 → 13 Jun 2030'`** and `'BK-20300101-ABC123'` and `'€386.00'`. KEEP the existing `formatDate` (en-GB `d MMM yyyy`) and the ` → ` separator and the reference line. Do NOT switch to a collapsed "Jun 10 – 13" format.
- Preserve ALL testids: `trips-list`, `trips-loading`, `trips-empty`, `trips-filter-{key}`, `trip-card`, `trip-status`, `trip-card-skeleton`, `open-cancel-button`, `cancellation-modal`, `refund-amount`, `dismiss-cancel-button`, `confirm-cancel-button`, plus `aria-label`/`role`/`aria-selected`/`aria-modal` attributes and `data-booking-id`.

## Global rules for every task
- Read the current file AND its `.test.tsx` first. Change presentation only. Remove every `blue-*`/`gray-*`/`red-*`/`green-*`/`amber-*` from touched files → editorial tokens. Errors → `text-terracotta`.
- Status badge retone (apply consistently in BOTH TripCard and the detail page `STATUS_STYLES`): `confirmed` → `bg-terracotta-tint text-terracotta`; `cancelled` → `border border-border bg-surface text-taupe` (muted/outlined, distinct); `completed` → `bg-canvas text-taupe`. Add `uppercase tracking-wide` for the editorial look. Keep the pill shape (`rounded-pill`).
- Run the touched file's tests after each change; keep behaviour green. Add editorial assertions TDD-style only where the task says.
- **Branch safety:** each implementer FIRST runs `git checkout epic-editorial-restyle-t6-trips` and confirms `git branch --show-current` prints exactly that; commit only there; re-verify before each commit. Never prefix a command with `cd /abs/path &&`.

---

### Task 1: Restyle `TripCard`
**Files:** `frontend/src/components/booking/TripCard.tsx` + `.test.tsx`. READ both.
PRESERVE: `TripCardProps`, the whole-card `<button>` with `onClick(trip.id)`, `aria-label={`View booking ${trip.reference_number}`}`, `data-testid="trip-card"`, `data-booking-id`, the `trip-status` span rendering raw lowercase `{trip.status}`, the `img` with `onError` placeholder fallback + `alt`, `formatDate` (UNCHANGED) and the ` → ` dated line, the reference-number line, the `€{total_eur.toFixed(2)}` price. The exact date string + reference + price + city + status text assertions must stay green.
Restyle:
- Card button: `rounded-lg bg-white shadow-sm hover:shadow-md` → `rounded-card border border-border bg-surface hover:border-terracotta transition-colors` (keep `group flex w-full gap-4 overflow-hidden p-3 text-left`). Thumbnail wrapper `rounded-md bg-gray-200` → `rounded-card bg-border`.
- Add an uppercase location label ABOVE the title: `{trip.city}` in `uppercase tracking-wide text-xs text-taupe` (replaces the `MapPin`+city line lower down, OR keep the MapPin line but retone — choose ONE: put the uppercase city label on top like Figma, and drop the separate MapPin line to avoid duplicate city; the test asserts `/Barcelona/` appears at least once, so one city node is enough).
- Title `text-sm font-semibold text-gray-900` → `font-serif text-ink` (keep `line-clamp-1`; size may bump to `text-base`).
- Status badge: use the shared retone (see Global rules). Keep `data-testid="trip-status"` + raw `{trip.status}` text.
- Dated line + reference line: `text-gray-600`/`text-gray-500` → `text-taupe`. Keep the exact `formatDate(check_in) → formatDate(check_out)` output and the reference number text.
- Price: `text-gray-900 font-bold` → `font-serif text-ink` (or `text-ink font-semibold`); optionally prefix with a small uppercase "Total" `Label`/`text-xs text-taupe` above it (Figma shows an "INVESTMENT" label — use **"Total"** for clarity; static label, no data change).
- Add a non-interactive "View details →" affordance (`text-terracotta text-sm font-medium`, with a `→`/lucide `ArrowRight aria-hidden`) — MUST be a `<span>`, NOT a nested button/link (the card itself is the button; nested interactive elements are invalid). Place bottom-right.
- Remove all `gray-*`/`green-*`/`red-*` classes (the status map is retoned per Global rules).
Run `npm --prefix frontend run test -- src/components/booking/TripCard.test.tsx` green (update only color/structure assertions if any fail; the text assertions should pass unchanged).
Commit: `feat(ui): restyle TripCard to editorial card (T6)`

### Task 2: Restyle the Trips list page
**Files:** `frontend/src/app/trips/page.tsx` + `page.test.tsx`. READ both.
PRESERVE: `Suspense`, `useRouter`/`useSearchParams`, `parseFilter`, `FILTERS` (KEEP all four: Upcoming/Past/Cancelled/All — they are functional + may be tested), `useMyTrips`, the `role="tablist"`/`role="tab"`/`aria-selected`/`data-testid={`trips-filter-${key}`}` tabs and their `router.push`, all branch testids (`trips-loading`, `trips-empty`, `trips-list`), the `TripCardSkeleton` loading list, the `<TripCard onClick=…>` mapping. Keep `<main className="mx-auto max-w-3xl px-4 py-8">`.
Restyle:
- H1 `text-2xl font-bold text-gray-900` "My Trips" → `text-2xl font-serif text-ink` (keep the text "My Trips" for nav consistency; drop `font-bold`).
- Tabs container `border-b border-gray-200` → `border-b border-border`. Active tab `border-blue-600 text-blue-600` → `border-terracotta text-terracotta`; inactive `border-transparent text-gray-500 hover:text-gray-700` → `border-transparent text-taupe hover:text-ink`. Keep `-mb-px border-b-2 px-3 py-2 text-sm font-medium` + `role`/`aria-selected`/testids.
- Error `text-red-600` → `text-terracotta` (keep `role="alert"` + copy). Empty `text-gray-600` → `text-taupe` (keep `trips-empty` + copy). 
- Remove all `blue-*`/`gray-*`/`red-*`.
Run `npm --prefix frontend run test -- src/app/trips/page.test.tsx` green.
Commit: `feat(ui): restyle My Trips list page to editorial tokens (T6)`

### Task 3: Restyle the Trip detail page
**Files:** `frontend/src/app/trips/[id]/page.tsx` + `page.test.tsx`. READ both.
PRESERVE: `useParams`/`useRouter`, `useBookingDetail`/`useCancelBooking`, `bookingId`, `modalOpen` state, `handleConfirmCancel` (the `mutateAsync` + close), the loading / error(404 vs generic) / data branches, `formatDate`, the `<CancellationModal …>` with ALL its props, `data-testid="open-cancel-button"`, `role="alert"`, and the title/reference/`€386.00`/`not found` text the test asserts.
Restyle:
- Loading branch: spinner `border-blue-600` → `border-terracotta`; text `text-gray-600` → `text-taupe`.
- Error branch: text `text-gray-700` → `text-ink`/`text-taupe` (keep `role="alert"` + the 404-vs-generic copy); "Back to My Trips" `text-blue-600 hover:underline` → `text-terracotta hover:underline`.
- Card `rounded-xl bg-white shadow-sm` → `rounded-card border border-border bg-surface`. Hero img keeps `h-48 w-full object-cover` (+ `onError`).
- Title `text-xl font-bold text-gray-900` → `font-serif text-ink` (drop bold). Status badge → shared retone (Global rules).
- Location/host/reference/date lines `text-gray-600`/`text-gray-500`/`text-gray-700` → `text-taupe`/`text-ink`; `MapPin` `text-taupe`. Keep "Reference: …", the date `→` line, guest count.
- Price breakdown block: dividers `border-gray-100` → `border-divider`; row text `text-gray-600` → `text-taupe`; total `text-gray-900 font-bold` → `font-serif text-ink` (or `text-ink font-semibold`).
- Cancellation policy `text-gray-500` → `text-taupe`.
- Cancel button `border-red-300 text-red-600 hover:bg-red-50` → `border border-border text-terracotta hover:bg-terracotta-tint rounded-pill` (keep `open-cancel-button` testid + `Cancel booking` text + handler). Back-link `ArrowLeft` row `text-blue-600` → `text-terracotta`.
- Remove all `blue-*`/`gray-*`/`red-*`/`green-*`.
Run `npm --prefix frontend run test -- 'src/app/trips/[id]/page.test.tsx'` green.
Commit: `feat(ui): restyle trip detail page to editorial tokens (T6)`

### Task 4: Restyle `CancellationModal`
**Files:** `frontend/src/components/booking/CancellationModal.tsx` + `.test.tsx`. READ both.
PRESERVE: `CancellationModalProps`, the `!isOpen` null return, `willRefund` logic, `role="dialog"`/`aria-modal`/`aria-labelledby="cancel-modal-title"`/`data-testid="cancellation-modal"`, both refund branches with `data-testid="refund-amount"` (and the `€{(refundAmountEur ?? 0).toFixed(2)}` text the test asserts), the error `role="alert"` block, and BOTH buttons with `dismiss-cancel-button`/`confirm-cancel-button` testids + `disabled={isCancelling}` + the `Cancelling…`/`Confirm cancellation`/`Keep booking` text + handlers.
Restyle:
- Overlay keeps `fixed inset-0 z-50 … bg-black/50 p-4`. Dialog `rounded-xl bg-white shadow-xl` → `rounded-card bg-surface shadow-xl` (keep `w-full max-w-md p-6`).
- Title `text-gray-900` → `font-serif text-ink` ("Cancel this booking?"). Policy `text-gray-600` → `text-taupe`.
- Refund box `bg-gray-50` → `bg-canvas`; inner text `text-gray-900` → `text-ink`. Error `text-red-600` → `text-terracotta`.
- "Keep booking" (dismiss) `border-gray-300 text-gray-700 hover:bg-gray-50` → `border border-border text-ink hover:bg-canvas rounded-pill`. "Confirm cancellation" (confirm) `bg-red-600 text-white hover:bg-red-700` → `bg-terracotta text-white hover:opacity-90 rounded-pill` (terracotta = the editorial primary action, consistent with the epic; keep `disabled:opacity-50`).
- Remove all `gray-*`/`red-*`.
Run `npm --prefix frontend run test -- src/components/booking/CancellationModal.test.tsx` green.
Commit: `feat(ui): restyle CancellationModal to editorial tokens (T6)`

### Task 5: Restyle `TripCardSkeleton` (small)
**Files:** `frontend/src/components/shared/TripCardSkeleton.tsx` (+ test if present). READ it.
PRESERVE: `data-testid="trip-card-skeleton"`, `aria-hidden`, `animate-pulse`, the thumb + stacked-lines shape (it should still mirror the new TripCard).
Restyle: container `rounded-lg bg-white shadow-sm` → `rounded-card border border-border bg-surface`; thumb `rounded-md bg-gray-200` → `rounded-card bg-border`; bars `bg-gray-200` → `bg-border`.
Run its test (and `src/app/trips/page.test.tsx` which renders it) green.
Commit: `feat(ui): restyle TripCardSkeleton to editorial tokens (T6)`

### Task 6: Full verification + PR
- **E2E text check (T5 lesson):** `grep -nE "Booking Confirmed|My Trips|Cancel|Keep booking|Confirm cancellation|View details|confirmed|cancelled" frontend/tests/e2e/booking-journey.spec.ts` and confirm every visible-text assertion the spec relies on STILL matches the restyled DOM (status text stays lowercase; testids unchanged). The spec should need NO changes — verify, don't assume.
- `npm --prefix frontend run test` (all green), `npm --prefix frontend run type-check` (clean), `npm --prefix frontend run lint` (no NEW errors), `npm --prefix frontend run build` (succeeds).
- Manual: `npm --prefix frontend run dev`; sign in, open `/trips` — serif "My Trips", terracotta active tab, editorial trip cards (uppercase city + serif title + dates + status pill + Total + View details →); open a trip — editorial detail; open the cancel modal — editorial modal with terracotta confirm. Compare the list to Figma `1:2`.
- Push + open PR (base `main`). After CI is green, this completes the epic — note that in the PR body. Close the T6 issue after merge (if one exists).

## Self-review notes
- **Behaviour preserved:** filters + routing, trip navigation, booking detail load (404/generic), cancel flow (modal → mutateAsync → refetch), all testids, the raw lowercase status text, the exact TripCard date/reference/price strings. E2E relies only on testids + lowercase status text → unaffected (verified in Task 6).
- **Intended presentation changes:** serif headings/titles, terracotta tabs + accents, editorial cards (`rounded-card border bg-surface`), retoned status pills, "View details →" affordance, terracotta primary in the modal.
- **Tokens only:** every task strips raw `blue/gray/red/green/amber`.
- **Forced adaptations / omissions:** no guest count on the list card (no field in `BookingSummary`); city-only location label (no country in `BookingSummary`); kept the existing date format + `→` (test-locked); kept all four filter tabs (Figma shows two, but the others are functional + tested); "Total" label instead of Figma's "INVESTMENT".
