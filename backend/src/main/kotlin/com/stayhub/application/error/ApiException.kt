package com.stayhub.application.error

/**
 * Base type for application-thrown errors that map to a known [ErrorCode].
 * Domain and application layers throw subtypes; the presentation layer's
 * GlobalExceptionHandler renders them as HTTP responses.
 *
 * No framework dependencies — this is part of the application layer.
 */
sealed class ApiException(
    val code: ErrorCode,
    override val message: String,
    val details: List<ErrorDetail>? = null,
) : RuntimeException(message)

class NotFoundException(message: String) :
    ApiException(ErrorCode.NOT_FOUND, message)

class ValidationException(message: String, details: List<ErrorDetail>? = null) :
    ApiException(ErrorCode.VALIDATION_ERROR, message, details)

class UnauthorizedException(message: String = "Authentication required") :
    ApiException(ErrorCode.UNAUTHORIZED, message)

class ForbiddenException(message: String = "You do not have access to this resource") :
    ApiException(ErrorCode.FORBIDDEN, message)

class DatesUnavailableException(message: String = "Requested dates are not available") :
    ApiException(ErrorCode.DATES_UNAVAILABLE, message)

class PaymentFailedException(message: String) :
    ApiException(ErrorCode.PAYMENT_FAILED, message)

class HoldExpiredException(message: String = "Availability hold expired before payment") :
    ApiException(ErrorCode.HOLD_EXPIRED, message)

class BookingCannotCancelException(message: String) :
    ApiException(ErrorCode.BOOKING_CANNOT_CANCEL, message)

class ConflictException(message: String) :
    ApiException(ErrorCode.CONFLICT, message)
