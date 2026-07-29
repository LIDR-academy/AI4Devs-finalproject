## Original

**KAN-69**: Add audienceDistribution to Reading Stats (UC-07).

Extend `GET /v1/stats` with audience distribution for finished books in the period (same criteria as genreDistribution). Frontend chart alongside genre and format.

## Enhanced

### Scope

Migrate `audience_distribution` from legacy enum column `books.audience` to user-owned labels via `books.audience_id` → `audiences.name`. Keep existing API array shape `{ audience, count }[]` consistent with `genre_distribution` / `format_distribution` (implemented contract in `docs/api-spec.yml`).

### Backend

- `StatsService.audienceDistribution()` — join `audiences` on `books.audience_id`, `COALESCE(a.name, 'unknown')`, same period filter as genre (`status = leido`, `finished_on` in period).
- `StatsModule` — register `Audience` entity.
- Update `AudienceCount` description in `docs/api-spec.yml`.
- Unit: `audienceDistributionKey()` maps null → `unknown`.
- Integration: seed books with `audience_id`; assert counts by audience name.

### Frontend

- `AudiencePieChart` — display API labels directly (user audience names); update subtitle.
- `StatsPage` placeholder copy — remove legacy YA/NA/Adult references.

### Definition of done

- Stats returns audience names from user catalog
- Chart renders user labels + `unknown`
- Period filter updates distribution like genre/format
- Tests pass
