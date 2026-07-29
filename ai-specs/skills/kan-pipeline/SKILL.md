---
name: kan-pipeline
description: >-
  Orchestrate the full Jira ticket lifecycle for KAN-* tickets: enrich-us →
  openspec-propose → openspec-apply-change → commit/PR (fork only) → human merge gate →
  openspec-archive-change, then reset to main for the next ticket.
  Use with the queue in ai-specs/queues/kan-implementation-queue.yaml.
author: Reading Analytics Platform
version: 1.1.0
---

# kan-pipeline Skill

End-to-end **multi-step agent workflow** for implementing `KAN-*` Jira tickets in strict order.

**Announce at start:** "I'm using the kan-pipeline skill."

## Fork and remote policy (mandatory)

This project is developed on a **personal fork**, not the upstream classroom repo.

| Remote | Repository | Use |
|--------|------------|-----|
| `origin` | `CeliaMerino/AI4Devs-finalproject` | **All pushes and PRs** |
| `upstream` | `LIDR-academy/AI4Devs-finalproject` | Read-only sync when explicitly requested — **never PR here** |

**Every `gh` command** that targets the repo MUST include:

```bash
--repo CeliaMerino/AI4Devs-finalproject
```

Examples:

```bash
git push origin HEAD
gh pr create --repo CeliaMerino/AI4Devs-finalproject --base main --head feature/KAN-18-design-system ...
gh pr view 42 --repo CeliaMerino/AI4Devs-finalproject
```

Read `repo`, `pull_request`, and `merge` from **`ai-specs/queues/kan-implementation-queue.yaml`**.

## Input

`$ARGUMENTS` may be:

| Argument | Behavior |
|----------|----------|
| *(empty)* | Resume queue from first pending ticket (or human gate if awaiting merge) |
| `status` | Show queue progress without running steps |
| `next` | Run steps 0–5 for one ticket, open PR, **stop at human gate** |
| `continue` | After user merged PR: verify merge → archive → reset → optionally next ticket |
| `continue KAN-XX` | Continue a specific ticket in `awaiting_merge` state |
| `KAN-XX` | Run full cycle for that ticket only (still stops at human gate) |
| `from KAN-XX` | Start queue at that ticket |
| `dry-run` | Print planned steps; no git/Jira/OpenSpec writes |

## Queue source

Read ticket order from **`ai-specs/queues/kan-implementation-queue.yaml`**.

Track progress in **`ai-specs/queues/kan-pipeline-state.json`**:

```json
{
  "tickets": {
    "KAN-18": {
      "status": "pending|in_progress|awaiting_merge|done|failed|skipped",
      "failed_step": null,
      "change_name": "kan-18-design-system",
      "branch": "feature/KAN-18-design-system",
      "pr_url": "https://github.com/CeliaMerino/AI4Devs-finalproject/pull/N",
      "pr_number": 42,
      "archived_at": null,
      "error": null
    }
  }
}
```

Update state after **each step** so an interrupted run can resume safely.

## Per-ticket pipeline (strict order)

Complete **all** steps for one ticket before starting the next — except the **human merge gate** between steps 5 and 6.

```
┌─────────┐   ┌──────────┐   ┌─────────┐   ┌───────┐   ┌──────────┐   ┌─────────────┐   ┌─────────┐   ┌───────┐   ┌───────┐
│Preflight│ → │ enrich-us│ → │ propose │ → │ apply │ → │ commit+PR│ → │ HUMAN GATE  │ → │ archive │ → │ reset │ → │ next  │
└─────────┘   └──────────┘   └─────────┘   └───────┘   └──────────┘   │ you merge   │   └─────────┘   └───────┘   └───────┘
                                                                       │ /continue   │
                                                                       └─────────────┘
```

### Step 0 — Preflight

1. Confirm working tree is clean or stash; resume from `failed_step` when retrying.
2. `git checkout main && git pull origin main` — **always `origin`**, never `upstream`.
3. Verify `openspec list --json` works.
4. Verify Atlassian MCP (`user-atlassian`) for Jira.
5. Verify `gh auth status` and `gh repo view CeliaMerino/AI4Devs-finalproject`.
6. Mark ticket `in_progress` in state file.

### Step 1 — enrich-us

**Skill:** `enrich-us` (Jira mode)

1. Fetch `KAN-XX` via Atlassian MCP (`jira_get_issue`).
2. Produce `## Original` and `## Enhanced` per enrich-us rules.
3. Save to `openspec/changes/.drafts/KAN-XX-enhanced.md`.
4. Optional Jira write-back.

**Pause if:** Jira fetch fails or story lacks detail for OpenSpec.

### Step 2 — openspec-propose

**Skill:** `openspec-propose`

1. Derive change name from `change_name_pattern` (slug from Jira summary, English, kebab-case).
2. Create branch from updated `main`:
   ```bash
   git checkout -b feature/KAN-XX-<slug>
   ```
3. Run full openspec-propose using the enhanced story.
4. Record `change_name` and `branch` in state.

**Pause if:** Change name collision — ask continue / rename / abort.

### Step 3 — openspec-apply-change

**Skill:** `openspec-apply-change`

1. `openspec instructions apply --change "<name>" --json`
2. Read all `contextFiles`; implement every pending task; mark `- [x]` after each.
3. Run verification when tasks require tests.
4. Do **not** commit yet.

**Pause if:** Blocked artifacts, failing tests, or ambiguous requirements.

### Step 4 — commit + open PR (no merge)

**Skill:** `commit` (PR only — **do not merge**)

1. Stage and commit all ticket-scoped changes on the feature branch.
2. Push to **`origin`**:
   ```bash
   git push -u origin HEAD
   ```
3. Create PR **on the fork only**:
   ```bash
   gh pr create \
     --repo CeliaMerino/AI4Devs-finalproject \
     --base main \
     --head <branch> \
     --title "[KAN-XX] <short summary>" \
     --body "<see PR body template below>"
   ```
4. **PR body** must include:
   - Link to Jira ticket
   - OpenSpec change path
   - Summary of changes
   - Test plan checklist
5. Record `pr_url`, `pr_number` in state.
6. Set ticket status to **`awaiting_merge`**.

**Do NOT run** `gh pr merge`, `gh pr merge --auto`, or `--auto` merge. The user merges manually on GitHub.

### Step 5 — Human merge gate (mandatory stop)

**Stop the pipeline** and report clearly:

```markdown
## KAN-XX — ready for your review

**PR:** <pr_url>
**Branch:** feature/KAN-XX-<slug>

Please review and merge the PR on GitHub when satisfied.
Then run: **`/kan-pipeline continue`** (or `/kan-pipeline continue KAN-XX`)
```

Do not proceed to archive or the next ticket until the user explicitly continues.

### Step 6 — continue (after user merged)

Triggered by `/kan-pipeline continue` or `/kan-pipeline continue KAN-XX`.

1. Verify PR is **merged** on the fork:
   ```bash
   gh pr view <number> --repo CeliaMerino/AI4Devs-finalproject --json state,mergedAt
   ```
   If still `OPEN`, stop and remind the user to merge first.
2. `git checkout main && git pull origin main`
3. Confirm merged commits are on local `main`.
4. Proceed to Step 7 (archive).

**Pause if:** PR not merged, or local `main` does not include the merge.

### Step 7 — openspec-archive-change

**Skill:** `openspec-archive-change`

1. Delta spec sync assessment (sync when delta specs exist — default **sync now**).
2. Archive change to `openspec/changes/archive/YYYY-MM-DD-<name>/`.
3. Mark ticket `done`; set `archived_at`.

### Step 8 — Reset for next ticket

```bash
git checkout main
git pull origin main
```

Delete local feature branch if it still exists:

```bash
git branch -d feature/KAN-XX-<slug>  # or -D if needed after merge
```

If running full queue (`/kan-pipeline` without `next`), proceed to the next pending ticket from step 0. If `next` mode, stop here.

## Branch policy

| When | Branch |
|------|--------|
| Step 2 start | `feature/KAN-XX-<slug>` from `origin/main` |
| Steps 3–4 | Stay on feature branch |
| Step 6+ | `main` on fork |

Never implement two queue tickets on the same branch.

## Multi-ticket / queue modes

| Mode | Command | Behavior |
|------|---------|----------|
| Full queue | `/kan-pipeline` | Run until human gate or queue empty; after each `continue`, may auto-start next ticket |
| One ticket | `/kan-pipeline next` | Steps 0–5 then stop at human gate |
| After merge | `/kan-pipeline continue` | Steps 6–8 for ticket in `awaiting_merge` |
| Single ticket | `/kan-pipeline KAN-35` | Full cycle for one ticket (still stops at gate) |
| Resume failed | `/kan-pipeline` | Retry from `failed_step` |
| Status | `/kan-pipeline status` | Table of phases and ticket states |

## Error handling

On failure before the human gate:

1. Mark ticket `failed` with `error` and `failed_step`.
2. **Stop the queue.**
3. Resume with `/kan-pipeline` from `failed_step`.

Tickets in `awaiting_merge` are not failures — they wait for `/kan-pipeline continue`.

## Output format (after continue completes)

```markdown
## KAN-XX — <summary> ✓

| Step | Status | Notes |
|------|--------|-------|
| enrich-us | ✓ | openspec/changes/.drafts/KAN-XX-enhanced.md |
| propose | ✓ | change: kan-xx-slug |
| apply | ✓ | 12/12 tasks |
| commit + PR | ✓ | https://github.com/CeliaMerino/AI4Devs-finalproject/pull/N |
| human merge | ✓ | merged by user |
| archive | ✓ | openspec/changes/archive/2026-07-01-kan-xx-slug/ |

**Next:** KAN-YY — run `/kan-pipeline next` or `/kan-pipeline continue` if queue mode
```

## Guardrails

- **Fork only:** never `gh pr create` without `--repo CeliaMerino/AI4Devs-finalproject`; never target `upstream` / LIDR-academy.
- **No auto-merge:** never run `gh pr merge` unless the user explicitly asks outside the pipeline.
- **Human gate:** always stop after PR creation; require `/kan-pipeline continue` before archive.
- **One ticket at a time** through implementation; next ticket only after archive + reset.
- **English** for commits, PRs, OpenSpec artifacts, and code.
- **No force-push** to `main`.
- **Sync delta specs** before archive when they exist.

## Related skills & commands

| Step | Skill / command |
|------|-----------------|
| 1 | `enrich-us` |
| 2 | `openspec-propose`, `/opsx-propose` |
| 3 | `openspec-apply-change`, `/opsx-apply` |
| 4 | `commit` (PR only, fork repo flag) |
| 5 | *(user action on GitHub)* |
| 6–7 | `openspec-archive-change`, `/opsx-archive` |
| Resume | `/kan-pipeline continue` |

## Continuous processing

Do **not** use `/loop` to auto-merge. Loop is only useful **after** the user merges and runs `continue`, or for status checks while waiting.
