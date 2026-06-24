package com.stayhub.presentation.api.integration

import com.stayhub.infrastructure.config.TestContainersConfiguration
import org.junit.jupiter.api.BeforeEach
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.boot.test.web.server.LocalServerPort
import org.springframework.context.annotation.Import
import org.springframework.http.MediaType
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.TestPropertySource
import org.springframework.test.web.reactive.server.WebTestClient
import java.time.Duration
import java.time.LocalDate

/**
 * Base for per-endpoint API integration tests — each test verifies one endpoint
 * against the full Spring context over real HTTP (`bindToServer` +
 * [LocalServerPort]), so requests cross a real socket through the real WebFlux
 * filter chain, Jackson codecs, and security. This is the layer that catches
 * the wiring/codec/CORS bugs mocked slice tests miss (issues #130, #132).
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
abstract class AbstractApiIntegrationTest {

    @LocalServerPort
    private var port: Int = 0

    protected lateinit var http: WebTestClient

    @BeforeEach
    fun initWebTestClient() {
        http = WebTestClient.bindToServer()
            .baseUrl("http://localhost:$port")
            .responseTimeout(Duration.ofSeconds(30))
            .build()
    }

    /** Registers a brand-new guest (unique email) and returns the issued JWT. */
    protected fun registerGuest(
        email: String = "it-${System.nanoTime()}@example.com",
        password: String = "pass1234",
    ): String =
        http.post()
            .uri("/api/v1/auth/register")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(
                """{"email":"$email","password":"$password","first_name":"Itest","last_name":"User"}"""
            )
            .exchange()
            .expectStatus().isCreated
            .expectBody(Map::class.java)
            .returnResult()
            .responseBody?.get("token") as? String
            ?: error("register did not return a token")

    /**
     * Hands out a unique, non-overlapping, in-window stay date range so that
     * booking-creating tests across all integration classes don't collide on the
     * shared Testcontainers DB. Windows start at +46 days (clear of the seed
     * bookings at ≤ +45) and step by 4; capped to stay within the +89-day seeded
     * availability window.
     */
    protected fun nextStayWindow(nights: Long = 3): Pair<LocalDate, LocalDate> {
        val slot = stayWindowCounter.getAndIncrement()
        require(slot <= 60) {
            "nextStayWindow() exhausted (>61 windows in one JVM run — tests retried in the same process?)"
        }
        // Windows start at +46 days (clear of the seed bookings at <= +45) and step
        // by 4. Booking creation does NOT consult the seeded availability table
        // (only holds + non-cancelled overlapping bookings), so windows may extend
        // beyond the +89-day seeded availability horizon without affecting creation.
        val checkIn = LocalDate.now().plusDays(46 + slot * 4L)
        return checkIn to checkIn.plusDays(nights)
    }

    companion object {
        private val stayWindowCounter = java.util.concurrent.atomic.AtomicInteger(0)
    }
}
