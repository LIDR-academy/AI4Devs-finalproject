## Original

**KAN-21** — Estilo + maquetacion: Home

Aplicar tokens y componentes de KAN-18 y corregir alineacion/espaciado en **Home** (libros en curso, KPIs del mes, meta anual, TBR actual). Sin desbordamiento horizontal. Estetica coquette del PRD. WCAG 2.1 AA.

## Enhanced

### Problem

`HomePage` still uses legacy styles (fixed width, hard-coded colors) and only presents the annual goal card with uneven spacing. The page needs a token-based layout aligned with KAN-18/KAN-19 and a responsive dashboard composition without horizontal overflow.

### Scope (in)

- Restyle `HomePage` using KAN-18 primitives (`PageHeader`, `Card`, `Badge`, `Button` where applicable) and tokenized CSS.
- Build a responsive section grid for:
  - Libros en curso (placeholder card)
  - KPIs del mes (placeholder card)
  - Meta anual (existing `AnnualGoalCard`)
  - TBR actual (placeholder card)
- Refactor `AnnualGoalCard` styles to semantic tokens and shared typography.
- Ensure no horizontal overflow inside the main content region and preserve keyboard focus visibility.

### Scope (out)

- New backend data endpoints for KPIs or TBR.
- New business rules for annual goals.
- Restyle for other pages (KAN-23, KAN-24, KAN-25).

### Acceptance criteria

1. Home page uses design tokens only (no hard-coded hex in page/card CSS changed by this ticket).
2. Home sections are aligned with consistent spacing and responsive behavior (`minmax` grid, no page overflow).
3. Annual goal card keeps existing create/edit behavior and remains fully accessible.
4. Placeholders clearly indicate upcoming content while preserving PRD section structure.
5. `npm run build` succeeds in `frontend`.
