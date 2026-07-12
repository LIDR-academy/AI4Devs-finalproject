package com.stayhub.infrastructure.config

import io.jsonwebtoken.Jwts
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.autoconfigure.web.reactive.WebFluxTest
import org.springframework.boot.test.context.TestConfiguration
import org.springframework.context.annotation.Bean
import org.springframework.context.annotation.Import
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.reactive.server.WebTestClient
import org.springframework.web.bind.annotation.GetMapping
import org.springframework.web.bind.annotation.RestController
import java.util.Date
import javax.crypto.SecretKey

/**
 * Verifies the reactive Spring Security wiring (T016 / issue #17):
 *  - protected booking endpoints require a valid JWT (401 without one)
 *  - public search/property/geocode endpoints are reachable without a token
 *  - a valid bearer token grants access to protected endpoints
 */
@WebFluxTest(controllers = [SecurityConfigTest.TestController::class])
@Import(SecurityConfig::class, JwtAuthFilter::class, CorsConfig::class)
@TestPropertySource(
    properties = [
        "stayhub.jwt.secret=test-secret-test-secret-test-secret-test-secret-0123456789",
        "stayhub.jwt.issuer=stayhub",
    ],
)
class SecurityConfigTest(
    @Autowired private val client: WebTestClient,
    @Autowired private val jwtProperties: JwtProperties,
) {
    @TestConfiguration
    class TestControllers {
        @Bean
        fun testController() = TestController()
    }

    @RestController
    class TestController {
        @GetMapping("/api/v1/bookings/my-trips")
        fun protectedEndpoint(): String = "trips"

        @GetMapping("/api/v1/properties/search")
        fun publicSearch(): String = "search"

        @GetMapping("/api/v1/properties/geocode")
        fun publicGeocode(): String = "geocode"

        @GetMapping("/api/v1/properties/abc")
        fun publicDetail(): String = "detail"
    }

    private fun validToken(): String {
        val key: SecretKey = io.jsonwebtoken.security.Keys.hmacShaKeyFor(jwtProperties.secret.toByteArray())
        return Jwts.builder()
            .subject("guest-123")
            .issuer(jwtProperties.issuer)
            .issuedAt(Date())
            .expiration(Date(System.currentTimeMillis() + 3_600_000))
            .signWith(key)
            .compact()
    }

    @Test
    fun `protected booking endpoint returns 401 without token`() {
        client.get().uri("/api/v1/bookings/my-trips")
            .exchange()
            .expectStatus().isUnauthorized
    }

    @Test
    fun `public search endpoint is reachable without token`() {
        client.get().uri("/api/v1/properties/search")
            .exchange()
            .expectStatus().isOk
    }

    @Test
    fun `public geocode endpoint is reachable without token`() {
        client.get().uri("/api/v1/properties/geocode")
            .exchange()
            .expectStatus().isOk
    }

    @Test
    fun `public property detail endpoint is reachable without token`() {
        client.get().uri("/api/v1/properties/abc")
            .exchange()
            .expectStatus().isOk
    }

    @Test
    fun `valid token grants access to protected endpoint`() {
        client.get().uri("/api/v1/bookings/my-trips")
            .header("Authorization", "Bearer ${validToken()}")
            .exchange()
            .expectStatus().isOk
            .expectBody(String::class.java).isEqualTo("trips")
    }

    @Test
    fun `invalid token is rejected with 401`() {
        client.get().uri("/api/v1/bookings/my-trips")
            .header("Authorization", "Bearer not-a-real-jwt")
            .exchange()
            .expectStatus().isUnauthorized
    }
}
