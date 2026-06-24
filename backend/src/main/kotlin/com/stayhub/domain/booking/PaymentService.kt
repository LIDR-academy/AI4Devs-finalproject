package com.stayhub.domain.booking

import java.math.BigDecimal
import java.util.UUID

interface PaymentService {
    suspend fun createPaymentIntent(amountEur: BigDecimal, bookingId: UUID): PaymentIntent
    suspend fun getPaymentStatus(paymentIntentId: String): PaymentStatus
    suspend fun refund(paymentIntentId: String, amountEur: BigDecimal): RefundResult
}
