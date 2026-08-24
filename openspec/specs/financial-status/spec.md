# financial-status Specification

## Purpose
TBD - created by archiving change add-status-and-balance. Update Purpose after archive.
## Requirements
### Requirement: Operational status derivation

The system SHALL derive a subscription's operational status as `vigente` (current), `vencido` (expired), or `bloqueado` (blocked) from `estatus`, `fecha_final`, and grace periods, without mutating the cached `estatus` value (R-PLN-03/04/05).

#### Scenario: Current within grace period

- **WHEN** `estatus=1` and `fecha_final + plan.prorroga + empresa_plan.prorroga >= today`
- **THEN** the derived status is `vigente`

#### Scenario: Expired by status flag

- **WHEN** `estatus=0`
- **THEN** the derived status is `vencido`

#### Scenario: Expired by date past grace period

- **WHEN** `estatus=1` but `fecha_final + plan.prorroga + empresa_plan.prorroga < today`
- **THEN** the derived status is `vencido`

#### Scenario: Blocked

- **WHEN** `estatus=4`
- **THEN** the derived status is `bloqueado`

### Requirement: Company outstanding balance

The system SHALL calculate a company's outstanding balance as the sum of `pago.total` for payments with `estatus=2`, as an exact `Decimal` rounded to 2 places, VAT included (R-PAG-04).

#### Scenario: Company with pending payments

- **WHEN** a company has payments with `estatus=2` totaling a known sum
- **THEN** `adeudo_por_empresa` returns that sum as a `Decimal` rounded to 2 places

#### Scenario: Company with no payments

- **WHEN** a company has no payments at all
- **THEN** `adeudo_por_empresa` returns `Decimal("0.00")`

### Requirement: Aggregated balance by client, group, and distributor

The system SHALL calculate a client's, group's, or distributor's outstanding balance as the sum of the outstanding balance of the companies **currently** linked to them via `Assignment` (R-PAG-08). A distributor's balance SHALL include both directly-assigned companies and companies inherited through a group.

#### Scenario: Client balance sums its current companies

- **WHEN** a client has two companies currently assigned to it, each with a known outstanding balance
- **THEN** `adeudo_por_cliente` returns the sum of both

#### Scenario: Distributor balance includes group-inherited companies

- **WHEN** a distributor manages one company directly and a group with another company, and the group has no explicit distributor override
- **THEN** `adeudo_por_distribuidor` sums both companies' outstanding balances

### Requirement: As-of-date balance and status queries

Every `AdeudoService` function SHALL accept an optional `a_fecha` parameter. When provided, aggregation SHALL use the assignments that were current **at that date** (`fecha_inicio <= a_fecha AND (fecha_fin IS NULL OR fecha_fin > a_fecha)`) instead of the presently-current ones.

#### Scenario: Historical aggregation reflects past assignment

- **WHEN** a company was assigned to distributor A until a past date and reassigned to distributor B afterward
- **THEN** `adeudo_por_distribuidor(A, a_fecha=<date before reassignment>)` includes that company's balance
- **AND** `adeudo_por_distribuidor(B, a_fecha=<same date>)` does not

#### Scenario: Omitting a_fecha uses current assignments

- **WHEN** `a_fecha` is not provided
- **THEN** the aggregation uses presently-current assignments, identical to calling with `a_fecha=today`

### Requirement: Status and balance endpoints require permission

The system SHALL require the `financiero.consultar` permission for status and balance endpoints.

#### Scenario: Missing permission is forbidden

- **WHEN** a caller without `financiero.consultar` requests a company's status or any balance endpoint
- **THEN** the response is `403`

### Requirement: Amounts use exact decimal arithmetic

All balance calculations SHALL use `Decimal` arithmetic exclusively; `float` SHALL NEVER be used for money.

#### Scenario: No floating-point rounding drift

- **WHEN** many small payments are summed for a balance
- **THEN** the result matches exact decimal summation, not a `float`-accumulated approximation

