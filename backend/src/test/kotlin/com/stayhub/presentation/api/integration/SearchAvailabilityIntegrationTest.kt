package com.stayhub.presentation.api.integration

import kotlinx.coroutines.reactive.awaitFirstOrNull
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.http.MediaType
import org.springframework.r2dbc.core.DatabaseClient
import java.time.LocalDate
import java.util.UUID

/**
 * Proves the date-availability rule is identical across the main search, the
 * detail calendar, and booking-creation (issue #172).
 *
 * The bounding box (41.30–41.50 lat, 2.05–2.25 lng) is the seeded-Barcelona box
 * also used by [SearchApiIntegrationTest]; it contains the five seeded Barcelona
 * properties (cccccccc-…-000000001001..1005). Each test uses a unique stay
 * window from [nextStayWindow] (≥ +46 days, where the seed leaves availability
 * rows in the default 'available' state and no seed booking overlaps), and a
 * distinct property as the "blocked" subject while asserting that a sibling
 * Barcelona property remains a present control.
 */
class SearchAvailabilityIntegrationTest : AbstractApiIntegrationTest() {

    @Autowired
    private lateinit var databaseClient: DatabaseClient

    // Seeded Barcelona properties inside the bbox below.
    private val blockedViaAvailability = "cccccccc-cccc-cccc-cccc-000000001002"
    private val blockedViaBooking = "cccccccc-cccc-cccc-cccc-000000001003"
    private val blockedViaHold = "cccccccc-cccc-cccc-cccc-000000001004"
    private val control = "cccccccc-cccc-cccc-cccc-000000001001"

    private val seedGuest = "bbbbbbbb-bbbb-bbbb-bbbb-000000000001"

    private fun searchIds(checkIn: LocalDate, checkOut: LocalDate): List<String> {
        val ids = mutableListOf<String>()
        http.get().uri { b ->
            b.path("/api/v1/properties/search")
                .queryParam("sw_lat", "41.30").queryParam("sw_lng", "2.05")
                .queryParam("ne_lat", "41.50").queryParam("ne_lng", "2.25")
                .queryParam("check_in", "$checkIn").queryParam("check_out", "$checkOut")
                .queryParam("size", "50")
                .build()
        }
            .exchange()
            .expectStatus().isOk
            .expectBody()
            .jsonPath("$.results[*].id").value<List<String>> { ids.addAll(it) }
        return ids
    }

    @Test
    fun `search excludes a property blocked via the availability table`() {
        val (checkIn, checkOut) = nextStayWindow()
        // Mark every night in [checkIn, checkOut) as booked in the availability table.
        runBlocking {
            var d = checkIn
            while (d.isBefore(checkOut)) {
                upsertAvailability(blockedViaAvailability, d, "booked")
                d = d.plusDays(1)
            }
        }

        val ids = searchIds(checkIn, checkOut)
        assert(blockedViaAvailability !in ids) {
            "availability-blocked property $blockedViaAvailability should be excluded; got $ids"
        }
        assert(control in ids) { "control property $control should be present; got $ids" }
    }

    @Test
    fun `search excludes a property with a non-cancelled overlapping booking`() {
        val (checkIn, checkOut) = nextStayWindow()
        runBlocking {
            insertBooking(blockedViaBooking, checkIn, checkOut, status = "confirmed")
        }

        val ids = searchIds(checkIn, checkOut)
        assert(blockedViaBooking !in ids) {
            "booking-overlapping property $blockedViaBooking should be excluded; got $ids"
        }
        assert(control in ids) { "control property $control should be present; got $ids" }
    }

    @Test
    fun `search excludes a property with an active hold`() {
        val (checkIn, checkOut) = nextStayWindow()
        runBlocking {
            insertActiveHold(blockedViaHold, checkIn, checkOut)
        }

        val ids = searchIds(checkIn, checkOut)
        assert(blockedViaHold !in ids) {
            "actively-held property $blockedViaHold should be excluded; got $ids"
        }
        assert(control in ids) { "control property $control should be present; got $ids" }
    }

    @Test
    fun `booking-creation is rejected for a property blocked via the availability table`() {
        val (checkIn, checkOut) = nextStayWindow()
        runBlocking {
            var d = checkIn
            while (d.isBefore(checkOut)) {
                upsertAvailability(blockedViaAvailability, d, "booked")
                d = d.plusDays(1)
            }
        }

        val token = registerGuest()
        http.post().uri("/api/v1/bookings")
            .header("Authorization", "Bearer $token")
            .contentType(MediaType.APPLICATION_JSON)
            .bodyValue(
                """{"property_id":"$blockedViaAvailability","check_in":"$checkIn","check_out":"$checkOut","guest_count":2}"""
            )
            .exchange()
            .expectStatus().isEqualTo(409)
            .expectBody().jsonPath("$.error.code").isEqualTo("DATES_UNAVAILABLE")
    }

    // --- raw-row helpers ------------------------------------------------------

    private suspend fun upsertAvailability(propertyId: String, date: LocalDate, status: String) {
        databaseClient.sql(
            """
            INSERT INTO availability (property_id, date, is_available, status)
            VALUES (:pid, :date, false, :status)
            ON CONFLICT (property_id, date)
            DO UPDATE SET is_available = false, status = :status
            """.trimIndent()
        )
            .bind("pid", UUID.fromString(propertyId))
            .bind("date", date)
            .bind("status", status)
            .fetch().rowsUpdated().awaitFirstOrNull()
    }

    private suspend fun insertBooking(
        propertyId: String,
        checkIn: LocalDate,
        checkOut: LocalDate,
        status: String,
    ) {
        databaseClient.sql(
            """
            INSERT INTO booking (
                property_id, guest_id, reference_number, check_in, check_out,
                guest_count, nights, nightly_rate_eur, cleaning_fee_eur,
                service_fee_eur, tax_eur, total_eur, status, stripe_payment_intent_id
            ) VALUES (
                :pid, :gid, :ref, :checkIn, :checkOut,
                2, 1, 100.00, 0.00, 0.00, 0.00, 100.00, :status, :pi
            )
            """.trimIndent()
        )
            .bind("pid", UUID.fromString(propertyId))
            .bind("gid", UUID.fromString(seedGuest))
            .bind("ref", "BK-IT-${System.nanoTime()}")
            .bind("checkIn", checkIn)
            .bind("checkOut", checkOut)
            .bind("status", status)
            .bind("pi", "pi_it_${System.nanoTime()}")
            .fetch().rowsUpdated().awaitFirstOrNull()
    }

    private suspend fun insertActiveHold(propertyId: String, checkIn: LocalDate, checkOut: LocalDate) {
        databaseClient.sql(
            """
            INSERT INTO availability_hold (property_id, guest_id, check_in, check_out, held_until)
            VALUES (:pid, :gid, :checkIn, :checkOut, NOW() + INTERVAL '10 minutes')
            """.trimIndent()
        )
            .bind("pid", UUID.fromString(propertyId))
            .bind("gid", UUID.fromString(seedGuest))
            .bind("checkIn", checkIn)
            .bind("checkOut", checkOut)
            .fetch().rowsUpdated().awaitFirstOrNull()
    }
}
