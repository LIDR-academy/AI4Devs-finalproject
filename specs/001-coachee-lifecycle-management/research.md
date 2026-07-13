# Research: Coachee Lifecycle Management

**Phase**: 0 — Outline & Research
**Date**: 2026-07-13

## Overview

No NEEDS CLARIFICATION items were identified. The feature spec, existing API specification (`docs/api-specifications.md`), Prisma schema, and constitution provide explicit guidance for all technical decisions.

## Decisions

| Decision | Resolution | Rationale |
|----------|-----------|-----------|
| Coachee entity | Coachee is a `User` with `role = COACHEE` (not a separate table) | Prisma schema already has `User` model with `role` enum including `COACHEE`. All required fields (name, email, phone, level_id, class_type_preference, status) exist. |
| Password on create | Auto-generated random password, hashed with bcrypt cost 12 | API spec §POST /coachees notes this as ambiguous. The auth foundation (EP-01) will handle invitation flow. For now, generate a secure random password. |
| Auth/role guards | `requireRole('ADMIN')` on POST and PATCH status; `requireRole('ADMIN', 'COACH')` on GET list, GET/:id, PUT, PATCH level | API spec explicitly documents per-endpoint auth/role requirements. |
| Notification #11 | Level change triggers notification via `NotificationService` (EP-04) | Spec FR-009. The notification adapter is not implemented yet — stub the call for now. |
| Response format | Standard envelope: list = `{ data, meta }`, single = resource object, errors = `{ error: { code, message, ref } }` | Constitution §IV + existing error handler and route stubs. |
| Excluded fields | `bank_account`, `ssn`, `dni` MUST never appear in coachee responses | FR-011, API spec note, PRD §10.3. |

## Alternatives Considered

- **Separate Coachee table**: Rejected. User model already has role-based differentiation. A separate table would require joins and complicate the schema unnecessarily.
- **Admin-only for all endpoints**: Rejected. API spec explicitly allows Coach access to read/update/level-change endpoints.
