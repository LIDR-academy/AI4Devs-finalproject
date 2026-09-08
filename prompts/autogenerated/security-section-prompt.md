# Prompt: Generate Project Security Section

## Role
You are a senior application security engineer with up-to-date knowledge of web security standards, OWASP guidelines, and modern security practices as of 2026. You specialise in practical, right-sized security for product teams — not theoretical checklists.

---

## Objective
Write a **Security** section for the technical documentation of the application described in this conversation. The section must cover the minimum security baseline expected of a production web application in 2026, grounded in current best practices and adapted to the specific stack, architecture, and threat surface of this project.

---

## Instructions

### 1. Contextualise to This Application
- Base every security decision on what has already been established in this conversation (stack, architecture, user roles, data sensitivity, authentication approach, etc.).
- Do not produce a generic checklist. Each point must be visibly tied to this project's context.

### 2. Cover the Minimum Security Baseline for 2026
Address, at minimum, the following areas — expanding or contracting depth based on relevance to this application:

| Area | What to address |
|---|---|
| **Authentication & Authorization** | Auth mechanism (JWT, sessions, OAuth2, passkeys), token lifecycle, role-based access control (RBAC) |
| **Input Validation & Sanitisation** | Server-side validation, protection against injection (SQL, NoSQL, XSS, command injection) |
| **API Security** | Rate limiting, authentication on all endpoints, versioning, sensitive data exposure prevention |
| **Data Protection** | Encryption at rest and in transit (TLS 1.3+), secrets management, PII handling |
| **Dependency & Supply Chain Security** | Automated vulnerability scanning (e.g. Dependabot, Snyk), lockfiles, audit policies |
| **Infrastructure & Deployment** | Least-privilege principles, environment variable handling, container/serverless hardening where applicable |
| **Security Headers & CSP** | HTTP security headers (HSTS, CSP, X-Frame-Options, etc.) |
| **Logging & Monitoring** | Security event logging, anomaly detection, incident response basics |
| **OWASP Top 10 (2025)** | Call out which OWASP Top 10 risks are most relevant to this app and how each is mitigated |

### 3. Flag What Is Out of Scope (for Now)
- Briefly note any advanced security measures (e.g. WAF, penetration testing cadence, SOC2 compliance) that are not part of the current baseline but should be considered as the product scales.

---

## Output Format

Deliver the section in the following structure, ready to paste into the project's technical documentation:

```
## Security

### Overview
[2–3 sentences framing the security posture of this application]

### Authentication & Authorization
...

### Input Validation & Sanitisation
...

### API Security
...

### Data Protection
...

### Dependency & Supply Chain Security
...

### Infrastructure & Deployment Security
...

### Security Headers
...

### Logging & Monitoring
...

### OWASP Top 10 Coverage
[Table or list mapping the most relevant risks to the mitigations applied in this project]

### Out of Current Scope
...
```

---

## Constraints
- Write in technical but accessible language suitable for a development team, not a compliance auditor.
- Prioritise actionable decisions over theoretical description — each subsection should make clear **what will be done**, not just what the risk category is.
- Where a specific library, tool, or configuration is the right answer for this stack, name it explicitly.
- Keep it concise. This is a documentation section, not a security audit report.