package com.stayhub.presentation.dto.booking

/**
 * Response body for GET /api/v1/bookings/my-trips. Matches MyTripsResponse +
 * BookingSummary in contracts/booking-api.yml (snake_case JSON).
 */
data class MyTripsResponse(
    val bookings: List<BookingSummaryDto>,
    val pagination: PaginationDto,
) {
    data class BookingSummaryDto(
        val id: String,
        val reference_number: String,
        val property_title: String,
        val property_photo_url: String,
        val city: String,
        val check_in: String,
        val check_out: String,
        val status: String,
        val total_eur: Double,
    )

    data class PaginationDto(
        val page: Int,
        val size: Int,
        val total_results: Long,
        val total_pages: Int,
    )
}
