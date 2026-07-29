## Why

Reading Stats shows KPIs and charts for the filtered period but no visual recap of which books were read. US-10 (KAN-39) adds a cover gallery at the bottom of the page so users can browse finished books for the selected month or year.

## What Changes

- Extend monthly and yearly stats API responses with `books_in_period` (id, title, authors, cover_image_url, finished_on).
- Add a responsive `CoverGallery` section on `/stats` below the chart grid, driven by the active period filter (KAN-38).

Non-goals: linking covers to book detail modals; pagination or lazy-loading beyond CSS grid wrap.

## Capabilities

### New Capabilities

- `stats-cover-gallery`: Period-scoped book summaries on stats API and frontend gallery rendering.

### Modified Capabilities

- `monthly-stats-api`: Stats responses include `books_in_period`.
- `monthly-stats-ui`: Reading Stats renders cover gallery when period has qualifying books.

## Impact

- Backend: `stats.service.ts`, DTOs, integration tests, `docs/api-spec.yml`
- Frontend: `CoverGallery`, `StatsPage`, `api/types.ts`
