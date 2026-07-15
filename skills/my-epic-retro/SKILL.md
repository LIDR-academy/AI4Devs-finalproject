---
name: my-epic-retro
description: 'Run a complete epic retrospective for a BMAD project: the full bmad-retrospective team ceremony PLUS a dedicated audit for inconsistencies, incongruencies, gaps, risks, and technical debt, ending with an offer to schedule tracked backlog stories for whatever it finds (instead of letting findings sit as prose nobody revisits). Use whenever the user wants to close out or review a finished epic: "run a retrospective", "let''s retro epic X", "do the epic X retro", "run my-epic-retro", or any request for a deeper, more critical, or analytical retro that looks past the standard ceremony for gaps and technical debt. Prefer this over the bare bmad-retrospective skill for epic reviews in BMAD projects.'
---

# My Epic Retro

Runs `/bmad-retrospective`'s full team ceremony for a completed epic, and layers a dedicated
**Gap & Risk Audit** on top of it — a structured, evidence-based hunt for inconsistencies,
incongruencies, requirement gaps, process risks, and technical debt that a ceremony alone tends to
surface only when someone happens to think to ask. It closes by offering to turn the audit's
actionable findings into real backlog entries, because the alternative — a finding left as prose in
a retro doc — has already shown up as a recurring failure mode in this kind of project: a flag gets
written down, nobody converts it to a tracked item, and it resurfaces one or two epics later as a
"why didn't we catch this" moment.

This skill does not replace `/bmad-retrospective`. It orchestrates it, adds research before the
ceremony so the roleplay has real findings to discuss, and adds two steps after the ceremony
(merging the audit into the saved document, and offering follow-up stories).

---

## CRITICAL LLM INSTRUCTIONS

- **Run bmad-retrospective's full workflow.md, roleplay and all.** Do not compress, skip, or
  summarize its HALTs. The ceremony (successes/challenges dialogue, next-epic prep, closure) has
  real value on its own — psychological safety, forcing multiple perspectives, catching things a
  pure audit misses. The audit is additive, not a replacement.
- **Do the Gap & Risk Audit (Step 2 below) before bmad-retrospective reaches its own Step 6** (Epic
  Review Discussion). Its script has a beat where the facilitator says "I noticed something when
  reviewing all the story records..." — that beat should be backed by this audit's real findings,
  not invented ones.
- **Every finding needs concrete evidence** — a file path with line number, a story id, a
  `sprint-status.yaml` key, or a quoted line from a doc. A finding you can't point to a specific
  artifact for is a hunch, not a finding; leave it out or mark it as a question for the team
  discussion instead.
- **Don't manufacture findings to hit a quota.** If an epic is genuinely clean, a short audit
  section that says so plainly is a more useful and more honest output than padding it with
  low-severity nitpicks.
- **Never create a full story file directly, and never invent a `sprint-status.yaml` key that
  doesn't match this project's actual naming pattern.** This skill's job stops at proposing
  `backlog` entries in `sprint-status.yaml`. Fleshing a backlog entry out into a full story (with
  acceptance criteria, worktree isolation, adversarial review) is `plan-story`'s and `pick-story`'s
  job — don't duplicate it here.
- **HALT before writing anything to `sprint-status.yaml` or `epics.md`.** Get explicit user
  confirmation on which findings become stories, and where, before touching either file.
- **A finding that recurs from a prior retro's action items (`[REPEAT]`, see Step 2) cannot be
  dismissed or filed as debt-only without an explicit, recorded override.** This project has had
  the same two findings raised three times each (P6-1/P7-1/P8-1, P6-2/P7-2/P8-3) without ever being
  built — Step 4's routing restrictions exist specifically to stop a fourth repeat.

---

## FLOW

### Step 0: Verify BMAD Is Installed

This skill orchestrates `/bmad-retrospective` and depends on BMAD's on-disk conventions
(`_bmad-output/implementation-artifacts/sprint-status.yaml`). It cannot function in a project that
hasn't installed BMAD.

**Action:** Check whether `_bmad/_config/manifest.yaml` exists in the current project root.

- **Found:** Continue to Step 1.
- **Not found:** HALT. Tell the user this project doesn't have BMAD installed and `my-epic-retro`
  can't run without it — suggest `/bmad-init`, or switch to a project that already has it.

### Step 1: Identify and Validate the Epic

Follow `/bmad-retrospective`'s own **Step 1 (Epic Discovery)** logic exactly as documented in its
`workflow.md`: priority order is (1) highest epic number in `sprint-status.yaml` with at least one
`done` story, confirmed with the user, (2) ask the user directly if detection fails, (3) fall back
to scanning the stories folder for the highest epic number referenced. Don't reimplement this
detection from scratch — reuse its priority order so the two skills never disagree about which
epic is under review.

Also reuse its completeness check: count total vs. `done` stories for `{{epic_number}}`, and if the
epic isn't fully done, surface the same choice bmad-retrospective offers (finish remaining stories
first / continue with a partial retro / run sprint-planning first). If the user chooses a partial
retro, the Step 2 audit below still runs — the audit is often more useful on a mid-flight epic than
after the fact, since gaps are still cheap to fix.

### Step 1.5: Verify Prior Retro Action-Item Follow-Through

Before the audit begins, build the evidence base that Step 2's "process pattern carryover" check
relies on — don't leave recurrence-detection to memory or a re-read of prose.

**Action:**
1. Find every prior retro doc for this project: `{implementation_artifacts}/epic-*-retro-*.md`,
   sorted oldest to newest.
2. For each one, extract its Action Items table(s) (Process / Documentation / any other action-item
   section the template uses).
3. For each action item, identify the concrete artifact it calls for — a file path, a `make` target,
   a checklist rule, a schema/table name, a specific script. Not every item names one (some are
   genuinely narrative); skip those.
4. For items that do name a concrete artifact, check whether it actually exists on disk today
   (grep/`find`/`git log -p` for the named file, target, or rule) — not whether *a* commit happened
   nearby, whether the *specific thing asked for* exists. A later retro's "resolved" note is a claim
   to verify, not evidence on its own — confirm the artifact, don't trust the label.
5. Build a table: `item id | epic raised | artifact asked for | found on disk? | epochs outstanding`.
   Carry this into Step 2 category 3 — every item that's missing and was raised before becomes a
   `[REPEAT Nx]` finding there.

This is exactly the check that would have caught, before this audit even started, that P6-1's
"resolution" (a commit fixing drifted `Status:` headers) fixed the symptom but never built the
artifact P6-1 actually asked for (an automated check wired into `make ci`) — don't let that class of
false-resolved slip through again.

### Step 2: Gap & Risk Audit

Before the ceremony begins, do a research pass over the epic and build a findings list. This is the
actual reason this skill exists, so give it real attention rather than treating it as a formality.
Work through each category below; not every category will produce a finding for every epic, and
that's fine (see the "don't manufacture findings" instruction above).

**1. Cross-file consistency**
- Does every story file's `Status:` header match its `sprint-status.yaml` entry? (This exact drift
  has recurred multiple times in projects like this — it's cheap to check and easy to miss.)
- Do docs that describe a shipped feature (README, in-app copy, dashboard placeholders, API docs)
  still match what the epic actually shipped? Look especially for placeholder copy like "available
  in Epic N" once epic N has actually shipped.
- Do naming choices in the epic's code/schema match the product-facing language used in its ACs,
  UI, and docs? A physical table or internal name that drifted from the domain language everyone
  else uses is a debt item, not just a style nit.

**2. Requirement / UI coverage gaps**
- For every user-facing capability this epic's stories claim to deliver, does a real, reachable UI
  path exist — or was it explicitly, honestly deferred with a linked follow-up story? An API-only
  feature with no UI and no linked deferral is a gap. If this project has a Product Surface
  Contract, UX spec, or similar UI-coverage gate doc, check the epic's stories against it directly;
  if it doesn't, reason from the PRD/epics file's stated user journeys instead.
- Search each story's Dev Notes / Key Design Decisions / ADRs for language that defers something to
  "later," "a future story," or "the epic retrospective" — then check whether that deferred item
  actually has a tracked backlog entry today. A deferral that only ever existed as prose is exactly
  the pattern this skill's Step 4 exists to close.

**3. Process pattern carryover**
- Use Step 1.5's follow-through table. For each action item that's missing its named artifact and
  was raised before, check whether the same defect class/pattern shows up again in this epic too.
- **A finding that recurs from a prior retro's action items is automatically Critical, regardless of
  its underlying content, and must be tagged `[REPEAT Nx]`** (e.g. `[REPEAT 3x]`), citing every
  prior retro doc + item id it recurs from (e.g. "recurs from P6-1, P7-1"). This is not optional
  severity guidance — the `[REPEAT]` tag changes how Step 4 is allowed to route the finding. This
  project has already had a finding raised 3 times running (story-status-sync CI check: P6-1, P7-1,
  P8-1) and another raised 3 times (epic-retro-before-next-epic: P6-2, P7-2, P8-3) — treat a 2nd
  occurrence as the trigger point, don't wait for a 3rd.
- Check epic sequencing risk: did later epics start or complete before this epic's retro ran? If
  so, any of this epic's findings that would have been useful to those later epics are worth
  calling out explicitly, since the lesson arrived too late to help.

**4. Technical debt & duplication**
- Grep across this epic's changed files for repeated structural patterns (the same kind of
  workaround, the same manual list that should derive from one source of truth, the same
  copy-pasted validation). A pattern repeated 2+ times without consolidation is debt worth naming,
  even if each individual instance was reasonable on its own.
- Look for "accepted trade-off" language in story docs or adversarial review notes (rate limits,
  missing abuse protection, deferred hardening, etc.) that has no stated condition for when it
  should be revisited — an accepted trade-off with no trigger tends to become permanent by default.

**5. Project-specific invariants**
- Read this project's architecture doc and any root-level agent instructions (e.g. `AGENTS.md`,
  `CLAUDE.md`) for invariants that should hold across all new code — things like tenant isolation,
  fail-closed audit logging, auth/session checks, or migration safety rules. Spot-check this epic's
  actual changes (new tables, new routes, new endpoints) against those invariants rather than
  assuming consistency.

**Format each finding exactly like this** (this format is already proven to read well in this kind
of project's retro docs — keep using it):

```markdown
### N. [Severity] Title
One paragraph: what the finding is, with concrete evidence (file:line, story id, quoted doc
text). If it's a recurrence of a past finding, say which epic/retro it recurred from.
**Resolution:** what should happen about it — fixed now, scheduled as a story, tracked as debt,
or accepted as-is with a stated reason.
```

Severity guide: **Critical** = actively misleads a user or violates a stated project gate (e.g. a
shipped-but-undelivered promise); **High** = a real gap or recurring pattern with no tracked
follow-up; **Medium** = debt or drift that's real but contained; **Low** = a trade-off worth
naming but not worth interrupting anything for.

### Step 3: Run bmad-retrospective's Full Workflow

Invoke `/bmad-retrospective` and run its complete `workflow.md` for `{{epic_number}}`, start to
finish — full party-mode roleplay, every HALT, exactly as written. When it reaches its own Step 6
("Speaking of patterns, I noticed something...") feed in this skill's Step 2 findings as the real
material behind that line, rather than letting it invent generic patterns.

When it reaches its **Step 11 (Save Retrospective and Update Sprint Status)**, before it writes the
file, add a new section to the document content it's about to save:

```markdown
## Gaps, Inconsistencies & Risks Audit

*(requested focus: incongruencies, inconsistencies, gaps, technical debt, and risks)*

{{all Step 2 findings, in severity order: Critical, High, Medium, Low}}
```

Let Step 11 save the ceremony content and this audit section together as one document at
`{implementation_artifacts}/epic-{{epic_number}}-retro-{date}.md`, and let it flip
`epic-{{epic_number}}-retrospective` to `done` in `sprint-status.yaml` as it normally would.

### Step 4: Offer Follow-up Stories

After the retro document is saved, look at the audit's **Critical and High** findings. Filter out
only **pure narrative reminders** — ones with no possible mechanical enforcement (e.g. "communicate
better across the team") — and anything that already has an existing backlog entry.

**Do not filter out enforceable process rules.** A finding like "check X before starting Y" or "a
flag of type Z must be accompanied by an entry in file W" is not a pure reminder — it can be
expressed as a check, a skill guard, or a checklist gate. This exact distinction is why
epic-retro-before-next-epic (P6-2 → P7-2 → P8-3) was silently dropped three times running: it kept
getting bucketed as a "process reminder" and filtered out here before it ever got a chance to become
a real gate. Route enforceable rules to option 5 below instead of dropping them.

For what's left, present the list to the user in one batched question rather than one at a time, and
ask — for each finding — which of these it should become. **If a finding is tagged `[REPEAT]` from
Step 2, only options 1, 2, and 5 are available** — do not offer "tracked debt only, no story" or
"dismiss" for a finding that's already been waved through before. If the user insists on dismissing
or debt-tracking a `[REPEAT]` finding anyway, require a one-line typed justification and record it
verbatim in the retro doc under a new "Overridden repeat findings" subsection — an override must be
visible and auditable, never silent.

1. **A closure story on the current epic.** Check `sprint-status.yaml` for whether this project
   already uses a closure-story naming pattern (e.g. an existing entry like
   `{{epic}}-{{n}}-epic-{{epic}}-completion-<slug>`); if so, follow it. If not, use a plain
   descriptive slug (`{{epic}}-{{n}}-<slug>`) consistent with the epic's other story keys.
2. **A story under a different epic** (existing or new). If the target epic doesn't exist yet in
   `epics.md`, add a short entry — a title and 1-2 line description is enough; don't run the full
   `bmad-create-epics-and-stories` workflow for a single item.
3. **Tracked technical debt only, no story.** Record it in the retro doc's technical-debt table (if
   bmad-retrospective's template includes one) without touching `sprint-status.yaml`. Not offered for
   `[REPEAT]` findings (see above).
4. **Dismiss.** The team discussion already resolved it, or the user judges it not worth tracking.
   Not offered for `[REPEAT]` findings (see above).
5. **Encode as a tooling/skill guard.** For an enforceable process rule (not application code): name
   the specific target — a step in `pick-story`, `plan-story`, or another Claude Code skill; a
   `make ci` target; a checklist in a BMAD skill file. If the target is a Claude Code skill file
   (under `~/.claude/skills/` or this project's `.claude/skills/`), offer to make that edit in this
   same session rather than just logging the ask — a skill edit is cheap and immediate, and prose
   describing a needed skill edit has already failed to become one three times in this project. Log
   the outcome (edited now / deferred with owner) in the retro doc's Action Items table.

For every finding routed to (1) or (2): add exactly one `backlog` entry to `sprint-status.yaml`
under the correct epic section, with an inline comment describing what it closes and citing the
audit finding number — match the file's existing comment style (see other entries in the file for
tone and level of detail). Do not create the story file itself, and do not run `plan-story` or
`pick-story` automatically — mention them as the next step instead (Step 5).

Update `last_updated` at the top of `sprint-status.yaml` and commit the change with a message like
`chore(sprint): schedule follow-up stories from epic {{epic_number}} retro`, following this
project's normal commit conventions. Do not push.

### Step 5: Final Handoff Summary

Report to the user:
- Epic reviewed, and whether it was a full or partial retro
- Retro document path
- Audit findings by severity count (e.g. "1 critical, 2 high, 3 medium, 1 low")
- Any `[REPEAT]` findings, how many times each has now recurred, and whether any were overridden
  (dismissed/debt-tracked despite the restriction) — flag overrides prominently, since they're the
  exact failure mode this skill exists to stop
- Any new `sprint-status.yaml` backlog entries created, with their ids
- Suggested next command(s): `plan-story <id>` for each new backlog entry the user wants fleshed
  out next

---

## Error Handling

| Situation | Action |
|---|---|
| BMAD not installed | HALT at Step 0, suggest `/bmad-init` |
| Epic not found / ambiguous | Follow bmad-retrospective's own fallback chain (Step 1); ask the user directly if all else fails |
| Epic incomplete | Offer the same choice bmad-retrospective offers (finish first / partial retro / run sprint-planning); a partial retro still runs the full Step 2 audit |
| No previous epic retro exists | Skip the "process pattern carryover" audit category silently — it's optional context, not a hard requirement |
| No Product Surface Contract / UI-gate doc exists | Fall back to reasoning from the PRD/epics file's stated user journeys for the UI-coverage check |
| User wants to skip the roleplay entirely | Confirm explicitly that they want the ceremony skipped (this is a deliberate deviation from this skill's default), then jump straight to Step 2 and Step 4, still saving the merged document in Step 3's format |
| A finding's proposed story key collides with an existing `sprint-status.yaml` key | Ask the user to disambiguate before writing anything |

---

## Quick Reference

```
BMAD marker:          _bmad/_config/manifest.yaml
Sprint status file:   _bmad-output/implementation-artifacts/sprint-status.yaml
Retro doc naming:     {implementation_artifacts}/epic-{{epic_number}}-retro-{date}.md
Underlying ceremony:  /bmad-retrospective (run in full, not summarized)
Story follow-through: plan-story <id>  /  pick-story <id>  (this skill only schedules backlog entries)
```
