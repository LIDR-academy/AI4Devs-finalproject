## ADDED Requirements

### Requirement: Progress reflects reading record reversions

The system SHALL decrement `books_read` and recalculate `progress_percent` and `forecast` on `GET /v1/goals/{year}` when a book no longer qualifies for the year count (status reverted from `leido` or `finished_on` moved outside the year).

#### Scenario: Decrement when status reverts from leido (KAN-14)

- **WHEN** a book previously counted in year 2026 (`status = leido`, `finished_on` in 2026) is patched to `leyendo`
- **THEN** `GET /v1/goals/2026` returns `books_read` one less than before the revert

#### Scenario: Decrement when finished_on moves out of goal year (KAN-14)

- **WHEN** a `leido` book's `finished_on` is changed from 2026-06-15 to 2025-12-31
- **THEN** `GET /v1/goals/2026` decrements `books_read` and `GET /v1/goals/2025` increments `books_read`

#### Scenario: Book finished outside goal year does not increment (KAN-14)

- **WHEN** the user marks a book `leido` with `finished_on` in 2025 while the active goal is for 2026
- **THEN** `GET /v1/goals/2026` does not increment `books_read`
