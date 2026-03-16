# TASK-US-107-01: Create File Table

Create the primary files table UI with required columns, row actions, and responsive behavior.

[Trello Card](https://trello.com/c/cf089TLg)

[Pull Request](https://github.com/mentally-gamez-soft/ipfs-saas-ai4devs/pull/22)

## Parent User Story
[US-107: Files Management Page](../../user-stories/frontend/US-107-files-management.md)

## Description
Implement the list/table view for the files management page using the agreed column set: Name, CID, Size, Pinned, Uploaded, and Actions. Include row selection and CID copy support.

## Priority
High

## Estimated Time
1.5 hours

## Detailed Steps
1. Create table layout and column headers based on story specs.
2. Render file rows with filename, truncated CID, size, pin status, and uploaded date.
3. Add row checkbox and a select-all checkbox in the header.
4. Add row-level actions for download, view, and pin toggle entry points.
5. Ensure table remains usable on smaller screens.

## Acceptance Criteria
- [x] Table displays all required columns in list view.
- [x] Rows render file data correctly, including truncated CID.
- [x] Row selection checkbox is available for each item.
- [x] Row actions are visible and clickable.
- [x] Layout is responsive and readable on mobile.

## Notes
- Keep CID truncation and copy interaction consistent with existing retrieval UI patterns.
- Keep this task focused on table foundation, not advanced filters/pagination.

## Completion Status
- [x] 100% - Completed
