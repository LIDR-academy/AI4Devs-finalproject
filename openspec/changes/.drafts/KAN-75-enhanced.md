## Original

**KAN-75**: Adapt `predominantReadFormat` / `formatDistribution` (UC-07) to the new `format_id` FK.

**Goal:** Verify and adapt stats calculations after replacing fixed `read_format` CHECK with `format_id` FK.

**Technical tasks:**
- Backend: update `formatDistribution` to group by `format_id` and return format `name` from `formats` table in `CountDistribution` buckets.
- `predominantReadFormat` becomes a free string (most frequent format name) or `null` in OpenAPI.
- Update OpenAPI schema for dynamic format names.
- Records with `format_id = NULL` count in `unknownCount` (like genre/audience).

**BDD:**
1. Custom formats reflected correctly in `formatDistribution` and `predominantReadFormat`.
2. Null `format_id` after format delete → `unknownCount`, no calculation breakage.

**Tests:** Unit for custom formats; regression for UC-07 KPIs post KAN-71.

## Enhanced

Adapt Reading Stats format KPIs to user-owned format labels via `reading_records.format_id` → `formats.name`, mirroring `audience_distribution` (KAN-69).

### API contract changes

| Field | Before (KAN-71 interim) | After (KAN-75) |
|-------|-------------------------|------------------|
| `format_distribution[].format` | Legacy slugs `fisico`/`ebook`/`audio`/`unknown` | User format **name** from `formats.name`, or `unknown` |
| `predominant_format` | Legacy slug with enum tie-break | Most frequent non-`unknown` **name**; ties broken alphabetically (`es` locale) |

### Backend

- `backend/src/stats/stats.service.ts` — simplify `formatDistribution` to `COALESCE(f.name, :unknown)`; update `pickPredominantFormat` tie-break; add `formatDistributionKey` helper
- `backend/src/stats/stats.service.spec.ts` — update unit tests for display names + alphabetical tie-break
- `backend/test/stats.integration-spec.ts` — expect format names; add custom format + null-after-delete scenarios

### Frontend

- `FormatBreakdown.tsx`, `FormatPieChart.tsx` — keep `unknown` label mapping; API names pass through via `?? format` fallback (legacy slug map optional)

### Docs

- `docs/api-spec.yml` — `FormatCount.format` description: user format name or `unknown`
- `openspec/specs/monthly-stats-api/spec.md` — delta via change archive

### Definition of done

- [ ] `format_distribution` buckets use `formats.name`
- [ ] `predominant_format` returns display name or null
- [ ] `format_id = NULL` → `unknown` bucket
- [ ] Unit + integration tests pass
- [ ] OpenAPI updated
