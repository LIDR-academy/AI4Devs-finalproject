# TASK-US-107-06: Create File Details Modal

Create a details modal/drawer for inspecting a file and accessing contextual actions.

[Trello Card](https://trello.com/c/cW5D62De)

## Parent User Story
[US-107: Files Management Page](../../user-stories/frontend/US-107-files-management.md)

## Description
Implement a file details modal or drawer that presents complete metadata and supports key actions without leaving the files page.

## Priority
Medium

## Estimated Time
1.5 hours

## Detailed Steps
1. Create modal/drawer component and open/close behavior.
2. Display detailed metadata (filename, CID, size, mime type, uploaded date, pin status).
3. Add contextual actions (view, download, pin/unpin).
4. Ensure keyboard navigation, focus trap, and escape close behavior.
5. Integrate modal open action from both table and grid items.

## Acceptance Criteria
- [x] User can open file details from list or grid item.
- [x] Modal shows complete file metadata.
- [x] Actions inside modal are functional.
- [x] Modal is accessible by keyboard and screen readers.
- [x] Modal closes reliably via close button, backdrop, and escape key.

## Notes
- Keep modal data source synchronized with list/grid state updates.
- Design can be modal or side drawer as long as UX is consistent.

## Completion Status
- [x] 100% - Completed
