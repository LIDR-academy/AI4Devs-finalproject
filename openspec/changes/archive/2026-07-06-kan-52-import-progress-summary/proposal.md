## Why

US-15 (KAN-52): readers need visible import progress and a structured final summary (imported, skipped, discarded, missing finish dates, enrichment misses) while background jobs run (KAN-51).

## What Changes

- Progress bar with processed/total during job polling
- Structured import summary panel from job `result.meta` (+ mapped rows for missing finish dates)
- Persist active `job_id` in `localStorage` and resume polling when returning to Import/Export
- WCAG 2.1 AA: `role="status"`, `aria-live`, progressbar semantics

Non-goals: backend API changes, export features.

## Capabilities

### New Capabilities

- `import-progress-summary-ui`: Progress and final summary on Import/Export page.

## Impact

- Frontend: `ImportExportPage`, `api/client.ts`, `api/types.ts`, new import components and summary helpers
