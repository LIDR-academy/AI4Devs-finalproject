# Manual test — KAN-30 (selectable read format)

## Prerequisites

- Backend + frontend running; logged in with books in tracker.

## Inline format column

1. Open **Book Tracker** — confirm **Formato** column exists.
2. New/manual books show empty format (—) until selected.
3. Choose **Ebook** from row selector → value persists after refresh.
4. Clear to empty (—) → `read_format` null after refresh.

## Completion modal

1. Mark a book **Leído** → completion modal opens.
2. Leave format empty, save → format stays empty in column.
3. Re-open via edit or set format in modal → saves correctly.

## Accessibility

1. Tab to format selector — labeled, keyboard operable.

## Regression

- Status, dates, rating, audience columns unchanged.
