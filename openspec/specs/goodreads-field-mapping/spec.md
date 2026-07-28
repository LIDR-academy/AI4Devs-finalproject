# goodreads-field-mapping Specification

## Purpose

Map parsed Goodreads CSV rows to book and reading-record import drafts per US-13 rules (KAN-45).

## Requirements

### Requirement: Map Goodreads rows to import drafts

The system SHALL map each `GoodreadsParsedRow` to a `GoodreadsImportDraft` with `book` and `reading_record` fields aligned to `docs/data-model.md`, following US-13 rules: Exclusive Shelf→status (`read`→`leido`, `to-read`→`pendiente`, `currently-reading`→`leyendo`); Binding→`read_format` with Unknown/empty→null; My Rating 0→null rating; Date Read→`finished_on`; Date Added→`started_on` only for `leido`/`leyendo` and null when Date Added is after Date Read; Original Publication Year with fallback Year Published→`publication_year`; Number of Pages→`page_count`; Title/Author→`title`/`authors` with trailing series parentheses normalized into clean `title` and optional `series_name` (ignore Additional Authors); `data_source`=`goodreads`; Book Id→`external_provider_id`.

#### Scenario: Read shelf with valid dates

- **WHEN** a row has `exclusive_shelf` read, Date Read and Date Added before Date Read
- **THEN** `reading_record.status` is `leido`, `finished_on` and `started_on` are set from the dates

#### Scenario: Date Added after Date Read

- **WHEN** Date Added is after Date Read on a read row
- **THEN** `finished_on` is Date Read and `started_on` is null

#### Scenario: Read without finish date

- **WHEN** a row is `read` with empty Date Read
- **THEN** `reading_record.status` is `leido` and `finished_on` is null

#### Scenario: Missing title excluded

- **WHEN** a parsed row has an empty title
- **THEN** it is omitted from `mapped_rows` and a mapping warning is recorded

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
