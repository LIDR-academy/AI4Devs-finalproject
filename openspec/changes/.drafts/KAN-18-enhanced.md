## Original

**KAN-18:** Sistema de diseño: tokens del PRD + componentes base compartidos  
**Priority:** Highest · **Status:** En curso

Create a single source of truth for styles and shared components consumed by all pages. Tokens from PRD §6 (Veranda blue, Sky cloud, white, Lychee, Melon, Cupid pink), editorial typography, 4/8px spacing grid, rounded corners, soft shadows.

**Base components:** Button, Card, Table (scrollable), Input, Select, Modal, Badge/Tag, StarRating, ChartCard, PageHeader, SidebarItem.

**Acceptance:** central theme module (no loose hex per page), documented palette mapping, reusable documented components, WCAG 2.1 AA contrast, keyboard navigation.

## Enhanced

### Problem

Pages and modals use ad-hoc colors (`#4f46e5`, Vite starter purple in `index.css`, per-page CSS). KAN-19 (sidebar) and Phase 3 page restyles depend on shared tokens and UI primitives.

### Scope

**In scope (frontend only):**

| Area | Deliverable |
|------|-------------|
| Tokens | `frontend/src/theme/tokens.css` — semantic CSS variables (color, typography, spacing, radius, shadow, focus) |
| Palette doc | `docs/design-system-palette.md` — PRD color → semantic token → usage |
| UI kit | `frontend/src/components/ui/` — Button, Card, Table, TableScroll, Input, Select, Modal, Badge, StarRating, ChartCard, PageHeader, SidebarItem |
| Barrel | `frontend/src/components/ui/index.ts` |
| Global wiring | Replace Vite starter vars in `index.css`; import tokens in `main.tsx` |
| Fonts | Google Fonts: display + body (editorial, PRD §6) in `index.html` |
| A11y | Focus rings, labels, keyboard nav on interactive components; contrast notes in palette doc |

**Out of scope:** page restyles (KAN-20 epic), sidebar layout (KAN-19), backend/API changes.

### Files to create/modify

```
frontend/src/theme/tokens.css
frontend/src/theme/base.css
frontend/src/components/ui/*.tsx + *.css
frontend/src/components/ui/index.ts
frontend/index.html                    # font links
frontend/src/index.css                 # consume tokens
frontend/src/main.tsx                  # import theme/base
docs/design-system-palette.md
docs/standards/frontend-standards.md             # design-system section
frontend/src/components/StarRating.tsx # re-export from ui/ (compat)
```

### Definition of done

- [ ] `npm run build` and `npm run lint` pass in `frontend/`
- [ ] All acceptance criteria from Jira covered
- [ ] OpenSpec change `kan-18-design-system` archived after merge (pipeline continue)
- [ ] Manual: open app, verify tokens load, Tab through Button/Modal/StarRating

### Non-functional

- WCAG 2.1 AA for token pairs documented in palette doc
- English code/comments; no new runtime dependencies beyond Google Fonts link
- No Express/Prisma — Vite + React only
