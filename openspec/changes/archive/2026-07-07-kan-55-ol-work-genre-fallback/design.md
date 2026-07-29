## Decisions

1. **Work resolution** — `/works/OL…W` direct; `/books/OL…M` via edition `works[0].key`.
2. **Order** — Google Books genre (KAN-54) first, then OL work subjects.
3. **Timeout** — 3s race in `CatalogService`, same as GB lookup.
4. **Books create** — `enrichEdition({ resolveGenre: false })` for page count only; genre via `CatalogService.resolveMissingGenre`.
