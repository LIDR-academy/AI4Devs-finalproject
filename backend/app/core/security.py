"""
Security utilities for SEPE Templates Comparator.

This module provides cryptographic operations for the authentication system:
- JWT token creation and verification for access control
- Password hashing and verification using bcrypt
- Password reset token generation and validation

All cryptographic operations follow security best practices and use
configurable settings from app.core.config.

Security Features:
    - JWT tokens with configurable expiration
    - Bcrypt password hashing with automatic salt generation
    - Separate token types for access and password reset
    - Protection against timing attacks in password verification

Example:
    >>> from app.core.security import create_access_token, verify_password
    >>> token = create_access_token(subject=user_id)
    >>> is_valid = verify_password("password123", hashed_password)
"""

from datetime import datetime, timedelta
from typing import Optional, Union
import jwt
from passlib.context import CryptContext
from passlib.hash import bcrypt

from app.core.config import settings


# Password hashing context
pwd_context = CryptContext(schemes=["bcrypt"], deprecated="auto")


def create_access_token(
    subject: Union[str, int], expires_delta: Optional[timedelta] = None
) -> str:
    """
    Create a JWT access token for user authentication.

    Generates a JSON Web Token containing the user identifier (subject),
    issue time, and expiration time. The token is signed with the
    application's secret key using the configured algorithm.

    Args:
        subject: User identifier to encode in the token. Typically a user ID
            (int) or email (str). Will be converted to string for encoding.
        expires_delta: Optional custom token expiration time. If not provided,
            uses the default from settings.JWT_EXPIRATION_HOURS.

    Returns:
        str: Encoded JWT token as a string. This token should be sent to
            the client and included in subsequent requests via the
            Authorization header.

    Example:
        >>> from datetime import timedelta
        >>> token = create_access_token(subject=123)
        >>> custom_token = create_access_token(
        ...     subject="user@example.com",
        ...     expires_delta=timedelta(hours=24)
        ... )

    Note:
        The token includes:
        - 'sub' (subject): User identifier
        - 'iat' (issued at): Token creation timestamp
        - 'exp' (expiration): Token expiration timestamp
    """
    if expires_delta:
        expire = datetime.utcnow() + expires_delta
    else:
        expire = datetime.utcnow() + timedelta(hours=settings.JWT_EXPIRATION_HOURS)

    to_encode = {
        "exp": expire,
        "iat": datetime.utcnow(),
        "sub": str(subject)
    }

    encoded_jwt = jwt.encode(
        to_encode,
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM
    )
    return encoded_jwt


def verify_token(token: str) -> Optional[str]:
    """
    Verify and decode a JWT access token.

    Validates the token signature, checks expiration, and extracts the
    subject (user identifier) from the token payload.

    Args:
        token: JWT token string to verify and decode.

    Returns:
        Optional[str]: Subject (user identifier) from the token if valid,
            None if the token is invalid, expired, or malformed.

    Example:
        >>> token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        >>> subject = verify_token(token)
        >>> if subject:
        ...     user_id = int(subject)

    Note:
        Returns None for any JWT error including:
        - Invalid signature
        - Expired token
        - Malformed token structure
        - Missing required claims
    """
    try:
        payload = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        return payload.get("sub")
    except jwt.PyJWTError:
        return None


def verify_password(plain_password: str, hashed_password: str) -> bool:
    """
    Verify a plain text password against a bcrypt hashed password.

    Uses constant-time comparison to prevent timing attacks. The bcrypt
    algorithm automatically handles salt extraction from the hash.

    Args:
        plain_password: Plain text password provided by the user during
            login or authentication.
        hashed_password: Bcrypt hashed password stored in the database.
            Should be in the format: $2b$12$... (bcrypt hash string).

    Returns:
        bool: True if the password matches the hash, False otherwise.

    Example:
        >>> hashed = get_password_hash("secret123")
        >>> verify_password("secret123", hashed)
        True
        >>> verify_password("wrong_password", hashed)
        False

    Security:
        - Uses constant-time comparison to prevent timing attacks
        - Automatically validates hash format
        - Resistant to rainbow table attacks due to salt
    """
    return pwd_context.verify(plain_password, hashed_password)


def get_password_hash(password: str) -> str:
    """
    Hash a plain text password using bcrypt.

    Generates a secure bcrypt hash with automatic salt generation.
    The resulting hash includes the algorithm identifier, cost factor,
    salt, and the hashed password.

    Args:
        password: Plain text password to hash. Should be the user's
            password at registration or password change.

    Returns:
        str: Bcrypt hashed password string in the format:
            $2b$12$[22 char salt][31 char hash]
            Example: $2b$12$N9qo8uLOickgx2ZMRZoMye...

    Example:
        >>> password = "my_secure_password123"
        >>> hashed = get_password_hash(password)
        >>> len(hashed)  # Bcrypt hashes are always 60 characters
        60
        >>> hashed.startswith("$2b$")
        True

    Security:
        - Automatically generates a random salt
        - Uses configurable cost factor (default: 12 rounds)
        - Produces different hashes for the same password (due to salt)
        - Resistant to rainbow table and brute force attacks

    Note:
        Each call with the same password produces a different hash
        due to the random salt. Use verify_password() to check passwords.
    """
    return pwd_context.hash(password)


def generate_password_reset_token(email: str) -> str:
    """
    Generate a time-limited JWT token for password reset.

    Creates a special JWT token with type "reset" that can be used
    for password reset operations. The token includes the user's email
    in the subject claim and has the same expiration as access tokens.

    Args:
        email: User's email address to encode in the token. This email
            will be extracted when the token is verified.

    Returns:
        str: Encoded JWT token containing the email and reset type marker.
            This token should be sent to the user via email.

    Example:
        >>> token = generate_password_reset_token("user@example.com")
        >>> # Send token to user via email
        >>> # Token can be verified with verify_password_reset_token()

    Token Structure:
        - 'sub' (subject): User's email address
        - 'exp' (expiration): Token expiration timestamp
        - 'nbf' (not before): Token creation timestamp
        - 'type': "reset" (distinguishes from access tokens)

    Security:
        - Time-limited validity (uses JWT_EXPIRATION_HOURS setting)
        - Type marker prevents misuse of access tokens
        - Should be sent via secure channel (email)
        - Single-use recommended (invalidate after use)

    Note:
        The application should implement additional security measures:
        - Store used tokens to prevent replay attacks
        - Send reset links via email only
        - Validate user exists before generating token
    """
    delta = timedelta(hours=settings.JWT_EXPIRATION_HOURS)
    now = datetime.utcnow()
    expires = now + delta

    exp = expires.timestamp()
    encoded_jwt = jwt.encode(
        {"exp": exp, "nbf": now, "sub": email, "type": "reset"},
        settings.JWT_SECRET_KEY,
        algorithm=settings.JWT_ALGORITHM,
    )
    return encoded_jwt


def verify_password_reset_token(token: str) -> Optional[str]:
    """
    Verify and decode a password reset token.

    Validates the token signature, checks expiration and type, then
    extracts the user's email from the token payload.

    Args:
        token: JWT password reset token string generated by
            generate_password_reset_token().

    Returns:
        Optional[str]: User's email address if the token is valid and has
            type "reset", None if the token is invalid, expired, malformed,
            or not a reset token.

    Example:
        >>> token = generate_password_reset_token("user@example.com")
        >>> email = verify_password_reset_token(token)
        >>> if email:
        ...     # Allow user to reset password
        ...     user = get_user_by_email(db, email)

    Validation Checks:
        - Token signature is valid
        - Token has not expired
        - Token type is "reset" (not an access token)
        - Token contains a subject (email)

    Security:
        - Returns None for any validation failure
        - Prevents use of regular access tokens for password reset
        - Time-bound validity prevents old tokens from being used
        - Should be combined with additional verification (e.g., user exists)

    Note:
        For additional security, the application should:
        - Track used tokens to prevent replay attacks
        - Invalidate token after successful password reset
        - Limit number of reset attempts per time period
    """
    try:
        decoded_token = jwt.decode(
            token,
            settings.JWT_SECRET_KEY,
            algorithms=[settings.JWT_ALGORITHM]
        )
        if decoded_token.get("type") == "reset":
            return decoded_token.get("sub")
    except jwt.PyJWTError:
        return None
    return None
