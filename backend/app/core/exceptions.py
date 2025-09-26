"""
Custom exception classes for API error handling.

This module provides a hierarchy of exception classes used throughout the API
for consistent error handling and response formatting.
"""


class BaseAPIException(Exception):
    """
    Base class for all API exceptions.
    
    This exception serves as the parent class for all custom API exceptions,
    providing a consistent interface for error handling with HTTP status codes.
    
    Attributes:
        status_code (int): HTTP status code associated with the exception.
                          Defaults to 500 (Internal Server Error).
    """
    
    def __init__(self, message: str, status_code: int = 500):
        """
        Initialize the base API exception.
        
        Args:
            message (str): Human-readable error message.
            status_code (int, optional): HTTP status code. Defaults to 500.
        """
        super().__init__(message)
        self.status_code = status_code


class ValidationException(BaseAPIException):
    """
    Exception raised for request validation errors.
    
    This exception is used when client-provided data fails validation,
    such as invalid input formats, missing required fields, or constraint violations.
    
    Defaults to HTTP 400 (Bad Request) status code.
    """
    
    def __init__(self, message: str, status_code: int = 400):
        """
        Initialize the validation exception.
        
        Args:
            message (str): Human-readable validation error message.
            status_code (int, optional): HTTP status code. Defaults to 400.
        """
        super().__init__(message, status_code)


class NotFoundException(BaseAPIException):
    """
    Exception raised when a requested resource is not found.
    
    This exception is used when a client requests a resource (by ID, name, etc.)
    that does not exist in the system.
    
    Defaults to HTTP 404 (Not Found) status code.
    """
    
    def __init__(self, message: str, status_code: int = 404):
        """
        Initialize the not found exception.
        
        Args:
            message (str): Human-readable error message describing what was not found.
            status_code (int, optional): HTTP status code. Defaults to 404.
        """
        super().__init__(message, status_code)


class UnauthorizedException(BaseAPIException):
    """
    Exception raised for authentication and authorization failures.
    
    This exception is used when a client request lacks proper authentication
    credentials or the authenticated user lacks permission for the requested action.
    
    Defaults to HTTP 401 (Unauthorized) status code.
    """
    
    def __init__(self, message: str, status_code: int = 401):
        """
        Initialize the unauthorized exception.
        
        Args:
            message (str): Human-readable authentication/authorization error message.
            status_code (int, optional): HTTP status code. Defaults to 401.
        """
        super().__init__(message, status_code)
