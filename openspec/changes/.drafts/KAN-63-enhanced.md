# KAN-63 Enhanced User Story

## Original

Smart genre mapping on import: map external genres to user-owned labels; prompt when no match (catalog add + Goodreads import preview).

## Enhanced

### Backend

- `GenreMatcherService`: exact case-insensitive match + KAN-56 synonym keywords scoped to genres the user owns
- `POST /v1/genres/match` and `POST /v1/genres/match-batch`
- Catalog search returns raw provider genre (no fixed taxonomy rewrite)
- Import enrichment uses matcher; unresolved stays null unless `genre_resolutions` supplied
- `POST /import/goodreads/preview` groups unresolved catalog genres by distinct raw value
- `POST /import/goodreads` accepts optional `genre_resolutions` JSON in multipart

### Frontend

- Add book modal: when catalog genre unresolved, show assign/create/skip UI before save
- Import page: preview step resolves grouped genres once, then starts import with resolutions map

### Tests

- Unit: matcher exact/synonym/unresolved
- Integration: match endpoints; import preview + enrichment with resolutions
