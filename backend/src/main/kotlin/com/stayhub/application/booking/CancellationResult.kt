package com.stayhub.application.booking

import java.math.BigDecimal
import java.util.UUID

/** Outcome of cancelling a booking. [fullRefund] → "full_refund" else "no_refund". */
data class CancellationResult(
    val bookingId: UUID,
    val refundAmountEur: BigDecimal,
    val fullRefund: Boolean,
)
