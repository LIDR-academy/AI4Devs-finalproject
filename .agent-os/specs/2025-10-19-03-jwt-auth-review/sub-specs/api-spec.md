# API Specification

This is the API specification for the spec detailed in @.agent-os/specs/2025-10-19-03-jwt-auth-review/spec.md

## Overview

This specification documents the existing authentication API endpoints implemented in `app/api/v1/endpoints/auth.py` and verifies their compliance with REST best practices and the Single Responsibility Principle.

## Base URL

```
/api/v1/auth
```

All authentication endpoints are mounted under this base path.

## Endpoints

### POST /api/v1/auth/register

**Purpose:** Register a new user account with email and password.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123",
  "full_name": "John Doe" // Optional
}
```

**Validation:**

- `email`: Must be valid email format (validated by Pydantic EmailStr)
- `password`: Minimum 6 characters, maximum 100 characters
- `full_name`: Optional, maximum 255 characters

**Success Response (201 Created):**

```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "is_active": true,
  "is_superuser": false,
  "created_at": "2025-10-19T10:30:00Z"
}
```

**Error Responses:**

- `400 Bad Request`: Email already registered
  ```json
  {
    "detail": "Email already registered"
  }
  ```
- `422 Unprocessable Entity`: Validation errors (invalid email, password too short, etc.)

**Implementation Notes:**

- Password is hashed using bcrypt before storage
- New users are created with `is_active=True` and `is_superuser=False`
- The hashed password is never returned in the response
- Email uniqueness is verified before creating user

---

### POST /api/v1/auth/login

**Purpose:** Authenticate user with email and password, returning a JWT access token.

**Request Body:**

```json
{
  "email": "user@example.com",
  "password": "securePassword123"
}
```

**Validation:**

- `email`: Must be valid email format
- `password`: Required, string

**Success Response (200 OK):**

```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer",
  "expires_in": 86400, // Seconds (24 hours = 86400)
  "user": {
    "id": 1,
    "email": "user@example.com",
    "full_name": "John Doe",
    "is_active": true,
    "is_superuser": false,
    "created_at": "2025-10-19T10:30:00Z"
  }
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid credentials
  ```json
  {
    "detail": "Incorrect email or password"
  }
  ```
- `400 Bad Request`: User account is inactive
  ```json
  {
    "detail": "Inactive user"
  }
  ```

**Implementation Notes:**

- Password verification uses bcrypt comparison
- Generic error message prevents user enumeration attacks
- Token expiration time is configurable via `JWT_EXPIRATION_HOURS` setting
- User data is included in response for frontend convenience

---

### POST /api/v1/auth/login/oauth

**Purpose:** OAuth2-compatible login endpoint using standard OAuth2PasswordRequestForm.

**Request Body (Form Data):**

- `username`: User's email (OAuth2 standard uses "username" field)
- `password`: User's password
- `grant_type`: Optional, typically "password"
- `scope`: Optional, space-separated scopes
- `client_id`: Optional
- `client_secret`: Optional

**Success Response (200 OK):**
Same as `/login` endpoint above.

**Error Responses:**
Same as `/login` endpoint above.

**Implementation Notes:**

- This endpoint exists for OAuth2 client compatibility
- Internally calls the standard login endpoint
- The `username` field from OAuth2 form is mapped to email
- Required for FastAPI's automatic Swagger UI authentication

**Usage in Swagger UI:**
This endpoint enables the "Authorize" button in FastAPI's interactive API documentation at `/docs`.

---

### GET /api/v1/auth/me

**Purpose:** Get current authenticated user's information.

**Authentication:** Required (JWT Bearer token)

**Request Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Success Response (200 OK):**

```json
{
  "id": 1,
  "email": "user@example.com",
  "full_name": "John Doe",
  "is_active": true,
  "is_superuser": false,
  "created_at": "2025-10-19T10:30:00Z"
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
  ```json
  {
    "detail": "Could not validate credentials"
  }
  ```
- `400 Bad Request`: User account is inactive
  ```json
  {
    "detail": "Inactive user"
  }
  ```

**Implementation Notes:**

- Uses `get_current_active_user` dependency
- Token must be valid and not expired
- User must exist in database and be active

---

### POST /api/v1/auth/change-password

**Purpose:** Change the authenticated user's password.

**Authentication:** Required (JWT Bearer token)

**Request Headers:**

```
Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Request Body:**

```json
{
  "old_password": "currentPassword123",
  "new_password": "newSecurePassword456"
}
```

**Validation:**

- `old_password`: Required, string
- `new_password`: Minimum 6 characters, maximum 100 characters

**Success Response (200 OK):**

```json
{
  "message": "Password updated successfully"
}
```

**Error Responses:**

- `401 Unauthorized`: Invalid or missing token
- `400 Bad Request`: Old password is incorrect
  ```json
  {
    "detail": "Incorrect password"
  }
  ```
- `400 Bad Request`: User account is inactive

**Implementation Notes:**

- Verifies old password before allowing change
- New password is hashed with bcrypt before storage
- Does not invalidate existing JWT tokens (they remain valid until expiration)

---

### POST /api/v1/auth/password-reset

**Purpose:** Request a password reset for a user account.

**Authentication:** Not required (public endpoint)

**Request Body:**

```json
{
  "email": "user@example.com"
}
```

**Validation:**

- `email`: Must be valid email format

**Success Response (200 OK):**

```json
{
  "message": "If the email exists, a password reset link has been sent"
}
```

**Error Responses:**

- `422 Unprocessable Entity`: Invalid email format

**Implementation Notes:**

- Always returns success to prevent email enumeration
- Generates a time-limited password reset token (24 hours)
- Token generation uses JWT with `type: "reset"` claim
- Email sending is TODO (token is generated but not sent)
- In production, token would be sent via email with reset link

**Security Considerations:**

- Generic success message prevents user enumeration
- Token includes expiration time
- Token is single-use (should be invalidated after use in production)

---

### POST /api/v1/auth/password-reset/confirm

**Purpose:** Confirm password reset using a reset token.

**Authentication:** Not required (public endpoint, uses reset token)

**Request Body:**

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "new_password": "newSecurePassword456"
}
```

**Validation:**

- `token`: Required, string (JWT format)
- `new_password`: Minimum 6 characters, maximum 100 characters

**Success Response (200 OK):**

```json
{
  "message": "Password reset successfully"
}
```

**Error Responses:**

- `400 Bad Request`: Invalid or expired reset token
  ```json
  {
    "detail": "Invalid or expired reset token"
  }
  ```
- `404 Not Found`: User not found (token valid but user deleted)
  ```json
  {
    "detail": "User not found"
  }
  ```

**Implementation Notes:**

- Verifies token signature and expiration
- Checks token type claim is "reset"
- Extracts email from token subject claim
- Updates password with bcrypt hash
- Token should be invalidated after use (enhancement for production)

---

## Authentication Flow Diagrams

### Registration Flow

```
Client                     API                      Database
  |                         |                          |
  |-- POST /auth/register ->|                          |
  |    (email, password)    |                          |
  |                         |-- Check email exists -->|
  |                         |<- Not found ------------|
  |                         |-- Hash password         |
  |                         |   (bcrypt)              |
  |                         |-- Create user --------->|
  |                         |<- User created ---------|
  |<- 201 Created ----------|                          |
  |    (user data)          |                          |
```

### Login Flow

```
Client                     API                      Database
  |                         |                          |
  |-- POST /auth/login ---->|                          |
  |    (email, password)    |                          |
  |                         |-- Get user by email --->|
  |                         |<- User data ------------|
  |                         |-- Verify password       |
  |                         |   (bcrypt)              |
  |                         |-- Create JWT token      |
  |                         |   (PyJWT)               |
  |<- 200 OK ---------------|                          |
  |    (token + user)       |                          |
```

### Protected Endpoint Access Flow

```
Client                     API                      Database
  |                         |                          |
  |-- GET /auth/me -------->|                          |
  |    Authorization:       |                          |
  |    Bearer <token>       |                          |
  |                         |-- Verify token          |
  |                         |   (PyJWT)               |
  |                         |-- Get user by ID ------>|
  |                         |<- User data ------------|
  |                         |-- Check is_active       |
  |<- 200 OK ---------------|                          |
  |    (user data)          |                          |
```

## JWT Token Structure

### Access Token Claims

```json
{
  "exp": 1697721600, // Expiration timestamp (Unix time)
  "iat": 1697635200, // Issued at timestamp (Unix time)
  "sub": "1" // Subject: User ID as string
}
```

**Token Properties:**

- **Algorithm:** HS256 (HMAC with SHA-256)
- **Signature:** Signed with `JWT_SECRET_KEY` from configuration
- **Expiration:** Configurable via `JWT_EXPIRATION_HOURS` (default: 24 hours)
- **Payload:** Minimal (only user ID) to keep token size small

### Password Reset Token Claims

```json
{
  "exp": 1697721600, // Expiration timestamp
  "nbf": 1697635200, // Not before timestamp
  "sub": "user@example.com", // Subject: User email
  "type": "reset" // Token type identifier
}
```

## Router Integration

### Current Router Structure

```python
# app/api/v1/router.py
from app.api.v1.endpoints import auth

api_router.include_router(
    auth.router,
    prefix="/auth",
    tags=["authentication"]
)
```

### Endpoint Summary Table

| Method | Endpoint                       | Auth Required | Purpose                   |
| ------ | ------------------------------ | ------------- | ------------------------- |
| POST   | `/auth/register`               | No            | Register new user         |
| POST   | `/auth/login`                  | No            | Login with email/password |
| POST   | `/auth/login/oauth`            | No            | OAuth2-compatible login   |
| GET    | `/auth/me`                     | Yes           | Get current user info     |
| POST   | `/auth/change-password`        | Yes           | Change user password      |
| POST   | `/auth/password-reset`         | No            | Request password reset    |
| POST   | `/auth/password-reset/confirm` | No            | Confirm password reset    |

## SOLID Principle Compliance

### Single Responsibility Principle (SRP) Analysis

**Current Endpoint Responsibilities:**

- ✅ **Input Validation:** Handled by Pydantic schemas
- ✅ **Request Parsing:** Handled by FastAPI
- ⚠️ **Business Logic:** Some direct database queries in endpoints (should be in service layer)
- ✅ **Response Formatting:** Handled by Pydantic response models
- ✅ **HTTP Concerns:** Proper status codes and headers

**Potential Improvements:**

1. Move database query logic to `app/services/user_service.py`
2. Endpoints should only:
   - Parse request
   - Call service layer
   - Format response
   - Handle HTTP concerns

**Example Refactoring:**

**Current (Direct DB Access):**

```python
@router.post("/register")
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(...)

    hashed_password = get_password_hash(user_data.password)
    db_user = User(email=user_data.email, hashed_password=hashed_password, ...)
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return UserResponse(...)
```

**Recommended (Service Layer):**

```python
# app/services/user_service.py
def create_user(db: Session, user_data: UserRegister) -> User:
    hashed_password = get_password_hash(user_data.password)
    db_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        is_active=True,
        is_superuser=False
    )
    db.add(db_user)
    db.commit()
    db.refresh(db_user)
    return db_user

def get_user_by_email(db: Session, email: str) -> Optional[User]:
    return db.query(User).filter(User.email == email).first()

# app/api/v1/endpoints/auth.py
@router.post("/register")
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    existing_user = user_service.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(...)

    db_user = user_service.create_user(db, user_data)
    return UserResponse(...)
```

## Testing Examples

### Manual Testing with cURL

**1. Register a new user:**

```bash
curl -X POST "http://localhost:8000/api/v1/auth/register" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testPassword123",
    "full_name": "Test User"
  }'
```

**2. Login:**

```bash
curl -X POST "http://localhost:8000/api/v1/auth/login" \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "testPassword123"
  }'
```

**3. Access protected endpoint:**

```bash
# Save token from login response
TOKEN="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

curl -X GET "http://localhost:8000/api/v1/auth/me" \
  -H "Authorization: Bearer $TOKEN"
```

**4. Change password:**

```bash
curl -X POST "http://localhost:8000/api/v1/auth/change-password" \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "old_password": "testPassword123",
    "new_password": "newPassword456"
  }'
```

## Security Best Practices

### Implemented Security Measures

- ✅ Passwords hashed with bcrypt (strong, slow hash function)
- ✅ JWT tokens include expiration time
- ✅ Generic error messages prevent user enumeration
- ✅ Hashed passwords never returned in responses
- ✅ Inactive users cannot authenticate
- ✅ Token validation on every protected endpoint

### Future Security Enhancements (Out of Scope)

- Rate limiting on authentication endpoints
- Account lockout after failed login attempts
- Two-factor authentication
- Refresh token support
- Token revocation/blacklist
- Password complexity requirements
- Email verification for new accounts
- Audit logging of authentication events

## Performance Considerations

- **Password Hashing:** Intentionally slow (bcrypt security feature), ~100-300ms per operation
- **Token Verification:** Fast, ~1-5ms per operation
- **Database Queries:** Single query per authenticated request (user retrieval)
- **Token Size:** Minimal payload (~150-200 bytes) for fast transmission
- **Caching:** Consider caching user objects for frequently accessed accounts

## Error Handling Standards

All endpoints follow consistent error response format:

```json
{
  "detail": "Human-readable error message"
}
```

HTTP status codes follow REST conventions:

- `200 OK`: Successful operation
- `201 Created`: Successful resource creation
- `400 Bad Request`: Client error (inactive user, incorrect password)
- `401 Unauthorized`: Authentication required or failed
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `422 Unprocessable Entity`: Validation error
