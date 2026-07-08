# Command: /sprint

## Description

Executes a complete user story from scaffold to evidence. This is the highest-level command — it chains scaffold-story → implementer → reviewer → documenter.

## Usage

```
/sprint <us-id>
/sprint US1 --skip-review
```

## Flags

- `--skip-review` — skip the reviewer step (use with caution; only for time-boxed iterations)
- `--dry-run` — show the plan without executing
- `--from-task <T-id>` — resume from a specific task within the US

## What it does

1. **Decompose** — read `specs/001-realista-mvp/tasks.md` and extract all tasks for the US.
2. **Scaffold** — invoke `/scaffold-story <us-id>` if not already done.
3. **Implement loop** — for each task in dependency order:
   - Invoke `@implementer` with the task
   - Wait for commit + evidence
   - Verify tests pass
4. **Review** — invoke `/review-pr` on the US diff. Loop back to implement if critical findings.
5. **Document** — invoke `@documenter` to update readme/prompts/index.
6. **Summary** — generate `docs/evidence/YYYY-MM-DD-HHMM-<us-id>-SUMMARY.md`.

## Time expectation

A full US with ~20 tasks takes ~30-60 minutes of agent time, depending on complexity and LLM latency.

## Example output

```
@orchestrator: starting US1 sprint
@orchestrator: scaffolded 8 files for US1
@implementer: T023 TransparencyScore test (red)
@implementer: T028 TransparencyScore impl (green) — coverage 95%
@implementer: T024 RedFlags test (red)
...
@reviewer: 0 critical, 2 important, 5 minor findings
@implementer: fixed 2 important findings
@reviewer: clean
@documenter: readme.md updated, evidence index refreshed
@orchestrator: US1 sprint complete in 47 minutes
```
