## ADDED Requirements

### Requirement: Map Goodreads rows to import drafts

The system SHALL map each `GoodreadsParsedRow` to a `GoodreadsImportDraft` with `book` and `reading_record` fields aligned to `docs/data-model.md`, following US-13 rules: Exclusive Shelf→status (`read`→`leido`, `to-read`→`pendiente`, `currently-reading`→`leyendo`); Binding→`read_format` with Unknown/empty→null; My Rating 0→null rating; Date Read→`finished_on`; Date Added→`started_on` only for `leido`/`leyendo` and null when Date Added is after Date Read; Original Publication Year with fallback Year Published→`publication_year`; Number of Pages→`page_count`; Title/Author→`title`/`authors` (ignore Additional Authors); `data_source`=`goodreads`; Book Id→`external_provider_id`.

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
