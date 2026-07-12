# EXT-003 — Production Infrastructure (IaC: Staging + Production)

## Metadata
- **Type:** Infrastructure (Terraform + AWS)
- **Priority:** P1
- **Phase:** 1 — GA Readiness (implement last, after all feature tickets)
- **PRD Reference:** [P1-003](../../product/5_Extended-Non-MVP-PRD.md#p1-003-production-infrastructure-staging--production-environments)
- **Effort:** High
- **Depends on:** EXT-002 (Dockerfiles must exist before ECR push) — **note: EXT-002 (CI/CD pipeline) is now out of scope and will not be implemented; this dependency needs to be re-evaluated (e.g. Dockerfiles may need to be authored directly under this ticket instead) before EXT-003 can proceed.**

---

## User Story

As an operator, I want a reproducible staging and production environment defined as code, so that I can deploy, monitor, and roll back safely without manual AWS console work.

---

## Context

The project currently has:
- `infra/docker/docker-compose.local.yml` for local Postgres.
- No cloud infrastructure definitions.
- A `dev.sh` script for local development.

The target is two environments (staging, production) using AWS services already in use for the MVP (S3, Textract, SNS, SES). The backend runs on ECS Fargate (containerized NestJS), the frontend on CloudFront + S3, and the database on RDS PostgreSQL.

Terraform is the IaC tool of choice (aligns with AWS focus and team knowledge).

---

## Affected Slices

| Slice | Path | Change |
|---|---|---|
| Infrastructure | `infra/terraform/modules/` | New — reusable modules |
| Infrastructure | `infra/terraform/environments/staging/` | New — staging env |
| Infrastructure | `infra/terraform/environments/production/` | New — production env |
| Infrastructure | `infra/terraform/environments/shared/` | New — ECR repos, IAM, OIDC |
| Documentation | `docs/local-development-setup.md` | Add infra deploy section |

---

## Terraform Module Structure

```
infra/terraform/
├── modules/
│   ├── ecs-service/        # ECS Fargate task + service
│   ├── rds-postgres/       # RDS PostgreSQL instance
│   ├── s3-cloudfront/      # Frontend hosting + CDN
│   ├── secrets/            # Secrets Manager entries
│   └── vpc-network/        # VPC, subnets, SGs
├── environments/
│   ├── shared/             # ECR repos, GitHub OIDC role, Route 53 zone
│   ├── staging/
│   │   ├── main.tf         # Compose modules for staging
│   │   ├── variables.tf
│   │   └── terraform.tfvars
│   └── production/
│       ├── main.tf
│       ├── variables.tf
│       └── terraform.tfvars
└── README.md
```

---

## AWS Resources per Environment

### Networking (`vpc-network` module)
- VPC with 2 public subnets and 2 private subnets (2 AZs).
- Internet Gateway + NAT Gateway (private subnets).
- Security groups: ALB (80/443 inbound), ECS tasks (3000 from ALB only), RDS (5432 from ECS SG only).

### Backend (`ecs-service` module)
- ECS Cluster (Fargate).
- ECS Task Definition: `realsavefooding-api` image from ECR, 512 CPU / 1024 MB, env vars from Secrets Manager.
- ECS Service: desired count 1 (staging), 2 (production), rolling update.
- Application Load Balancer: HTTPS listener (ACM cert), HTTP → HTTPS redirect.
- Route 53 A record: `api.staging.realsavefooding.com` / `api.realsavefooding.com`.

### Database (`rds-postgres` module)
- RDS PostgreSQL 16, `db.t3.micro` (staging), `db.t3.small` (production).
- Multi-AZ: false (staging), true (production).
- Storage: 20 GB GP3, auto-scaling to 100 GB.
- Automated backups: 7 days.
- Private subnet, accessible only from ECS SG.
- Credentials stored in Secrets Manager as `DATABASE_URL`.

### Frontend (`s3-cloudfront` module)
- S3 bucket: `realsavefooding-frontend-{env}` with block public access.
- CloudFront distribution: origin access control, default root object `index.html`, custom 404 → `index.html` (SPA routing).
- ACM certificate (us-east-1, required for CloudFront).
- Route 53 A record: `staging.realsavefooding.com` / `realsavefooding.com`.

### Shared resources (`shared/`)
- ECR repositories: `realsavefooding/api`, `realsavefooding/frontend`.
- IAM OIDC provider for GitHub Actions.
- IAM role `github-actions-deploy` with permissions: ECR push, ECS update-service, S3 sync, CloudFront invalidation.
- S3 bucket for Terraform remote state + DynamoDB table for state locking.

### Secrets Manager entries (per environment)
```
/realsavefooding/{env}/DATABASE_URL
/realsavefooding/{env}/JWT_SECRET
/realsavefooding/{env}/JWT_REFRESH_SECRET
/realsavefooding/{env}/AWS_S3_BUCKET
/realsavefooding/{env}/AWS_SES_FROM_EMAIL
/realsavefooding/{env}/VAPID_PUBLIC_KEY
/realsavefooding/{env}/VAPID_PRIVATE_KEY
```

---

## Technical Implementation Tasks

1. **Terraform remote state** — Create S3 bucket + DynamoDB table manually (bootstrap step; done once).

2. **Shared resources** (`infra/terraform/environments/shared/`)
   - ECR repositories.
   - GitHub OIDC provider + IAM role.
   - Route 53 hosted zone.
   - `terraform apply` — verify ECR repos visible in AWS Console.

3. **VPC module** (`infra/terraform/modules/vpc-network/`)
   - VPC, 2 public + 2 private subnets, IGW, NAT, SGs.
   - Output: subnet IDs, SG IDs.

4. **RDS module** (`infra/terraform/modules/rds-postgres/`)
   - RDS instance, subnet group, parameter group.
   - Output: `database_endpoint`.

5. **ECS module** (`infra/terraform/modules/ecs-service/`)
   - Task definition (reads secrets from Secrets Manager at startup via `secrets` block in task definition).
   - Service, ALB, listener, target group.

6. **S3 + CloudFront module** (`infra/terraform/modules/s3-cloudfront/`)
   - Bucket, OAC, CloudFront distribution, ACM cert validation.

7. **Staging environment** (`infra/terraform/environments/staging/`)
   - Compose all modules.
   - `terraform plan` → review → `terraform apply`.
   - Verify: ALB health check passes, RDS accessible from ECS.

8. **Production environment** (`infra/terraform/environments/production/`)
   - Same modules with production-grade sizing (multi-AZ RDS, 2 ECS tasks).
   - `terraform plan` → review with human approval → `terraform apply`.

9. **Secrets population** — After infrastructure is up, populate Secrets Manager entries for each environment with real values. Document in `docs/local-development-setup.md`.

10. **Backend health check endpoint** — Verify `GET /api/health` returns 200 (NestJS already has `TerminusModule` or a simple route). ALB uses this for target health.

---

## Security

- RDS credentials are auto-generated by Terraform and stored only in Secrets Manager — never in `terraform.tfvars` or state files.
- Terraform state S3 bucket has versioning and server-side encryption.
- State bucket is not publicly accessible; access via IAM only.
- ECS tasks have a scoped IAM execution role: Secrets Manager read, ECR pull, CloudWatch Logs write, S3 bucket access, Textract, SNS, SES.
- ALB enforces TLS 1.2+; HTTP redirects to HTTPS.
- Security group rules: ECS tasks are not publicly accessible (only via ALB).

---

## Environment Variables Required

```hcl
# environments/staging/terraform.tfvars
environment      = "staging"
aws_region       = "eu-west-1"
domain_name      = "staging.realsavefooding.com"
api_domain_name  = "api.staging.realsavefooding.com"
rds_instance     = "db.t3.micro"
ecs_desired      = 1
```

---

## Acceptance Criteria

1. `terraform apply` in `environments/staging/` completes without error and produces a running ECS service reachable at `https://api.staging.realsavefooding.com/api/health`.
2. Frontend is served from `https://staging.realsavefooding.com` with SPA routing working.
3. RDS instance is accessible from the ECS task but not from the public internet.
4. All secrets are in Secrets Manager; no secrets in Terraform state beyond auto-generated DB password.
5. `terraform plan` in `environments/production/` shows only sizing differences vs staging.

---

## Non-Goals

- Multi-region active-active deployment.
- Kubernetes / EKS (ECS Fargate is sufficient for current scale).
- WAF / Shield (deferred until after first real traffic).
- Full CDN cache-control tuning.

---

## Open Questions

1. What AWS region should be used? (Recommendation: `eu-west-1` — Ireland, closest to Spain, all required services available.)
2. Is a custom domain already registered? Route 53 or external DNS?
3. Is there an existing AWS account with sufficient permissions, or does one need to be set up?

---

## Readiness Check

- [x] Clear actor and value
- [x] Testable acceptance criteria
- [x] Scope is infrastructure-only (no application code changes)
- [x] Dependencies identified (AWS account, domain, EXT-002 Dockerfiles)
