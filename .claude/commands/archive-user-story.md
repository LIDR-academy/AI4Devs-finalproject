---
description: Move a completed backlog US to docs/backlog/archive/ with an archive date
argument-hint: US-XXX
---

# /archive-user-story

Archive the backlog of user story `$1` after closing phase 6.

## Steps

1. Adopt `.claude/agents/product-owner.md`.
2. Run `.claude/skills/archive-user-story/SKILL.md` for `$1`:
   - Confirm `docs/backlog/$1.md` exists.
   - If the workflow state is not fully closed (phases 1-6), warn and ask before
     archiving anyway.
   - Add header `> Archivado: YYYY-MM-DD` (today).
   - Move `docs/backlog/$1.md` → `docs/backlog/archive/$1.md` (prefer `git mv`).
3. Do **not** modify `docs/USER-STORIES.md`. Report the new path.
