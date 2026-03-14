package com.hexagonal.identity.infrastructure.in.rest.dto;

import com.hexagonal.identity.domain.model.PerfilDeUsuario;
import com.hexagonal.identity.domain.model.SesionToken;

import java.util.UUID;

/**
 * Response DTO for POST /v1/identity/auth/google (C1 and C2).
 *
 * <p>Returns the backend-issued session JWT plus the user's profile data.
 * Maps directly to the {@code AuthResponse} schema in {@code openapi/identity/US1.yaml}.</p>
 *
 * <p>Architecture: Infrastructure In — pure data transfer, no business logic.</p>
 */
public record AuthResponse(
        String sessionToken,
        UUID userId,
        String nombre,
        String correo,
        String urlFoto     // nullable — matches OpenAPI nullable: true
) {

    /**
     * Factory — builds the response from domain objects returned by the use case.
     *
     * @param token  the session token emitted by {@code EmitirTokenSesionPort}
     * @param perfil the user profile (new or recovered)
     */
    public static AuthResponse from(SesionToken token, PerfilDeUsuario perfil) {
        return new AuthResponse(
                token.token(),
                perfil.id(),
                perfil.nombre(),
                perfil.correo(),
                perfil.urlFoto()    // may be null — Jackson serialises it as null
        );
    }
}
