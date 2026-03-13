# TASK-US-106-01: Create CID Input and Validation

Create the CID entry form and enforce strict CID parsing validation before retrieval requests.

[Trello Card](https://trello.com/c/s9V52slu/270-task-us-106-01-create-cid-input-and-validation)

## Parent User Story
[US-106: File Retrieval Interface](../../user-stories/frontend/US-106-file-retrieval-interface.md)

## Description
Implement the CID input area on the retrieval page with client-side validation based on CID parsing. Validation must rely on a CID library parser, not prefix checks.

## Priority
Critical

## Estimated Time
1.5 hours

## Detailed Steps
1. Add CID input field and retrieve button to the retrieval page.
2. Integrate CID parsing validation (for example `multiformats` parser) in form logic.
3. Show validation message when parsing fails.
4. Disable submit while input is empty or invalid.
5. Add loading state wiring for submit action.

## Acceptance Criteria
- [x] CID input field is visible and editable.
- [x] CID format is validated through parser success/failure.
- [x] Invalid CID displays a clear error message.
- [x] Retrieve action is blocked for invalid CID.
- [x] Loading state is shown while request is in progress.

## Notes
- Keep validation error text consistent with story language (for example: "Invalid CID format").
- Keep this task focused on input and validation only.

## Completion Status
- [x] 100% - Completed
