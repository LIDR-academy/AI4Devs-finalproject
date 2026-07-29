## Context

`PATCH /v1/books/:bookId` exists with audience-only DTO from KAN-35. Manual edit form (KAN-28) needs one endpoint for book metadata.

## Goals / Non-Goals

**Goals:** Full book-field PATCH; validation parity with create DTO; user scoping; integration coverage.

**Non-Goals:** Reading status/dates/rating/format (separate reading-record PATCH); changing `data_source` / catalog ids on patch.

## Decisions

1. **Single PATCH endpoint** — extend KAN-35 route rather than new path.
2. **Partial updates** — only provided fields change; null clears nullable fields.
3. **Date coherence** — not on book PATCH; reading-record PATCH already returns 422 `FINISHED_BEFORE_STARTED`.
4. **`notes` included** — maps to Jira «etiquetas» / manual metadata; same as create.

## Risks

- **[Duplicate ISBN on patch]** — out of scope (ISBN not patchable in this ticket).
