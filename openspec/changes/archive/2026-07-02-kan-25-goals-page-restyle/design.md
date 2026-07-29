## Context

Annual goal functionality is implemented in `AnnualGoalCard`, currently shown on Home. `/goals` points to `PlaceholderPage`.

## Approach

1. Add `GoalsPage.tsx` with:
   - `PageHeader` title/subtitle
   - `AnnualGoalCard` loaded with current UTC year goal query
   - one complementary info card for roadmap context
2. Add `GoalsPage.css` using tokens and responsive two-column layout (card + helper panel).
3. Update `App.tsx` route `/goals` to render `GoalsPage`.
4. Keep `AnnualGoalCard` logic unchanged.

## Accessibility

- Use semantic headings (`h1` in page header).
- Preserve existing focus handling in annual goal controls.
- Ensure readable contrast and non-overflowing layout.

## Verification

- `npm run build` in `frontend`.
- Manual: open `/goals`, create/edit target, verify forecast/progress and responsive layout.
