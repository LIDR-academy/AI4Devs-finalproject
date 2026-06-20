# EXT-002 — CI/CD Deployment Pipeline

## Metadata
- **Type:** Infrastructure (GitHub Actions)
- **Priority:** P1
- **Phase:** 1 — GA Readiness (implement last, after all feature tickets)
- **PRD Reference:** [P1-002](../../product/5_Extended-Non-MVP-PRD.md#p1-002-cicd-deployment-pipeline)
- **Effort:** Medium
- **Depends on:** EXT-003 (production infrastructure — for deploy stage)

---

## User Story

As a developer, I want every merged PR to automatically build, test, and deploy to staging, so that releases are repeatable, verifiable, and safe.

---

## Context

The project currently has:
- `npm run build`, `npm run lint`, `npm run test` scripts in both `back/` and `front/`.
- E2E tests via Playwright in `front/tests/e2e/` and Jest E2E in `back/test/`.
- Local Docker Compose for Postgres.
- No CI configuration at all.

The pipeline must cover the full quality gate (lint → typecheck → unit → E2E) on every PR, and then auto-deploy to staging on merge to `main`. Production deploy is manual-approval-gated.

---

## Affected Slices

| Slice | Path | Change |
|---|---|---|
| CI/CD | `.github/workflows/ci.yml` | New — PR check pipeline |
| CI/CD | `.github/workflows/deploy-staging.yml` | New — staging deploy on merge to main |
| CI/CD | `.github/workflows/deploy-production.yml` | New — production deploy (manual approval) |
| Backend | `back/Dockerfile` | New or verify exists |
| Frontend | `front/Dockerfile` | New or verify exists |
| Infra | `infra/docker/docker-compose.ci.yml` | New — CI Postgres service |

---

## Pipeline Architecture

```
PR opened / updated
  └─► ci.yml
        ├─ backend-checks (lint · typecheck · unit tests · build)
        ├─ frontend-checks (lint · typecheck · vitest · build)
        └─ e2e (Playwright + Jest E2E against docker-compose.ci.yml DB)

Merge to main
  └─► deploy-staging.yml
        ├─ build Docker images
        ├─ push to ECR
        └─ update ECS service (staging)

Manual approval → deploy-production.yml
        ├─ pull staging image (already tested)
        ├─ run DB migrations on prod RDS
        └─ update ECS service (production)
```

---

## Technical Implementation Tasks

Follow TDD: validate each workflow passes before moving to the next.

1. **Postgres service for CI** (`infra/docker/docker-compose.ci.yml`)
   - Single `postgres:16-alpine` service with fixed credentials matching `back/.env.test`.
   - Health check so workflows wait for DB ready.

2. **Backend Dockerfile** (`back/Dockerfile`)
   - Multi-stage: `builder` (install deps + compile) → `runner` (node:20-alpine + dist/).
   - Expose port 3000.
   - `CMD ["node", "dist/main.js"]`.

3. **Frontend Dockerfile** (`front/Dockerfile`)
   - Multi-stage: `builder` (install deps + `npm run build`) → `runner` (nginx:alpine serving `dist/`).
   - Nginx config serves SPA with `try_files $uri /index.html`.

4. **CI workflow** (`.github/workflows/ci.yml`)
   ```yaml
   on: [pull_request]
   jobs:
     backend:
       runs-on: ubuntu-latest
       services:
         postgres: { image: postgres:16-alpine, env: {...}, options: --health-cmd pg_isready }
       steps:
         - checkout
         - setup-node 20
         - npm ci (back/)
         - npx prisma migrate deploy
         - npm run lint
         - npm run typecheck (tsc --noEmit)
         - npx jest --config ./test/jest-unit.json
         - npx jest --config ./test/jest-e2e.json
     frontend:
       runs-on: ubuntu-latest
       steps:
         - checkout
         - setup-node 20
         - npm ci (front/)
         - npm run lint
         - npm run typecheck
         - npm run test (vitest run)
         - npm run build
     e2e:
       needs: [backend, frontend]
       runs-on: ubuntu-latest
       steps:
         - checkout
         - docker-compose -f infra/docker/docker-compose.ci.yml up -d
         - start backend (npm run start:prod &)
         - start frontend preview (npm run preview &)
         - npx playwright install --with-deps
         - npx playwright test
   ```

5. **Staging deploy workflow** (`.github/workflows/deploy-staging.yml`)
   ```yaml
   on:
     push:
       branches: [main]
   jobs:
     build-and-push:
       steps:
         - configure-aws-credentials (via OIDC role, not static keys)
         - docker build + push to ECR (back and front images)
         - aws ecs update-service --cluster staging --service api --force-new-deployment
         - aws ecs update-service --cluster staging --service frontend --force-new-deployment
   ```

6. **Production deploy workflow** (`.github/workflows/deploy-production.yml`)
   ```yaml
   on:
     workflow_dispatch:
       inputs:
         image_tag: { required: true }
   environment: production   # requires manual approval in GitHub
   jobs:
     migrate:
       - run prisma migrate deploy against prod RDS (via bastion or ECS run-task)
     deploy:
       - aws ecs update-service --cluster production --service api --image <tag>
   ```

7. **GitHub Secrets required**
   ```
   AWS_ROLE_ARN              # OIDC role for GitHub Actions
   ECR_REGISTRY              # AWS account ECR URL
   ECR_REPO_BACKEND
   ECR_REPO_FRONTEND
   STAGING_ECS_CLUSTER
   PROD_ECS_CLUSTER
   ```
   Use GitHub OIDC (not static `AWS_ACCESS_KEY_ID`) for AWS authentication.

8. **Branch protection** — configure in GitHub repo settings:
   - Require `ci / backend`, `ci / frontend`, `ci / e2e` to pass before merge.
   - Require at least one approval (even for solo dev — future-proof).

---

## Error Handling

- If `prisma migrate deploy` fails in staging, the ECS service update is not triggered (sequential steps).
- Failed E2E runs produce a Playwright HTML report uploaded as a GitHub Actions artifact.
- Production deploy gate requires `environment: production` approval — no automated path.

---

## Security

- Use GitHub OIDC to authenticate to AWS — never store static `AWS_ACCESS_KEY_ID` in secrets.
- ECR image scans (Amazon Inspector) enabled for pushed images.
- Secrets (`DATABASE_URL`, `JWT_SECRET`, etc.) are injected at runtime via ECS task definition from Secrets Manager — not baked into the Docker image.
- The production workflow requires both manual approval AND a specific `image_tag` input to prevent accidental deploys.

---

## Testing Requirements

| Validation | Method |
|---|---|
| CI workflow passes on a test PR | Open a trivial PR, verify all jobs green |
| Staging deploy fires after merge to main | Merge a test commit to main |
| Production deploy blocked without approval | Trigger `workflow_dispatch` and verify approval gate |
| Failed test blocks merge | Introduce a failing test on a PR |

---

## Acceptance Criteria

1. Every PR triggers a CI run covering lint, typecheck, unit tests, and E2E for both backend and frontend.
2. A failing test or lint error blocks merge (branch protection enforced).
3. Merge to `main` automatically updates the staging environment within 10 minutes.
4. Production deployment requires manual approval via GitHub environment gate.
5. No static AWS credentials are stored in GitHub Secrets — OIDC role is used.

---

## Non-Goals

- Multi-region deployment.
- Blue/green or canary deployment strategies (ECS rolling update is sufficient for now).
- Automated rollback on deploy failure (manual rollback via `workflow_dispatch` with previous tag).

---

## Open Questions

1. Is the AWS account already set up with an OIDC identity provider for GitHub Actions? (Required before this ticket can be completed.)
2. Are ECR repositories already created or should Terraform (EXT-003) create them?

---

## Readiness Check

- [x] Clear actor and value
- [x] Testable acceptance criteria
- [x] Scope is clear (GitHub Actions only, no application code)
- [x] Dependencies identified (EXT-003 for deploy targets, AWS OIDC setup)
