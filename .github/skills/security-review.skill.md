# Skill: Security Review

## Purpose

Analyze software features, APIs, infrastructure, workflows, and implementations from a security perspective to identify risks, unsafe patterns, and missing protections.

This skill helps agents proactively identify security weaknesses before they become production vulnerabilities.

---

## Responsibilities

When using this skill:

- Review authentication and authorization behavior.
- Review input validation and sanitization.
- Review sensitive data handling.
- Review API exposure risks.
- Review permission boundaries.
- Review secrets handling.
- Review logging safety.
- Review infrastructure security awareness.
- Identify trust boundaries.
- Identify abuse-case scenarios.
- Recommend mitigations for identified risks.

---

## Security Principles

Always prioritize:

- Least privilege
- Defense in depth
- Secure defaults
- Explicit authorization
- Data minimization
- Safe error handling
- Input validation
- Secret protection
- Auditability
- Operational security awareness

Avoid:

- Trusting client input
- Hardcoded secrets
- Exposed sensitive data
- Overly broad permissions
- Security through obscurity
- Missing authorization checks
- Unsafe error exposure
- Weak operational practices

---

## Authentication Review

Validate:

- authentication is required where appropriate
- invalid credentials are rejected
- sessions/tokens are validated
- expiration handling exists
- password storage is secure
- authentication flows avoid sensitive information leakage

Consider:

- brute-force protection
- account recovery safety
- MFA requirements when relevant

---

## Authorization Review

Validate:

- authorization exists server-side
- ownership checks are enforced
- role/permission boundaries are explicit
- privileged actions require privileged access
- horizontal privilege escalation is prevented
- vertical privilege escalation is prevented

Never assume frontend restrictions are sufficient.

---

## Input Validation Review

Treat all external input as untrusted.

Validate:

- request body
- query params
- path params
- headers
- uploaded files
- external webhook payloads
- third-party integration data

Consider:

- injection risks
- unexpected fields
- unsafe serialization
- malformed payloads

---

## Sensitive Data Review

Review handling of:

- passwords
- tokens
- API keys
- personal data
- financial data
- confidential business information

Validate:

- minimization
- masking
- encryption when required
- safe storage
- safe transmission
- safe logging

---

## Error Handling Review

Validate that errors:

- do not expose stack traces
- do not expose internal implementation details
- do not leak sensitive information
- remain actionable for clients safely

---

## Logging Review

Logs should:

- support debugging
- avoid sensitive data exposure
- avoid secrets and credentials
- remain access-controlled when necessary

Never log:

- passwords
- tokens
- secrets
- private keys
- sensitive personal data

---

## API Security Review

Review:

- authentication requirements
- authorization rules
- rate limiting needs
- idempotency for sensitive operations
- response minimization
- injection protection
- mass assignment risks
- unsafe file handling risks

---

## Infrastructure Security Awareness

Consider:

- environment separation
- secrets management
- CI/CD exposure risks
- excessive permissions
- public exposure risks
- insecure defaults

Recommend involving the DevOps Engineer Agent when infrastructure changes are required.

---

## Threat Awareness

Consider risks such as:

- unauthorized access
- privilege escalation
- data leakage
- abuse of public endpoints
- replay attacks
- insecure integrations
- operational exposure
- dependency vulnerabilities

---

## Severity Guidelines

### Critical

May cause:

- severe unauthorized access
- major data breach
- credential exposure
- destructive access

### High

May cause:

- sensitive data leakage
- broken authorization
- exploitable API behavior

### Medium

May cause:

- incomplete protections
- weak validation
- operational exposure

### Low

May cause:

- hardening opportunities
- minor exposure risks
- security maintainability concerns

---

## Collaboration Guidelines

Recommend involving:

- Security Reviewer Agent → full security validation.
- Backend Developer Agent → API or validation implementation.
- Frontend Developer Agent → client-side security behavior.
- DevOps Engineer Agent → infrastructure and secret management concerns.
- QA Engineer Agent → abuse-case and permission validation.
- Tech Lead Agent → security trade-offs and implementation strategy.

---

## Output Format

```md
## Security Analysis

### Reviewed Area

[Area being reviewed]

### Trust Boundaries

- [Boundary]

### Identified Risks

#### [Risk]

- Severity:
- Impact:
- Probability:

### Recommended Mitigations

- [Mitigation]

### Authorization Notes

- [Authorization consideration]

### Input Validation Notes

- [Validation consideration]

### Sensitive Data Notes

- [Sensitive data consideration]

### Operational Security Notes

- [Operational consideration]

### Recommended Next Agents

- [Agent] → [Reason]