## ADDED Requirements

### Requirement: Insights section placement

The Reading Stats dashboard SHALL show automatic insights between the KPI cards and the chart section when `insights` is non-empty.

#### Scenario: Insights between KPIs and charts

- **WHEN** the user views Reading Stats for a period with qualifying books
- **THEN** the insights section appears below KPI cards and above the chart grid

#### Scenario: Period change updates insights

- **WHEN** the user changes the period filter
- **THEN** insights update to match the new period
