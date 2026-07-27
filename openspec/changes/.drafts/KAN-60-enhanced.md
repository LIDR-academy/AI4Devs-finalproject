## Original

**KAN-60**: CRUD de géneros en Settings (backend + frontend). Usuario puede ver lista, añadir y borrar géneros (sin edición/renombrado). Endpoints GET/POST/DELETE `/v1/genres` con JWT. Validación name 1-100, duplicados case-insensitive → 409. Frontend sección Géneros en Settings. Delete confirmation flow is KAN-62.

## Enhanced

### Backend

- `GET /v1/genres` — list user genres ordered by name
- `POST /v1/genres` `{ name }` — create custom (`is_default=false`); trim; 1–100; 409 `GENRE_DUPLICATE`
- `DELETE /v1/genres/{id}` — 204; ownership scoped; FK SET NULL on books
- Extend `GenresService`: `listForUser`, `createForUser`, `deleteForUser`
- DTOs + `GenresController`; register in module
- OpenAPI: Genres tag + paths + schemas

### Frontend

- Types `Genre`; client `listGenres` / `createGenre` / `deleteGenre`
- `GenreSettingsSection` on Profile/Settings (list, add form, delete button)
- Immediate delete in KAN-60; confirmation modal deferred to KAN-62

### Tests / docs

- Unit: duplicate 409; integration GET/POST/DELETE
- Update `docs/api-spec.yml`

### Out of scope

- Rename/edit; delete confirmation (KAN-62); book selector (KAN-61)
