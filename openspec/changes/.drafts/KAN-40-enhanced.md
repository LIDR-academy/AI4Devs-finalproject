## Original

**KAN-40 — US-12 · Complete dashboard chart set (4 pies + 2 bars)**

As a reader, I want the full chart set defined in the spec, to understand my habits across all dimensions.

**Context:** Spec defines 4 pie charts (genre, format, audience, ratings) + 2 bar charts (books/month, pages/month). Currently fewer exist.

**Queue note:** This pipeline ticket implements the **chart grid container** (layout slots for 4 pies + 2 bars). Pie chart implementations follow in KAN-41; bar charts in KAN-42.

**Subtasks:** KAN-41 (pies), KAN-42 (bars).

## Enhanced

### Problem

Reading Stats renders genre and format blocks in a generic 2-column auto-fit grid. The product spec requires a structured dashboard: **4 pie-chart slots** on the first row and **2 bar-chart slots** on the second row, ready for KAN-41/KAN-42.

### Scope (KAN-40 only)

**In scope**
- `StatsChartsGrid` component: responsive grid with `pies` (4 slots) and `bars` (2 slots) regions.
- Move existing `GenreDistributionChart` and `FormatBreakdown` into pie slots 1–2.
- Placeholder `ChartSlotPlaceholder` shells for audience pie, ratings pie, books bar, pages bar (titled ChartCards, accessible labels, token styling).
- Update `StatsPage` to compose the grid; CSS in `StatsChartsGrid.css`.
- Delta spec: `monthly-stats-ui` — chart grid layout requirement.
- `MANUAL-TEST-KAN-40.md`.

**Out of scope**
- Pie chart rendering (KAN-41).
- Bar chart data/API (KAN-42).
- Backend distribution fields for audience/rating/time series.

### Files

| Path | Change |
|------|--------|
| `frontend/src/components/stats/StatsChartsGrid.tsx` | Grid layout |
| `frontend/src/components/stats/ChartSlotPlaceholder.tsx` | Reserved slot shell |
| `frontend/src/components/stats/StatsChartsGrid.css` | Grid tokens |
| `frontend/src/pages/StatsPage.tsx` | Wire grid + placeholders |
| `openspec/changes/kan-40-stats-charts-grid/` | Artifacts |

### Definition of done

1. Stats page shows 4 pie slots + 2 bar slots when data is non-empty.
2. Genre and format charts remain functional in slots 1–2.
3. Placeholder slots have titles matching spec (audiencia, puntuaciones, libros, páginas).
4. Layout is responsive (pies stack on narrow viewports; bars stack).
5. Frontend build passes.

### Skipped queue tickets

KAN-32, KAN-33, KAN-34 were delivered in KAN-31 PR #32 — mark `skipped` in pipeline state.
