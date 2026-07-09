
---

# `.github/skills/backend-error-handling.skill.md`

```md
# Skill: Backend Error Handling

## Purpose

Design consistent and maintainable backend error handling strategies.

---

## Responsibilities

When handling errors:

- Categorize errors correctly.
- Return safe client-facing messages.
- Avoid leaking internal implementation details.
- Ensure consistent error formats.
- Support debugging and observability.

---

## Error Categories

Distinguish between:

- Validation errors
- Business rule errors
- Authentication errors
- Authorization errors
- Not found errors
- Conflict errors
- Infrastructure errors
- Unexpected errors

---

## Error Handling Principles

Prioritize:

- Clarity
- Predictability
- Consistency
- Safety

Avoid:

- Silent failures
- Generic catch-all responses
- Returning stack traces
- Exposing internal details

---

## Logging Guidelines

Log:

- Unexpected errors
- Infrastructure failures
- External integration failures

Do not log:

- Passwords
- Tokens
- Secrets
- Sensitive personal data

---

## Client Response Rules

Client responses should:

- Be understandable
- Be safe
- Be consistent
- Avoid implementation details

---

## Output Format

```md
## Error Handling Strategy

### Error Categories

- Validation Error
- Authorization Error

### Response Strategy

[Response explanation]

### Logging Strategy

[Logging explanation]

### Suggested Error Structure

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Email is required"
}