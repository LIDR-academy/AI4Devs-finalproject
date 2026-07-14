---
name: compact-docs
description: Pre-PR cleanup for a feature's docs/features/<name>/ — runs a script that deletes stray per-round review copies (review-*-r2/-r3.md) and reports any .md over its size budget. Use as the pre-PR cleanup step (after DoD PASS) or on "compact docs". SCRIPT ONLY — it does not read, trim, or rewrite files, and the orchestrator must not invoke any agent to do so.
---

# compact-docs — mechanical pre-PR cleanup (script only)

The orchestrator's compaction step is **purely mechanical: run the script and stop.** It does **not** feed docs to an agent/subagent for trimming — the feature docs are written terse up front (spec shrunk after tasks, findings-only reviews, `tdd.md` kept as a log), so there's no post-hoc summarization in the pipeline.

## Run the script — this is the whole step

```bash
.agents/skills/compact-docs/scripts/compact-docs.sh <name>
```

It (a) deletes stray per-round review copies `review-<type>-r<N>.md` (pure duplication — the base `review-<type>.md` and the consolidated `review.md` are the durable records), and (b) prints a size report flagging any `.md` over its soft budget. If it changed anything, commit `chore(<name>): compact feature docs`.

**Do not** invoke an agent/subagent to rewrite or summarize the flagged files as part of the pipeline. The size report is informational only.

## Soft budgets (bytes — reported by the script, guidance only)

`tdd.md` ≤ 8 000 · `dod.md` ≤ 4 000 · `mutation.md` ≤ 4 000 · `spec.md` ≤ 4 000 · `review.md` ≤ 3 000 · each `review-<type>.md` ≤ 3 000.

---

## Optional: manual trim (human-run, NOT part of the orchestrator flow)

If a human later wants to shrink a file the report flagged as **OVER**, edit it by hand — never delete content not captured elsewhere, and never delete a durable artifact (`spec.md`, `gherkin-scenarios.md`, `tasks.md`, `task-N.md`, `review.md`, `mutation.md`, `dod.md`):

- **`tdd.md`** → `@s → test` table + one line per cycle; drop pasted code/diffs/output.
- **`review-<type>.md`** → verdict + `file:line` findings + severity only.
- **`review.md`** → still-open findings + round verdict.
- **`dod.md`** → checkbox + one-line evidence/link each.
- **`mutation.md`** → per-lib score + surviving-mutant list; drop verbose Stryker logs.
- **`spec.md`** → ensure no ACs (they live in `gherkin-scenarios.md`) and no task/risk detail duplicated.
