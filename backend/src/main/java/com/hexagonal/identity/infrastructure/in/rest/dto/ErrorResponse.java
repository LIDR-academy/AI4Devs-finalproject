package com.hexagonal.identity.infrastructure.in.rest.dto;

/**
 * Error response DTO for the Identity API.
 *
 * <p>Maps to the {@code ErrorResponse} schema in {@code openapi/identity/US1.yaml}.</p>
 *
 * <p>Architecture: Infrastructure In — pure data transfer, no business logic.</p>
 */
public record ErrorResponse(
        String code,
        String message
) {
}
