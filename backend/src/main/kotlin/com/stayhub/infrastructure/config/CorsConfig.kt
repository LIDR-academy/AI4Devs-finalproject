package com.stayhub.infrastructure.config

import org.springframework.beans.factory.annotation.Value
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Configuration
import org.springframework.web.cors.CorsConfiguration
import org.springframework.web.cors.reactive.CorsConfigurationSource
import org.springframework.web.cors.reactive.UrlBasedCorsConfigurationSource

/**
 * CORS configuration for the reactive API.
 *
 * Exposes a [CorsConfigurationSource] bean (rather than a standalone
 * [org.springframework.web.cors.reactive.CorsWebFilter]) so that Spring
 * Security's `http.cors { }` picks it up and handles CORS — including the
 * preflight `OPTIONS` request — *inside* the security filter chain. A
 * standalone filter runs after `WebFilterChainProxy`, so the preflight would
 * otherwise be rejected with 401 by the authorization rules before any CORS
 * headers are written (issue #130).
 *
 * Allowed origins are driven by `stayhub.cors.allowed-origins` (env var
 * `CORS_ALLOWED_ORIGINS`), comma-separated. Defaults to localhost:3000 for
 * local development.
 */
@Configuration
class CorsConfig(
    @Value("\${stayhub.cors.allowed-origins:http://localhost:3000}")
    private val allowedOriginsRaw: String,
) {
    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val origins = allowedOriginsRaw.split(",").map { it.trim() }.filter { it.isNotEmpty() }
        val corsConfig = CorsConfiguration().apply {
            allowedOrigins = origins
            allowedMethods = listOf("GET", "POST", "PUT", "DELETE", "OPTIONS", "PATCH")
            allowedHeaders = listOf("*")
            allowCredentials = true
            maxAge = 3600
        }

        return UrlBasedCorsConfigurationSource().apply {
            registerCorsConfiguration("/**", corsConfig)
        }
    }
}
