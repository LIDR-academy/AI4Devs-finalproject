package com.stayhub.presentation.api.integration

import org.junit.jupiter.api.Test
import org.springframework.http.MediaType
import java.time.LocalDate
import java.util.UUID

/**
 * Per-endpoint integration tests for the US4 trip endpoints, exercised over the
 * real stack (codecs, JWT security, DB). Each test targets one endpoint + one
 * behavior; creating/confirming a booking inside a test is setup.
 */
class TripsApiIntegrationTest : AbstractApiIntegrationTest() {

    // Seeded property (V7): "Cosy Eixample Apartment", Barcelona.
    private val propertyId = "cccccccc-cccc-cccc-cccc-000000001001"

    private fun bookingBody(checkIn: LocalDate, checkOut: LocalDate, guests: Int = 2) =
        """{"property_id":"$propertyId","check_in":"$checkIn","check_out":"$checkOut","guest_count":$guests}"""

    /** Creates and confirms a booking; returns its id. */
    private fun createAndConfirm(token: String, checkIn: LocalDate, checkOut: LocalDate): String {
        val body = http.post().uri("/api/v1/bookings")
            .header("Authorization", "Bearer $token")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(bookingBody(checkIn, checkOut))
            .exchange()
            .expectStatus().isCreated
            .expectBody(Map::class.java).returnResult().responseBody!!
        val bookingId = body["booking_id"] as? String
            ?: error("create response missing 'booking_id'; body=$body")
        val paymentIntentId = (body["stripe_client_secret"] as String).removePrefix("pi_stub_secret_")

        http.post().uri("/api/v1/bookings/$bookingId/confirm")
            .header("Authorization", "Bearer $token")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue("""{"payment_intent_id":"$paymentIntentId"}""")
            .exchange()
            .expectStatus().isOk
        return bookingId
    }

    // --- GET /api/v1/bookings/my-trips ----------------------------------------

    @Test
    fun `my-trips returns the caller's confirmed booking`() {
        val token = registerGuest()
        val (checkIn, checkOut) = nextStayWindow()
        val bookingId = createAndConfirm(token, checkIn, checkOut)

        http.get().uri("/api/v1/bookings/my-trips?status=upcoming&page=1&size=10")
            .header("Authorization", "Bearer $token")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.pagination.total_results").isEqualTo(1)
            .jsonPath("$.pagination.page").isEqualTo(1)
            .jsonPath("$.bookings[0].id").isEqualTo(bookingId)
            .jsonPath("$.bookings[0].status").isEqualTo("confirmed")
    }

    @Test
    fun `my-trips returns 401 without a token`() {
        http.get().uri("/api/v1/bookings/my-trips")
            .exchange()
            .expectStatus().isUnauthorized
    }

    // --- GET /api/v1/bookings/{id} --------------------------------------------

    @Test
    fun `detail returns 200 for the owner with cancel info`() {
        val token = registerGuest()
        val (checkIn, checkOut) = nextStayWindow()
        val bookingId = createAndConfirm(token, checkIn, checkOut)

        http.get().uri("/api/v1/bookings/$bookingId")
            .header("Authorization", "Bearer $token")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.id").isEqualTo(bookingId)
            .jsonPath("$.status").isEqualTo("confirmed")
            .jsonPath("$.can_cancel").isEqualTo(true)
            .jsonPath("$.refund_amount_eur").exists()
    }

    @Test
    fun `detail returns 403 for another guest`() {
        val (checkIn, checkOut) = nextStayWindow()
        val bookingId = createAndConfirm(registerGuest(), checkIn, checkOut)

        http.get().uri("/api/v1/bookings/$bookingId")
            .header("Authorization", "Bearer ${registerGuest()}")
            .exchange()
            .expectStatus().isForbidden
            .expectBody().jsonPath("$.error.code").isEqualTo("FORBIDDEN")
    }

    @Test
    fun `detail returns 404 for an unknown booking`() {
        http.get().uri("/api/v1/bookings/${UUID.randomUUID()}")
            .header("Authorization", "Bearer ${registerGuest()}")
            .exchange()
            .expectStatus().isNotFound
            .expectBody().jsonPath("$.error.code").isEqualTo("NOT_FOUND")
    }

    // --- POST /api/v1/bookings/{id}/cancel ------------------------------------

    @Test
    fun `cancel returns 200 with a full refund for a far-future booking`() {
        val token = registerGuest()
        val (checkIn, checkOut) = nextStayWindow() // +46 days -> well beyond 48h
        val bookingId = createAndConfirm(token, checkIn, checkOut)

        http.post().uri("/api/v1/bookings/$bookingId/cancel")
            .header("Authorization", "Bearer $token")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue("""{"reason":"plans changed"}""")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.booking_id").isEqualTo(bookingId)
            .jsonPath("$.status").isEqualTo("cancelled")
            .jsonPath("$.refund_status").isEqualTo("full_refund")
    }

    @Test
    fun `cancel returns 200 with no refund within 48h of check-in`() {
        val token = registerGuest()
        // Check-in tomorrow -> within the 48h window -> no refund. Near dates don't
        // collide with seed bookings (+10..45) or the +46-day windows.
        val checkIn = LocalDate.now().plusDays(1)
        val bookingId = createAndConfirm(token, checkIn, checkIn.plusDays(1))

        http.post().uri("/api/v1/bookings/$bookingId/cancel")
            .header("Authorization", "Bearer $token")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.refund_status").isEqualTo("no_refund")
            .jsonPath("$.refund_amount_eur").isEqualTo(0.0)
    }

    @Test
    fun `cancel returns 422 when the booking is already cancelled`() {
        val token = registerGuest()
        val (checkIn, checkOut) = nextStayWindow()
        val bookingId = createAndConfirm(token, checkIn, checkOut)

        // First cancel succeeds.
        http.post().uri("/api/v1/bookings/$bookingId/cancel")
            .header("Authorization", "Bearer $token")
            .exchange()
            .expectStatus().isOk
        // Second cancel is rejected.
        http.post().uri("/api/v1/bookings/$bookingId/cancel")
            .header("Authorization", "Bearer $token")
            .exchange()
            .expectStatus().isEqualTo(422)
            .expectBody().jsonPath("$.error.code").isEqualTo("BOOKING_CANNOT_CANCEL")
    }

    @Test
    fun `cancel returns 403 for another guest`() {
        val (checkIn, checkOut) = nextStayWindow()
        val bookingId = createAndConfirm(registerGuest(), checkIn, checkOut)

        http.post().uri("/api/v1/bookings/$bookingId/cancel")
            .header("Authorization", "Bearer ${registerGuest()}")
            .exchange()
            .expectStatus().isForbidden
            .expectBody().jsonPath("$.error.code").isEqualTo("FORBIDDEN")
    }

    @Test
    fun `cancel returns 404 for an unknown booking`() {
        http.post().uri("/api/v1/bookings/${UUID.randomUUID()}/cancel")
            .header("Authorization", "Bearer ${registerGuest()}")
            .exchange()
            .expectStatus().isNotFound
            .expectBody().jsonPath("$.error.code").isEqualTo("NOT_FOUND")
    }
}
