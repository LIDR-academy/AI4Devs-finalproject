"""
Tests for the exception classes used in API error handling.

This module contains tests for the custom exception hierarchy used
for consistent error responses across the API.
"""

import pytest

from app.core.exceptions import (
    BaseAPIException,
    ValidationException,
    NotFoundException,
    UnauthorizedException,
)


@pytest.mark.unit
class TestBaseAPIException:
    """Test cases for the base API exception class."""
    
    def test_base_exception_can_be_instantiated_with_message(self):
        """Test that BaseAPIException can be instantiated with a message."""
        message = "Test error message"
        exception = BaseAPIException(message)
        assert str(exception) == message
    
    def test_base_exception_can_be_instantiated_with_message_and_status_code(self):
        """Test that BaseAPIException can be instantiated with message and status code."""
        message = "Test error message"
        status_code = 418
        exception = BaseAPIException(message, status_code)
        assert str(exception) == message
        assert exception.status_code == status_code
    
    def test_base_exception_defaults_to_500_status_code(self):
        """Test that BaseAPIException defaults to 500 status code when not provided."""
        message = "Test error message"
        exception = BaseAPIException(message)
        assert exception.status_code == 500
    
    def test_base_exception_is_subclass_of_exception(self):
        """Test that BaseAPIException inherits from Python's built-in Exception."""
        exception = BaseAPIException("test")
        assert isinstance(exception, Exception)


@pytest.mark.unit
class TestValidationException:
    """Test cases for validation exception class."""
    
    def test_validation_exception_defaults_to_400_status_code(self):
        """Test that ValidationException defaults to 400 status code."""
        message = "Validation error"
        exception = ValidationException(message)
        assert exception.status_code == 400
        assert str(exception) == message
    
    def test_validation_exception_can_override_status_code(self):
        """Test that ValidationException can override the default status code."""
        message = "Validation error"
        status_code = 422
        exception = ValidationException(message, status_code)
        assert exception.status_code == status_code
        assert str(exception) == message
    
    def test_validation_exception_inherits_from_base_api_exception(self):
        """Test that ValidationException inherits from BaseAPIException."""
        exception = ValidationException("test")
        assert isinstance(exception, BaseAPIException)


@pytest.mark.unit
class TestNotFoundException:
    """Test cases for not found exception class."""
    
    def test_not_found_exception_defaults_to_404_status_code(self):
        """Test that NotFoundException defaults to 404 status code."""
        message = "Resource not found"
        exception = NotFoundException(message)
        assert exception.status_code == 404
        assert str(exception) == message
    
    def test_not_found_exception_can_override_status_code(self):
        """Test that NotFoundException can override the default status code."""
        message = "Resource not found"
        status_code = 410  # Gone
        exception = NotFoundException(message, status_code)
        assert exception.status_code == status_code
        assert str(exception) == message
    
    def test_not_found_exception_inherits_from_base_api_exception(self):
        """Test that NotFoundException inherits from BaseAPIException."""
        exception = NotFoundException("test")
        assert isinstance(exception, BaseAPIException)


@pytest.mark.unit
class TestUnauthorizedException:
    """Test cases for unauthorized exception class."""
    
    def test_unauthorized_exception_defaults_to_401_status_code(self):
        """Test that UnauthorizedException defaults to 401 status code."""
        message = "Authentication required"
        exception = UnauthorizedException(message)
        assert exception.status_code == 401
        assert str(exception) == message
    
    def test_unauthorized_exception_can_override_status_code(self):
        """Test that UnauthorizedException can override the default status code."""
        message = "Authentication required"
        status_code = 403  # Forbidden
        exception = UnauthorizedException(message, status_code)
        assert exception.status_code == status_code
        assert str(exception) == message
    
    def test_unauthorized_exception_inherits_from_base_api_exception(self):
        """Test that UnauthorizedException inherits from BaseAPIException."""
        exception = UnauthorizedException("test")
        assert isinstance(exception, BaseAPIException)


@pytest.mark.unit
class TestExceptionInheritance:
    """Test cases for exception inheritance hierarchy."""
    
    def test_all_exceptions_inherit_from_base_api_exception(self):
        """Test that all custom exceptions inherit from BaseAPIException."""
        validation_exc = ValidationException("test")
        not_found_exc = NotFoundException("test")
        unauthorized_exc = UnauthorizedException("test")
        
        assert isinstance(validation_exc, BaseAPIException)
        assert isinstance(not_found_exc, BaseAPIException)
        assert isinstance(unauthorized_exc, BaseAPIException)
    
    def test_all_exceptions_inherit_from_python_exception(self):
        """Test that all custom exceptions inherit from Python's Exception."""
        base_exc = BaseAPIException("test")
        validation_exc = ValidationException("test")
        not_found_exc = NotFoundException("test")
        unauthorized_exc = UnauthorizedException("test")
        
        assert isinstance(base_exc, Exception)
        assert isinstance(validation_exc, Exception)
        assert isinstance(not_found_exc, Exception)
        assert isinstance(unauthorized_exc, Exception)
    
    def test_exceptions_can_be_caught_by_base_exception_type(self):
        """Test that specific exceptions can be caught using BaseAPIException."""
        exceptions = [
            ValidationException("validation error"),
            NotFoundException("not found error"),
            UnauthorizedException("unauthorized error"),
        ]
        
        for exc in exceptions:
            try:
                raise exc
            except BaseAPIException as caught_exc:
                assert caught_exc is exc
            except Exception:
                pytest.fail("Exception should have been caught as BaseAPIException")


@pytest.mark.unit
class TestExceptionAttributes:
    """Test cases for exception attribute access."""
    
    def test_exception_message_accessible_via_str(self):
        """Test that exception message is accessible via str() method."""
        message = "Test error message"
        exceptions = [
            BaseAPIException(message),
            ValidationException(message),
            NotFoundException(message),
            UnauthorizedException(message),
        ]
        
        for exc in exceptions:
            assert str(exc) == message
    
    def test_exception_status_code_attribute_accessible(self):
        """Test that status_code attribute is accessible on all exceptions."""
        exceptions_with_expected_codes = [
            (BaseAPIException("test"), 500),
            (ValidationException("test"), 400),
            (NotFoundException("test"), 404),
            (UnauthorizedException("test"), 401),
        ]
        
        for exc, expected_code in exceptions_with_expected_codes:
            assert hasattr(exc, 'status_code')
            assert exc.status_code == expected_code
    
    def test_exception_args_contain_message(self):
        """Test that exception args tuple contains the message."""
        message = "Test error message"
        exceptions = [
            BaseAPIException(message),
            ValidationException(message),
            NotFoundException(message),
            UnauthorizedException(message),
        ]
        
        for exc in exceptions:
            assert exc.args[0] == message
