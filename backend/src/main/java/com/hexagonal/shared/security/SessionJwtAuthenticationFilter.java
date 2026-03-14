package com.hexagonal.shared.security;

import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.http.HttpHeaders;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.oauth2.jwt.Jwt;
import org.springframework.security.oauth2.jwt.JwtException;
import org.springframework.security.oauth2.jwt.NimbusJwtDecoder;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * Shared security filter: validates the application's own session JWT and
 * populates the {@link SecurityContextHolder} for downstream use cases.
 *
 * <p>BDD origin: C3 — routes not authenticated → 401.
 * The filter enriches the SecurityContext when a valid Bearer token is present.
 * Endpoints that require authentication check for a non-anonymous principal.</p>
 *
 * <p>Flow:</p>
 * <ol>
 *   <li>Extract {@code Authorization: Bearer <token>} header.</li>
 *   <li>Validate the token with {@link NimbusJwtDecoder} (HS256, our own JWT).</li>
 *   <li>Extract {@code sub} claim as {@code userId} (UUID).</li>
 *   <li>Set {@link UsernamePasswordAuthenticationToken} in the SecurityContext —
 *       {@code principal = userId (UUID)}, no credentials, no roles.</li>
 *   <li>If no token or invalid token: SecurityContext is left as anonymous.</li>
 * </ol>
 *
 * <p>Registered before {@code UsernamePasswordAuthenticationFilter} in {@link SecurityConfig}.</p>
 */
public class SessionJwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger log = LoggerFactory.getLogger(SessionJwtAuthenticationFilter.class);
    private static final String BEARER_PREFIX = "Bearer ";

    private final NimbusJwtDecoder jwtDecoder;

    public SessionJwtAuthenticationFilter(NimbusJwtDecoder jwtDecoder) {
        this.jwtDecoder = jwtDecoder;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request,
                                    HttpServletResponse response,
                                    FilterChain filterChain) throws ServletException, IOException {

        String authHeader = request.getHeader(HttpHeaders.AUTHORIZATION);

        if (authHeader != null && authHeader.startsWith(BEARER_PREFIX)) {
            String token = authHeader.substring(BEARER_PREFIX.length());
            try {
                Jwt jwt = jwtDecoder.decode(token);
                UUID userId = UUID.fromString(jwt.getSubject());

                var authentication = new UsernamePasswordAuthenticationToken(
                        userId, null, List.of());
                SecurityContextHolder.getContext().setAuthentication(authentication);

                log.debug("Sesión JWT válida para userId={}", userId);

            } catch (JwtException | IllegalArgumentException ex) {
                log.debug("Token de sesión inválido: {}", ex.getMessage());
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
