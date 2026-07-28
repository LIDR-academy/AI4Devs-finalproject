## MODIFIED Requirements

### Requirement: Enrich imported books without ISBN by title and author

When a newly imported Goodreads book has no `isbn13` or `isbn10`, the system SHALL search `catalog_editions` by title and author first, then external catalog by title and author (best-effort) when no local match exists.

When a book has ISBN but that edition still lacks cover/genre after ISBN lookup, the system SHALL fall back to a local `catalog_editions` match by normalized title and author (preferring rows with cover) before calling external title+author APIs, and SHALL merge cover/genre onto the ISBN edition when found.

When external metadata is found, the system SHALL upsert `catalog_editions`, link the imported library row, set missing cover (via catalog) and missing user `genre_id` (via existing genre resolution), leave `audience` null, and SHALL record rows where no metadata is found in `enrichment_failed`.

#### Scenario: No-ISBN import uses local catalog

- **WHEN** a newly imported book has no ISBN and a matching `catalog_editions` row exists for title and author
- **THEN** the library row links to that catalog edition without external API calls
- **THEN** effective cover and genre are applied from catalog and genre resolution

#### Scenario: No-ISBN import gains metadata from API

- **WHEN** a newly imported book has no ISBN, no local match exists, and external catalog returns a match
- **THEN** a `catalog_editions` row is created
- **THEN** missing cover and/or genre are applied to the user library row

#### Scenario: Catalog miss recorded

- **WHEN** a book without ISBN is imported and neither local catalog nor external catalog returns a match
- **THEN** the row appears in `enrichment_failed` with code `ENRICHMENT_CATALOG_MISS`

#### Scenario: ISBN path prefers local sibling edition when cover missing

- **WHEN** a book has ISBN but the matching edition lacks cover/genre and another `catalog_editions` row matches the same title and author with cover
- **THEN** enrichment copies cover (and genre when available) from that local sibling edition without requiring external API success

#### Scenario: ISBN then title+author external fallback

- **WHEN** a book has ISBN, local ISBN and title/author catalog lookups do not fill cover/genre, and external title+author search returns a match
- **THEN** missing cover and/or genre are applied from the external match
