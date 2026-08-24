## ADDED Requirements

### Requirement: RFC is unique locally

The system SHALL enforce that a client's RFC is unique within EyeMaster, and SHALL check this **before** calling the ERP, to avoid propagating duplicates.

#### Scenario: Duplicate RFC rejected without calling the ERP

- **WHEN** a registration request uses an RFC that already exists locally
- **THEN** the system responds `409 Conflict`
- **AND** no call is made to the ERP Gateway

### Requirement: Search-then-create against ADMIN's client catalog

The system SHALL search for the client by RFC in ADMIN's `catalogo_clientes` via the ERP Gateway before creating anything. If found, the local record links to the existing client; if not found, the system creates it in the catalog.

#### Scenario: RFC exists in ADMIN

- **WHEN** a registration request's RFC is found in `catalogo_clientes`
- **THEN** the client is linked locally with `origen=existente`
- **AND** the response is `201` with `estado_sync=sincronizado`

#### Scenario: RFC does not exist in ADMIN

- **WHEN** a registration request's RFC is not found in `catalogo_clientes`
- **THEN** the system creates it via the ERP Gateway and links locally with `origen=creado`
- **AND** the response is `201` with `estado_sync=sincronizado`

### Requirement: Graceful degradation when the ERP is unavailable

The system SHALL NOT fail a registration outright when the ERP webservice is unreachable; instead it SHALL save the client locally as `pendiente` and allow a later retry.

#### Scenario: ERP unavailable during registration

- **WHEN** the ERP Gateway raises an unavailability error while searching or creating a client
- **THEN** the client is saved locally with `estado_sync=pendiente`
- **AND** the response is `202 Accepted`

#### Scenario: ERP validation error surfaces to the caller

- **WHEN** the ERP Gateway raises a validation error while creating a client
- **THEN** the response is `400` with the ERP's message
- **AND** no local client record is created

### Requirement: Retry synchronizes a pending client

The system SHALL allow retrying synchronization for a client in `pendiente` or `error` state, re-running the search-then-create flow.

#### Scenario: Retry succeeds

- **WHEN** a retry is requested for a `pendiente` client and the ERP now responds
- **THEN** the client's `estado_sync` becomes `sincronizado` and `origen`/`id_admin_catalogo_clientes` are set accordingly

#### Scenario: Retry still fails

- **WHEN** a retry is requested and the ERP is still unavailable
- **THEN** the client remains `pendiente` and the response reflects the retry did not complete

### Requirement: Successful registration is audited

Every successful client registration (both `existente` and `creado`) and every successful retry SHALL emit an audit event, since client registration is a sensitive action.

#### Scenario: Audit event on registration

- **WHEN** a client registration completes successfully (`201`)
- **THEN** an audit event is recorded identifying the acting user, the action, and the client's RFC

### Requirement: Client listing and detail

The system SHALL expose endpoints to list and view registered clients, including their sync status.

#### Scenario: List includes sync status

- **WHEN** an authenticated caller with the required permission lists clients
- **THEN** each entry includes `rfc`, `razon_social`, `origen`, and `estado_sync`

### Requirement: Registration requires permission

The system SHALL require the `cliente.crear` permission to register a client, and `cliente.consultar` to list/view clients, enforced by the existing RBAC.

#### Scenario: Missing permission is forbidden

- **WHEN** a caller without `cliente.crear` submits a registration
- **THEN** the response is `403`
