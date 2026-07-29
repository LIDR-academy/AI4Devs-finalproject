# Command: /document-task

## Description

Generates the evidence file for a specific task in `docs/evidence/`. Usually called by the `auto-evidence` skill at the end of each task, but can also be invoked manually.

## Usage

```
/document-task <task-id>
/document-task T028
```

## What it does

1. Look up task in `specs/001-realista-mvp/tasks.md` (description, story, FR mapping)
2. Find the most recent commit(s) for this task (`git log --grep="T028"`)
3. List the files added/modified in those commits
4. Run tests and capture results
5. Fill the evidence template (see `.opencode/skills/auto-evidence.md`)
6. Write `docs/evidence/YYYY-MM-DD-HHMM-<task-id>.md`
7. Update `docs/evidence/INDEX.md`

## Output

A new file `docs/evidence/YYYY-MM-DD-HHMM-<task-id>.md` plus an updated index.

## Example evidence file

See `docs/evidence/2026-07-08-1430-ENTREGA2-SETUP.md` (generated during initial scaffold).
