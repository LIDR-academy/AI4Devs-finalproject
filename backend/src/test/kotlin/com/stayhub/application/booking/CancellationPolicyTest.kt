package com.stayhub.application.booking

import com.stayhub.domain.booking.Booking
import com.stayhub.domain.booking.BookingStatus
import io.kotest.matchers.shouldBe
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneOffset

class CancellationPolicyTest {

    private val checkIn = LocalDate.of(2030, 6, 10)
    private val checkInInstant = checkIn.atStartOfDay(ZoneOffset.UTC).toInstant()

    private fun booking(status: BookingStatus) = Booking(
        id = java.util.UUID.randomUUID(),
        propertyId = java.util.UUID.randomUUID(),
        guestId = java.util.UUID.randomUUID(),
        referenceNumber = "BK-20300101-ABC123",
        checkIn = checkIn,
        checkOut = checkIn.plusDays(3),
        guestCount = 2,
        nights = 3,
        nightlyRateEur = BigDecimal("100.00"),
        cleaningFeeEur = BigDecimal("50.00"),
        serviceFeeEur = BigDecimal("36.00"),
        taxEur = BigDecimal("0.00"),
        totalEur = BigDecimal("386.00"),
        status = status,
        stripePaymentIntentId = "pi_stub_abc",
        cancellationReason = null,
        cancelledAt = null,
        createdAt = Instant.now(),
        updatedAt = Instant.now(),
    )

    @Test
    fun `only CONFIRMED bookings are cancellable`() {
        CancellationPolicy.canCancel(booking(BookingStatus.CONFIRMED)) shouldBe true
        CancellationPolicy.canCancel(booking(BookingStatus.PENDING)) shouldBe false
        CancellationPolicy.canCancel(booking(BookingStatus.CANCELLED)) shouldBe false
        CancellationPolicy.canCancel(booking(BookingStatus.COMPLETED)) shouldBe false
    }

    @Test
    fun `full refund when more than 48h before check-in`() {
        val now = checkInInstant.minusSeconds(49 * 3600)
        CancellationPolicy.refundAmountEur(booking(BookingStatus.CONFIRMED), now)
            .compareTo(BigDecimal("386.00")) shouldBe 0
    }

    @Test
    fun `exactly 48h before check-in still gives a full refund`() {
        val now = checkInInstant.minusSeconds(48 * 3600)
        CancellationPolicy.refundAmountEur(booking(BookingStatus.CONFIRMED), now)
            .compareTo(BigDecimal("386.00")) shouldBe 0
    }

    @Test
    fun `no refund when within 48h of check-in`() {
        val now = checkInInstant.minusSeconds(47 * 3600)
        CancellationPolicy.refundAmountEur(booking(BookingStatus.CONFIRMED), now)
            .compareTo(BigDecimal.ZERO) shouldBe 0
    }
}
