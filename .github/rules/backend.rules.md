# Backend Rules

## Purpose

These rules define backend development standards for all agents working on server-side implementation.

## Required

- Keep business logic outside controllers.
- Place business rules in services, use cases, or domain layers according to the project architecture.
- Validate all external input before processing it.
- Handle errors consistently.
- Use semantic error categories (for example: validation, conflict, unauthorized, forbidden, not found, unexpected).
- Use DTOs or equivalent structures when crossing application boundaries.
- Keep persistence logic isolated from business logic.
- Avoid leaking database models directly through public APIs.
- Use dependency injection or explicit dependency boundaries when applicable.
- Keep backend code modular, testable, and maintainable.
- Respect the structure defined in `architecture.md`.
- Access environment-driven configuration only through the project's configuration module.

## Forbidden

- Do not put business logic inside controllers.
- Do not access the database directly from presentation/UI layers.
- Do not hardcode secrets, tokens, credentials, URLs, or environment-specific values.
- Do not throw generic errors in domain/application flows when a semantic error type exists.
- Do not return raw internal errors to clients.
- Do not expose internal implementation details in API responses.
- Do not create large services with unrelated responsibilities.
- Do not duplicate business rules across multiple layers.
- Do not introduce new architectural patterns without justification.

## API Rules

- Use clear and consistent endpoint names.
- Use correct HTTP methods.
- Use meaningful status codes.
- Validate request params, query params, headers, and body.
- Return predictable response structures.
- Document breaking changes.
- Consider pagination, filtering, sorting, and idempotency when relevant.

## Persistence Rules

- Use transactions when multiple related writes must succeed or fail together.
- Define indexes when query patterns require them.
- Avoid unnecessary eager loading.
- Avoid N+1 query problems.
- Consider migration impact before changing schemas.
- Protect data integrity with constraints when possible.

## Error Handling Rules

- Use consistent error types or error response formats.
- Distinguish between validation errors, business errors, authorization errors, not found errors, and unexpected errors.
- Log unexpected errors without exposing sensitive details.
- Return client-safe error messages.

## Testing Expectations

Backend changes should consider:

- Unit tests for business logic.
- Integration tests for persistence or API behavior.
- Contract tests when external services are involved.
- Edge cases and error scenarios.

## Final Rule

Backend code must be correct, maintainable, testable, and aligned with the project architecture.