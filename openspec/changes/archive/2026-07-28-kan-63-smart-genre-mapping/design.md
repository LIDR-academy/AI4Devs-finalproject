# Design: KAN-63 smart genre mapping

## Matcher

`GenreMatcherService.match(raw, userGenres)`:
1. Case-insensitive exact name match
2. Synonym keywords from `genre-normalizer.map.ts` only when user owns the canonical label (e.g. owns "Fantasía" → "Fantasy fiction" matches)

## Catalog add (UC-01)

Frontend calls `POST /v1/genres/match` when selecting an edition. If unresolved, block save until user assigns, creates, or skips.

## Import (UC-08)

1. `POST /import/goodreads/preview` parses CSV and probes catalog genres (ISBN/title lookup), returns grouped unresolved values
2. User resolves each distinct raw genre once
3. `POST /import/goodreads` with same file + `genre_resolutions` JSON; enrichment applies map

## Enrichment

Replace `findOrCreateByName` with matcher + optional resolutions map. Never auto-create without explicit user choice.
