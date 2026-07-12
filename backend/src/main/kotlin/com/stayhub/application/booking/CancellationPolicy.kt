package com.stayhub.application.booking

import com.stayhub.domain.booking.Booking
import com.stayhub.domain.booking.BookingStatus
import java.math.BigDecimal
import java.math.RoundingMode
import java.time.Duration
import java.time.Instant
import java.time.ZoneOffset

/**
 * Platform cancellation policy (spec FR-012), framework-free so both
 * GetBookingDetailsUseCase and CancelBookingUseCase can reuse it:
 *  - only CONFIRMED bookings are cancellable (PENDING is a transient
 *    pre-payment state, not a confirmed trip; CANCELLED/COMPLETED are terminal);
 *  - full refund if cancelled at least 48 hours before check-in (measured
 *    against check-in at 00:00 UTC; the exact 48h mark is inclusive),
 *    otherwise no refund.
 */
object CancellationPolicy {

    val FREE_CANCELLATION_WINDOW: Duration = Duration.ofHours(48)

    fun canCancel(booking: Booking): Boolean =
        booking.status == BookingStatus.CONFIRMED

    fun isWithinFreeWindow(booking: Booking, now: Instant): Boolean {
        val checkInInstant = booking.checkIn.atStartOfDay(ZoneOffset.UTC).toInstant()
        return !now.isAfter(checkInInstant.minus(FREE_CANCELLATION_WINDOW))
    }

    /** Refund the guest would receive if the booking were cancelled at [now]. */
    fun refundAmountEur(booking: Booking, now: Instant): BigDecimal =
        if (isWithinFreeWindow(booking, now)) {
            booking.totalEur.setScale(2, RoundingMode.HALF_UP)
        } else {
            BigDecimal.ZERO.setScale(2)
        }
}
