## Why

Open Library often returns editions without `subject`, leaving `genre` null even when Google Books has `categories` for the same ISBN (KAN-53 epic).

## What Changes

- After OL catalog mapping, call Google Books by ISBN **only** for `genre` when missing
- Apply in catalog search, ISBN/title lookup merge, and book create metadata resolution
- Short timeout; non-blocking on failure

Non-goals: OL work subjects (KAN-55), genre taxonomy (KAN-56).

## Capabilities

### New Capabilities

- `catalog-google-books-genre-fallback`: GB genre fill when OL omits subject.

## Impact

- `CatalogService`, `GoogleBooksClient`, `BooksService`, tests
