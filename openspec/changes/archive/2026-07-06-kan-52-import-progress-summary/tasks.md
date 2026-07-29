## 1. API and types

- [x] 1.1 Extend `GoodreadsImportResponse` with optional `mapped_rows` / `imported` for summary helpers
- [x] 1.2 Export `startGoodreadsImport` and `pollImportJobUntilComplete`; persist job id hook points

## 2. Summary and storage helpers

- [x] 2.1 `goodreadsImportSummary.ts` — build stats including `missing_finished_on_count`
- [x] 2.2 `goodreadsImportJobStorage.ts` — localStorage get/set/clear for active job id

## 3. UI components

- [x] 3.1 `ImportProgress` — progress bar + aria-live label
- [x] 3.2 `ImportSummary` — structured summary list from stats

## 4. Import/Export page

- [x] 4.1 Wire progress/summary components; resume job on mount
- [x] 4.2 Styles for progress bar and summary list

## 5. Verification

- [x] 5.1 `npm run build` in frontend
