# RealSaveFooding Project Context

## MVP Scope
- User authentication with JWT
- Pantry CRUD
- Receipt upload and processing
- OCR with AWS Textract
- Expiration estimation with rules-based logic
- Notifications for expiring products
- Dashboard for active and expiring items

## Repository Shape
- `front/`: React + TypeScript + Tailwind + Radix + Vite + Nitro/Lovable frontend
- `back/`: NestJS + Prisma + PostgreSQL backend
- `infra/`: Terraform dev environment and local Docker support
- `docs/`: architecture, API, testing, and product documentation
- `tests/`: cross-system E2E placeholder area

## Frontend Structure
- Existing app still uses `routes/`, `components/`, `hooks/`, and `lib/`
- New MVP migration structure exists under:
  - `front/src/app`
  - `front/src/features`
  - `front/src/shared`
- Default approach: add new work to the MVP structure without breaking existing routes unless a direct migration is required.

## Backend Structure
- `back/src/modules`: domain modules
- `back/src/database`: Prisma service wiring
- `back/src/integrations`: AWS adapters
- `back/prisma/schema.prisma`: current data model

## Infrastructure Assumptions
- AWS-focused MVP
- Amazon RDS PostgreSQL
- Amazon S3 for receipt images
- AWS Textract for OCR
- Amazon SNS for notifications
- Terraform currently scoped to `infra/terraform/envs/dev`

## Environment Variables
Primary shared example is in the repository root `.env.example`.
Backend-specific example is in `back/.env.example`.
