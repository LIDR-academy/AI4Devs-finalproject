# TASK-US-105-04: Implement Upload Logic

Quick description: Implement the `useUpload` hook that manages the upload queue, dispatches `POST /api/v1/files/upload` requests with `XMLHttpRequest` for progress tracking, enforces concurrency, and handles cancel/retry.

[Trello Card](https://trello.com/c/orqMe1NQ)

## Parent User Story
[US-105: File Upload Interface](../../user-stories/frontend/US-105-file-upload-interface.md)

## Description
All upload state and side-effects live in a `useUpload` hook backed by a Zustand store. Files are uploaded one-at-a-time (or up to `MAX_CONCURRENT_FILES`) using `XMLHttpRequest` so that upload progress events are available. The API key is sent through the session cookie (server-side proxy route) — never from browser storage.

## Priority
🔴 Critical

## Estimated Time
2.5 hours

## Detailed Steps

### 1. Create Next.js proxy route `src/app/api/upload/route.ts`
- Accept `POST` with `multipart/form-data`.
- Read the session cookie (via `server-auth` helpers) and forward the API key in the `X-API-Key` header to `POST /api/v1/files/upload`.
- Stream the response back to the client.
- Return `401` if no valid session.

### 2. Create Zustand upload store `src/stores/upload-store.ts`
- State: `entries: UploadEntry[]`.
- Actions: `addEntries`, `updateEntry`, `removeEntry`, `clearCompleted`.

### 3. Create `useUpload` hook `src/hooks/use-upload.ts`
- `enqueue(files: File[])` — validates with `validateBatch`, adds to store as `"queued"`.
- `startNext()` — picks the next `"queued"` entry (up to `MAX_CONCURRENT_FILES` active) and calls `uploadOne`.
- `uploadOne(entry: UploadEntry)` — uses `XMLHttpRequest`:
  - `xhr.upload.onprogress` → update `entry.progress`.
  - On `200`/`201` → parse CID, set `status: "done"`.
  - On `202` → set `status: "done"` with a "queued on server" note.
  - On error → set `status: "error"` with message.
- `cancel(id)` — abort the XHR and set `status: "cancelled"`.
- `retry(id)` — reset entry to `"queued"` and call `startNext`.

### 4. Handle session expiry
- On `401` response, call `logout()` from `useAuth` and redirect to login.

### 5. Wire into upload page
- Call `enqueue` from dropzone's `onFilesAccepted`.
- Pass `entries`, `cancel`, `retry` down to `<UploadQueue>`.

## Acceptance Criteria
- [x] Files are uploaded via the server-side proxy route (API key never in browser storage).
- [x] `progress` updates fire while upload is in progress.
- [x] `status` transitions: `queued → uploading → processing → done/error`.
- [x] Concurrent active uploads capped at `MAX_CONCURRENT_FILES`.
- [x] Cancel aborts the in-flight XHR and marks entry `cancelled`.
- [x] Retry resets a failed entry to `queued` and starts upload.
- [x] `401` response triggers logout and redirect to login.

## Notes
- Using `XMLHttpRequest` instead of `fetch` is intentional — `fetch` does not expose upload progress in all target browsers.
- The proxy route prevents CORS issues and keeps the API key server-side.

## Completion Status
- [x] 100% - Completed
