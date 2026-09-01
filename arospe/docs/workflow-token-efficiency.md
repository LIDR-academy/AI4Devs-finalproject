# Token Consumption in the Three Amigos Multi-Agent Workflow — Causes and Improvements

## Why this document exists

During the Epic 5 (Internationalization) decomposition session, the user asked directly: *"why is this consuming so many tokens that they run out in minutes?"* This document is the durable answer to that question — the root causes, backed by real measurements taken during that session, and a set of concrete improvements to reduce token consumption **without lowering the quality** of the resulting task documentation.

This is a process document about *how the AI agents that build this project's `ai-spec/tasks/` documentation work*, not about the application itself. It does not belong to the `docs-maintainer` skill's code-sync scope, and its content should not be treated as authoritative about the running application.

## Table of contents

- [Root causes, with evidence](#root-causes-with-evidence)
- [Recommended improvements](#recommended-improvements)
- [What not to change](#what-not-to-change)
- [Implementation status](#implementation-status)

## Root causes, with evidence

### 1. The core reference documentation is verbose, and every line is expensive

A `wc -l` pass over the docs every Three Amigos debate was instructed to read gave:

| File | Lines |
| --- | --- |
| `docs/conventions/base-standards.md` | 419 |
| `docs/conventions/naming.md` | 350 |
| `docs/conventions/code-style.md` | 305 |
| `docs/database/schema.md` | 367 |
| `docs/database/migrations.md` | 258 |
| `docs/api/routes.md` | 248 |
| `docs/architecture/authorization.md` | 1,467 |
| `docs/errors-log.md` | 290 |
| `docs/PRD/PRD.md` | 1,615 |
| **Total** | **5,319** |

Line count understates the real cost: this project's documentation style favors long, dense paragraphs (often 100–300 words per line) accumulated over many stories' "Last updated" changelog sections, rather than short bulleted facts. The actual token cost of reading one of these files in full is several times its line count would suggest.

### 2. Already-written sibling story files are enormous, and debates were told to read them "in full"

Every Epic 5 story had to read the pre-existing Epic 2/4 story it retrofits, in full, to stay accurate against it:

| File | Lines |
| --- | --- |
| `0023-product-categories-backend.md` | 718 |
| `0024-products-core-crud-backend.md` | 1,614 |
| `0058-blog-categories-backend.md` | 1,117 |
| `0059-blog-tags-backend.md` | 1,166 |
| `0061-blog-posts-core-crud-backend.md` | 2,489 |
| **Total** | **7,104** |

### 3. Epic 5's own generated stories grew large and became required reading for later stories

Each new story had to read some or all of its already-finished siblings to inherit an established pattern rather than re-deriving it. By the seventh story, `0072-translatable-content-retrofit-blog-categories-backend.md` alone was 997 lines; the combined weight of `0066`–`0074` was already over 5,000 lines of **mandatory prior-art reading** for anything written after them.

### 4. One "debate" is really four or five agents, each paying the reading cost independently

The Three Amigos pattern dispatches a facilitator (`product-owner`) plus, per story, two or three specialists (`backend-expert`, `database-expert`, `backend-qa`). **Each of these agents starts with zero shared context and independently reads much of the same large files** — there is no cache or summary shared between sibling subagent dispatches within one debate. A single nested `backend-expert` or `database-expert` call in this session measured **400,000–600,000+ tokens** for one turn.

### 5. Resuming an agent carries its entire prior history forward

Correcting an already-finished story (a common need once cross-story inconsistencies surfaced) meant resuming its facilitator via a message, and a resumed agent keeps its **full prior conversation**, not just the new instruction. Some agents in this session were resumed four or five times as new findings emerged, and each resumption re-processed an ever-growing accumulated history on every subsequent turn.

### 6. Parallel dispatch of several heavy agents multiplies the rate hit

Running two to four of these agents concurrently (a legitimate use of the `Agent` tool's parallel dispatch for independent files) is efficient for wall-clock time, but it multiplies tokens-consumed-per-minute — which is very plausibly what the platform's rate limit is actually measuring. Several `429` rate-limit failures during this session followed exactly this pattern: multiple heavy Opus-model debates running back-to-back or concurrently.

## Recommended improvements

None of these require lowering the bar for what a finished task document contains — they target *how much has to be read to produce it*, not what gets written.

1. **Give each agent a scoped reading instruction, not "read in full."** When a debate only needs a specific fact from a sibling story (a class name, a column shape, a resolved decision), point directly at the section or heading rather than instructing "read this 1,000-line file in full." Several later prompts in this session already moved this direction (naming exact decision labels like "read 0070's D-5" instead of "read 0070"); this should be the default, not a late-session improvement.

2. **Let the facilitator distill, rather than have every specialist re-read the same sources.** Instead of dispatching `backend-expert` and `database-expert` with instructions to independently read the same five upstream files, the facilitator should read them once, extract the load-bearing facts into a short brief, and hand that brief to each specialist alongside their actual question. This turns *N agents reading M large files* into *one agent reading M files once, plus N agents reading one short brief*.

3. **Maintain a running "decision digest" per epic, not just per story.** A single, short, continuously-updated reference file (a few hundred lines, not the full prose of every finalized story) capturing only the shapes and decisions later stories must not re-derive — trait names, method signatures, the resolved cross-story questions — would let story N+1 read one digest instead of stories 1 through N in full.

4. **Prefer sequential or small-batch dispatch over maximal parallelism for heavy agents.** Parallelizing genuinely independent, disjoint-file work is still correct (per this project's own Parallel Agent File-Ownership Rule), but batching two to three at a time rather than four-plus reduces the odds of a rate-limit spike and makes it easier to feed one agent's finished output into the next rather than re-deriving it.

5. **Route mechanical, low-judgment work to a cheaper model.** Not every step in this workflow needs the same model. Verification-only passes, transcription, and translation (such as producing the Spanish version of this very document) are exactly the kind of task that does not need the model tier reserved for open-ended architectural debate — using a lighter model for those steps is a direct, safe token/cost reduction with no quality trade-off on the parts that actually require judgment.

   > ⚠️ **Confirmed live, in this exact project, while producing this document.** Attempting to route this document's own Spanish translation to the `docs-keeper` subagent (which runs on Haiku) failed twice with `"Prompt is too long"` — not because the translation task itself was large, but because `docs-keeper`'s own baked-in system context (this project's full `docs/README.md` index plus `CLAUDE.md`) already exceeds Haiku's context window on its own, before any task is added. **The lesson this adds:** routing work to a cheaper model only pays off if that agent's own fixed system-prompt overhead is small enough to leave room for the task — a specialized agent whose role requires loading a large project-wide index is a poor fit for a small-context model regardless of how mechanical its assigned task is. A lighter-weight, more generic agent (or no subagent at all, for a small enough task) is the correct choice when the specialist's own baseline context is the bottleneck.

6. **Diagnose before blindly retrying a failed agent.** Several agents in this session failed mid-debate (API connection errors, rate limits) and were retried with the exact same large prompt. A cheap diagnostic step first — did it fail before or after doing the expensive reading? — can avoid re-paying the full reading cost on a retry that only needed to redo a small last step.

7. **Keep resumed-agent correction messages terse and pointed.** When resuming an agent to apply a specific fix, state the fix and its exact location precisely (as most of this session's later correction messages already did) rather than re-supplying full background the agent already has in its own history — the agent already carries its prior context forward; repeating it in the new message doubles the cost of something already paid for once.

## What not to change

- **Do not shorten the underlying project documentation's *content*.** Its density is a deliberate, previously-established convention (see `docs/errors-log.md`'s own repeated lesson about drift and stale claims) — trimming it for token economy risks reintroducing exactly the failure modes it exists to prevent.
- **Do not split a large doc file into several smaller ones to reduce its line count.** Considered directly for `docs/architecture/authorization.md` (1,467 lines, the largest doc in the set) and rejected. Three reasons: it doesn't reduce what an agent that genuinely needs the content must read — the same words move into more files, with more per-file overhead (multiple `Read` calls, repeated headers/ToCs) instead of fewer tokens; it multiplies the "which of these N files do I open" decision an agent has to make before it can even start scoping its read; and this project's docs are heavily anchor-linked across `docs/` and `ai-spec/tasks/**` (dozens of `authorization.md#section` references alone, from `code-style.md`, `naming.md`, `security/*`, `api/routes.md`, and `errors-log.md`) — restructuring risks exactly the silent link-integrity drift `docs/errors-log.md` and [workflow.md](workflow.md#link-integrity-check-on-every-stage-move)'s stage-move rule already catalog as a real, repeated failure mode here. The actual fix for a large file is reading less of it when less is needed — an anchor-scoped read (see [contracts.md](contracts.md#token-efficient-reading-and-dispatch-rule) item 2) — not making the file physically smaller.
- **Do not skip specialist review to save tokens.** The real, substantive corrections found across this session (wrong decision citations, a genuine authorization-design defect, contradictions between sibling stories) came specifically from independent expert review actually reading the material — the fix is to make that reading cheaper and less redundant, not to do less of it.

## Implementation status

As of 2026-09-01, recommendations 1–4, 6 and 7 above are **binding process rules**, not just
recommendations — see [contracts.md](contracts.md#token-efficient-reading-and-dispatch-rule)'s
Token-Efficient Reading and Dispatch Rule, [workflow.md](workflow.md#decision-digest-per-epic)'s
new decision-digest-per-epic convention, and the [`three-amigos-debate`](../.claude/skills/three-amigos-debate/SKILL.md)
skill's `buildBrief()` step. Concretely: `product-owner`, `code-reviewer` and `appsec-auditor`
(the three agents whose own instructions previously said "read all of `docs/`") now read
`docs/README.md`'s index first and scope further reads to the task's domain; the other five
agents now trust a facilitator's brief for background instead of independently re-reading it;
`docs-keeper` now maintains an append-only per-epic digest at `./ai-spec/tasks/_digests/epic-<n>.md`;
and the skill's facilitator builds that brief once per story and dispatches participants in
twos-or-threes rather than all at once.

Recommendation 5 (route mechanical work to a cheaper model) is **not** mechanically enforced —
it remains a judgment call, deliberately, because of the confirmed caveat this document already
records: a specialized agent whose own system prompt loads a large project-wide index can exceed
a small model's context window before the task is even added. The rule as written (item 9 in the
Token-Efficient Reading and Dispatch Rule) is "check the agent's own baseline context cost before
assuming a lighter model is a free win," not "always downgrade."

**Recommendation 1 was sharpened rather than left as a principle**, in response to a direct
follow-up question about whether large docs should instead be split into smaller files, or a
rule written naming the exact anchor/section an orchestrator hands a subagent. The answer:
splitting is rejected (see [What not to change](#what-not-to-change) above); the anchor-pointing
tactic is now item 2 of the Token-Efficient Reading and Dispatch Rule (`grep` for the heading,
`Read` with `offset`/`limit` bounded to it, and cite the exact `file.md#heading` — never a bare
filename — when dispatching another agent). And `buildBrief()` alone was judged **not**
sufficient, because it only runs at Phase 1 (Three Amigos) — item 4 of the same rule extends the
same "distill once" idea past Phase 1 by naming the Phase 1 task file itself as the brief every
later-phase agent (`backend-expert`/`frontend-expert`, `backend-qa`/`frontend-qa`,
`appsec-auditor`, `code-reviewer`) already receives and should treat as primary, rather than
independently re-deriving what it already states.

_Written 2026-08-30, in response to a direct question during the Epic 5 (Internationalization) Three Amigos decomposition session. This is a process note about the AI-agent workflow, not part of the application's own architecture documentation._
