# smart-genre-mapping Specification

## Purpose

User-scoped genre matching and resolution for catalog add and Goodreads import (KAN-63).

## Requirements

### Requirement: User-scoped genre matcher

The system SHALL match a raw external genre string against the authenticated user's genre list using case-insensitive exact name match and synonym keywords from the legacy taxonomy map applied only to genres the user owns.

#### Scenario: Synonym match

- **GIVEN** the user owns "Fantasía"
- **WHEN** the raw genre is "Fantasy fiction"
- **THEN** the matcher returns that genre id without user interaction

#### Scenario: No match

- **GIVEN** the raw genre is "Cooking" and no owned genre or synonym matches
- **THEN** the matcher returns unresolved

### Requirement: Genre match API

The system SHALL expose `POST /v1/genres/match` and `POST /v1/genres/match-batch` for the authenticated user.

#### Scenario: Batch deduplication

- **GIVEN** 50 import rows share 4 distinct unresolved raw genres
- **WHEN** the client calls match-batch
- **THEN** each distinct raw value is evaluated once

### Requirement: Catalog add resolution

When adding a book from catalog, if the catalog genre is unresolved the UI SHALL prompt the user to assign an existing genre, leave blank, or create a new genre before saving.

### Requirement: Import preview genre resolution

Goodreads import SHALL support a preview step that lists distinct unresolved catalog genres and accepts a resolutions map (`assign` / `create` / `skip`) applied during enrichment for all matching books.
