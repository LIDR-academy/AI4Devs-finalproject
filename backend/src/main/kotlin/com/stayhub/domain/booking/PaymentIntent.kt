package com.stayhub.domain.booking

data class PaymentIntent(
    val id: String,           // e.g. "pi_stub_abc123" or real Stripe ID
    val clientSecret: String, // passed to frontend to complete payment
)

enum class PaymentStatus {
    PENDING,
    SUCCEEDED,
    FAILED,
    CANCELLED,
}
