# catalog-google-books-genre-fallback Specification

## Purpose

Google Books genre fallback when Open Library omits subject (KAN-54, KAN-53 Option B).

## Requirements

### Requirement: Google Books genre fallback for Open Library editions

When Open Library provides catalog metadata without genre and an ISBN is available, the system SHALL query Google Books by ISBN for `volumeInfo.categories` only, without replacing other Open Library fields. The fallback SHALL NOT run when the edition source is already Google Books.

#### Scenario: Open Library hit without subject

- **WHEN** catalog search returns Open Library items with null genre and a valid ISBN
- **THEN** the service queries Google Books for categories and sets `genre` when found

#### Scenario: Google Books unavailable

- **WHEN** the Google Books genre lookup fails or returns no categories
- **THEN** the edition keeps `genre: null` and the request continues without error

#### Scenario: Open Library already has genre

- **WHEN** the Open Library edition includes a subject/genre
- **THEN** Google Books is not called for genre enrichment
