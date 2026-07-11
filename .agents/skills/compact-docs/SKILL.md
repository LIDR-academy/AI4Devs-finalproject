---
name: compact-docs
description: Compact a feature's docs/features/<name>/ artifacts before the PR — delete stray per-round review copies (review-*-r2/-r3.md), report any .md over its size budget, and trim the flagged ones to summary form. Use as the pre-PR cleanup step (after DoD PASS) or on "compact docs", "trim feature docs", "shrink the md files". Reduces the token cost of re-reading these artifacts.
---

# compact-docs — shrink a feature's artifacts before the PR

Per-feature `.md` files accrete: `tdd.md` becomes a transcript, reviewers leave per-round copies, `dod.md` restates everything. This skill trims them to their durable, summary form so they're cheap to re-read. Run it once, after DoD PASS and before hand-off.

## Run the script (mechanical cleanup + size report)

```bash
.agents/skills/compact-docs/scripts/compact-docs.sh <name>
```

It (a) deletes stray per-round review copies `review-<type>-r<N>.md` (pure duplication — the base `review-<type>.md` and the consolidated `review.md` are the durable records), and (b) prints a size report flagging any `.md` over its soft budget.

## Then trim the flagged files to summary form

For each file the report flags as **OVER**, edit it down (don't delete content that isn't captured elsewhere):

- **`tdd.md`** → a compact `@s → test` table + **one line per Red→Green→Refactor cycle**. Delete pasted code, diffs, test bodies, command output (they live in the repo/git). This is usually the biggest win.
- **`review-<type>.md`** → verdict + `file:line` findings + severity only; no restated rubric, no "what passed".
- **`review.md`** → only the still-open findings (empty on APPROVED) + the round verdict.
- **`dod.md`** → checkbox + one line of evidence each (a `file:line`, a one-line result, or a link to `review.md`/`mutation.md`); no pasted command output.
- **`mutation.md`** → per-lib `total/killed/survived/score` + the surviving-mutant list; drop verbose Stryker logs.
- **`spec.md`** → ensure ACs are **not** duplicated (they live in `gherkin-scenarios.md`); keep summary/stories/states/analytics/flags/decisions terse.

## Soft budgets (bytes, guidance not hard limits)

`tdd.md` ≤ 8 000 · `dod.md` ≤ 4 000 · `mutation.md` ≤ 4 000 · `spec.md` ≤ 4 000 · `review.md` ≤ 3 000 · each `review-<type>.md` ≤ 3 000.

Commit the compaction on the feature branch (`chore(<name>): compact feature docs`). Never delete a durable artifact (`spec.md`, `gherkin-scenarios.md`, `tasks.md`, `task-N.md`, `review.md`, `mutation.md`, `dod.md`) — only trim it or remove pure duplicates.
