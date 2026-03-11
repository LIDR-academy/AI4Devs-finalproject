"""
Tests for user_service module.

Tests the user management business logic including user creation,
retrieval, and authentication operations.
"""
from app.services import user_service
from app.models.user import User
from app.schemas.auth import UserRegister
from app.core.security import get_password_hash


class TestUserService:
    """Test cases for user_service functions."""

    def test_get_user_by_email_found(self, db_session):
        """Test retrieving an existing user by email."""
        # Arrange: Create a test user
        test_user = User(
            email="test@example.com",
            hashed_password=get_password_hash("password123"),
            full_name="Test User",
            is_active=True,
            is_superuser=False
        )
        db_session.add(test_user)
        db_session.commit()
        db_session.refresh(test_user)

        # Act: Retrieve the user by email
        retrieved_user = user_service.get_user_by_email(
            db_session, "test@example.com"
        )

        # Assert: User should be found
        assert retrieved_user is not None
        assert retrieved_user.email == "test@example.com"
        assert retrieved_user.full_name == "Test User"
        assert retrieved_user.is_active is True

    def test_get_user_by_email_not_found(self, db_session):
        """Test retrieving a non-existent user by email."""
        # Act: Try to retrieve non-existent user
        retrieved_user = user_service.get_user_by_email(
            db_session, "nonexistent@example.com"
        )

        # Assert: Should return None
        assert retrieved_user is None

    def test_get_user_by_email_case_sensitive(self, db_session):
        """Test that email lookup is case-sensitive."""
        # Arrange: Create a user with lowercase email
        test_user = User(
            email="test@example.com",
            hashed_password=get_password_hash("password123"),
            full_name="Test User",
            is_active=True,
            is_superuser=False
        )
        db_session.add(test_user)
        db_session.commit()

        # Act: Try to retrieve with uppercase email
        retrieved_user = user_service.get_user_by_email(
            db_session, "TEST@EXAMPLE.COM"
        )

        # Assert: Should not find user (case-sensitive)
        assert retrieved_user is None

    def test_create_user_success(self, db_session):
        """Test successful user creation with password hashing."""
        # Arrange: Prepare user data
        user_data = UserRegister(
            email="newuser@example.com",
            password="securePassword123",
            full_name="New User"
        )

        # Act: Create the user
        created_user = user_service.create_user(db_session, user_data)

        # Assert: User should be created with correct properties
        assert created_user is not None
        assert created_user.id is not None
        assert created_user.email == "newuser@example.com"
        assert created_user.full_name == "New User"
        assert created_user.is_active is True
        assert created_user.is_superuser is False
        assert created_user.created_at is not None

        # Assert: Password should be hashed (not plain text)
        assert created_user.hashed_password != "securePassword123"
        # bcrypt hash starts with $2b$
        assert created_user.hashed_password.startswith("$2b$")

    def test_create_user_without_full_name(self, db_session):
        """Test creating user without optional full_name field."""
        # Arrange: User data without full_name
        user_data = UserRegister(
            email="minimal@example.com",
            password="password123"
        )

        # Act: Create the user
        created_user = user_service.create_user(db_session, user_data)

        # Assert: User created with None full_name
        assert created_user is not None
        assert created_user.email == "minimal@example.com"
        assert created_user.full_name is None
        assert created_user.is_active is True

    def test_create_user_password_hashing(self, db_session):
        """Test that password is properly hashed during user creation."""
        # Arrange
        plain_password = "mySecretPassword123"
        user_data = UserRegister(
            email="hash@example.com",
            password=plain_password,
            full_name="Hash Test"
        )

        # Act: Create user
        created_user = user_service.create_user(db_session, user_data)

        # Assert: Password should be hashed and verifiable
        from app.core.security import verify_password
        assert created_user.hashed_password != plain_password
        assert verify_password(
            plain_password, created_user.hashed_password
        ) is True
        assert verify_password(
            "wrongPassword", created_user.hashed_password
        ) is False

    def test_get_user_by_id_found(self, db_session):
        """Test retrieving an existing user by ID."""
        # Arrange: Create a test user
        test_user = User(
            email="idtest@example.com",
            hashed_password=get_password_hash("password123"),
            full_name="ID Test User",
            is_active=True,
            is_superuser=False
        )
        db_session.add(test_user)
        db_session.commit()
        db_session.refresh(test_user)

        # Act: Retrieve user by ID
        retrieved_user = user_service.get_user_by_id(db_session, test_user.id)

        # Assert: User should be found
        assert retrieved_user is not None
        assert retrieved_user.id == test_user.id
        assert retrieved_user.email == "idtest@example.com"

    def test_get_user_by_id_not_found(self, db_session):
        """Test retrieving a non-existent user by ID."""
        # Act: Try to retrieve non-existent user
        retrieved_user = user_service.get_user_by_id(db_session, 99999)

        # Assert: Should return None
        assert retrieved_user is None

    def test_authenticate_user_success(self, db_session):
        """Test successful user authentication with correct credentials."""
        # Arrange: Create a user with known password
        password = "correctPassword123"
        user_data = UserRegister(
            email="auth@example.com",
            password=password,
            full_name="Auth Test"
        )
        created_user = user_service.create_user(db_session, user_data)

        # Act: Authenticate with correct credentials
        authenticated_user = user_service.authenticate_user(
            db_session,
            "auth@example.com",
            password
        )

        # Assert: Authentication should succeed
        assert authenticated_user is not None
        assert authenticated_user.id == created_user.id
        assert authenticated_user.email == "auth@example.com"

    def test_authenticate_user_wrong_password(self, db_session):
        """Test authentication fails with incorrect password."""
        # Arrange: Create a user
        user_data = UserRegister(
            email="wrongpass@example.com",
            password="correctPassword123",
            full_name="Wrong Pass Test"
        )
        user_service.create_user(db_session, user_data)

        # Act: Try to authenticate with wrong password
        authenticated_user = user_service.authenticate_user(
            db_session,
            "wrongpass@example.com",
            "incorrectPassword"
        )

        # Assert: Authentication should fail
        assert authenticated_user is None

    def test_authenticate_user_nonexistent_email(self, db_session):
        """Test authentication fails with non-existent email."""
        # Act: Try to authenticate with non-existent email
        authenticated_user = user_service.authenticate_user(
            db_session,
            "nonexistent@example.com",
            "anyPassword"
        )

        # Assert: Authentication should fail
        assert authenticated_user is None

    def test_authenticate_user_empty_password(self, db_session):
        """Test authentication fails with empty password."""
        # Arrange: Create a user
        user_data = UserRegister(
            email="emptypass@example.com",
            password="validPassword123"
        )
        user_service.create_user(db_session, user_data)

        # Act: Try to authenticate with empty password
        authenticated_user = user_service.authenticate_user(
            db_session,
            "emptypass@example.com",
            ""
        )

        # Assert: Authentication should fail
        assert authenticated_user is None

    def test_authenticate_user_inactive_user(self, db_session):
        """Test inactive users authentication.

        Verify that inactive users can still be authenticated
        (status check is endpoint's responsibility).
        """
        # Arrange: Create user and set as inactive
        user_data = UserRegister(
            email="inactive@example.com",
            password="password123"
        )
        user = user_service.create_user(db_session, user_data)
        user.is_active = False
        db_session.commit()

        # Act: Authenticate
        authenticated_user = user_service.authenticate_user(
            db_session,
            "inactive@example.com",
            "password123"
        )

        # Assert: Authentication succeeds (service doesn't check is_active)
        # The endpoint should check is_active separately
        assert authenticated_user is not None
        assert authenticated_user.is_active is False

    def test_create_multiple_users(self, db_session):
        """Test creating multiple users in sequence."""
        # Arrange & Act: Create multiple users
        user1_data = UserRegister(
            email="user1@example.com", password="password1"
        )
        user2_data = UserRegister(
            email="user2@example.com", password="password2"
        )
        user3_data = UserRegister(
            email="user3@example.com", password="password3"
        )

        user1 = user_service.create_user(db_session, user1_data)
        user2 = user_service.create_user(db_session, user2_data)
        user3 = user_service.create_user(db_session, user3_data)

        # Assert: All users created with unique IDs
        assert user1.id != user2.id != user3.id
        result1 = user_service.get_user_by_email(
            db_session, "user1@example.com"
        )
        result2 = user_service.get_user_by_email(
            db_session, "user2@example.com"
        )
        result3 = user_service.get_user_by_email(
            db_session, "user3@example.com"
        )
        assert result1 is not None
        assert result2 is not None
        assert result3 is not None

    def test_user_defaults(self, db_session):
        """Test that default values are set correctly for new users."""
        # Arrange & Act
        user_data = UserRegister(
            email="defaults@example.com",
            password="password123"
        )
        user = user_service.create_user(db_session, user_data)

        # Assert: Verify defaults
        msg1 = "New users should be active by default"
        msg2 = "New users should not be superusers by default"
        msg3 = "Full name should be None when not provided"
        msg4 = "Created timestamp should be set"
        assert user.is_active is True, msg1
        assert user.is_superuser is False, msg2
        assert user.full_name is None, msg3
        assert user.created_at is not None, msg4