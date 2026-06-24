package com.stayhub.domain.booking

import com.stayhub.domain.common.DomainPageRequest
import com.stayhub.domain.common.PagedResult
import io.kotest.matchers.collections.shouldHaveSize
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import kotlinx.coroutines.test.runTest
import org.junit.jupiter.api.BeforeEach
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

/**
 * Contract test for BookingRepository port.
 *
 * Verified via a simple in-memory fake implementation.  The goal is to ensure:
 *  1. The interface compiles and is implementable (no forbidden imports / annotations).
 *  2. Each method behaves according to its documented contract.
 */
class BookingRepositoryTest {

    // ─── Fake in-memory implementation ──────────────────────────────────────

    private class FakeBookingRepository : BookingRepository {
        val store = mutableMapOf<UUID, Booking>()

        override suspend fun save(booking: Booking): Booking {
            store[booking.id] = booking
            return booking
        }

        override suspend fun findById(id: UUID): Booking? = store[id]

        override suspend fun findByGuestId(guestId: UUID, pageable: DomainPageRequest): PagedResult<Booking> {
            val filtered = store.values.filter { it.guestId == guestId }
            return PagedResult(filtered, pageable.page, pageable.size, filtered.size.toLong())
        }

        override suspend fun findByGuestIdAndCategory(
            guestId: UUID,
            category: TripCategory,
            today: LocalDate,
            pageable: DomainPageRequest,
        ): PagedResult<Booking> {
            val filtered = store.values.filter { b ->
                b.guestId == guestId && when (category) {
                    TripCategory.ALL -> true
                    TripCategory.UPCOMING -> b.status != BookingStatus.CANCELLED && b.checkOut >= today
                    TripCategory.PAST -> b.status != BookingStatus.CANCELLED && b.checkOut < today
                    TripCategory.CANCELLED -> b.status == BookingStatus.CANCELLED
                }
            }
            return PagedResult(filtered, pageable.page, pageable.size, filtered.size.toLong())
        }

        override suspend fun findByPropertyAndDates(
            propertyId: UUID,
            checkIn: LocalDate,
            checkOut: LocalDate,
        ): List<Booking> =
            store.values.filter {
                it.propertyId == propertyId &&
                    it.checkIn < checkOut &&
                    it.checkOut > checkIn
            }
    }

    // ─── Fixtures ───────────────────────────────────────────────────────────

    private lateinit var repo: FakeBookingRepository

    @BeforeEach
    fun setUp() {
        repo = FakeBookingRepository()
    }

    private fun booking(
        id: UUID = UUID.randomUUID(),
        propertyId: UUID = UUID.randomUUID(),
        guestId: UUID = UUID.randomUUID(),
        checkIn: LocalDate = LocalDate.of(2026, 8, 1),
        checkOut: LocalDate = LocalDate.of(2026, 8, 5),
        status: BookingStatus = BookingStatus.PENDING,
    ) = Booking(
        id = id,
        propertyId = propertyId,
        guestId = guestId,
        referenceNumber = "REF-${id.toString().take(8)}",
        checkIn = checkIn,
        checkOut = checkOut,
        guestCount = 2,
        nights = java.time.temporal.ChronoUnit.DAYS.between(checkIn, checkOut).toInt(),
        nightlyRateEur = BigDecimal("100.00"),
        cleaningFeeEur = BigDecimal("50.00"),
        serviceFeeEur = BigDecimal("18.00"),
        taxEur = BigDecimal("0.00"),
        totalEur = BigDecimal("468.00"),
        status = status,
        stripePaymentIntentId = "pi_test_001",
        cancellationReason = null,
        cancelledAt = null,
        createdAt = Instant.now(),
        updatedAt = Instant.now(),
    )

    // ─── Tests ──────────────────────────────────────────────────────────────

    @Test
    fun `save then findById round-trip returns the same booking`() = runTest {
        val original = booking()

        val saved = repo.save(original)
        val found = repo.findById(original.id)

        found shouldNotBe null
        found shouldBe saved
        found!!.id shouldBe original.id
        found.status shouldBe BookingStatus.PENDING
    }

    @Test
    fun `findById returns null for unknown id`() = runTest {
        val result = repo.findById(UUID.randomUUID())

        result shouldBe null
    }

    @Test
    fun `findByGuestId returns only bookings belonging to the given guest`() = runTest {
        val targetGuestId = UUID.randomUUID()
        val otherGuestId = UUID.randomUUID()
        val propertyId = UUID.randomUUID()

        repo.save(booking(guestId = targetGuestId, propertyId = propertyId))
        repo.save(booking(guestId = targetGuestId, propertyId = propertyId,
            checkIn = LocalDate.of(2026, 9, 1), checkOut = LocalDate.of(2026, 9, 3)))
        repo.save(booking(guestId = otherGuestId, propertyId = propertyId))

        val page = repo.findByGuestId(targetGuestId, DomainPageRequest(0, 10))

        page.content shouldHaveSize 2
        page.content.all { it.guestId == targetGuestId } shouldBe true
    }

    @Test
    fun `findByGuestId returns empty page when guest has no bookings`() = runTest {
        val page = repo.findByGuestId(UUID.randomUUID(), DomainPageRequest(0, 10))

        page.content shouldHaveSize 0
        page.totalElements shouldBe 0L
    }

    @Test
    fun `findByPropertyAndDates returns bookings with overlapping date range`() = runTest {
        val propertyId = UUID.randomUUID()

        // Overlapping: Aug 1–5 overlaps with search Aug 3–8
        repo.save(booking(propertyId = propertyId,
            checkIn = LocalDate.of(2026, 8, 1), checkOut = LocalDate.of(2026, 8, 5)))
        // Overlapping: Aug 6–10 overlaps with search Aug 3–8
        repo.save(booking(propertyId = propertyId,
            checkIn = LocalDate.of(2026, 8, 6), checkOut = LocalDate.of(2026, 8, 10)))
        // Non-overlapping: Aug 9–12 does NOT overlap with search Aug 3–8
        repo.save(booking(propertyId = propertyId,
            checkIn = LocalDate.of(2026, 8, 9), checkOut = LocalDate.of(2026, 8, 12)))
        // Different property — should be excluded
        repo.save(booking(propertyId = UUID.randomUUID(),
            checkIn = LocalDate.of(2026, 8, 3), checkOut = LocalDate.of(2026, 8, 7)))

        val results = repo.findByPropertyAndDates(
            propertyId,
            checkIn = LocalDate.of(2026, 8, 3),
            checkOut = LocalDate.of(2026, 8, 8),
        )

        // Aug 1–5: checkIn(1) < searchOut(8) && checkOut(5) > searchIn(3) → overlaps ✓
        // Aug 6–10: checkIn(6) < searchOut(8) && checkOut(10) > searchIn(3) → overlaps ✓
        // Aug 9–12: checkIn(9) < searchOut(8) = false → no overlap ✗
        results shouldHaveSize 2
        results.all { it.propertyId == propertyId } shouldBe true
    }

    @Test
    fun `findByPropertyAndDates returns empty list when no overlapping bookings`() = runTest {
        val propertyId = UUID.randomUUID()

        // Booking ends exactly on search start — adjacent, not overlapping (exclusive end)
        repo.save(booking(propertyId = propertyId,
            checkIn = LocalDate.of(2026, 8, 1), checkOut = LocalDate.of(2026, 8, 5)))

        val results = repo.findByPropertyAndDates(
            propertyId,
            checkIn = LocalDate.of(2026, 8, 5),
            checkOut = LocalDate.of(2026, 8, 10),
        )

        results shouldHaveSize 0
    }

    @Test
    fun `save overwrites an existing booking with the same id`() = runTest {
        val original = booking()
        repo.save(original)

        val updated = original.confirm()
        repo.save(updated)

        val found = repo.findById(original.id)
        found!!.status shouldBe BookingStatus.CONFIRMED
    }
}
