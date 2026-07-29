## Why

Whole-star ratings (1–5) are too coarse for readers who want finer granularity. US-09 (KAN-31) requires half-star steps across storage, API, Book Tracker UI, and Reading Stats averages.

## What Changes

- Migrate `reading_records.rating` from `SMALLINT 1–5` to `NUMERIC(2,1)` with half-step constraint.
- Validate `PATCH` ratings as 0.5–5.0 in 0.5 increments.
- Extend `StarRating` for half-star selection and display with keyboard and screen-reader support.
- Confirm stats `average_rating` handles decimal ratings.

## Capabilities

### Modified Capabilities

- `reading-record-patch`: Half-step rating validation and storage.
- `shared-ui-components`: Half-star `StarRating` input and display.
- `monthly-stats-api`: Average rating over 0.5-step values.

## Impact

- Backend: migration, entity, DTO, books service, tests.
- Frontend: `StarRating`, rating helpers, existing rating consumers unchanged in API shape.
- Docs: `data-model.md`, `api-spec.yml`.
