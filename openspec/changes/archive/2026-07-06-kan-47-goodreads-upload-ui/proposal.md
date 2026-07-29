## Why

US-13 backend (KAN-44–46) imports Goodreads CSV on upload; readers need a UI to select a file and start the import without a preview step (US-15 adds summary later).

## What Changes

- Replace Import/Export placeholder with Goodreads upload page
- API client for multipart `POST /v1/import/goodreads`
- Client-side CSV type and 10 MB size validation
- Minimal success feedback and cache invalidation

Non-goals: detailed progress/summary UI (KAN-52), Excel export (future).

## Capabilities

### New Capabilities

- `goodreads-upload-ui`: Accessible Goodreads CSV upload screen.

## Impact

- Frontend: `ImportExportPage`, `api/client.ts`, `App.tsx`
