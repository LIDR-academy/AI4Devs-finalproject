package com.stayhub.infrastructure.config

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
 */
@Configuration
class CorsConfig {
    @Bean
    fun corsConfigurationSource(): CorsConfigurationSource {
        val corsConfig = CorsConfiguration().apply {
            allowedOrigins = listOf("http://localhost:3000", "http://localhost:3001")
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
