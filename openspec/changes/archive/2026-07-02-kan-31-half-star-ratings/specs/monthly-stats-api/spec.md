## MODIFIED Requirements

### Requirement: Average rating aggregation

The system SHALL compute `average_rating` as the mean of non-null `reading_records.rating` (0.5–5 in 0.5 steps) across the period's qualifying books, rounded to two decimals, and SHALL return `null` when no qualifying book has a rating.

#### Scenario: Average includes half-star ratings

- **WHEN** two qualifying books have ratings `4` and `3.5`
- **THEN** `average_rating` is `3.75`
