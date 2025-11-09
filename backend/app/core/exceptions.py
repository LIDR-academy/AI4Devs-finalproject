"""
Custom exception classes for SEPE Templates Comparator.

This module defines the exception hierarchy used throughout the application
for consistent error handling and reporting.
"""


class SEPEComparatorError(Exception):
    """Base exception for SEPE Comparator application."""
    
    def __init__(self, message: str, details: str = None):
        """Initialize the exception.
        
        Args:
            message: Human-readable error message
            details: Optional additional error details
        """
        self.message = message
        self.details = details
        super().__init__(self.message)


class PDFProcessingError(SEPEComparatorError):
    """Raised when PDF processing fails."""
    pass


class TemplateNotFoundError(SEPEComparatorError):
    """Raised when a template cannot be found."""
    pass


class ComparisonError(SEPEComparatorError):
    """Raised when template comparison fails."""
    pass


class DatabaseError(SEPEComparatorError):
    """Raised when database operations fail."""
    pass


class AuthenticationError(SEPEComparatorError):
    """Raised when authentication fails."""
    pass


class ValidationError(SEPEComparatorError):
    """Raised when data validation fails."""
    pass


class FileUploadError(SEPEComparatorError):
    """Raised when file upload operations fail."""
    pass


class ScrapingError(SEPEComparatorError):
    """Raised when web scraping operations fail."""
    pass
