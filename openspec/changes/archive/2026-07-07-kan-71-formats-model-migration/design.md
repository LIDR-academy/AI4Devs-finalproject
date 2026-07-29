## Context

Phase 8 (audiences) established the pattern: user-owned lookup table, FK on domain row, seed on registration. KAN-71 applies it to read formats on `reading_records`.

## Decisions

- Drop `read_format` column after data migration (per Jira).
- Map default format names to legacy API slugs (`Físico` → `fisico`) until KAN-73.
- Stats `format_distribution` keeps legacy bucket keys via SQL CASE on default names.

## Migration

1. Create `formats` + seed all users.
2. Backfill `format_id` from `read_format`.
3. Drop CHECK and `read_format` column.
