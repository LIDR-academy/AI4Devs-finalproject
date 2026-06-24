package com.stayhub.application.booking

import com.stayhub.domain.booking.BookingStatus
import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

/** One row in the "My Trips" list (domain-typed; mapped to DTO in the controller). */
data class TripSummary(
    val id: UUID,
    val referenceNumber: String,
    val propertyTitle: String,
    val propertyPhotoUrl: String,
    val city: String,
    val checkIn: LocalDate,
    val checkOut: LocalDate,
    val status: BookingStatus,
    val totalEur: BigDecimal,
)

data class MyTripsResult(
    val bookings: List<TripSummary>,
    val page: Int,
    val size: Int,
    val totalResults: Long,
    val totalPages: Int,
)
