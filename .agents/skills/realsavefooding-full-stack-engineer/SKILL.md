---
name: realsavefooding-full-stack-engineer
description: 'Full-stack workflow for RealSaveFooding. Use when working across the project frontend, backend, Prisma schema, AWS integrations, MVP architecture, repository structure, README/docs alignment, or end-to-end feature delivery in this codebase.'
argument-hint: 'Feature, bug, module, or architecture task to handle in RealSaveFooding'
user-invocable: true
model: sonnet
---

# RealSaveFooding Full-Stack Engineer

## Project references
- [Project Context](./references/project-context.md)
- [Validation Checks](./references/validation-checks.md)

## NestJS module boundaries
`auth` · `users` · `pantry` · `receipts` · `expiration` · `notifications` · `dashboard`  
Cross-cutting: `common` (guards, interceptors, filters) · `database` (Prisma wiring) · `integrations` (AWS adapters)

## Key paths
| Slice | Path |
|---|---|
| Frontend routes & components | `front/src/routes/`, `front/src/components/` |
| Feature API bindings & types | `front/src/features/<feature>/` |
| Shared UI | `front/src/shared/` |
| Backend modules | `back/src/modules/<module>/` |
| AWS adapters | `back/src/integrations/` |
| Prisma schema | `back/prisma/schema.prisma` |

## MVP scope boundary
In scope: JWT auth · Pantry CRUD · Receipt upload/OCR · Expiration estimation · Notifications · Dashboard  
Out of scope (future): multi-household billing · mobile app · external price APIs · ML-based expiration
