package com.stayhub.application.booking

import java.time.LocalDate
import java.util.UUID

/**
 * Input for [CreateBookingUseCase].  Lives in application layer to keep
 * controllers (presentation) and use case decoupled from request DTOs.
 */
data class CreateBookingCommand(
    val propertyId: UUID,
    val guestId: UUID,
    val checkIn: LocalDate,
    val checkOut: LocalDate,
    val guestCount: Int,
)
