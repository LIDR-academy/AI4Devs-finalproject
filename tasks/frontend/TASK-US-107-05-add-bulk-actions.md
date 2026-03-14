# TASK-US-107-05: Add Bulk Actions

Enable multi-selection and bulk pin/unpin operations across files.

[Trello Card](https://trello.com/c/yeL7Xtvk)

[Pull Request](https://github.com/mentally-gamez-soft/ipfs-saas-ai4devs/pull/22)

## Parent User Story
[US-107: Files Management Page](../../user-stories/frontend/US-107-files-management.md)

## Description
Add bulk selection behavior and bulk actions for pin/unpin to speed up file management workflows on large datasets.

## Priority
High

## Estimated Time
1.5 hours

## Detailed Steps
1. Track selected file IDs from table/grid checkboxes.
2. Add bulk action toolbar (pin selected, unpin selected, clear selection).
3. Implement batch API calls or iterative action orchestration for pin/unpin.
4. Add optimistic UI updates with rollback on partial failures.
5. Show success/error feedback and maintain selection state rules.

## Acceptance Criteria
- [x] User can select multiple files.
- [x] Bulk pin and bulk unpin actions are available.
- [x] Bulk action updates are reflected in UI.
- [x] Errors are surfaced when one or more actions fail.
- [x] Selection can be cleared quickly.

## Notes
- Keep behavior predictable when filters or pagination change while items are selected.
- Disable bulk actions when no files are selected.

## Completion Status
- [x] 100% - Completed
