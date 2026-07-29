# catalog-genre-taxonomy-normalization Specification

## Purpose

Normalize external catalog genres to a closed taxonomy (KAN-56, KAN-53 Option C).

## Requirements

### Requirement: Closed taxonomy for external catalog genres

The system SHALL normalize external catalog genre strings to a closed taxonomy (`Fantasía`, `Thriller`, `Ciencia ficción`, `Romance`, `Histórica`, `Ficción`, `No ficción`) before persisting or returning catalog-enriched metadata.

#### Scenario: Known genre keyword

- **WHEN** genre input is `"Fantasy fiction, American"`
- **THEN** normalized value is `"Fantasía"`

#### Scenario: Unknown genre keyword

- **WHEN** genre input does not match normalization rules (for example `"Cooking"`)
- **THEN** normalized value is `null`

#### Scenario: Unified normalization path

- **WHEN** genre comes from OL direct subject, KAN-54 Google Books fallback, or KAN-55 OL work fallback
- **THEN** all paths use the same `GenreNormalizerService` before final output
