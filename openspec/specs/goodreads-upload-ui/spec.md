# goodreads-upload-ui Specification

## Purpose

Accessible Goodreads CSV upload screen on Import/Export (KAN-47, US-13).

## Requirements

### Requirement: Goodreads CSV upload screen

The system SHALL provide an Import/Export page where the user can select a Goodreads library CSV (`.csv`, max 10 MB), submit it to `POST /v1/import/goodreads`, and see loading state plus a minimal success or error message. The file input SHALL have an associated label and keyboard-accessible controls (WCAG 2.1 AA).

#### Scenario: Valid CSV upload starts import

- **WHEN** the user selects a valid CSV and submits
- **THEN** the client uploads the file and shows import summary counts from the API

#### Scenario: Invalid file blocked client-side

- **WHEN** the user selects a non-CSV or file over 10 MB
- **THEN** the client shows a validation error and does not call the API

#### Scenario: Library refreshes after import

- **WHEN** the import succeeds
- **THEN** the books list query is invalidated so Book Tracker reflects new data
