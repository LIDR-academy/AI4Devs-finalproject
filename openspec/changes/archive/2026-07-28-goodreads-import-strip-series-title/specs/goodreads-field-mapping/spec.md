## ADDED Requirements

### Requirement: Normalize Goodreads titles with trailing series parentheses

When mapping a Goodreads `Title`, the system SHALL remove one or more trailing parenthetical groups from the end of the trimmed title, collapse leftover whitespace, and use the cleaned string as `book.title`. The system SHALL set `book.series_name` from the extracted parenthetical text with a trailing volume marker (e.g. `, #1`, `#0.5`) removed when present; otherwise `series_name` SHALL be null when no trailing parentheses were removed. If cleaning would leave an empty title, the system SHALL keep the original trimmed title and SHALL leave `series_name` null. Mid-title parentheses (not trailing) SHALL NOT be removed. The import processor SHALL persist `series_name` on catalog edition upsert when set.

#### Scenario: Series-annotated title is split

- **WHEN** a Goodreads row has Title `The Raven Scholar (Eternal Path Trilogy, #1)`
- **THEN** mapped `book.title` is `The Raven Scholar` and `book.series_name` is `Eternal Path Trilogy`

#### Scenario: Title without parentheses unchanged

- **WHEN** a Goodreads row has Title `Dune`
- **THEN** mapped `book.title` is `Dune` and `book.series_name` is null

#### Scenario: Empty clean title keeps original

- **WHEN** a Goodreads row has Title `(Only Parens)`
- **THEN** mapped `book.title` is `(Only Parens)` and `book.series_name` is null

#### Scenario: Series name persisted on import

- **WHEN** a mapped row has a non-null `series_name`
- **THEN** catalog edition upsert stores that `series_name`
