## Why

KAN-71 migrated reading format to `format_id` FK. Stats still map default format names to legacy slugs (`fisico`/`ebook`/`audio`), which breaks custom formats and no longer matches the user-owned labels model (KAN-70).

## What Changes

- Group `format_distribution` by `formats.name` (via `format_id` join); bucket `null` as `unknown`.
- Return `predominant_format` as the most frequent non-`unknown` format **name** (alphabetical tie-break).
- Update OpenAPI `FormatCount` description; regression + custom-format integration tests.

## Capabilities

### New Capabilities

- _(none)_

### Modified Capabilities

- `monthly-stats-api`: Format distribution and predominant format requirements use dynamic format names.

## Impact

- `backend/src/stats/stats.service.ts`, tests
- `docs/api-spec.yml`
- Frontend display components (pass-through names; no breaking UI change)
