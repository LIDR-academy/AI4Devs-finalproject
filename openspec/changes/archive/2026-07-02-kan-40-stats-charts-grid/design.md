## Context

KAN-15/KAN-23 delivered KPIs plus genre and format blocks. US-12 requires six chart areas. Jira splits pie (KAN-41) and bar (KAN-42) work; this change is layout-only.

## Decisions

### Decision 1: Two-row grid

- Row 1 (`stats-charts-grid__pies`): CSS grid `repeat(4, 1fr)` on desktop, `repeat(2, 1fr)` on tablet, `1fr` on mobile.
- Row 2 (`stats-charts-grid__bars`): `repeat(2, 1fr)` on desktop, `1fr` on mobile.

### Decision 2: Placeholder slots

`ChartSlotPlaceholder` renders a `ChartCard` with title/subtitle and an empty body region (`min-height`) so slots are visible and labeled until KAN-41/42 replace them.

### Decision 3: No backend changes

Container-only; API extensions wait for chart implementation tickets.

## Non-Goals

- Pie/bar chart libraries or data wiring.
- Removing genre/format list visualizations (KAN-41 may convert to pie later).
