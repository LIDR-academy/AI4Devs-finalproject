# Implementation Plan: Default Password & Force Change on First Login

**Branch**: `004-default-password-force-change` | **Date**: 2026-07-15 | **Spec**: [spec.md](spec.md)

**Input**: Feature specification from `specs/004-default-password-force-change/spec.md`

## Summary

When an Admin creates a coachee, the coachee's **phone number** is used as the default password and a `must_change_password` flag is set to `true`. On first login, the coachee is forced to change their password before accessing the app. This fixes the current gap where `CreateCoachee` generates a random UUID as password hash — making login impossible. The change-password endpoint is also available for any authenticated user.

## Technical Context

**Language/Version**: TypeScript (Node.js 22 LTS backend, React 18 frontend)

**Primary Dependencies**: Express, Prisma, Zod, jsonwebtoken, bcrypt, React 18, Vite, TanStack React Query v5, React Router v6, TailwindCSS v4

**Storage**: PostgreSQL via Prisma ORM

**Testing**: Vitest + Supertest (backend integration/unit)

**Target Platform**: Web (desktop for Admin/Coach, mobile-first for Coachee)

**Project Type**: Web application (backend + frontend)

**Performance Goals**: Password change completes and redirects within 3s (from spec SC-005); invalid attempts show error within 2s (SC-008)

**Constraints**: Constitution: passwords hashed with bcrypt cost factor 12, no raw SQL, all error responses use `{ error: { code, message, ref } }`, phone becomes required for coachee creation

**Scale/Scope**: All 3 roles affected (Admin creates coachee; Coachee forced change; any role can use change-password endpoint)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| Gate | Status | Notes |
|------|--------|-------|
| Domain purity (zero infra deps in domain) | ✅ Pass | No domain changes needed — password hashing is infrastructure (bcrypt adapter) |
| Test-first domain logic | ✅ Pass | Domain logic unchanged; new tests for CreateCoachee use case (password = phone), change-password flow, and login mustChangePassword response |
| Security-by-default | ✅ Pass | bcrypt cost 12 for password hashing; current password verified before allowing change; change-password endpoint requires auth (any role); rate limiting on auth endpoints |
| API contract consistency | ✅ Pass | All responses follow standard envelope; new POST /auth/change-password returns `{ message }`; login/refresh responses add `mustChangePassword` field to user object |
| Dependency integrity | ✅ Pass | No new dependencies needed (bcrypt already used, Prisma already present) |
| Phone required for coachee creation | ✅ Pass | Phone field changes from optional to required — aligns with PRD Section 6.2 (coachee table has Phone column) |
| must_change_password at DB level | ✅ Pass | New column on User table with default `true` — managed via Prisma migration |

**Violations**: None.

## Complexity Tracking

No constitutional violations to justify. All work fits within existing project structure and conventions.

## Project Structure

### Documentation (this feature)

```text
specs/004-default-password-force-change/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
backend/
├── prisma/schema.prisma                         # Add must_change_password to User model
├── src/
│   ├── application/use-cases/
│   │   └── CreateCoachee.ts                     # Use data.phone as password (instead of crypto.randomUUID)
│   ├── infrastructure/routes/
│   │   ├── auth.ts                              # Add POST /auth/change-password, update login/refresh response
│   │   └── coachees.ts                          # Change phone from optional to required
│   └── __tests__/
│       ├── CreateCoachee.test.ts                # Test password = phone
│       └── auth.test.ts                         # Test change-password, mustChangePassword in login

frontend/
├── src/
│   ├── domain/types/auth.ts                     # Add mustChangePassword to User interface
│   ├── ui/pages/
│   │   ├── admin/CoacheesPage.tsx               # Phone required + validation
│   │   ├── ChangePasswordPage.tsx               # New page: current + new + confirm password
│   │   └── LoginPage.tsx                        # Redirect to /change-password if mustChangePassword
│   └── infrastructure/routes/
│       └── App.tsx                              # Add /change-password route, mustChangePassword redirect logic
```

**Structure Decision**: Web application (backend + frontend). Follows existing hexagonal architecture. All changes localised to existing files plus one new page (`ChangePasswordPage.tsx`) and one new hook (`useChangePassword.ts`).
