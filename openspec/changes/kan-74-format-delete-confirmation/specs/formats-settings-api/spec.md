## MODIFIED Requirements

### Requirement: Delete format

The system SHALL expose `DELETE /v1/formats/{id}` for the authenticated owner and respond HTTP 204 on success.

The system SHALL expose `GET /v1/formats/{id}/affected-readings` returning `{ affected_reading_count }` for the same owned format before the client shows a delete confirmation.

#### Scenario: Delete owned format

- **WHEN** the user DELETEs a format they own
- **THEN** the response is HTTP 204
- **AND** subsequent GET no longer includes that format
- **AND** reading records that referenced the format have `format_id` set to null

#### Scenario: Delete other user's format

- **WHEN** the user DELETEs a format id not owned by them
- **THEN** the response is HTTP 404
