## MODIFIED Requirements

### Requirement: Rating validation

The system SHALL accept `rating` as a number from 0.5 to 5.0 inclusive in steps of 0.5, or omit/null to clear when supported by API contract.

#### Scenario: Valid half-star rating

- **WHEN** the client sends `rating: 3.5` on a `leido` book
- **THEN** the system persists `3.5` and returns it in the reading record response

#### Scenario: Invalid rating below range

- **WHEN** the client sends `rating: 0` or `rating: 0.25`
- **THEN** the system responds with HTTP 400

#### Scenario: Invalid rating above range

- **WHEN** the client sends `rating: 5.5` or `rating: 6`
- **THEN** the system responds with HTTP 400

#### Scenario: Invalid non-half-step rating

- **WHEN** the client sends `rating: 3.3`
- **THEN** the system responds with HTTP 400
