package com.hexagonal.meditationbuilder.infrastructure.in.rest.dto;

import java.time.Instant;

/**
 * Response DTO for API errors.
 * 
 * Maps to: ErrorResponse in OpenAPI
 * Used in: All error responses (400, 404, 429, 500, 503)
 * 
 * @param error Error code (e.g., VALIDATION_ERROR, NOT_FOUND)
 * @param message Human-readable error message
 * @param timestamp When the error occurred (must be supplied by caller via injected Clock)
 * @param details Additional error details (optional)
 */
public record ErrorResponse(
        String error,
        String message,
        Instant timestamp,
        Object details
) {
}
