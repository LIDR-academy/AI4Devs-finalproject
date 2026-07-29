## Why

Home is the dashboard entry point but still shows legacy spacing/colors and an incomplete visual hierarchy compared with PRD expectations. KAN-21 aligns Home with the design system and fixes layout consistency/overflow so the page is usable as the Phase 3 baseline.

## What Changes

- Restyle Home page shell with design-system components and token-based CSS.
- Add a responsive dashboard grid with section cards for in-progress books, monthly KPIs, annual goal, and current TBR.
- Keep annual goal behavior unchanged while updating its visual styling to tokens.
- Ensure desktop-first layout with no horizontal overflow and WCAG focus visibility.

## Capabilities

### New Capabilities

- `home-page-ui`: Home dashboard composition and visual standards (section layout, placeholders, tokenized styling).

### Modified Capabilities

- `annual-goal-home-ui`: Annual goal card visual presentation updated to design-system tokens (behavior unchanged).

## Impact

- Frontend: `frontend/src/pages/HomePage.tsx`, `HomePage.css`, `frontend/src/components/AnnualGoalCard.css`.
- Depends on: KAN-18 design tokens/components and KAN-19 shared sidebar layout.
- No backend/API changes.
