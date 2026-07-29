# Command: /generate-adr

## Description

Drafts a new Architecture Decision Record (ADR) following the project template. Uses the `adr-suggest` skill to validate that a real decision exists.

## Usage

```
/generate-adr <title>
/generate-adr Use OpenRouter as LLM gateway
```

## What it does

1. Check if `<title>` corresponds to a real decision (i.e., not just an implementation detail). If unsure, ask the user for context.
2. Determine next ADR number: `ls docs/adr/` to find the highest existing number.
3. Create `docs/adr/NNN-<slug>.md` from the template:

```markdown
# NNN. <Title>

**Status**: Proposed
**Date**: 2026-07-08
**Deciders**: DMM

## Context
What is the issue we're seeing that motivates this decision?

## Decision
What is the change that we're proposing or have agreed to implement?

## Consequences
What becomes easier or more difficult because of this change?

## Alternatives Considered
- Option A — pros/cons
- Option B — pros/cons

## References
- Related FRs, ADRs, docs
```

4. Append the new ADR to the catalogue section of `readme.md` (if applicable).

## Naming

`NNN-kebab-case-slug.md` (e.g., `007-use-openrouter-as-llm-gateway.md`).
