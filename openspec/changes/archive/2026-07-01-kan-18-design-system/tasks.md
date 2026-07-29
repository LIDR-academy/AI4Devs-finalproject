# Tasks — KAN-18 Design system

## 1. Theme and documentation

- [x] 1.1 Add `frontend/src/theme/tokens.css` with PRD palette and semantic tokens
- [x] 1.2 Add `frontend/src/theme/base.css` for global resets using tokens
- [x] 1.3 Wire theme in `main.tsx` and update `index.css` to remove Vite starter palette
- [x] 1.4 Add Google Fonts (Cormorant Garamond + Nunito) in `index.html`
- [x] 1.5 Create `docs/design-system-palette.md` with token mapping and WCAG notes
- [x] 1.6 Update `docs/standards/frontend-standards.md` with design-system paths

## 2. UI components

- [x] 2.1 Implement `Button` (primary, secondary, ghost)
- [x] 2.2 Implement `Card`, `Badge`
- [x] 2.3 Implement `Input`, `Select`
- [x] 2.4 Implement `Modal` with focus trap and Escape
- [x] 2.5 Implement `Table` and `TableScroll`
- [x] 2.6 Implement `StarRating` in `ui/` with arrow-key nav; re-export from legacy path
- [x] 2.7 Implement `ChartCard`, `PageHeader`, `SidebarItem`
- [x] 2.8 Add `frontend/src/components/ui/index.ts` barrel export

## 3. Verification

- [x] 3.1 Run `npm run build` and `npm run lint` in `frontend/`
- [x] 3.2 Add `MANUAL-TEST-KAN-18.md` with keyboard and visual checklist
