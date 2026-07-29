## ADDED Requirements

### Requirement: Parse Goodreads CSV upload

The system SHALL expose `POST /v1/import/goodreads` accepting a multipart `file` field with a Goodreads library export CSV. The endpoint SHALL parse UTF-8 quoted CSV, validate required Goodreads headers, clean ISBN/ISBN13 Excel wrappers (`="…"`), and return normalized rows for downstream mapping without persisting books.

#### Scenario: Valid export parsed

- **WHEN** the client uploads a standard Goodreads library CSV
- **THEN** the response includes `rows` with cleaned ISBN fields and `meta.parsed_rows` matching data rows

#### Scenario: Missing file rejected

- **WHEN** the request has no `file` field
- **THEN** the API responds with HTTP 400

#### Scenario: Invalid headers rejected

- **WHEN** required Goodreads columns are missing
- **THEN** the API responds with HTTP 400

#### Scenario: Malformed row skipped with warning

- **WHEN** a data row has the wrong column count
- **THEN** the row is skipped and a warning is included in `warnings`
