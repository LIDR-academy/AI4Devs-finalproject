# Architecture

> Full architecture documentation for ConstructFlow. See also the [Notion Architecture page](https://www.notion.so/32ab53fe56bb81fdad54d20bae913017) for ADRs and budget estimation.

---

## System Overview

ConstructFlow is a **modular monolith** — one Go REST API with clean domain boundaries internally, a static Nuxt SPA served via CloudFront, and PostgreSQL on managed RDS. This pattern keeps deployment simple while preserving internal structure that supports future growth (extracting services, adding mobile clients, integrating the RAG AI layer post-MVP).

---

## Components

| Component | Technology | Notes |
|-----------|-----------|-------|
| Frontend SPA | Vue.js + Nuxt | SSR-capable; served as a static build via CloudFront + S3. Tailwind CSS. |
| Backend API | Go — modular monolith | ECS Fargate. Strongly typed, performant, handles concurrent document processing. |
| Database | PostgreSQL — AWS RDS | Relational model fits projects, units, buyers, documents. `pgvector` extension enabled for future RAG. |
| Document storage | AWS S3 | Private bucket. Access via short-lived pre-signed URLs generated server-side. |
| Email | AWS SES | Transactional notifications for document events and milestones. |
| Authentication | JWT RS256 + httpOnly cookies | Private key stored in AWS Secrets Manager; never in code or env vars. |

---

## Infrastructure & Deployment

| Component | AWS Service | Config | Notes |
|-----------|------------|--------|-------|
| SPA hosting | S3 + CloudFront | Static Nuxt build | Responsive via Tailwind |
| Go API | ECS Fargate | 0.5 vCPU / 1 GB RAM (dev) | Containerised, auto-scaling ready |
| Database | RDS PostgreSQL | db.t3.micro (dev) | `pgvector` extension enabled |
| Document storage | S3 | Private bucket | Pre-signed URLs for secure access |
| Email | SES | Verified domain | Transactional notifications |
| Auth keys | AWS Secrets Manager | RS256 key pair | Private key never in code or env vars |
| Container registry | ECR | Go API image | Built via CI/CD pipeline |

**Estimated cost (dev/demo environment):** ~$30–60 USD/month, dominated by RDS. Free tier covers most services for the first 12 months on a new AWS account.

---

## Security

| Practice | Detail |
|----------|--------|
| Authentication | JWT RS256 signing. Tokens delivered via httpOnly cookies — prevents XSS token theft vs. localStorage. |
| Secret management | RS256 private key stored exclusively in AWS Secrets Manager. Never in code, env vars, or version control. |
| Authorisation | RBAC middleware enforces role-based access (admin / seller / employee) on every protected endpoint. |
| Document access | S3 private bucket. Access only via short-lived pre-signed URLs generated server-side per request. |
| Audit trail | Append-only `audit_logs` table. Every create/update/delete action recorded with a role snapshot at time of action — preserved even if the user's role changes later. |

---

## Development Methodology

ConstructFlow uses **Spec-Driven Development (SDD)** via [Spec Kit](https://github.com/github/spec-kit). Each feature produces a folder under `.specify/specs/[feature-name]/` in the code repo containing `spec.md`, `plan.md`, `data-model.md`, `contracts/`, and `tasks.md`.

Workflow per feature: `/speckit.constitution` → `/speckit.specify` → `/speckit.plan` → `/speckit.tasks` → `/speckit.implement`.

Notion is the system-level documentation layer. `.specify/` is the feature-level implementation spec layer. They complement rather than overlap.

---

## Architecture Decision Records

All ADRs are maintained in Notion → [ADRs index](https://www.notion.so/32ab53fe56bb8181b65fe4227d77a940).
