# Release Runbook

This runbook defines MVP release steps for backend (Render), frontend (Vercel), and managed PostgreSQL.

## Preconditions

- Main branch is green in CI.
- Backend and frontend tests pass.
- DATABASE_URL points to the intended environment.
- Required environment variables are configured.
- Prisma migration history in repository is in sync with target environment.

## Environment Variable Checklist

- Backend: DATABASE_URL configured and points to target environment.
- Backend: AUTH_ENABLED set explicitly for the target environment.
- Backend: CORS_ALLOWED_ORIGINS restricted to approved frontend origins.
- Backend: RATE_LIMIT_WINDOW_MS and RATE_LIMIT_MAX_REQUESTS configured for expected traffic.
- Backend: if AZURE_OPENAI_ENABLED=true, AZURE_OPENAI_ENDPOINT, AZURE_OPENAI_API_KEY and AZURE_OPENAI_DEPLOYMENT are set.
- Frontend: VITE_API_BASE_URL points to the target backend URL.

## Deploy Backend (Render)

1. Connect repository and set root directory to app/backend.
2. Build command: npm ci && npm run build.
3. Start command: npm run start.
4. Configure environment variables from docs/operations/environment-variables.md.
5. Apply schema changes using versioned migrations: npm run prisma:migrate:deploy.
6. Verify migration status: npm run prisma:migrate:status.
7. Verify health endpoint: GET /health returns status ok.

## Deploy Frontend (Vercel)

1. Connect repository and set root directory to app/frontend.
2. Build command: npm run build.
3. Output directory: dist.
4. Set VITE_API_BASE_URL to backend public URL.
5. Deploy and verify create project + use case + estimate + report flow.

## Verification Checklist

- Backend /health is healthy.
- Backend /metrics returns telemetry counters.
- Response payloads include requestId on errors for correlation.
- CORS allows only configured origins in target environment.
- Rate limiting is active and returns 429 on burst traffic.
- Create project endpoint works.
- Add use-case endpoint works.
- Estimate endpoint works (Azure or fallback).
- Frontend report view loads data.

## Rollback

### Application rollback

- Render: rollback to previous successful deployment.
- Vercel: promote/redeploy previous successful deployment.

### Database rollback

- For migration-based releases, always take a DB snapshot before schema-affecting deployments.
- Rollback application first; restore DB snapshot only if schema mismatch breaks runtime behavior.
- If rollback requires DB restore, document the exact migration causing failure and open a hotfix migration task.

## Migration Safety Checklist

- Confirm new migration files exist under app/backend/prisma/migrations.
- Run npm run prisma:migrate:status before deploy and verify no drift.
- Run npm run prisma:migrate:deploy against target environment.
- Re-run npm run prisma:migrate:status and verify database is up to date.
- Execute smoke test: /health, create project, create use case, estimate endpoint.

## Known MVP Risks

- Cold starts on free tiers can affect first request latency.

## Post-Release

- Capture release notes in planning/local-kanban.md update section.
- Record incidents and follow-up actions if regressions are detected.

## Release Rehearsal Record (Template)

- Date:
- Environment:
- Commit SHA:
- Migration status before deploy (`npm run prisma:migrate:status`):
- Migration apply result (`npm run prisma:migrate:deploy`):
- Migration status after deploy (`npm run prisma:migrate:status`):
- Smoke test results (`/health`, create project, create use case, estimate):
- Rollback rehearsal result (app rollback + DB snapshot restore decision):
- Notes and follow-up actions:
