# Manual test — KAN-23 (Reading Stats restyle)

## Prerequisites

- Backend + frontend running.
- Authenticated user with at least one month of stats data.

## Visual layout

1. Open `/stats`.
2. Verify page uses design-system header and month control alignment.
3. KPI cards appear aligned and consistent in spacing.
4. Genre and format sections render as chart cards with consistent structure.

## Responsiveness and overflow

1. Resize viewport (desktop -> tablet -> mobile).
2. Confirm there is no horizontal page overflow.
3. Confirm chart card content remains readable/aligned.

## Behavior regression

1. Change month selector and verify stats refresh.
2. For an empty month, verify empty state appears.
3. Force/fake API error and verify error state remains visible.
