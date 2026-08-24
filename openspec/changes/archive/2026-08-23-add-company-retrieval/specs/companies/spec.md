## ADDED Requirements

### Requirement: Real-time company search

The system SHALL search companies directly against the chosen ERP through the ERP Gateway, without requiring a prior local mirror.

#### Scenario: Search returns ERP results

- **WHEN** an operator searches companies in `ADMIN` by name or id
- **THEN** the system returns matching companies as read from the ERP Gateway, not from local storage

#### Scenario: No matches

- **WHEN** a search returns no results
- **THEN** the system responds with an empty result set, not an error

### Requirement: Retrieval creates or refreshes a local mirror

Selecting a company SHALL create a local mirror keyed by `(proyecto, id_externo)` if none exists, or refresh the existing one, always updating `ultima_sync`.

#### Scenario: First retrieval creates a mirror

- **WHEN** a company with no existing local mirror is retrieved
- **THEN** a new `Company` record is created with the ERP's current base data and `ultima_sync` set to now

#### Scenario: Repeated retrieval refreshes the same mirror

- **WHEN** a company that already has a local mirror is retrieved again
- **THEN** the existing record is updated (not duplicated) and `ultima_sync` advances

### Requirement: EyeMaster never writes to the ERP through this capability

The system SHALL only read from the ERP when searching or retrieving companies; it SHALL NOT create, modify, or delete companies in ADMIN or PEOPLE.

#### Scenario: Retrieval performs no ERP write

- **WHEN** a company is retrieved
- **THEN** only read operations (`search_companies`/`get_company`) are called on the ERP Gateway

### Requirement: Composite identity per ERP

Every mirrored company SHALL be uniquely identified by the pair `(proyecto, id_externo)`, since ids can collide between ADMIN and PEOPLE.

#### Scenario: Same id_externo in both ERPs stays distinct

- **WHEN** ADMIN and PEOPLE both have a company with the same `id_externo`
- **THEN** retrieving each produces two distinct local `Company` records, one per `proyecto`

### Requirement: Base data mirrors the ERP; ERP prevails on conflict

Mirrored fields (`razon_social`, `nombre_comercial`, `app`) SHALL reflect the ERP's current values on each retrieval; the local mirror is never the source of truth for these fields.

#### Scenario: Refresh overwrites stale local data

- **WHEN** the ERP's `razon_social` differs from what is stored locally and the company is retrieved again
- **THEN** the local mirror is updated to match the ERP's current value

### Requirement: Deregistered companies block new assignments

A company whose ERP `estado` is `baja_erp` SHALL be reflected as such locally and SHALL be blocked from new commercial assignments.

#### Scenario: Deregistered company detected on refresh

- **WHEN** a mirrored company is retrieved again and the ERP now reports `estado=baja_erp`
- **THEN** the local mirror's `estado` becomes `baja_erp`

#### Scenario: Assignment guard is available for later use

- **WHEN** a company's local `estado` is `baja_erp`
- **THEN** a reusable guard function reports the company as not eligible for new assignments, for `add-commercial-structure` to enforce

### Requirement: Search and retrieval require permission

The system SHALL require the `empresa.recuperar` permission for search and retrieval endpoints.

#### Scenario: Missing permission is forbidden

- **WHEN** a caller without `empresa.recuperar` calls search or retrieval
- **THEN** the response is `403`
