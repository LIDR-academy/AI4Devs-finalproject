## ADDED Requirements

### Requirement: FluentValidation automatic validation
The API SHALL configure a global `ValidationFilter` (action filter) that automatically validates DTOs using FluentValidation on all POST and PUT controller actions.

When validation fails, the filter SHALL return 400 Bad Request with a JSON body containing the validation errors in the format:
```json
{
  "error": "Validation failed",
  "errors": [
    { "field": "Name", "message": "Name is required" }
  ]
}
```

The filter SHALL short-circuit the request pipeline — the controller action SHALL NOT execute if validation fails.

#### Scenario: Valid DTO passes through
- **WHEN** a POST request includes a DTO that passes all FluentValidation rules
- **THEN** the controller action executes normally

#### Scenario: Invalid DTO returns 400 with error details
- **WHEN** a POST request includes a DTO with a missing required field
- **THEN** the response status is 400 with JSON body containing `error: "Validation failed"` and an `errors` array with field-level details

### Requirement: Serilog structured JSON logging
The API SHALL configure Serilog as the logging provider with JSON console output. Each HTTP request SHALL be logged with a correlation ID that is consistent across all log entries within the same request.

The Serilog configuration SHALL include:
- JSON console sink (`Serilog.Sinks.Console` with `CompactJsonFormatter`)
- Request logging middleware (`Serilog.AspNetCore` request logging)
- Correlation ID enrichment via `Enrich.FromLogContext()`
- Minimum level: Information in production, Debug in development

#### Scenario: Request logged with correlation ID
- **WHEN** an HTTP request is processed by the API
- **THEN** Serilog logs the request with a correlation ID that appears in all log entries for that request

#### Scenario: Log output is JSON formatted
- **WHEN** the API logs a message
- **THEN** the console output is valid JSON with structured fields

### Requirement: Swagger/OpenAPI with cookie auth schemes
The API SHALL configure OpenAPI documentation with two security schemes:
- `cookieAuth`: API key scheme reading from `aura_session` cookie
- `csrfAuth`: API key scheme reading from `X-CSRF-Token` header

Both schemes SHALL be documented in the Swagger UI (Scalar) for manual testing.

#### Scenario: OpenAPI document includes security schemes
- **WHEN** the OpenAPI document is generated
- **THEN** it includes `cookieAuth` and `csrfAuth` security scheme definitions
