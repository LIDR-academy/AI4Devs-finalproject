package com.stayhub.presentation.dto.booking

/**
 * Response body for POST /api/v1/bookings — matches CreateBookingResponse
 * schema in contracts/booking-api.yml.
 */
data class CreateBookingResponse(
    val booking_id: String,
    val reference_number: String,
    val price_breakdown: PriceBreakdownDto,
    val stripe_client_secret: String,
    val hold_expires_at: String,
) {
    data class PriceBreakdownDto(
        val nights: Int,
        val nightly_rate_eur: Double,
        val subtotal_eur: Double,
        val cleaning_fee_eur: Double,
        val service_fee_eur: Double,
        val tax_eur: Double,
        val total_eur: Double,
    )
}
