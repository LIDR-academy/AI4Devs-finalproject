package com.hexagonal.identity.infrastructure.out.service.google;

import com.hexagonal.identity.domain.exception.CredencialGoogleInvalidaException;
import com.hexagonal.identity.domain.model.GoogleUserInfo;
import com.hexagonal.identity.domain.ports.out.ValidarCredencialGooglePort;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

/**
 * Infrastructure adapter: Google JWKS credential validator.
 *
 * <p>Validates a raw Google {@code id_token} (RS256) against Google's public
 * JWKS endpoint ({@code https://www.googleapis.com/oauth2/v3/certs}) using
 * Spring Security's {@link NimbusJwtDecoder}.</p>
 *
 * <p>On success, extracts user claims and returns a {@link GoogleUserInfo} value object.</p>
 *
 * <p>On validation failure, throws {@link CredencialGoogleInvalidaException}.</p>
 *
 * <p>Wired by {@link com.hexagonal.identity.infrastructure.config.IdentityConfig}.</p>
 */
public class GoogleJwksCredentialValidator implements ValidarCredencialGooglePort {

    private static final Logger log = LoggerFactory.getLogger(GoogleJwksCredentialValidator.class);

    private final NimbusJwtDecoder decoder;

    public GoogleJwksCredentialValidator(String jwksUri) {
        this.decoder = NimbusJwtDecoder.withJwkSetUri(jwksUri).build();
    }

    /** Package-private constructor for testing with a pre-configured decoder */
    GoogleJwksCredentialValidator(NimbusJwtDecoder decoder) {
        this.decoder = decoder;
    }

    @Override
    public GoogleUserInfo validar(String idToken) {
        log.debug("Validando id_token de Google (longitud={})", idToken != null ? idToken.length() : 0);
        try {
            Jwt jwt = decoder.decode(idToken);

            String identificadorGoogle = jwt.getSubject();
            String correo   = jwt.getClaimAsString("email");
            String nombre   = jwt.getClaimAsString("name");
            String urlFoto  = jwt.getClaimAsString("picture");

            log.debug("Google id_token válido para sub={}", identificadorGoogle);
            return new GoogleUserInfo(identificadorGoogle, correo, nombre, urlFoto);

        } catch (JwtException ex) {
            log.warn("Google id_token inválido: {}", ex.getMessage());
            throw new CredencialGoogleInvalidaException(
                    "Google id_token inválido o expirado: " + ex.getMessage());
        }
    }
}
