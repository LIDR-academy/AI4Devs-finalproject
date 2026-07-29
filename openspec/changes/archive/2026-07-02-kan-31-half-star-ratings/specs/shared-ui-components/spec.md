## MODIFIED Requirements

### Requirement: StarRating keyboard navigation

StarRating SHALL support arrow-key navigation in 0.5 steps when focused and SHALL expose the current rating as accessible text for screen readers.

#### Scenario: Arrow key increases rating by half step

- **WHEN** the control is focused with value `3` and the user presses ArrowRight
- **THEN** the rating updates to `3.5`

#### Scenario: Half-star display

- **WHEN** `value` is `3.5`
- **THEN** three stars render full, the fourth renders half-filled, and the fifth is empty

#### Scenario: Half-star selection

- **WHEN** the user activates the left half of the fourth star
- **THEN** `onChange` is called with `3.5`
