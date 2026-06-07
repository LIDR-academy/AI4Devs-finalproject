# RealSaveFooding Validation Checks

## Frontend
- Install dependencies in `front/` with Bun if available, otherwise npm.
- Preferred broad validation: `npm run build`
- Optional checks when available: route-focused verification, lint, or feature-specific tests

## Backend
- Install dependencies in `back/`
- If Prisma schema changed:
  - `npx prisma generate`
  - then `npm run build`
- General validation:
  - `npm run build`
  - `npm test` for implemented tests

## Infrastructure and Docs
- For Terraform changes, validate that folder names and env references are correct for `infra/terraform/envs/dev`.
- For documentation changes, verify that diagrams, folder trees, and setup commands match the actual repository contents.

## Quality Gates
- Do not claim validation that was not run.
- Prefer narrow checks before full builds.
- Keep MVP-safe changes unless the user requests broader architecture work.
