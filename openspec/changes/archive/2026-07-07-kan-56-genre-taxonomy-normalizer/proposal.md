## Why

Genre values currently arrive as free text from Open Library and Google Books. This breaks genre aggregation for Reading Stats because equivalent genres are stored with many textual variants.

## What Changes

- Add a backend `GenreNormalizerService` with a closed taxonomy:
  - Fantasía
  - Thriller
  - Ciencia ficción
  - Romance
  - Histórica
  - Ficción
  - No ficción
- Apply normalization in `CatalogService` after all genre enrichment paths (OL direct, KAN-54 Google Books fallback, KAN-55 OL work fallback)
- Normalize Google Books metadata resolution in `BooksService`
- Add unit tests for normalizer and taxonomy behavior in catalog flow

Non-goals: changing manual user-entered genres on patch/edit flows.

## Capabilities

### New Capabilities

- `catalog-genre-taxonomy-normalization`: stable taxonomy normalization for external catalog genres.
