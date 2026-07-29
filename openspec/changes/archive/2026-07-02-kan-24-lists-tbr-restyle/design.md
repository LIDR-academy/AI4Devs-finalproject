## Context

`ListsPage` already supports month navigation, empty state, checklist rows, and add/remove flows, but visuals use legacy CSS and hard-coded colors. KAN-24 should be a presentation-only refactor aligned with KAN-18.

## Approach

1. Replace custom page header with `PageHeader`.
2. Use a compact action/nav row with tokenized button styles and spacing.
3. Keep checklist semantics (`ul`/`li`) while styling rows as soft cards using design tokens.
4. Tokenize error/empty/controls styles in `ListsPage.css`.
5. Preserve existing component behavior (`TbrEntryRow`, `TbrEmptyState`, `AddToTbrModal` interactions).

## Accessibility

- Preserve semantic list and button labels.
- Keep visible focus styles via shared button/input patterns.
- Ensure no horizontal overflow in content area.

## Verification

- `npm run build` in `frontend`.
- Manual checks for month navigation, empty state action, add/remove item flow, and responsive layout.
