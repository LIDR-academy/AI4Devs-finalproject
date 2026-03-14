package com.hexagonal.identity.infrastructure.out.service.jwt;

import com.hexagonal.identity.domain.model.PerfilDeUsuario;
import com.hexagonal.identity.domain.model.SesionToken;
import com.hexagonal.identity.domain.ports.out.EmitirTokenSesionPort;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.JWSSigner;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import javax.crypto.SecretKey;
import java.time.Clock;
import java.time.Instant;
import java.time.temporal.ChronoUnit;
import java.util.Date;

/**
 * Infrastructure adapter: JWT session token emitter.
 *
 * <p>Issues a signed HS256 JWT as the application's own session token.
 * The token payload includes:</p>
 * <ul>
 *   <li>{@code sub} — the user's UUID (for downstream BC authentication)</li>
 *   <li>{@code iat} — issued-at timestamp</li>
 *   <li>{@code exp} — expiration (24 hours after issuance)</li>
 * </ul>
 *
 * <p>The signing key is an HS256 SecretKey derived from the {@code identity.jwt.secret}
 * configuration property. Minimum 32 characters required.</p>
 *
 * <p>Wired by {@link com.hexagonal.identity.infrastructure.config.IdentityConfig}.</p>
 */
public class JwtSessionTokenEmitter implements EmitirTokenSesionPort {

    private static final Logger log = LoggerFactory.getLogger(JwtSessionTokenEmitter.class);
    private static final long EXPIRY_HOURS = 24;

    private final SecretKey signingKey;
    private final Clock clock;

    public JwtSessionTokenEmitter(SecretKey signingKey, Clock clock) {
        this.signingKey = signingKey;
        this.clock = clock;
    }

    @Override
    public SesionToken emitir(PerfilDeUsuario perfil) {
        Instant now = Instant.now(clock);
        Instant exp = now.plus(EXPIRY_HOURS, ChronoUnit.HOURS);

        try {
            JWTClaimsSet claims = new JWTClaimsSet.Builder()
                    .subject(perfil.id().toString())
                    .issueTime(Date.from(now))
                    .expirationTime(Date.from(exp))
                    .build();

            JWSSigner signer = new MACSigner(signingKey);
            SignedJWT signedJWT = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims);
            signedJWT.sign(signer);

            String token = signedJWT.serialize();
            log.debug("Sesión JWT emitida para userId={}, exp={}", perfil.id(), exp);
            return new SesionToken(token, perfil.id());

        } catch (Exception ex) {
            throw new IllegalStateException("Error al firmar el token de sesión: " + ex.getMessage(), ex);
        }
    }
}
