package com.hexagonal.shared.security;

import com.nimbusds.jose.JWSAlgorithm;
import com.nimbusds.jose.JWSHeader;
import com.nimbusds.jose.crypto.MACSigner;
import com.nimbusds.jwt.JWTClaimsSet;
import com.nimbusds.jwt.SignedJWT;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockFilterChain;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;

import javax.crypto.SecretKey;
import javax.crypto.spec.SecretKeySpec;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.UUID;

import static org.assertj.core.api.Assertions.*;

/**
 * Unit tests for {@link SessionJwtAuthenticationFilter} (TDD — Phase 5 / T006).
 *
 * <p>Covers the three cases mandated by T006 BDD criteria:</p>
 * <ul>
 *   <li>Token válido → SecurityContext populated with userId</li>
 *   <li>Token inválido → SecurityContext remains null (anonymous)</li>
 *   <li>Sin token → SecurityContext remains null (anonymous)</li>
 * </ul>
 */
@DisplayName("SessionJwtAuthenticationFilter")
class SessionJwtAuthenticationFilterTest {

    private static final String RAW_SECRET = "test-identity-jwt-secret-for-ci-tests-only!!";
    private static final SecretKey SIGNING_KEY = new SecretKeySpec(
            RAW_SECRET.getBytes(StandardCharsets.UTF_8), "HmacSHA256");

    private SessionJwtAuthenticationFilter filter;

    @BeforeEach
    void setUp() {
        NimbusJwtDecoder decoder = NimbusJwtDecoder.withSecretKey(SIGNING_KEY).build();
        filter = new SessionJwtAuthenticationFilter(decoder);
        SecurityContextHolder.clearContext();
    }

    // ─── Helper: build a valid HS256 JWT ─────────────────────────────────────

    private String buildToken(UUID userId) throws Exception {
        JWTClaimsSet claims = new JWTClaimsSet.Builder()
                .subject(userId.toString())
                .issueTime(new Date())
                .expirationTime(new Date(System.currentTimeMillis() + 3_600_000L))
                .build();
        SignedJWT jwt = new SignedJWT(new JWSHeader(JWSAlgorithm.HS256), claims);
        jwt.sign(new MACSigner(SIGNING_KEY));
        return jwt.serialize();
    }

    // ─── Tests ───────────────────────────────────────────────────────────────

    @Test
    @DisplayName("token válido → SecurityContext contiene el userId como principal")
    void tokenValido_populaSecurityContextConUserId() throws Exception {
        UUID userId = UUID.randomUUID();
        String token = buildToken(userId);

        MockHttpServletRequest  request  = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain         chain    = new MockFilterChain();
        request.addHeader("Authorization", "Bearer " + token);

        filter.doFilterInternal(request, response, chain);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNotNull();
        assertThat(auth.isAuthenticated()).isTrue();
        assertThat(auth.getPrincipal()).isEqualTo(userId);
    }

    @Test
    @DisplayName("token inválido → SecurityContext permanece nulo (anónimo)")
    void tokenInvalido_noPopulaSecurityContext() throws Exception {
        MockHttpServletRequest  request  = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain         chain    = new MockFilterChain();
        request.addHeader("Authorization", "Bearer token-corrupto.invalid.jwt");

        filter.doFilterInternal(request, response, chain);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNull();
    }

    @Test
    @DisplayName("sin cabecera Authorization → SecurityContext permanece nulo (anónimo)")
    void sinCabeceraAuth_noPopulaSecurityContext() throws Exception {
        MockHttpServletRequest  request  = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain         chain    = new MockFilterChain();
        // No Authorization header

        filter.doFilterInternal(request, response, chain);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNull();
    }

    @Test
    @DisplayName("cadena de filtros continúa siempre (con o sin token)")
    void filterChain_siempreContinua() throws Exception {
        MockHttpServletRequest  request  = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain         chain    = new MockFilterChain();

        filter.doFilterInternal(request, response, chain);

        // If chain was invoked, the next filter request would be set
        assertThat(chain.getRequest()).isNotNull();
    }

    @Test
    @DisplayName("cabecera sin prefijo Bearer → no popula SecurityContext")
    void cabeceraBasicAuth_noPopulaSecurityContext() throws Exception {
        MockHttpServletRequest  request  = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        MockFilterChain         chain    = new MockFilterChain();
        request.addHeader("Authorization", "Basic dXNlcjpwYXNz");

        filter.doFilterInternal(request, response, chain);

        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        assertThat(auth).isNull();
    }
}
