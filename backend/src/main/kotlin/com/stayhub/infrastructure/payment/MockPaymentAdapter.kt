package com.stayhub.infrastructure.payment

import com.stayhub.domain.booking.PaymentIntent
import com.stayhub.domain.booking.PaymentService
import com.stayhub.domain.booking.PaymentStatus
import com.stayhub.domain.booking.RefundResult
import org.springframework.stereotype.Service
import java.math.BigDecimal
import java.util.UUID

@Service
class MockPaymentAdapter : PaymentService {
    // In-memory store: paymentIntentId -> status
    // Defaults to SUCCEEDED so the happy path works end-to-end without manual intervention.
    private val intents = mutableMapOf<String, PaymentStatus>()

    override suspend fun createPaymentIntent(amountEur: BigDecimal, bookingId: UUID): PaymentIntent {
        val id = "pi_stub_${UUID.randomUUID().toString().replace("-", "").take(24)}"
        val secret = "pi_stub_secret_${id}"
        intents[id] = PaymentStatus.SUCCEEDED  // stub: auto-succeed
        return PaymentIntent(id = id, clientSecret = secret)
    }

    override suspend fun getPaymentStatus(paymentIntentId: String): PaymentStatus {
        return intents[paymentIntentId] ?: PaymentStatus.FAILED
    }

    override suspend fun refund(paymentIntentId: String, amountEur: BigDecimal): RefundResult {
        // Stub: always "succeeds". A real Stripe adapter (issue #53) would call
        // the Refunds API here and translate failures into PaymentFailedException.
        val refundId = "re_stub_${UUID.randomUUID().toString().replace("-", "").take(24)}"
        return RefundResult(refundId = refundId, amountEur = amountEur)
    }
}
