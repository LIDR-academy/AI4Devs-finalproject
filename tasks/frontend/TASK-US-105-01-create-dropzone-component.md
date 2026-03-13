# TASK-US-105-01: Create Dropzone Component

Quick description: Build the drag-and-drop / click-to-browse file zone using `react-dropzone`, wired to the US-105 MIME/size whitelist.

[Trello Card](https://trello.com/c/AkWA4npW)

## Parent User Story
[US-105: File Upload Interface](../../user-stories/frontend/US-105-file-upload-interface.md)

## Description
Create the reusable dropzone UI component that accepts files via drag-and-drop or the native file picker. The component enforces the allowed MIME types and 100 MB per-file size ceiling at selection time (UX feedback only — backend is the enforcement authority).

## Priority
🔴 Critical

## Estimated Time
1.5 hours

## Detailed Steps

### 1. Install / verify react-dropzone
- Confirm `react-dropzone` is already listed in `package.json`; add it if absent.

### 2. Create the component
- Add `src/components/upload/dropzone.tsx`.
- Wrap `useDropzone` hook with the following `accept` map (must mirror backend `ALLOWED_MIME_TYPES`):
  - `image/jpeg`, `image/png`, `image/webp`, `image/gif`
  - `application/pdf`, `text/plain`, `application/json`
  - `video/mp4`, `video/webm`
- Set `maxFiles={3}` and `maxSize={100 * 1024 * 1024}`.
- Emit `onFilesAccepted(files: File[])` callback for accepted files.
- Emit `onFilesRejected(rejections: FileRejection[])` callback for rejected files.

### 3. Visual states
- Idle state: dashed border, upload icon, instruction text.
- Drag-active state: highlighted border + background.
- Disabled state: greyed out when upload is in progress.

### 4. Integrate into upload page
- Replace `upload/page.tsx` placeholder with `<Dropzone>` inside `<ProtectedRoute>`.

## Acceptance Criteria
- [x] Dropzone renders correctly in idle and drag-active states.
- [x] `accept` prop restricts to the defined MIME whitelist; other types are rejected with a clear message.
- [x] Files larger than 100 MB are rejected at selection time with a size error.
- [x] More than 3 concurrent selections are blocked.
- [x] `onFilesAccepted` and `onFilesRejected` callbacks fire correctly.
- [x] Component is keyboard accessible (Enter/Space to open picker).
- [x] Responsive on mobile.

## Notes
- MIME type whitelist in frontend must stay in sync with `backend/core/files/validators.py → ALLOWED_MIME_TYPES`.
- Any whitelist change must be applied to both sides in the same commit/PR.

## Completion Status
- [x] 100% - Completed
