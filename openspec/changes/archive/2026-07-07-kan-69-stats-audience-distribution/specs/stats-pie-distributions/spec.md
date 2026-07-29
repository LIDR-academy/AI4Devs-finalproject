## MODIFIED Requirements

### Requirement: Stats API audience and rating distributions

The stats endpoints SHALL return `audience_distribution` and `rating_distribution` arrays alongside existing fields for both month and year periods.

#### Scenario: Audience distribution by book audience

- **WHEN** finished books in the period have `audience_id` referencing user audiences
- **THEN** `audience_distribution` lists counts per audience **name** and `unknown` for unset `audience_id`

#### Scenario: Rating distribution for rated books

- **WHEN** finished books in the period have ratings
- **THEN** `rating_distribution` lists counts per rating value (0.5 step); unrated books are excluded

#### Scenario: Empty period

- **WHEN** no qualifying books exist in the period
- **THEN** both distributions are empty arrays

### Requirement: Accessible pie charts for four pie slots

The Reading Stats dashboard SHALL render pie charts with text legends for genre, format, audience and rating when distribution data exists.

#### Scenario: Audience pie uses user labels

- **WHEN** `audience_distribution` includes audience names such as `Juvenil` or `Adulto`
- **THEN** the audience pie chart legend shows those names
