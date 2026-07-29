# Skill: auto-evidence

## Purpose

Generates a self-documentation evidence file at `docs/evidence/YYYY-MM-DD-HHMM-<task-id>.md` capturing the prompt that triggered the work, what was done, deliverables, test results, and commits. This is the core of the self-documentation system.

## When to invoke

- At the end of every task in `specs/001-realista-mvp/tasks.md` (T002 onwards)
- After every `/sprint` slice
- After every `/review-pr` if the review changes anything
- After every doc update

## Inputs

- `task-id` (e.g., `T028` or `ENTREGA2-SETUP`)
- The exact user prompt that triggered the work (verbatim)
- The current branch name
- The story (US) this task belongs to

## Outputs

- A new file: `docs/evidence/YYYY-MM-DD-HHMM-<task-id>.md`
- An updated `docs/evidence/INDEX.md`

## Template

```markdown
# Evidence: <task-id> — <title>

**Date**: 2026-07-08 14:30
**Agent**: <implementer | reviewer | documenter | orchestrator>
**Story**: <US1..US6 | null>
**Branch**: <branch-name>

## Prompt (verbatim)
> <the exact user prompt that triggered this work>

## What was done
- <action 1>
- <action 2>
- ...

## Deliverables
- `path/to/file.ts` (new)
- `path/to/file.test.ts` (new)
- `path/to/file2.md` (modified)

## Tests
- Unit: <N>/<N> passing
- Integration: <N>/<N> passing
- Domain coverage: <N>%

## Commits
- `<sha>` <conventional commit message>

## Notes
- <any relevant context for future tasks>
- <open questions>
- <known limitations>
```

## Example invocation

```
@skill auto-evidence
task-id: T028
prompt: "Create TransparencyScore value object with score 0-100, label, breakdown"
story: US1
```

## Index update

`docs/evidence/INDEX.md` is regenerated with each evidence file. It contains:

```markdown
# Evidence Index

## 2026-07-08
- [ENTREGA2-SETUP](2026-07-08-1430-ENTREGA2-SETUP.md) — Initial scaffold of .opencode/, backend/, frontend/, e2e/, docker-compose
- [T028](2026-07-08-1530-T028.md) — TransparencyScore value object with 0-100 validation

## 2026-07-09
- [T029](2026-07-09-0915-T029.md) — RedFlags value object with Spanish labels
- ...
```

## Implementation note

This skill is itself invoked by the `implementer`, `reviewer`, and `documenter` agents. The orchestrator invokes it at the end of each slice. Manual invocation is allowed via `/document-task <task-id>`.
