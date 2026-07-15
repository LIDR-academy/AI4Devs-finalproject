---
name: pick-story
description: 'Pick a story from the sprint backlog and drive it to completion: creates the story file (if backlog), runs advanced elicitation, branches, implements, reviews, pushes, and opens a PR. Use when the user says "pick story [story-id]" or "work on story [story-id]".'
---

# Pick Story

Orchestrates the full lifecycle of a single story — from backlog to an open pull request — using
the sprint status YAML as the single source of truth.

---

## CRITICAL LLM INSTRUCTIONS

- **MANDATORY:** Execute ALL steps in the applicable flow IN EXACT ORDER
- DO NOT skip steps or change the sequence
- HALT at each user-interaction checkpoint and await response before continuing
- **Sync `main` (Step 0.5) before routing or branching** — a stale local `main` misroutes stories
  and branches work off an outdated base
- The sprint status file is the source of truth for story status
- Always update sprint-status.yaml after status transitions
- **B4, C2, and C3 run via delegated `Agent` subagents, not inline.** These are the most
  context-heavy phases (TDD churn, full diffs, CI logs). Spawn the subagent as instructed, wait
  for its report, and relay only that report — do not redo its work inline in this session.
- **A0 checks the previous epic's retro status before starting a new epic's first story.** This is
  a warn-and-confirm gate, not a silent skip — do not bypass it just because the story ID was
  explicitly requested by the user.

---

## FLOW

### Step 0: Verify BMAD Is Installed

This skill is installed globally and may be invoked in any project, but it orchestrates BMAD
skills (`/bmad-create-story`, `/bmad-advanced-elicitation`, `/bmad-dev-story`, `/bmad-code-review`)
and depends entirely on BMAD's on-disk conventions (`_bmad-output/implementation-artifacts/sprint-status.yaml`).
It cannot function in a project that hasn't installed BMAD.

**Action:** Check whether `_bmad/_config/manifest.yaml` exists in the current project root.

- **Found:** BMAD is installed. Continue to Step 1.
- **Not found:** HALT immediately. Tell the user:
  > This project doesn't have BMAD installed (no `_bmad/_config/manifest.yaml` found). `pick-story`
  > depends on BMAD's skills and sprint-status.yaml conventions and can't run without it. Run
  > `/bmad-init` to install BMAD here, or switch to a project that already has it.

Do not proceed to Step 1 without a confirmed BMAD installation.

### Step 0.5: Sync the Main Branch

All routing and branching in this skill assume `main` is current: Step 1 reads `sprint-status.yaml`
from the checked-out `main`, and every feature worktree is branched off `origin/main` (B2, C0). If
the local `main` is behind the remote, the skill can misroute (e.g. treat a story as `backlog` that
someone already advanced upstream) or branch new work off a stale base. Refresh before doing
anything else.

**Action:**

1. Confirm the session is on the `main` branch (`git rev-parse --abbrev-ref HEAD`). If it is on a
   different branch, note the current branch, and treat that as the base only if the user explicitly
   intended it — otherwise switch to `main` first.
2. Check for a clean working tree (`git status --porcelain`). **If there are uncommitted changes,
   HALT and report them** — do not stash, discard, or force anything. Ask the user to commit, stash,
   or confirm before continuing (a mid-flight story file or edited `sprint-status.yaml` lives here).
3. With a clean tree on `main`, fetch and fast-forward:
   ```bash
   git fetch origin
   git pull --ff-only origin main
   ```
   `--ff-only` guarantees no surprise merge commit — it either fast-forwards cleanly or fails,
   surfacing a real divergence for the user to resolve rather than silently merging.
4. If the fast-forward fails (local `main` has diverged from `origin/main`), HALT and report the
   divergence; let the user reconcile before the skill continues.

After this step, both the `sprint-status.yaml` read (Step 1) and every `origin/main`-based worktree
(B2, C0) start from the latest remote state.

### Step 1: Identify the Story

**Action:** Read the sprint status file at `_bmad-output/implementation-artifacts/sprint-status.yaml`

Parse the user's requested story ID (e.g. `2-2`, `3-1`, `4-4`). Match it against the keys in
`development_status`. Normalize the key: strip leading zeroes from the second segment if needed
(e.g. `2-02` → `2-2`), and match the full slug (e.g. `2-2-credential-storage-and-retrieval-with-version-history`).

**Determine current status:**

| Status | Next Step |
|---|---|
| `backlog` | → Go to **Path A: Create Story** |
| `ready-for-dev` | → Go to **Path B: Implement Story** |
| `in-progress` | → Go to **Path B: Implement Story** (resume) |
| `review` | → Go to **Path C: Post-Implementation** |
| `done` | → Report story is already complete. Halt. |

If the story ID is not found, list all story IDs and statuses and ask the user to pick one.

---

## Path A: Create Story (Status = `backlog`)

### A0: Check Previous Epic's Retrospective (new-epic guard)

Only applies when the requested story is the **first story of a new epic** — i.e. its epic number
`N` has no `in-progress` or `done` stories yet anywhere in `sprint-status.yaml`. Skip this step
entirely for any story in an epic that's already underway.

**Why:** this project's retros have flagged the same failure three times running (P6-2, P7-2, P8-3)
— a new epic's stories start before the previous epic's retrospective runs, so whatever that retro
would have caught arrives too late to help. `my-epic-retro` can only detect the recurrence after the
fact; this step is the only place that can stop it before it happens again.

**Action:**
1. Look up `epic-{{N-1}}-retrospective` in `sprint-status.yaml`.
2. If it's `done`, continue to A1 — no action needed.
3. If it's `optional` (or missing) and epic `N-1` has any `done` stories, HALT and tell the user:
   > Epic {{N-1}}'s retrospective hasn't run yet (`epic-{{N-1}}-retrospective: optional`). Starting
   > Epic {{N}}'s first story now is the exact pattern flagged three times running in this project's
   > retros (P6-2, P7-2, P8-3) — the previous epic's lessons arrive too late to help once the next
   > epic is already moving. Run `my-epic-retro` for Epic {{N-1}} first, or confirm you want to
   > proceed anyway.
4. If the user confirms proceeding anyway, continue to A1 — this is a warning, not a hard block.

### A1: Invoke Story Creation

Invoke the `/bmad-create-story` skill for the requested story ID.

**Important guidance to carry into `/bmad-create-story`:**

- Add extensive, detailed examples for every acceptance criterion
- Every AC must have at least one concrete positive example (happy path) AND one or more edge/failure cases
- Include explicit test scenarios for: RLS/tenant isolation, audit behaviour, auth/session lifecycle, concurrent access, rate limits, migration compatibility, and operational logging — wherever relevant to this story
- Cross-reference the PRD, epics file, architecture doc, and any prior stories that this one depends on or affects
- Make the story self-contained: a developer starting cold should be able to implement it without reading anything else

**After `/bmad-create-story` completes:**

Confirm the story file exists at:
`_bmad-output/implementation-artifacts/<story-slug>.md`

### A2: Advanced Elicitation — 5 Rounds

Invoke `/bmad-advanced-elicitation` against the newly created story file. You must complete
**exactly 5 elicitation method applications** and accept / integrate the suggestions from each
into the story document before proceeding.

**Protocol:**
1. Present the 5-method menu from `/bmad-advanced-elicitation`
2. Select or let the user select each method
3. Apply the method to the story content
4. Accept and integrate improvements into the story file (do not discard)
5. Repeat until 5 distinct methods have been applied
6. Send `x` to proceed and exit elicitation

After all 5 rounds, verify the story file has been updated with the integrated improvements.

### A3: Update Sprint Status

Update `_bmad-output/implementation-artifacts/sprint-status.yaml`:

- Change the story status from `backlog` → `ready-for-dev`
- Update `last_updated` to today's date
- Add a comment describing the update (e.g. `# updated: 2-X -> ready-for-dev`)

**HALT:** Inform the user the story is now ready for dev. Ask if they want to proceed immediately
to implementation or stop here.

If the user wants to proceed → continue to **Path B**.
If the user wants to stop → end the skill.

---

## Path B: Implement Story (Status = `ready-for-dev` or `in-progress`)

### B1: Locate the Story File

Confirm the story file exists at:
`_bmad-output/implementation-artifacts/<story-slug>.md`

If it does not exist, report the error and halt. The story must be in `ready-for-dev` state with
a corresponding file before implementation can begin.

### B2: Create Feature Worktree

Determine the branch/worktree name from the story slug:
`feature/<story-slug>`

Example: `feature/2-2-credential-storage-and-retrieval-with-version-history`

Work happens in an isolated git worktree, not the main checkout, so the story can be implemented
without disturbing whatever the user has checked out elsewhere.

**New story (first time working on it):**

Use the `EnterWorktree` tool with `name: feature/<story-slug>`. This creates a worktree under
`.claude/worktrees/feature/<story-slug>` on a fresh branch off `origin/main` and switches the
session into it. `origin/main` was refreshed in Step 0.5, so this branches off an up-to-date base —
if this session has been running long enough that upstream may have moved again, re-run the
`git fetch origin` from Step 0.5 before creating the worktree. All subsequent steps (B3 onward) run
from inside this worktree.

**Resuming (story already `in-progress`, worktree may already exist):**

1. Run `git worktree list` and check for a path matching `feature/<story-slug>`.
2. If found: call `EnterWorktree` with `path: <that path>` to reattach.
3. If not found (worktree was removed but the branch survives locally or on the remote): run
   `git worktree add .claude/worktrees/feature/<story-slug> feature/<story-slug>` manually, then
   call `EnterWorktree` with `path: .claude/worktrees/feature/<story-slug>` to attach the session
   to it.

### B3: Update Story Status to In-Progress

Update `_bmad-output/implementation-artifacts/sprint-status.yaml`:
- Change status from `ready-for-dev` → `in-progress`
- Update `last_updated` to today's date

Commit this status update:
```bash
git add _bmad-output/implementation-artifacts/sprint-status.yaml
git commit -m "chore(sprint): mark <story-id> as in-progress"
```

### B4: Invoke Dev Story (delegated to a subagent)

Implementation is the most context-heavy phase — full TDD cycles across every AC, test output,
iterative edits. Run it in an isolated `Agent` subagent so none of that churn lands in this
session's context; only a short report comes back.

Note the absolute worktree path from B2 (e.g. `<repo-root>/.claude/worktrees/feature/<story-slug>`)
before spawning the agent — it starts with no memory of this session and needs the path spelled
out explicitly.

Spawn a foreground `Agent` (`subagent_type: general-purpose`) with a self-contained prompt covering:
- The absolute worktree path, with an instruction that every Bash command must run from there
  (e.g. prefix with `cd <path> &&`) and every Read/Edit/Write path must be absolute or resolved
  against it — the agent does not inherit this session's cwd.
- The absolute path to the story file: `_bmad-output/implementation-artifacts/<story-slug>.md`
- The task: invoke the `/bmad-dev-story` skill against that story file, following TDD red-green as
  required by AGENTS.md — write/update tests first and confirm they fail for the expected reason,
  implement the minimum code to make them pass, re-run focused tests until green.
  `/bmad-dev-story` updates the story file and flips `sprint-status.yaml` to `review` on completion
  itself — the agent does not need a separate instruction to do that.
- What to report back (keep it under ~300 words): files changed, a one-line summary per acceptance
  criterion of what was implemented, final test run status, and any blockers or ACs left incomplete.

Wait for the agent's report. Do not implement inline in this session.

### B5: HALT — Implementation Complete

Relay the agent's report to the user. Note that `/bmad-dev-story` has already moved the story to
`review` in `sprint-status.yaml`, so the story is safe to pick back up at any time.

Ask the user how to proceed:
1. **Continue now** → go to **Path C** in this same session.
2. **Continue later** → end this skill invocation here. Since status is already `review`, a fresh
   `pick-story <story-id>` invocation in a new session will route straight to Path C (via Step 1's
   routing table) with a clean context for review/CI/PR.

---

## Path C: Post-Implementation (Status = `review`)

### C0: Ensure Worktree Context

Path C can be entered directly from Step 1 (story was already `review` from a prior session),
without this session ever running B2. Step 0.5 already refreshed `main`, so the existing feature
branch and any `git worktree add` below start from a current base. Before doing anything else:

1. Run `git worktree list` and check for a path matching `feature/<story-slug>`.
2. If found and this session is not already there: call `EnterWorktree` with `path: <that path>`.
3. If not found: run `git worktree add .claude/worktrees/feature/<story-slug> feature/<story-slug>`
   (branch already exists since the story reached `review`), then call `EnterWorktree` with
   `path: .claude/worktrees/feature/<story-slug>`.
4. If already attached to the correct worktree (came straight from B4 in this same session), skip.

### C1: Commit Implementation

Stage all changed files and commit:
```bash
git add -p   # review staged changes
git commit -m "feat(<scope>): <short description of story implementation>

Co-Authored-By: Claude Sonnet 4.6 <noreply@anthropic.com>"
```

Do **not** push at this step.

### C2: Code Review (delegated to a subagent)

Code review reads the full diff and runs three adversarial passes over it — delegate it so the
findings and any intermediate fix attempts don't pile into this session's context.

Spawn a foreground `Agent` (`subagent_type: general-purpose`) with a self-contained prompt covering:
- The absolute worktree path (from B2/C0), with the same cwd/path-resolution instructions as B4.
- The absolute path to the story file, for cross-referencing acceptance criteria.
- The task: invoke `/bmad-code-review` for the current branch diff, covering all three layers —
  **Blind Hunter** (correctness/security bugs), **Edge Case Hunter** (boundary conditions,
  unhandled paths), **Acceptance Auditor** (does the diff satisfy every AC in the story file).
  Apply fixes for any **critical** or **high** severity finding. If fixes are applied, commit them:
  `git commit -m "fix(<scope>): address code review findings for <story-id>"`.
- What to report back: every finding with its severity, which were fixed (with the commit SHA),
  and which were left unfixed and why (e.g. low/medium severity, or a critical issue that couldn't
  be safely resolved without user input).

If the agent reports a critical/high finding it could not fix, HALT and ask the user for guidance
before continuing to C3. Otherwise continue.

### C3: CI Gate (delegated to a subagent)

CI failures produce the noisiest output of any phase — full build/lint/test logs across retries.
Delegate the fix loop so only the outcome comes back.

Spawn a foreground `Agent` (`subagent_type: general-purpose`) with a self-contained prompt covering:
- The absolute worktree path, with the same cwd/path-resolution instructions as B4.
- The task: run `make ci`. If it fails, read the error output, fix the root cause (never suppress
  or skip a check), and re-run — up to 3 attempts. Commit any fixes:
  `git commit -m "fix(<scope>): fix CI failures for <story-id>"`.
- What to report back: final status (pass/fail), number of attempts, commit SHAs for any fixes,
  and — only if still failing after 3 attempts — the exact failing output verbatim so it can be
  shown to the user.

**Do not proceed to C4 until the agent reports `make ci` passing.** If it reports failure after 3
attempts, HALT per the Error Handling table below and relay the verbatim failure output to the user.

### C4: Update Sprint Status to Done

Update `_bmad-output/implementation-artifacts/sprint-status.yaml`:
- Change status from `in-progress` → `done` (or `review` → `done`)
- Update `last_updated` to today's date
- Add a comment describing the update

Commit:
```bash
git add _bmad-output/implementation-artifacts/sprint-status.yaml
git commit -m "chore(sprint): mark <story-id> as done"
```

### C5: Push Branch

Push the feature branch to the remote:
```bash
git push -u origin feature/<story-slug>
```

### C6: Create Pull Request

Open a PR against `main` with `gh pr create`:
```bash
gh pr create --title "<type>(<scope>): <short description of story implementation>" --body "$(cat <<'EOF'
## Summary
<1-3 bullet points summarizing what the story implemented>

## Test plan
<checklist of what was validated: typecheck, lint, jscpd, test suites, CI guards, spec drift>

## Next
<e.g. "SM to set epic-N: done in sprint-status.yaml after this merges">

🤖 Generated with [Claude Code](https://claude.com/claude-code)
EOF
)"
```

If any code review findings were fixed, mention them in the summary. Capture the returned PR URL.

### C7: Exit the Worktree

Call `ExitWorktree` with `action: "keep"` to return the session to the original directory while
leaving the worktree and branch on disk — the branch is already pushed, but keeping the worktree
lets follow-up commits (e.g. review feedback) land without re-cloning or re-checking-out.

Only call `ExitWorktree` if this session entered the worktree via `EnterWorktree` in B2 (it is a
no-op otherwise). Mention to the user that the worktree can be removed later with `ExitWorktree
(action: "remove")` or `git worktree remove` once the PR merges.

**HALT:** Report completion to the user:
- Story ID and slug
- Branch name pushed
- PR URL
- Worktree path (and that it's kept, not removed)
- Summary of what was implemented
- Whether any code review issues were found and fixed
- CI status (pass)
- Suggest next steps: merge the PR, pick the next story

---

## Error Handling

| Situation | Action |
|---|---|
| Uncommitted changes on `main` at Step 0.5 | Halt, report the dirty files; ask the user to commit/stash/confirm — never stash or discard automatically |
| `git pull --ff-only` fails at Step 0.5 (local `main` diverged from `origin/main`) | Halt, report the divergence; let the user reconcile before continuing |
| Story file missing for `ready-for-dev` story | Halt, report error, suggest running `/bmad-create-story` first |
| C3 subagent reports `make ci` still failing after 3 attempts | Halt, report the specific failure (verbatim from the subagent), ask user for guidance |
| Merge conflict on branch creation | Resolve conflicts manually, then continue from B3 |
| C2 subagent reports an unfixed critical/high finding | Halt before C3 — never ship known critical bugs on the say-so of an incomplete fix |
| Story status is `done` | Report it, list the next `ready-for-dev` or `backlog` story as a suggestion |
| `EnterWorktree` fails (already in a worktree session) | Call `ExitWorktree (action: "keep")` first, then retry B2 |
| Worktree exists but is dirty/conflicting on resume | Report the conflicting state to the user before reattaching — do not discard their in-progress changes |

---

## Quick Reference

```
Sync main first:     git fetch origin && git pull --ff-only origin main   (Step 0.5)
BMAD marker:         _bmad/_config/manifest.yaml
Sprint status file:  _bmad-output/implementation-artifacts/sprint-status.yaml
Story files:         _bmad-output/implementation-artifacts/<story-slug>.md
Branch convention:   feature/<story-slug>
Worktree path:       .claude/worktrees/feature/<story-slug>
CI command:          make ci
```
