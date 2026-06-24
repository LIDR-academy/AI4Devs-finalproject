package com.stayhub.infrastructure.config

import com.fasterxml.jackson.databind.DeserializationFeature
import com.fasterxml.jackson.databind.ObjectMapper
import org.assertj.core.api.Assertions.assertThat
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.TestPropertySource
import java.time.LocalDate

/**
 * Guards the application-wide [ObjectMapper] configuration (issue #132).
 *
 * The booking flow broke because a bare `ObjectMapper()` bean (no modules)
 * replaced Spring Boot's auto-configured mapper, so the WebFlux JSON codecs
 * could not (de)serialize `java.time.LocalDate` (e.g. `CreateBookingRequest.check_in`).
 *
 * This is a full-context `@SpringBootTest` (not a Jackson slice) on purpose:
 * the overriding bean only takes effect in the full application context, so a
 * slice test would not reproduce the defect. We assert on the *primary*
 * `ObjectMapper` — the exact instance the WebFlux codecs use.
 */
@SpringBootTest
@ActiveProfiles("test")
@Import(TestContainersConfiguration::class)
@TestPropertySource(
    properties = [
        "spring.flyway.enabled=true",
        "stayhub.jwt.secret=test-secret-key-for-integration-tests-minimum-32-chars",
        "stayhub.jwt.issuer=stayhub",
    ]
)
class JacksonObjectMapperConfigTest {

    @Autowired
    lateinit var objectMapper: ObjectMapper

    @Test
    fun `deserializes an ISO-8601 LocalDate`() {
        val parsed = objectMapper.readValue("\"2026-06-23\"", LocalDate::class.java)
        assertThat(parsed).isEqualTo(LocalDate.of(2026, 6, 23))
    }

    @Test
    fun `serializes a LocalDate as an ISO-8601 string (not a numeric array)`() {
        val json = objectMapper.writeValueAsString(LocalDate.of(2026, 6, 23))
        assertThat(json).isEqualTo("\"2026-06-23\"")
    }

    @Test
    fun `deserializes the booking request payload containing LocalDate fields`() {
        // Mirrors the body the frontend posts to /api/v1/bookings.
        val body =
            """{"property_id":"cccccccc-cccc-cccc-cccc-000000001001",""" +
                """"check_in":"2026-06-23","check_out":"2026-06-27","guest_count":2}"""

        val request = objectMapper.readValue(
            body,
            com.stayhub.presentation.dto.booking.CreateBookingRequest::class.java,
        )

        assertThat(request.check_in).isEqualTo(LocalDate.of(2026, 6, 23))
        assertThat(request.check_out).isEqualTo(LocalDate.of(2026, 6, 27))
        assertThat(request.guest_count).isEqualTo(2)
    }

    @Test
    fun `preserves the security hardening features`() {
        // The original securedObjectMapper intent must survive the fix.
        assertThat(objectMapper.deserializationConfig.isEnabled(DeserializationFeature.FAIL_ON_UNKNOWN_PROPERTIES))
            .isFalse()
        assertThat(objectMapper.deserializationConfig.isEnabled(DeserializationFeature.FAIL_ON_TRAILING_TOKENS))
            .isTrue()
    }
}
