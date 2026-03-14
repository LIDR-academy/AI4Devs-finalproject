package com.hexagonal.identity.infrastructure.in.rest.dto;

import jakarta.validation.constraints.NotBlank;

/**
 * Request DTO for POST /v1/identity/auth/google.
 *
 * <p>Contains the Google {@code id_token} obtained by the frontend via {@code @react-oauth/google}.</p>
 *
 * <p>Architecture: Infrastructure In — pure data transfer, no business logic.</p>
 */
public record GoogleAuthRequest(
        @NotBlank(message = "idToken is required") String idToken
) {
}
