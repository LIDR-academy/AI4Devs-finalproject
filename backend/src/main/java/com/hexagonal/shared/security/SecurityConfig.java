package com.hexagonal.shared.security;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.http.HttpStatus;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.HttpStatusEntryPoint;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

/**
 * Spring Security configuration for the application.
 *
 * <p>Phase 5 / T006 — establishes the security baseline:</p>
 * <ul>
 *   <li>Stateless (no HTTP session).</li>
 *   <li>CSRF disabled (REST API with Bearer tokens).</li>
 *   <li>{@link SessionJwtAuthenticationFilter} registered to populate SecurityContext
 *       from the application's own JWT on every request.</li>
 *   <li>Public endpoint: {@code POST /api/identity/auth/google} (C1/C2 — no auth needed to log in).</li>
 *   <li>All other requests: {@code permitAll()} for now — T007/T008 will apply
 *       method-level security once all controllers are migrated to SecurityContext-based userId.</li>
 * </ul>
 *
 * <p>Use {@link org.springframework.security.core.context.SecurityContextHolder} in controllers
 * and use cases to extract the authenticated {@code userId (UUID)} after migration.</p>
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http,
            SessionJwtAuthenticationFilter sessionJwtAuthenticationFilter) throws Exception {
        http
            .cors(Customizer.withDefaults())
            .csrf(AbstractHttpConfigurer::disable)
            .sessionManagement(sm -> sm.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            // Return 401 (not 403) when an unauthenticated request reaches a protected endpoint (C3)
            .exceptionHandling(exceptions -> exceptions
                .authenticationEntryPoint(new HttpStatusEntryPoint(HttpStatus.UNAUTHORIZED))
            )
            .authorizeHttpRequests(auth -> auth
                // C1/C2: login endpoint is public — no token required
                .requestMatchers(HttpMethod.POST, "/v1/identity/auth/google").permitAll()
                // C4: logout requires a valid session token
                .requestMatchers(HttpMethod.POST, "/v1/identity/auth/logout").authenticated()
                // Existing BCs: require authentication now that controllers read userId from SecurityContext (T008)
                .requestMatchers("/v1/playback/**").authenticated()
                .requestMatchers("/v1/generation/**").authenticated()
                .requestMatchers("/v1/compositions/**").authenticated()
                // All other paths (Actuator, etc.) remain open
                .anyRequest().permitAll()
            )
            .addFilterBefore(sessionJwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }
}
