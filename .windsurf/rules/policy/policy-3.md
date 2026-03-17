---
trigger: always_on
---

## 3.6 PBI Detail Documents

> Rationale: Provides a dedicated space for detailed requirements, technical design, and UX considerations for each PBI, ensuring comprehensive documentation and alignment across the team.

- **Location Pattern**: `docs/delivery/<PBI-ID>/prd.md`
- **Purpose**: 
  - Serve as a mini-PRD for the PBI
  - Document the problem space and solution approach
  - Provide technical and UX details beyond what's in the backlog
  - Maintain a single source of truth for all PBI-related information
- **Required Sections**:
  - `# PBI-<ID>: <Title>`
  - `## Overview`
  - `## Problem Statement`
  - `## User Stories`
  - `## Technical Approach`
  - `## UX/UI Considerations`
  - `## Acceptance Criteria`
  - `## Dependencies`
  - `## Open Questions`
  - `## Related Tasks`
- **Linking**:
  - Must link back to the main backlog entry: `[View in Backlog](../backlog.md#user-content-<PBI-ID>)`
  - The backlog entry must link to this document: `[View Details](./<PBI-ID>/prd.md)`
- **Ownership**:
  - Created when a PBI moves from "Proposed" to "Agreed"
  - Maintained by the team member implementing the PBI
  - Reviewed during PBI review process
  - 
# 4. Task Management

> Rationale: Defines how tasks are documented, executed, and tracked, ensuring that all work is broken down into manageable, auditable units.

## 4.1 Task Documentation

> Rationale: Specifies the structure and content required for task documentation, supporting transparency and reproducibility.

- **Location Pattern**: docs/delivery/<PBI-ID>/
- **File Naming**: 
  - Task list: `tasks.md`
  - Task details: `<PBI-ID>-<TASK-ID>.md` (e.g., `1-1.md` for first task of PBI 1)
- **Required Sections**:
  > Rationale: Required sections ensure all tasks are fully described and verifiable
  - `# [Task-ID] [Task-Name]`
  - `## Description`
  - `## Status History`
  - `## Requirements`
  - `## Implementation Plan`
  - `## Verification`
  - `## Files Modified`

## 4.2 Principles
1. Each task must have its own dedicated markdown file.
2. Task files must follow the specified naming convention.
3. All required sections must be present and properly filled out.
4. When adding a task to the tasks index, its markdown file MUST be created immediately and linked using the pattern `[description](./<PBI-ID>-<TASK-ID>.md)`.
5. Individual task files must link back to the tasks index using the pattern `[Back to task list](../<tasks-index-file>.md)`.

## 4.3 Task Workflow

> Rationale: Describes the allowed status values and transitions for tasks, ensuring a controlled and auditable workflow.

## 4.4 Task Status Synchronisation

To maintain consistency across the codebase:

1. **Immediate Updates**: When a task's status changes, update both the task file and the tasks index (1-tasks.md) in the same commit.
2. **Status History**: Always add an entry to the task's status history when changing status.
3. **Status Verification**: Before starting work on a task, verify its status in both locations.
4. **Status Mismatch**: If a status mismatch is found, immediately update both locations to the most recent status.

Example of a status update in a task file:
```
| 2025-05-19 15:02:00 | Created       | N/A      | Proposed  | Task file created | Julian |
| 2025-05-19 16:15:00 | Status Update | Proposed | InProgress | Started work      | Julian |
```

Example of the corresponding update in 1-tasks.md:
```
| 1-7 | [Add pino logging...](./1-7.md) | InProgress | Pino logs connection... |
```

## 4.5 Status Definitions
- **task_status(Proposed)**: The initial state of a newly defined task.
- **task_status(Agreed)**: The User has approved the task description and its place in the priority list.
- **task_status(InProgress)**: The AI Agent is actively working on this task.
- **task_status(Review)**: The AI Agent has completed the work and it awaits User validation.
- **task_status(Done)**: The User has reviewed and approved the task's implementation.
- **task_status(Blocked)**: The task cannot proceed due to an external dependency or issue.
