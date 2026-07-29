# Manual test — KAN-22 (Book Tracker page restyle)

## Prerequisites

- Backend + frontend running; logged in with several books in tracker.

## Design system shell

1. Open **Book Tracker** — title uses display font; «Añadir libro» is primary button style.
2. No horizontal scroll on the whole page body (sidebar stays fixed).

## Responsive table

1. Narrow the browser window (~900px) — table scrolls **inside** its container, not the page.
2. Column headers stay aligned; inline selects remain usable.
3. Long titles truncate with full title on hover (`title` attribute).

## Accessibility

1. Tab through table controls — focus rings visible.
2. Table scroll region has accessible name «Biblioteca de libros».

## Regression

- Add book, edit book, status change, completion modal, rating, format, audience all work unchanged.
