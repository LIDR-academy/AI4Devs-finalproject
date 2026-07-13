# API Spec Validator Skill

**Trigger**: When a `/speckit.implement` or `/speckit.plan` involves adding or modifying API endpoints.

**Why**: This project defines 33 endpoints in `docs/api-specifications.md` but has not yet converted them to OpenAPI 3.1. Every implementation step must match the documented contract.

## Instructions

When new route files are created or modified in `backend/src/infrastructure/routes/`, cross-check against the API specifications:

1. **Method + Path match**: Does the route signature match one of the 33 endpoint entries in the Summary table?
2. **Auth guard**: Does every endpoint (except `/auth/login` and `/health`) have `authenticate` + `requireRole` middleware?
3. **Error codes**: Does the implementation return all documented error codes for that endpoint?
4. **Response shape**: Does the success response match the documented JSON shape?
4. **Business rules**: Are the business rules documented for that endpoint enforced in the domain layer?

## Output

Report any missing endpoints, missing auth guards, wrong error codes, or response shape mismatches. Do not modify code automatically.