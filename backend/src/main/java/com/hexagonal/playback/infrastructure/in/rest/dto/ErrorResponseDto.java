package com.hexagonal.playback.infrastructure.in.rest.dto;

import com.fasterxml.jackson.annotation.JsonInclude;

import java.time.Instant;

/**
 * DTO for error responses.
 * 
 * Maps to OpenAPI ErrorResponse schema.
 * 
 * Used for:
 * - 404 Not Found (MeditationNotFoundException)
 * - 409 Conflict (MeditationNotPlayableException)
 * - 401 Unauthorized (Spring Security)
 */
@JsonInclude(JsonInclude.Include.NON_NULL)
public record ErrorResponseDto(
    String message,
    Instant timestamp,
    String details
) {
    public ErrorResponseDto {
        if (message == null || message.isBlank()) {
            throw new IllegalArgumentException("Message cannot be null or blank");
        }
        if (timestamp == null) {
            throw new IllegalArgumentException("Timestamp cannot be null");
        }
        // details is optional
    }
}
