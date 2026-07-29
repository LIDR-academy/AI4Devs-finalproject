## Context

UC-08 Goodreads import maps `Title` via `mapGoodreadsRow` (`title = row.title.trim()`) and persists it on `catalog_editions`. Title+author enrichment (KAN-50) and local `findBestByTitleAuthor` query that stored title. Goodreads often embeds series as a trailing parenthetical (`The Raven Scholar (Eternal Path Trilogy, #1)`), which prevents catalog hits. `catalog_editions.series_name` already exists but is not set from Goodreads mapping.

## Goals / Non-Goals

**Goals:**

- Strip trailing series parentheses from Goodreads titles at mapping time
- Populate `series_name` from extracted series text when possible
- Improve catalog match / enrichment hit rate without API changes

**Non-Goals:**

- Manual add-book search title normalization
- New endpoints or response shape changes
- Parsing mid-title parentheses or separate volume-number fields
- Backfilling already-imported library rows (optional follow-up)

## Decisions

1. **Normalize in the mapper, not in enrichment** — Cleaning at `mapGoodreadsRow` fixes persist, dedup keys, genre preview, and enrichment in one place. Alternative: strip only in `lookupByTitleAuthor` callers — rejected because stored titles would remain polluted and duplicates would split on series suffix.

2. **Trailing parentheses only** — Remove one or more trailing `(…)` groups from the end of the title (Goodreads series pattern). Do not strip mid-string parentheses. Alternative: strip any parentheses — rejected (risk of mangling legitimate mid-title text).

3. **Series label without volume marker** — From `(Eternal Path Trilogy, #1)`, store `series_name = "Eternal Path Trilogy"` (strip `, #\d+(\.\d+)?` / similar trailing volume tokens). Alternative: store full parenthetical text — rejected (noisier UX; volume is not a modeled field).

4. **Empty-clean-title safety** — If stripping leaves an empty title, keep the original raw title and leave `series_name` null.

5. **Pass `series_name` on upsert** — Extend `GoodreadsImportBookDraft` with `series_name` and pass it in `goodreads-import.processor` `catalogEditions.upsert`. No schema migration.

## Risks / Trade-offs

- **[Risk]** Non-series trailing parens (e.g. `(Kindle Edition)`, `(Unabridged)`) become `series_name` → **Mitigation:** Acceptable for MVP; Binding already maps format; can tighten heuristics later (e.g. only treat as series when `, #N` present). Prefer always stripping for search quality.
- **[Risk]** Re-import / dedup: cleaned title may match a previously imported polluted title as a different book → **Mitigation:** ISBN dedup still primary; title+author keys improve going forward; no mandatory backfill.
- **[Trade-off]** Heuristic volume strip may miss odd formats (`Book 1 of Series` without parens) → out of scope.

## Migration Plan

- Deploy with mapper change only; no DB migration.
- Rollback: revert mapper/processor; existing cleaned rows remain valid titles.
- Optional later: one-off script to re-normalize historical Goodreads titles.

## Open Questions

- None blocking. Optional later: only extract `series_name` when a `#N` volume marker is present (stricter series detection).
