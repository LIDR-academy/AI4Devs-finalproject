package com.stayhub.infrastructure.config

import org.springframework.boot.context.properties.EnableConfigurationProperties
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.http.HttpMethod
import org.springframework.security.config.annotation.web.reactive.EnableWebFluxSecurity
import org.springframework.security.config.web.server.SecurityWebFiltersOrder
import org.springframework.security.config.web.server.ServerHttpSecurity
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder
import org.springframework.security.web.server.SecurityWebFilterChain
import org.springframework.web.cors.reactive.CorsConfigurationSource

/**
 * Reactive (WebFlux) Spring Security configuration — T016 / issue #17.
 *
 * - Stateless JWT-based API: CSRF, HTTP Basic, form login and session creation
 *   are all disabled.
 * - CORS is enabled within the security chain (via the [CorsConfig]
 *   `CorsConfigurationSource` bean) so that browser preflight `OPTIONS`
 *   requests are handled before authorization runs (issue #130).
 * - [JwtAuthFilter] runs at the AUTHENTICATION stage to populate the reactive
 *   security context from a `Bearer` token before authorization rules apply.
 * - Public (no auth) routes: property search, property detail, geocode and the
 *   actuator health endpoint. All CORS preflight (`OPTIONS`) requests are
 *   permitted — preflights carry no credentials, so they must succeed before
 *   the browser can send the real (possibly authenticated) request.
 * - Protected routes: everything under the bookings path requires a valid
 *   authenticated principal (i.e. a valid JWT).
 */
@Configuration
@EnableWebFluxSecurity
@EnableConfigurationProperties(JwtProperties::class)
class SecurityConfig {

    @Bean
    fun passwordEncoder(): BCryptPasswordEncoder = BCryptPasswordEncoder()

    @Bean
    fun securityWebFilterChain(
        http: ServerHttpSecurity,
        jwtAuthFilter: JwtAuthFilter,
        corsConfigurationSource: CorsConfigurationSource,
    ): SecurityWebFilterChain =
        http
            .cors { it.configurationSource(corsConfigurationSource) }
            .csrf { it.disable() }
            .httpBasic { it.disable() }
            .formLogin { it.disable() }
            .logout { it.disable() }
            .securityContextRepository(org.springframework.security.web.server.context.NoOpServerSecurityContextRepository.getInstance())
            .addFilterAt(jwtAuthFilter, SecurityWebFiltersOrder.AUTHENTICATION)
            .authorizeExchange { exchanges ->
                exchanges
                    // CORS preflight: never carries credentials, must always pass
                    // so the browser can then send the real request.
                    .pathMatchers(HttpMethod.OPTIONS, "/**").permitAll()
                    // OpenAPI / Swagger UI — public so the docs are browsable
                    // without a token (issue #84). Booking operations still
                    // require auth; Swagger's "Authorize" button supplies the JWT.
                    .pathMatchers(
                        "/v3/api-docs",
                        "/v3/api-docs/**",
                        "/swagger-ui.html",
                        "/swagger-ui/**",
                        "/webjars/**",
                    ).permitAll()
                    // Public, unauthenticated endpoints
                    .pathMatchers("/api/v1/auth/**").permitAll()
                    .pathMatchers(HttpMethod.GET, "/api/v1/properties/search").permitAll()
                    .pathMatchers(HttpMethod.GET, "/api/v1/properties/geocode").permitAll()
                    .pathMatchers(HttpMethod.GET, "/api/v1/properties/**").permitAll()
                    .pathMatchers("/actuator/health", "/actuator/health/**").permitAll()
                    // Protected booking endpoints — require a valid JWT
                    .pathMatchers("/api/v1/bookings/**").authenticated()
                    // Default deny for anything else
                    .anyExchange().authenticated()
            }
            .build()
}
