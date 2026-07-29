## Why

The Goals route is still a placeholder and does not reflect the annual-goal UI quality already delivered in Home. KAN-25 introduces a dedicated Goals page with design-system alignment for annual goal card, progress bar, and forecast presentation.

## What Changes

- Replace `/goals` placeholder with a real `GoalsPage`.
- Use `PageHeader` + tokenized layout for Goals page shell.
- Reuse existing `AnnualGoalCard` within a dedicated goals context.
- Add supporting explanatory card copy while preserving existing interactions.

## Capabilities

### New Capabilities

- `goals-page-ui`: Dedicated Goals route layout and composition using design-system primitives.

### Modified Capabilities

- `annual-goal-home-ui`: Annual goal card presentation applies consistently when rendered on `/goals` as well as Home.

## Impact

- Frontend: `App.tsx`, `frontend/src/pages/GoalsPage.tsx`, `frontend/src/pages/GoalsPage.css`.
- No backend/API changes.
