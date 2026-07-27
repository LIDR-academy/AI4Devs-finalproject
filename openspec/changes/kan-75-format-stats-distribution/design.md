## Context

KAN-71 added `formats` + `reading_records.format_id`. KAN-73/74 completed reading flow and delete UX. Stats still use interim CASE mapping to legacy slugs (KAN-71 design). KAN-75 aligns with `audience_distribution` pattern (KAN-69).

## Goals / Non-Goals

**Goals:**
- `format_distribution` buckets show user format names.
- `predominant_format` is a display name or null.
- Null `format_id` counts as `unknown`.

**Non-goals:**
- Rename stats response fields (`format` key stays).
- Change genre/audience distribution.

## Decisions

### 1. Group by `formats.name`

`COALESCE(f.name, 'unknown')` via left join on `reading_records.format_id`, same as audience.

### 2. Predominant tie-break

When counts tie, sort alphabetically (`localeCompare` `es`) instead of legacy enum order.

### 3. Frontend labels

Keep slug→label map as fallback; API returns names so `?? format` displays correctly for custom labels.

## Migration Plan

None — response shape unchanged; bucket **values** change from slugs to names for default formats (`Físico` not `fisico`).
