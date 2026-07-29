## ADDED Requirements

### Requirement: Settings audience management API

The system SHALL provide authenticated REST endpoints to list, create, and delete user-owned audiences as specified in `audiences-settings-api`.

#### Scenario: Settings reflects API state

- **WHEN** the user opens Settings > Audiencia
- **THEN** the listed audiences match `GET /v1/audiences`
