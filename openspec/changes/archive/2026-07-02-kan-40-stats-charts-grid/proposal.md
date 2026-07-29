## Why

Reading Stats needs a structured layout for the full US-12 chart set (4 pies + 2 bars). Existing genre and format blocks use a generic grid; KAN-40 establishes the container so KAN-41 and KAN-42 can drop in chart implementations.

## What Changes

- Add `StatsChartsGrid` with dedicated pie (4) and bar (2) regions.
- Place genre and format charts in the first two pie slots.
- Add titled placeholder slots for audience, ratings, books-over-time, and pages-over-time charts.

## Capabilities

### Modified Capabilities

- `monthly-stats-ui`: Structured chart grid layout on Reading Stats.

## Impact

- Frontend only: new stats chart components, `StatsPage`, CSS.
