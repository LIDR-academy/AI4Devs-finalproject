# Skill: adr-suggest

## Purpose

Detects architectural decisions that should be documented as ADRs and proposes drafts. Keeps the `docs/adr/` directory current with the project's evolution.

## When to invoke

- In `reviewer` agent, when a significant decision is observed in the diff
- In `documenter` agent, when a new technology, library, or pattern is introduced
- Manually via `/generate-adr <title>`

## Inputs

- Context describing the decision (commit message, FR, conversation)
- (optional) Suggested title

## Outputs

- A new file `docs/adr/NNN-<slug>.md` with `Status: Proposed`
- (optional) Update to the ADR catalogue in `readme.md`

## What counts as a significant decision

Significant = affects project structure, long-term maintenance, or external integrations. Examples:

- Choice of LLM provider (OpenRouter, OpenAI, Anthropic)
- Choice of database (PostgreSQL vs SQLite)
- HTML parsing strategy (Cheerio + .m. fallback vs Puppeteer)
- Fallback chain design (LLM → manual text paste)
- Schema changes that affect API contracts
- New external service integration
- Decision to omit auth (already covered in ADR-001, but new security decisions need new ADRs)

## What does NOT need an ADR

- Implementation details (e.g., "use Array.map instead of forEach")
- Library upgrades within the same major version
- Naming conventions
- File structure changes
- Bug fixes

## Detection heuristics

When reviewing a diff, the `adr-suggest` skill flags lines matching:

- `import` from a new package not in `package.json` previously
- New top-level directories
- New `prisma migrate` files
- New environment variables in `.env.example`
- Comments mentioning "decided", "chose", "because", "trade-off"

## ADR template

See `docs/adr/000-template.md` (created during scaffold).

```markdown
# NNN. <Title>

**Status**: Proposed
**Date**: 2026-07-08
**Deciders**: DMM

## Context
<What is the issue we're seeing that motivates this decision?>

## Decision
<What is the change that we're proposing or have agreed to implement?>

## Consequences
<What becomes easier or more difficult because of this change?>

## Alternatives Considered
- <Option A> — <pros/cons>
- <Option B> — <pros/cons>

## References
- <Related FRs, ADRs, docs>
```

## Auto-numbering

```bash
next_number=$(ls docs/adr/ | grep -E '^[0-9]+' | sort -n | tail -1 | sed 's/-.*//')
echo $((next_number + 1))
```
