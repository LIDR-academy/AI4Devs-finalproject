# TASK-US-105-02: Implement File Validation

Quick description: Extract client-side file validation logic (MIME type, file size, filename) into a dedicated utility so it can be reused and unit-tested independently of the dropzone.

[Trello Card](https://trello.com/c/QN07Jp7E)

## Parent User Story
[US-105: File Upload Interface](../../user-stories/frontend/US-105-file-upload-interface.md)

## Description
Centralise all pre-upload validation rules in `src/lib/file-validation.ts`. This keeps the dropzone component thin and makes validation rules easy to update when the backend whitelist changes.

## Priority
🔴 Critical

## Estimated Time
1 hour

## Detailed Steps

### 1. Create `src/lib/file-validation.ts`
- Export `ALLOWED_MIME_TYPES` constant (array or Set) matching `backend/core/files/validators.py`.
- Export `MAX_FILE_SIZE_BYTES = 100 * 1024 * 1024`.
- Export `MAX_CONCURRENT_FILES = 3`.

### 2. Implement `validateFile(file: File): ValidationResult`
```ts
type ValidationResult =
  | { valid: true }
  | { valid: false; reason: "size" | "type" | "name" };
```
- Reject files exceeding `MAX_FILE_SIZE_BYTES`.
- Reject files whose `file.type` is not in `ALLOWED_MIME_TYPES`.
- Reject filenames containing path-traversal sequences (`..`, `/`, `\`, null bytes).

### 3. Implement `validateBatch(files: File[]): BatchValidationResult`
- Check total batch count ≤ `MAX_CONCURRENT_FILES`.
- Run per-file validation and aggregate results.

### 4. Integrate with dropzone and upload logic
- Import and use in `dropzone.tsx` (`onFilesRejected` error messages).
- Import and use in upload hook (`TASK-US-105-04`) before dispatching requests.

### 5. Write unit tests
- Add `tests/frontend/lib/file-validation.test.ts`.
- Cover: valid file, size too large, disallowed MIME, dangerous filename, batch over limit.

## Acceptance Criteria
- [x] `validateFile` correctly classifies valid and invalid files.
- [x] `validateBatch` enforces the concurrent file limit.
- [x] Dangerous filenames are rejected.
- [x] All unit tests pass (`npm test`).
- [x] No runtime import of browser-only APIs (pure functions, SSR-safe).

## Notes
- Keep this module free of React dependencies so it is testable in Node.js/Jest without JSDOM.
- The validation here is UX-only; backend enforcement takes precedence.

## Completion Status
- [x] 100% - Completed
