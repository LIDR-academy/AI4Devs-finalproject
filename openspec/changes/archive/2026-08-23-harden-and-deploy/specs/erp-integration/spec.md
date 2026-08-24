## ADDED Requirements

### Requirement: Circuit breaker on sustained ERP failure

The real ERP Gateway implementation SHALL open a circuit breaker per ERP after a configurable number of consecutive failures, short-circuiting further requests to that ERP with `ERPUnavailableError` for a cooldown window instead of repeating the full timeout-and-retry cycle on every call.

#### Scenario: Breaker opens after consecutive failures

- **WHEN** requests to an ERP fail consecutively at least `ERP_CIRCUIT_BREAKER_THRESHOLD` times
- **THEN** subsequent calls to that same ERP fail immediately with `ERPUnavailableError`, without attempting a network request, until the cooldown elapses

#### Scenario: Breaker is scoped per ERP

- **WHEN** ADMIN's circuit breaker is open
- **THEN** calls to PEOPLE are unaffected and proceed normally

#### Scenario: Breaker resets after cooldown

- **WHEN** the configured cooldown window has elapsed since the breaker opened
- **THEN** the next call is attempted normally, and the breaker closes again on success

#### Scenario: Successful call resets the failure counter

- **WHEN** a call to an ERP succeeds
- **THEN** its consecutive-failure counter resets to zero
