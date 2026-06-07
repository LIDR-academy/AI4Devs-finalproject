# Test Strategy (MVP)

- Frontend: component tests for core screens.
- Backend: unit tests for services and integration tests for API modules.
- E2E: critical flow from login to receipt processing.

## Security Test Coverage (MVP)

- Authentication and authorization tests
	- Protected endpoints reject missing or invalid JWT.
	- Users cannot access pantry or receipt data outside authorized ownership scope.

- Input and upload validation tests
	- Invalid payloads are rejected with safe error responses.
	- Unsupported file types and oversize uploads are blocked.

- Integration safety tests
	- Receipt OCR output is validated before persistence.
	- Notification payloads avoid unnecessary sensitive fields.

- Abuse-resistance baseline tests
	- Auth endpoint throttling behavior is tested once implemented.
	- Repeated failed auth attempts are logged for audit visibility.

- Data protection checks
	- Ensure no sensitive secrets are required in code fixtures.
	- Verify logs used in tests do not expose PII or raw receipt data.
