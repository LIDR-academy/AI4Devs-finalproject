# import-background-jobs Specification

## Purpose

Async Goodreads CSV import with background worker, catalog rate limiting, and progress API (KAN-51, US-14).

## Requirements

### Requirement: Async Goodreads import jobs

The system SHALL accept Goodreads CSV uploads via `POST /v1/import/goodreads`, create an import job, process parse/import/enrichment in the background, rate-limit external catalog calls, retry transient catalog failures with backoff, and expose job progress via `GET /v1/import/jobs/{jobId}` for the owning user.

#### Scenario: Upload returns job id

- **WHEN** an authenticated user uploads a valid Goodreads CSV
- **THEN** the API responds with HTTP 202 and a `job_id`

#### Scenario: Progress while running

- **WHEN** the client polls an in-progress job
- **THEN** the response includes `status`, `phase`, `processed_count`, and `total_count`

#### Scenario: Completed job returns result

- **WHEN** a job finishes successfully
- **THEN** `GET /v1/import/jobs/{jobId}` includes `status: completed` and the full import `result`

#### Scenario: Catalog rate limiting

- **WHEN** enrichment calls external catalog APIs
- **THEN** requests are spaced by at least the configured minimum interval
