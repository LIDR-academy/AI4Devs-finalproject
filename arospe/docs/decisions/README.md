# Architecture Decision Records

This folder holds one Markdown file per significant architectural decision (ADR) — why we chose an approach, what alternatives were considered, and what tradeoff was accepted. This file defines the format; the recorded ADRs live alongside it (the first is [0001 — UUID primary keys](0001-uuid-primary-keys.md)).

## When to add one

Add an ADR when a change:
- introduces a new package/dependency as the chosen solution to a problem (e.g. adopting `spatie/laravel-permission` for roles),
- picks one of several valid architectural approaches and the reasoning isn't obvious from the code,
- reverses or supersedes a previous decision.

Do not add an ADR for routine feature work that doesn't involve a real choice between alternatives.

## File naming

`NNNN-short-title.md`, zero-padded sequential number, kebab-case title. Example: `0001-adopt-spatie-laravel-permission.md`.

## Template

```markdown
# NNNN. <Decision title>

## Status
Proposed | Accepted | Superseded by NNNN

## Context
What problem or requirement led to this decision. Link the relevant code/module docs.

## Decision
What we chose to do, stated plainly.

## Alternatives considered
What else was on the table and why it was rejected.

## Consequences
What this makes easier, harder, or what follow-up work it implies.

_Last updated: <date> — <reason>_
```

_Last updated: 2026-07-21 — Updated the intro to reference the first recorded ADR (0001 — UUID primary keys)._
