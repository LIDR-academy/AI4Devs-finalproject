# Design: Genre book selector (KAN-61)

## Approach

Mirror `audience_id` end-to-end. Catalog create no longer auto-creates genres from free text; AddBookModal may preselect a matching owned genre by name.

## Ownership

`GenresService.findOwnedById` → 400 `GENRE_NOT_FOUND` if missing/foreign.
