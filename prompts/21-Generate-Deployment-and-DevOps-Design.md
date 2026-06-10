# AAA Prompt — Generate EventFlow Deployment & DevOps Design Document

## CONTEXT

You are an expert **DevOps Architect, Cloud Solutions Architect, Platform Engineer, and Technical Documentation Lead**.

You are working on **EventFlow**, a final academic project for a Master in AI for Developers.

EventFlow is a responsive web platform for **AI-assisted event planning and simplified vendor quote management**.

The MVP target is:

```text
AI-assisted event planning workspace + simplified vendor quote flow
```

The project already has the following approved technical direction:

* Frontend: **Next.js + TypeScript + App Router**
* Backend: **Node.js + TypeScript + Express.js**
* API style: **REST JSON**
* Architecture style: **Modular Monolith + Clean/Hexagonal Architecture**
* Database: **PostgreSQL**
* ORM: **Prisma**
* AI integration: `LLMProvider` abstraction

  * `OpenAIProvider` as the primary MVP provider
  * `MockAIProvider` as mandatory for tests, fallback, and demo mode
  * `AnthropicProvider` as stub/future
* Auth: email/password, HTTP-only cookies, RBAC + ownership
* File storage: local in dev, object storage in cloud
* CI/CD must remain simple and appropriate for an academic MVP
* The system must be deployable to a public cloud URL for academic evaluation
* The MVP must avoid overengineering:

  * No Kubernetes
  * No microservices
  * No multi-region HA
  * No enterprise blue-green deployment
  * No complex service mesh
  * No production-grade SIEM
  * No distributed tracing platform unless clearly marked as future

The documentation generated before this document includes:

* `/docs/1-Domain-Discovery-Report.md`
* `/docs/2-Product-Owner-Decisions.md`
* `/docs/3-MVP-Scope-Definition.md`
* `/docs/4-Business-Rules-Document.md`
* `/docs/5-User-Roles-Permissions-Matrix.md`
* `/docs/6-Domain-Data-Model.md`
* `/docs/7-AI-Features-Specification.md`
* `/docs/8-Use-Cases-Specification.md`
* `/docs/8.1-Product-Owner-Decisions-Use-Cases-Addendum.md`
* `/docs/8.2-Documentation-Alignment-Review-Before-FRD.md`
* `/docs/9-Functional-Requirements-Document.md`
* `/docs/10-Non-Functional-Requirements.md`
* `/docs/11-Data-Seed-Strategy.md`
* `/docs/12-Architecture-Vision-and-Principles.md`
* `/docs/13-System-Architecture-Document.md`
* `/docs/14-Backend-Technical-Design.md`
* `/docs/15-Frontend-Architecture-Design.md`
* `/docs/16-API-Design-Specification.md`
* `/docs/17-AI-Architecture-and-PromptOps-Design.md`
* `/docs/18-Database-Physical-Design.md`
* `/docs/19-Security-and-Authorization-Design.md`
* `/docs/20-Testing-Strategy.md`

You must generate the next document:

```text
/docs/21-Deployment-and-DevOps-Design.md
```

The document must be written in **Spanish LATAM neutral**.

Use clear technical language, but make the strategy understandable for:

* Product Owner
* Backend Engineers
* Frontend Engineers
* QA
* DevOps
* AI Engineers
* Academic evaluators
* AI coding agents

---

## CLOUD PROVIDER DECISION

For this document, choose **AWS** as the deployment provider.

Do not leave the cloud provider undecided.

Use the following AWS-based strategy for the MVP:

### Frontend

Use:

```text
AWS Amplify Hosting
```

Purpose:

* Host the Next.js frontend.
* Provide public HTTPS URL.
* Connect to GitHub repository for automatic deployments.
* Support environment variables for frontend configuration.
* Serve authenticated and public SEO-ready pages.

Clarify:

* The frontend does not call OpenAI, PostgreSQL, S3, or Secrets Manager directly.
* The frontend communicates only with the backend REST API.

### Backend

Use:

```text
AWS App Runner
```

Purpose:

* Run the Node.js + Express backend as a containerized service.
* Expose the REST API over HTTPS.
* Keep the backend deployment simple without Kubernetes.
* Support environment variables and secrets.
* Scale modestly for demo/MVP needs.

Clarify:

* The backend remains a Modular Monolith.
* No microservices are introduced.
* No ECS/EKS is required for the MVP.
* No Lambda/serverless-first design is required for the MVP.

### Database

Use:

```text
Amazon RDS for PostgreSQL
```

Purpose:

* Host the PostgreSQL database.
* Support Prisma migrations.
* Provide reliable relational storage for EventFlow entities.
* Support seed/demo data.
* Support backups/snapshots at a basic MVP level.

Clarify:

* PostgreSQL remains the system of record.
* Prisma remains the only ORM/database access layer.
* No direct database access from the frontend.
* No read replicas, partitioning, sharding, or multi-region setup in MVP.

### File Storage

Use:

```text
Amazon S3
```

Purpose:

* Store uploaded attachments and vendor portfolio images in cloud environments.
* Replace local file storage used in local development.
* Integrate through the backend `FileStoragePort`.

Clarify:

* The frontend does not upload directly to S3 in the MVP unless explicitly designed as a future optimization.
* The backend validates MIME type, size, ownership, and authorization before storing files.
* Soft delete metadata must remain in the database.

### Secrets and Configuration

Use:

```text
AWS Secrets Manager or AWS Systems Manager Parameter Store
```

Purpose:

* Store sensitive runtime configuration.
* Avoid committing secrets to the repository.

Secrets and variables must include, at minimum:

```env
NODE_ENV=
APP_ENV=
DATABASE_URL=
SESSION_SECRET=
COOKIE_SECRET=
CORS_ALLOWED_ORIGINS=
LLM_PROVIDER=
OPENAI_API_KEY=
OPENAI_MODEL=
AI_TIMEOUT_MS=
AI_DEMO_MODE=
AI_USE_MOCK_FALLBACK=
S3_BUCKET_NAME=
S3_REGION=
CAPTCHA_SECRET_KEY=
CAPTCHA_SITE_KEY=
LOG_LEVEL=
```

Clarify:

* `.env.example` must exist and include variable names without real values.
* CI/CD must never print secrets.
* `LLM_PROVIDER=mock` must allow the demo/test mode to run without `OPENAI_API_KEY`.

### Observability

Use:

```text
Amazon CloudWatch
```

Purpose:

* Capture backend logs.
* Capture App Runner service logs.
* Support basic operational visibility.
* Validate demo failures through structured logs.

The document must include observability expectations:

* Structured logs.
* `correlationId` per request.
* AI provider errors and fallback logs.
* Auth/captcha failures.
* Admin actions persisted in `AdminAction`.
* Seed reset actions audited.
* No sensitive values in logs.

### CI/CD

Use:

```text
GitHub Actions
```

Purpose:

* Run quality gates on pull requests.
* Build and test frontend and backend.
* Validate Prisma migrations.
* Validate seed execution.
* Deploy to AWS environments after merge.

The CI/CD design must include at least:

* Pull Request pipeline.
* Main branch pipeline.
* Demo deployment pipeline.
* Optional manual workflow for seed reset in demo.
* Quality gates:

  * install dependencies
  * typecheck
  * lint
  * unit tests
  * integration tests
  * API tests
  * frontend component tests
  * E2E smoke tests
  * Prisma migration validation
  * seed validation
  * build frontend
  * build backend Docker image
  * security sanity checks

### Containerization

Use Docker for the backend.

The document must include:

* Backend Docker image strategy.
* Minimal container runtime assumptions.
* Dockerfile expectations.
* `.dockerignore`.
* Health check endpoint.
* Environment variable injection at runtime.
* No secrets baked into the image.

Frontend can be deployed through AWS Amplify Hosting build pipeline.

### Environments

Define at least these environments:

| Environment            | Purpose                                   |
| ---------------------- | ----------------------------------------- |
| Local                  | Developer machine                         |
| CI                     | Automated checks                          |
| QA/Staging             | Pre-demo validation                       |
| Demo                   | Public academic evaluation                |
| Production-like Future | Not required in MVP, documented as future |

For each environment, document:

* Purpose
* Infrastructure
* Database strategy
* AI provider strategy
* Seed strategy
* Secrets strategy
* Deployment trigger
* Access restrictions

### Demo Readiness

The document must strongly support demo readiness.

Include:

* Demo URL expectations.
* Seed data strategy.
* Deterministic `MockAIProvider`.
* `AI_DEMO_MODE`.
* Manual smoke checklist before demo.
* Rollback/redeploy strategy.
* Known demo failure modes and mitigations.
* How to recover from broken seed.
* How to recover from AI provider failure.
* How to recover from failed deployment.

### Deployment Diagrams

Include Mermaid diagrams so non-technical users can understand the deployment strategy.

At minimum include:

1. **AWS Deployment Architecture Diagram**

   * Browser
   * AWS Amplify Hosting
   * AWS App Runner
   * Amazon RDS PostgreSQL
   * Amazon S3
   * AWS Secrets Manager / SSM
   * CloudWatch
   * OpenAI API
   * Captcha provider
   * GitHub Actions

2. **CI/CD Pipeline Diagram**

   * Developer PR
   * GitHub Actions checks
   * Build frontend
   * Build backend image
   * Run migrations validation
   * Run seed validation
   * Deploy frontend to Amplify
   * Deploy backend to App Runner
   * Smoke test demo

3. **Environment Promotion Diagram**

   * local → CI → QA/Staging → Demo
   * Include manual approval before demo deployment.

4. **Runtime Request Flow Diagram**

   * User browser
   * Frontend
   * Backend REST API
   * Auth/session middleware
   * Use case
   * PostgreSQL/S3/OpenAI/MockAIProvider
   * Logs/metrics

5. **AI Demo/Fallback Flow Diagram**

   * Backend receives AI request
   * Checks `LLM_PROVIDER`
   * Uses OpenAI or Mock
   * Timeout/failure handling
   * Persists `AIRecommendation`
   * Returns pending suggestion to frontend

Use Mermaid syntax.

---

## GOAL

Generate a complete, implementation-ready **Deployment & DevOps Design Document** for EventFlow.

The document must define:

1. The deployment strategy.
2. The AWS cloud architecture.
3. The CI/CD approach.
4. The environment strategy.
5. The configuration and secrets strategy.
6. The database migration and seed strategy.
7. The observability strategy.
8. The security considerations for deployment.
9. The demo readiness strategy.
10. The rollback and recovery strategy.
11. The operational boundaries of the MVP.
12. Future DevOps improvements.

The document must be practical for an academic MVP and must not overengineer the solution.

It must explicitly justify why AWS is selected instead of GCP for this MVP.

The justification should be based on:

* Simple managed services.
* Clear separation between frontend, backend, database, file storage, secrets, and logs.
* Good fit for Node.js container deployment.
* Good fit for PostgreSQL through RDS.
* Good fit for S3 object storage.
* Good enough DevOps maturity for a portfolio/demo project.
* Avoiding Kubernetes and unnecessary platform complexity.

Do not invent requirements that contradict the existing documentation.

---

## DOCUMENT STRUCTURE REQUIRED

Generate the document using this exact structure:

```markdown
# EventFlow — Deployment & DevOps Design

> Versión:
> Fecha:
> Producto:
> MVP target:
> Idioma del documento:
> Estado:
> Audiencia:

---

## 1. Propósito del documento

## 2. Alcance del documento

### 2.1 Incluye
### 2.2 No incluye

## 3. Fuentes utilizadas

Include a table with all source documents used.

## 4. Resumen ejecutivo

Explain the AWS deployment strategy in simple terms.

Must include the final deployment shape:

Frontend Next.js
→ AWS Amplify Hosting
→ Backend Node.js/Express container
→ AWS App Runner
→ Amazon RDS PostgreSQL
→ Amazon S3
→ OpenAI/MockAIProvider
→ CloudWatch logs
→ GitHub Actions CI/CD

## 5. Decisión cloud: AWS vs GCP

Include:

- Decision
- Context
- Options considered
- AWS advantages
- GCP advantages
- Why AWS is selected
- Why GCP is not selected for MVP
- Consequences
- Future reconsideration criteria

## 6. Principios DevOps del MVP

Include principles such as:

- Simple cloud over complex platform
- One backend deployable
- Managed services first
- Secrets outside repository
- Reproducible demo
- Mockable AI
- CI quality gates before deploy
- Observability without enterprise overhead
- No Kubernetes in MVP
- No microservices in MVP
- No manual undocumented deployment steps

## 7. Arquitectura de despliegue AWS

Include the AWS deployment architecture diagram in Mermaid.

Must describe:

- Browser/client
- Amplify Hosting
- App Runner
- RDS PostgreSQL
- S3
- Secrets Manager / SSM
- CloudWatch
- OpenAI
- Captcha provider
- GitHub Actions

## 8. Componentes cloud seleccionados

Create a table:

| Component | AWS service | Purpose | MVP priority | Notes |

Include at least:

- Frontend hosting
- Backend runtime
- Database
- Object storage
- Secrets/configuration
- Logs
- CI/CD
- Container registry if needed
- DNS/domain as optional/future
- CDN as managed by Amplify or future
- Email service as out of scope/future unless simulated

## 9. Frontend deployment design

Include:

- Next.js deployment through AWS Amplify Hosting
- Build command
- Output expectations
- Environment variables
- Public vs private variables
- API base URL configuration
- i18n/static assets
- SEO-ready public vendor pages
- Rollback strategy
- What the frontend must not access directly

## 10. Backend deployment design

Include:

- Node.js + Express container deployment on AWS App Runner
- Docker image strategy
- Health check endpoint
- Runtime env vars
- CORS configuration
- HTTP-only cookie considerations
- App Runner service behavior
- Scaling expectations for MVP
- No microservices
- No Kubernetes
- No serverless-first rewrite

## 11. Database deployment design

Include:

- Amazon RDS PostgreSQL
- Prisma migrations
- Migration execution strategy
- Backup/snapshot expectations
- Connection string handling
- Environment-specific database strategy
- Seed data execution
- No direct access from frontend
- No read replicas/sharding/partitioning in MVP

## 12. File storage deployment design

Include:

- Amazon S3 for cloud file storage
- Local storage in local development
- `FileStoragePort`
- Upload validation responsibility
- Bucket naming conventions
- Access model
- Soft delete metadata remains in PostgreSQL
- Future signed URLs

## 13. AI provider deployment configuration

Include:

- `LLM_PROVIDER=openai | mock | anthropic`
- `OpenAIProvider` for real demo
- `MockAIProvider` for deterministic demo/test
- `AnthropicProvider` as stub/future
- `AI_TIMEOUT_MS=60000`
- `AI_DEMO_MODE`
- `AI_USE_MOCK_FALLBACK`
- No frontend access to LLM keys
- Fallback behavior
- AI-related logs

## 14. Secrets and environment variables strategy

Include:

- `.env.example`
- Local `.env`
- GitHub Actions secrets
- AWS Secrets Manager or SSM
- Runtime injection
- Secret rotation as future/simple MVP
- Never commit secrets
- Never log secrets

Provide tables for:

### 14.1 Frontend variables
### 14.2 Backend variables
### 14.3 CI/CD variables
### 14.4 AI variables
### 14.5 Security variables

## 15. Environment strategy

Create a table for:

- Local
- CI
- QA/Staging
- Demo
- Future production-like

For each, define:

- Purpose
- Frontend hosting
- Backend hosting
- Database
- Storage
- AI provider
- Seed strategy
- Secrets strategy
- Deployment trigger
- Access level

## 16. CI/CD strategy with GitHub Actions

Include:

- PR workflow
- Main workflow
- Demo deployment workflow
- Manual seed reset workflow
- Required quality gates
- Failure handling
- Branch protection recommendation

Include Mermaid CI/CD pipeline diagram.

## 17. Quality gates

Include a table:

| Gate | Tool / Command | Runs on PR | Runs on main | Blocks deploy | Notes |

Must include:

- Typecheck frontend
- Typecheck backend
- Lint
- Unit tests
- Integration tests
- API tests
- Frontend tests
- E2E smoke tests
- Prisma migration validation
- Seed validation
- Build frontend
- Build backend Docker image
- Security sanity check
- Environment variable validation

## 18. Database migrations and seed strategy

Include:

- Prisma migration principles
- Migration validation in CI
- Applying migrations to QA/Demo
- Seed idempotency
- `is_seed=true`
- Seed reset guardrails
- Demo data recovery
- Do not run destructive seed reset against production-like future environment without approval

## 19. Observability and logging

Include:

- CloudWatch logs
- Structured logs
- Correlation ID
- Request logs
- Error logs
- AI fallback logs
- Auth/captcha failure logs
- AdminAction audit persistence
- Seed reset audit
- Log redaction
- MVP observability limitations
- Future APM/Grafana/OpenTelemetry

## 20. Security considerations for deployment

Include:

- HTTPS
- HTTP-only cookies
- CORS allowlist
- Secure secrets handling
- No secrets in repository
- No secrets in Docker image
- Database access restrictions
- S3 access restrictions
- Captcha config
- Rate limiting config
- File upload constraints
- Least privilege IAM
- GitHub Actions permissions
- Demo reset endpoint protection
- No payment data
- No KYC
- No formal compliance claims

## 21. Runtime request flow

Include Mermaid runtime request flow diagram.

Explain how a normal authenticated request works.

## 22. AI fallback and demo mode flow

Include Mermaid AI fallback flow diagram.

Explain:

- OpenAI path
- Mock path
- Timeout path
- Fallback path
- Persistence as `AIRecommendation`
- Human-in-the-loop result

## 23. Deployment checklist

Include:

### 23.1 Before first deployment
### 23.2 Before every demo deployment
### 23.3 After deployment
### 23.4 Before academic evaluation

## 24. Rollback and recovery strategy

Include:

- Frontend rollback
- Backend redeploy previous image
- Database migration caution
- Seed reset recovery
- AI provider outage recovery
- RDS snapshot recovery as MVP-level measure
- Known limitations

## 25. Demo readiness strategy

Include:

- Demo public URLs
- Seeded demo users
- MockAIProvider option
- Smoke test script
- Manual QA checklist
- Monitoring during demo
- Contingency plan
- What to do if OpenAI fails
- What to do if seed is broken
- What to do if App Runner deployment fails
- What to do if Amplify deployment fails

## 26. Operational runbook

Create a practical runbook with commands/placeholders:

- Local setup
- Local seed
- Run tests
- Build backend image
- Validate migrations
- Deploy frontend
- Deploy backend
- Check health endpoint
- Run smoke tests
- Reset demo seed
- Inspect logs

Commands can be illustrative, not final.

## 27. Cost and resource considerations

Include:

- Keep AWS services minimal
- Prefer small RDS instance for demo
- App Runner modest scaling
- S3 low cost
- CloudWatch log retention
- Avoid always-on expensive services
- Cost monitoring recommendation
- No enterprise commitments

## 28. Risks and mitigations

Include a table:

| Risk ID | Risk | Impact | Probability | Mitigation | Related area |

Must include at least:

- Failed deployment before demo
- Broken migrations
- Broken seed
- OpenAI outage or API key issue
- RDS connection issue
- Secrets misconfiguration
- CORS/cookie issue
- S3 permissions issue
- CI too slow
- Logs leaking sensitive data
- Accidental scope creep toward Kubernetes/microservices

## 29. MVP boundaries and future DevOps evolution

Include:

### MVP boundaries

- No Kubernetes
- No ECS cluster unless future
- No EKS
- No multi-region
- No blue-green requirement
- No autoscaling complexity beyond managed App Runner basics
- No CDN tuning beyond managed frontend hosting
- No distributed tracing requirement
- No production compliance certification
- No advanced WAF requirement

### Future evolution

- Custom domain
- AWS WAF
- CloudFront
- ECS Fargate
- RDS automated backup policy refinement
- S3 signed URLs
- OpenTelemetry
- Grafana dashboards
- Alerting
- Blue-green/canary deployment
- IaC with Terraform or AWS CDK
- Multi-environment promotion governance

## 30. ADRs recommended

Include ADRs such as:

- ADR-015: Choose AWS for MVP deployment
- ADR-016: Use AWS Amplify Hosting for Next.js frontend
- ADR-017: Use AWS App Runner for backend container
- ADR-018: Use Amazon RDS PostgreSQL
- ADR-019: Use S3 for cloud object storage
- ADR-020: Use GitHub Actions for CI/CD
- ADR-021: Use CloudWatch for MVP logging
- ADR-022: Do not use Kubernetes in MVP

## 31. Traceability matrix

Create a table mapping DevOps decisions to source documents.

Columns:

| DevOps decision | Source document(s) | Rationale | MVP/Future |

## 32. Final readiness checklist

Include checklist items grouped by:

- Frontend
- Backend
- Database
- AI
- Security
- CI/CD
- Seed
- Observability
- Demo
- Documentation

---

## OUTPUT REQUIREMENTS

The final document must:

- Be written in **Spanish LATAM neutral**.
- Use Markdown.
- Use clear headings and tables.
- Include Mermaid diagrams.
- Be implementation-ready.
- Be traceable to previous documentation.
- Avoid generic DevOps advice not relevant to EventFlow.
- Avoid enterprise overengineering.
- Explicitly choose **AWS**.
- Explicitly reject GCP only for this MVP context, not as a general criticism.
- Explicitly explain the AWS services used and why.
- Include local, CI, staging/QA, and demo environments.
- Include CI/CD quality gates.
- Include deployment and rollback strategy.
- Include demo readiness and recovery strategy.
- Include `.env.example` expectations.
- Include AI provider configuration.
- Include seed reset guardrails.
- Include security deployment controls.
- Include observability and audit expectations.
- Include future improvements separately from MVP.

---

## IMPORTANT CONSTRAINTS

Do not introduce:

- Payments infrastructure
- Contract signing infrastructure
- WhatsApp integration
- SMS/push infrastructure
- Native mobile deployment
- Kubernetes
- Microservices
- Event-driven brokers
- Kafka
- RabbitMQ
- Redis/BullMQ unless clearly marked as future
- Vector databases
- RAG infrastructure
- Multi-region deployment
- PCI/SOC2/GDPR compliance claims
- Enterprise disaster recovery
- Advanced WAF requirements as MVP

Do not contradict:

- Modular Monolith backend
- REST API
- PostgreSQL + Prisma
- Next.js frontend
- OpenAI primary provider
- MockAIProvider mandatory for demo/test
- AnthropicProvider stub/future
- Human-in-the-loop AI
- Seed-based demo
- No real payments
- No real email sending required in MVP unless explicitly simulated
- No real WhatsApp integration
- No native mobile app

---

## FINAL TASK

Generate the complete `/docs/21-Deployment-and-DevOps-Design.md` document following all instructions above.
```
