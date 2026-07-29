## Context

`AudiencesService` currently only seeds defaults (KAN-65). Users reach Settings via `/profile` (placeholder page).

## Goals / Non-Goals

**Goals:** List/create/delete audiences via API; Settings UI for Audiencia section.

**Non-Goals:** PATCH/rename; delete confirmation UX (KAN-68); wire book form selector.

## Decisions

1. **Controller** at `AudiencesController` with `@Controller('audiences')` + `JwtAuthGuard`.
2. **Duplicate detection** via query `LOWER(name)` before insert; `ConflictException` with `AUDIENCE_DUPLICATE`.
3. **Trim name** in service before persist and duplicate check.
4. **ProfilePage** — single page with stacked `Card` sections; first implementation of Settings layout (Genres section comes in KAN-60).
5. **Delete in UI** — icon/button per row without modal (KAN-68 adds confirmation + book count).

## Risks / Trade-offs

- **[Risk] No Genres reference UI yet (KAN-60)** → Mitigation: reuse `Card`, `Input`, `Button`, list row pattern from existing pages.
- **[Risk] Existing users without seed** → Mitigation: GET returns empty until seed/backfill; dev-login new users still seeded.

## Migration Plan

No DB migration — deploy backend + frontend together.

## Open Questions

- None.
