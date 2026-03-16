---
trigger: always_on
---

### 4.8.2 Task Validation Rules

> Rationale: Ensures all tasks adhere to required standards and workflows.

1. **Core Rules**:
   - All tasks must be associated with an existing PBI
   - Task IDs must be unique within their parent PBI
   - Tasks must follow the defined workflow states and transitions
   - All required documentation must be completed before marking a task as 'Done'
   - Task history must be maintained for all status changes
   - Only one task per PBI may be 'InProgress' at any time, unless explicitly approved
   - Every task in the tasks index MUST have a corresponding markdown file
   - Task descriptions in the index MUST be linked to their markdown files

2. **Pre-Implementation Checks**:
   - Verify the task exists and is in the correct status before starting work
   - Document the task ID in all related changes
   - List all files that will be modified
   - Get explicit approval before proceeding with implementation

3. **Error Prevention**:
   - If unable to access required files, stop and report the issue
   - For protected files, provide changes in a format that can be manually applied
   - Verify task status in both task file and index before starting work
   - Document all status checks in the task history

4. **Change Management**:
   - Reference the task ID in all commit messages
   - Update task status according to workflow
   - Ensure all changes are properly linked to the task
   - Document any deviations from the planned implementation

### 4.9 Version Control for Task Completion

> Rationale: Ensures consistent version control practices when completing tasks, maintaining traceability and automation.

1. **Commit Message Format**:
   - When a task moves from `Review` to `Done`, create a commit with the message:
     ```
     <task_id> <task_description>
     ```
   - Example: `1-7 Add pino logging to help debug database connection issues`

2. **Pull Request**:
   - Title: `[<task_id>] <task_description>`
   - Include a link to the task in the description
   - Ensure all task requirements are met before marking as `Done`

3. **Automation**:
   - When a task is marked as `Done`, run:
     ```bash
     git acp "<task_id> <task_description>"
     ```
   - This command should:
     1. Stage all changes
     2. Create a commit with the specified message
     3. Push to the remote branch

4. **Verification**:
   - Ensure the commit appears in the task's history
   - Confirm the task status is updated in both the task file and index
   - Verify the commit message follows the required format

## 4.10 Task Index File

> Rationale: Defines the standard structure for PBI-specific task index files, ensuring a consistent overview of tasks related to a Product Backlog Item.

*   **Location Pattern**: `docs/delivery/<PBI-ID>/tasks.md`
    *   Example: `docs/delivery/6/tasks.md`
*   **Purpose**: To list all tasks associated with a specific PBI, provide a brief description for each, show their current status, and link to their detailed task files.
*   **Required Sections and Content**:
    1.  **Title**:
        *   Format: `# Tasks for PBI <PBI-ID>: <PBI Title>`
        *   Example: `# Tasks for PBI 6: Ensure enrichment tasks are resilient to service and web page disruption`
    2.  **Introduction Line**:
        *   Format: `This document lists all tasks associated with PBI <PBI-ID>.`
    3.  **Link to Parent PBI**:
        *   Format: `**Parent PBI**: [PBI <PBI-ID>: <PBI Title>](./prd.md)`
        *   Example: `**Parent PBI**: [PBI 6: Ensure enrichment tasks are resilient to service and web page disruption](./prd.md)`
    4.  **Task Summary Section Header**:
        *   Format: `## Task Summary`
    5.  **Task Summary Table**:
        *   Columns: `| Task ID | Name | Status | Description |`
        *   Markdown Table Structure:
            ```markdown
            | Task ID | Name                                     | Status   | Description                        |
            | :------ | :--------------------------------------- | :------- | :--------------------------------- |
            | <ID>    | [<Task Name>](./<PBI-ID>-<TaskNum>.md) | Proposed | <Brief task description>           |
            ```
        *   **`Task ID`**: The unique identifier for the task within the PBI (e.g., `6-1`).
        *   **`Name`**: The full name of the task, formatted as a Markdown link to its individual task file (e.g., `[Define and implement core Circuit Breaker state machine](./6-1.md)`).
        *   **`Status`**: The current status of the task, which must be one of the permitted values defined in Section 4.5 (Status Definitions).
        *   **`Description`**: A brief, one-sentence description of the task's objective.
*   **Prohibited Content**:
    *   The Task Summary table in this file must only contain what is specified, and nothing else, unless a User specifically oks it.
  
# 5. Testing Strategy and Documentation

> Rationale: Ensures that testing is approached thoughtfully, appropriately scoped, and well-documented, leading to higher quality software and maintainable test suites.

## 5.1 General Principles for Testing

1.  **Risk-Based Approach**: Prioritize testing efforts based on the complexity and risk associated with the features being developed.
2.  **Test Pyramid Adherence**: Strive for a healthy balance of unit, integration, and end-to-end tests. While unit tests form the base, integration tests are crucial for verifying interactions between components.
3.  **Clarity and Maintainability**: Tests should be clear, concise, and easy to understand and maintain. Avoid overly complex test logic.
4.  **Automation**: Automate tests wherever feasible to ensure consistent and repeatable verification.