package com.stayhub.presentation.api.integration

import org.junit.jupiter.api.Test
import org.springframework.http.MediaType
import java.time.LocalDate
import java.util.UUID

/** Per-endpoint integration tests for PropertyController, over the real stack. */
class PropertyApiIntegrationTest : AbstractApiIntegrationTest() {

    private val propertyId = "cccccccc-cccc-cccc-cccc-000000001001"
    private val unknownId = UUID.randomUUID().toString()

    @Test
    fun `details returns 200 for a seeded property`() {
        http.get().uri("/api/v1/properties/$propertyId")
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.id").isEqualTo(propertyId)
            .jsonPath("$.host.first_name").exists()
            .jsonPath("$.location.city").isEqualTo("Barcelona")
    }

    @Test
    fun `details returns 404 for an unknown property`() {
        http.get().uri("/api/v1/properties/$unknownId")
            .exchange()
            .expectStatus().isNotFound
            .expectBody().jsonPath("$.error.code").isEqualTo("NOT_FOUND")
    }

    @Test
    fun `availability returns 200 for a seeded property`() {
        val from = LocalDate.now()
        val to = from.plusDays(30)
        http.get().uri { b ->
            b.path("/api/v1/properties/$propertyId/availability")
                .queryParam("from", "$from").queryParam("to", "$to").build()
        }
            .exchange()
            .expectStatus().isOk
            .expectBody().jsonPath("$.property_id").isEqualTo(propertyId)
    }

    @Test
    fun `availability returns 404 for an unknown property`() {
        val from = LocalDate.now()
        val to = from.plusDays(30)
        http.get().uri { b ->
            b.path("/api/v1/properties/$unknownId/availability")
                .queryParam("from", "$from").queryParam("to", "$to").build()
        }
            .exchange()
            .expectStatus().isNotFound
            .expectBody().jsonPath("$.error.code").isEqualTo("NOT_FOUND")
    }

    @Test
    fun `reviews returns 200 for a seeded property`() {
        http.get().uri("/api/v1/properties/$propertyId/reviews")
            .exchange()
            .expectStatus().isOk
            .expectBody().jsonPath("$.pagination").exists()
    }

    @Test
    fun `price returns 200 with computed nights for a seeded property`() {
        val checkIn = LocalDate.now().plusDays(8)
        val checkOut = checkIn.plusDays(3)
        http.get().uri { b ->
            b.path("/api/v1/properties/$propertyId/price")
                .queryParam("check_in", "$checkIn").queryParam("check_out", "$checkOut")
                .queryParam("guests", "2").build()
        }
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.nights").isEqualTo(3)
            .jsonPath("$.total_eur").exists()
    }

    @Test
    fun `price returns 404 for an unknown property`() {
        http.get().uri { b ->
            b.path("/api/v1/properties/$unknownId/price")
                .queryParam("check_in", "2030-06-01").queryParam("check_out", "2030-06-04").build()
        }
            .exchange()
            .expectStatus().isNotFound
    }

    @Test
    fun `availability reflects a confirmed booking's nights (#156)`() {
        val token = registerGuest()
        val (checkIn, checkOut) = nextStayWindow()

        // Create a booking, then confirm it.
        val created = http.post().uri("/api/v1/bookings")
            .header("Authorization", "Bearer $token")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(
                """{"property_id":"$propertyId","check_in":"$checkIn","check_out":"$checkOut","guest_count":2}""",
            )
            .exchange()
            .expectStatus().isCreated
            .expectBody(Map::class.java).returnResult().responseBody!!
        val bookingId = created["booking_id"] as String
        val paymentIntentId = (created["stripe_client_secret"] as String).removePrefix("pi_stub_secret_")

        http.post().uri("/api/v1/bookings/$bookingId/confirm")
            .header("Authorization", "Bearer $token")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue("""{"payment_intent_id":"$paymentIntentId"}""")
            .exchange()
            .expectStatus().isOk

        // The availability endpoint must now report the booking's first night as
        // unavailable (was the bug: the calendar ignored bookings). #156
        http.get().uri { b ->
            b.path("/api/v1/properties/$propertyId/availability")
                .queryParam("from", "$checkIn").queryParam("to", "$checkOut").build()
        }
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.unavailable_dates[?(@.date=='$checkIn')]").exists()
    }
}
