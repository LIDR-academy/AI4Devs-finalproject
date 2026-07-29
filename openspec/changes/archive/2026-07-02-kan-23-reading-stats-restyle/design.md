## Context

`StatsPage` already fetches monthly stats and renders KPIs plus genre/format blocks, but visual styles are legacy and duplicated in page CSS. KAN-18 includes reusable layout primitives (`PageHeader`, `ChartCard`, tokenized field styles) that should be adopted.

## Approach

1. Replace custom page header with `PageHeader`.
2. Keep native `type="month"` control but style it via design-system field classes.
3. Use `ChartCard` for genre and format sections to ensure consistent structure.
4. Keep KPI cards as lightweight components but convert their styling to design tokens and consistent height/alignment.
5. Tokenize all colors/spacing in `StatsPage.css`, remove hard-coded palette values.

## Accessibility

- Keep semantic headings and section labels.
- Preserve `aria-label` and loading/error/empty messaging.
- Ensure focus-visible ring on month input.

## Verification

- Build frontend (`npm run build`).
- Manual checks for month switching, empty state, and layout responsiveness with no horizontal overflow.
