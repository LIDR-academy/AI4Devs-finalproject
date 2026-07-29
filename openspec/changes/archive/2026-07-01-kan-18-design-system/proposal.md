## Why

Every page and modal currently defines its own colors and spacing (Vite starter tokens in `index.css`, indigo links on Home, scattered hex values). KAN-18 establishes the **design foundation** for the restyle epic (KAN-20+) and KAN-19 sidebar: one token module and a shared UI kit aligned with PRD §6 (soft feminine / coquette palette).

## What Changes

- **Design tokens:** central CSS variables for PRD palette, typography, spacing (4/8 grid), radii, shadows, and focus rings in `frontend/src/theme/`.
- **Shared UI components:** Button, Card, Table (+ scroll wrapper), Input, Select, Modal, Badge, StarRating, ChartCard, PageHeader, SidebarItem under `frontend/src/components/ui/`.
- **Global wiring:** replace Vite starter variables; load tokens app-wide via `main.tsx` / `index.css`.
- **Documentation:** `docs/design-system-palette.md` mapping PRD colors to semantic tokens; update `docs/standards/frontend-standards.md`.
- **Accessibility:** keyboard-operable interactive components; WCAG 2.1 AA contrast documented for primary token pairs.

**Non-goals:**

- Restyling existing pages (KAN-22…KAN-25 — Phase 3).
- Sidebar shell layout (KAN-19).
- Backend or API changes.

## Capabilities

### New Capabilities

- `design-tokens`: PRD-aligned CSS custom properties, typography scale, spacing/radius/shadow/focus tokens, global import.
- `shared-ui-components`: reusable base React components with co-located CSS consuming design tokens.

### Modified Capabilities

*(none — requirement-level behavior of existing pages unchanged; they are not migrated in this ticket)*

## Impact

- **Frontend:** new `theme/` and `components/ui/` trees; `index.html` font links; refactor `StarRating` to live under `ui/` with backward-compatible re-export.
- **Docs:** `docs/design-system-palette.md`, `docs/standards/frontend-standards.md`.
- **Product refs:** KAN-18, PRD §6, README §1.3.
- **Dependencies:** unblocks KAN-19, KAN-20 epic page restyles.
