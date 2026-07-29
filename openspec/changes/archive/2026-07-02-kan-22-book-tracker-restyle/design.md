## Context

Book Tracker renders 12 columns with inline controls. Current `max-width: 1100px` and `width: 100%` table cause overflow past the main content area. KAN-18 already ships `TableScroll` with `overflow-x: auto` and token-based table styling.

## Approach

1. **Page shell:** Use `PageHeader` with title «Book Tracker» and primary `Button` for «Añadir libro». Page container uses token spacing; remove fixed 1100px cap so table can use full main width.
2. **Table wrapper:** Replace raw `<table className="books-table">` with:
   ```tsx
   <TableScroll aria-label="Biblioteca de libros">
     <Table className="books-table">…</Table>
   </TableScroll>
   ```
3. **Column layout:** Apply BEM-style column classes on `<th>`/`<td>`:
   - `col-cover` — fixed 56px
   - `col-title` — min-width 10rem, max-width 14rem, truncate with title attribute
   - `col-author`, `col-genre` — min-width 6rem
   - `col-audience`, `col-status`, `col-format` — min-width for selects
   - `col-pages` — numeric, center, narrow
   - `col-date` — min-width 9rem
   - `col-rating` — min-width 7rem
   - `col-actions` — fixed 3rem, center
4. **CSS migration:** Map legacy hex to `var(--color-*)`, `var(--space-*)`, `var(--radius-*)`. Keep row-specific styles (cover img, star buttons, edit btn) in page CSS using tokens.
5. **Accessibility:** TableScroll is focusable via tabindex="0" when needed; preserve existing control labels. Empty/loading/error states use `--color-text-muted` and `--color-danger`.

## Risks / trade-offs

- Horizontal scroll is acceptable for MVP (PRD desktop-first); no column hiding in this ticket.
- Title truncation may require hover `title` for full text — acceptable for table density.

## Verification

- `npm run build` + `npm run lint` in frontend.
- Manual: narrow viewport → horizontal scroll inside table only; keyboard tab through controls.
