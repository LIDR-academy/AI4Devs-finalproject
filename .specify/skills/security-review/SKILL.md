# Security Review Skill

**Trigger**: Any `/speckit.specify` or `/speckit.plan` call that touches authentication, authorization, PII, Google Calendar, coach financial data, rate limiting, or dependency management.

**Why**: The project has an extensive OWASP Top 10 2025 threat model (PRD Section 10). Every new feature spec must be checked against it.

## Instructions

When a spec or plan involves any of these domains, review the new content against each row of the OWASP coverage table in PRD Section 10.10 and the constitution's Security-by-Default principle. Specifically check:

1. **Auth endpoints**: Are rate limits (10 req/min on login) specified? Is the "Invalid credentials" no-enumeration rule mentioned?
2. **PII handling**: Do Google Calendar event titles follow the naming convention (individual = "coachee name - level", group = "Group class - level")? Are coach financial fields marked for AES-256-GCM encryption?
3. **Role guards**: Is every new endpoint annotated with its minimum required role (Admin/Coach/Coachee)?
4. **Error responses**: Does the spec mention the standard `{ error: { code, message, ref } }` envelope?
5. **Secrets**: Does the plan mention env var injection for any new external service credentials?

## Output

If violations found, report each as a MARKER with severity and a remediation suggestion.