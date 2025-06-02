---
trigger: always_on
---

## 4.6 Event Transitions
- **event_transition on "user_approves" from Proposed to Agreed**:
  1. Verify task description is clear and complete.
  2. Ensure task is properly prioritized in the backlog.
  3. Create task documentation file following the _template.md pattern and link it in the tasks index.
   - The file must be named `<PBI-ID>-<TASK-ID>.md`
   - The task description in the index must link to this file
   - Analysis and design work must be undertaken and documented in the required sections of task file    
  4. Log status change in task history.

- **event_transition on "start_work" from Agreed to InProgress**:
  1. Verify no other tasks are InProgress for the same PBI.
  2. Create a new branch for the task if using version control.
  3. Log start time and assignee in task history.
  4. Update task documentation with implementation start details.

- **event_transition on "submit_for_review" from InProgress to Review**:
  1. Ensure all task requirements are met.
  2. Run all relevant tests and ensure they pass.
  3. Update task documentation with implementation details.
  4. Create a pull request or mark as ready for review.
  5. Notify the User that review is needed.
  6. Log submission for review in task history.

- **event_transition on "approve" from Review to Done**:
  1. Verify all acceptance criteria are met.
  2. Merge changes to the main branch if applicable.
  3. Update task documentation with completion details.
  4. Update task status and log completion time.
  5. Archive task documentation as needed.
  6. Notify relevant stakeholders of completion.
  7. Log approval in task history.
  8. **Review Next Task Relevance**: Before marking as Done, review the next task(s) in the PBI task list in light of the current task's implementation outcomes. Confirm with the User whether subsequent tasks remain relevant, need modification, or have become redundant due to implementation decisions or scope changes in the current task. Document any task modifications or removals in the task history.

- **event_transition on "reject" from Review to InProgress**:
  1. Document the reason for rejection in task history.
  2. Update task documentation with review feedback.
  3. Notify the AI Agent of required changes.
  4. Update task status and log the rejection.
  5. Create new tasks if additional work is identified.

- **event_transition on "significant_update" from Review to InProgress**:
  1. Document the nature of significant changes made to task requirements, implementation plan, or test plan.
  2. Update task status to reflect that additional work is now required.
  3. Log the update reason in task history.
  4. Notify stakeholders that the task requires additional implementation work.
  5. Resume development work to address the updated requirements.

- **event_transition on "mark_blocked" from InProgress to Blocked**:
  1. Document the reason for blocking in task history.
  2. Identify any dependencies or issues causing the block.
  3. Update task documentation with blocking details.
  4. Notify relevant stakeholders of the block.
  5. Consider creating new tasks to address blockers if needed.

- **event_transition on "unblock" from Blocked to InProgress**:
  1. Document the resolution of the blocking issue in task history.
  2. Update task documentation with resolution details.
  3. Resume work on the task.
  4. Notify relevant stakeholders that work has resumed.

## 4.7 One In Progress Task Limit

Only one task per PBI should be 'InProgress' at any given time to maintain focus and clarity. In special cases, the User may approve additional concurrent tasks.

## 4.8 Task History Log

> Rationale: Specifies how all changes to tasks are recorded, providing a complete audit trail.

- **Location Description**: Task change history is maintained in the task's markdown file under the 'Status History' section.
- **Required Fields**:
  > Rationale: Defines the required fields for logging task history, ensuring all relevant information is captured.
  - **history_field(Timestamp)**: Date and time of the change (YYYY-MM-DD HH:MM:SS).
  - **history_field(Event_Type)**: Type of event that occurred.
  - **history_field(From_Status)**: Previous status of the task.
  - **history_field(To_Status)**: New status of the task.
  - **history_field(Details)**: Description of the change or action taken.
  - **history_field(User)**: User who initiated the change.

### 4.8.1 Format Example

```
| Timestamp | Event Type | From Status | To Status | Details | User |
|-----------|------------|-------------|-----------|---------|------|
| 2025-05-16 15:30:00 | Status Change | Proposed | Agreed | Task approved by Product Owner | johndoe |
| 2025-05-16 16:45:00 | Status Change | Agreed | InProgress | Started implementation | ai-agent-1 |
```