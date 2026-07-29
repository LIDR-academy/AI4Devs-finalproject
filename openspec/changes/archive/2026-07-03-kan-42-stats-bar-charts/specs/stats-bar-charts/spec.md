## ADDED Requirements

### Requirement: Stats API time-series breakdowns

The stats API SHALL expose time-series breakdowns for bar charts: `monthly_breakdown` on monthly responses and `yearly_breakdown` on yearly responses.

#### Scenario: Monthly breakdown in month mode

- **WHEN** the client requests monthly stats for a year/month
- **THEN** the response includes `monthly_breakdown` with 12 entries (months 1–12) for that year, each with `books_read` and `pages_read`

#### Scenario: Yearly breakdown in year mode

- **WHEN** the client requests yearly stats for a year
- **THEN** the response includes `yearly_breakdown` listing each year (up to the selected year) with `books_read` and `pages_read`

### Requirement: Accessible bar charts for books and pages

The Reading Stats dashboard SHALL render bar charts for books and pages in the two bar slots, with clear axis labels and accessible summaries.

#### Scenario: Month mode axis

- **WHEN** the period filter is in month mode
- **THEN** bar charts use months on the X axis from `monthly_breakdown` and emphasize the selected month

#### Scenario: Year mode axis

- **WHEN** the period filter is in year mode
- **THEN** bar charts use years on the X axis from `yearly_breakdown` and emphasize the selected year
