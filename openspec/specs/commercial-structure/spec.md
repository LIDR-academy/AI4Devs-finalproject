# commercial-structure Specification

## Purpose
TBD - created by archiving change add-commercial-structure. Update Purpose after archive.
## Requirements
### Requirement: Assignment history with validity, no physical deletion

Every relationship (company↔client, company↔group, company↔distributor, group↔distributor) SHALL be modeled as a time-bounded `Assignment` row with `fecha_inicio` and `fecha_fin`. A `NULL` `fecha_fin` means the assignment is current. Reassigning SHALL close the previous current assignment (`fecha_fin=now`) and create a new one — records are never physically deleted (R-EST-06).

#### Scenario: Reassignment closes and opens

- **WHEN** a company with a current group is assigned to a different group
- **THEN** the previous assignment's `fecha_fin` is set to now
- **AND** a new assignment is created with `fecha_inicio=now` and `fecha_fin=null`
- **AND** the previous row still exists in the database afterward

### Requirement: At most one current assignment per entity and type

The system SHALL guarantee, at the PostgreSQL engine level via a **partial unique index** on `(origen_id, tipo) WHERE fecha_fin IS NULL`, that only one current assignment exists per entity and relationship type (R-EST-01, R-EST-02, R-EST-03, R-EST-05, R-EST-07).

#### Scenario: Concurrent assignment attempts

- **WHEN** two concurrent requests attempt to create a current assignment for the same `(origen_id, tipo)`
- **THEN** the database rejects the second write with an integrity error
- **AND** the API surfaces this as `409 Conflict`

#### Scenario: A company has at most one current client

- **WHEN** a company already has a current client assignment
- **THEN** assigning a new client closes the old one and opens the new one, never leaving two current rows

### Requirement: Distributor inheritance from group

If a company belongs to a current group that has a current distributor, the company SHALL inherit that distributor. A company in a group SHALL NOT be assigned a direct distributor different from the group's (R-EST-04).

#### Scenario: Assigning a company to a group with a distributor

- **WHEN** a company is assigned to a group that has a current distributor
- **THEN** the company's effective distributor becomes the group's distributor without a separate direct-distributor assignment being required

#### Scenario: Direct distributor conflicts with group inheritance

- **WHEN** an operator attempts to assign a direct distributor to a company that belongs to a current group
- **THEN** the response is `409 Conflict` with a message indicating the distributor is inherited from the group

### Requirement: Assigning a group requires no conflicting current group

A company already in a current group SHALL NOT be silently double-assigned; assigning a different group follows the close-and-open flow, but assigning a group must not be confused with a conflict — only the direct-distributor-vs-group case is a hard conflict (R-EST-04).

#### Scenario: Reassigning to another group succeeds

- **WHEN** a company belonging to a current group is assigned to a different group
- **THEN** the previous group assignment is closed and the new one opens, and the response is `200`

### Requirement: Non-existent target entities are rejected

Assigning a company to a client, group, or distributor that does not exist SHALL respond `404`.

#### Scenario: Unknown group id

- **WHEN** an assignment request references a group id that does not exist
- **THEN** the response is `404`

### Requirement: Deregistered companies cannot receive new assignments

A company whose local mirror is not eligible for assignment (per `apps.empresas.services.is_eligible_for_assignment`, i.e. `estado=baja_erp`) SHALL be rejected for any new assignment.

#### Scenario: Assignment attempt on a deregistered company

- **WHEN** an assignment is requested for a company with `estado=baja_erp`
- **THEN** the response is `409 Conflict`

### Requirement: Every assignment is audited

Every successful assignment, reassignment, or removal SHALL emit an audit event (R-EST-08).

#### Scenario: Audit event on assignment

- **WHEN** a company's group is successfully assigned or reassigned
- **THEN** an audit event is recorded identifying the acting user, the company, and the new group

### Requirement: Assignment endpoints require permission

The system SHALL require the `empresa.asignar_cliente` permission for client assignment and `empresa.asignar_grupo` for group/distributor assignment.

#### Scenario: Missing permission is forbidden

- **WHEN** a caller without the relevant permission attempts an assignment
- **THEN** the response is `403`

### Requirement: Group and distributor management

The system SHALL provide CRUD for `Group` and `Distributor` entities, each of which can independently hold a current distributor assignment (for groups) with the same validity rules as company-level assignments.

#### Scenario: Group has at most one current distributor

- **WHEN** a group already has a current distributor and is assigned a different one
- **THEN** the previous group-distributor assignment closes and a new one opens

