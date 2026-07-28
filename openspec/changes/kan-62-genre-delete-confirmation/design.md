# Design: KAN-62 genre delete confirmation

## Approach

Mirror audiences (`GET /v1/audiences/{id}/affected-books`): inject `Book` repository into `GenresService`, count rows with matching `userId` + `genreId`, return DTO. Frontend copies `AudienceSettingsSection` / `FormatSettingsSection` delete preview + `ConfirmModal` pattern.

## Decisions

- Endpoint name `affected-books` (not `/usage`) for consistency with audiences
- No change to DELETE semantics; FK `ON DELETE SET NULL` clears book genres
- Skip modal when `affected_book_count === 0`
