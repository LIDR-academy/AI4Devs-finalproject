package com.stayhub.presentation.dto.booking

/**
 * Response body for POST /api/v1/bookings/{id}/cancel. Matches
 * CancellationResponse in contracts/booking-api.yml.
 * `status` is always "cancelled"; `refund_status` is "full_refund" | "no_refund".
 */
data class CancellationResponse(
    val booking_id: String,
    val status: String,
    val refund_amount_eur: Double,
    val refund_status: String,
)
