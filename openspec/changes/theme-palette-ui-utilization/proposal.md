## Why

User-selectable palettes (KAN-80) remap five semantic color slots app-wide, but most chrome still uses only primary (sidebar) and neutral text/surfaces. Highlight and accent-KPI colors appear mainly in stats charts, so switching themes feels weak outside Reading Stats. PRD §6 already assigns Melon and Cupid pink to soft highlights and KPI accents — those roles need to show up in navigation, page titles, and backgrounds without breaking WCAG 2.1 AA contrast.

## What Changes

- Spread semantic palette tokens (`--color-highlight`, `--color-accent-kpi`, `--color-secondary`, soft primary mixes) across shared chrome: sidebar accents, page titles, main background wash, and KPI presentation.
- Prefer soft `color-mix` tints and decorative accents over saturated fills behind body text.
- Update shared UI/layout CSS so authenticated pages inherit the richer theming without per-page hex.
- Document expanded UI role mapping and contrast-safe patterns in `docs/design-system-palette.md`.
- No new palette presets, Settings UX, API, or chart redesign.

## Capabilities

### New Capabilities

- (none)

### Modified Capabilities

- `design-tokens`: Expand documented UI roles so highlight and accent-KPI are expected in chrome (nav accents, titles, backgrounds, KPIs), not only charts; document contrast-safe usage patterns.
- `shared-ui-components`: PageHeader (and related shared chrome such as KPI presentation via shared styles) MUST use brand accent tokens with WCAG 2.1 AA contrast for text and labels.
- `unified-sidebar-nav`: Sidebar visual design MUST use additional semantic accents beyond the primary fill (active/hover decoration) while preserving readable nav labels.

## Impact

- Frontend CSS: `frontend/src/components/ui/Layout.css`, `Card.css` (as needed), `frontend/src/components/layout/Sidebar.css`, `AppLayout.css`, `KpiCard.css` (and minimal page CSS only if shared primitives are insufficient).
- Docs: `docs/design-system-palette.md`, briefly `docs/standards/frontend-standards.md` if needed.
- No backend, API, or data-model changes; builds on KAN-18 tokens and KAN-80 palette application.
- Non-goals: dark mode, custom hex editors, new presets, chart color algorithm changes.
