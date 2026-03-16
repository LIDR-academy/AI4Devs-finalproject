---
trigger: always_on
---

## 2.2 PRD Alignment Check

All PBIs must be checked for alignment with the PRD. Any discrepancies must be raised with the User.

## 2.3 Integrity and Sense Checking

All data must be sense-checked for consistency and accuracy.

## 2.4 Scope Limitations

> Rationale: Prevents unnecessary work and keeps all efforts focused on agreed tasks, avoiding gold plating and scope creep.

- No gold plating or scope creep is allowed.
- All work must be scoped to the specific task at hand.
- Any identified improvements or optimizations must be proposed as separate tasks.

## 2.5 Change Management Rules

> Rationale: Defines how changes are managed, requiring explicit association with tasks and strict adherence to scope.

- Conversation about any code change must start by ascertaining the linked PBI or Task before proceeding.
- All changes must be associated with a specific task.
- No changes should be made outside the scope of the current task.
- Any scope creep must be identified, rolled back, and addressed in a new task.
- If the User asks to make a change without referring to a task, then the AI Agent must not do the work and must have a conversation about it to determine if it should be associated with an existing task or if a new PBI + task should be created.

# 3. Product Backlog Item (PBI) Management

> Rationale: Defines how PBIs are managed, ensuring clarity, traceability, and effective prioritisation of all work.

## 3.1 Overview

This section defines rules for Product Backlog Items (PBIs), ensuring clarity, consistency, and effective management throughout the project lifecycle.

## 3.2 Backlog Document Rules

> Rationale: Specifies how the backlog is documented and structured, so that all PBIs are tracked and managed in a consistent way.

- **Location Pattern**: docs/delivery/backlog.md
- **Scope Purpose Description**: The backlog document contains all PBIs for the project, ordered by priority.
- **Structure**:
  > Rationale: Defines the required table format for PBIs, ensuring standardisation and ease of use.
  - **Table**: `| ID | Actor | User Story | Status | Conditions of Satisfaction (CoS) |`

## 3.3 Principles
1. The backlog is the single source of truth for all PBIs.
2. PBIs must be ordered by priority (highest at the top).

## 3.4 PBI Workflow

> Rationale: Describes the allowed status values and transitions for PBIs, ensuring a controlled and auditable workflow.

### 3.4.1 Status Definitions
- **status(Proposed)**: PBI has been suggested but not yet approved.
- **status(Agreed)**: PBI has been approved and is ready for implementation.
- **status(InProgress)**: PBI is being actively worked on.
- **status(InReview)**: PBI implementation is complete and awaiting review.
- **status(Done)**: PBI has been completed and accepted.
- **status(Rejected)**: PBI has been rejected and requires rework or deprioritization.

### 3.4.2 Event Transitions
- **event_transition on "create_pbi": set to **Proposed**:
  1. Define clear user story and acceptance criteria.
  2. Ensure PBI has a unique ID and clear title.
  3. Log creation in PBI history.

- **event_transition on "propose_for_backlog" from Proposed to Agreed**:
  1. Verify PBI aligns with PRD and project goals.
  2. Ensure all required information is complete.
  3. Log approval in PBI history.
  4. Notify stakeholders of new approved PBI.

- **event_transition on "start_implementation" from Agreed to InProgress**:
  1. Verify no other PBIs are InProgress for the same component.
  2. Create tasks for implementing the PBI.
  3. Assign initial tasks to team members.
  4. Log start of implementation in PBI history.

- **event_transition on "submit_for_review" from InProgress to InReview**:
  1. Verify all tasks for the PBI are complete.
  2. Ensure all acceptance criteria are met.
  3. Update documentation as needed.
  4. Notify reviewers that PBI is ready for review.
  5. Log submission for review in PBI history.

- **event_transition on "approve" from InReview to Done**:
  1. Verify all acceptance criteria are met.
  2. Ensure all tests pass.
  3. Update PBI status and completion date.
  4. Archive related tasks and documentation.
  5. Log approval and completion in PBI history.
  6. Notify stakeholders of PBI completion.

- **event_transition on "reject" from InReview to Rejected**:
  1. Document reasons for rejection.
  2. Identify required changes or rework.
  3. Update PBI with review feedback.
  4. Log rejection in PBI history.
  5. Notify team of required changes.

- **event_transition on "reopen" from Rejected to InProgress**:
  1. Address all feedback from rejection.
  2. Update PBI with changes made.
  3. Log reopening in PBI history.
  4. Notify team that work has resumed.

- **event_transition on "deprioritize" from (Agreed, InProgress) to Proposed**:
  1. Document reason for deprioritization.
  2. Pause any in-progress work on the PBI.
  3. Update PBI status and priority.
  4. Log deprioritization in PBI history.
  5. Notify stakeholders of the change in priority.

### 3.4.3 Note

All status transitions must be logged in the PBI's history with timestamp and user who initiated the transition.

## 3.5 PBI History Log

> Rationale: Specifies how all changes to PBIs are recorded, providing a complete audit trail.

- **Location Description**: PBI change history is maintained in the backlog.md file.
- **Fields**:
  - **history_field(Timestamp)**: Date and time of the change (YYYYMMDD-HHMMSS).
  - **history_field(PBI_ID)**: ID of the PBI that was changed.
  - **history_field(Event_Type)**: Type of event that occurred.
  - **history_field(Details)**: Description of the change.
  - **history_field(User)**: User who made the change.