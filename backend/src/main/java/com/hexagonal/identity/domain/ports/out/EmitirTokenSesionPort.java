package com.hexagonal.identity.domain.ports.out;

import com.hexagonal.identity.domain.model.PerfilDeUsuario;
import com.hexagonal.identity.domain.model.SesionToken;

/**
 * Outbound Port: EmitirTokenSesionPort
 *
 * <p>Issues a signed JWT session token for a successfully authenticated user.
 * This is the backend's own JWT — not a Google token.</p>
 *
 * <p>The token must encode the {@code userId} (UUID) as the {@code sub} claim
 * so that the shared security filter can extract it and provide it to all BCs.</p>
 *
 * <p>Implemented by the JWT adapter in the infrastructure layer.</p>
 */
public interface EmitirTokenSesionPort {

    /**
     * Issues a new session token for the given user profile.
     *
     * @param perfil the authenticated user profile
     * @return the session token containing the signed JWT and the user's UUID
     */
    SesionToken emitir(PerfilDeUsuario perfil);
}
