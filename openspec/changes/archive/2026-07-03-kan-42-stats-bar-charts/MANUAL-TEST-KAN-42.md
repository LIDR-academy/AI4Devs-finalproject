# Manual test — KAN-42 Stats bar charts

**Branch:** `feature/KAN-42-stats-bar-charts`

## Year mode

- [ ] Open `/stats` in **year** mode with books read in selected year
- [ ] Books bar shows years on X axis; selected year emphasized
- [ ] Pages bar shows years on X axis

## Month mode

- [ ] Switch to **month** mode
- [ ] Books bar shows 12 months for the year; selected month emphasized
- [ ] Pages bar shows 12 months for the year

## Accessibility

- [ ] Bar charts have descriptive `aria-label`
- [ ] Axis labels visible (month abbreviations / years)

## Regression

- [ ] Pie charts still render (KAN-41)
- [ ] KPI cards and period filter unchanged
