## Context

`/import-export` is a placeholder. Backend import is synchronous on upload.

## Decisions

1. **Single Goodreads section** — first slice of Import/Export; export stays future work.
2. **Direct upload** — no preview; show counts from API response.
3. **Multipart fetch** — omit `Content-Type` so browser sets boundary.
4. **Spanish copy** — match Book Tracker / Goals tone.

## Files

- `ImportExportPage.tsx` — form, validation, mutation
- `goodreadsImport.ts` — `validateGoodreadsCsvFile(file)`
