# Security Rules

## Purpose

These rules define baseline security expectations for all agents.

## Required

- Treat all external input as untrusted.
- Validate and sanitize inputs.
- Never expose secrets, credentials, tokens, or private keys.
- Never hardcode sensitive values.
- Use environment variables or secure secret management for configuration.
- Apply authentication and authorization checks where required.
- Follow the principle of least privilege.
- Avoid exposing internal errors to clients.
- Protect sensitive user or business data.
- Consider security impact when designing APIs, storage, integrations, and logs.

## Forbidden

- Do not log passwords, tokens, private keys, personal data, or sensitive business information.
- Do not return stack traces or internal error details to clients.
- Do not bypass authentication or authorization for convenience.
- Do not trust client-side validation as the only validation layer.
- Do not store secrets in source code.
- Do not expose internal IDs or data unless justified.
- Do not recommend insecure defaults.

## Authentication Rules

- Verify identity before granting access.
- Use established authentication mechanisms.
- Avoid custom authentication unless justified.
- Handle expired, invalid, or missing credentials correctly.

## Authorization Rules

- Verify permissions for protected actions.
- Enforce authorization on the backend.
- Do not rely only on frontend restrictions.
- Consider role-based, permission-based, or ownership-based access rules.

## Data Protection Rules

- Minimize sensitive data exposure.
- Mask sensitive values in logs and responses.
- Encrypt sensitive data when required.
- Avoid unnecessary data retention.

## API Security Rules

- Validate request body, params, query params, and headers.
- Use safe error messages.
- Consider rate limiting for exposed endpoints.
- Consider idempotency for critical operations.
- Protect against common injection risks.

## Final Rule

When security impact is unclear, recommend involving the Security Reviewer Agent.