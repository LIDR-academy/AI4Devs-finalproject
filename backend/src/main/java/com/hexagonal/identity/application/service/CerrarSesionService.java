package com.hexagonal.identity.application.service;

import com.hexagonal.identity.domain.ports.in.CerrarSesionUseCase;

/**
 * Application Service: CerrarSesionService
 *
 * <p>Implements {@link CerrarSesionUseCase}. MVP implementation for stateless JWT sessions.</p>
 *
 * <p>BDD origin: C4 — "Cierre de sesión"
 * In this MVP, session tokens are stateless JWTs. The use case validates the parameter
 * and signals intent. Token invalidation is handled by the frontend (drop from memory)
 * and may be extended with a server-side blocklist in a future iteration.</p>
 *
 * <p>No Spring annotations — wired by the infrastructure configuration bean.</p>
 */
public class CerrarSesionService implements CerrarSesionUseCase {

    /**
     * {@inheritDoc}
     *
     * @throws IllegalArgumentException if {@code sessionToken} is null or blank
     */
    @Override
    public void cerrarSesion(String sessionToken) {
        if (sessionToken == null || sessionToken.isBlank()) {
            throw new IllegalArgumentException("sessionToken must not be null or blank");
        }
        // MVP: stateless JWT — no server-side state to invalidate.
        // The frontend is responsible for discarding the token.
        // A token blocklist can be added here in future iterations without changing this interface.
    }
}
