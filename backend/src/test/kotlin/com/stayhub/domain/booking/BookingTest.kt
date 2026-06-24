package com.stayhub.domain.booking

import io.kotest.assertions.throwables.shouldThrow
import io.kotest.matchers.comparables.shouldBeGreaterThan
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDate
import java.util.UUID

class BookingTest {

    private fun validBooking(
        status: BookingStatus = BookingStatus.PENDING,
        checkIn: LocalDate = LocalDate.of(2026, 7, 1),
        checkOut: LocalDate = LocalDate.of(2026, 7, 5),
        guestCount: Int = 2,
    ) = Booking(
        id = UUID.randomUUID(),
        propertyId = UUID.randomUUID(),
        guestId = UUID.randomUUID(),
        referenceNumber = "REF-ABC-001",
        checkIn = checkIn,
        checkOut = checkOut,
        guestCount = guestCount,
        nights = 4,
        nightlyRateEur = BigDecimal("100.00"),
        cleaningFeeEur = BigDecimal("50.00"),
        serviceFeeEur = BigDecimal("18.00"),
        taxEur = BigDecimal("0.00"),
        totalEur = BigDecimal("468.00"),
        status = status,
        stripePaymentIntentId = "pi_test_stub_001",
        cancellationReason = null,
        cancelledAt = null,
        createdAt = Instant.now(),
        updatedAt = Instant.now(),
    )

    // ─── Construction ───────────────────────────────────────────────────────

    @Test
    fun `valid booking constructs successfully`() {
        val booking = validBooking()

        booking.guestCount shouldBe 2
        booking.status shouldBe BookingStatus.PENDING
        booking.nights shouldBe 4
    }

    @Test
    fun `init throws when checkOut is same as checkIn`() {
        val date = LocalDate.of(2026, 7, 1)
        shouldThrow<IllegalArgumentException> {
            validBooking(checkIn = date, checkOut = date)
        }
    }

    @Test
    fun `init throws when checkOut is before checkIn`() {
        shouldThrow<IllegalArgumentException> {
            validBooking(
                checkIn = LocalDate.of(2026, 7, 5),
                checkOut = LocalDate.of(2026, 7, 1),
            )
        }
    }

    @Test
    fun `init throws when guestCount is zero`() {
        shouldThrow<IllegalArgumentException> {
            validBooking(guestCount = 0)
        }
    }

    @Test
    fun `init throws when guestCount is negative`() {
        shouldThrow<IllegalArgumentException> {
            validBooking(guestCount = -1)
        }
    }

    @Test
    fun `init throws when nights does not match date range`() {
        shouldThrow<IllegalArgumentException> {
            validBooking().copy(nights = 99)
        }
    }

    // ─── confirm() ──────────────────────────────────────────────────────────

    @Test
    fun `confirm transitions PENDING to CONFIRMED`() {
        val original = validBooking(status = BookingStatus.PENDING)
        Thread.sleep(2) // ensure at least 1 ms elapses so updatedAt differs
        val confirmed = original.confirm()

        confirmed.status shouldBe BookingStatus.CONFIRMED
        confirmed.updatedAt shouldBeGreaterThan original.updatedAt
    }

    @Test
    fun `confirm returns a new Booking instance (immutability)`() {
        val pending = validBooking(status = BookingStatus.PENDING)
        val confirmed = pending.confirm()

        confirmed shouldNotBe pending
        pending.status shouldBe BookingStatus.PENDING
    }

    @Test
    fun `confirm throws IllegalStateException when status is CONFIRMED`() {
        shouldThrow<IllegalStateException> {
            validBooking(status = BookingStatus.CONFIRMED).confirm()
        }
    }

    @Test
    fun `confirm throws IllegalStateException when status is CANCELLED`() {
        shouldThrow<IllegalStateException> {
            validBooking(status = BookingStatus.CANCELLED).confirm()
        }
    }

    @Test
    fun `confirm throws IllegalStateException when status is COMPLETED`() {
        shouldThrow<IllegalStateException> {
            validBooking(status = BookingStatus.COMPLETED).confirm()
        }
    }

    // ─── cancel() ───────────────────────────────────────────────────────────

    @Test
    fun `cancel transitions PENDING to CANCELLED with reason`() {
        val cancelled = validBooking(status = BookingStatus.PENDING).cancel("Guest changed plans")

        cancelled.status shouldBe BookingStatus.CANCELLED
        cancelled.cancellationReason shouldBe "Guest changed plans"
        cancelled.cancelledAt shouldNotBe null
    }

    @Test
    fun `cancel transitions CONFIRMED to CANCELLED`() {
        val cancelled = validBooking(status = BookingStatus.CONFIRMED).cancel()

        cancelled.status shouldBe BookingStatus.CANCELLED
    }

    @Test
    fun `cancel with null reason leaves cancellationReason null`() {
        val cancelled = validBooking(status = BookingStatus.PENDING).cancel(null)

        cancelled.status shouldBe BookingStatus.CANCELLED
        cancelled.cancellationReason shouldBe null
    }

    @Test
    fun `cancel returns a new Booking instance (immutability)`() {
        val pending = validBooking(status = BookingStatus.PENDING)
        val cancelled = pending.cancel()

        cancelled shouldNotBe pending
        pending.status shouldBe BookingStatus.PENDING
    }

    @Test
    fun `cancel throws IllegalStateException when already CANCELLED`() {
        shouldThrow<IllegalStateException> {
            validBooking(status = BookingStatus.CANCELLED).cancel()
        }
    }

    @Test
    fun `cancel throws IllegalStateException when COMPLETED`() {
        shouldThrow<IllegalStateException> {
            validBooking(status = BookingStatus.COMPLETED).cancel()
        }
    }
}
