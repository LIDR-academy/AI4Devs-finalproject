# Proposal: KAN-62 genre delete confirmation

## Why

Deleting a genre that is assigned to books currently happens with one click. Users need a clear preview of impact (book count) before confirming, matching audience and format Settings UX.

## What changes

- Add `GET /v1/genres/{id}/affected-books` returning `{ affected_book_count }`
- Genre Settings: fetch count on delete; confirm modal when count > 0; direct delete when 0
- Docs + tests for the preview endpoint and nulling of `genre_id` after delete

## Capabilities

### New Capabilities

- `genre-delete-confirmation`: affected-book preview API and Settings confirmation UX

### Modified Capabilities

- (none)

## Impact

- Backend: `GenresModule` / service / controller
- Frontend: `GenreSettingsSection`, API client/types
- Specs: `docs/api-spec.yml`
