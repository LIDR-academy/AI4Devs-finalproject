## Context

KAN-38 period filter refetches stats on change. KPIs and charts already use `status = leido` + `finished_on` in period bounds. The gallery must use the same qualification so counts stay consistent with `books_read`.

## Decisions

- **Single payload:** embed `books_in_period` on existing stats endpoints (no new route) so one TanStack Query refetch updates KPIs, charts, and gallery together.
- **Ordering:** `finished_on` ascending, then `title` ascending — chronological recap through the period.
- **Summary shape:** `{ id, title, authors, cover_image_url, finished_on }` — minimal fields for display; no full `Book` resource.
- **Frontend layout:** CSS grid with `auto-fill` and fixed aspect-ratio tiles; placeholder tile when `cover_image_url` is null; `alt` text `{title} — {authors}`; title/author overlay on hover for all tiles.
- **Empty period:** gallery omitted when `books_read === 0` (existing empty message); API returns `books_in_period: []`.

## Risks / Trade-offs

- **[Large year libraries]** → grid wraps naturally; no pagination in MVP (typical personal libraries are small).
- **[Missing covers]** → styled placeholder with visible title/author on hover and descriptive `alt`.
