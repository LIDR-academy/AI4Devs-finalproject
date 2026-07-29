# import-progress-summary-ui Specification

## Purpose

Import progress and final summary on Import/Export (KAN-52, US-15).

## Requirements

### Requirement: Import progress indicator

During an active Goodreads import job, the Import/Export page SHALL show progress with phase label and processed/total counts, using a visual progress bar and screen-reader-friendly status updates.

#### Scenario: Job in progress

- **WHEN** the client polls an import job with `total_count > 0`
- **THEN** the UI shows phase text, numeric progress, and a progressbar with `aria-valuenow` / `aria-valuemax`

### Requirement: Import final summary

When an import job completes, the page SHALL display a structured summary with counts for imported books, duplicate skips, invalid/discarded rows, books without finish date, and enrichment failures.

#### Scenario: Job completed

- **WHEN** polling returns `status: completed` with `result.meta`
- **THEN** the UI lists all non-zero summary counts in a readable list

### Requirement: Resume in-flight import job

If the user leaves Import/Export while a job runs, returning to the page SHALL resume polling the stored job until completion or failure.

#### Scenario: Return during background job

- **WHEN** `localStorage` contains a job id and `GET /import/jobs/:id` is not terminal
- **THEN** the page resumes progress display and polling without re-uploading the CSV
