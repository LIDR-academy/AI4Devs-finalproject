package com.stayhub.presentation.api.integration

import com.stayhub.infrastructure.config.TestContainersConfiguration
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.context.annotation.Import
import org.springframework.http.HttpHeaders
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.reactive.server.WebTestClient

/**
 * Full-stack CORS preflight integration test (issue #130).
 *
 * A CORS preflight is a transport-level concern: the browser sends an
 * `OPTIONS` request carrying `Origin` + `Access-Control-Request-Method`
 * before any cross-origin GET that uses a non-safelisted `Content-Type`
 * (application/json) or an `Authorization` header. If Spring Security rejects
 * that preflight (401/403) the real request never fires and the frontend sees
 * empty results.
 *
 * These tests bind a [WebTestClient] to the real running server
 * (`bindToServer` + the random [LocalServerPort]) so requests cross a real
 * HTTP socket. This is the only faithful way to assert preflight behaviour: a
 * context-bound (mock) client does not reproduce real CORS origin handling and
 * spuriously rejects the preflight with 403.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@ActiveProfiles("test")
@Import(TestContainersConfiguration::class)
@TestPropertySource(
    properties = [
        "spring.flyway.enabled=true",
        "stayhub.jwt.secret=test-secret-key-for-integration-tests-minimum-32-chars",
        "stayhub.jwt.issuer=stayhub",
    ]
)
class CorsPreflightIntegrationTest {

    @LocalServerPort
    private var port: Int = 0

    private lateinit var webClient: WebTestClient

    private val allowedOrigin = "http://localhost:3000"

    @BeforeEach
    fun setUp() {
        webClient = WebTestClient.bindToServer()
            .baseUrl("http://localhost:$port")
            .build()
    }

    @Test
    fun `preflight on public search endpoint is allowed with the matching allow-origin header`() {
        webClient.options().uri("/api/v1/properties/search")
            .header(HttpHeaders.ORIGIN, allowedOrigin)
            .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET")
            .exchange()
            .expectStatus().is2xxSuccessful
            .expectHeader().valueEquals(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, allowedOrigin)
    }

    @Test
    fun `preflight requesting an Authorization header is allowed`() {
        // axios attaches Authorization once the user is logged in, which forces
        // the browser to preflight even a GET.
        webClient.options().uri("/api/v1/properties/search")
            .header(HttpHeaders.ORIGIN, allowedOrigin)
            .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET")
            .header(HttpHeaders.ACCESS_CONTROL_REQUEST_HEADERS, "authorization,content-type")
            .exchange()
            .expectStatus().is2xxSuccessful
            .expectHeader().valueEquals(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, allowedOrigin)
    }

    @Test
    fun `preflight on protected booking endpoint succeeds without a token`() {
        // Preflights never carry credentials; they must succeed so the browser
        // can then send the real, authenticated request.
        webClient.options().uri("/api/v1/bookings/my-trips")
            .header(HttpHeaders.ORIGIN, allowedOrigin)
            .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET")
            .exchange()
            .expectStatus().is2xxSuccessful
            .expectHeader().valueEquals(HttpHeaders.ACCESS_CONTROL_ALLOW_ORIGIN, allowedOrigin)
    }

    @Test
    fun `preflight from a disallowed origin is rejected`() {
        webClient.options().uri("/api/v1/properties/search")
            .header(HttpHeaders.ORIGIN, "http://evil.example.com")
            .header(HttpHeaders.ACCESS_CONTROL_REQUEST_METHOD, "GET")
            .exchange()
            .expectStatus().isForbidden
    }
}
