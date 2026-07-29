# catalog-ol-work-genre-fallback Specification

## Purpose

Open Library work subjects fallback for missing genre (KAN-55, KAN-53 Option A).

## Requirements

### Requirement: Open Library work genre fallback

When genre is still null after the Google Books fallback (KAN-54) for an Open Library edition, the system SHALL fetch `/works/{key}.json`, resolve edition keys to their work when needed, and use the first usable `subjects` entry as genre.

#### Scenario: Genre missing after Google Books

- **WHEN** an Open Library edition has no genre after the Google Books lookup
- **THEN** the service fetches work subjects and sets `genre` when found

#### Scenario: Edition provider id

- **WHEN** `external_provider_id` is an edition key (`/books/OL…M`)
- **THEN** the associated work is resolved before fetching subjects

#### Scenario: Work has no subjects

- **WHEN** the work response has no usable subjects
- **THEN** `genre` remains `null` without blocking the request
