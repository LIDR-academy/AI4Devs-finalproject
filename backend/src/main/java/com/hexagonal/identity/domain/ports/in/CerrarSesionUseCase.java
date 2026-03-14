package com.hexagonal.identity.domain.ports.in;

/**
 * Inbound Port: CerrarSesionUseCase
 *
 * <p>Invalidates the active session for a user.</p>
 *
 * <p>BDD origin: C4 — "Cierre de sesión"
 * "After clicking Cerrar sesión, the application disconnects the user and
 * redirects to the login screen. On returning, no previous session data is visible."</p>
 *
 * <p>Implementation note: for this MVP the session is stateless (JWT).
 * The use case signals the intent; the infrastructure adapter may implement
 * a token blocklist or simply rely on token expiry. The BDD guarantee is that
 * the frontend removes the token from memory.</p>
 */
public interface CerrarSesionUseCase {

    /**
     * Invalidates the session associated with the given session token.
     *
     * @param sessionToken the JWT session token to invalidate
     */
    void cerrarSesion(String sessionToken);
}
