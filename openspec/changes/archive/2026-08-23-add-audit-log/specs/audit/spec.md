## ADDED Requirements

### Requirement: Sensitive actions are persisted append-only

The system SHALL persist every sensitive action (login, user creation, role/permission changes, and future client/assignment actions) as a `Bitacora` record, and SHALL NOT provide any application-level operation to update or delete an existing record.

#### Scenario: Login is recorded

- **WHEN** a user successfully logs in
- **THEN** a `Bitacora` record is created with `accion="login"`, the user's identity, and a timestamp

#### Scenario: No update or delete path exists

- **WHEN** the API surface is inspected
- **THEN** there is no endpoint or serializer action that updates or deletes a `Bitacora` record

### Requirement: Audit record captures actor, action, and target

Each `Bitacora` record SHALL capture who performed the action, what action, which entity it affected, and when.

#### Scenario: Record shape

- **WHEN** a `Bitacora` record is created
- **THEN** it includes `usuario`, `accion`, `entidad`, `entidad_id` (nullable when not entity-scoped), `detalle`, and `fecha`

### Requirement: Audit log is queryable by permission

The system SHALL expose a read endpoint to query the audit log, restricted to callers holding the `auditoria.consultar` permission.

#### Scenario: Authorized query

- **WHEN** a user with `auditoria.consultar` calls `GET /api/auditoria`
- **THEN** the response lists audit records ordered most-recent first

#### Scenario: Unauthorized query is forbidden

- **WHEN** a user without `auditoria.consultar` calls `GET /api/auditoria`
- **THEN** the response is `403`

### Requirement: Audit recording never blocks the primary action

Failure to write an audit record SHALL NOT prevent the sensitive action itself from completing, but SHALL be logged for operational visibility.

#### Scenario: Audit write failure does not roll back the action

- **WHEN** the audit persistence step fails unexpectedly during a login
- **THEN** the login still succeeds and the failure is logged separately
