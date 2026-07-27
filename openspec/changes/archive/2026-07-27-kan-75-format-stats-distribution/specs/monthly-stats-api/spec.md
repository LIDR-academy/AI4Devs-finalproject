## MODIFIED Requirements

### Requirement: Format distribution and predominant format

The system SHALL return `format_distribution` as an array of `{ format, count }` grouped by the linked `formats.name` for `reading_records.format_id` (bucketing `null` or missing format as `"unknown"`), ordered by count descending.

The system SHALL set `predominant_format` to the non-`unknown` format name with the highest count, deterministically breaking ties by alphabetical order of the format name (`es` locale), or `null` when no qualifying book records a format.

#### Scenario: Distribution with default format names

- **WHEN** the user finished 2 books as `Físico` and 1 as `Ebook` in the period
- **THEN** `format_distribution` includes `{ format: "Físico", count: 2 }` and `{ format: "Ebook", count: 1 }`
- **AND** `predominant_format` is `"Físico"`

#### Scenario: Custom format names

- **WHEN** the user has a custom format `Audiolibro por capítulos` assigned to finished books
- **THEN** `format_distribution` includes that exact name in a bucket
- **AND** `predominant_format` reflects the most frequent custom name when it leads

#### Scenario: Null format_id after format delete

- **WHEN** finished books have `format_id` null (e.g. after format delete)
- **THEN** those books contribute to the `unknown` bucket
- **AND** stats computation does not error

#### Scenario: No format recorded

- **WHEN** no finished book in the period has a format assigned
- **THEN** `predominant_format` is `null`
