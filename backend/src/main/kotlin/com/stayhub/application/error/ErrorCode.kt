package com.stayhub.application.error

/**
 * Machine-readable error codes used by domain and application layers.
 * Per contracts/error-responses.yml.
 *
 * HTTP status mapping lives in the presentation layer (GlobalExceptionHandler)
 * to keep this layer framework-free.
 */
enum class ErrorCode {
    VALIDATION_ERROR,
    NOT_FOUND,
    UNAUTHORIZED,
    FORBIDDEN,
    DATES_UNAVAILABLE,
    PAYMENT_FAILED,
    HOLD_EXPIRED,
    BOOKING_CANNOT_CANCEL,
    CONFLICT,
    INTERNAL_ERROR,
}
