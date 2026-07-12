package com.stayhub.presentation.api.integration

import org.junit.jupiter.api.Test

/**
 * Integration coverage for the SpringDoc OpenAPI documentation (issue #84 / T083).
 *
 * Verifies, over real HTTP through the full WebFlux + security chain, that:
 *  - the OpenAPI JSON (`/v3/api-docs`) is reachable WITHOUT authentication,
 *  - all three contract groups (search, property, booking) are documented,
 *  - a Bearer-JWT security scheme is declared so the Swagger UI "Authorize"
 *    button can send a token to the protected booking endpoints,
 *  - the Swagger UI page (`/swagger-ui.html`) is reachable without auth.
 */
class OpenApiDocsIntegrationTest : AbstractApiIntegrationTest() {

    @Test
    fun `OpenAPI JSON is public and documents the three contract groups`() {
        http.get()
            .uri("/v3/api-docs")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            // search contract
            .jsonPath("$.paths['/api/v1/properties/search']").exists()
            // property contract
            .jsonPath("$.paths['/api/v1/properties/{propertyId}']").exists()
            // booking contract
            .jsonPath("$.paths['/api/v1/bookings']").exists()
    }

    @Test
    fun `OpenAPI declares a Bearer JWT security scheme`() {
        http.get()
            .uri("/v3/api-docs")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.components.securitySchemes.bearerAuth.type").isEqualTo("http")
            .jsonPath("$.components.securitySchemes.bearerAuth.scheme").isEqualTo("bearer")
            .jsonPath("$.components.securitySchemes.bearerAuth.bearerFormat").isEqualTo("JWT")
    }

    @Test
    fun `Swagger UI is reachable without authentication`() {
        http.get()
            .uri("/swagger-ui.html")
            .exchange()
            // springdoc redirects /swagger-ui.html to the UI bundle; the key point
            // is that security permits it (not 401/403).
            .expectStatus().value { status ->
                check(status in listOf(200, 301, 302, 307, 308)) {
                    "Expected Swagger UI to be reachable without auth, got HTTP $status"
                }
            }
    }
}
