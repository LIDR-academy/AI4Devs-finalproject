# stats-pie-distributions Specification

## Purpose

Stats API audience/rating distributions and accessible pie chart rendering for Reading Stats pie slots (KAN-41).

## Requirements

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

#### Scenario: Pie chart with legend

- **WHEN** a distribution has at least one slice
- **THEN** the slot shows an SVG pie chart and a legend listing each category label and count

#### Scenario: Accessible chart summary

- **WHEN** a pie chart renders
- **THEN** it exposes a descriptive accessible name summarizing the distribution without relying on color alone

#### Scenario: Audience pie uses user labels

- **WHEN** `audience_distribution` includes audience names such as `Juvenil` or `Adulto`
- **THEN** the audience pie chart legend shows those names
