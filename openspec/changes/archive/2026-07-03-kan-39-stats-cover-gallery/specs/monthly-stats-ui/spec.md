## ADDED Requirements

### Requirement: Period cover gallery section

The Reading Stats dashboard SHALL render a cover gallery below the chart section when `books_in_period` is non-empty, showing one tile per qualifying book for the active period. The section heading SHALL reference the selected period scope. The gallery SHALL update when the period filter changes (same refetch as KPIs and charts).

#### Scenario: Gallery after charts

- **WHEN** the user views Reading Stats for a period with qualifying books
- **THEN** the cover gallery appears below the chart grid

#### Scenario: No gallery on empty period

- **WHEN** `books_read` is 0
- **THEN** the empty-state message is shown and the cover gallery is not rendered

#### Scenario: Hover and alt text for book identity

- **WHEN** the user hovers a cover tile or a screen reader encounters the image
- **THEN** title and authors are available via `alt` and/or visible overlay text

#### Scenario: Responsive gallery grid

- **WHEN** the viewport is narrow
- **THEN** cover tiles reflow in a grid without horizontal page overflow
