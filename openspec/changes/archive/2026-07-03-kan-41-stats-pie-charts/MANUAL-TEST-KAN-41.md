# Manual test — KAN-41 Stats pie charts

**Branch:** `feature/KAN-41-stats-pie-charts`

## API

- [ ] `GET /v1/stats?period=year&year=YYYY` returns `audience_distribution` and `rating_distribution`
- [ ] Empty period returns empty arrays for both

## Pie charts

- [ ] Open `/stats` with books read in period
- [ ] **Genre, format, audience, rating** slots show SVG pie + legend (not dashed placeholder)
- [ ] Legend shows label + count for each slice
- [ ] Format legend emphasizes predominant format

## Accessibility

- [ ] Pie SVG has descriptive `aria-label`
- [ ] Legend text readable without relying on color alone

## Regression

- [ ] KPI cards unchanged
- [ ] Bar chart placeholders (KAN-42) still visible
- [ ] Period filter works
