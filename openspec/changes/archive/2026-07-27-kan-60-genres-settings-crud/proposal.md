# Proposal: Genres Settings CRUD (KAN-60)

## Why

Users need to manage their genre labels in Settings after KAN-59 introduced the `genres` table.

## What changes

- REST CRUD: list / create / delete under `/v1/genres`
- Settings UI section "Géneros" on Profile page
- OpenAPI + integration tests

## Capabilities

### New

- `genres-settings-api` — genres Settings list/create/delete API and UI

### Modified

- None (data model already in `user-genres`)

## Impact

- `backend/src/genres/` controller + service CRUD methods
- `frontend` Settings section + API client
- `docs/api-spec.yml`
