# Manual test — KAN-24 (Lists / TBR restyle)

## Prerequisites

- Backend + frontend running.
- Authenticated user with at least one month of TBR entries and one empty month.

## Visual layout

1. Open `/lists`.
2. Verify page header and month navigation use design-system styling.
3. Verify checklist entries render as coherent soft cards.
4. Verify empty month state renders as a card with clear primary action.

## Behavior regression

1. Navigate previous/next month; title and data update correctly.
2. Add book to list from empty and non-empty states.
3. Remove an entry from checklist.

## Responsiveness and accessibility

1. Resize viewport (desktop/tablet/mobile) and confirm no horizontal overflow.
2. Tab through month controls and add/remove actions; focus remains visible.
