package com.stayhub.presentation.api.integration

import org.junit.jupiter.api.Test
import org.springframework.http.MediaType
import java.time.LocalDate
import java.util.UUID

/**
 * Per-endpoint integration tests for the booking endpoints, exercised over the
 * real stack (codecs — #132; JWT security — #130; DB). Each test targets one
 * endpoint + one behavior; creating a booking inside a confirm test is setup.
 */
class BookingApiIntegrationTest : AbstractApiIntegrationTest() {

    // Seeded property (V7): "Cosy Eixample Apartment", Barcelona.
    private val propertyId = "cccccccc-cccc-cccc-cccc-000000001001"

    private fun bookingBody(checkIn: LocalDate, checkOut: LocalDate, guests: Int = 2, property: String = propertyId) =
        """{"property_id":"$property","check_in":"$checkIn","check_out":"$checkOut","guest_count":$guests}"""

    // --- POST /api/v1/bookings ------------------------------------------------

    @Test
    fun `create returns 201 with booking details and ISO-date pricing`() {
        val token = registerGuest()
        val (checkIn, checkOut) = nextStayWindow()

        http.post().uri("/api/v1/bookings")
            .header("Authorization", "Bearer $token")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(bookingBody(checkIn, checkOut))
            .exchange()
            .expectStatus().isCreated
            .expectBody()
            .jsonPath("$.booking_id").exists()
            .jsonPath("$.reference_number").exists()
            .jsonPath("$.stripe_client_secret").exists()
            .jsonPath("$.hold_expires_at").exists()
            .jsonPath("$.price_breakdown.nights").isEqualTo(3)
    }

    @Test
    fun `create returns 401 without a token`() {
        val checkIn = LocalDate.now().plusDays(60)
        val checkOut = checkIn.plusDays(3)
        http.post().uri("/api/v1/bookings")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(bookingBody(checkIn, checkOut))
            .exchange()
            .expectStatus().isUnauthorized
    }

    @Test
    fun `create returns 400 when property_id is missing`() {
        val token = registerGuest()
        http.post().uri("/api/v1/bookings")
            .header("Authorization", "Bearer $token")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue("""{"check_in":"2030-06-01","check_out":"2030-06-05","guest_count":2}""")
            .exchange()
            .expectStatus().isBadRequest
    }

    @Test
    fun `create returns 404 when the property does not exist`() {
        val token = registerGuest()
        val (checkIn, checkOut) = nextStayWindow()
        http.post().uri("/api/v1/bookings")
            .header("Authorization", "Bearer $token")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(bookingBody(checkIn, checkOut, property = UUID.randomUUID().toString()))
            .exchange()
            .expectStatus().isNotFound
            .expectBody().jsonPath("$.error.code").isEqualTo("NOT_FOUND")
    }

    @Test
    fun `create returns 409 when the dates are already held`() {
        val (checkIn, checkOut) = nextStayWindow()
        http.post().uri("/api/v1/bookings")
            .header("Authorization", "Bearer ${registerGuest()}")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(bookingBody(checkIn, checkOut))
            .exchange()
            .expectStatus().isCreated
        http.post().uri("/api/v1/bookings")
            .header("Authorization", "Bearer ${registerGuest()}")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(bookingBody(checkIn, checkOut))
            .exchange()
            .expectStatus().isEqualTo(409)
            .expectBody().jsonPath("$.error.code").isEqualTo("DATES_UNAVAILABLE")
    }

    // --- POST /api/v1/bookings/{id}/confirm -----------------------------------

    /** Creates a booking and returns (bookingId, paymentIntentId). Setup for confirm tests. */
    private fun createBooking(token: String): Pair<String, String> {
        val (checkIn, checkOut) = nextStayWindow()
        val body = http.post().uri("/api/v1/bookings")
            .header("Authorization", "Bearer $token")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(bookingBody(checkIn, checkOut))
            .exchange()
            .expectStatus().isCreated
            .expectBody(Map::class.java).returnResult().responseBody!!
        val bookingId = body["booking_id"] as? String
            ?: error("create response missing 'booking_id'; body=$body")
        val clientSecret = body["stripe_client_secret"] as? String
            ?: error("create response missing 'stripe_client_secret'; body=$body")
        val paymentIntentId = clientSecret.removePrefix("pi_stub_secret_")
        return bookingId to paymentIntentId
    }

    @Test
    fun `confirm returns 200 and marks the booking confirmed`() {
        val token = registerGuest()
        val (bookingId, paymentIntentId) = createBooking(token)
        http.post().uri("/api/v1/bookings/$bookingId/confirm")
            .header("Authorization", "Bearer $token")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue("""{"payment_intent_id":"$paymentIntentId"}""")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.id").isEqualTo(bookingId)
            .jsonPath("$.status").isEqualTo("confirmed")
    }

    @Test
    fun `confirm returns 403 when the booking belongs to another guest`() {
        val (bookingId, paymentIntentId) = createBooking(registerGuest())
        http.post().uri("/api/v1/bookings/$bookingId/confirm")
            .header("Authorization", "Bearer ${registerGuest()}")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue("""{"payment_intent_id":"$paymentIntentId"}""")
            .exchange()
            .expectStatus().isForbidden
            .expectBody().jsonPath("$.error.code").isEqualTo("FORBIDDEN")
    }

    @Test
    fun `confirm returns 400 when the payment did not succeed`() {
        val token = registerGuest()
        val (bookingId, _) = createBooking(token)
        http.post().uri("/api/v1/bookings/$bookingId/confirm")
            .header("Authorization", "Bearer $token")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue("""{"payment_intent_id":"pi_stub_unknown_not_succeeded"}""")
            .exchange()
            .expectStatus().isBadRequest
            .expectBody().jsonPath("$.error.code").isEqualTo("PAYMENT_FAILED")
    }
}
