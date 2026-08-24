# reporting Specification

## Purpose
TBD - created by archiving change add-reporting-engine. Update Purpose after archive.
## Requirements
### Requirement: Flexible query by measure, dimensions, filters, and date

The system SHALL expose `POST /api/reportes/consulta` accepting a measure, one or more dimensions, optional filters, and an optional `a_fecha`, returning rows grouped by the requested dimensions with the computed measure per row and a `total`.

#### Scenario: Query by distributor and company

- **WHEN** a query requests measure `adeudo` grouped by `distribuidor` and `empresa`, filtered by `proyecto=ADMIN`
- **THEN** the response lists one row per `(distribuidor, empresa)` combination with its `adeudo` value and an overall `total`

#### Scenario: Empty result is not an error

- **WHEN** a query matches no data
- **THEN** the response is `200` with an empty row list and `total=0`

### Requirement: Invalid measure × dimension combinations are rejected

The system SHALL validate that the requested measure supports the requested dimensions before executing, responding `400` with an explanation otherwise.

#### Scenario: Unsupported dimension for a measure

- **WHEN** a query requests a dimension the selected measure does not support
- **THEN** the response is `400` describing the invalid combination

#### Scenario: Malformed filter value

- **WHEN** a filter value cannot be parsed for its expected type (e.g. a non-numeric `adeudo_min`)
- **THEN** the response is `400`

### Requirement: Aggregates reflect current EyeMaster assignments

Aggregation by client, group, or distributor SHALL be based on companies **currently** assigned to them in EyeMaster (R-REP-01), consistent with `AdeudoService`.

#### Scenario: Client aggregate matches current assignment

- **WHEN** a report aggregates `adeudo` by `cliente`
- **THEN** each client's value equals the sum of the outstanding balance of companies presently assigned to that client

### Requirement: As-of-date queries reconstruct historical assignment state

When `a_fecha` is provided, the system SHALL resolve dimension membership (which companies belonged to which client/group/distributor) using assignment history as of that date, not the current state (R-REP-02).

#### Scenario: Historical distributor aggregate

- **WHEN** a report with `a_fecha` set to a date before a company's distributor reassignment aggregates by `distribuidor`
- **THEN** the company's balance is attributed to the distributor that was current on that date, not the current one

### Requirement: Predefined report catalog

The system SHALL expose `GET /api/reportes/catalogo` listing predefined reports, each executable as a fixed measure/dimensions/filters payload through the same flexible engine.

#### Scenario: Catalog entry executes through the same engine

- **WHEN** a catalog entry is selected and run
- **THEN** its result is identical to calling `POST /api/reportes/consulta` directly with that entry's payload

### Requirement: Reporting is read-only

The reporting engine SHALL NOT modify any data (R-REP-04).

#### Scenario: Query performs no writes

- **WHEN** any report or catalog entry is executed
- **THEN** no database write occurs as part of serving the request

### Requirement: Reporting endpoints require permission

The system SHALL require the `reportes.consultar` permission for both the flexible query and catalog endpoints.

#### Scenario: Missing permission is forbidden

- **WHEN** a caller without `reportes.consultar` calls either reporting endpoint
- **THEN** the response is `403`

