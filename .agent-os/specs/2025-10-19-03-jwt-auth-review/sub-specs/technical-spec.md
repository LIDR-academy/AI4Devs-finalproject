# Technical Specification

This is the technical specification for the spec detailed in @.agent-os/specs/2025-10-19-03-jwt-auth-review/spec.md

## Technical Requirements

### 1. Core Security Module (`app/core/security.py`)

**Existing Implementation Review:**

- ✅ Password hashing using passlib with bcrypt scheme
- ✅ Password verification against hashed passwords
- ✅ JWT token creation with configurable expiration
- ✅ JWT token verification and decoding
- ✅ Password reset token generation and verification

**Requirements:**

- Verify that `CryptContext` is properly configured with bcrypt
- Ensure all functions have complete type annotations
- Confirm password hashing uses appropriate work factor for bcrypt
- Validate JWT tokens include proper claims (sub, exp, iat)
- Ensure proper exception handling for invalid tokens

**Functions to Review:**

```python
def create_access_token(subject: Union[str, int], expires_delta: Optional[timedelta] = None) -> str
def verify_token(token: str) -> Optional[str]
def verify_password(plain_password: str, hashed_password: str) -> bool
def get_password_hash(password: str) -> str
def generate_password_reset_token(email: str) -> str
def verify_password_reset_token(token: str) -> Optional[str]
```

### 2. Authentication Dependencies Module (`app/core/auth.py`)

**Existing Implementation Review:**

- ✅ HTTPBearer security scheme for JWT extraction
- ✅ `get_current_user` dependency that validates tokens and retrieves users
- ✅ `get_current_active_user` dependency that ensures user is active
- ✅ `get_current_superuser` dependency for admin-only endpoints
- ✅ `get_optional_current_user` for optional authentication

**Requirements:**

- Ensure async functions are properly defined
- Verify proper HTTP exception status codes (401 for unauthorized, 403 for forbidden)
- Confirm database queries are optimized (single query per request)
- Validate proper error messages that don't leak sensitive information

**Functions to Review:**

```python
async def get_current_user(credentials: HTTPAuthorizationCredentials, db: Session) -> User
async def get_current_active_user(current_user: User) -> User
async def get_current_superuser(current_user: User) -> User
def get_optional_current_user(credentials: Optional[HTTPAuthorizationCredentials], db: Session) -> Optional[User]
```

### 3. Authentication API Endpoints (`app/api/v1/endpoints/auth.py`)

**Existing Implementation Review:**

- ✅ POST `/register` - User registration
- ✅ POST `/login` - Email/password login
- ✅ POST `/login/oauth` - OAuth2-compatible login
- ✅ GET `/me` - Get current user information
- ✅ POST `/change-password` - Change user password
- ✅ POST `/password-reset` - Request password reset
- ✅ POST `/password-reset/confirm` - Confirm password reset

**Requirements:**

- Verify all endpoints use proper status codes (201 for creation, 401 for auth failures)
- Ensure sensitive data (hashed_password) is never returned in responses
- Confirm proper validation of email uniqueness during registration
- Validate that inactive users cannot log in
- Ensure OAuth2PasswordRequestForm compatibility for standard OAuth2 clients

### 4. User Service Layer (To Be Verified/Implemented)

**Required Service Functions:**
The specification requires a service layer at `app/services/user_service.py` with the following functions:

```python
def get_user_by_email(db: Session, email: str) -> Optional[User]
def create_user(db: Session, user_data: UserCreateSchema) -> User
```

**Current Status:** Need to verify if `app/services/user_service.py` exists and contains these functions.

**Requirements if Missing:**

- Implement `get_user_by_email` to query user by email address
- Implement `create_user` that:
  - Accepts Pydantic schema input
  - Hashes password using `get_password_hash` from security module
  - Creates new User model instance
  - Commits to database and returns created user
- Both functions should follow SRP: only database operations, no business logic

**Refactoring Needed if Missing:**

- Move direct database queries from `auth.py` endpoints to service layer
- Update auth endpoints to call service layer functions
- Maintain proper separation: Endpoints → Services → Models

### 5. Pydantic Schemas (`app/schemas/auth.py`)

**Existing Implementation Review:**

- ✅ `UserLogin` - Login request schema
- ✅ `UserRegister` - Registration request schema
- ✅ `UserResponse` - User response schema (safe, no password)
- ✅ `Token` - JWT token response with user data
- ✅ `TokenData` - Token payload schema
- ✅ Additional password management schemas

**Requirements:**

- Verify email validation using `EmailStr`
- Confirm password length constraints (min 6 characters)
- Ensure `UserResponse` excludes sensitive fields
- Validate `Token` schema includes expires_in in seconds

### 6. Configuration Settings (`app/core/config.py`)

**Existing Configuration Review:**

- ✅ `JWT_SECRET_KEY` - Secret key for signing tokens
- ✅ `JWT_ALGORITHM` - Algorithm (HS256)
- ✅ `JWT_EXPIRATION_HOURS` - Token expiration time (24 hours)

**Requirements:**

- Verify JWT settings are properly loaded from environment variables
- Ensure default values are appropriate for development
- Confirm production deployment guide includes changing secret keys
- Validate expiration time is reasonable (24 hours default)

### 7. Database Model (`app/models/user.py`)

**Existing Implementation Review:**

- ✅ User model with id, email, hashed_password, full_name
- ✅ Boolean flags: is_active, is_superuser
- ✅ Timestamps: created_at, updated_at
- ✅ Relationships to templates and comparisons

**Requirements:**

- Verify email field has unique constraint
- Confirm hashed_password field is sufficient length (255 chars)
- Ensure indexes on email and is_active for query performance
- Validate relationship definitions are correct

## Architecture Compliance

### SOLID Principle - Single Responsibility Principle (SRP)

**Current Architecture:**

```
app/core/security.py     → Cryptographic operations (hashing, JWT)
app/core/auth.py         → Authentication dependencies (user validation)
app/api/v1/endpoints/auth.py → HTTP endpoints (request/response handling)
app/services/user_service.py → Business logic (to be verified/created)
app/models/user.py       → Data model (ORM)
app/schemas/auth.py      → Data validation (Pydantic)
```

**Compliance Check:**

- ✅ Cryptographic operations isolated in security module
- ✅ FastAPI dependencies isolated in auth module
- ✅ HTTP handling isolated in endpoints
- ⚠️ **Potential Issue:** Direct database queries in auth endpoints (should be in service layer)
- ✅ Data validation properly handled by Pydantic schemas

**Recommendations:**

1. If service layer doesn't exist, create `app/services/user_service.py`
2. Move database query logic from endpoints to service layer
3. Endpoints should only handle HTTP concerns and call services
4. Services should only handle business logic and call models

### Asynchronous Architecture

**Requirements:**

- All endpoint functions must be `async def`
- Database operations use synchronous SQLAlchemy (acceptable with sync sessions)
- No blocking I/O operations in request handlers
- CPU-intensive operations (like password hashing) are acceptable as they're minimal

### Error Handling

**Requirements:**

- Invalid credentials: HTTP 401 Unauthorized
- Inactive user: HTTP 400 Bad Request
- Missing permissions: HTTP 403 Forbidden
- Email already exists: HTTP 400 Bad Request
- Invalid token: HTTP 401 Unauthorized
- All errors include descriptive messages without leaking sensitive information

## Security Best Practices

### Password Security

- Use bcrypt with automatic salt generation
- Never log or return plain passwords or hashed passwords
- Minimum password length enforced (6 characters, recommend 8+)

### Token Security

- JWT tokens signed with strong secret key (change in production)
- Tokens include expiration time (24 hours default)
- Tokens include issued-at time for tracking
- Subject claim contains user ID (not email for simplicity)

### Endpoint Security

- All protected endpoints require valid JWT token
- Token passed via HTTP Bearer authorization header
- No sensitive information in token payload (only user ID)
- Failed login attempts return generic error (prevent user enumeration)

## Testing Requirements

### Unit Tests (Future Scope)

- Test password hashing and verification
- Test JWT token creation and verification
- Test token expiration handling
- Test authentication dependencies with valid/invalid tokens

### Integration Tests (Future Scope)

- Test complete registration flow
- Test complete login flow
- Test accessing protected endpoints with token
- Test accessing protected endpoints without token
- Test password change flow

### Manual Testing (Current Deliverable)

The authentication system should be manually testable via:

1. API documentation at `/docs` (Swagger UI)
2. cURL commands or Postman
3. Frontend integration

## Performance Considerations

- Password hashing (bcrypt) is intentionally slow (security feature)
- Token verification is fast (only signature validation)
- Database queries should use indexes on email field
- Consider caching user objects if frequently accessed
- Single database query per authenticated request

## Documentation Requirements

- All functions have comprehensive docstrings
- Type hints on all function parameters and returns
- Module-level docstrings explaining purpose
- Inline comments for complex logic
- API endpoint documentation auto-generated by FastAPI
