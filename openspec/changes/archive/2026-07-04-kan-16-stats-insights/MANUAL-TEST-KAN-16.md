# Manual test — KAN-16 Stats insights

## Prerequisites

- Backend and frontend running; logged in with books `leido` in the current period

## Steps

1. Open `/stats` for a month with at least one finished book.
2. Below KPI cards, confirm **Insights** section with at least 3 cards.
3. Verify one insight mentions volume change vs the previous month (if applicable).
4. Verify one insight highlights the dominant genre.
5. Switch to year mode — insights update for the selected year.
6. Pick an empty period — no insights section (empty-state message only).

## Expected

- Insight titles and bodies in Spanish.
- Section sits between KPIs and charts.
- Period filter refetches insights without full page reload.
