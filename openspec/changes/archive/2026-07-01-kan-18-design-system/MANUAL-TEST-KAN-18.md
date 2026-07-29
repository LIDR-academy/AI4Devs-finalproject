# Manual test — KAN-18 Design system

## Prerequisites

- Frontend dev server: `cd frontend && npm run dev`
- Logged in (dev login)

## Visual — tokens

- [ ] Page background is white; body text uses teal-gray (`--color-text`), not Vite purple
- [ ] Browser devtools → `:root` shows `--color-primary: #6BB1AD` (Veranda blue)

## Components (temporary import or Storybook-free check)

Import components in a scratch route or use browser console — minimum checks:

- [ ] **Button** primary: Veranda blue background, visible `:focus-visible` ring on Tab
- [ ] **Card** uses Lychee (`--color-surface-card`) surface
- [ ] **Modal** opens; Tab cycles focus inside; **Escape** closes
- [ ] **StarRating** (Book Tracker row): click sets rating; **ArrowRight** / **ArrowLeft** change rating when a star is focused
- [ ] **Table** inside TableScroll: horizontal scroll when columns are wide

## Regression

- [ ] Book Tracker loads; star rating on a row still works (re-export path)
- [ ] `npm run build` passes
- [ ] `npm run lint` passes

## Accessibility

- [ ] Tab through Button and Modal close control — focus ring visible
- [ ] Modal has `role="dialog"` and `aria-modal="true"` in devtools

## Docs

- [ ] `docs/design-system-palette.md` lists PRD colors and semantic tokens
