# Editorial Restyle — T2 Search + Map Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: superpowers:subagent-driven-development. Steps use checkbox (`- [ ]`) syntax. This is a RESTYLE of existing, working components — behaviour and existing tests must stay green. Each implementer reads the named current file + its test, applies the editorial restyle, and follows TDD for any new assertions.

**Goal:** Restyle the Search + Map screen to the editorial design (Figma node `1:418`) — two-pane layout (editorial card grid left, tall map right), slim editorial search bar, editorial filter pill, numbered pagination, terracotta map pins — plus a shared editorial footer, reusing the T1 tokens/primitives and keeping all current search behaviour and tests intact.

**Architecture:** Faithful adaptation. The global NavigationBar (T1) remains the page header — we do NOT build the Figma per-screen header. Components keep their props, data flow, hooks, and `data-testid`s; only presentation changes. New token utilities/primitives from T1 (`text-ink`, `text-taupe`, `text-terracotta`, `bg-terracotta(-tint)`, `bg-surface`, `bg-canvas`, `border-border`, `border-divider`, `rounded-card`, `rounded-pill`, `font-serif`, `font-sans`, and `Card`/`Heading`/`Label`/`Badge`/`Button`) are the styling vocabulary.

**Tech Stack:** Next.js 15 App Router, React 19, TypeScript, Tailwind v4, react-map-gl/mapbox, TanStack Query, Vitest + RTL. Run npm from `frontend/`.

**Branch:** `epic-editorial-restyle-t2-search` (already created off `main`). PR at the end; never commit to `main`.

**Reference:** spec `docs/superpowers/specs/2026-06-22-editorial-ui-restyle-design.md`; Figma file `yUOmxNuANSYeRjwW1eNBmV`, search node `1:418`, card node `1:443`.

---

## Editorial design facts (from Figma)

**Property card (`1:443`)** — vertical card, `border-border`, `rounded-card`, square photo on top, content below as a `flex justify-between`:
- Left column: serif **location** heading (Playfair, `text-ink`, 24px/32px) = `${city}, ${country}`; then meta line (Inter medium, taupe, 12px, tracking-wide) = property **title**; then **price** `€{rate}` (Inter bold `text-ink` 16px) + ` night` (Inter regular `text-taupe`).
- Right: a single star icon + numeric rating (e.g. `4.92`, Inter `text-ink` 16px).
- Decorative-only elements in the mock (a heart/save button and an on-image badge) are OMITTED — there is no favourites feature (YAGNI).

**Search bar** — slim editorial pill row above the results (location · check-in · check-out · guests · Search), not the current bulky boxed form.

**Filter** — a single editorial "Filters" pill (`rounded-pill`, `border-border`) that toggles the (restyled) FilterPanel as a dropdown. We do NOT build four separate popover pills or a sort control (sort is not implemented in the app — out of scope).

**Two-pane body** — left results column (~55%, `bg-canvas`), right map (~45%) full-height and sticky. Replaces the current 3-column grid (filter sidebar / results / small map box).

**Pagination** — numbered pages with prev/next arrows, editorial styling, driven by existing `pagination.page` / `pagination.total_pages`.

**Map pins** — terracotta price pills (`€{rate}`) instead of emoji dots; active/hover state inverts (filled terracotta). Popup restyled to editorial tokens.

**Footer** — global editorial footer: serif `STAYHUB` + tagline, `COMPANY` (Sustainability, Press Kit) and `LEGAL` (Privacy Policy, Contact) link columns, copyright line.

## File structure

```
frontend/src/
├── app/
│   ├── layout.tsx                         # MODIFY — render <Footer/> after ErrorBoundary children
│   └── search/page.tsx                    # MODIFY — two-pane layout, filter pill, numbered pagination
└── components/
    ├── shared/
    │   ├── Footer.tsx                      # CREATE
    │   └── Footer.test.tsx                 # CREATE
    └── search/
        ├── PropertyCard.tsx / .test.tsx    # MODIFY (restyle + editorial assertions)
        ├── SearchBar.tsx / .test.tsx       # MODIFY (restyle; behaviour unchanged)
        ├── FilterPanel.tsx / .test.tsx     # MODIFY (restyle; behaviour unchanged)
        ├── EmptyState.tsx / .test.tsx      # MODIFY (restyle; behaviour unchanged)
        ├── MapView.client.tsx              # MODIFY (terracotta price pins + popup)
        └── Pagination.tsx / .test.tsx      # CREATE (numbered pagination, used by page)
```

## Global rules for every task
- Read the current file AND its `.test.tsx` first. Preserve every `data-testid`, prop, handler, and accessibility attribute.
- Only change presentation (classes/markup structure needed for layout). Do NOT change data flow, hooks, validation, or callback signatures.
- Run the touched file's tests after each change; they must stay green. Add editorial assertions TDD-style (red→green) where the task says to.
- Use T1 tokens/primitives — no raw hex, no `blue-*`/`gray-*`/`red-*` left behind in touched files.
- Commit per task with the given message. Work on branch `epic-editorial-restyle-t2-search`.

---

### Task 1: Shared editorial Footer

**Files:** Create `frontend/src/components/shared/Footer.tsx`, `Footer.test.tsx`; Modify `frontend/src/app/layout.tsx`.

- [ ] **Step 1 — failing test** `Footer.test.tsx`:
```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Footer } from './Footer';

describe('Footer', () => {
  it('renders the STAYHUB wordmark and tagline', () => {
    render(<Footer />);
    expect(screen.getByText('STAYHUB')).toBeInTheDocument();
    expect(screen.getByText(/curated hospitality/i)).toBeInTheDocument();
  });

  it('renders Company and Legal link groups', () => {
    render(<Footer />);
    expect(screen.getByText('Company')).toBeInTheDocument();
    expect(screen.getByText('Legal')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Privacy Policy' })).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Contact' })).toBeInTheDocument();
  });

  it('renders a copyright line', () => {
    render(<Footer />);
    expect(screen.getByText(/StayHub/)).toBeInTheDocument();
    expect(screen.getByText(/rights reserved/i)).toBeInTheDocument();
  });
});
```
Run `npm run test -- src/components/shared/Footer.test.tsx` → FAIL (no module).

- [ ] **Step 2 — implement** `Footer.tsx`:
```tsx
import React from 'react';
import Link from 'next/link';
import { Heading, Label } from '@/components/shared/ui';

const COMPANY_LINKS = [
  { label: 'Sustainability', href: '#' },
  { label: 'Press Kit', href: '#' },
];
const LEGAL_LINKS = [
  { label: 'Privacy Policy', href: '#' },
  { label: 'Contact', href: '#' },
];

/** Global editorial footer: brand blurb + Company/Legal link columns + copyright. */
export function Footer() {
  return (
    <footer className="border-t border-divider bg-canvas px-16 py-20">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-12 md:grid-cols-4">
        <div className="md:col-span-2">
          <Heading level={3} className="tracking-[0.12em] uppercase">STAYHUB</Heading>
          <p className="mt-4 max-w-xs font-sans text-sm text-taupe">
            Curated hospitality for the modern traveler.
          </p>
        </div>
        <nav aria-label="Company">
          <Label>Company</Label>
          <ul className="mt-4 space-y-3">
            {COMPANY_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="font-sans text-sm text-taupe transition-colors hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <nav aria-label="Legal">
          <Label>Legal</Label>
          <ul className="mt-4 space-y-3">
            {LEGAL_LINKS.map((l) => (
              <li key={l.label}>
                <Link href={l.href} className="font-sans text-sm text-taupe transition-colors hover:text-ink">
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
      </div>
      <p className="mx-auto mt-12 max-w-6xl font-sans text-xs text-taupe">
        © 2024 StayHub Boutique Hospitality. All rights reserved.
      </p>
    </footer>
  );
}
```
Note: `Label` renders uppercase, so its children `Company`/`Legal` display uppercased but the accessible text node is still "Company"/"Legal" — the test queries by that text.

- [ ] **Step 3 — wire into layout** `frontend/src/app/layout.tsx`: import `Footer` and render it inside the body after the ErrorBoundary so it appears on every page:
```tsx
import { Footer } from "@/components/shared/Footer";
// ...
        <QueryClientProvider client={queryClient}>
          <NavigationBar />
          <ErrorBoundary>{children}</ErrorBoundary>
          <Footer />
        </QueryClientProvider>
```

- [ ] **Step 4** — `npm run test -- src/components/shared/Footer.test.tsx` (PASS), then `npm run test` (full suite still green), then `npm run type-check`.
- [ ] **Step 5 — commit** `git add frontend/src/components/shared/Footer.tsx frontend/src/components/shared/Footer.test.tsx frontend/src/app/layout.tsx && git commit -m "feat(ui): add shared editorial Footer (T2)"`

---

### Task 2: Restyle PropertyCard

**Files:** Modify `frontend/src/components/search/PropertyCard.tsx`, `PropertyCard.test.tsx`.

Read both files first. Keep: `onClick(property.id)` button behaviour, `aria-label={`View ${property.title}`}`, the `img` with `onError` fallback, the "No ratings yet" branch. Preserve any `data-testid`/structure the test relies on (verify in the test file).

- [ ] **Step 1 — failing editorial assertions.** Add to `PropertyCard.test.tsx` inside the describe block (use the test's existing mock property; if it lacks fields, reuse its existing factory):
```tsx
  it('shows the location as a serif heading and the title as the meta line', () => {
    render(<PropertyCard property={mockProperty} onClick={() => {}} />);
    const heading = screen.getByRole('heading', { name: `${mockProperty.location.city}, ${mockProperty.location.country}` });
    expect(heading.className).toContain('font-serif');
  });

  it('renders the nightly price with editorial ink/taupe treatment', () => {
    render(<PropertyCard property={mockProperty} onClick={() => {}} />);
    expect(screen.getByText(/night/i)).toBeInTheDocument();
  });
```
(If the test file names its fixture differently than `mockProperty`, adapt the variable name to match — read the file.) Run the test → the heading-role/name assertion FAILS (current card renders title as the `h3`, not location).

- [ ] **Step 2 — restyle.** Replace the card's content section so it matches the editorial spec, keeping the outer button + photo logic. Target structure (Tailwind with T1 tokens):
```tsx
  return (
    <button
      onClick={handleClick}
      className="group relative flex h-full w-full flex-col overflow-hidden rounded-card border border-border bg-surface text-left transition-shadow hover:shadow-md"
      type="button"
      aria-label={`View ${property.title}`}
    >
      <div className="relative aspect-square w-full overflow-hidden bg-canvas">
        <img
          src={property.photo_url}
          alt={`Photo of ${property.title}`}
          onError={(e) => { e.currentTarget.src = 'https://via.placeholder.com/300x200?text=No+Image'; }}
          className="h-full w-full object-cover transition-transform group-hover:scale-105"
        />
      </div>
      <div className="flex items-start justify-between gap-2 p-4">
        <div className="flex min-w-0 flex-col gap-1">
          <h3 className="truncate font-serif text-2xl leading-8 text-ink">
            {property.location.city}, {property.location.country}
          </h3>
          <p className="truncate font-sans text-xs font-medium tracking-[0.02em] text-taupe">
            {property.title}
          </p>
          <p className="mt-1 font-sans text-base font-bold text-ink">
            €{property.nightly_rate_eur.toFixed(0)}{' '}
            <span className="font-normal text-taupe">night</span>
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-1">
          {property.avg_rating !== null && property.avg_rating !== undefined ? (
            <>
              <span aria-hidden className="text-terracotta">★</span>
              <span className="font-sans text-base text-ink">{rating.toFixed(2)}</span>
            </>
          ) : (
            <span className="font-sans text-xs text-taupe">New</span>
          )}
        </div>
      </div>
    </button>
  );
```
You may keep the `fullStars`/`hasHalfStar` calc only if still used; the editorial card shows a single star + numeric rating, so the multi-star loop can be removed. If the existing test asserts on multiple star `role="img"` elements or `review_count` text, update those assertions to the editorial single-star + numeric form (this is an intended design change, not a behaviour regression) — keep the click and aria-label assertions unchanged.

- [ ] **Step 3** — run `npm run test -- src/components/search/PropertyCard.test.tsx` (all green), then `npm run test`, then `npm run type-check`.
- [ ] **Step 4 — commit** `git add frontend/src/components/search/PropertyCard.tsx frontend/src/components/search/PropertyCard.test.tsx && git commit -m "feat(ui): restyle PropertyCard to editorial card (T2)"`

---

### Task 3: Restyle SearchBar (slim editorial pill row)

**Files:** Modify `frontend/src/components/search/SearchBar.tsx`, `SearchBar.test.tsx`.

Read both. PRESERVE exactly: `SearchParams` type, `onSearch` prop + payload, all state, `validateDates`, every handler, the `data-testid`s (`search-form`, `search-location`, `search-submit`, `search-error`), the `role="alert"` error, guest +/- `aria-label`s, the date `min` attrs. ONLY change classes/wrapper layout.

- [ ] **Step 1** — confirm current tests pass: `npm run test -- src/components/search/SearchBar.test.tsx`.
- [ ] **Step 2 — restyle to a slim horizontal pill row.** Replace the form's container + field wrappers with an editorial inline bar: one rounded-pill container (`rounded-pill border border-border bg-surface`) holding location / check-in / check-out / guests as inline segments separated by `border-divider`, and a terracotta submit `Button`. Apply token classes: inputs `bg-transparent font-sans text-ink placeholder:text-taupe focus:outline-none`; labels become small `Label`-style uppercase captions; the submit uses the T1 `Button` primitive (`<Button type="submit" data-testid="search-submit">Search</Button>`) OR keeps the `<button data-testid="search-submit">` with classes `rounded-pill bg-terracotta px-8 py-3 text-white`. Keep the error `<p data-testid="search-error" role="alert" className="... text-terracotta">`. Replace every `blue-*`/`gray-*`/`red-*` with tokens (`focus:ring-terracotta`, `border-border`, `text-taupe`, `text-terracotta`). The grid may stay responsive (stack on mobile) but should read as a single editorial bar on desktop.
- [ ] **Step 3** — add an editorial assertion (TDD): the submit button carries `bg-terracotta`:
```tsx
  it('styles the submit button with the terracotta accent', () => {
    render(<SearchBar onSearch={() => {}} />);
    expect(screen.getByTestId('search-submit').className).toContain('bg-terracotta');
  });
```
Confirm it goes red (before restyle) → green (after). Then `npm run test -- src/components/search/SearchBar.test.tsx` (all green), `npm run test`, `npm run type-check`.
- [ ] **Step 4 — commit** `git add frontend/src/components/search/SearchBar.tsx frontend/src/components/search/SearchBar.test.tsx && git commit -m "feat(ui): restyle SearchBar to editorial pill row (T2)"`

---

### Task 4: Restyle FilterPanel

**Files:** Modify `frontend/src/components/search/FilterPanel.tsx`, `FilterPanel.test.tsx`.

Read both. PRESERVE: `onFiltersChange` prop + all payloads, the `PROPERTY_TYPES`/`BEDROOM_OPTIONS`/`AMENITIES` constants, every handler, all input `id`s/labels/roles the test queries. ONLY restyle.

- [ ] **Step 1** — confirm current tests pass.
- [ ] **Step 2 — restyle to editorial tokens.** Container → `Card`-style (`bg-surface rounded-card border border-border p-6 space-y-6`). Section titles → serif `Heading level={3}` or `font-serif text-ink`. Selected bedroom button → `bg-terracotta text-white`, unselected → `bg-canvas text-taupe hover:bg-terracotta-tint`. Checkboxes → `accent-terracotta` (or `text-terracotta focus:ring-terracotta`). Replace all `blue-*`/`gray-*` with tokens.
- [ ] **Step 3** — `npm run test -- src/components/search/FilterPanel.test.tsx` (green), `npm run test`, `npm run type-check`.
- [ ] **Step 4 — commit** `git add frontend/src/components/search/FilterPanel.tsx frontend/src/components/search/FilterPanel.test.tsx && git commit -m "feat(ui): restyle FilterPanel to editorial tokens (T2)"`

---

### Task 5: Restyle EmptyState

**Files:** Modify `frontend/src/components/search/EmptyState.tsx`, `EmptyState.test.tsx`.

Read both. PRESERVE: the heading text "No properties found", suggestions list, FAQ toggle + `aria-expanded`, FAQ content. ONLY restyle.

- [ ] **Step 1** — confirm current tests pass.
- [ ] **Step 2 — restyle.** Heading → `font-serif text-ink` (serif). Suggestions card → `bg-terracotta-tint border border-border rounded-card` with `text-terracotta` bullets. FAQ toggle/links → `text-terracotta hover:bg-terracotta-tint`. FAQ cards → `bg-canvas border border-border rounded-card`. Replace all `blue-*`/`gray-*` with tokens.
- [ ] **Step 3** — `npm run test -- src/components/search/EmptyState.test.tsx` (green), `npm run test`, `npm run type-check`.
- [ ] **Step 4 — commit** `git add frontend/src/components/search/EmptyState.tsx frontend/src/components/search/EmptyState.test.tsx && git commit -m "feat(ui): restyle EmptyState to editorial tokens (T2)"`

---

### Task 6: Editorial map pins + popup

**Files:** Modify `frontend/src/components/search/MapView.client.tsx`. (Read `MapView.test.tsx` first — it asserts `marker-${id}`, `map-container`/`mapbox-map`, popup content; KEEP those testids and the popup's text content.)

- [ ] **Step 1** — confirm `npm run test -- src/components/search/MapView.test.tsx` passes.
- [ ] **Step 2 — restyle markers to terracotta price pills.** Replace each `Marker`'s inner `<div>` (currently a round emoji dot) with an editorial price pill that keeps `data-testid={`marker-${property.id}`}`, the `onClick`, `onMouseEnter`/`onMouseLeave` handlers, and the hovered/selected logic:
```tsx
            <div
              data-testid={`marker-${property.id}`}
              className={`cursor-pointer rounded-pill border px-2 py-1 text-xs font-semibold font-sans shadow-sm transition-all ${
                hoveredPropertyId === property.id || selectedPropertyId === property.id
                  ? 'bg-terracotta text-white border-terracotta scale-110'
                  : 'bg-surface text-terracotta border-border hover:scale-105'
              }`}
              onMouseEnter={() => handleMarkerHover(property.id)}
              onMouseLeave={handleMarkerLeave}
            >
              €{property.nightly_rate_eur.toFixed(0)}
            </div>
```
Update the popup block to editorial tokens (serif title, `text-ink`/`text-taupe`, terracotta star) while keeping the same text content the test checks. Keep the `mapboxToken` fallback block but swap `bg-gray-100`/`text-gray-*` → `bg-canvas`/`text-taupe`.
- [ ] **Step 3** — `npm run test -- src/components/search/MapView.test.tsx` (green). If a marker assertion checked the emoji or `bg-red-500`, update it to the editorial price-pill form (intended change). Then `npm run test`, `npm run type-check`.
- [ ] **Step 4 — commit** `git add frontend/src/components/search/MapView.client.tsx frontend/src/components/search/MapView.test.tsx && git commit -m "feat(ui): editorial terracotta map pins and popup (T2)"`

---

### Task 7: Numbered Pagination component

**Files:** Create `frontend/src/components/search/Pagination.tsx`, `Pagination.test.tsx`.

- [ ] **Step 1 — failing test** `Pagination.test.tsx`:
```tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, it, expect, vi } from 'vitest';
import { Pagination } from './Pagination';

describe('Pagination', () => {
  it('renders a button for each page', () => {
    render(<Pagination page={1} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Page 1' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Page 3' })).toBeInTheDocument();
  });

  it('marks the current page with aria-current', () => {
    render(<Pagination page={2} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Page 2' })).toHaveAttribute('aria-current', 'page');
  });

  it('calls onPageChange when a page is clicked', async () => {
    const onPageChange = vi.fn();
    const user = userEvent.setup();
    render(<Pagination page={1} totalPages={3} onPageChange={onPageChange} />);
    await user.click(screen.getByRole('button', { name: 'Page 2' }));
    expect(onPageChange).toHaveBeenCalledWith(2);
  });

  it('disables Previous on the first page and Next on the last', () => {
    const { rerender } = render(<Pagination page={1} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled();
    rerender(<Pagination page={3} totalPages={3} onPageChange={() => {}} />);
    expect(screen.getByRole('button', { name: 'Next page' })).toBeDisabled();
  });

  it('renders nothing for a single page', () => {
    const { container } = render(<Pagination page={1} totalPages={1} onPageChange={() => {}} />);
    expect(container).toBeEmptyDOMElement();
  });
});
```
Run → FAIL (no module).

- [ ] **Step 2 — implement** `Pagination.tsx`:
```tsx
import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface PaginationProps {
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/** Numbered editorial pagination with prev/next arrows. Renders null for <= 1 page. */
export function Pagination({ page, totalPages, onPageChange }: PaginationProps) {
  if (totalPages <= 1) return null;
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const arrow = 'flex h-10 w-10 items-center justify-center rounded-pill border border-border text-taupe transition-colors hover:text-ink disabled:opacity-40 disabled:cursor-not-allowed';
  return (
    <nav aria-label="Pagination" className="flex items-center justify-center gap-2 py-4">
      <button type="button" aria-label="Previous page" disabled={page === 1}
        onClick={() => onPageChange(page - 1)} className={arrow}>
        <ChevronLeft size={16} aria-hidden />
      </button>
      {pages.map((p) => (
        <button key={p} type="button" aria-label={`Page ${p}`}
          aria-current={p === page ? 'page' : undefined}
          onClick={() => onPageChange(p)}
          className={`h-10 w-10 rounded-pill font-sans text-sm transition-colors ${
            p === page ? 'bg-terracotta text-white' : 'text-taupe hover:bg-terracotta-tint'
          }`}>
          {p}
        </button>
      ))}
      <button type="button" aria-label="Next page" disabled={page === totalPages}
        onClick={() => onPageChange(page + 1)} className={arrow}>
        <ChevronRight size={16} aria-hidden />
      </button>
    </nav>
  );
}
```
- [ ] **Step 3** — `npm run test -- src/components/search/Pagination.test.tsx` (5 green), `npm run type-check`.
- [ ] **Step 4 — commit** `git add frontend/src/components/search/Pagination.tsx frontend/src/components/search/Pagination.test.tsx && git commit -m "feat(ui): add numbered editorial Pagination (T2)"`

---

### Task 8: Restyle the Search page (two-pane layout + compose)

**Files:** Modify `frontend/src/app/search/page.tsx`, `page.test.tsx`.

Read both. PRESERVE: all hooks, URL-param logic, `handleSearch`/`handleFiltersChange`/`handlePageChange`/`handlePropertyClick`/`handleMapPropertyClick`, the `data-testid`s (`property-grid`, `property-grid-loading`, `data-property-id`), loading/empty/results branches, the Suspense wrapper. Replace layout + pagination + filter presentation only.

- [ ] **Step 1** — confirm `npm run test -- src/app/search/page.test.tsx` passes.
- [ ] **Step 2 — relayout.** Apply:
  - Page background `bg-canvas` (drop `bg-gray-50`).
  - Search bar row: keep `<SearchBar onSearch={handleSearch} />` in a centered max-width container (`mx-auto max-w-6xl px-16 py-6`), not full-bleed.
  - Below: a **two-pane** flex (desktop): left results column `w-[55%]` scrollable, right map `w-[45%]` `sticky top-[73px] h-[calc(100vh-73px)]`. On mobile stack (results then map, map gets a fixed height like `h-96`).
  - Filter presentation: a horizontal bar above the grid with a single editorial **"Filters" pill** button (`rounded-pill border border-border px-4 py-2 text-sm text-taupe hover:text-ink`, with a lucide `SlidersHorizontal` icon) that toggles a `showFilters` boolean; when open, render the existing `<FilterPanel onFiltersChange={handleFiltersChange} />` in a dropdown/region below the pill. Keep `FilterPanel` mounted-on-toggle.
  - Property grid: change to a 2-column editorial grid on desktop (`grid grid-cols-1 sm:grid-cols-2 gap-6`), keep `ref`, `data-testid="property-grid"`, and the per-card `data-property-id` wrapper; change the selected highlight ring from `ring-blue-600` to `ring-2 ring-terracotta`.
  - Replace the Prev/Next pagination block with `<Pagination page={searchResults.pagination.page} totalPages={searchResults.pagination.total_pages} onPageChange={handlePageChange} />`. Keep the results-count line but restyle to `text-taupe`.
  - Map aside: drop the `h-96` small box; the right pane is now full-height (see two-pane above). Keep the `<MapView .../>` props exactly.
  - Loading skeletons: keep `PropertyCardSkeleton` in the 2-col grid.
- [ ] **Step 3** — `npm run test -- src/app/search/page.test.tsx`. If a test asserted the old Prev/Next button labels or `Page X of Y` text, update to the new `Pagination` (query `Page 2` button / `aria-label="Next page"`). Keep all data-testid-based assertions working. Then `npm run test`, `npm run type-check`, `npm run lint`.
- [ ] **Step 4 — commit** `git add frontend/src/app/search/page.tsx frontend/src/app/search/page.test.tsx && git commit -m "feat(ui): restyle search page to editorial two-pane layout (T2)"`

---

### Task 9: Full verification + PR

- [ ] **Step 1** — `npm run test` (all green), `npm run type-check` (clean), `npm run lint` (no NEW errors), `npm run build` (succeeds).
- [ ] **Step 2 — manual** `npm run dev`, open `/search?location=Barcelona&checkIn=<future>&checkOut=<future+5>`; compare against Figma node `1:418`: editorial cards (serif location, €X night, ★rating), two-pane with tall map + terracotta price pins, numbered pagination, slim search bar, Filters pill, global footer.
- [ ] **Step 3 — push + PR**
```bash
git push -u origin epic-editorial-restyle-t2-search
gh pr create --base main --title "Editorial UI restyle — T2 Search + Map" --body "<summary, test plan, screenshots>"
```
- [ ] **Step 4** — after CI green + merge, close the T2 issue.

## Self-review notes
- **Spec coverage:** two-pane layout, editorial cards, slim search bar, filter pill, numbered pagination, terracotta map pins, global footer — all have tasks. Header is the global NavigationBar (T1), intentionally not rebuilt.
- **Behaviour preserved:** every task lists the testids/props/handlers to keep; only presentation changes. Intended design changes (single-star rating, numbered pagination, price-pill markers) are called out where they require updating an existing assertion.
- **No placeholders:** new components (Footer, Pagination) have complete code; restyles give concrete token classes + the preserve-list.
- **Tokens only:** every task says to remove `blue-*`/`gray-*`/`red-*` and use T1 tokens.
