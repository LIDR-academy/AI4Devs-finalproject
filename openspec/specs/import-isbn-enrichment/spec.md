# import-isbn-enrichment Specification

## Purpose

Enrich imported Goodreads books by ISBN using the catalog (Open Library + Google Books) after persist (KAN-49, US-14).

## Requirements

### Requirement: Enrich imported books by ISBN

The system SHALL after Goodreads import lookup catalog metadata by ISBN (`isbn13` preferred, else `isbn10`) using Open Library and Google Books, set missing `cover_image_url` (OL preferred, GB fallback) and missing `genre` (Google Books primary category only), and SHALL skip books that already have both fields.

#### Scenario: ISBN import gains cover and genre

- **WHEN** a newly imported book has ISBN and catalog returns metadata
- **THEN** missing `cover_image_url` and `genre` are persisted

#### Scenario: Already enriched book skipped

- **WHEN** a book already has `cover_image_url` and `genre`
- **THEN** no catalog lookup is performed

#### Scenario: Catalog miss leaves Goodreads data

- **WHEN** catalog returns no ISBN match
- **THEN** the book remains imported with Goodreads-only fields
