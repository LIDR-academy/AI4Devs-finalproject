# US-003: User Registration and Authentication

[Trello Card](https://trello.com/c/SjxegmK1)



## Description
As a **user**, I want to register for the IPFS gateway service using my email address, so that I can receive an API key to access the platform's features.

## Priority
🔴 **Critical** - Core functionality for user access.

## Difficulty
⭐⭐⭐ Medium-High

## Acceptance Criteria
- [x] `POST /register` endpoint accepts email and password
- [x] Email validation is performed (format and uniqueness)
- [x] Password is securely hashed using bcrypt
- [x] Unique API key is generated upon successful registration
- [x] API key is returned in the response
- [x] User is created with `is_active=True` by default
- [x] Registration is logged in AuditLog
- [x] Proper error responses for invalid input, duplicate email
- [x] Rate limiting is applied to prevent abuse
- [x] Input sanitization prevents injection attacks

## API Specification
```
POST /register
Content-Type: application/json

Request:
{
    "email": "user@example.com",
    "password": "securePassword123!"
}

Response (201 Created):
{
    "status": 201,
    "message": "Registration successful",
    "data": {
        "email": "user@example.com",
        "api_key": "ipfs_gw_xxxxxxxxxxxxx"
    }
}

Error Response (422 Unprocessable Entity):
{
    "status": 422,
    "message": "Email already registered"
}
```

## Technical Notes
- Use passlib with bcrypt for password hashing
- Generate API keys with secure random bytes (32 bytes, hex encoded)
- Prefix API keys with `ipfs_gw_` for easy identification
- Implement email validation using email-validator library
- Apply rate limiting: 5 registrations per hour per IP

## Dependencies
- US-001: Project Setup and Configuration
- US-002: Database Models and Migrations

## Estimated Effort
6 hours

## Completion Status
- [x] 100% - Completed on feature branch `feature/US-003-user-registration-authentication-czo`

## Implementation Notes
- Registration endpoint implemented in `backend/core/users/routes/register.py` (`POST /api/v1/users/register`).
- Input validation and sanitization implemented in `backend/core/common/validators.py` using `email-validator` and strict password rules.
- Registration service implemented in `backend/core/users/services.py` with duplicate-email guard, bcrypt hashing, unique API key generation, and AuditLog creation.
- Test coverage added in `tests/backend/test_registration_auth.py` for success, duplicate email, invalid input, audit logging, and rate limiting.

## Workflow Diagram
```mermaid
flowchart TD
    A[POST /register] --> B{Validate Input}
    B -->|Invalid| C[Return 422 Error]
    B -->|Valid| D{Check Email Exists}
    D -->|Exists| E[Return 422 Duplicate]
    D -->|New| F[Hash Password]
    F --> G[Generate API Key]
    G --> H[Create User Record]
    H --> I[Log to AuditLog]
    I --> J[Return 201 Success]
```

## Related Tasks
- TASK-US-003-01-create-registration-endpoint.md
- TASK-US-003-02-implement-password-hashing.md
- TASK-US-003-03-implement-apikey-generation.md
- TASK-US-003-04-add-input-validation.md
- TASK-US-003-05-add-rate-limiting.md
