# Editorial Restyle — T3 Property Details Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. RESTYLE of existing working components — behaviour and existing tests must stay green. Each implementer reads the named current file + its test, applies the editorial restyle, follows TDD for any new assertions.

**Goal:** Restyle the Property Details screen (Figma node `1:622`) to the editorial design — serif title + terracotta rating/location, editorial photo gallery, host card, amenities grid, two-column reviews, and a sticky bordered booking card (calendar + price breakdown + terracotta Reserve) — reusing T1 tokens/primitives and the T2 footer, keeping all behaviour and tests intact.

**Architecture:** Faithful adaptation. Global NavigationBar (T1) + global Footer (T2) already wrap the page. Components keep props, hooks, data flow, and `data-testid`s; only presentation changes. The Figma "Share/Save" buttons are omitted (no such feature — YAGNI), matching the T2 precedent (favourites heart omitted).

**Tech Stack:** Next.js 15 App Router, React 19, TS, Tailwind v4, TanStack Query, Vitest + RTL. Run npm from `frontend/`.

**Branch:** `epic-editorial-restyle-t3-property` (already created off `main`). PR at end; never commit to `main`.

**Reference:** spec `docs/superpowers/specs/2026-06-22-editorial-ui-restyle-design.md`; Figma `yUOmxNuANSYeRjwW1eNBmV` node `1:622`; local screenshot `.design-ref/property.png`.

## Tokens / primitives (from T1 + T2)
`text-ink text-taupe text-terracotta bg-terracotta bg-terracotta-tint bg-surface bg-canvas border-border border-divider rounded-card rounded-pill font-serif font-sans focus-visible:ring-terracotta`; primitives `Card`, `Heading`, `Label`, `Badge`, `Button` from `@/components/shared/ui`; `--nav-h` (56px) CSS var for sticky offsets.

## Global rules for every task
- Read the current file AND its `.test.tsx` first. Preserve every `data-testid`, prop, handler, and a11y attribute.
- Change presentation only. Remove every `blue-*`/`gray-*`/`red-*`/`yellow-*`/`amber-*`/`green-*` from touched files and replace with tokens. Semantic status colors (calendar legend, error states) → use `text-terracotta` for errors; keep calendar legend meaning but retone (see Task 5).
- Run the touched file's tests after each change; keep green. Add editorial assertions TDD-style where the task says.
- Branch safety: each implementer FIRST runs `git checkout epic-editorial-restyle-t3-property` and confirms `git branch --show-current`; commit only there; re-verify before each commit.

---

### Task 1: Restyle PhotoGallery
**Files:** `frontend/src/components/property/PhotoGallery.tsx` + `.test.tsx`. READ both.
PRESERVE: `Photo` type, `photos` prop, all state (`activeIndex`, `lightboxOpen`, `lightboxIndex`), open/close/prev/next handlers, the lightbox `role="dialog" aria-modal`, every `data-testid` (`photo-gallery`, `photo-gallery-placeholder`), thumbnail `role="list"/"listitem"`, `aria-pressed`, `aria-label`s, the `n / N` counter, empty-photos branch.
Restyle (classes only): primary photo + thumbnails + placeholder → `rounded-card` (not `rounded-xl`); placeholder `bg-canvas text-taupe`; focus rings `focus-visible:ring-terracotta` (was blue-600); active thumbnail border `border-terracotta` (was blue-600), inactive `border-transparent`; the `bg-black/60` counter badge → `bg-ink/70 text-white` (acceptable) or keep; lightbox stays dark. Remove all `blue-*`/`gray-*`.
Add TDD assertion: active thumbnail uses terracotta border —
```tsx
  it('marks the active thumbnail with the terracotta border', () => {
    render(<PhotoGallery photos={[{url:'a',caption:'A'},{url:'b',caption:'B'}]} />);
    // first thumbnail is active by default
    const thumbs = screen.getAllByRole('listitem');
    expect(thumbs[0].className).toContain('border-terracotta');
  });
```
(see red→green). Run `npm run test -- src/components/property/PhotoGallery.test.tsx` green.
Commit: `feat(ui): restyle PhotoGallery to editorial tokens (T3)`

### Task 2: Restyle AmenityList
**Files:** `frontend/src/components/property/AmenityList.tsx` + `.test.tsx`. READ both.
PRESERVE: `amenities` prop, `getAmenityIcon`/`formatAmenity`, `COLLAPSED_COUNT`, expand state + toggle, `data-testid` (`amenity-list`, `amenity-list-empty`), `aria-expanded`, the grid of icons + labels, show-all/less text.
Restyle: icons → `text-taupe` (was gray-500); labels → `text-ink`/`text-taupe` (was gray-700); empty text → `text-taupe`; show-all button → `text-terracotta hover:text-terracotta font-medium underline underline-offset-2` (was blue-600/800). Keep `grid grid-cols-2 gap-3`.
Run `npm run test -- src/components/property/AmenityList.test.tsx` green.
Commit: `feat(ui): restyle AmenityList to editorial tokens (T3)`

### Task 3: Restyle PriceBreakdown
**Files:** `frontend/src/components/property/PriceBreakdown.tsx` + `.test.tsx`. READ both.
PRESERVE: props, `usePriceCalculation`, all four states (placeholder/loading/error/data), `data-testid`s (`price-breakdown`, `price-breakdown-placeholder`, `price-breakdown-loading`, `price-breakdown-error`), `aria-busy`, `role="alert"`, `formatEur`, every row + total.
Restyle: card containers `rounded-xl border border-gray-200 bg-white` → `rounded-card border border-border bg-surface`; heading → `font-serif text-ink` ("Price breakdown"); row text gray-700 → `text-taupe`; total → `text-ink`; the `border-t` divider → `border-divider`; skeleton bars `bg-gray-200` → `bg-border`; error block `border-red-200 bg-red-50 text-red-600` → `border-border bg-terracotta-tint text-terracotta`. Placeholder text → `text-taupe`.
Run `npm run test -- src/components/property/PriceBreakdown.test.tsx` green.
Commit: `feat(ui): restyle PriceBreakdown to editorial tokens (T3)`

### Task 4: Restyle ReviewList (two-column)
**Files:** `frontend/src/components/property/ReviewList.tsx` + `.test.tsx`. READ both.
PRESERVE: props, `usePropertyReviews`, page state + Load more, all states (loading/error/empty/data), `data-testid`s (`review-list`, `review-list-loading`, `review-list-error`, `review-list-empty`, `review-card`, `review-load-more`), `StarRating` `aria-label`, aggregate header logic, avatar fallback.
Restyle: `StarRating` filled stars `text-yellow-400 fill-yellow-400` → `text-terracotta fill-terracotta`, empty `text-gray-300 fill-gray-100` → `text-border fill-transparent`; review card `border-gray-200 rounded-xl` → `border-border rounded-card`; avatar fallback `bg-gray-200 text-gray-600` → `bg-terracotta-tint text-terracotta`; names `text-gray-900` → `text-ink`, dates/comment gray → `text-taupe`; aggregate number `text-gray-900` → `text-ink` (keep `text-2xl`, consider `font-serif`); error → `text-terracotta bg-terracotta-tint border-border`; Load more button gray → `border-border text-taupe hover:bg-terracotta-tint`; skeleton `bg-gray-200`→`bg-border`.
LAYOUT change: render the review cards in a two-column grid on desktop — change the cards container `className="space-y-3"` → `className="grid grid-cols-1 sm:grid-cols-2 gap-4"`. (Matches Figma two-column reviews; behaviour unchanged.)
Run `npm run test -- src/components/property/ReviewList.test.tsx` green (update only assertions checking old colors/structure).
Commit: `feat(ui): restyle ReviewList to editorial two-column reviews (T3)`

### Task 5: Restyle AvailabilityCalendar
**Files:** `frontend/src/components/property/AvailabilityCalendar.tsx` + `.test.tsx`. READ both (336 lines — be careful).
PRESERVE: all props (`unavailableDates`, `onDateRangeSelect`, `selectedRange`), all date logic/state, month nav handlers, `data-testid`s (`availability-calendar`, `month-calendar`), every `aria-label`/`aria-pressed`, the legend.
Restyle: month-nav buttons + headers gray → `text-ink`/`text-taupe`, hover `bg-canvas`; selected check-in/out days `bg-blue-600 text-white` → `bg-terracotta text-white`; in-range `bg-blue-100/200 text-blue-900` → `bg-terracotta-tint text-ink`; available day hover `bg-gray-100` → `bg-canvas`; disabled/unavailable text gray → `text-taupe`/`opacity`. Legend dots: keep semantic distinctness but retone — unavailable `bg-red-400` → keep a muted red or `bg-terracotta` is NOT appropriate for "unavailable"; use `bg-taupe` for blocked/unavailable and `bg-terracotta` only if it means "selected". Choose: unavailable→`bg-taupe`, booked/blocked→`bg-border`, the yellow legend→`bg-terracotta-tint` border. Use judgement; the goal is no raw `blue/gray/red/yellow`, legend still distinguishable. Keep focus rings `focus-visible:ring-terracotta`.
Run `npm run test -- src/components/property/AvailabilityCalendar.test.tsx` green (update only color-class assertions if any).
Commit: `feat(ui): restyle AvailabilityCalendar to editorial tokens (T3)`

### Task 6: Restyle the Property Details page
**Files:** `frontend/src/app/property/[id]/page.tsx` + `page.test.tsx`. READ both.
PRESERVE EXACTLY: all hooks/state (`useParams`/`useRouter`/`useSearchParams`, `checkIn`/`checkOut`, `holdExpired`, `bannerDismissed`, `availabilityRange`, `usePropertyDetails`, `usePropertyAvailability`), handlers `handleDateRangeSelect`/`handleReserve`, the loading (`PropertyDetailSkeleton`)/error branches, `<Suspense>`, all component props, and every `data-testid` (`property-page`, `property-page-error`, `expired-banner`, `expired-banner-dismiss`, `reserve-button`, `reserve-button-mobile`).
Restyle (presentation/composition only):
- Page container keeps `max-w-5xl mx-auto px-4 py-8`; page text/bg → tokens.
- Expired banner `border-amber-200 bg-amber-50 text-amber-800` → editorial caution: `border-border bg-terracotta-tint text-terracotta` (keep testids + dismiss).
- Back buttons gray → `text-taupe hover:text-ink`.
- Title `<h1>` → `font-serif text-ink` (keep `text-2xl`+, drop `font-bold`). Error `<h1>` → `font-serif text-ink`.
- Rating row: `Star` → `text-terracotta fill-terracotta`; number `text-ink`; count `text-taupe`.
- Location/capacity icon rows gray → `text-taupe`; icon color `text-taupe`.
- Host card `bg-gray-50 rounded-xl` → wrap in `Card` primitive or `bg-canvas rounded-card border border-border`; "Hosted by" `text-ink`; verified badge `text-green-700` → `text-terracotta` (or keep a success tone — prefer `text-terracotta` for brand consistency) with `Badge` optional.
- Section headings ("About this place", "Amenities", "House rules", "Availability", "Reviews", "Select dates") → `font-serif text-ink` (use `Heading level={2}`/{3} where clean, or `font-serif`).
- House rules check icons gray → `text-taupe`.
- RIGHT BOOKING CARD: wrap the sticky right column content in an editorial `Card` (`bg-surface rounded-card border border-border p-6`), keep `sticky top-[var(--nav-h)]` style offset (replace `top-6` to align under the nav, or keep `top-6` within the card — use `lg:sticky lg:top-[calc(var(--nav-h)+1rem)]`). Nightly rate `€X` → `font-serif text-ink text-2xl` + `/ night` `text-taupe`.
- Reserve buttons (both desktop + mobile) `bg-blue-600 ... hover:bg-blue-700 disabled:bg-gray-300` → `bg-terracotta ... hover:opacity-90 disabled:opacity-40 rounded-pill` (keep `disabled={!checkIn || !checkOut}`, testids `reserve-button`/`reserve-button-mobile`). Consider using the `Button` primitive (`<Button onClick={handleReserve} disabled=... data-testid=... className="w-full">Reserve</Button>`).
- Reviews section divider `border-t` → `border-divider`.
- Remove all `blue-*`/`gray-*`/`amber-*`/`green-*` from the file.
Run `npm run test -- 'src/app/property/[id]/page.test.tsx'` green (update only assertions checking old colors/labels; keep all testid/behaviour assertions). Then `npm run test`, `npm run type-check`, `npm run lint`.
Commit: `feat(ui): restyle property details page to editorial layout (T3)`

### Task 7: Restyle PropertyDetailSkeleton (small)
**Files:** `frontend/src/components/shared/PropertyDetailSkeleton.tsx` + `.test.tsx` (27 lines). READ both.
PRESERVE: `data-testid` and structure. Restyle skeleton bars `bg-gray-200`/`bg-gray-100` → `bg-border`/`bg-canvas`, container radii → `rounded-card`. Keep `animate-pulse`.
Run its test green.
Commit: `feat(ui): restyle PropertyDetailSkeleton to editorial tokens (T3)`

### Task 8: Full verification + PR
- `npm run test` (all green), `npm run type-check` (clean), `npm run lint` (no NEW errors), `npm run build` (succeeds).
- Manual: `npm run dev`, open a property detail page with `?check_in=<future>&check_out=<future+5>`; compare to Figma `1:622`: serif title + terracotta rating, editorial gallery, host card, amenities grid + show-all, sticky bordered booking card with terracotta Reserve, two-column reviews, global footer.
- Push + PR (base main), then close T3 issue after merge.

## Self-review notes
- **Spec coverage:** gallery, title/rating/location, host card, capacity, description, amenities, house rules, calendar, price breakdown, reserve, reviews, skeleton — all have tasks. Header/footer are global (T1/T2).
- **Behaviour preserved:** each task lists testids/props/handlers to keep; only presentation changes. Two-column reviews + serif headings + terracotta Reserve are intended changes.
- **Tokens only:** every task removes raw color classes for tokens.
- **Omitted (YAGNI):** Figma Share/Save buttons (no feature); Figma "info highlight cards" fold into the existing amenities/house-rules.
