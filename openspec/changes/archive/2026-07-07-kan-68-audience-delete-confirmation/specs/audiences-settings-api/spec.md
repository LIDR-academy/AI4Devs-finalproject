## MODIFIED Requirements

### Requirement: Delete audience

The system SHALL expose `DELETE /v1/audiences/{id}` for the authenticated owner and respond HTTP 204 on success.

The system SHALL expose `GET /v1/audiences/{id}/affected-books` returning `{ affected_book_count }` for the same owned audience before the client shows a delete confirmation.

#### Scenario: Delete owned audience

- **WHEN** the user DELETEs an audience they own
- **THEN** the response is HTTP 204
- **AND** subsequent GET no longer includes that audience
- **AND** books that referenced the audience have `audience_id` set to null

#### Scenario: Delete other user's audience

- **WHEN** the user DELETEs an audience id not owned by them
- **THEN** the response is HTTP 404
