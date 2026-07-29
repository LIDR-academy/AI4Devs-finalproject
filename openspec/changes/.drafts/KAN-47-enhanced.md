## Original

Screen to **upload CSV** and launch import (direct import, no preview). File selector, basic type/size validation, start process. Uses KAN-18 components. Progress and summary in US-15. Accessible (label, focus, keyboard; WCAG 2.1 AA).

## Enhanced

### Scope (KAN-47)

Replace `/import-export` placeholder with Goodreads CSV upload UI. On submit, call `POST /v1/import/goodreads` and show minimal completion feedback. Full progress/summary UI is KAN-52 (US-15).

### UX

- `PageHeader` + `Card` (KAN-18)
- Native file input with visible label, `accept=".csv,text/csv"`
- Client validation: required file, `.csv` extension or `text/csv`, max 10 MB
- Primary button «Importar biblioteca» disabled until valid file selected
- `aria-busy` + disabled controls while uploading
- Success alert with `imported_count`, `skipped_duplicate_count`, `skipped_invalid_count`
- Error alert from API via `messageFromUnknownError`
- Invalidate `['books']`, stats, and goals queries on success

### Files

- `frontend/src/api/client.ts` — `importGoodreadsCsv(file)`
- `frontend/src/api/types.ts` — `GoodreadsImportResponse`
- `frontend/src/lib/goodreadsImport.ts` — file validation helper
- `frontend/src/pages/ImportExportPage.tsx` + CSS
- `frontend/src/App.tsx` — route wiring

### Definition of done

- Build + lint pass
- Accessible file input and keyboard-operable button
- No preview table (KAN-52)
