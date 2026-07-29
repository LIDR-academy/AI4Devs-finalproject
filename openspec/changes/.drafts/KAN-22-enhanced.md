## Original

**KAN-22** — Estilo + maquetación: Book Tracker (tabla responsive)

Pulir **Book Tracker** al estándar del PRD y, sobre todo, **arreglar la tabla tipo Excel para que no se desborde**: contenedor con scroll horizontal, anchos de columna sensatos, alineación consistente. Aplicar tokens/componentes de KAN-18. WCAG 2.1 AA.

Parent epic: KAN-20 (page restyles). Depends on KAN-18 (design system) and KAN-19 (sidebar layout).

## Enhanced

### Problem

Book Tracker uses legacy page CSS (hard-coded hex, `max-width: 1100px`) and a raw `<table>` without horizontal scroll. With 12 columns (cover, title, author, genre, audience, pages, status, dates, format, rating, actions) the layout overflows on typical viewports.

### Scope (in)

- Replace page shell styling with KAN-18 **PageHeader**, **Button**, and **Table** / **TableScroll** from `components/ui/`.
- Wrap the books table in **TableScroll** so wide content scrolls horizontally inside the page (no body overflow).
- Define sensible **column width classes** (cover fixed, title min-width, numeric/date columns compact, actions fixed).
- Migrate **BookTrackerPage.css** to design tokens (`var(--color-*)`, `var(--space-*)`, etc.); remove hard-coded palette hex.
- Keep all existing row behaviour (inline edits, modals, mutations) unchanged.
- **WCAG 2.1 AA**: preserve focus rings, table headers associated with cells, horizontal scroll region keyboard-accessible.

### Scope (out)

- Filters, internal search, new columns (future tickets).
- Restyling Home, Stats, Lists, Goals (KAN-21…KAN-25).
- Backend/API changes.

### Files to modify

| Area | Path |
|------|------|
| Page | `frontend/src/pages/BookTrackerPage.tsx`, `BookTrackerPage.css` |
| Row styles | `frontend/src/components/BookTrackerRow.tsx` (class names only if needed) |
| Shared UI | Use existing `Table`, `TableScroll`, `PageHeader`, `Button` |

### Acceptance criteria

1. Book Tracker header uses `PageHeader` + primary `Button` for «Añadir libro».
2. Table is inside `TableScroll`; on narrow viewports user scrolls horizontally without breaking sidebar layout.
3. Column widths prevent crushed controls; title column truncates or wraps sensibly.
4. No hard-coded hex in `BookTrackerPage.css` (tokens only).
5. `npm run build` and `npm run lint` pass in `frontend/`.
6. Manual test checklist documents keyboard scroll and visual check.

### Definition of done

- OpenSpec change `kan-22-book-tracker-restyle` with spec delta for book-tracker-ui (or page-restyle capability).
- Implementation on branch `feature/KAN-22-book-tracker-restyle`.
- PR to `CeliaMerino/AI4Devs-finalproject:main`.
