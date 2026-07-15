# Research: Coach Lifecycle & Financial Data

## 1. Entity Relationship: Coach vs User

- **Decision**: Coaches are stored in the existing `User` table with `role = COACH`. No separate Coach model needed.
- **Rationale**: The Prisma schema already has `bank_account`, `ssn`, `dni` fields on `User`, plus `role` enum with `COACH`. Following the coachee pattern where `Coachee` domain entity wraps a `User` with `role = COACHEE`.
- **Alternatives considered**: Separate `Coach` model — rejected because it duplicates the existing User schema and adds join complexity for scheduling/classes.

## 2. Encryption Approach for Financial Data

- **Decision**: Use Node.js built-in `crypto` module with AES-256-GCM. Implement `EncryptionService` adapter in infrastructure layer.
- **Rationale**: Constitution (III) mandates AES-256-GCM. Node.js `crypto` module provides this natively — no external dependency needed. The encryption key is injected via `ENCRYPTION_KEY` environment variable (hex-encoded 256-bit key).
- **Alternatives considered**: `bcrypt` (one-way hash — not suitable since we need to decrypt), `crypto-js` (external dep — unnecessary), AWS KMS (overkill for single-gym operation).

## 3. Financial Data Isolation Strategy

- **Decision**: The `Coach` domain entity NEVER includes financial fields. Financial data is only returned through `GetCoachFinancialData` use case which queries the `User` table directly and decrypts fields. Repository has a separate `findFinancialData(id)` method.
- **Rationale**: Constitution requires "Financial data is never included in list or general detail responses." Following principle of least privilege at the domain entity level.
- **Alternatives considered**: Returning `Coach` entity with `bankAccount` set to `undefined` — risk of accidental exposure. Adding an `omit` transform — fragile.

## 4. Audit Logging Infrastructure

- **Decision**: Create a `SecurityAuditLog` Prisma model and `AuditLogger` domain service interface with `PrismaAuditLogger` infrastructure implementation.
- **Rationale**: Constitution Section III requires "Every auth attempt, class creation/cancellation, waiting list join/leave, role/level change, and access to coach financial data MUST be logged with actor ID, action, resource, and outcome."
- **Alternatives considered**: File-based logging — not queryable. External service — overkill. In-memory — lost on restart.

## 5. Frontend Pattern

- **Decision**: Follow the exact coachee pattern — domain types, use cases (framework-agnostic), infra hooks, UI pages (admin/CoachesPage, admin/CoachDetailPage, admin/CoachFinancialDataPage).
- **Rationale**: Frontend is already refactored to Hexagonal Architecture with this exact pattern for coachees. Consistency reduces cognitive load.
- **Alternatives considered**: None — this is the established project convention.

## 6. Password for Coach Creation

- **Decision**: Generate a random password using `crypto.randomUUID()` hashed with bcrypt cost factor 12 (same as coachee creation). Coach credential delivery is out of scope.
- **Rationale**: Following existing coachee pattern. The spec assumes credential setup is handled separately.
- **Alternatives considered**: Requiring a password on creation — changes API contract and UX.
