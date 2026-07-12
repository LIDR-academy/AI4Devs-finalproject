# Editorial Restyle — T5 Booking Success Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. RESTYLE of a single existing working page — all behaviour and the meaningful tests must stay green. The implementer reads the current file + its test first, applies the editorial restyle, and updates ONLY the assertions that encode the old presentation (never the behaviour/navigation assertions).

**Goal:** Restyle the Booking Success / Confirmation screen (`/confirmation/[id]`, Figma node `1:138`) to the editorial design — a centered editorial card with a terracotta check badge, serif "Your trip is booked!" heading, a nested stay-details card (thumbnail + serif title + terracotta `REF:` + dates/total), and two CTAs (terracotta "View in My Trips" + neutral "Back to Search") — reusing T1 tokens/primitives and the global T2 footer, keeping all behaviour and tests intact.

**Architecture:** Faithful adaptation. Global NavigationBar (T1) + Footer (T2) already wrap the page. The page keeps its `sessionStorage` read, fallback branch, navigation handlers, and every `data-testid`; only presentation changes. **Forced adaptations (not choices):** keep **€/EUR** (Figma mocks $); OMIT the property location line ("Santorini, Greece") because `ConfirmationSessionData` has no city/country field; reuse the T4 deterministic date-range formatter (so the displayed dates change from `2026-07-10 → 2026-07-13` to `Jul 10 – Jul 13, 2026`).

**Tech Stack:** Next.js 15 App Router, React 19, TS, Tailwind v4, Vitest + RTL. Run npm via `npm --prefix frontend <script>` (do NOT `cd`; cwd is the repo root and a compound `cd … &&` triggers permission prompts).

**Branch:** `epic-editorial-restyle-t5-success` (already created off `main`). PR at end; never commit to `main`.

**Reference:** spec `docs/superpowers/specs/2026-06-22-editorial-ui-restyle-design.md`; Figma `yUOmxNuANSYeRjwW1eNBmV` node `1:138`; local screenshot `.design-ref/success.png`.

## Tokens / primitives (from T1 + T2)
`text-ink text-taupe text-terracotta bg-terracotta bg-terracotta-tint bg-surface bg-canvas border-border border-divider rounded-card rounded-pill font-serif`; primitives `Card`, `Heading`, `Label`, `Badge`, `Button` from `@/components/shared/ui`. READ `frontend/src/components/shared/ui/index.ts` + `Label`/`Button` source before use; if a primitive doesn't cleanly fit, use plain elements with the equivalent token classes.

## `ConfirmationSessionData` available fields (the ONLY data on this page)
`{ booking_id, reference_number, property_title, property_photo_url?, check_in, check_out, total_eur }` — no location, no nights. Do not invent fields.

---

### Task 1: Restyle the Confirmation page
**Files:** `frontend/src/app/confirmation/[id]/page.tsx` + `page.test.tsx`. READ both fully first.

**PRESERVE EXACTLY (behaviour):** the `useParams`/`useRouter` usage, `bookingId`, `data`/`loaded` state, the `useEffect` that reads `sessionStorage.getItem(`confirmation_${bookingId}`)` + JSON.parse + try/catch fallback, the `!loaded` loading branch, the data-vs-fallback conditional rendering, and the two navigation handlers (`router.push('/trips')` and `router.push('/')`). Keep `'use client';` and the default export. PRESERVE every `data-testid`: `confirmation-loading`, `confirmation-page`, `confirmation-icon`, `reference-number-block`, `reference-number`, `confirmation-details`, `total-paid`, `view-trips-button`, `back-to-search-button`.

**Restyle / restructure (presentation only):**
- **Page wrapper / card:** keep the outer centered container, but wrap the success content in an editorial card — `bg-surface rounded-card border border-border` with generous padding (e.g. `p-8 sm:p-10`), centered on the `bg-canvas` page (container e.g. `max-w-xl mx-auto px-4 py-12`, inner `text-center`). Keep `data-testid="confirmation-page"` on the appropriate wrapper.
- **Success badge:** replace the green `CheckCircle` (`text-green-500`) with a terracotta rounded-square badge — a `div` `inline-flex items-center justify-center w-16 h-16 rounded-card bg-terracotta` containing a white `Check` icon (lucide `Check`, `w-8 h-8 text-white`, `aria-hidden`). KEEP `data-testid="confirmation-icon"` on the badge element (the test only checks it is in the document). Remove `CheckCircle` import if unused.
- **Heading:** `text-3xl font-bold text-gray-900` "Booking Confirmed!" → serif `text-3xl font-serif text-ink` **"Your trip is booked!"** (drop `font-bold`). NOTE: the test asserts `getByText(/booking confirmed/i)` — UPDATE that assertion to `/your trip is booked/i` (presentation copy change).
- **Subtext:** `text-gray-500` → `text-taupe`; copy → **"A confirmation email has been sent to your inbox."** for the data branch; keep a sensible fallback line for the no-data branch (e.g. "Your payment was processed successfully.") in `text-taupe`.
- **Reference number — fold into the stay card:** remove the standalone blue block. Render the reference INSIDE the stay-details card (see below) as a terracotta uppercase line `REF: {reference_number}`, wrapped so it keeps BOTH testids: the wrapper `data-testid="reference-number-block"` and the value `data-testid="reference-number"` (so `getByTestId('reference-number')` still has text `BK-12345678`, and the fallback test still finds NO `reference-number-block` when there is no data). Style: `text-xs uppercase tracking-wide text-terracotta font-medium`.
- **Stay-details card** (`data-testid="confirmation-details"`, only when `data`): nested editorial card `rounded-card border border-border bg-canvas p-5 text-left`. Top row: a property thumbnail (`property_photo_url` → `img` `w-16 h-16 rounded-card object-cover`, with a `bg-border rounded-card` placeholder div when absent) beside a column with the serif title `font-serif text-ink` `{property_title}` and the `REF:` line described above. Then a `border-t border-divider` divider. Then a two-column bottom row (`flex justify-between`): left = uppercase `Label`/`text-xs text-taupe` "Dates" + value `text-ink text-sm` = the formatted range; right = uppercase "Total paid" + `data-testid="total-paid"` `text-ink font-semibold` = `€{data.total_eur.toFixed(2)}` (must still render `€453.60`).
  - Remove the `Home`/`Calendar` lucide icons + the old per-field stacked layout. (Keep imports tidy.)
- **Date formatter:** reuse the SAME deterministic approach as T4 `checkout/page.tsx` — split each `YYYY-MM-DD` on `-`, map month via a `['Jan',…,'Dec']` array, output e.g. `Jul 10 – Jul 13, 2026` (en dash; collapse the year). Do NOT use `new Date('YYYY-MM-DD')` (TZ bug). UPDATE the date test (see below).
- **CTAs:** keep both buttons + testids + handlers. Visible label of `view-trips-button` → **"View in My Trips"**; make it the PRIMARY terracotta CTA `bg-terracotta text-white rounded-pill py-3 px-6 font-semibold hover:opacity-90` (it currently navigates to `/trips`). `back-to-search-button` → SECONDARY neutral `rounded-pill border border-border bg-canvas text-ink py-3 px-6 font-semibold hover:bg-terracotta-tint` (navigates to `/`). Keep the `flex flex-col sm:flex-row gap-3 justify-center` row. Consider the `Button` primitive only if it cleanly supports the two variants + testids + onClick; otherwise keep native buttons retuned.
- **Loading branch** (`confirmation-loading`): skeleton bars `bg-gray-200` → `bg-border`; the circle skeleton `rounded-full` may become a `rounded-card` square block to echo the new badge; keep `animate-pulse` + the testid.
- Remove EVERY `blue-*`/`gray-*`/`green-*` class from the file.

**Test updates (`page.test.tsx`):** behaviour assertions stay. Update only the presentation-coupled ones:
- `shows Booking Confirmed heading`: change `getByText(/booking confirmed/i)` → `getByText(/your trip is booked/i)`. (Also the fallback test line that asserts `/booking confirmed/i` → update to `/your trip is booked/i`.)
- `shows check-in and check-out dates`: the dates now render formatted. Change the two assertions to match the formatted output — e.g. assert `screen.getByText(/Jul 10/)` and `/Jul 13, 2026/` are present (the mock dates are `2026-07-10`→`2026-07-13`). Pick assertions that robustly match the formatter's exact output; if unsure, compute the expected string and assert it.
- KEEP unchanged: renders page, green-checkmark→`confirmation-icon` present, `reference-number`→`BK-12345678`, property title, `total-paid`→`€453.60`, both CTA tests (testids + `mockPush` targets `/trips` and `/`), and the fallback test (`reference-number-block` + `confirmation-details` absent when no data).

Run `npm --prefix frontend run test -- 'src/app/confirmation/[id]/page.test.tsx'` green. Then `npm --prefix frontend run test`, `npm --prefix frontend run type-check`, `npm --prefix frontend run lint`.
`grep -nE "blue-|gray-|green-" frontend/src/app/confirmation/[id]/page.tsx` → no matches.
Commit: `feat(ui): restyle booking success page to editorial card (T5)`

### Task 2: Full verification + PR
- `npm --prefix frontend run test` (all green), `npm --prefix frontend run type-check` (clean), `npm --prefix frontend run lint` (no NEW errors), `npm --prefix frontend run build` (succeeds).
- Manual: complete a checkout in `npm --prefix frontend run dev` (or set a `confirmation_<id>` sessionStorage entry) and open `/confirmation/<id>`; compare to Figma `1:138`: terracotta check badge, serif "Your trip is booked!", subtext, stay card (thumbnail + serif title + terracotta REF + dates/total), terracotta "View in My Trips" + neutral "Back to Search", global footer. Verify the no-data fallback still renders the heading without the reference/details.
- Push + open PR (base `main`). Close the T5 issue after merge (if one exists).

## Self-review notes
- **Behaviour preserved:** sessionStorage read + JSON parse + try/catch fallback, loading/data/fallback branches, both navigation targets (`/trips`, `/`), all `data-testid`s.
- **Intended presentation changes (Figma-faithful):** terracotta check badge (was green circle); "Your trip is booked!" (was "Booking Confirmed!"); REF folded into the stay card; centered editorial card; "View in My Trips" primary terracotta CTA; formatted date range. Test churn is confined to the heading copy + the date-format assertions.
- **Tokens only:** strips all `blue/gray/green` for editorial tokens.
- **Forced adaptations / omissions:** € (not $); no location line (no field in `ConfirmationSessionData`); no nights count.
