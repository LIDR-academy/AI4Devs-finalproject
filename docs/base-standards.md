---
description: This document contains all development rules and guidelines for this project, applicable to all AI agents (Claude, Cursor, Codex, Gemini, etc.).
alwaysApply: true
---

## 1. Core Principles

- **Small tasks, one at a time**: Always work in baby steps, one at a time. Never go forward more than one step.
- **Test-Driven Development**: Start with failing tests for any new functionality (TDD), according to the task details.
- **Type Safety**: All code must be fully typed.
- **Clear Naming**: Use clear, descriptive names for all variables and functions.
- **Incremental Changes**: Prefer incremental, focused changes over large, complex modifications.
- **Question Assumptions**: Always question assumptions and inferences.
- **Pattern Detection**: Detect and highlight repeated code patterns.

## 2. Language Standards
- **Spanish Only**: All this artifacts must always use Spanish, including:
    - Documentation (README, guides, API docs)
    - Jira tickets (titles, descriptions, comments)
    - Git commit messages
## 2.1 Language Standards
- **English Only**: All technical artifacts must always use English, including:
    - Code (variables, functions, classes, comments, error messages, log messages)
    - Data schemas and database names
    - Configuration files and scripts
    - Test names and descriptions
## 3. Specific standards

For detailed standards and guidelines specific to different areas of the project, refer to:

- [Backend Standards](./backend-standards.md) - API development, database patterns, testing, security and backend best practices
- [Frontend Standards](./frontend-standards.md) - React components, UI/UX guidelines, and frontend architecture
- [Documentation Standards](./documentation-standards.md) - Technical documentation structure, formatting, and maintenance guidelines, including AI standards like this document
- [OpenSpec Tasks Mandatory Steps](./openspec-tasks-mandatory-steps.md) - Required checklist and execution rules when creating or updating OpenSpec `tasks.md` files

## 4. Project Skills

- Skills live in `ai-specs/skills`.
- When a request matches a skill, load and follow the corresponding `SKILL.md` automatically before continuing.
- Also load any referenced files in the skill folder (for example, `references/*.md`) when the skill requires them.

## 5. Planning Model Recommendation

Planning workflows (e.g. `enrich-us`, backlog refinement, architecture decisions) **should preferably** run on the most capable model available with high reasoning effort (e.g. an Opus-class or higher model).

This is a **recommendation, not a hard requirement**: if the session is running on a different model, inform the user and continue — do not modify model settings or configuration files without explicit user consent. Routine implementation steps can run on any capable model.

## 6. Symlink Integrity and Multi-Agent Portability

- **Canonical Source**: Keep reusable artifacts in `ai-specs` as the canonical source. Agent-specific paths (such as `.claude` and `.cursor`) should reference them through symlinks when possible.
- **Update Safety**: Whenever a file is renamed, moved, or its suffix changes, verify and update all symlinks that target it before considering the change complete.
- **New Artifact Linking**: Whenever creating a new artifact that requires multi-agent exposure (for example new agents or skills in `ai-specs`), create the corresponding symlinks from the expected agent-specific reference paths.
- **External Customization Review**: Whenever customization is introduced outside `ai-specs`, evaluate whether it should be moved into `ai-specs` and replaced with symlinks from the original locations.
- **Completion Gate**: A change is incomplete if it leaves broken symlinks, stale targets, or duplicated canonical artifacts across agent-specific folders.

## 7. OpenSpec Usage (Optional — Future Adoption)

OpenSpec is initialized in this repository (`openspec/`) but is **not currently used as the source of truth**. The current sources of truth are: `docs/api-spec.yml` (API contract), `docs/data-model.md` (data model) and `docs/us/all-us.md` (backlog).

Rules while OpenSpec adoption is pending:

- Do not delete the `openspec/` folder.
- Do not move documentation into OpenSpec without explicit user authorization.
- OpenSpec should be considered for future adoption once the team is ready to work spec-driven.

If a change **explicitly** uses OpenSpec artifacts (created via `opsx:propose`/`opsx:apply`), then documentation-first applies for that change: update the affected OpenSpec artifacts (scenarios, requirements/specs, `tasks.md`) before coding, and re-verify against the updated artifacts before archiving. Do not apply code-only fixes inside an active OpenSpec change window without updating its artifacts.

## 8. Issue Tracking and Traceability

Every bug found, reported by the user, or discovered during development **must** be documented and tracked:

### 8.1 Issue Registration
- Create an issue file in `fixs/issue-NNN.md` (sequential numbering) with:
  - **Estado** (🔧 En progreso / ✅ Resuelto / ⏳ Pendiente)
  - **Severidad** (Alta / Media / Baja)
  - **Descripción** del problema
  - **Causa raíz** (root cause analysis)
  - **Solución aplicada** (o propuesta si queda pendiente)
  - **Archivos modificados**

### 8.2 Execution Plan
- Before starting fixes, create a traceable plan with checkboxes (SQL todos or plan.md).
- Update status as each task is completed (`pending` → `in_progress` → `done`).
- Group related fixes in logical commits with descriptive messages.

### 8.3 Documentation Updates (mandatory after every fix session)
After completing fixes or features, **always** update these documents:
1. **`PROJECT_STATUS.md`** — current state, new issues resolved, pending items.
2. **`HANDOFF.md`** § "Estado detallado" — exact point where work stopped, what changed.
3. **`docs/plan-rediseno-figma.md`** — if changes relate to the redesign (phases completed, pending).
4. **`prompts/00-all-prompts.md`** — register significant prompts used (per `PROMPT_REGISTRY.md`).
5. **Issue files** — update status from 🔧 to ✅ when resolved.

### 8.4 Commit Discipline
- Each fix or group of related fixes gets its own commit with descriptive message.
- Reference the issue number in the commit: `fix: descripción (issue-NNN)`.
- Never leave uncommitted fixes at end of session.

