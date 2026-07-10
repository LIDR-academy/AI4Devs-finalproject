# Skill: Backend API Design

## Purpose

Design consistent, maintainable, and scalable backend APIs aligned with REST principles and project architecture.

---

## Responsibilities

When designing APIs:

- Define clear endpoints and responsibilities.
- Use correct HTTP methods.
- Design predictable request and response structures.
- Define proper status codes.
- Consider validation requirements.
- Consider authentication and authorization needs.
- Consider pagination, filtering, sorting, and idempotency when relevant.
- Keep APIs consistent with existing conventions.

---

## API Design Principles

Prioritize:

- Clarity
- Consistency
- Predictability
- Backward compatibility
- Simplicity
- Maintainability

Avoid:

- Ambiguous routes
- Inconsistent naming
- Leaking internal implementation details
- Overloaded endpoints
- Unclear response structures

---

## Endpoint Design Rules

Use:

- nouns instead of verbs when possible
- plural resource names when appropriate
- nested resources only when relationships are meaningful

Examples:

Good:

- `GET /users`
- `GET /users/{id}`
- `POST /users`
- `PATCH /users/{id}`

Avoid:

- `/getUsers`
- `/createUser`
- `/updateUser`

---

## Status Code Guidelines

Use appropriate status codes:

- `200 OK`
- `201 Created`
- `202 Accepted`
- `204 No Content`
- `400 Bad Request`
- `401 Unauthorized`
- `403 Forbidden`
- `404 Not Found`
- `409 Conflict`
- `422 Unprocessable Entity`
- `500 Internal Server Error`

---

## Validation Expectations

Validate:

- Request body
- Query params
- Path params
- Headers
- Business rules
- Data formats
- Required fields

---

## Error Response Guidelines

Errors should:

- Be consistent
- Be safe for clients
- Avoid exposing internal details
- Include actionable information when appropriate

Example:

```json
{
  "error": "VALIDATION_ERROR",
  "message": "Email is required"
}