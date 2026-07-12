# Design: Editorial UI Restyle (Stitch / Figma)

**Date**: 2026-06-22
**Status**: Approved
**Figma**: https://www.figma.com/design/yUOmxNuANSYeRjwW1eNBmV/Untitled (file key `yUOmxNuANSYeRjwW1eNBmV`)

## Summary

Apply the "editorial style" design produced in Google Stitch (exported to
Figma) across all guest-facing screens of StayHub. The frontend is already
fully built and functional; this is a **presentational restyle**, not new
functionality. All existing behaviour, data flow, and tests must remain
intact ("faithful adaptation" fidelity — match the editorial style closely
but adapt to live data and dynamic states).

Treated as an **epic, delivered screen by screen**: one foundation ticket
(design system) followed by one ticket per screen.

## Design tokens approach

Selected **Approach A**: design tokens in Tailwind v4 `@theme` + a small set
of thin presentational primitives. Rejected: inline per-component Tailwind
utilities (drift across 5 screens), and a full `cva`/Storybook component
library (over-engineered for scope).

Rationale: consistency enforced centrally, foundation ticket de-risks every
later ticket, idiomatic to the existing `@import "tailwindcss"` + `@theme
inline` setup in `frontend/src/app/globals.css`.

## Design tokens

Extracted from the Figma (Stitch exports no Figma variables; values sampled
from `get_design_context` on representative nodes). Defined in
`frontend/src/app/globals.css` under `@theme inline`:

```css
@theme inline {
  /* Color */
  --color-ink:        #1b1c1a;  /* headings, primary text */
  --color-taupe:      #56423d;  /* body, muted/meta text */
  --color-terracotta: #89351d;  /* primary accent: CTAs, links, price pins */
  --color-terracotta-tint: rgba(137,53,29,0.10); /* badge / overlay bg */
  --color-border:     rgba(220,193,186,0.30);    /* card borders */
  --color-divider:    rgba(220,193,186,0.15);    /* hairline dividers */
  --color-surface:    #ffffff;
  --color-canvas:     #faf8f5;  /* warm off-white page background */

  /* Type */
  --font-serif: "Playfair Display", Georgia, serif;  /* headings, prices */
  --font-sans:  "Inter", system-ui, sans-serif;       /* labels, body, UI */

  /* Radius */
  --radius-card: 8px;
  --radius-pill: 12px;
}
```

- Fonts loaded via `next/font/google` (Playfair Display + Inter) in
  `layout.tsx`, replacing the current Geist fonts.
- **Dark mode is dropped.** The editorial design is light-only; the current
  `prefers-color-scheme: dark` block in `globals.css` is removed.

## Shared primitives

New presentational components under `frontend/src/components/shared/ui/`.
Presentational only — they wrap/compose with existing functional components,
which keeps behaviour and existing tests unchanged.

| Primitive | Encodes | Used by |
|-----------|---------|---------|
| `Heading` | Playfair serif; sizes h1 40px / h2 32px / h3 24px; `--color-ink` | every screen |
| `Label`   | Inter uppercase; letter-spacing 1.2–2.4px; 12px `--color-taupe` (the micro-labels e.g. "SANTORINI, GREECE", "INVESTMENT") | cards, sections |
| `Button`  | variants: `primary` (terracotta fill), `ghost` (uppercase terracotta text + arrow, "VIEW DETAILS →") | all CTAs |
| `Badge`   | terracotta-tint pill ("CONFIRMED", "COMPLETED") | trip/status |
| `Card`    | white surface, `--radius-card`, `--color-border`, hairline `--color-divider` internal splits | search results, trips, property sections |

Each primitive gets red→green unit/snapshot tests in the foundation ticket.

## Per-screen restyle map

Each screen retains its current functional components and data flow; only
presentation changes. Exact paddings/layout/assets per frame are pulled from
the corresponding Figma node at implementation time.

| Screen | Figma node | Components touched | Key editorial changes |
|--------|-----------|--------------------|------------------------|
| Foundation | — | `layout.tsx`, `globals.css`, `shared/ui/*`, `NavigationBar` | Tokens, fonts, primitives, serif `STAYHUB` logo, terracotta nav CTA |
| Search + Map | `1:418` | `SearchBar`, `FilterPanel`, `PropertyCard`, `MapView`, `EmptyState`, `PropertyCardSkeleton` | Pill search/filter bar; cards with serif titles + uppercase location label + `€/night`; light-blue map with terracotta price pins; editorial empty state |
| Property Details | `1:622` | `PhotoGallery`, `AmenityList`, `AvailabilityCalendar`, `PriceBreakdown`, `ReviewList`, `PropertyDetailSkeleton` | Serif title/section headings; hairline dividers; sticky booking card with terracotta Reserve; two-column review grid |
| Checkout | `1:235` | `PaymentForm`, `BookingSummary`, `PriceBreakdown` | Two-column form/summary; serif headings; terracotta "Confirm and pay"; hold-countdown banner as tinted strip |
| Booking Success | `1:138` | `confirmation/[id]/page` | Centered editorial confirmation; serif reference number; terracotta primary + ghost secondary buttons |
| My Trips | `1:2` | `trips/page`, `trips/[id]/page`, `TripCard`, `CancellationModal`, `TripCardSkeleton` | Tabs (Upcoming/Past); wide editorial trip cards (uppercase label + serif name + status badge + "INVESTMENT" price + "VIEW DETAILS →"); styled cancellation modal |

Screens render **real data** from existing hooks; layouts adapt to live
content (variable title lengths, loading/empty/error states) rather than
hardcoding Stitch's mock text/imagery.

## Epic + ticket breakdown

Epic: *Editorial UI restyle (Stitch/Figma)*.

T1 blocks all others; T2–T6 are mutually independent.

| # | Ticket | Depends on | Deliverable |
|---|--------|-----------|-------------|
| T1 | Design foundation | — | Tokens, Playfair+Inter via `next/font`, 5 `shared/ui` primitives (+tests), restyled `NavigationBar` |
| T2 | Search + Map screen | T1 | Restyled search bar, filters, property card, map, empty state, skeleton |
| T3 | Property Details screen | T1 | Restyled gallery, amenities, calendar, price breakdown, reviews, sticky booking card |
| T4 | Checkout screen | T1 | Restyled payment form, booking summary, hold-countdown banner |
| T5 | Booking Success screen | T1 | Restyled confirmation page |
| T6 | My Trips screen | T1 | Restyled tabs, trip cards, badges, cancellation modal |

## Workflow (per repo rules + standing preferences)

- Feature branch `issue-XX-tNN-<slug>` → commits → PR → CI (Backend +
  Frontend) green → merge. **Never commit to `main`.**
- **TDD throughout**: primitives get red→green tests; existing screen tests
  must stay green (faithful adaptation = behaviour unchanged). Visual restyle
  verified by running the app, not only by tests.
- Close the GitHub issue with a completion comment when merged.
- Each screen ticket pulls its exact Figma node via the Figma MCP at
  implementation time.

## Out of scope (YAGNI)

- Dark mode.
- Auth screens (`login`, `register`) — not present in the Figma.
- Any backend change.
- New functionality or behaviour change.
- Real photo sourcing — existing image handling is retained.

## Success criteria

- All five guest screens visually match the editorial Figma design at desktop
  (1280px), verified by running the app against each frame.
- Existing frontend test suite remains green; new primitives are covered by
  tests.
- No backend changes; no behavioural regressions in booking/search/trips
  flows.
- Tokens and primitives are the single source of truth — no scattered
  hardcoded hex/font values in screen components.
