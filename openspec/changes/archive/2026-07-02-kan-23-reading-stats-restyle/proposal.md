## Why

Reading Stats is functionally complete but visually inconsistent with the design system introduced in KAN-18 and page restyles in KAN-21/KAN-22. KAN-23 applies token-based layout and consistent chart-card composition to improve readability and avoid overflow regressions.

## What Changes

- Restyle Stats page shell with `PageHeader` and token-based spacing.
- Standardize period picker presentation with design-system input styling.
- Align KPI cards and chart areas into responsive, non-overflowing grids.
- Wrap chart sections in consistent `ChartCard` containers.
- Remove legacy hard-coded color values from Stats page styles.

## Capabilities

### New Capabilities

*(none)*

### Modified Capabilities

- `monthly-stats-ui`: Add design-system visual/layout requirements for Reading Stats page and chart cards while preserving behavior.

## Impact

- Frontend: `StatsPage.tsx`, `StatsPage.css`, `KpiCard.tsx`, `GenreDistributionChart.tsx`, `FormatBreakdown.tsx`.
- Depends on: KAN-18 shared UI primitives.
- No API or backend changes.
