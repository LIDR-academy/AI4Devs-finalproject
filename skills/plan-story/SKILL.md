---
name: plan-story
description: 'Create a detailed story from the sprint backlog and adversarially review it for inconsistencies, gaps, technical debt, and security risks, isolated in its own git worktree, leaving it committed and ready to merge — without implementing anything. Use when the user says "plan story", "plan the next story", or "plan story [story-id]".'
---

# Plan Story

Orchestrates the **planning** phase of a single story — from backlog to a reviewed,
`ready-for-dev` story file, committed in an isolated worktree — using two isolated `Agent`
subagents so story-creation churn and adversarial-review findings never bloat this session's
context.

This skill stops once the story and its review are **committed on a local `plan/<story_key>`
branch**. It does not implement anything, does not push, and does not open a PR — the branch sits
unmerged until the user decides to merge it. Only after that merge is the story actually visible
to other sessions and to `pick-story`'s sprint-status auto-discovery — don't tell the user it's
"ready to be worked" until that's true.

---

## CRITICAL LLM INSTRUCTIONS

- **MANDATORY:** Execute ALL steps in order.
- **Step 3 (story creation) and Step 4 (adversarial review) MUST run as separate foreground
  `Agent` subagents**, each spawned fresh — the review agent must NOT share context with the
  creation agent, so it reviews the story file cold rather than defending its own prior work.
- **All work happens inside a dedicated git worktree** entered via `EnterWorktree` in Step 2 —
  never write the story or review file directly into whatever the user has checked out in the
  main working directory.
- **Always run `git worktree list` before deciding whether to create or reattach a worktree** —
  never call `EnterWorktree(name: ...)` on the assumption that nothing exists yet.
- **Always pass the story key explicitly to `/bmad-create-story`** (Step 3) — never invoke it
  bare. A bare invocation triggers its own auto-discovery against the worktree's local copy of
  `sprint-status.yaml`, which can silently pick a different story than the one selected in Step 1.
- **Verify the Step 5 commit actually happened** (clean tree, real SHA) before exiting the
  worktree or reporting success — don't take the commit on faith.
- Do not invoke `/bmad-dev-story` or `/bmad-code-review`. Do not push or open a PR. This skill's
  job ends at a committed, reviewed story file sitting in a local worktree.
- HALT and report to the user if: BMAD isn't installed, no backlog story is found/matches, the
  worktree/branch name collides with another in-progress planning session, or the review agent
  surfaces a critical/security finding.

---

## FLOW

### Step 0: Verify BMAD Is Installed

This skill orchestrates BMAD skills (`/bmad-create-story`, `/bmad-review-adversarial-general`) and
depends on BMAD's on-disk conventions (`_bmad-output/implementation-artifacts/sprint-status.yaml`).
It cannot function in a project that hasn't installed BMAD.

**Action:** Check whether `_bmad/_config/manifest.yaml` exists in the current project root.

- **Found:** BMAD is installed. Continue to Step 1.
- **Not found:** HALT immediately. Tell the user:
  > This project doesn't have BMAD installed (no `_bmad/_config/manifest.yaml` found). `plan-story`
  > depends on BMAD's skills and sprint-status.yaml conventions and can't run without it. Run
  > `/bmad-init` to install BMAD here, or switch to a project that already has it.

Do not proceed to Step 1 without a confirmed BMAD installation.

### Step 1: Identify the Target Story

Do this from the current checkout, **before** entering any worktree — `sprint-status.yaml` needs
to reflect the shared main-branch state, not a stale copy inside an old worktree.

**If the user supplied a story id** (e.g. "plan story 4-2"): normalize it (strip leading zeroes,
e.g. `4-02` → `4-2`) and look it up in `_bmad-output/implementation-artifacts/sprint-status.yaml`
under `development_status`, matching the full slug key (e.g.
`4-2-organization-user-management`).

- If the key's status is **not** `backlog`, HALT. Report the current status and tell the user
  `plan-story` only plans backlog stories — if it's already `ready-for-dev` or further along, use
  `pick-story <id>` instead.
- If the id isn't found at all, list nearby/similar keys and ask the user to confirm. **Once the
  user confirms, re-derive `story_id`/`story_key` strictly from the matched
  `sprint-status.yaml` key itself** — never adopt the user's free-form text directly as
  `story_key`. This key is about to flow into a branch name, a worktree path, and git commands;
  it must come from a value that's actually present in the YAML, not from unvalidated input.

**If no id was supplied:** read `sprint-status.yaml` in full, top to bottom, and take the FIRST
key matching `<epic>-<num>-<slug>` (skip `epic-N` and `epic-N-retrospective` keys) whose value is
exactly `backlog`.

- If no backlog story exists anywhere in the file, HALT and report: "No backlog stories found —
  all stories are ready-for-dev, in-progress, review, or done." Suggest `bmad-sprint-planning` if
  more work needs to be queued.

**Record** before continuing: `story_id` (e.g. `4-2`), `story_key` (e.g.
`4-2-organization-user-management`), expected story file path
`_bmad-output/implementation-artifacts/<story_key>.md`.

Tell the user which story was selected and continue.

### Step 2: Sync and Enter a Planning Worktree

All planning artifacts get created in an isolated worktree, not the main checkout — this keeps
the user's current working directory untouched and gives the story + review their own
reviewable branch.

**2a. Sync before branching.** Run `git fetch origin`. `EnterWorktree` branches off
`origin/<default-branch>` by default — if origin is stale relative to what Step 1 just read
locally (or vice versa), the worktree's copy of `sprint-status.yaml` can disagree with the one
Step 1 inspected. Fetching first minimizes that gap; it does not eliminate it, so Step 3 still
passes the story key explicitly rather than trusting auto-discovery inside the worktree.

Note: this flow assumes the default `worktree.baseRef: fresh` behavior (branch off
`origin/<default-branch>`). If this project's Claude Code settings override `worktree.baseRef` to
`head`, the worktree will instead branch off local HEAD — if you're not sure, check
`.claude/settings.json` / `.claude/settings.local.json` for a `worktree.baseRef` key before
assuming origin-freshness is what matters here.

**2b. Decide new vs. resume vs. orphaned vs. collision — always check `git worktree list` first:**

Run `git worktree list` and look for a path matching `plan/<story_key>`.

- **Found in the list (resume):** Call `EnterWorktree(path: <that path>)` to reattach. Then check
  whether `_bmad-output/implementation-artifacts/<story_key>.md` already exists in the worktree:
  - **It exists** — HALT and ask the user how to proceed: (a) reuse the existing story file and
    skip directly to Step 4 (review), (b) delete it and regenerate via Step 3, or (c) abort. Never
    silently overwrite or silently reuse — a resumed worktree may hold work the user still wants.
  - **It doesn't exist** — continue normally to Step 3.
- **Not in the list, but the branch exists (orphaned worktree):** Check
  `git branch --list plan/<story_key>` and `git branch -r --list origin/plan/<story_key>`. If
  either finds the branch, the worktree was likely removed manually while the branch survived.
  Run `git worktree add .claude/worktrees/plan/<story_key> plan/<story_key>` to recreate the
  worktree from the existing branch, then `EnterWorktree(path: .claude/worktrees/plan/<story_key>)`
  to attach. Then apply the same existing-file check as the resume case above.
- **Neither exists (brand new):** Call `EnterWorktree(name: "plan/<story_key>")`. This creates a
  worktree under `.claude/worktrees/plan/<story_key>` on a fresh branch and switches the session
  into it.
- **`EnterWorktree`/`git worktree add` fails with a naming collision not explained by the cases
  above** (e.g. another session created the same branch moments ago): HALT. Report the collision
  to the user — do not force-delete or override another in-progress planning session for the same
  story.
- **If `EnterWorktree` fails because this session is already inside a different worktree:** call
  `ExitWorktree(action: "keep")` first, then retry from 2b.

If the resulting worktree name would exceed the tool's 64-character limit, truncate the slug
portion (keep `plan/<epic>-<num>-` intact, cut from the end of the descriptive slug) and note the
shortened name when reporting to the user in Step 7.

**2c. Record the real path.** Once attached, run `pwd` and use that literal output as the
absolute worktree path in every subagent prompt below — don't assume or reconstruct the path;
confirm it. Subagents don't inherit this session's cwd, so this path must be spelled out
explicitly in their prompts.

### Step 3: Create the Story (delegated to a subagent)

Skip this step entirely if Step 2b's resume/orphan check already found an existing story file and
the user chose to reuse it — go directly to Step 4 in that case.

Story creation is context-heavy — it reads the PRD, epics file, architecture doc, prior stories,
and does web research. Run it in an isolated `Agent` subagent so none of that churn lands in this
session.

Spawn a foreground `Agent` (`subagent_type: general-purpose`) with a self-contained prompt
covering:

- The absolute worktree path from Step 2c, with an instruction that every Bash command must run
  from there (e.g. prefix with `cd <path> &&`) and every Read/Edit/Write path must be absolute or
  resolved against it — the agent does not inherit this session's cwd or worktree.
- The target story: `story_id` and `story_key` from Step 1.
- The task: invoke `/bmad-create-story <story_key>`, passing the full story key explicitly as its
  argument (e.g. `/bmad-create-story 4-2-organization-user-management`). **Do not invoke it
  bare.** A bare invocation triggers `/bmad-create-story`'s own auto-discovery against the
  worktree's local `sprint-status.yaml`, which — per Step 2a — may not agree with the story Step 1
  selected. Passing the key explicitly removes that ambiguity.
- **Guidance to carry into `/bmad-create-story`** (pass this verbatim into the subagent's prompt):
  - Add extensive, detailed examples for every acceptance criterion.
  - Every AC must have at least one concrete positive example (happy path) AND one or more
    edge/failure-case examples.
  - Write many acceptance criteria — err on the side of more, smaller, precisely-scoped ACs over
    a few broad ones. Cover: the happy path, validation/error handling, authz/RLS or tenant
    isolation where relevant, concurrency/race conditions where relevant, audit/logging where
    relevant, and any migration or backward-compatibility concerns.
  - Cross-reference the PRD, epics file, architecture doc, and any prior stories this one depends
    on or affects.
  - Make the story self-contained: a developer starting cold should be able to implement it
    without reading anything else.
- What to report back (under 300 words): confirmed story file path, final AC count, one line per
  AC group summarizing what it covers, any open questions the creation process raised, and
  confirmation that `sprint-status.yaml` (inside the worktree) now shows this story as
  `ready-for-dev`.

Wait for the agent's report. Do not create the story inline in this session.

**After the agent reports:** confirm the story file exists at
`<worktree>/_bmad-output/implementation-artifacts/<story_key>.md`. If it doesn't, halt and relay
the agent's report verbatim to the user — do not proceed to Step 4 against a missing file.

### Step 4: Adversarial Review (delegated to a separate, fresh subagent)

This MUST be a **new** subagent invocation with no memory of Step 3 — it needs to read the story
file cold, the same way a skeptical human reviewer would, not defend the work it just wrote.

Spawn a second foreground `Agent` (`subagent_type: general-purpose`) with a self-contained prompt
covering:

- The absolute worktree path from Step 2c, with the same cwd/path-resolution instructions as
  Step 3.
- The absolute path to the story file, inside that worktree.
- The task: read the story file in full, then invoke the `/bmad-review-adversarial-general` skill
  against its content, with `also_consider` set to:
  > inconsistencies and contradictions between sections of this story; gaps in acceptance
  > criteria or missing edge cases; technical debt implied by the proposed approach;
  > implementation and delivery risks; and security risks — authn/authz, RLS/tenant isolation,
  > secrets handling, injection, input validation, audit/logging gaps — wherever applicable to
  > this story.
- `/bmad-review-adversarial-general` requires at least 10 findings and halts if it finds zero —
  that halt condition applies here too. If the reviewing agent reports zero findings, it must
  re-analyze more skeptically rather than declare the story clean.
- After producing findings, write them to a sibling file inside the worktree:
  `_bmad-output/implementation-artifacts/<story_key>-adversarial-review.md`, with a header (date,
  reviewed file path, reviewer = bmad-review-adversarial-general) followed by the findings as a
  markdown list. Tag each finding with a severity: `critical`, `high`, `medium`, or `low`.
- Do NOT edit the story file itself — the review is a separate artifact, not a rewrite.
- What to report back (under 300 words): total finding count, the full text of every
  `critical`/`high` finding (verbatim, not summarized), and the path to the review file.

Wait for the agent's report.

### Step 5: Commit the Planning Artifacts

Back in this session — still attached to the worktree from Step 2 (no `cd` needed; `EnterWorktree`
already moved this session's cwd there) — stage and commit the story file, the review file, and
the `sprint-status.yaml` update together.

By this point all three paths are guaranteed to exist: Step 3 already halted if the story file was
missing, Step 4 always writes the review file (or the flow already halted before here), and
`sprint-status.yaml` is a pre-existing tracked file regardless of whether its content changed. So
`git add` on all three is always safe — no conditional subset logic needed:

```bash
git add _bmad-output/implementation-artifacts/<story_key>.md \
        _bmad-output/implementation-artifacts/<story_key>-adversarial-review.md \
        _bmad-output/implementation-artifacts/sprint-status.yaml
git commit -m "docs(story): create and adversarially review <story_id>"
```

**Verify before moving on** — do not assume the commit succeeded:

```bash
git status --porcelain
git log -1 --format='%H %s'
```

- If `git status --porcelain` is non-empty (something didn't get staged/committed), or the commit
  command reported "nothing to commit," **HALT** — do not proceed to Step 6, and do not claim
  success in Step 7. Report the discrepancy to the user instead.
- Otherwise, record the commit SHA from `git log -1` for the Step 7 report.

### Step 6: Exit the Worktree

Call `ExitWorktree` with `action: "keep"` — the branch is unpushed and unmerged, so removing it
would lose the work. This returns the session to the original directory while leaving the
worktree and branch on disk.

### Step 7: Inform the User

Relay a combined summary:

- Story id, story key, and story file path (inside the worktree).
- Worktree path, branch name (`plan/<story_key>`), and the commit SHA from Step 5 — and that the
  branch is local-only: not pushed, no PR opened.
- Adversarial review file path and total finding count.
- Every `critical`/`high` finding, listed inline (not just referenced) — these need eyes before
  anyone starts implementation.
- Confirm `sprint-status.yaml` shows the story as `ready-for-dev` **inside the worktree** — note
  explicitly that this hasn't landed on the main branch yet.
- **Next steps, stated plainly and without overstating readiness:** merge `plan/<story_key>` into
  the main branch (or push it and open a PR, if the user prefers review before merge) so the story
  becomes visible to other sessions and to `pick-story`'s sprint-status auto-discovery. The story
  is committed and reviewed now, but it is **not yet "ready to be worked" until that merge
  happens** — say that explicitly rather than implying it's immediately actionable. If any
  critical/high findings exist, recommend resolving or consciously accepting them before merging.
- Once merged, the worktree is no longer needed: remove it from a session attached to it via
  `ExitWorktree(action: "remove")`, or manually with
  `git worktree remove .claude/worktrees/plan/<story_key>` followed by
  `git branch -d plan/<story_key>`. Mention this so `plan/*` worktrees don't accumulate indefinitely.

---

## Error Handling

| Situation | Action |
|---|---|
| BMAD not installed | Halt at Step 0, tell user to run `/bmad-init` |
| No backlog story found (auto-discover) | Halt, report, suggest `bmad-sprint-planning` |
| User-specified story id is not `backlog` status | Halt, report current status, suggest `pick-story <id>` instead |
| User-specified story id not found in sprint-status.yaml | List similar keys, ask user to confirm, re-derive `story_key` from the confirmed YAML key (never from raw user text) |
| `EnterWorktree` fails (already in a different worktree session) | Call `ExitWorktree (action: "keep")` first, then retry Step 2b |
| Worktree/branch name collision with another in-progress planning session | Halt, report the collision, do not force-delete or override |
| Resumed or recovered worktree already has a story file | Halt, ask user: reuse (skip to Step 4) / regenerate (redo Step 3) / abort |
| Worktree exists but is dirty/conflicting on resume | Report the conflicting state to the user before reattaching — do not discard their in-progress changes |
| Step 3 subagent reports it could not produce a story file | Halt, relay the report verbatim, do not proceed to Step 4 |
| Step 4 subagent reports zero findings | Treat as suspicious per `bmad-review-adversarial-general`'s own halt condition — have it re-analyze before accepting |
| Step 4 subagent surfaces critical/high findings | Still report Step 7 as normal — this skill does not auto-fix findings, only surfaces them — but state clearly that these need attention before merging |
| Step 5 commit verification fails (dirty tree or "nothing to commit") | Halt before Step 6, report the discrepancy, do not claim success |

---

## Quick Reference

```
BMAD marker:          _bmad/_config/manifest.yaml
Sprint status file:   _bmad-output/implementation-artifacts/sprint-status.yaml
Story file:           _bmad-output/implementation-artifacts/<story_key>.md
Review file:          _bmad-output/implementation-artifacts/<story_key>-adversarial-review.md
Branch convention:    plan/<story_key>
Worktree path:        .claude/worktrees/plan/<story_key>
Sync before branch:   git fetch origin
Story creation skill: /bmad-create-story <story_key>   (always pass the key explicitly)
Review skill:         /bmad-review-adversarial-general
Cleanup after merge:  ExitWorktree(action:"remove")  or  git worktree remove .claude/worktrees/plan/<story_key> && git branch -d plan/<story_key>
Follow-up skill:      pick-story <story_id>  (implementation, once the plan branch is merged)
```
