package com.stayhub.domain.booking

import java.math.BigDecimal
import java.time.LocalDate
import java.util.UUID

data class BookingConfirmation(
    val bookingId: UUID,
    val referenceNumber: String,
    val guestEmail: String,
    val guestFirstName: String,
    val propertyTitle: String,
    val checkIn: LocalDate,
    val checkOut: LocalDate,
    val nights: Int,
    val totalEur: BigDecimal,
)
