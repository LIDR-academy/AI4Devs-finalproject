## Context

`HomePage` currently renders only `AnnualGoalCard` with a basic container and hard-coded palette values. The PRD expects Home sections for current reads, monthly KPIs, annual goal, and current TBR.

## Approach

1. Replace legacy page header with `PageHeader` from `components/ui`.
2. Introduce a responsive grid (`repeat(auto-fit, minmax(...))`) that prevents horizontal overflow.
3. Keep `AnnualGoalCard` mounted in one dedicated grid card to preserve all existing interactions.
4. Add lightweight placeholder cards for:
   - Libros en curso
   - KPIs del mes
   - TBR actual
   with descriptive copy and badges to communicate upcoming data modules.
5. Migrate `HomePage.css` and `AnnualGoalCard.css` to semantic design tokens for colors, spacing, typography, border radius, and focus rings.

## Accessibility

- Keep proper heading hierarchy (`h1` page title, `h2` section titles).
- Maintain visible focus styles on interactive controls in annual goal form/buttons.
- Ensure card content remains readable at narrow widths without horizontal scroll.

## Risks and mitigations

- Risk: Placeholder sections can be mistaken for complete features.
  - Mitigation: explicit "coming soon" helper text.
- Risk: Annual goal card regressions while restyling.
  - Mitigation: no TS/logic changes in `AnnualGoalCard.tsx`; CSS-only restyle.

## Verification

- `npm run build` in `frontend`.
- Manual check: no horizontal overflow, section alignment on desktop/tablet widths, annual goal create/edit still works.
