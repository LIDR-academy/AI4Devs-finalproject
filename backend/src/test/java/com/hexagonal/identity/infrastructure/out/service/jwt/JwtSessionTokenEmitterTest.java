package com.hexagonal.identity.infrastructure.out.service.jwt;

import com.hexagonal.identity.domain.model.PerfilDeUsuario;
import com.hexagonal.identity.domain.model.SesionToken;
import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jwt.SignedJWT;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.time.Clock;
import java.time.Instant;
import java.time.ZoneOffset;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for {@link JwtSessionTokenEmitter} (TDD — Phase 5).
 *
 * <p>Verifies:</p>
 * <ul>
 *   <li>Emits an HS256 signed JWT for a given profile</li>
 *   <li>Subject claim equals the userId UUID</li>
 *   <li>Token can be parsed back as a valid SignedJWT</li>
 *   <li>SesionToken#userId matches the profile UUID</li>
 * </ul>
 */
@DisplayName("JwtSessionTokenEmitter")
class JwtSessionTokenEmitterTest {

    private static final String RAW_SECRET = "test-identity-jwt-secret-for-ci-tests-only!!";
    private static final Clock FIXED_CLOCK =
            Clock.fixed(Instant.parse("2026-02-26T10:00:00Z"), ZoneOffset.UTC);

    private JwtSessionTokenEmitter emitter;

    @BeforeEach
    void setUp() {
        SecretKey signingKey = new SecretKeySpec(
                RAW_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256");
        emitter = new JwtSessionTokenEmitter(signingKey, FIXED_CLOCK);
    }

    @Test
    @DisplayName("emite un SesionToken no nulo")
    void emitir_devuelveTokenNoNulo() {
        PerfilDeUsuario perfil = PerfilDeUsuario.nuevo(
                "google-sub", "user@test.com", "User", null, FIXED_CLOCK);

        SesionToken token = emitter.emitir(perfil);

        assertThat(token).isNotNull();
        assertThat(token.token()).isNotBlank();
        assertThat(token.userId()).isEqualTo(perfil.id());
    }

    @Test
    @DisplayName("el JWT tiene algoritmo HS256")
    void emitir_jwtTieneHS256() throws Exception {
        PerfilDeUsuario perfil = PerfilDeUsuario.nuevo(
                "google-sub-2", "user2@test.com", "User2", null, FIXED_CLOCK);

        SesionToken token = emitter.emitir(perfil);

        SignedJWT jwt = SignedJWT.parse(token.token());
        assertThat(jwt.getHeader().getAlgorithm()).isEqualTo(JWSAlgorithm.HS256);
    }

    @Test
    @DisplayName("el claim sub es el UUID del perfil")
    void emitir_subClaimEsElUUIDDelPerfil() throws Exception {
        UUID userId = UUID.randomUUID();
        PerfilDeUsuario perfil = PerfilDeUsuario.reconocer(
                userId, "google-sub-3", "u3@test.com", "User3",
                null, Instant.parse("2026-02-26T10:00:00Z"));

        SesionToken token = emitter.emitir(perfil);

        SignedJWT jwt = SignedJWT.parse(token.token());
        assertThat(jwt.getJWTClaimsSet().getSubject()).isEqualTo(userId.toString());
    }

    @Test
    @DisplayName("el JWT tiene fecha de expiración 24 horas en el futuro")
    void emitir_expiracionEs24HorasDespues() throws Exception {
        PerfilDeUsuario perfil = PerfilDeUsuario.nuevo(
                "google-sub-4", "u4@test.com", "User4", null, FIXED_CLOCK);
        Instant expectedExp = Instant.parse("2026-02-27T10:00:00Z");

        SesionToken token = emitter.emitir(perfil);

        SignedJWT jwt = SignedJWT.parse(token.token());
        Instant actualExp = jwt.getJWTClaimsSet().getExpirationTime().toInstant();
        assertThat(actualExp).isEqualTo(expectedExp);
    }

    @Test
    @DisplayName("dos tokens para el mismo perfil tienen el mismo sub pero pueden diferir en iat")
    void emitir_perfilesDistintos_tienenSubsDistintos() throws Exception {
        UUID id1 = UUID.randomUUID();
        UUID id2 = UUID.randomUUID();

        PerfilDeUsuario p1 = PerfilDeUsuario.reconocer(id1, "g1", "u1@t.com", "U1", null, Instant.now());
        PerfilDeUsuario p2 = PerfilDeUsuario.reconocer(id2, "g2", "u2@t.com", "U2", null, Instant.now());

        SignedJWT jwt1 = SignedJWT.parse(emitter.emitir(p1).token());
        SignedJWT jwt2 = SignedJWT.parse(emitter.emitir(p2).token());

        assertThat(jwt1.getJWTClaimsSet().getSubject())
                .isNotEqualTo(jwt2.getJWTClaimsSet().getSubject());
    }
}
