## Original

**KAN-72**: CRUD de formatos en Settings (backend + frontend).

- Backend: `GET /v1/formats`, `POST /v1/formats` (`{ name }`), `DELETE /v1/formats/{id}` under JWT, scoped by `user_id`.
- Validation: case-insensitive duplicates → 409; name length 1–100.
- Frontend: new "Formato" section in Profile / Settings, same visual pattern as Audiencia.
- No rename (out of scope). Delete confirmation deferred to KAN-74.

## Enhanced

Mirror KAN-66 audiences Settings CRUD:

### Backend (`backend/src/formats/`)

- `FormatsController` — GET list, POST create, DELETE by id (JWT guard).
- Extend `FormatsService` with `listForUser`, `createForUser`, `deleteForUser`, `findOwnedById`.
- DTOs: `CreateFormatDto`, `FormatResponseDto` + `toFormatResponse`.
- Register controller in `FormatsModule`.
- Unit tests: duplicate rejection, create, delete, list.
- Integration: `formats.integration-spec.ts` (GET/POST/DELETE with JWT).

### Frontend

- API: `listFormats`, `createFormat`, `deleteFormat` in `client.ts`; `Format` type in `types.ts`.
- `FormatSettingsSection` + CSS (mirror `AudienceSettingsSection`, simpler delete without confirmation modal).
- Wire into `ProfilePage` below audience section.

### Docs

- `docs/api-spec.yml` — `/formats` paths and schemas.

### Out of scope (later tickets)

- `GET /formats/{id}/affected-records` and delete confirmation (KAN-74).
- Format selector in reading flow (KAN-73).
