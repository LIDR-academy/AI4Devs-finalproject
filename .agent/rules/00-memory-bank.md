---
description: "Mandatory Memory Bank Workflow"
globs: ["**/*"]
alwaysApply: true
priority: critical
---

# AGENT MANDATE: Shared Memory Access

You are working in a multi-agent environment (Antigravity). You must rely on the Memory Bank for the single source of truth.

## 1. Context Loading (READ FIRST)
Before planning or executing ANY task, you MUST read:
- `memory-bank/activeContext.md` -> To understand current focus.
- `memory-bank/systemPatterns.md` -> To respect architecture.
- `memory-bank/techContext.md` -> To use correct tools/commands.

## 2. Atomic Updates (WRITE BACK)
After completing a task:
1.  **Update** `memory-bank/activeContext.md`: Remove your finished task, add the result.
2.  **Update** `memory-bank/progress.md`: Mark features as completed.
3.  **Self-Correction**: If you find `projectbrief.md` or `systemPatterns.md` outdated, update them immediately.

## 3. Decision Logging (MANDATORY)
When making ANY architectural, scope, or technical decision, you MUST:
1.  **Log immediately** in `memory-bank/decisions.md` using the provided template.
2.  Include: Context (problem), Decision (what was chosen), Consequences (trade-offs).
3.  **Examples of decisions requiring logging:**
    - Technology stack choices (frameworks, libraries, tools)
    - Architecture patterns (monolith vs microservices, state management)
    - Data modeling decisions (schema design, database choice)
    - API design choices (REST vs GraphQL, versioning strategy)
    - Build/deployment configuration changes
    - Major refactoring approaches

## 4. Forbidden Actions
- Do not invent commands not listed in `techContext.md`.
- Do not modify core architecture without updating `systemPatterns.md` first.
- Do not make architectural decisions without logging them in `decisions.md`.
