## Context

Books have `audience_id` FK (KAN-65) and legacy `audience` enum (KAN-35). Modals currently use hardcoded enum `AudienceSelect`.

## Goals / Non-Goals

**Goals:** Persist `audience_id` from modals; validate ownership; load options from API.

**Non-Goals:** Remove enum field; tracker row redesign beyond shared selector; stats changes.

## Decisions

1. **Keep legacy `audience` enum** in API unchanged; add parallel `audience_id`.
2. **`AudiencesService.findOwnedById`** reused by `BooksService` for validation.
3. **`AudienceSelect`** uses TanStack Query `['audiences']` (shared cache with Settings).
4. **Empty list UX:** inline message + `Link` to `/profile`; save still allowed with null.
5. **Catalog add:** reset `audience_id` to null on edition select.

## Risks / Trade-offs

- **[Risk] Dual fields** → Mitigation: modals write `audience_id` only; enum untouched until later ticket.

## Migration Plan

Deploy backend + frontend together. No DB migration.
