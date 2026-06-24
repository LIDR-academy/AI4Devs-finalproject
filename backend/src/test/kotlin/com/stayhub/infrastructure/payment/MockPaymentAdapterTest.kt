package com.stayhub.infrastructure.payment

import com.stayhub.domain.booking.PaymentStatus
import io.kotest.matchers.shouldBe
import io.kotest.matchers.shouldNotBe
import io.kotest.matchers.string.shouldStartWith
import kotlinx.coroutines.runBlocking
import org.junit.jupiter.api.Test
import java.math.BigDecimal
import java.util.UUID

class MockPaymentAdapterTest {

    private val adapter = MockPaymentAdapter()

    @Test
    fun `createPaymentIntent returns PaymentIntent with non-blank id and clientSecret`() {
        runBlocking {
            val intent = adapter.createPaymentIntent(BigDecimal("150.00"), UUID.randomUUID())

            intent.id.isNotBlank() shouldBe true
            intent.clientSecret.isNotBlank() shouldBe true
        }
    }

    @Test
    fun `createPaymentIntent id starts with pi_stub_`() {
        runBlocking {
            val intent = adapter.createPaymentIntent(BigDecimal("75.50"), UUID.randomUUID())

            intent.id shouldStartWith "pi_stub_"
        }
    }

    @Test
    fun `getPaymentStatus returns SUCCEEDED for a just-created intent`() {
        runBlocking {
            val intent = adapter.createPaymentIntent(BigDecimal("200.00"), UUID.randomUUID())

            val status = adapter.getPaymentStatus(intent.id)

            status shouldBe PaymentStatus.SUCCEEDED
        }
    }

    @Test
    fun `getPaymentStatus returns FAILED for an unknown payment intent id`() {
        runBlocking {
            val status = adapter.getPaymentStatus("pi_unknown_does_not_exist")

            status shouldBe PaymentStatus.FAILED
        }
    }

    @Test
    fun `two calls to createPaymentIntent return different ids`() {
        runBlocking {
            val intent1 = adapter.createPaymentIntent(BigDecimal("100.00"), UUID.randomUUID())
            val intent2 = adapter.createPaymentIntent(BigDecimal("100.00"), UUID.randomUUID())

            intent1.id shouldNotBe intent2.id
        }
    }

    @Test
    fun `refund echoes the requested amount and returns a stub refund id`() {
        runBlocking {
            val intent = adapter.createPaymentIntent(BigDecimal("486.00"), UUID.randomUUID())

            val result = adapter.refund(intent.id, BigDecimal("486.00"))

            result.refundId shouldStartWith "re_stub_"
            result.amountEur.compareTo(BigDecimal("486.00")) shouldBe 0
        }
    }

    @Test
    fun `refund of zero amount is allowed and echoes zero`() {
        runBlocking {
            val result = adapter.refund("pi_stub_whatever", BigDecimal.ZERO)

            result.amountEur.compareTo(BigDecimal.ZERO) shouldBe 0
        }
    }
}
