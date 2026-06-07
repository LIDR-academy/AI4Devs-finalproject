# TKT-001 - Register and Login

## Metadata
- Type: Full-Stack (Backend + Frontend)
- Priority: P0
- User Story: US-001
- Main domains: Auth, Users

## Objective
Deliver secure email/password signup and login with JWT-protected session flows.

## Scope
In scope:
- Register endpoint.
- Login endpoint.
- Session retrieval endpoint.
- Login/create-account UI states and validation.

Out of scope:
- Social login.
- MFA.

## API
- POST /api/auth/register
- POST /api/auth/login
- GET /api/auth/me

## Data
- USER table
- Case-insensitive unique email validation

## Technical tasks
1. Backend DTO validation for auth payloads.
2. Password hash and verify implementation.
3. JWT generation and guard protection.
4. Frontend forms for register/login.
5. Token/session persistence and logout handling.

## Error handling
- Duplicate email -> 409.
- Invalid credentials -> 401.
- Missing token -> 401.

## Security
- Hash passwords with strong salt rounds.
- Keep JWT secret in environment variables only.
- Avoid account-enumeration error details.

## Testing
- Unit: auth service and hash utilities.
- Integration: register/login/me happy and failure paths.
- E2E: login from UI and protected route access.

## Acceptance criteria
1. User can register with valid data.
2. User can login with valid credentials.
3. Invalid credentials are rejected with clear message.
4. Protected routes require JWT.

## Definition of done
- Lint/typecheck/tests pass.
- API contracts documented.
- Auth flows validated in browser.
