## Why

Goodreads library exports often put the series in the `Title` column as a trailing parenthetical (e.g. `The Raven Scholar (Eternal Path Trilogy, #1)`). UC-08 import maps that string verbatim today, so title+author catalog enrichment (KAN-50) and local catalog match fail even when the edition exists under the clean title.

## What Changes

- During Goodreads row mapping, strip trailing `(…)` series annotations from `Title` before persist/dedup/enrichment
- Extract series text into `series_name` when present (volume markers like `, #1` stripped from the series label)
- Keep empty-clean-title safety (retain original title if stripping would leave an empty string)
- Unit tests for series-annotated titles and regression on existing fixtures

Non-goals: changing manual add-book catalog search UI; new import API endpoints; rewriting provider query APIs.

## Capabilities

### New Capabilities

<!-- none — behavior extends existing Goodreads field mapping -->

### Modified Capabilities

- `goodreads-field-mapping`: Title mapping SHALL normalize trailing series parentheses into clean `title` + optional `series_name`.

## Impact

- Backend: `backend/src/import/goodreads/goodreads-row.mapper.ts`, `goodreads-import.types.ts`, `goodreads-import.processor.ts` (pass `series_name` to catalog upsert), mapper/processor unit tests
- Catalog enrichment and genre preview benefit automatically via cleaned stored titles (no API contract change)
- UC-08 (Importar datos históricos)
