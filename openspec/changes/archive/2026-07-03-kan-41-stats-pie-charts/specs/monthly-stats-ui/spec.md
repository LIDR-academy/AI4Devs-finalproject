## MODIFIED Requirements

### Requirement: Genre distribution chart

The dashboard SHALL render a genre-distribution **pie chart** from `genre_distribution`, with a text legend and accessible labels.

#### Scenario: Genre chart rendered (US-05 scenario 2)

- **WHEN** `genre_distribution` contains multiple genres
- **THEN** the dashboard renders one pie slice per genre with its count in the legend

#### Scenario: Consistent chart card container (KAN-23)

- **WHEN** genre data is available
- **THEN** the chart renders inside a consistent chart-card layout aligned with other dashboard blocks

### Requirement: Format breakdown

The dashboard SHALL render the format breakdown as a **pie chart** from `format_distribution` and highlight `predominant_format` in the legend when present.

#### Scenario: Predominant format highlighted

- **WHEN** the response has `predominant_format: "fisico"`
- **THEN** the format pie legend indicates `fisico` as the predominant format

#### Scenario: Format chart card alignment (KAN-23)

- **WHEN** format data is available
- **THEN** the breakdown renders in a chart-card container with consistent spacing and typography
