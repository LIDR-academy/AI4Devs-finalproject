package com.hexagonal.identity.domain.ports.in;

import com.hexagonal.identity.domain.model.PerfilDeUsuario;
import com.hexagonal.identity.domain.model.SesionToken;

/**
 * Inbound Port: AutenticarConGoogleUseCase
 *
 * <p>Entry point for the Google authentication flow. Accepts a raw Google
 * {@code id_token} from the frontend and returns the session result.</p>
 *
 * <p>BDD origins:</p>
 * <ul>
 *   <li>C1: "Primer acceso de un usuario nuevo con su cuenta de Gmail" → creates profile</li>
 *   <li>C2: "Acceso recurrente de un usuario ya registrado" → recovers profile</li>
 * </ul>
 *
 * <p>Implemented by: {@code IniciarSesionConGoogleUseCase} in the application layer.</p>
 */
public interface AutenticarConGoogleUseCase {

    /**
     * Validates the Google id_token, upserts the user profile, and issues a session token.
     *
     * @param idToken raw Google id_token from the frontend OAuth flow
     * @return the result containing the session token and the resolved user profile
     * @throws com.hexagonal.identity.domain.exception.CredencialGoogleInvalidaException
     *         if the Google token is invalid or expired
     */
    ResultadoAutenticacion autenticar(String idToken);

    /**
     * Authentication result: session token + resolved profile.
     * Both are guaranteed non-null on success.
     */
    record ResultadoAutenticacion(SesionToken sesionToken, PerfilDeUsuario perfil) {}
}
