package com.stayhub.presentation.dto.booking

/**
 * Response body for POST /api/v1/bookings/{id}/confirm and (later) GET
 * /api/v1/bookings/{id}.  Matches BookingDetailResponse schema in
 * contracts/booking-api.yml.
 *
 * The `property` block holds an optional summary that's enriched by US4
 * (GetBookingDetailsUseCase). For Slice A confirm-flow it can be omitted —
 * the contract still requires it, so the controller fills in id/title/etc.
 * from the property the booking points at.
 */
data class BookingDetailResponse(
    val id: String,
    val reference_number: String,
    val property: PropertyDto?,
    val check_in: String,
    val check_out: String,
    val guest_count: Int,
    val status: String,
    val price_breakdown: PriceBreakdownDto,
    val cancellation_policy: String? = null,
    val can_cancel: Boolean? = null,
    val refund_amount_eur: Double? = null,
    val created_at: String,
) {
    data class PropertyDto(
        val id: String,
        val title: String,
        val photo_url: String,
        val city: String,
        val country: String,
        val address: String? = null,
        val host_name: String? = null,
    )

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
