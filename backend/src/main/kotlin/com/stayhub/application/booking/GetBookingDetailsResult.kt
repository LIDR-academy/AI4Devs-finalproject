package com.stayhub.application.booking

import com.stayhub.domain.booking.Booking
import com.stayhub.domain.property.Property
import java.math.BigDecimal

/**
 * Booking + its property + the on-the-fly cancellation outcome. [refundAmountEur]
 * is the amount the guest would get if cancelling now, or null when the booking
 * is not cancellable.
 */
data class BookingDetailResult(
    val booking: Booking,
    val property: Property?,
    val canCancel: Boolean,
    val refundAmountEur: BigDecimal?,
)
