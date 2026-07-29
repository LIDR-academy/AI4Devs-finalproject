## Context

The frontend uses Vite starter CSS variables (`--accent: #aa3bff`) and page-level hex colors. PRD §6 defines the coquette palette and editorial typography. KAN-18 introduces tokens and UI primitives without migrating existing pages (Phase 3).

## Goals / Non-Goals

**Goals:**

- Single import path for brand tokens app-wide.
- Eleven base components with co-located CSS using semantic variables only.
- Document palette → token → UI role mapping.
- WCAG 2.1 AA for documented pairs; keyboard support on interactive components.

**Non-Goals:**

- Page restyles, sidebar layout, new npm UI libraries, dark mode.

## Decisions

1. **CSS custom properties over CSS-in-JS** — matches existing co-located `.css` pattern; zero new dependencies.
2. **Semantic token names** — e.g. `--color-primary`, `--color-surface-card`, not `--veranda-blue` in components. Raw palette vars kept as `--palette-veranda-blue` for documentation.
3. **Font stack** — Google Fonts: **Cormorant Garamond** (display/headings), **Nunito** (body/UI). Loaded in `index.html`.
4. **Component location** — `frontend/src/components/ui/` with barrel export; legacy `StarRating.tsx` re-exports from `ui/StarRating`.
5. **Modal a11y** — focus trap via simple ref + first/last focusable; `Escape` closes; `role="dialog"` + `aria-modal`.
6. **No Vitest in this change** — frontend has no test runner; verify via `npm run build` + `npm run lint` + manual keyboard check.

## Risks / Trade-offs

- **[Risk] Pages still use old hex until Phase 3** → Mitigation: tokens loaded globally; new work must use `ui/` components.
- **[Risk] Font FOUT** → Mitigation: `display=swap` on Google Fonts link.
- **[Risk] StarRating move breaks imports** → Mitigation: keep re-export at old path.

## Migration Plan

1. Add theme + ui components.
2. Wire tokens in `main.tsx`.
3. Do not bulk-edit page CSS in KAN-18.
4. Rollback: revert branch; no DB/API impact.

## Open Questions

- None — font and token structure sufficient for KAN-19 sidebar.
