package com.stayhub.infrastructure.persistence

import com.stayhub.domain.booking.Booking
import com.stayhub.domain.booking.BookingStatus
import com.stayhub.domain.booking.TripCategory
import com.stayhub.domain.common.DomainPageRequest
import com.stayhub.infrastructure.config.TestContainersConfiguration
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import org.springframework.beans.factory.annotation.Autowired
import org.springframework.boot.test.context.SpringBootTest
import org.springframework.context.annotation.Import
import org.springframework.r2dbc.core.DatabaseClient
import org.springframework.test.context.ActiveProfiles
import org.springframework.test.context.TestPropertySource
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

/**
 * Integration test for BookingRepositoryAdapter.
 *
 * Uses the shared TestContainersConfiguration singleton (real PostgreSQL with
 * Flyway migrations). Each test cleans the booking table for the test guest /
 * property scope so tests are isolated.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.NONE)
@ActiveProfiles("test")
@Import(TestContainersConfiguration::class)
@TestPropertySource(properties = ["spring.flyway.enabled=true"])
class BookingRepositoryAdapterTest {

    @Autowired
    lateinit var databaseClient: DatabaseClient

    @Autowired
    lateinit var adapter: BookingRepositoryAdapter

    // Use seeded property + guest to satisfy FK constraints.
    private val propertyId = UUID.fromString("cccccccc-cccc-cccc-cccc-000000001001")
    private val guestId = UUID.fromString("bbbbbbbb-bbbb-bbbb-bbbb-000000000001")

    private var refSeq = 0
    private fun nextRef(): String {
        refSeq += 1
        return "BK-IT-${UUID.randomUUID().toString().take(8)}-$refSeq"
    }

    @BeforeEach
    fun cleanTestRows() {
        // Delete every booking owned by the test guest — covers cross-test
        // leakage when an individual test inserts under a randomly generated
        // propertyId (e.g. the "different property" cases below).
        databaseClient.sql("DELETE FROM booking WHERE guest_id = :guestId")
            .bind("guestId", guestId)
            .then().block()
    }

    private fun makeBooking(
        id: UUID = UUID.randomUUID(),
        checkIn: LocalDate = LocalDate.of(2030, 6, 1),
        checkOut: LocalDate = LocalDate.of(2030, 6, 5),
        status: BookingStatus = BookingStatus.PENDING,
    ): Booking {
        val nights = checkOut.toEpochDay() - checkIn.toEpochDay()
        val now = Instant.now()
        return Booking(
            id = id,
            propertyId = propertyId,
            guestId = guestId,
            referenceNumber = nextRef(),
            checkIn = checkIn,
            checkOut = checkOut,
            guestCount = 2,
            nights = nights.toInt(),
            nightlyRateEur = BigDecimal("100.00"),
            cleaningFeeEur = BigDecimal("50.00"),
            serviceFeeEur = BigDecimal("36.00"),
            taxEur = BigDecimal("0.00"),
            totalEur = BigDecimal("486.00"),
            status = status,
            stripePaymentIntentId = "pi_test_${id.toString().take(8)}",
            cancellationReason = null,
            cancelledAt = null,
            createdAt = now,
            updatedAt = now,
        )
    }

    @Test
    fun `save then findById round-trips the booking`() = runTest {
        val booking = makeBooking()

        adapter.save(booking)
        val found = adapter.findById(booking.id)

        found shouldBe booking.copy(
            // Timestamps round-trip via TIMESTAMP at microsecond precision; compare via
            // simpler invariants below instead of full equality.
            createdAt = found!!.createdAt,
            updatedAt = found.updatedAt,
        )
        found.id shouldBe booking.id
        found.status shouldBe BookingStatus.PENDING
        found.totalEur.compareTo(BigDecimal("486.00")) shouldBe 0
    }

    @Test
    fun `findById returns null for unknown id`() = runTest {
        val result = adapter.findById(UUID.randomUUID())
        result shouldBe null
    }

    @Test
    fun `save with same id updates the existing row (status transition PENDING to CONFIRMED)`() = runTest {
        val booking = makeBooking()
        adapter.save(booking)

        adapter.save(booking.confirm())

        val found = adapter.findById(booking.id)
        found!!.status shouldBe BookingStatus.CONFIRMED
    }

    @Test
    fun `findByPropertyAndDates returns overlapping non-cancelled bookings only`() = runTest {
        // Overlapping: Jun 1–5 overlaps with search Jun 3–8
        adapter.save(makeBooking(checkIn = LocalDate.of(2030, 6, 1), checkOut = LocalDate.of(2030, 6, 5)))
        // Overlapping: Jun 6–10 overlaps with search Jun 3–8
        adapter.save(makeBooking(checkIn = LocalDate.of(2030, 6, 6), checkOut = LocalDate.of(2030, 6, 10)))
        // Non-overlapping: Jun 9–12 doesn't overlap Jun 3–8
        adapter.save(makeBooking(checkIn = LocalDate.of(2030, 6, 9), checkOut = LocalDate.of(2030, 6, 12)))
        // Cancelled overlap should be excluded
        adapter.save(
            makeBooking(checkIn = LocalDate.of(2030, 6, 4), checkOut = LocalDate.of(2030, 6, 6), status = BookingStatus.CANCELLED)
        )

        val results = adapter.findByPropertyAndDates(
            propertyId,
            checkIn = LocalDate.of(2030, 6, 3),
            checkOut = LocalDate.of(2030, 6, 8),
        )

        results shouldHaveSize 2
        results.all { it.status != BookingStatus.CANCELLED } shouldBe true
    }

    @Test
    fun `findByPropertyAndDates returns empty when adjacent only (exclusive end)`() = runTest {
        adapter.save(makeBooking(checkIn = LocalDate.of(2030, 6, 1), checkOut = LocalDate.of(2030, 6, 5)))

        val results = adapter.findByPropertyAndDates(
            propertyId,
            checkIn = LocalDate.of(2030, 6, 5),
            checkOut = LocalDate.of(2030, 6, 10),
        )

        results shouldHaveSize 0
    }

    @Test
    fun `findByGuestId returns bookings ordered by check_in descending`() = runTest {
        val first = makeBooking(checkIn = LocalDate.of(2030, 6, 1), checkOut = LocalDate.of(2030, 6, 3))
        val second = makeBooking(checkIn = LocalDate.of(2030, 7, 1), checkOut = LocalDate.of(2030, 7, 5))
        val third = makeBooking(checkIn = LocalDate.of(2030, 8, 1), checkOut = LocalDate.of(2030, 8, 3))
        adapter.save(first)
        adapter.save(second)
        adapter.save(third)

        val page = adapter.findByGuestId(guestId, DomainPageRequest(0, 10))

        page.totalElements shouldBe 3L
        page.content shouldHaveSize 3
        page.content.first().checkIn shouldBe LocalDate.of(2030, 8, 1)
        page.content.last().checkIn shouldBe LocalDate.of(2030, 6, 1)
    }

    @Test
    fun `findByGuestIdAndCategory UPCOMING excludes cancelled and past, by check_out`() = runTest {
        val today = LocalDate.of(2030, 6, 15)
        // Upcoming: check_out today or later, not cancelled
        adapter.save(makeBooking(checkIn = LocalDate.of(2030, 6, 14), checkOut = LocalDate.of(2030, 6, 20), status = BookingStatus.CONFIRMED))
        // Past: check_out before today
        adapter.save(makeBooking(checkIn = LocalDate.of(2030, 6, 1), checkOut = LocalDate.of(2030, 6, 5), status = BookingStatus.CONFIRMED))
        // Cancelled (future) must be excluded from UPCOMING
        adapter.save(makeBooking(checkIn = LocalDate.of(2030, 6, 25), checkOut = LocalDate.of(2030, 6, 28), status = BookingStatus.CANCELLED))

        val page = adapter.findByGuestIdAndCategory(guestId, TripCategory.UPCOMING, today, DomainPageRequest(0, 10))

        page.totalElements shouldBe 1L
        page.content.single().checkOut shouldBe LocalDate.of(2030, 6, 20)
    }

    @Test
    fun `findByGuestIdAndCategory PAST returns only non-cancelled with check_out before today`() = runTest {
        val today = LocalDate.of(2030, 6, 15)
        adapter.save(makeBooking(checkIn = LocalDate.of(2030, 6, 1), checkOut = LocalDate.of(2030, 6, 5), status = BookingStatus.COMPLETED))
        adapter.save(makeBooking(checkIn = LocalDate.of(2030, 6, 20), checkOut = LocalDate.of(2030, 6, 23), status = BookingStatus.CONFIRMED))

        val page = adapter.findByGuestIdAndCategory(guestId, TripCategory.PAST, today, DomainPageRequest(0, 10))

        page.totalElements shouldBe 1L
        page.content.single().checkOut shouldBe LocalDate.of(2030, 6, 5)
    }

    @Test
    fun `findByGuestIdAndCategory CANCELLED returns only cancelled bookings`() = runTest {
        val today = LocalDate.of(2030, 6, 15)
        adapter.save(makeBooking(checkIn = LocalDate.of(2030, 6, 20), checkOut = LocalDate.of(2030, 6, 23), status = BookingStatus.CANCELLED))
        adapter.save(makeBooking(checkIn = LocalDate.of(2030, 6, 21), checkOut = LocalDate.of(2030, 6, 24), status = BookingStatus.CONFIRMED))

        val page = adapter.findByGuestIdAndCategory(guestId, TripCategory.CANCELLED, today, DomainPageRequest(0, 10))

        page.totalElements shouldBe 1L
        page.content.single().status shouldBe BookingStatus.CANCELLED
    }

    @Test
    fun `findByGuestIdAndCategory ALL returns every booking for the guest`() = runTest {
        val today = LocalDate.of(2030, 6, 15)
        adapter.save(makeBooking(checkIn = LocalDate.of(2030, 6, 1), checkOut = LocalDate.of(2030, 6, 5), status = BookingStatus.COMPLETED))
        adapter.save(makeBooking(checkIn = LocalDate.of(2030, 6, 20), checkOut = LocalDate.of(2030, 6, 23), status = BookingStatus.CANCELLED))
        adapter.save(makeBooking(checkIn = LocalDate.of(2030, 6, 25), checkOut = LocalDate.of(2030, 6, 28), status = BookingStatus.CONFIRMED))

        val page = adapter.findByGuestIdAndCategory(guestId, TripCategory.ALL, today, DomainPageRequest(0, 10))

        page.totalElements shouldBe 3L
    }
}
