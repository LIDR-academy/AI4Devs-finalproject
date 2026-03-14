package com.hexagonal.shared.security;

import jakarta.servlet.Filter;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.ServletRequest;
import jakarta.servlet.ServletResponse;
import jakarta.servlet.http.HttpServletRequest;
import org.springframework.boot.web.servlet.FilterRegistrationBean;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;

import java.io.IOException;
import java.util.List;
import java.util.UUID;

/**
 * Test-only security bypass for BDD and E2E integration tests.
 *
 * Active when profile "test" is set.
 * Injects a fixed test user UUID into the SecurityContext for every request
 * that carries the X-Test-User-Id header (or a fallback UUID if not present).
 *
 * This allows BDD steps (RestAssured without JWT) to pass authentication.
 */
@Configuration
@Profile("test")
public class TestSecurityBypassConfig {

    /** Fixed test userId also used to reuse across BDD steps without token. */
    public static final String TEST_USER_HEADER = "X-Test-User-Id";
    public static final UUID DEFAULT_TEST_USER_ID =
            UUID.fromString("550e8400-e29b-41d4-a716-446655440000");

    @Bean
    public FilterRegistrationBean<Filter> testSecurityBypassFilter() {
        FilterRegistrationBean<Filter> registration = new FilterRegistrationBean<>(new Filter() {
            @Override
            public void doFilter(ServletRequest req, ServletResponse res, FilterChain chain)
                    throws IOException, ServletException {
                HttpServletRequest httpReq = (HttpServletRequest) req;
                String userIdHeader = httpReq.getHeader(TEST_USER_HEADER);
                UUID userId;
                try {
                    userId = userIdHeader != null ? UUID.fromString(userIdHeader) : DEFAULT_TEST_USER_ID;
                } catch (IllegalArgumentException e) {
                    userId = DEFAULT_TEST_USER_ID;
                }
                var auth = new UsernamePasswordAuthenticationToken(userId.toString(), null, List.of());
                SecurityContextHolder.getContext().setAuthentication(auth);
                try {
                    chain.doFilter(req, res);
                } finally {
                    SecurityContextHolder.clearContext();
                }
            }
        });
        // Must run BEFORE SessionJwtAuthenticationFilter (which is at UsernamePasswordAuthenticationFilter)
        registration.setOrder(-100);
        return registration;
    }
}
