# Playbook: adr-lifecycle

## Purpose

Full lifecycle of an Architecture Decision Record: from detection in code review to a merged, indexed ADR.

## When to use

- When the `reviewer` agent detects a new architectural decision in a diff
- When the `documenter` agent is processing a new feature
- Manually via `/generate-adr <title>`

## Steps

### Step 1: Detection

The `adr-suggest` skill detects a significant decision. Triggers:

- New package added to `package.json`
- New top-level directory
- New `prisma migrate` file
- New environment variable
- Comment with "decided", "chose", "because", "trade-off"

### Step 2: Proposal

```bash
@generate-adr <title>
```

Output: `docs/adr/NNN-<slug>.md` with `Status: Proposed` and the template filled.

### Step 3: Review

The user reviews the ADR. If approved, status changes to `Accepted`. If rejected, status changes to `Rejected` and the file is kept for historical reference (renamed with `-rejected` suffix).

### Step 4: Commit

```bash
git add docs/adr/NNN-<slug>.md
git commit -m "docs(adr): NNN <title>"
```

### Step 5: Reference

Mention the new ADR in:

- The relevant `evidence` file for the task that introduced the decision
- The `readme.md` ADR catalogue (if it exists)
- The `prompts.md` section on architecture decisions

### Step 6: Track superseded ADRs

If a new ADR supersedes an old one (e.g., ADR-002 location resolver chain was simplified by ADR-004), update the old ADR's `Status: Superseded by NNN` and link to the new one.

## Anti-patterns

- Writing ADRs after the fact (decision already coded without discussion)
- Writing ADRs for trivial decisions
- Letting ADRs go stale (status never updated)
- Multiple ADRs covering the same decision

## Reference

- Existing ADRs: `docs/adr/`
- Template: `docs/adr/000-template.md`
- Skill: `.opencode/skills/adr-suggest.md`
