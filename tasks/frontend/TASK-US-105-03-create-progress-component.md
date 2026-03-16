# TASK-US-105-03: Create Upload Progress Component

Quick description: Build the per-file progress bar and status row that shows upload state (queued, uploading %, done, error) with a cancel action.

[Trello Card](https://trello.com/c/7bQCbNm2)

## Parent User Story
[US-105: File Upload Interface](../../user-stories/frontend/US-105-file-upload-interface.md)

## Description
Create `src/components/upload/upload-progress-item.tsx` and a wrapping list `src/components/upload/upload-queue.tsx`. Each item reflects the live `UploadEntry` state from the upload store/hook and exposes a cancel callback.

## Pull Request
- [PR #19: US-105 implement secure file upload interface](https://github.com/mentally-gamez-soft/ipfs-saas-ai4devs/pull/19)

## Priority
🟠 High

## Estimated Time
1.5 hours

## Detailed Steps

### 1. Define the `UploadEntry` type
- Add to `src/types/upload.ts`:
```ts
export type UploadStatus = "queued" | "uploading" | "done" | "error" | "cancelled";

export type UploadEntry = {
  id: string;            // local uuid
  file: File;
  status: UploadStatus;
  progress: number;      // 0–100
  cid?: string;
  error?: string;
};
```

### 2. Build `UploadProgressItem`
- Show filename (truncated), file size, status badge, and progress bar.
- Progress bar renders `progress` as width percentage.
- Display a `[✕]` cancel button when `status` is `"queued"` or `"uploading"`.
- On `status === "done"` show the CID (see TASK-US-105-05 for the copy button).
- On `status === "error"` show the error message and a "Retry" button.

### 3. Build `UploadQueue`
- Renders a list of `UploadProgressItem` components from an `entries: UploadEntry[]` prop.
- Shows a header count: "Uploading X / Y".

### 4. Add image preview
- For entries where `file.type.startsWith("image/")`, render a small thumbnail using `URL.createObjectURL`.
- Clean up the object URL on unmount.

### 5. Integrate into upload page
- Render `<UploadQueue>` below the dropzone.

## Acceptance Criteria
- [x] Progress bar reflects `progress` value in real time.
- [x] Cancel button visible during `queued` and `uploading` states.
- [x] Error state shows message and retry button.
- [x] Image thumbnail rendered for image files.
- [x] Object URLs revoked on unmount (no memory leak).
- [x] Component is responsive.

## Notes
- The actual cancel/retry logic is wired in TASK-US-105-04.
- Use `Skeleton` for the queued state if progress data is not yet available.

## Completion Status
- [x] 100% - Completed
