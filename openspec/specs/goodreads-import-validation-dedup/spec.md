# goodreads-import-validation-dedup Specification

## Purpose

Validate, dedupe, and persist Goodreads import rows idempotently (KAN-46, US-13).

## Requirements

### Requirement: Validate and dedupe Goodreads import rows

The system SHALL validate mapped Goodreads import drafts, skip rows without a title, detect duplicates by `isbn13` or normalized `title`+`authors` against the user's library and earlier rows in the same upload, persist accepted rows to `books` and `reading_records` without overwriting existing books, and return `imported`, `skipped_rows`, and summary counts on `POST /v1/import/goodreads`.

#### Scenario: First import creates books

- **WHEN** the user uploads a valid Goodreads CSV with new titles
- **THEN** `meta.imported_count` matches new books created and `imported` lists `book_id` per row

#### Scenario: Re-import is idempotent

- **WHEN** the user uploads the same CSV again
- **THEN** duplicate rows are skipped with `DUPLICATE_EXISTING` and no new books are created

#### Scenario: In-batch duplicate skipped

- **WHEN** two mapped rows share the same dedup key in one file
- **THEN** only the first is imported and the second is `DUPLICATE_IN_BATCH`

#### Scenario: Missing title skipped

- **WHEN** a row has no title after mapping
- **THEN** it appears in `skipped_rows` with `MISSING_TITLE` and is not persisted
