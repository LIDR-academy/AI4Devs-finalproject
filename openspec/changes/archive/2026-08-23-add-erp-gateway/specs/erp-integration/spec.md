## ADDED Requirements

### Requirement: Single ERP entry point

The system SHALL access the external ERPs (ADMIN, PEOPLE) exclusively through one **ERP Gateway** component. No other module SHALL open HTTP connections or database connections to the ERPs directly.

#### Scenario: Business and financial services call the gateway

- **WHEN** any service needs ERP data (companies, plans, payments, billing cycles) or performs a client search/create
- **THEN** it calls a method of the ERP Gateway interface
- **AND** it never constructs an ERP URL, HTTP request, or DB query itself

#### Scenario: No direct ERP database access exists

- **WHEN** the codebase is inspected for ERP connectivity
- **THEN** there SHALL be no database credentials or connection configuration pointing at ADMIN or PEOPLE
- **AND** the only ERP transport is HTTP through the gateway's `real` implementation

### Requirement: Mode selection by ERP_MODE

The system SHALL select the gateway implementation at runtime from the `ERP_MODE` setting, with values `mock` and `real`. The default SHALL be `mock` until the real webservices exist.

#### Scenario: Mock mode is the default

- **WHEN** the application starts and `ERP_MODE` is unset
- **THEN** the gateway resolves to the mock implementation
- **AND** the application starts without requiring `ADMIN_API_URL`, `PEOPLE_API_URL`, or ERP tokens

#### Scenario: Real mode requires configuration

- **WHEN** `ERP_MODE=real` and any required ERP URL or token is missing
- **THEN** the application SHALL fail fast at startup with a clear configuration error

#### Scenario: Switching modes does not change the caller contract

- **WHEN** `ERP_MODE` changes between `mock` and `real`
- **THEN** callers of the gateway interface require no code change
- **AND** the returned data shapes are identical

### Requirement: Simulated responses in mock mode

In `mock` mode the gateway SHALL return data read from local JSON **fixtures**, simulating both the request and the response of the real webservices, without any network call.

#### Scenario: Company search served from fixtures

- **WHEN** a company search runs in mock mode for a given ERP and query
- **THEN** the gateway returns matching companies loaded from that ERP's fixture set
- **AND** no outbound network request is made

#### Scenario: Fixtures cover both ERPs and both suites

- **WHEN** fixtures are loaded
- **THEN** they SHALL include companies, plans, and payments for both ADMIN and PEOPLE
- **AND** include the `app` suites `SUITE_A` and `SUITE_B`
- **AND** include at least one pair of companies whose `id_externo` collides across the two ERPs

### Requirement: Real webservice client

In `real` mode the gateway SHALL call the ERP REST/JSON webservices over HTTPS, authenticating each request with a per-ERP token carried in the `Authorization` header, and SHALL apply a request timeout and a bounded retry policy.

#### Scenario: Authenticated request

- **WHEN** the gateway issues a request to an ERP webservice in real mode
- **THEN** the request includes the configured token for that ERP in the `Authorization` header
- **AND** targets the ERP's configured base URL

#### Scenario: Timeout is enforced

- **WHEN** an ERP webservice does not respond within the configured timeout
- **THEN** the gateway aborts the request and surfaces a timeout error to the caller

#### Scenario: Bounded retries on transient failure

- **WHEN** an ERP webservice returns a transient error (5xx or connection error)
- **THEN** the gateway retries up to the configured maximum
- **AND** stops retrying on client errors (4xx)

### Requirement: Response normalization by composite identity

The gateway SHALL normalize ERP responses into internal DTOs and SHALL key every company reference by the composite identity `(proyecto, id_externo)`, because internal ids can overlap between ADMIN and PEOPLE.

#### Scenario: Overlapping ids stay distinct

- **WHEN** ADMIN and PEOPLE both return a company with the same `id_externo`
- **THEN** the gateway represents them as two distinct entities distinguished by `proyecto`

#### Scenario: Consistent DTO regardless of mode

- **WHEN** the same logical company is returned in mock mode and in real mode
- **THEN** the normalized DTO fields and types are identical

### Requirement: Client search-or-create semantics

The gateway SHALL expose client search-by-RFC and client-create operations against ADMIN's `catalogo_clientes`. Client create SHALL be the only operation that writes to an external system.

#### Scenario: Client found

- **WHEN** a search by RFC matches a client in `catalogo_clientes`
- **THEN** the gateway returns the existing client's external identifier

#### Scenario: Client created when absent

- **WHEN** a search by RFC returns no match and a create is requested
- **THEN** the gateway creates the client in `catalogo_clientes` and returns its new external identifier

#### Scenario: No other write operations

- **WHEN** the gateway interface is inspected
- **THEN** the only mutating operation SHALL be client create; all others are read-only

### Requirement: Error and unavailability behavior

The gateway SHALL translate transport and ERP errors into typed errors that callers can act on, distinguishing "unavailable/timeout" from "ERP validation error", so that upstream flows can degrade gracefully.

#### Scenario: Unavailability is distinguishable

- **WHEN** an ERP webservice is unreachable or times out
- **THEN** the gateway raises an "unavailable" error type
- **AND** the client-registration flow can use it to persist the record as `pendiente`

#### Scenario: ERP validation error is distinguishable

- **WHEN** an ERP webservice responds with a validation error
- **THEN** the gateway raises a "validation" error type carrying the ERP message
