## ADDED Requirements

### Requirement: Structured chart grid layout

The Reading Stats dashboard SHALL render a chart section with **four pie-chart slots** and **two bar-chart slots** when period data is non-empty. Existing genre and format visualizations SHALL occupy the first two pie slots. Remaining slots SHALL display labeled placeholder cards until implemented in follow-up tickets (KAN-41, KAN-42).

#### Scenario: Full chart grid visible

- **WHEN** the user views Reading Stats for a period with qualifying books
- **THEN** the chart section shows four pie slots in the first row and two bar slots in the second row

#### Scenario: Genre and format in pie slots

- **WHEN** genre and format distributions have data
- **THEN** they render in the first and second pie slots respectively

#### Scenario: Responsive stacking

- **WHEN** the viewport is narrow
- **THEN** pie and bar slots stack without horizontal page overflow

#### Scenario: Placeholder slot accessibility

- **WHEN** a pie or bar slot has no chart implementation yet
- **THEN** the slot still exposes a titled card with an accessible name describing the upcoming chart type
