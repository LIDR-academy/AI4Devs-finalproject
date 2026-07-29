## Original

**KAN-23** — Estilo + maquetación: Reading Stats

Aplicar tokens/componentes de KAN-18 a **Reading Stats**: ChartCards consistentes, gráficos alineados y sin desbordamiento, espaciado coherente. WCAG 2.1 AA.

## Enhanced

### Problem

`StatsPage` still uses legacy page CSS with hard-coded colors and custom card styles. Reading Stats needs consistent design-system composition (header, controls, KPI cards, chart cards) and responsive behavior without horizontal overflow.

### Scope (in)

- Restyle `StatsPage` with KAN-18 primitives (`PageHeader`, `Input`, `ChartCard`) and tokenized CSS.
- Align KPI and chart sections with coherent spacing and responsive grid behavior.
- Ensure genre and format chart blocks render inside consistent chart card containers.
- Remove hard-coded palette values from Stats page styling.
- Keep all existing data/query behavior and month filtering logic unchanged.

### Scope (out)

- Any new analytics features (KAN-31+ and KAN-40+).
- Backend changes to monthly stats API.
- Changes to Home/Lists/Goals restyles.

### Acceptance criteria

1. Reading Stats page header and period control use design-system patterns.
2. KPI and chart areas are consistently aligned and responsive.
3. No horizontal overflow in the main page area.
4. Existing loading/empty/error and month-change behavior remain unchanged.
5. `npm run build` succeeds in `frontend`.
