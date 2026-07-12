package com.stayhub.domain.booking

import java.math.BigDecimal

/**
 * Outcome of a payment refund operation as reported by the payment provider
 * (stubbed for v1). The policy-level decision of how much to refund is made by
 * the application layer; this type just carries what was actually refunded.
 */
data class RefundResult(
    val refundId: String,
    val amountEur: BigDecimal,
)
