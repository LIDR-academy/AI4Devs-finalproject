# Manual test — KAN-19 Unified sidebar

## Prerequisites

- `cd frontend && npm run dev`
- Log in via dev login

## Sidebar presence

- [ ] Open Home — fixed Veranda blue sidebar on the left with brand title
- [ ] Navigate to Book Tracker, Lists, Reading Stats — **same** sidebar (not a different nav bar)
- [ ] `/login` — no sidebar

## Sitemap (all 9 links on every page)

- [ ] Home
- [ ] Book Tracker
- [ ] Reading Stats
- [ ] Lists
- [ ] Goals (placeholder)
- [ ] Library (placeholder)
- [ ] Recap / Insights (placeholder)
- [ ] Import / Export (placeholder)
- [ ] Profile / Settings (placeholder)

## Active state

- [ ] On `/book-tracker`, Book Tracker item is highlighted (white background)
- [ ] On `/`, Home item is active (`end` match — not active on other routes)

## Accessibility

- [ ] Tab through sidebar links — visible focus ring on each
- [ ] DevTools: `<nav aria-label="Main navigation">` inside `<aside>`

## Regression

- [ ] Book Tracker add book, Lists TBR month nav, Stats month picker still work
- [ ] `npm run build` passes
