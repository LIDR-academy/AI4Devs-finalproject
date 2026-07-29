# import-title-author-enrichment Specification

## Purpose

Enrich imported Goodreads books without ISBN via catalog title+author search (KAN-50, US-14).

## Requirements

### Requirement: Enrich imported books without ISBN by title and author

When a newly imported Goodreads book has no `isbn13` or `isbn10`, the system SHALL search the catalog by title and author (best-effort), set missing `cover_image_url` (OL preferred, GB fallback) and missing `genre` (Google Books primary category only), leave `audience` null, and SHALL record rows where catalog lookup returns no metadata in `enrichment_failed`.

#### Scenario: No-ISBN import gains metadata

- **WHEN** a newly imported book has no ISBN and catalog returns a match
- **THEN** missing cover and/or genre are persisted

#### Scenario: Catalog miss recorded

- **WHEN** a book without ISBN is imported and catalog returns no match
- **THEN** the row appears in `enrichment_failed` with code `ENRICHMENT_CATALOG_MISS`

#### Scenario: ISBN path unchanged

- **WHEN** a book has ISBN
- **THEN** enrichment uses ISBN lookup only (no title+author fallback)
