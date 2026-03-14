package com.hexagonal.identity.infrastructure.config;

import com.hexagonal.identity.application.service.CerrarSesionService;
import com.hexagonal.identity.application.service.IniciarSesionConGoogleService;
import com.hexagonal.identity.domain.ports.in.AutenticarConGoogleUseCase;
import com.hexagonal.identity.domain.ports.in.CerrarSesionUseCase;
import com.hexagonal.identity.domain.ports.out.BuscarPerfilPorGoogleIdPort;
import com.hexagonal.identity.domain.ports.out.EmitirTokenSesionPort;
import com.hexagonal.identity.domain.ports.out.PersistirPerfilPort;
import com.hexagonal.identity.domain.ports.out.ValidarCredencialGooglePort;
import com.hexagonal.identity.infrastructure.out.service.google.GoogleJwksCredentialValidator;
import com.hexagonal.identity.infrastructure.out.service.jwt.JwtSessionTokenEmitter;
import com.hexagonal.shared.security.SessionJwtAuthenticationFilter;
import org.springframework.boot.context.properties.EnableConfigurationProperties;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Clock;

/**
 * Spring configuration for the Identity bounded context.
 *
 * <p>Wires application services with their out-port adapters:
 * persistence (PostgreSQL), Google JWKS validator, and JWT session emitter.</p>
 *
 * <p>Also provides the {@link SessionJwtAuthenticationFilter} bean (shared/security).</p>
 */
@Configuration
@EnableConfigurationProperties(IdentityProperties.class)
public class IdentityConfig {

    // ─── JWT signing/verification key ─────────────────────────────────────────

    @Bean
    public SecretKey identityJwtSigningKey(IdentityProperties props) {
        byte[] keyBytes = props.getJwt().getSecret().getBytes(StandardCharsets.UTF_8);
        if (keyBytes.length < 32) {
            throw new IllegalStateException(
                    "identity.jwt.secret must be at least 32 characters for HS256");
        }
        return new SecretKeySpec(keyBytes, "HmacSHA256");
    }

    @Bean
    public NimbusJwtDecoder identityJwtDecoder(SecretKey identityJwtSigningKey) {
        return NimbusJwtDecoder.withSecretKey(identityJwtSigningKey).build();
    }

    // ─── Out-port adapters ────────────────────────────────────────────────────

    @Bean
    public ValidarCredencialGooglePort validarCredencialGooglePort(IdentityProperties props) {
        return new GoogleJwksCredentialValidator(props.getGoogle().getJwksUri());
    }

    @Bean
    public EmitirTokenSesionPort emitirTokenSesionPort(SecretKey identityJwtSigningKey, Clock clock) {
        return new JwtSessionTokenEmitter(identityJwtSigningKey, clock);
    }

    // ─── Application services (in-port implementations) ──────────────────────

    @Bean
    public AutenticarConGoogleUseCase autenticarConGoogleUseCase(
            ValidarCredencialGooglePort validarCredencialGooglePort,
            BuscarPerfilPorGoogleIdPort buscarPerfilPorGoogleIdPort,
            PersistirPerfilPort persistirPerfilPort,
            EmitirTokenSesionPort emitirTokenSesionPort,
            Clock clock) {
        return new IniciarSesionConGoogleService(
                validarCredencialGooglePort,
                buscarPerfilPorGoogleIdPort,
                persistirPerfilPort,
                emitirTokenSesionPort,
                clock);
    }

    @Bean
    public CerrarSesionUseCase cerrarSesionUseCase() {
        return new CerrarSesionService();
    }

    // ─── Shared security filter ────────────────────────────────────────────────

    @Bean
    public SessionJwtAuthenticationFilter sessionJwtAuthenticationFilter(
            NimbusJwtDecoder identityJwtDecoder) {
        return new SessionJwtAuthenticationFilter(identityJwtDecoder);
    }
}
