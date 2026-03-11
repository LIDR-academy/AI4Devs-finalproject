# Service Layer Specification

This is the service layer specification for the spec detailed in @.agent-os/specs/2025-10-19-03-jwt-auth-review/spec.md

## Overview

This specification defines the required service layer for user management operations, implementing the Single Responsibility Principle by separating business logic and database operations from HTTP endpoint handlers.

## Current State Analysis

**Status:** `app/services/user_service.py` **does not exist**

**Existing Service Files:**

- `app/services/pdf_analysis_service.py` - PDF processing logic
- `app/services/template_service.py` - Template management logic

**Current Issue:**
Authentication endpoints in `app/api/v1/endpoints/auth.py` currently contain direct database queries, violating the Single Responsibility Principle:

- Endpoints handle both HTTP concerns AND database operations
- Business logic mixed with presentation layer
- Reduced testability and maintainability

## Required Service Module

### File Location

```
backend/app/services/user_service.py
```

### Module Purpose

Contain all user-related business logic and database operations, including:

- User creation and registration
- User retrieval and lookup
- User validation
- User updates (excluding password operations, which have specific security requirements)

## Required Functions

### 1. get_user_by_email

**Signature:**

```python
def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Retrieve a user by their email address.

    Args:
        db: SQLAlchemy database session
        email: User's email address

    Returns:
        User model instance if found, None otherwise

    Raises:
        None: Returns None instead of raising for not found cases
    """
```

**Implementation Requirements:**

- Query the `users` table filtering by email
- Use exact match (case-sensitive email comparison)
- Return first match or None if not found
- Single database query, no joins needed for basic lookup
- Should be used by:
  - Registration endpoint (check if email exists)
  - Login endpoint (retrieve user for authentication)
  - Password reset endpoint (find user for reset)

**Example Usage:**

```python
from app.services import user_service

# In endpoint
@router.post("/register")
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Check if user already exists
    existing_user = user_service.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Email already registered"
        )
    # ... continue registration
```

---

### 2. create_user

**Signature:**

```python
def create_user(db: Session, user_data: UserRegister) -> User:
    """
    Create a new user with hashed password.

    Args:
        db: SQLAlchemy database session
        user_data: UserRegister Pydantic schema with email, password, full_name

    Returns:
        Created User model instance with all fields populated

    Raises:
        None: Caller is responsible for checking email uniqueness before calling
    """
```

**Implementation Requirements:**

- Accept `UserRegister` Pydantic schema as input
- Hash the plain password using `get_password_hash` from `app.core.security`
- Create new `User` model instance with:
  - `email` from user_data
  - `hashed_password` from hashing function
  - `full_name` from user_data (optional, may be None)
  - `is_active=True` (default for new users)
  - `is_superuser=False` (default for new users)
- Add user to database session
- Commit the transaction
- Refresh the user object to populate auto-generated fields (id, created_at)
- Return the created user
- **Note:** Email uniqueness should be validated by caller before invoking this function

**Dependencies:**

```python
from app.core.security import get_password_hash
from app.models.user import User
from app.schemas.auth import UserRegister
```

**Example Usage:**

```python
from app.services import user_service

# In endpoint
@router.post("/register")
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Check email uniqueness first
    existing_user = user_service.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(...)

    # Create the user
    db_user = user_service.create_user(db, user_data)

    # Return response
    return UserResponse(
        id=db_user.id,
        email=db_user.email,
        full_name=db_user.full_name,
        is_active=db_user.is_active,
        is_superuser=db_user.is_superuser,
        created_at=db_user.created_at.isoformat() + "Z"
    )
```

---

### 3. get_user_by_id (Additional Helper)

**Signature:**

```python
def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """
    Retrieve a user by their ID.

    Args:
        db: SQLAlchemy database session
        user_id: User's unique identifier

    Returns:
        User model instance if found, None otherwise
    """
```

**Implementation Requirements:**

- Query the `users` table filtering by ID
- Return first match or None if not found
- Currently used by `get_current_user` in auth dependencies
- Could be used to consolidate user retrieval logic

**Optional:** This function is not strictly required by the original specification but would improve consistency and testability of the auth dependency functions.

---

### 4. authenticate_user (Additional Helper - Optional)

**Signature:**

```python
def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Authenticate a user with email and password.

    Args:
        db: SQLAlchemy database session
        email: User's email address
        password: Plain text password to verify

    Returns:
        User model instance if credentials are valid, None otherwise
    """
```

**Implementation Requirements:**

- Retrieve user by email using `get_user_by_email`
- If user not found, return None
- Verify password using `verify_password` from `app.core.security`
- If password invalid, return None
- If password valid, return user
- Centralizes authentication logic for reuse

**Dependencies:**

```python
from app.core.security import verify_password
```

**Example Usage:**

```python
from app.services import user_service

# In login endpoint
@router.post("/login")
def login(user_credentials: UserLogin, db: Session = Depends(get_db)):
    # Authenticate user
    user = user_service.authenticate_user(
        db,
        user_credentials.email,
        user_credentials.password
    )

    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect email or password"
        )

    if not user.is_active:
        raise HTTPException(
            status_code=status.HTTP_400_BAD_REQUEST,
            detail="Inactive user"
        )

    # Generate token and return response
    # ...
```

---

## Module Template

```python
"""
User service for business logic and database operations.

This module contains all user-related business logic, including user creation,
retrieval, and authentication operations. It follows the Single Responsibility
Principle by separating database operations from HTTP endpoint handlers.
"""

from typing import Optional
from sqlalchemy.orm import Session

from app.core.security import get_password_hash, verify_password
from app.models.user import User
from app.schemas.auth import UserRegister


def get_user_by_email(db: Session, email: str) -> Optional[User]:
    """
    Retrieve a user by their email address.

    Args:
        db: SQLAlchemy database session
        email: User's email address

    Returns:
        User model instance if found, None otherwise
    """
    return db.query(User).filter(User.email == email).first()


def create_user(db: Session, user_data: UserRegister) -> User:
    """
    Create a new user with hashed password.

    Args:
        db: SQLAlchemy database session
        user_data: UserRegister Pydantic schema with user details

    Returns:
        Created User model instance

    Note:
        Caller should verify email uniqueness before calling this function.
    """
    # Hash the password
    hashed_password = get_password_hash(user_data.password)

    # Create user instance
    db_user = User(
        email=user_data.email,
        hashed_password=hashed_password,
        full_name=user_data.full_name,
        is_active=True,
        is_superuser=False
    )

    # Persist to database
    db.add(db_user)
    db.commit()
    db.refresh(db_user)

    return db_user


def get_user_by_id(db: Session, user_id: int) -> Optional[User]:
    """
    Retrieve a user by their ID.

    Args:
        db: SQLAlchemy database session
        user_id: User's unique identifier

    Returns:
        User model instance if found, None otherwise
    """
    return db.query(User).filter(User.id == user_id).first()


def authenticate_user(db: Session, email: str, password: str) -> Optional[User]:
    """
    Authenticate a user with email and password.

    Args:
        db: SQLAlchemy database session
        email: User's email address
        password: Plain text password to verify

    Returns:
        User model instance if credentials are valid, None otherwise
    """
    # Get user by email
    user = get_user_by_email(db, email)
    if not user:
        return None

    # Verify password
    if not verify_password(password, user.hashed_password):
        return None

    return user
```

## Refactoring Required in Auth Endpoints

After creating the service layer, the authentication endpoints should be refactored to use it.

### Before (Direct Database Access)

```python
# app/api/v1/endpoints/auth.py
@router.post("/register", response_model=UserResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Direct database query
    existing_user = db.query(User).filter(User.email == user_data.email).first()
    if existing_user:
        raise HTTPException(...)

    # Direct password hashing and user creation
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

    return UserResponse(...)
```

### After (Using Service Layer)

```python
# app/api/v1/endpoints/auth.py
from app.services import user_service

@router.post("/register", response_model=UserResponse)
def register(user_data: UserRegister, db: Session = Depends(get_db)):
    # Use service layer for database operations
    existing_user = user_service.get_user_by_email(db, user_data.email)
    if existing_user:
        raise HTTPException(...)

    # Use service layer for user creation
    db_user = user_service.create_user(db, user_data)

    return UserResponse(
        id=db_user.id,
        email=db_user.email,
        full_name=db_user.full_name,
        is_active=db_user.is_active,
        is_superuser=db_user.is_superuser,
        created_at=db_user.created_at.isoformat() + "Z"
    )
```

## Benefits of Service Layer

### 1. Single Responsibility Principle (SOLID)

- **Endpoints:** Handle HTTP concerns (parsing, validation, responses)
- **Services:** Handle business logic and database operations
- **Models:** Define data structure
- **Schemas:** Validate input/output

### 2. Testability

**Before (Hard to Test):**

```python
# Must mock database session, FastAPI dependencies, HTTP context
def test_register():
    # Complex test setup
    pass
```

**After (Easy to Test):**

```python
# Test service layer independently
def test_create_user():
    # Simple database test
    user = user_service.create_user(db, user_data)
    assert user.email == user_data.email

# Test endpoint with mocked service
def test_register_endpoint(mock_user_service):
    # Mock service calls, test HTTP logic only
    pass
```

### 3. Reusability

Service functions can be used by:

- Multiple API endpoints
- Background tasks (Celery)
- Admin scripts
- Data migrations
- Test fixtures

### 4. Maintainability

- Clear separation makes code easier to understand
- Changes to database queries isolated to service layer
- Business logic changes don't affect HTTP handling
- Easier to add features (caching, logging, validation)

## Integration with Existing Code

### Update imports in **init**.py

```python
# app/services/__init__.py
from app.services.pdf_analysis_service import PDFAnalysisService
from app.services.template_service import TemplateService
from app.services import user_service  # Add this line

__all__ = [
    "PDFAnalysisService",
    "TemplateService",
    "user_service"
]
```

### Update auth endpoints

Refactor these endpoints to use the service layer:

1. `POST /auth/register` - Use `create_user` and `get_user_by_email`
2. `POST /auth/login` - Use `authenticate_user`
3. `POST /auth/login/oauth` - Already calls login, no change needed
4. `POST /auth/password-reset` - Use `get_user_by_email`
5. `POST /auth/password-reset/confirm` - Use `get_user_by_email`

## Testing Recommendations

### Unit Tests for Service Layer

```python
# tests/unit/services/test_user_service.py

def test_create_user(db_session):
    """Test user creation with password hashing."""
    user_data = UserRegister(
        email="test@example.com",
        password="password123",
        full_name="Test User"
    )

    user = user_service.create_user(db_session, user_data)

    assert user.email == "test@example.com"
    assert user.full_name == "Test User"
    assert user.hashed_password != "password123"  # Should be hashed
    assert user.is_active is True
    assert user.is_superuser is False


def test_get_user_by_email(db_session):
    """Test user retrieval by email."""
    # Create test user
    user_data = UserRegister(email="test@example.com", password="pass123")
    created_user = user_service.create_user(db_session, user_data)

    # Retrieve user
    retrieved_user = user_service.get_user_by_email(db_session, "test@example.com")

    assert retrieved_user is not None
    assert retrieved_user.id == created_user.id
    assert retrieved_user.email == "test@example.com"


def test_get_user_by_email_not_found(db_session):
    """Test user retrieval with non-existent email."""
    user = user_service.get_user_by_email(db_session, "nonexistent@example.com")
    assert user is None


def test_authenticate_user_success(db_session):
    """Test successful authentication."""
    user_data = UserRegister(email="test@example.com", password="password123")
    user_service.create_user(db_session, user_data)

    authenticated = user_service.authenticate_user(
        db_session,
        "test@example.com",
        "password123"
    )

    assert authenticated is not None
    assert authenticated.email == "test@example.com"


def test_authenticate_user_wrong_password(db_session):
    """Test authentication with wrong password."""
    user_data = UserRegister(email="test@example.com", password="password123")
    user_service.create_user(db_session, user_data)

    authenticated = user_service.authenticate_user(
        db_session,
        "test@example.com",
        "wrongpassword"
    )

    assert authenticated is None


def test_authenticate_user_nonexistent_email(db_session):
    """Test authentication with non-existent email."""
    authenticated = user_service.authenticate_user(
        db_session,
        "nonexistent@example.com",
        "password123"
    )

    assert authenticated is None
```

## Documentation Requirements

The service module should include:

- Module-level docstring explaining purpose and scope
- Function docstrings with Args, Returns, and Raises sections
- Type hints on all function signatures
- Inline comments for complex logic (minimal, code should be self-explanatory)

## Performance Considerations

- **Database queries:** Each function should execute minimal queries (typically 1)
- **No N+1 queries:** Avoid loading relationships unnecessarily
- **Transaction management:** Use database session's automatic transaction handling
- **Future optimization:** Consider adding caching for frequently accessed users

## Migration Path

1. **Phase 1:** Create `user_service.py` with required functions
2. **Phase 2:** Update `auth.py` endpoints to use service layer
3. **Phase 3:** Write unit tests for service layer
4. **Phase 4:** Write integration tests for refactored endpoints
5. **Phase 5:** Deploy and monitor for regressions

## Summary

The service layer is a critical missing piece for SOLID compliance. Creating `app/services/user_service.py` with the specified functions will:

- Improve code organization and maintainability
- Enable better testing practices
- Follow established patterns from other service files
- Reduce coupling between layers
- Make the authentication system more robust and extensible
