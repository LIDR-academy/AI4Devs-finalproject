package com.hexagonal.identity.domain.ports.out;

import com.hexagonal.identity.domain.exception.CredencialGoogleInvalidaException;
import com.hexagonal.identity.domain.model.GoogleUserInfo;

/**
 * Outbound Port: ValidarCredencialGooglePort
 *
 * <p>Validates a raw Google {@code id_token} against Google's public keys (JWKS)
 * and extracts the user claims.</p>
 *
 * <p>Throws {@link CredencialGoogleInvalidaException} if the token is invalid,
 * expired, or cannot be verified.</p>
 *
 * <p>Implemented by the Spring Security OAuth2 Resource Server adapter
 * in the infrastructure layer. The domain port has no knowledge of JWKS,
 * HTTP, or JWT libraries.</p>
 */
public interface ValidarCredencialGooglePort {

    /**
     * Validates the Google id_token and returns the extracted user information.
     *
     * @param idToken the raw Google id_token from the frontend
     * @return verified user information from the token claims
     * @throws CredencialGoogleInvalidaException if validation fails for any reason
     */
    GoogleUserInfo validar(String idToken);
}
