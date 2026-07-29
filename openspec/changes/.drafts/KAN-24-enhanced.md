## Original

**KAN-24** — Estilo + maquetación: Lists / TBR

Aplicar tokens/componentes de KAN-18 a **Lists / TBR**: listas TBR y personalizadas con checklist y orden visual coherentes, cards suaves, sin desbordamiento. WCAG 2.1 AA.

## Enhanced

### Problem

Lists/TBR still uses legacy styling (hard-coded colors, basic spacing), and checklist/cards are not fully aligned with the design system used in other restyled pages.

### Scope (in)

- Restyle `ListsPage` with design-system page shell and tokenized spacing.
- Harmonize TBR checklist visuals (entry cards, completed state, controls) with soft card styling.
- Ensure responsive behavior without horizontal overflow.
- Keep current TBR behaviors unchanged (month navigation, add/remove, empty/loading/error states).

### Scope (out)

- New TBR functionality or API changes.
- Full redesign of modal behavior logic.

### Acceptance criteria

1. Lists/TBR page uses token-based layout and coherent spacing.
2. Checklist entries and empty state present as consistent soft cards.
3. No horizontal overflow in page content.
4. Existing month navigation and add/remove flows continue to work.
5. `npm run build` succeeds in `frontend`.
