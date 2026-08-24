## ADDED Requirements

### Requirement: Billing is always at the company level

The system SHALL model plan subscriptions and payments as belonging to a single company; group and distributor are never billing levels, only reporting dimensions (R-PLN-01, R-PAG-02).

#### Scenario: Subscription references exactly one company

- **WHEN** an `EmpresaPlan` cache record is created
- **THEN** it references exactly one `Company` and no group or distributor field exists on it

### Requirement: Cache is synced from the ERP through the Gateway, read-only

The system SHALL populate `Plan`, `Complemento`, `EmpresaPlan`, `Pago`, and `CortePlan` exclusively by reading from the ERP Gateway, and SHALL NEVER write plans, add-ons, subscriptions, billing cycles, or payments back to the ERP (R-PLN-08).

#### Scenario: Sync reads, never writes

- **WHEN** `ERPFinanceService.sync_company` runs for a company
- **THEN** it only calls read methods on the ERP Gateway (`get_plans`, `get_payments`, `get_billing_cycles`)

### Requirement: Every cached record carries ultima_sync

Each cached record SHALL carry a timestamp of when it was last refreshed from the ERP.

#### Scenario: Sync stamps ultima_sync

- **WHEN** a company's financial data is synced
- **THEN** every `EmpresaPlan` and `Pago` row touched by that sync has `ultima_sync` set to the sync time

### Requirement: Stale cache is served when the ERP is unavailable

If the ERP is unreachable during a sync attempt, the system SHALL serve the last cached data rather than failing the request, with `ultima_sync` visible so the caller knows it may be stale.

#### Scenario: ERP down during on-demand sync

- **WHEN** a company's financial detail is requested and the ERP Gateway raises an unavailability error during sync
- **THEN** the endpoint still returns the existing cached plans/payments with their stored `ultima_sync`
- **AND** no error is raised to the caller

### Requirement: Payment amounts are itemized and exact

The system SHALL store `subtotal`, `importe_descuento`, `impuesto`, and `total` as separate `Decimal` fields exactly as reported by the ERP, and SHALL NEVER recompute them from `float` arithmetic (R-PAG-05).

#### Scenario: Amounts round-trip exactly

- **WHEN** a payment with `total="578.84"` is cached and later read back
- **THEN** the value is an exact `Decimal("578.84")`, not a `float`-rounded approximation

### Requirement: Complimentary plans are distinguishable from paid sales

The system SHALL preserve `tipo_contrato` (freemium/paid) on cached subscriptions so complimentary and trial plans can later be reported separately from paid sales (R-PLN-07).

#### Scenario: Freemium subscription is tagged

- **WHEN** a subscription with `tipo_contrato=1` (freemium) is cached
- **THEN** `EmpresaPlan.tipo_contrato` stores that value unchanged

### Requirement: Financial endpoints require permission

The system SHALL require the `financiero.consultar` permission to view a company's plans or payments.

#### Scenario: Missing permission is forbidden

- **WHEN** a caller without `financiero.consultar` requests a company's plans or payments
- **THEN** the response is `403`

### Requirement: Company without an active subscription returns a clear empty state

If a company has no subscriptions cached (or none from the ERP), the plans endpoint SHALL return an empty result rather than an error.

#### Scenario: No subscription found

- **WHEN** a company's plans are requested and neither the cache nor the ERP has any subscription for it
- **THEN** the response is `200` with an empty list, not `404` or `500`
