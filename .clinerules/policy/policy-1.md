---
trigger: always_on
---

# Project Policy

This policy provides a single, authoritative, and machine-readable source of truth for AI coding agents and humans, ensuring that all work is governed by clear, unambiguous rules and workflows. It aims to eliminate ambiguity, reduce supervision needs, and facilitate automation while maintaining accountability and compliance with best practices.

# 1. Introduction

> Rationale: Sets the context, actors, and compliance requirements for the policy, ensuring all participants understand their roles and responsibilities.

## 1.1 Actors

> Rationale: Defines who is involved in the process and what their roles are.

- **User**: The individual responsible for defining requirements, prioritising work, approving changes, and ultimately accountable for all code modifications.
- **AI_Agent**: The delegate responsible for executing the User's instructions precisely as defined by PBIs and tasks.

## 1.2 Architectural Compliance

> Rationale: Ensures all work aligns with architectural standards and references, promoting consistency and quality across the project.

- **Policy Reference**: This document adheres to the AI Coding Agent Policy Document.
- **Includes**:
  - All tasks must be explicitly defined and agreed upon before implementation.
  - All code changes must be associated with a specific task.
  - All PBIs must be aligned with the PRD when applicable.

# 2. Fundamental Principles

> Rationale: Establishes the foundational rules that govern all work, preventing scope creep, enforcing accountability, and ensuring the integrity of the development process.

## 2.1 Core Principles

> Rationale: Lists the essential guiding principles for all work, such as task-driven development, user authority, and prohibition of unapproved changes.

1. Task-Driven Development: No code shall be changed in the codebase unless there is an agreed-upon task explicitly authorising that change.
2. PBI Association: No task shall be created unless it is directly associated with an agreed-upon Product Backlog Item (PBI).
3. PRD Alignment: If a Product Requirements Document (PRD) is linked to the product backlog, PBI features must be sense-checked to ensure they align with the PRD's scope.
4. User Authority: The User is the sole decider for the scope and design of ALL work.
5. User Responsibility: Responsibility for all code changes remains with the User, regardless of whether the AI Agent performed the implementation.
6. Prohibition of Unapproved Changes: Any changes outside the explicit scope of an agreed task are EXPRESSLY PROHIBITED.
7. Task Status Synchronisation: The status of tasks in the tasks index (1-tasks.md) must always match the status in the individual task file. When a task's status changes, both locations must be updated immediately.
8.  **Controlled File Creation**: The AI_Agent shall not create any files, including standalone documentation files, that are outside the explicitly defined structures for PBIs (see 3.6), tasks (see 4.3), or source code, unless the User has given explicit prior confirmation for the creation of each specific file. This principle is to prevent the generation of unrequested or unmanaged documents.
9. **External Package Research and Documentation**: For any proposed tasks that involve external packages, to avoid hallucinations, use the web to research the documentation first to ensure it's 100% clear how to use the API of the package. Then for each package, a document should be created `<task id>-<package>-guide.md` that contains a fresh cache of the information needed to use the API. It should be date-stamped and link to the original docs provided. E.g., if pg-boss is a library to add as part of task 2-1 then a file `tasks/2-1-pg-boss-guide.md` should be created. This documents foundational assumptions about how to use the package, with example snippets, in the language being used in the project.
10. **Task Granularity**: Tasks must be defined to be as small as practicable while still representing a cohesive, testable unit of work. Large or complex features should be broken down into multiple smaller tasks.
11. **Don't Repeat Yourself (DRY)**: Information should be defined in a single location and referenced elsewhere to avoid duplication and reduce the risk of inconsistencies. Specifically:
    - Task information should be fully detailed in their dedicated task files and only referenced from other documents.
    - PBI documents should reference the task list rather than duplicating task details.
    - The only exception to this rule is for titles or names (e.g., task names in lists).
    - Any documentation that needs to exist in multiple places should be maintained in a single source of truth and referenced elsewhere.
12. **Use of Constants for Repeated or Special Values**: Any value (number, string, etc.) used more than once in generated code—especially "magic numbers" or values with special significance—**must** be defined as a named constant.
    - Example: Instead of `for (let i = 0; i < 10; i++) { ... }`, define `const numWebsites = 10;` and use `for (let i = 0; i < numWebsites; i++) { ... }`.
    - All subsequent uses must reference the constant, not the literal value.
    - This applies to all code generation, automation, and manual implementation within the project.
13. **Technical Documentation for APIs and Interfaces**: As part of completing any PBI that creates or modifies APIs, services, or interfaces, technical documentation must be created or updated explaining how to use these components. This documentation should include:
    - API usage examples and patterns
    - Interface contracts and expected behaviors  
    - Integration guidelines for other developers
    - Configuration options and defaults
    - Error handling and troubleshooting guidance
    - The documentation must be created in the appropriate location (e.g., `docs/technical/` or inline code documentation) and linked from the PBI detail document.
