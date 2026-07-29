## Why

US-07 (UC-01 alt 5a) requires editing all book metadata from Book Tracker. KAN-9 only delivered catalog search add. KAN-26 starts the manual edit flow with the row-level entry point and modal shell before full form (KAN-28), backend PATCH expansion (KAN-27), and «Crear manualmente» from search (KAN-29).

## What Changes

- **Actions column** on Book Tracker with accessible pencil (edit) button per row.
- **`BookFormModal`** shell using KAN-18 `Modal` + `Button`; opens in edit mode from pencil; Save disabled until KAN-28.
- **Page state** in `BookTrackerPage` for open/close and selected book.

**Non-goals (this change):** Form fields, save/API, manual create from search, backend PATCH beyond existing audience-only DTO.

## Capabilities

### New Capabilities

- `manual-book-edit-ui`: Book Tracker edit entry point and modal shell (US-07 scenario 1 entry).

### Modified Capabilities

- _(none — add-book-ui unchanged until KAN-29)_

## Impact

- **Frontend:** `BookTrackerRow.tsx`, `BookTrackerPage.tsx`, new `BookFormModal.tsx`.
- **Depends on:** KAN-18 UI kit (`Modal`, `Button`), existing `Book` list API.
- **Product refs:** KAN-26, US-07, UC-01 alt 5a.
