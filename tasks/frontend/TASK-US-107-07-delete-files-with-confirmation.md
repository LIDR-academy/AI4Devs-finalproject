# TASK-US-107-07: Delete Files With Confirmation

Define and implement secure delete workflows for single files and bulk-selected files from the files management page, using explicit user confirmation before destructive actions.

[Trello Card](https://trello.com/c/tjrgpQh3)

## Parent User Story
[US-107: Files Management Page](../../user-stories/frontend/US-107-files-management.md)

## Description
Implement the delete feature for US-107 with confirmation UX and backend soft-delete behavior. The workflow must support both single-file deletion and multi-file bulk deletion from selected rows/cards.

## Priority
High

## Estimated Time
2 hours

## Detailed Steps
1. Add backend endpoint(s) to soft-delete user-owned files by CID, plus bulk deletion support.
2. Add Next.js API proxy routes for delete operations that reuse session cookie authentication.
3. Add delete action button on each file row/card and inside file details drawer.
4. Add bulk delete action for selected files.
5. Add confirmation dialog/modal for single and bulk delete actions.
6. Optimistically update frontend list/grid state and reconcile with server response.
7. Add integration and e2e tests for delete happy path and error handling.

## Acceptance Criteria
- [x] User can delete one file from list/grid/details with explicit confirmation.
- [x] User can bulk delete selected files with explicit confirmation.
- [x] Deleted files are no longer visible in the files list.
- [x] Delete endpoints prevent deleting files that do not belong to current user.
- [x] UI shows success/error feedback for delete operations.
- [x] Automated tests cover single and bulk delete workflows.

## Notes
- Use soft-delete semantics (`deleted_at`) to preserve auditability and future restore possibilities.
- Delete remains irreversible from UI perspective until restore is implemented.

## Completion Status
- [x] 100% - Completed
