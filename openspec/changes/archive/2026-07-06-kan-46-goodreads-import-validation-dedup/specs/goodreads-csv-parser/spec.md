## MODIFIED Requirements

### Requirement: Parse Goodreads CSV upload

The system SHALL expose `POST /v1/import/goodreads` accepting a multipart `file` field with a Goodreads library export CSV. The endpoint SHALL parse UTF-8 CSV, validate required Goodreads headers, clean ISBN wrappers, map rows to import drafts, validate and dedupe against the user's library, persist accepted rows, and return parse/mapping warnings plus `imported`, `skipped_rows`, and summary counts.

#### Scenario: Upload imports new library rows

- **WHEN** the client uploads a standard Goodreads library CSV with books not yet in the library
- **THEN** the response includes `imported` entries with `book_id` and `meta.imported_count` greater than zero
