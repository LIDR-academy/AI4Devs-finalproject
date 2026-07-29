## MODIFIED Requirements

### Requirement: Structured chart grid layout

The Reading Stats dashboard SHALL render a chart section with **four pie-chart slots** and **two bar-chart slots** when period data is non-empty. All four pie slots SHALL render pie charts when distribution data exists. Both bar slots SHALL render bar charts from the stats time-series breakdown fields.

#### Scenario: Full chart grid visible

- **WHEN** the user views Reading Stats for a period with qualifying books
- **THEN** the chart section shows four pie slots in the first row and two bar slots in the second row

#### Scenario: Genre and format in pie slots

- **WHEN** genre and format distributions have data
- **THEN** they render in the first and second pie slots respectively

#### Scenario: Responsive stacking

- **WHEN** the viewport is narrow
- **THEN** pie and bar slots stack without horizontal page overflow

#### Scenario: Bar charts replace placeholders

- **WHEN** time-series breakdown data is available
- **THEN** the books and pages bar slots render bar charts with labeled axes instead of placeholder cards
