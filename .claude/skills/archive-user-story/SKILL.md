---
name: archive-user-story
description: Move an implemented RunMarket user story backlog from docs/backlog/<US-ID>.md to docs/backlog/archive/<US-ID>.md, adding an archive date header and warning if the workflow is not closed. Use for /archive-user-story. Never edits docs/USER-STORIES.md.
---

# Archive User Story

Move a completed backlog file to the archive after phase 6 of
`implement-user-story`. Driven by the `product-owner` agent.

---

## Procedure

1. Confirm `docs/backlog/<US-ID>.md` exists. If not, report and stop.
2. Read its **Workflow state**. If phases 1-6 are **not** all checked, warn:

   ```markdown
   Advertencia: US-XXX no está cerrada (fase N pendiente). ¿Archivar igualmente? sí | no
   ```

   Only continue on explicit `sí`.
3. Add a header at the top of the file:

   ```markdown
   > Archivado: YYYY-MM-DD
   ```

   Use today's date.
4. Move the file to `docs/backlog/archive/<US-ID>.md` (`git mv` when possible to keep
   history; otherwise write the destination and remove the source).
5. **Do not modify `docs/USER-STORIES.md`** — the original product story stays intact.
6. Report the new path and the archive date.

## Notes

- The archive is the record of implemented US; the active `docs/backlog/` holds only
  in-progress stories.
- If the destination already exists, stop and ask before overwriting.
