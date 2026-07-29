# Manual test — KAN-39 Cover gallery

## Prerequisites

- Backend on `http://localhost:3000` with at least one book `leido` in the current period
- Frontend on `http://localhost:5173`, logged in

## Steps

1. Open `/stats` with year mode and a year that has finished books.
2. Scroll past the chart grid — confirm **Recap visual** section with cover tiles.
3. Hover a tile — title and author appear (desktop); on mobile they stay visible.
4. Switch to month mode and pick a month with reads — gallery updates to that month only.
5. Pick an empty month/year — empty-state message, no gallery.
6. Use a book without `cover_image_url` — placeholder tile with accessible label.

## Expected

- Gallery length matches KPI «Libros leídos».
- No horizontal page overflow on narrow viewport.
- `alt` on images includes title and author.
