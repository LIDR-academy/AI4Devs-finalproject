## Decisions

1. Create `GenreNormalizerService` independent of provider clients.
2. Keep mapping rules in `backend/src/books/genre-normalizer.map.ts` for easy future tuning.
3. Normalize as the last catalog step, after genre acquisition from OL/GB sources.
4. Unknown or low-confidence matches are stored as `null` (never raw free text from external providers).

## Trade-offs

- Rule-based keyword matching is simple and deterministic, but requires updates for new edge cases.
- We prioritize specific categories before generic `Ficción` to avoid false matches.
