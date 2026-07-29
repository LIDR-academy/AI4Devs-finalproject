## Why

KAN-71 introduced the `formats` table and migration. Users need Settings UI and REST API to manage custom read formats before the reading-flow selector (KAN-73).

## What Changes

- Add authenticated `GET/POST/DELETE /v1/formats` endpoints.
- Add **Formato** section on Profile / Settings to list, add, and delete formats.
- Validate name length and case-insensitive uniqueness (409 on duplicate).

**Out of scope:** rename, delete confirmation modal (KAN-74), affected-record count endpoint.

## Capabilities

### New Capabilities

- `formats-settings-api`: REST CRUD (list/create/delete) for user formats in Settings.

### Modified Capabilities

- _(none)_

## Impact

- **Backend:** `formats` controller, service methods, DTOs, tests.
- **Frontend:** Settings section, API client.
- **Docs:** `docs/api-spec.yml`.
