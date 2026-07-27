## Original

**KAN-61**: Replace free-text genre with closed selector from user genres in add/edit book modals. Backend Create/Update accept `genre_id` (UUID|null) with ownership validation. Empty genres list: allow Sin género + link to Settings.

## Enhanced

### Backend

- CreateBookDto / PatchBookDto: `genre_id` UUID|null instead of `genre` string
- BookDto: add `genre_id`; keep `genre` as display name from relation
- `resolveGenreId` mirrors `resolveAudienceId` (400 GENRE_NOT_FOUND)
- Create/update set `books.genre_id` from owned id only (no find-or-create on book write)

### Frontend

- `GenreSelect` (mirror AudienceSelect) — `listGenres`, empty → Settings link
- BookFormModal: replace genre Input with GenreSelect (`genre_id`)
- AddBookModal: GenreSelect; preselect match to catalog genre name when possible
- bookForm + types + catalogEditionToCreatePayload use `genre_id`

### Tests / docs

- Integration: create/patch with genre_id; reject foreign genre_id
- Update api-spec.yml

### Out of scope

- Delete confirmation (KAN-62); Settings CRUD (done KAN-60)
